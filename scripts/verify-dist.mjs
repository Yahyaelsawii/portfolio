import { access, readdir, stat } from "node:fs/promises";
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
const requiredPaths = ["index.html", "404.html", "admin/index.html", "_headers", "_routes.json", "assets/pdfs/Yahya_ElSawi_CV.pdf"];

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

const files = await walk(output);
const failures = [];
let totalBytes = 0;

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
  console.log(`Verified ${files.length} public files (${(totalBytes / 1024 / 1024).toFixed(1)} MiB) with no private or source-only artifacts.`);
}
