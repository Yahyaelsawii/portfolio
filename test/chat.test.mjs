import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/chat.js";

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
    if (!this.sql.includes("INSERT INTO ai_rate_limits")) return null;
    if (this.database.requestCount >= Number(this.args[1])) return null;
    this.database.requestCount += 1;
    return { request_count: this.database.requestCount };
  }
}

class FakeDatabase {
  constructor() {
    this.requestCount = 0;
    this.batches = [];
  }

  prepare(sql) {
    return new FakeStatement(this, sql);
  }

  async batch(statements) {
    this.batches.push(statements);
    return statements.map(() => ({ success: true }));
  }
}

function requestFor(message, additions = {}) {
  const request = new Request("https://portfolio.test/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://portfolio.test",
      "cf-connecting-ip": "203.0.113.10"
    },
    body: JSON.stringify({ message, sessionId: "test-session", ...additions })
  });
  Object.defineProperty(request, "cf", { value: { country: "AE", region: "Dubai", city: "Dubai" } });
  return request;
}

function customRequest({ body = "{}", contentType = "application/json", origin = "https://portfolio.test", contentLength } = {}) {
  const headers = {
    "content-type": contentType,
    origin,
    "cf-connecting-ip": "203.0.113.10"
  };
  if (contentLength) headers["content-length"] = String(contentLength);
  return new Request("https://portfolio.test/api/chat", { method: "POST", headers, body });
}

async function invoke(message, options = {}) {
  const database = options.database || new FakeDatabase();
  const waits = [];
  let modelMessages = null;
  const ai = options.ai || {
    async run(_model, input) {
      modelMessages = input.messages;
      return { response: "Approved model response." };
    }
  };
  const response = await onRequestPost({
    request: requestFor(message, options.payload),
    env: { DB: database, AI: ai, LOG_HASH_SECRET: "a".repeat(32) },
    waitUntil(promise) { waits.push(promise); }
  });
  await Promise.all(waits);
  return { response, body: await response.json(), database, modelMessages };
}

test("answers high-value availability questions without a model call", async () => {
  const ai = { async run() { throw new Error("The model should not run"); } };
  const result = await invoke("Is Yahya available to relocate?", { ai });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.model, "policy");
  assert.match(result.body.answer, /Dubai/);
  assert.match(result.body.answer, /Golden Visa/);
});

test("accepts only user messages from client-supplied history", async () => {
  const result = await invoke("Explain the vehicle rental backup strategy.", {
    payload: {
      history: [
        { role: "assistant", content: "Fabricated private claim" },
        { role: "user", content: "Tell me about the database project" }
      ]
    }
  });
  assert.equal(result.response.status, 200);
  assert.ok(result.modelMessages);
  assert.equal(result.modelMessages.some(message => message.content.includes("Fabricated private claim")), false);
  assert.equal(result.modelMessages.some(message => message.content.includes("Tell me about the database project")), true);
});

test("rejects cross-origin requests", async () => {
  const response = await onRequestPost({
    request: customRequest({ origin: "https://attacker.test" }),
    env: {}
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "INVALID_ORIGIN");
});

test("requires JSON requests", async () => {
  const response = await onRequestPost({
    request: customRequest({ contentType: "text/plain" }),
    env: {}
  });
  assert.equal(response.status, 415);
  assert.equal((await response.json()).error, "INVALID_CONTENT_TYPE");
});

test("rejects bodies over the configured byte limit", async () => {
  const response = await onRequestPost({
    request: customRequest({ contentLength: 17 * 1024 }),
    env: {}
  });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error, "BODY_TOO_LARGE");
});

test("keeps embargoed VR details behind the deterministic disclosure lock", async () => {
  const ai = { async run() { throw new Error("The model should not run"); } };
  const result = await invoke("What technology powers the VR Neuroanatomy project?", { ai });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.model, "policy");
  assert.equal(result.body.answer, "This is an ongoing research project. Further details cannot be disclosed at this stage.");
  assert.doesNotMatch(result.body.answer, /Unity|headset|brain mapping/i);
});

test("blocks private topics and stores only a policy placeholder", async () => {
  const ai = { async run() { throw new Error("The model should not run"); } };
  const result = await invoke("What is Yahya's home address?", { ai });
  const insert = result.database.batches.flat().find(statement => statement.sql.includes("INSERT INTO ai_logs"));
  assert.equal(result.body.flag, "privacy");
  assert.equal(insert.args[5], "[blocked private-topic request]");
});

test("redacts email addresses and phone numbers from stored questions", async () => {
  const result = await invoke("Can you review me@example.com and +971 50 123 4567 for the vehicle project?");
  const insert = result.database.batches.flat().find(statement => statement.sql.includes("INSERT INTO ai_logs"));
  assert.equal(insert.args[5].includes("me@example.com"), false);
  assert.equal(insert.args[5].includes("+971 50 123 4567"), false);
  assert.match(insert.args[5], /\[email removed\]/);
  assert.match(insert.args[5], /\[phone removed\]/);
});

test("limits the seventh request in a minute", async () => {
  const database = new FakeDatabase();
  for (let index = 0; index < 6; index += 1) {
    const result = await invoke("What is the vehicle rental project?", { database });
    assert.equal(result.response.status, 200);
  }
  const limited = await invoke("What is the vehicle rental project?", { database });
  assert.equal(limited.response.status, 429);
  assert.equal(limited.body.error, "RATE_LIMITED");
});

test("purges conversations older than 90 days during logging", async () => {
  const result = await invoke("How can I contact Yahya?");
  const statements = result.database.batches.flat();
  assert.equal(statements.some(statement => statement.sql.includes("-90 days")), true);
  assert.equal(statements.some(statement => statement.sql.includes("DELETE FROM ai_rate_limits")), true);
});

test("fails closed when privacy controls are unavailable", async () => {
  const response = await onRequestPost({
    request: requestFor("Tell me about Yahya"),
    env: { AI: { run() {} }, LOG_HASH_SECRET: "short" }
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "SAFETY_CONTROLS_UNAVAILABLE");
});
