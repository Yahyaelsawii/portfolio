import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/admin/session.js";
import { accessEnvironment, accessRequest, createAccessFixture } from "./helpers/access-token.mjs";

class SessionDatabase {
  constructor() {
    this.query = null;
    this.sessionId = null;
  }

  prepare(sql) {
    const database = this;
    return {
      sql,
      bind(value) {
        database.query = sql;
        database.sessionId = value;
        return this;
      },
      async all() {
        return { results: [{
          created_at: "2026-08-24T10:00:00Z",
          country: "AE",
          region: "Dubai",
          city: "Dubai",
          question: "Is Yahya available for a role?",
          answer: "Yes, he can start as soon as needed.",
          flag: "none",
          model: "policy",
          response_ms: 42
        }] };
      }
    };
  }

  async batch(statements) {
    return statements.map(() => ({ success: true, meta: { changes: 0 } }));
  }
}

function requestWithUrl(token, url) {
  const base = accessRequest(token);
  return new Request(url, { headers: base.headers });
}

test("requires owner authentication before returning a transcript", async () => {
  const response = await onRequestGet({
    request: new Request("https://portfolio.test/api/admin/session?session=" + "a".repeat(16)),
    env: { ...accessEnvironment, DB: new SessionDatabase() }
  });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, "ACCESS_LOGIN_REQUIRED");
});

test("rejects invalid session prefixes", async () => {
  const fixture = await createAccessFixture();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(fixture.certs);
  try {
    const response = await onRequestGet({
      request: requestWithUrl(fixture.token, "https://portfolio.test/api/admin/session?session=../../secret"),
      env: { ...accessEnvironment, DB: new SessionDatabase() }
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "INVALID_SESSION");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns a minimized owner-only transcript with a computed insight", async () => {
  const fixture = await createAccessFixture();
  const database = new SessionDatabase();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(fixture.certs);
  try {
    const id = "c".repeat(16);
    const response = await onRequestGet({
      request: requestWithUrl(fixture.token, `https://portfolio.test/api/admin/session?session=${id}`),
      env: { ...accessEnvironment, DB: database }
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.id, id);
    assert.equal(body.viewer, accessEnvironment.ADMIN_EMAIL);
    assert.equal(body.messages.length, 1);
    assert.equal(body.insight.score, 7);
    assert.equal(database.sessionId, id);
    assert.match(database.query, /substr\(session_hash, 1, 16\)/);
    assert.equal("country" in body.messages[0], false);
    assert.equal("session_hash" in body.messages[0], false);
    assert.equal("visitor_hash" in body.messages[0], false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
