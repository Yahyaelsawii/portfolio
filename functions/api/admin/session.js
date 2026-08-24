import { verifyAdminAccess } from "../../_shared/access.js";
import { buildSessionInsight } from "../../_shared/session-insights.js";
import { purgeExpiredData } from "../../_shared/retention.js";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff"
};

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequestGet({ request, env }) {
  const access = await verifyAdminAccess(request, env);
  if (!access.ok) return respond({ error: access.code }, access.status);
  if (!env.DB) return respond({ error: "ANALYTICS_DATABASE_NOT_CONFIGURED" }, 503);

  const sessionId = new URL(request.url).searchParams.get("session")?.trim().toLowerCase() || "";
  if (!/^[a-f0-9]{16}$/.test(sessionId)) return respond({ error: "INVALID_SESSION" }, 400);

  try {
    await purgeExpiredData(env.DB);
    const result = await env.DB.prepare(`
      SELECT created_at, country, region, city, question, answer, flag, model, response_ms
      FROM ai_logs
      WHERE substr(session_hash, 1, 16) = ?
        AND created_at >= datetime('now', '-90 days')
      ORDER BY id ASC
      LIMIT 100
    `).bind(sessionId).all();
    const messages = Array.isArray(result?.results) ? result.results : [];
    if (!messages.length) return respond({ error: "SESSION_NOT_FOUND" }, 404);

    return respond({
      viewer: access.email,
      id: sessionId,
      insight: buildSessionInsight(messages),
      messages: messages.map(row => ({
        created_at: row.created_at,
        question: row.question,
        answer: row.answer,
        flag: row.flag,
        model: row.model,
        response_ms: row.response_ms
      }))
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_session_failed", error: error?.message || "Unknown error" }));
    return respond({ error: "SESSION_UNAVAILABLE" }, 500);
  }
}
