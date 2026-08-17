import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".wrangler", ".wrangler-local", "dist", "node_modules"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function localReferences(html) {
  const references = [];
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attributePattern)) {
    const value = match[1].trim();
    if (!value || value.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    references.push(value);
  }
  return references;
}

async function resolvesFrom(htmlFile, reference) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference) return true;
  const relative = cleanReference.startsWith("/") ? cleanReference.slice(1) : path.join(path.dirname(path.relative(root, htmlFile)), cleanReference);
  const target = path.resolve(root, relative);
  const candidates = path.extname(target) ? [target] : [target, `${target}.html`, path.join(target, "index.html")];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {
      // Try the next static-route representation.
    }
  }
  return false;
}

const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith(".html"));
const failures = [];

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  if (!/^<!doctype html>/i.test(html.trimStart())) failures.push(`${path.relative(root, htmlFile)}: missing doctype`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${path.relative(root, htmlFile)}: missing title`);

  for (const reference of localReferences(html)) {
    if (!await resolvesFrom(htmlFile, reference)) failures.push(`${path.relative(root, htmlFile)}: missing ${reference}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${htmlFiles.length} HTML files with no missing local references.`);
}
