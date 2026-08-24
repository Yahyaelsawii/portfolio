import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/admin/api/analytics.js";
import { accessEnvironment, accessRequest, createAccessFixture } from "./helpers/access-token.mjs";

class AnalyticsDatabase {
  constructor() {
    this.batches = [];
  }

  prepare(sql) {
    return { sql };
  }

  async batch(statements) {
    this.batches.push(statements);
    if (statements.every(statement => statement.sql.includes("DELETE FROM"))) {
      return statements.map(() => ({ success: true, meta: { changes: 0 } }));
    }
    return [
      { results: [{ pageviews: 12, visitors: 4, sessions: 5, pages: 3 }] },
      { results: [{ day: "2026-08-20", pageviews: 12, sessions: 5 }] },
      { results: [{ page: "/work", pageviews: 7, sessions: 3 }] },
      { results: [{ country: "AE", pageviews: 12 }] },
      { results: [{ label: "Mobile", pageviews: 8 }] },
      { results: [{ label: "Safari", pageviews: 7 }] },
      { results: [{ label: "Direct", pageviews: 9 }] },
      { results: [{ created_at: "2026-08-20T00:00:00Z", session: "a1b2c3d4", country: "AE", region: "Dubai", city: "Dubai", page: "/work", referrer: "Direct", device: "Mobile", browser: "Safari" }] },
      { results: [{ questions: 5, visitors: 3, average_response_ms: 120, salary_flags: 1, privacy_blocks: 0 }] },
      { results: [{ day: "2026-08-20", questions: 5 }] },
      { results: [{ country: "AE", questions: 5 }] },
      { results: [{ created_at: "2026-08-20T00:00:00Z", country: "AE", region: "Dubai", city: "Dubai", question: "Role fit?", flag: "none", response_ms: 120 }] },
      { results: [{ created_at: "2026-08-20T00:00:00Z", session_hash: "a".repeat(64), country: "AE", region: "Dubai", city: "Dubai", question: "Is Yahya available for this role?", answer: "Yes, he is available.", flag: "none" }] }
    ];
  }
}

test("returns a minimized analytics payload after enforcing retention", async () => {
  const fixture = await createAccessFixture();
  const database = new AnalyticsDatabase();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(fixture.certs);

  try {
    const response = await onRequestGet({
      request: accessRequest(fixture.token),
      env: { ...accessEnvironment, DB: database }
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.viewer, accessEnvironment.ADMIN_EMAIL);
    assert.equal(body.range, "30 days");
    assert.deepEqual(Object.keys(body).sort(), ["ai", "generatedAt", "range", "viewer", "website"]);
    assert.equal(body.website.summary.pageviews, 12);
    assert.equal(body.ai.summary.questions, 5);
    assert.equal(body.ai.sessions[0].id, "a".repeat(16));
    assert.equal(body.ai.sessions[0].summary, "Hiring and role fit / Availability");
    assert.equal(body.ai.sessions[0].score, 7);
    assert.equal("session_hash" in body.ai.sessions[0], false);
    assert.equal(database.batches.length, 2);
    assert.equal(database.batches[0].every(statement => statement.sql.includes("DELETE FROM")), true);

    const websiteRecentSql = database.batches[1][7].sql;
    const aiRecentSql = database.batches[1][11].sql;
    assert.match(websiteRecentSql, /substr\(session_hash, 1, 8\)/);
    assert.doesNotMatch(websiteRecentSql, /SELECT\s+.*visitor_hash/is);
    assert.match(aiRecentSql, /-90 days/);
    assert.doesNotMatch(aiRecentSql, /\banswer\b|\bmodel\b|\bvisitor_hash\b|\bsession_hash\b/);
    const aiSessionsSql = database.batches[1][12].sql;
    assert.match(aiSessionsSql, /session_hash/);
    assert.doesNotMatch(aiSessionsSql, /visitor_hash/);
    assert.deepEqual(Object.keys(body.ai.recent[0]).sort(), ["city", "country", "created_at", "flag", "question", "region", "response_ms"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
