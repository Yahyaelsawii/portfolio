import process from "node:process";

const origin = new URL(process.env.SITE_ORIGIN || "https://yahyaelsawi.website").origin;
const routes = [
  "/", "/about", "/work", "/recruiter", "/resume", "/contact", "/terminal", "/privacy",
  "/work/gift-it", "/work/rit-app", "/work/passwordless", "/work/vehicle-rental",
  "/work/mood-insights", "/work/network-automation", "/work/vr-neuroanatomy"
];
const failures = [];

for (const route of routes) {
  try {
    const response = await fetch(`${origin}${route}`, { redirect:"follow" });
    const html = await response.text();
    if (!response.ok) failures.push(`${route}: HTTP ${response.status}`);
    if (!/<main(?:\s|>)/i.test(html)) failures.push(`${route}: missing main landmark`);
    if ((html.match(/<h1(?:\s|>)/gi) || []).length !== 1) failures.push(`${route}: expected one server-rendered h1`);
    if (!response.headers.get("content-security-policy")) failures.push(`${route}: missing Content-Security-Policy`);
    if (response.headers.get("x-content-type-options") !== "nosniff") failures.push(`${route}: missing X-Content-Type-Options`);
    if (!response.headers.get("strict-transport-security")) failures.push(`${route}: missing HSTS`);
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  }
}

for (const asset of ["/styles.css", "/main.js", "/covers/gift-it-960.webp", "/assets/pdfs/Yahya_ElSawi_CV.pdf"]) {
  try {
    const response = await fetch(`${origin}${asset}`, { method:"HEAD", redirect:"follow" });
    if (!response.ok) failures.push(`${asset}: HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${asset}: ${error.message}`);
  }
}

try {
  const health = await fetch(`${origin}/api/health`, { headers:{ accept:"application/json" } });
  const payload = await health.json().catch(() => ({}));
  if (!health.ok) failures.push(`/api/health: HTTP ${health.status}`);
  for (const control of ["ai", "logging", "privacyHashing", "atomicRateLimiting"]) {
    if (!payload[control]) failures.push(`/api/health: ${control} is not ready`);
  }
} catch (error) {
  failures.push(`/api/health: ${error.message}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Verified ${routes.length} production routes, critical assets, security headers, and API health at ${origin}.`);
