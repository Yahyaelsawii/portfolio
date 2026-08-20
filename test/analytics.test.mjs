import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/admin/analytics.js";
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
    if (statements.length === 2) {
      return statements.map(() => ({ success: true, meta: { changes: 0 } }));
    }
    return [
      { results: [{ questions: 5, visitors: 3, average_response_ms: 120, salary_flags: 1, privacy_blocks: 0 }] },
      { results: [{ day: "2026-08-20", questions: 5 }] },
      { results: [{ country: "AE", questions: 5 }] },
      { results: [{ created_at: "2026-08-20T00:00:00Z", country: "AE", region: "Dubai", city: "Dubai", question: "Role fit?", flag: "none", response_ms: 120 }] }
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
    assert.deepEqual(Object.keys(body).sort(), ["daily", "generatedAt", "range", "recent", "regions", "summary", "viewer"]);
    assert.equal(database.batches.length, 2);
    assert.equal(database.batches[0].every(statement => statement.sql.includes("DELETE FROM")), true);

    const recentSql = database.batches[1][3].sql;
    assert.match(recentSql, /-90 days/);
    assert.doesNotMatch(recentSql, /\banswer\b|\bmodel\b|\bvisitor_hash\b|\bsession_hash\b/);
    assert.deepEqual(Object.keys(body.recent[0]).sort(), ["city", "country", "created_at", "flag", "question", "region", "response_ms"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
