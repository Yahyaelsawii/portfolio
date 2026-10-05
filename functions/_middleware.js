// Staging starts read-only. Its backend can be enabled only after isolated
// bindings and end-to-end Access checks have been verified.
export async function onRequest({ request, env, next }) {
  const host = new URL(request.url).hostname;
  const staging = env.PORTFOLIO_ENV === "staging"
    || host === "stg.yahyaelsawi.website"
    || (host.endsWith(".pages.dev") && host.startsWith("staging."));
  if (staging) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/") || path.startsWith("/admin/api/")) {
      return Response.json({ error: "STAGING_BACKEND_DISABLED" }, {
        status: 503,
        headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" }
      });
    }
  }
  return next();
}
