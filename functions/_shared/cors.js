export const GITHUB_PAGES_ORIGIN = "https://yahyaelsawii.github.io";

export function isApprovedPublicOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const suppliedOrigin = new URL(origin).origin;
    return suppliedOrigin === new URL(request.url).origin || suppliedOrigin === GITHUB_PAGES_ORIGIN;
  } catch {
    return false;
  }
}

export function publicCorsHeaders(headers = {}) {
  return {
    ...headers,
    "access-control-allow-origin": GITHUB_PAGES_ORIGIN,
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    vary: "Origin"
  };
}

export function publicPreflightResponse(request, methods) {
  if (!isApprovedPublicOrigin(request)) {
    return new Response(null, { status: 403, headers: publicCorsHeaders() });
  }
  return new Response(null, {
    status: 204,
    headers: publicCorsHeaders({ allow: methods })
  });
}
