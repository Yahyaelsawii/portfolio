import { verifyAdminAccess } from "../../_shared/access.js";
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

  try {
    await purgeExpiredData(env.DB);
    const [summary, daily, regions, recent] = await env.DB.batch([
      env.DB.prepare(`
        SELECT
          COUNT(*) AS questions,
          COUNT(DISTINCT visitor_hash) AS visitors,
          ROUND(AVG(response_ms)) AS average_response_ms,
          SUM(CASE WHEN flag = 'salary' THEN 1 ELSE 0 END) AS salary_flags,
          SUM(CASE WHEN flag = 'privacy' THEN 1 ELSE 0 END) AS privacy_blocks
        FROM ai_logs
        WHERE created_at >= datetime('now', '-30 days')
      `),
      env.DB.prepare(`
        SELECT date(created_at) AS day, COUNT(*) AS questions
        FROM ai_logs
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY date(created_at)
        ORDER BY day ASC
      `),
      env.DB.prepare(`
        SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS questions
        FROM ai_logs
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY country
        ORDER BY questions DESC
        LIMIT 8
      `),
      env.DB.prepare(`
        SELECT created_at, country, region, city, question, flag, response_ms
        FROM ai_logs
        WHERE created_at >= datetime('now', '-90 days')
        ORDER BY id DESC
        LIMIT 50
      `)
    ]);

    return respond({
      viewer: access.email,
      range: "30 days",
      generatedAt: new Date().toISOString(),
      summary: summary.results?.[0] || {},
      daily: daily.results || [],
      regions: regions.results || [],
      recent: recent.results || []
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_analytics_failed", error: error?.message || "Unknown error" }));
    return respond({ error: "ANALYTICS_UNAVAILABLE" }, 500);
  }
}
