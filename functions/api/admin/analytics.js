import { verifyAdminAccess } from "../../_shared/access.js";
import { purgeExpiredData } from "../../_shared/retention.js";
import { groupSessionInsights } from "../../_shared/session-insights.js";

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
    const results = await env.DB.batch([
      env.DB.prepare(`
        SELECT
          COUNT(*) AS pageviews,
          COUNT(DISTINCT visitor_hash) AS visitors,
          COUNT(DISTINCT session_hash) AS sessions,
          COUNT(DISTINCT page_path) AS pages
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
      `),
      env.DB.prepare(`
        SELECT date(created_at) AS day, COUNT(*) AS pageviews, COUNT(DISTINCT session_hash) AS sessions
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY date(created_at)
        ORDER BY day ASC
      `),
      env.DB.prepare(`
        SELECT page_path AS page, COUNT(*) AS pageviews, COUNT(DISTINCT session_hash) AS sessions
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY page_path
        ORDER BY pageviews DESC, page ASC
        LIMIT 12
      `),
      env.DB.prepare(`
        SELECT COALESCE(country, 'Unknown') AS country, COUNT(*) AS pageviews
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY country
        ORDER BY pageviews DESC
        LIMIT 10
      `),
      env.DB.prepare(`
        SELECT device_type AS label, COUNT(*) AS pageviews
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY device_type
        ORDER BY pageviews DESC
      `),
      env.DB.prepare(`
        SELECT browser_family AS label, COUNT(*) AS pageviews
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY browser_family
        ORDER BY pageviews DESC
      `),
      env.DB.prepare(`
        SELECT referrer_host AS label, COUNT(*) AS pageviews
        FROM site_events
        WHERE created_at >= datetime('now', '-30 days')
          AND referrer_host != 'Internal'
        GROUP BY referrer_host
        ORDER BY pageviews DESC
        LIMIT 10
      `),
      env.DB.prepare(`
        SELECT
          created_at,
          substr(session_hash, 1, 8) AS session,
          country,
          region,
          city,
          page_path AS page,
          referrer_host AS referrer,
          device_type AS device,
          browser_family AS browser
        FROM site_events
        WHERE created_at >= datetime('now', '-90 days')
        ORDER BY id DESC
        LIMIT 75
      `),
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
      `),
      env.DB.prepare(`
        SELECT created_at, session_hash, country, region, city, question, answer, flag
        FROM ai_logs
        WHERE created_at >= datetime('now', '-90 days')
          AND session_hash IS NOT NULL
        ORDER BY id DESC
        LIMIT 500
      `)
    ]);

    return respond({
      viewer: access.email,
      range: "30 days",
      generatedAt: new Date().toISOString(),
      website: {
        summary: results[0]?.results?.[0] || {},
        daily: results[1]?.results || [],
        pages: results[2]?.results || [],
        regions: results[3]?.results || [],
        devices: results[4]?.results || [],
        browsers: results[5]?.results || [],
        referrers: results[6]?.results || [],
        recent: results[7]?.results || []
      },
      ai: {
        summary: results[8]?.results?.[0] || {},
        daily: results[9]?.results || [],
        regions: results[10]?.results || [],
        recent: results[11]?.results || [],
        sessions: groupSessionInsights(results[12]?.results || [])
      }
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_analytics_failed", error: error?.message || "Unknown error" }));
    return respond({ error: "ANALYTICS_UNAVAILABLE" }, 500);
  }
}
