import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const output = path.join(root, "dist");
const forbiddenNames = new Set([
  ".dev.vars",
  "AI_SETUP.md",
  "PROJECT_HANDOFF.md",
  "schema.sql",
  "wrangler.jsonc",
  "wrangler.retention.jsonc"
]);
const forbiddenDirectories = new Set([".git", "functions", "scripts", "test", "workers"]);
const requiredPaths = ["index.html", "404.html", "admin/index.html", "admin/log/index.html", "_headers", "_redirects", "_routes.json", "assets/pdfs/Yahya_ElSawi_CV.pdf", "assets/pdfs/Yahya_ElSawi_Recruiter_Pack.pdf", "output/pdf/Yahya_ElSawi_Portfolio_Roadmap_and_Sitemap.pdf", "about/index.html", "contact/index.html", "resume/index.html", "terminal/index.html", "work/index.html", "work/gift-it/index.html", "work/network-automation/index.html", "work/vr-neuroanatomy/index.html"];
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
  "work/vr-neuroanatomy/index.html"
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
  ["work/vr-neuroanatomy/index.html", ["WebPage", "BreadcrumbList"]]
]);
const expectedWorkProjectUrls = ["vr-neuroanatomy", "network-automation", "mood-insights", "rit-app", "gift-it", "passwordless", "vehicle-rental"]
  .map(slug => `https://yahya-elsawi-portfolio-bnj.pages.dev/work/${slug}`);

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
      throw new Error("Work structured-data items are not in the approved newest-first order");
    }
  }
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
