import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const output = path.join(root, "dist");
const forbiddenNames = new Set([
  ".dev.vars",
  "AI_SETUP.md",
  "ENVIRONMENTS.md",
  "PROJECT_HANDOFF.md",
  "schema.sql",
  "wrangler.jsonc",
  "wrangler.staging.jsonc",
  "wrangler.retention.jsonc"
]);
const forbiddenDirectories = new Set([".git", "functions", "scripts", "test", "workers"]);
const addedGiftitProjects = ["giftit-saudi-market-entry", "giftit-one-table", "giftit-email-lifecycle", "giftit-saudi-arabic", "giftit-app-positioning"];
const requiredPaths = ["index.html", "404.html", "admin/index.html", "admin/log/index.html", "_headers", "_redirects", "_routes.json", "personalization.js", "assets/pdfs/Yahya_ElSawi_CV.pdf", "assets/pdfs/Yahya_ElSawi_CV_Previous_2026-08-17.pdf", "assets/pdfs/Yahya_ElSawi_Recruiter_Pack.pdf", "output/pdf/Yahya_ElSawi_Portfolio_Roadmap_and_Sitemap.pdf", "about/index.html", "contact/index.html", "resume/index.html", "terminal/index.html", "work/index.html", "work/gift-it/index.html", "work/network-automation/index.html", "work/vr-neuroanatomy/index.html", ...addedGiftitProjects.map(id => `work/${id}/index.html`)];
const structuredDataPaths = [
  "index.html",
  "about/index.html",
  "recruiter/index.html",
  "resume/index.html",
  "work/index.html",
  "work/gift-it/index.html",
  "work/rit-app/index.html",
  "work/passwordless/index.html",
  "work/vehicle-rental/index.html",
  "work/mood-insights/index.html",
  "work/network-automation/index.html",
  "work/vr-neuroanatomy/index.html",
  ...addedGiftitProjects.map(id => `work/${id}/index.html`)
];
const structuredDataTypeExpectations = new Map([
  ["index.html", ["Person", "WebSite"]],
  ["about/index.html", ["Person", "ProfilePage"]],
  ["recruiter/index.html", ["Person", "ProfilePage"]],
  ["resume/index.html", ["Person"]],
  ["work/index.html", ["Person", "CollectionPage"]],
  ["work/gift-it/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/rit-app/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/passwordless/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/vehicle-rental/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/mood-insights/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/network-automation/index.html", ["Person", "CreativeWork", "BreadcrumbList"]],
  ["work/vr-neuroanatomy/index.html", ["WebPage", "BreadcrumbList"]],
  ...addedGiftitProjects.map(id => [`work/${id}/index.html`, ["Person", "CreativeWork", "BreadcrumbList"]])
]);
const expectedWorkProjectUrls = ["gift-it", "network-automation", "rit-app", "giftit-app-positioning", "vr-neuroanatomy", "giftit-email-lifecycle", "giftit-saudi-arabic", "giftit-one-table", "giftit-saudi-market-entry", "passwordless", "mood-insights", "vehicle-rental"]
  .map(slug => `https://yahyaelsawi.website/work/${slug}`);
const prerenderedProjectPaths = ["gift-it", "rit-app", "passwordless", "vehicle-rental", "mood-insights", ...addedGiftitProjects]
  .map(slug => `work/${slug}/index.html`);

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

for (const requiredPath of requiredPaths) await access(path.join(output, requiredPath));

const functionRoutes = JSON.parse(await readFile(path.join(output, "_routes.json"), "utf8"));
for (const requiredRoute of ["/api/*", "/admin/api/*"]) {
  if (!functionRoutes.include?.includes(requiredRoute)) throw new Error(`Pages Functions route is missing: ${requiredRoute}`);
}

for (const structuredDataPath of structuredDataPaths) {
  const html = await readFile(path.join(output, structuredDataPath), "utf8");
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length !== 1) throw new Error(`${structuredDataPath} must contain exactly one JSON-LD block`);
  const data = JSON.parse(blocks[0][1]);
  if (data["@context"] !== "https://schema.org" || !Array.isArray(data["@graph"]) || data["@graph"].length === 0) {
    throw new Error(`${structuredDataPath} has an invalid structured-data graph`);
  }
  const graphTypes = new Set(data["@graph"].map(item => item["@type"]));
  for (const expectedType of structuredDataTypeExpectations.get(structuredDataPath) || []) {
    if (!graphTypes.has(expectedType)) throw new Error(`${structuredDataPath} is missing ${expectedType} structured data`);
  }
  if (structuredDataPath === "work/vr-neuroanatomy/index.html") {
    const serialized = JSON.stringify(data);
    if (serialized.includes('"author"') || serialized.includes('"contributor"') || serialized.includes("Rochester")) {
      throw new Error("Locked VR structured data exceeds the approved disclosure boundary");
    }
  }
  if (structuredDataPath === "work/index.html") {
    const collection = data["@graph"].find(item => item["@type"] === "CollectionPage");
    const projectUrls = collection?.mainEntity?.itemListElement?.map(item => item.url);
    if (JSON.stringify(projectUrls) !== JSON.stringify(expectedWorkProjectUrls)) {
      throw new Error("Work structured-data items do not match the curated priority and date order");
    }
  }
}

const homeHtml = await readFile(path.join(output, "index.html"), "utf8");
if (countMatches(homeHtml, /<article class="project-card"/g) !== 5) {
  throw new Error("Homepage must contain exactly five pre-rendered featured project cards");
}
const expectedFeaturedProjectUrls = ["/work/giftit-app-positioning", "/work/network-automation", "/work/giftit-email-lifecycle", "/work/mood-insights", "/work/rit-app"];
const featuredProjectUrls = [...homeHtml.matchAll(/<article class="project-card"[^>]*data-project-url="([^"]+)"/g)]
  .map(match => match[1]);
if (JSON.stringify(featuredProjectUrls) !== JSON.stringify(expectedFeaturedProjectUrls)) {
  throw new Error(`Homepage featured projects are not in the approved order: ${featuredProjectUrls.join(", ")}`);
}
for (const heroText of [
  "I’m Yahya El-Sawi, a product and UX designer with a frontend development background.",
  "I turn user and business needs into clear digital experiences",
  "Giftit App Positioning &amp; Product Growth"
]) {
  if (!homeHtml.includes(heroText)) throw new Error(`Homepage is missing approved hero copy: ${heroText}`);
}
if (homeHtml.includes("project-image-button")) {
  throw new Error("Homepage project covers must link to their case studies instead of opening a lightbox");
}
if (!homeHtml.includes("Terms and Conditions") || !homeHtml.includes("Privacy Policy")) {
  throw new Error("The public footer must link to both policies");
}
if (!homeHtml.includes('class="skip-link" href="#main-content"') || !homeHtml.includes('<main id="main-content" tabindex="-1">')) {
  throw new Error("A native skip link and keyboard focus target must be available before JavaScript");
}
if (!homeHtml.includes("data-open-personalization")) {
  throw new Error("Privacy choices and the optional first-party personalization module must be available");
}
if (!homeHtml.includes("September 2024–May 2026") || !homeHtml.includes("June 2026") || !homeHtml.includes("November 2024")) {
  throw new Error("Featured project cards must show verified dates");
}

const workHtml = await readFile(path.join(output, "work/index.html"), "utf8");
if (countMatches(workHtml, /<article class="project-card"/g) !== 12) {
  throw new Error("Work must contain exactly twelve pre-rendered project cards");
}
const sitemapText = await readFile(path.join(output, "sitemap.xml"), "utf8");
for (const projectUrl of expectedWorkProjectUrls.filter(url => !url.endsWith("/vr-neuroanatomy"))) {
  if (!sitemapText.includes(`<loc>${projectUrl}</loc>`)) throw new Error(`Public project is missing from the sitemap: ${projectUrl}`);
}
const headersText = await readFile(path.join(output, "_headers"), "utf8");
if (!headersText.includes("/assets/pdfs/Yahya_ElSawi_CV_Previous_2026-08-17.pdf") || !headersText.includes("X-Robots-Tag: noindex, nofollow, noarchive")) {
  throw new Error("The archived CV must remain excluded from search indexing");
}
const resumeHtml = await readFile(path.join(output, "resume/index.html"), "utf8");
if (!resumeHtml.includes("Previous CV (17 August 2026)") || !resumeHtml.includes("may be outdated")) {
  throw new Error("The Resume page must identify the archived CV and its historical status");
}
const networkHtml = await readFile(path.join(output, "work/network-automation/index.html"), "utf8");
if (!networkHtml.includes('class="content-nav" aria-label="Case study contents"') || !networkHtml.includes('href="#network-limitations"')) {
  throw new Error("Network Automation must provide its shared case-study contents navigation");
}
if (workHtml.includes("project-image-button")) {
  throw new Error("Work project covers must link to their case studies instead of opening a lightbox");
}

for (const projectPath of prerenderedProjectPaths) {
  const html = await readFile(path.join(output, projectPath), "utf8");
  if (html.includes('<main id="project-detail"></main>')) {
    throw new Error(`${projectPath} still relies on client-side project rendering`);
  }
  if (countMatches(html, /<h1(?:\s|>)/g) !== 1) throw new Error(`${projectPath} must contain one pre-rendered h1`);
  if (countMatches(html, /class="project-proof-card"/g) !== 5) throw new Error(`${projectPath} must contain five pre-rendered proof cards`);
  if (!html.includes('class="story-block"')) throw new Error(`${projectPath} is missing pre-rendered case-study content`);
}

const files = await walk(output);
const failures = [];
let totalBytes = 0;

for (const publicLogPath of ["log.html", "log/index.html"]) {
  try {
    await access(path.join(output, publicLogPath));
    failures.push(`public developer log must not exist: ${publicLogPath}`);
  } catch {
    // Expected: the developer log is only published below the protected admin path.
  }
}

for (const privatePath of ["qwerty", "qwerty/index.html", "qwerty.html"]) {
  try {
    await access(path.join(output, privatePath));
    failures.push(`Qwerty must stay outside the public artifact: ${privatePath}`);
  } catch {
    // Qwerty is deployed from a separate private repository.
  }
}

for (const file of files) {
  const relative = path.relative(output, file);
  const segments = relative.split(path.sep);
  totalBytes += (await stat(file)).size;
  if (/ \d+(?:\.|$)/.test(path.basename(file))) failures.push(`numbered duplicate artifact: ${relative}`);
  if (forbiddenNames.has(path.basename(file))) failures.push(`forbidden file: ${relative}`);
  if (segments.some(segment => forbiddenDirectories.has(segment))) failures.push(`forbidden directory: ${relative}`);
  if (/\.(?:md|py|sql)$/i.test(relative)) failures.push(`source-only extension: ${relative}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${files.length} public files (${(totalBytes / 1024 / 1024).toFixed(1)} MiB), ${structuredDataPaths.length} structured-data documents, and no private or source-only artifacts.`);
}
