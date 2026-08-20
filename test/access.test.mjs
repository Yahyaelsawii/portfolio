import assert from "node:assert/strict";
import test from "node:test";
import { verifyAdminAccess } from "../functions/_shared/access.js";
import { accessEnvironment, accessRequest, createAccessFixture } from "./helpers/access-token.mjs";

async function withSigningKeys(certs, callback) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(certs);
  try {
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("fails closed when Cloudflare Access is not configured", async () => {
  const result = await verifyAdminAccess(accessRequest(), {});
  assert.deepEqual(result, { ok: false, status: 503, code: "ADMIN_AUTH_NOT_CONFIGURED" });
});

test("requires a Cloudflare Access assertion", async () => {
  const result = await verifyAdminAccess(accessRequest(), accessEnvironment);
  assert.deepEqual(result, { ok: false, status: 401, code: "ACCESS_LOGIN_REQUIRED" });
});

test("accepts a valid signed assertion for the approved email", async () => {
  const fixture = await createAccessFixture();
  const result = await withSigningKeys(fixture.certs, () =>
    verifyAdminAccess(accessRequest(fixture.token), accessEnvironment)
  );
  assert.deepEqual(result, { ok: true, email: accessEnvironment.ADMIN_EMAIL });
});

test("rejects a valid assertion for an unapproved email", async () => {
  const fixture = await createAccessFixture({ email: "someone-else@example.com" });
  const result = await withSigningKeys(fixture.certs, () =>
    verifyAdminAccess(accessRequest(fixture.token), accessEnvironment)
  );
  assert.deepEqual(result, { ok: false, status: 403, code: "ADMIN_EMAIL_NOT_APPROVED" });
});

test("rejects expired assertions", async () => {
  const fixture = await createAccessFixture({ exp: Math.floor(Date.now() / 1000) - 1 });
  const result = await withSigningKeys(fixture.certs, () =>
    verifyAdminAccess(accessRequest(fixture.token), accessEnvironment)
  );
  assert.deepEqual(result, { ok: false, status: 401, code: "INVALID_ACCESS_TOKEN" });
});
