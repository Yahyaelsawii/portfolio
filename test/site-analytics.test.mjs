import assert from "node:assert/strict";
import test from "node:test";
import { onRequestOptions, onRequestPost } from "../functions/api/analytics/visit.js";

const GITHUB_PAGES_ORIGIN = "https://yahyaelsawii.github.io";

class Statement {
  constructor(sql) {
    this.sql = sql;
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }
}

class Database {
  constructor() {
    this.batches = [];
  }

  prepare(sql) {
    return new Statement(sql);
  }

  async batch(statements) {
    this.batches.push(statements);
    return statements.map(() => ({ success: true, meta: { changes: 1 } }));
  }
}

function visitRequest(overrides = {}) {
  const request = new Request("https://portfolio.test/api/analytics/visit", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://portfolio.test",
      "cf-connecting-ip": "203.0.113.42",
      "user-agent": "Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"
    },
    body: JSON.stringify({ page: "/work/gift-it", referrer: "https://www.google.com/search?q=portfolio", sessionId: "anonymous-session", ...overrides })
  });
  Object.defineProperty(request, "cf", { value: { country: "AE", region: "Dubai", city: "Dubai" } });
  return request;
}

test("stores a minimized anonymous website visit", async () => {
  const database = new Database();
  const response = await onRequestPost({
    request: visitRequest(),
    env: { DB: database, LOG_HASH_SECRET: "a".repeat(32) }
  });
  const body = await response.json();
  assert.equal(response.status, 202);
  assert.equal(body.accepted, true);
  const insert = database.batches.at(-1)[0];
  assert.match(insert.sql, /INSERT OR IGNORE INTO site_events/);
  assert.equal(insert.args[6], "/work/gift-it");
  assert.equal(insert.args[7], "www.google.com");
  assert.equal(insert.args[8], "Mobile");
  assert.equal(insert.args[9], "Safari");
  assert.equal(insert.args.some(value => String(value).includes("203.0.113.42")), false);
  assert.equal(insert.args.some(value => String(value).includes("Mozilla")), false);
});

test("rejects unapproved page paths", async () => {
  const response = await onRequestPost({
    request: visitRequest({ page: "/admin" }),
    env: { DB: new Database(), LOG_HASH_SECRET: "a".repeat(32) }
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "INVALID_EVENT");
});

test("accepts the GitHub Pages analytics preflight", async () => {
  const request = new Request("https://portfolio.test/api/analytics/visit", {
    method: "OPTIONS",
    headers: { origin: GITHUB_PAGES_ORIGIN, "access-control-request-method": "POST" }
  });
  const response = await onRequestOptions({ request });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), GITHUB_PAGES_ORIGIN);
});
