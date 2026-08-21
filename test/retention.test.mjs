import assert from "node:assert/strict";
import test from "node:test";
import {
  CONVERSATION_PURGE_SQL,
  CONTACT_RATE_LIMIT_PURGE_SQL,
  RATE_LIMIT_PURGE_SQL,
  purgeExpiredData
} from "../functions/_shared/retention.js";
import retentionWorker from "../workers/retention.js";

class RetentionDatabase {
  constructor(results = [
    { success: true, meta: { changes: 4 } },
    { success: true, meta: { changes: 2 } },
    { success: true, meta: { changes: 1 } }
  ]) {
    this.results = results;
    this.statements = [];
  }

  prepare(sql) {
    const statement = { sql };
    this.statements.push(statement);
    return statement;
  }

  async batch() {
    return this.results;
  }
}

test("purges expired conversations and rate-limit windows", async () => {
  const database = new RetentionDatabase();
  const deleted = await purgeExpiredData(database);
  assert.deepEqual(deleted, { conversations: 4, rateLimits: 2, contactRateLimits: 1 });
  assert.equal(database.statements[0].sql, CONVERSATION_PURGE_SQL);
  assert.equal(database.statements[1].sql, RATE_LIMIT_PURGE_SQL);
  assert.equal(database.statements[2].sql, CONTACT_RATE_LIMIT_PURGE_SQL);
  assert.match(CONVERSATION_PURGE_SQL, /-90 days/);
  assert.match(RATE_LIMIT_PURGE_SQL, /-1 day/);
  assert.match(CONTACT_RATE_LIMIT_PURGE_SQL, /-1 day/);
});

test("fails when D1 reports an unsuccessful purge", async () => {
  const database = new RetentionDatabase([{ success: false }, { success: true }, { success: true }]);
  await assert.rejects(() => purgeExpiredData(database), /RETENTION_PURGE_FAILED/);
});

test("scheduled worker executes the shared retention policy", async () => {
  const database = new RetentionDatabase();
  const originalLog = console.log;
  let logged = "";
  console.log = message => { logged = message; };
  try {
    await retentionWorker.scheduled({}, { DB: database });
  } finally {
    console.log = originalLog;
  }
  assert.equal(database.statements.length, 3);
  assert.match(logged, /retention_cleanup_complete/);
});
