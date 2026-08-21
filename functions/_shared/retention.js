export const CONVERSATION_RETENTION_DAYS = 90;
export const RATE_LIMIT_RETENTION_DAYS = 1;

export const CONVERSATION_PURGE_SQL = `DELETE FROM ai_logs WHERE created_at < datetime('now', '-${CONVERSATION_RETENTION_DAYS} days')`;
export const RATE_LIMIT_PURGE_SQL = `DELETE FROM ai_rate_limits WHERE window_start < datetime('now', '-${RATE_LIMIT_RETENTION_DAYS} day')`;
export const CONTACT_RATE_LIMIT_PURGE_SQL = `DELETE FROM contact_rate_limits WHERE window_start < datetime('now', '-${RATE_LIMIT_RETENTION_DAYS} day')`;

export function retentionStatements(db) {
  if (!db) throw new Error("RETENTION_DATABASE_NOT_CONFIGURED");
  return [db.prepare(CONVERSATION_PURGE_SQL), db.prepare(RATE_LIMIT_PURGE_SQL), db.prepare(CONTACT_RATE_LIMIT_PURGE_SQL)];
}

export async function purgeExpiredData(db) {
  const results = await db.batch(retentionStatements(db));
  if (!Array.isArray(results) || results.some(result => result?.success === false)) {
    throw new Error("RETENTION_PURGE_FAILED");
  }
  return {
    conversations: Number(results[0]?.meta?.changes || 0),
    rateLimits: Number(results[1]?.meta?.changes || 0),
    contactRateLimits: Number(results[2]?.meta?.changes || 0)
  };
}
