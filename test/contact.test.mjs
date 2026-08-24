import assert from "node:assert/strict";
import test from "node:test";
import { onRequestOptions, onRequestPost } from "../functions/api/contact.js";

const GITHUB_PAGES_ORIGIN = "https://yahyaelsawii.github.io";

class FakeStatement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }

  async first() {
    if (!this.sql.includes("INSERT INTO contact_rate_limits")) return null;
    if (this.database.requests >= Number(this.args[1])) return null;
    this.database.requests += 1;
    return { request_count:this.database.requests };
  }
}

class FakeDatabase {
  constructor() { this.requests = 0; }
  prepare(sql) { return new FakeStatement(this, sql); }
  async batch(statements) { return statements.map(() => ({ success:true })); }
}

function contactRequest(overrides = {}, requestOptions = {}) {
  return new Request("https://portfolio.test/api/contact", {
    method:"POST",
    headers:{
      "content-type":requestOptions.contentType || "application/json",
      origin:requestOptions.origin || "https://portfolio.test",
      "cf-connecting-ip":"203.0.113.8"
    },
    body:JSON.stringify({
      name:"Test Person",
      email:"person@example.com",
      subject:"Project Inquiry",
      message:"This is a valid test message.",
      company:"",
      ...overrides
    })
  });
}

function environment(database = new FakeDatabase()) {
  return {
    DB:database,
    LOG_HASH_SECRET:"a".repeat(32),
    RESEND_API_KEY:"test-key",
    CONTACT_FROM_EMAIL:"Portfolio <portfolio@example.com>",
    ADMIN_EMAIL:"owner@example.com"
  };
}

test("delivers a valid contact submission through the configured email service", async () => {
  const originalFetch = globalThis.fetch;
  let delivery;
  globalThis.fetch = async (url, options) => {
    delivery = { url, options, body:JSON.parse(options.body) };
    return new Response(JSON.stringify({ id:"email-id" }), { status:200 });
  };
  try {
    const response = await onRequestPost({ request:contactRequest(), env:environment() });
    assert.equal(response.status, 200);
    assert.equal(delivery.url, "https://api.resend.com/emails");
    assert.equal(delivery.body.reply_to, "person@example.com");
    assert.equal(delivery.body.to[0], "owner@example.com");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("uses the approved V1 server-side form handler when Resend is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  let delivery;
  globalThis.fetch = async (url, options) => {
    delivery = { url, options, body:JSON.parse(options.body) };
    return new Response(JSON.stringify({ success:"true" }), { status:200 });
  };
  const env = environment();
  delete env.RESEND_API_KEY;
  delete env.CONTACT_FROM_EMAIL;
  env.CONTACT_FORM_ENDPOINT = "https://formsubmit.co/ajax/75adad6ce5e399fb72fe44ae27bd0d55";
  try {
    const response = await onRequestPost({ request:contactRequest(), env });
    assert.equal(response.status, 200);
    assert.equal(delivery.url, env.CONTACT_FORM_ENDPOINT);
    assert.equal(delivery.options.headers.origin, "https://yahyaelsawi.website");
    assert.equal(delivery.options.headers.referer, "https://yahyaelsawi.website/contact");
    assert.equal(delivery.body.email, "person@example.com");
    assert.equal(delivery.body.message, "This is a valid test message.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("reports when the V1 form handler still needs owner activation", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    success:"false",
    message:"This form needs Activation. Activate Form to continue."
  }), { status:200 });
  const env = environment();
  delete env.RESEND_API_KEY;
  delete env.CONTACT_FROM_EMAIL;
  env.CONTACT_FORM_ENDPOINT = "https://formsubmit.co/ajax/75adad6ce5e399fb72fe44ae27bd0d55";
  try {
    const response = await onRequestPost({ request:contactRequest(), env });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, "CONTACT_ACTIVATION_REQUIRED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects cross-origin submissions", async () => {
  const response = await onRequestPost({ request:contactRequest({}, { origin:"https://attacker.test" }), env:environment() });
  assert.equal(response.status, 403);
});

test("accepts submissions from the GitHub Pages frontend origin", async () => {
  const response = await onRequestPost({
    request:contactRequest({ company:"bot-field" }, { origin:GITHUB_PAGES_ORIGIN }),
    env:environment()
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), GITHUB_PAGES_ORIGIN);
});

test("answers approved GitHub Pages contact preflight requests", async () => {
  const request = new Request("https://portfolio.test/api/contact", {
    method:"OPTIONS",
    headers:{ origin:GITHUB_PAGES_ORIGIN, "access-control-request-method":"POST" }
  });
  const response = onRequestOptions({ request });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), GITHUB_PAGES_ORIGIN);
});

test("rejects invalid form fields", async () => {
  const response = await onRequestPost({ request:contactRequest({ email:"not-an-email" }), env:environment() });
  assert.equal(response.status, 400);
});

test("accepts a populated honeypot without sending email", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Delivery must not run"); };
  try {
    const response = await onRequestPost({ request:contactRequest({ company:"https://spam.test" }), env:environment() });
    assert.equal(response.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rate limits the fifth message in a minute", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("{}", { status:200 });
  const database = new FakeDatabase();
  try {
    for (let index = 0; index < 4; index += 1) {
      const response = await onRequestPost({ request:contactRequest(), env:environment(database) });
      assert.equal(response.status, 200);
    }
    const response = await onRequestPost({ request:contactRequest(), env:environment(database) });
    assert.equal(response.status, 429);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fails closed when delivery configuration is absent", async () => {
  const env = environment();
  delete env.RESEND_API_KEY;
  delete env.CONTACT_FROM_EMAIL;
  delete env.CONTACT_FORM_ENDPOINT;
  const response = await onRequestPost({ request:contactRequest(), env });
  assert.equal(response.status, 503);
});
