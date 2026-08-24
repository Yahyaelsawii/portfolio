import { isApprovedPublicOrigin, publicCorsHeaders, publicPreflightResponse } from "../../_shared/cors.js";
import { SITE_EVENT_PURGE_SQL } from "../../_shared/retention.js";

const MAX_BODY_BYTES = 4 * 1024;
const ALLOWED_PAGE = /^\/(?:|about|contact|privacy|recruiter|resume|terminal|work(?:\/[a-z0-9-]+)?)\/?$/;
const headers = publicCorsHeaders({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff"
});
let schemaPromise;

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

function normalizeText(value, limit) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, limit)
    : "";
}

async function readJsonBody(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  if (!request.body) throw new Error("INVALID_JSON");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

async function hmac(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function normalizePagePath(value) {
  const supplied = normalizeText(value, 160);
  if (!ALLOWED_PAGE.test(supplied)) return "";
  return supplied.length > 1 ? supplied.replace(/\/$/, "") : supplied;
}

function normalizeReferrer(value, requestUrl) {
  const supplied = normalizeText(value, 500);
  if (!supplied) return "Direct";
  try {
    const referrer = new URL(supplied);
    const destination = new URL(requestUrl);
    const internalHosts = new Set([
      destination.hostname,
      "yahyaelsawi.website",
      "www.yahyaelsawi.website",
      "yahya-elsawi-portfolio-bnj.pages.dev",
      "yahyaelsawii.github.io"
    ]);
    return internalHosts.has(referrer.hostname) ? "Internal" : referrer.hostname.slice(0, 100);
  } catch {
    return "Direct";
  }
}

function deviceType(userAgent) {
  if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent)) return "Tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function browserFamily(userAgent) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/samsungbrowser/i.test(userAgent)) return "Samsung Internet";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/chrome|crios/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  return "Other";
}

async function ensureSchema(db) {
  if (!schemaPromise) {
    schemaPromise = db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS site_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          event_key TEXT NOT NULL UNIQUE,
          session_hash TEXT NOT NULL,
          visitor_hash TEXT NOT NULL,
          country TEXT,
          region TEXT,
          city TEXT,
          page_path TEXT NOT NULL,
          referrer_host TEXT NOT NULL DEFAULT 'Direct',
          device_type TEXT NOT NULL,
          browser_family TEXT NOT NULL
        )
      `),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_site_events_created_at ON site_events(created_at DESC)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_site_events_session_recent ON site_events(session_hash, created_at DESC)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_site_events_page_recent ON site_events(page_path, created_at DESC)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_site_events_country_recent ON site_events(country, created_at DESC)")
    ]).catch(error => {
      schemaPromise = undefined;
      throw error;
    });
  }
  await schemaPromise;
}

export async function onRequestOptions({ request }) {
  return publicPreflightResponse(request, "POST, OPTIONS");
}

export async function onRequestPost({ request, env }) {
  if (!isApprovedPublicOrigin(request)) return respond({ error: "INVALID_ORIGIN" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return respond({ error: "INVALID_CONTENT_TYPE" }, 415);
  }
  if (!env.DB || !env.LOG_HASH_SECRET || env.LOG_HASH_SECRET.length < 32) {
    return respond({ error: "ANALYTICS_UNAVAILABLE" }, 503);
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return respond({ error: error?.message === "BODY_TOO_LARGE" ? "BODY_TOO_LARGE" : "INVALID_JSON" }, error?.message === "BODY_TOO_LARGE" ? 413 : 400);
  }

  const pagePath = normalizePagePath(payload?.page);
  const sessionId = normalizeText(payload?.sessionId, 120);
  if (!pagePath || !sessionId) return respond({ error: "INVALID_EVENT" }, 400);

  const userAgent = request.headers.get("user-agent") || "";
  if (/bot|crawler|spider|preview|headless/i.test(userAgent)) return respond({ accepted: false }, 202);

  try {
    await ensureSchema(env.DB);
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const minute = now.toISOString().slice(0, 16);
    const rawIp = request.headers.get("cf-connecting-ip") || "unavailable";
    const [eventKey, sessionHash, visitorHash] = await Promise.all([
      hmac(`view:${rawIp}:${pagePath}:${minute}`, env.LOG_HASH_SECRET),
      hmac(`session:${sessionId}`, env.LOG_HASH_SECRET),
      hmac(`visitor:${rawIp}:${day}`, env.LOG_HASH_SECRET)
    ]);
    const insert = env.DB.prepare(`
      INSERT OR IGNORE INTO site_events (
        event_key, session_hash, visitor_hash, country, region, city,
        page_path, referrer_host, device_type, browser_family
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventKey,
      sessionHash,
      visitorHash,
      normalizeText(request.cf?.country, 8) || null,
      normalizeText(request.cf?.region, 80) || null,
      normalizeText(request.cf?.city, 80) || null,
      pagePath,
      normalizeReferrer(payload?.referrer, request.url),
      deviceType(userAgent),
      browserFamily(userAgent)
    );
    await env.DB.batch([insert, env.DB.prepare(SITE_EVENT_PURGE_SQL)]);
    return respond({ accepted: true }, 202);
  } catch (error) {
    console.error(JSON.stringify({ event: "site_analytics_failed", error: error?.message || "Unknown error" }));
    return respond({ error: "ANALYTICS_UNAVAILABLE" }, 503);
  }
}
