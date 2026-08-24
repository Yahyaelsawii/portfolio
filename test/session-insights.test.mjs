import assert from "node:assert/strict";
import test from "node:test";
import { buildSessionInsight, groupSessionInsights } from "../functions/_shared/session-insights.js";

test("scores sustained hiring conversations as strong and explains the score", () => {
  const insight = buildSessionInsight([
    { created_at: "2026-08-24T10:00:00Z", question: "Is Yahya available for a product role?", answer: "Yes.", flag: "none", country: "AE" },
    { created_at: "2026-08-24T10:01:00Z", question: "Tell me more about his Gift It project.", answer: "Gift It focused on checkout UX.", flag: "none", country: "AE" },
    { created_at: "2026-08-24T10:02:00Z", question: "How can I contact him?", answer: "Use the Contact page.", flag: "none", country: "AE" }
  ]);
  assert.equal(insight.score, 10);
  assert.equal(insight.band, "strong");
  assert.match(insight.summary, /Hiring and role fit/);
  assert.match(insight.reason, /Strong role intent/);
});

test("marks short exploratory sessions as light or developing", () => {
  const insight = buildSessionInsight([
    { created_at: "2026-08-24T10:00:00Z", question: "Hello", answer: "Hi.", flag: "none" }
  ]);
  assert.equal(insight.score, 4);
  assert.equal(insight.band, "developing");
  assert.equal(insight.summary, "General portfolio questions");
});

test("penalizes safety-boundary requests and never exposes full session hashes", () => {
  const hash = "b".repeat(64);
  const sessions = groupSessionInsights([
    { session_hash: hash, created_at: "2026-08-24T10:00:00Z", question: "[blocked safety-boundary request]", answer: "I cannot help with that.", flag: "privacy" }
  ]);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].id, "b".repeat(16));
  assert.equal(sessions[0].score, 2);
  assert.equal(sessions[0].band, "light");
  assert.equal("session_hash" in sessions[0], false);
});
