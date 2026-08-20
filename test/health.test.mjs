import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/health.js";

test("reports privacy, rate limiting, and retention readiness", async () => {
  const response = onRequestGet({
    env: { AI: {}, DB: {}, LOG_HASH_SECRET: "a".repeat(32) }
  });
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.ready, true);
  assert.equal(body.ai, true);
  assert.equal(body.logging, true);
  assert.equal(body.privacyHashing, true);
  assert.equal(body.atomicRateLimiting, true);
  assert.equal(body.conversationRetentionDays, 90);
  assert.equal(body.scheduledRetention, true);
});

test("reports safety controls unavailable for a weak secret", async () => {
  const response = onRequestGet({
    env: { AI: {}, DB: {}, LOG_HASH_SECRET: "short" }
  });
  const body = await response.json();
  assert.equal(body.ready, false);
  assert.equal(body.privacyHashing, false);
  assert.equal(body.atomicRateLimiting, false);
});
