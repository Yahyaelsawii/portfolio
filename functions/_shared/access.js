const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJsonPart(value) {
  return JSON.parse(decoder.decode(decodeBase64Url(value)));
}

function cleanTeamDomain(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().replace(/\/$/, "");
  try {
    const url = new URL(normalized);
    return url.protocol === "https:" && url.hostname.endsWith(".cloudflareaccess.com") ? url.origin : "";
  } catch {
    return "";
  }
}

function audienceMatches(claim, expected) {
  return Array.isArray(claim) ? claim.includes(expected) : claim === expected;
}

export async function verifyAdminAccess(request, env) {
  const issuer = cleanTeamDomain(env.ACCESS_TEAM_DOMAIN);
  const audience = typeof env.ACCESS_AUD === "string" ? env.ACCESS_AUD.trim() : "";
  const approvedEmail = typeof env.ADMIN_EMAIL === "string" ? env.ADMIN_EMAIL.trim().toLowerCase() : "";
  if (!issuer || !audience || !approvedEmail) {
    return { ok: false, status: 503, code: "ADMIN_AUTH_NOT_CONFIGURED" };
  }

  const token = request.headers.get("cf-access-jwt-assertion") || "";
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, status: 401, code: "ACCESS_LOGIN_REQUIRED" };

  try {
    const [headerPart, payloadPart, signaturePart] = parts;
    const header = decodeJsonPart(headerPart);
    const payload = decodeJsonPart(payloadPart);
    const now = Math.floor(Date.now() / 1000);
    if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unsupported token header");
    if (payload.iss !== issuer || !audienceMatches(payload.aud, audience)) throw new Error("Token claims do not match");
    if (typeof payload.exp !== "number" || payload.exp <= now) throw new Error("Token expired");
    if (typeof payload.nbf === "number" && payload.nbf > now) throw new Error("Token is not active");

    const certResponse = await fetch(`${issuer}/cdn-cgi/access/certs`, {
      headers: { accept: "application/json" }
    });
    if (!certResponse.ok) throw new Error("Unable to retrieve Access signing keys");
    const certs = await certResponse.json();
    const jwk = Array.isArray(certs?.keys) ? certs.keys.find(key => key.kid === header.kid) : null;
    if (!jwk) throw new Error("Signing key was not found");

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64Url(signaturePart),
      encoder.encode(`${headerPart}.${payloadPart}`)
    );
    if (!valid) throw new Error("Token signature is invalid");

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (email !== approvedEmail) return { ok: false, status: 403, code: "ADMIN_EMAIL_NOT_APPROVED" };
    return { ok: true, email };
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_access_denied", error: error?.message || "Unknown error" }));
    return { ok: false, status: 401, code: "INVALID_ACCESS_TOKEN" };
  }
}
