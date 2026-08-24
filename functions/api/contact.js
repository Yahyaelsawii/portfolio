import { isApprovedPublicOrigin, publicCorsHeaders, publicPreflightResponse } from "../_shared/cors.js";

const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_PER_WINDOW = 4;
const ALLOWED_SUBJECTS = new Set([
  "Project Inquiry",
  "Hiring / Full-time",
  "Collaboration",
  "Just saying hi"
]);

const jsonHeaders = publicCorsHeaders({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff"
});
const PUBLIC_CONTACT_URL = "https://yahyaelsawi.website/contact";

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
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
      text += decoder.decode(value, { stream:true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

function cleanText(value, limit) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, limit)
    : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

async function hmac(value, secret) {
  if (!value || !secret || secret.length < 32) throw new Error("RATE_LIMIT_NOT_CONFIGURED");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function reserveRateLimit(db, identityHash) {
  if (!db) throw new Error("RATE_LIMIT_NOT_CONFIGURED");
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS contact_rate_limits (
        identity_hash TEXT NOT NULL,
        window_start TEXT NOT NULL,
        request_count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (identity_hash, window_start)
      )
    `),
    db.prepare("DELETE FROM contact_rate_limits WHERE window_start < datetime('now', '-1 day')")
  ]);
  const reservation = await db.prepare(`
    INSERT INTO contact_rate_limits (identity_hash, window_start, request_count)
    VALUES (?, strftime('%Y-%m-%dT%H:%M:00Z', 'now'), 1)
    ON CONFLICT(identity_hash, window_start)
    DO UPDATE SET request_count = request_count + 1
    WHERE request_count < ?
    RETURNING request_count
  `).bind(identityHash, RATE_LIMIT_PER_WINDOW).first();
  return Boolean(reservation);
}

export async function onRequestPost({ request, env }) {
  if (!isApprovedPublicOrigin(request)) return respond({ error:"INVALID_ORIGIN", message:"This request is not allowed." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return respond({ error:"INVALID_CONTENT_TYPE", message:"Please submit the website contact form." }, 415);
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    const tooLarge = error.message === "BODY_TOO_LARGE";
    return respond({ error:tooLarge ? "BODY_TOO_LARGE" : "INVALID_JSON", message:"The form submission was invalid." }, tooLarge ? 413 : 400);
  }

  const name = cleanText(body?.name, 80);
  const email = cleanText(body?.email, 160);
  const subject = cleanText(body?.subject, 60);
  const message = cleanText(body?.message, 4000);
  const honeypot = cleanText(body?.company, 200);
  if (honeypot) return respond({ ok:true });
  if (name.length < 2 || !validEmail(email) || !ALLOWED_SUBJECTS.has(subject) || message.length < 10) {
    return respond({ error:"INVALID_FIELDS", message:"Please check your name, email, subject, and message." }, 400);
  }

  try {
    const rawIp = request.headers.get("cf-connecting-ip") || "unavailable";
    const identityHash = await hmac(`contact:${rawIp}`, env.LOG_HASH_SECRET);
    if (!await reserveRateLimit(env.DB, identityHash)) {
      return respond({ error:"RATE_LIMITED", message:"Too many messages were sent. Please wait a minute and try again." }, 429);
    }
  } catch {
    return respond({ error:"CONTACT_UNAVAILABLE", message:"Secure contact delivery is temporarily unavailable." }, 503);
  }

  const resendReady = Boolean(env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.ADMIN_EMAIL);
  const formSubmitReady = typeof env.CONTACT_FORM_ENDPOINT === "string"
    && /^https:\/\/formsubmit\.co\/ajax\/[a-z0-9]+$/i.test(env.CONTACT_FORM_ENDPOINT);
  if (!resendReady && !formSubmitReady) {
    return respond({ error:"CONTACT_UNAVAILABLE", message:"Secure contact delivery is temporarily unavailable." }, 503);
  }

  let delivery;
  try {
    delivery = resendReady
      ? await fetch("https://api.resend.com/emails", {
          method:"POST",
          headers:{
            authorization:`Bearer ${env.RESEND_API_KEY}`,
            "content-type":"application/json"
          },
          body:JSON.stringify({
            from:env.CONTACT_FROM_EMAIL,
            to:[env.ADMIN_EMAIL],
            reply_to:email,
            subject:`Portfolio: ${subject} — ${name}`,
            text:`Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
          })
        })
      : await fetch(env.CONTACT_FORM_ENDPOINT, {
          method:"POST",
          headers:{
            accept:"application/json",
            "content-type":"application/json",
            origin:new URL(PUBLIC_CONTACT_URL).origin,
            referer:PUBLIC_CONTACT_URL,
            "user-agent":"Yahya El-Sawi portfolio contact form"
          },
          body:JSON.stringify({
            name,
            email,
            subject,
            message,
            _subject:`Portfolio: ${subject} - ${name}`,
            _template:"table",
            _captcha:"false"
          })
        });
  } catch {
    return respond({ error:"DELIVERY_FAILED", message:"Your message could not be delivered. Please try again shortly." }, 502);
  }

  if (!delivery.ok) {
    return respond({ error:"DELIVERY_FAILED", message:"Your message could not be delivered. Please try again shortly." }, 502);
  }
  if (!resendReady) {
    const providerText = await delivery.text().catch(() => "");
    let providerResult = {};
    try {
      providerResult = JSON.parse(providerText);
    } catch {
      providerResult = {};
    }
    if (String(providerResult.success).toLowerCase() !== "true") {
      const activationPending = /activation|activate form/i.test(providerResult.message || "");
      return respond({
        error:activationPending ? "CONTACT_ACTIVATION_REQUIRED" : "DELIVERY_FAILED",
        message:activationPending
          ? "Contact delivery is awaiting owner activation. Please use the email link above for now."
          : "Your message could not be delivered. Please try again shortly."
      }, activationPending ? 503 : 502);
    }
  }
  return respond({ ok:true });
}

export function onRequestOptions({ request }) {
  return publicPreflightResponse(request, "POST, OPTIONS");
}
