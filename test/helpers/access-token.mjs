import { webcrypto } from "node:crypto";

const cryptoApi = globalThis.crypto || webcrypto;

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export const accessEnvironment = Object.freeze({
  ACCESS_TEAM_DOMAIN: "https://portfolio-test.cloudflareaccess.com",
  ACCESS_AUD: "portfolio-audience",
  ADMIN_EMAIL: "owner@example.com"
});

export async function createAccessFixture(claimOverrides = {}) {
  const keys = await cryptoApi.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );
  const kid = "test-key";
  const headerPart = encode({ alg: "RS256", kid, typ: "JWT" });
  const payloadPart = encode({
    iss: accessEnvironment.ACCESS_TEAM_DOMAIN,
    aud: accessEnvironment.ACCESS_AUD,
    email: accessEnvironment.ADMIN_EMAIL,
    exp: Math.floor(Date.now() / 1000) + 300,
    ...claimOverrides
  });
  const signed = new TextEncoder().encode(`${headerPart}.${payloadPart}`);
  const signature = await cryptoApi.subtle.sign("RSASSA-PKCS1-v1_5", keys.privateKey, signed);
  const token = `${headerPart}.${payloadPart}.${Buffer.from(signature).toString("base64url")}`;
  const publicJwk = await cryptoApi.subtle.exportKey("jwk", keys.publicKey);

  return {
    token,
    certs: { keys: [{ ...publicJwk, alg: "RS256", kid, use: "sig" }] }
  };
}

export function accessRequest(token) {
  return new Request("https://portfolio.test/api/admin/analytics", {
    headers: token ? { "cf-access-jwt-assertion": token } : {}
  });
}
