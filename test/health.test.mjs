import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/health.js";

test("reports privacy, rate limiting, and retention readiness", async () => {
  const response = onRequestGet({
    env: { AI: {}, DB: {}, LOG_HASH_SECRET: "a".repeat(32), RESEND_API_KEY: "key", CONTACT_FROM_EMAIL: "portfolio@example.com", ADMIN_EMAIL: "owner@example.com" }
  });
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.ready, true);
  assert.equal(body.ai, true);
  assert.equal(body.contactDelivery, true);
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

test("reports contact delivery ready with the approved V1 fallback", async () => {
  const response = onRequestGet({
    env: {
      AI:{},
      DB:{},
      LOG_HASH_SECRET:"a".repeat(32),
      CONTACT_FORM_ENDPOINT:"https://formsubmit.co/ajax/75adad6ce5e399fb72fe44ae27bd0d55"
    }
  });
  const body = await response.json();
  assert.equal(body.ready, true);
  assert.equal(body.contactDelivery, true);
});
