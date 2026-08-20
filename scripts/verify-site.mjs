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
  const attributePattern = /\b(?:href|src|poster)=["']([^"']+)["']/gi;
  for (const match of html.matchAll(attributePattern)) {
    const value = match[1].trim();
    if (!value || value.startsWith("#") || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    references.push(value);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) {
      const value = candidate.trim().split(/\s+/, 1)[0];
      if (value && !/^(?:https?:|data:)/i.test(value)) references.push(value);
    }
  }
  return references;
}

async function resolvesFrom(htmlFile, reference) {
  const cleanReference = reference.split(/[?#]/, 1)[0];
  if (!cleanReference) return true;
  const relative = cleanReference.startsWith("/") ? cleanReference.slice(1) : path.join(path.dirname(path.relative(root, htmlFile)), cleanReference);
  const target = path.resolve(root, relative);
  const outsideRoot = path.relative(root, target).startsWith(`..${path.sep}`);
  if (outsideRoot) return false;
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
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) failures.push(`${path.relative(root, htmlFile)}: missing document language`);
  if (!/<meta\b[^>]*\bname=["']viewport["']/i.test(html)) failures.push(`${path.relative(root, htmlFile)}: missing viewport metadata`);
  if (!/<meta\b[^>]*\bname=["']description["']/i.test(html)) failures.push(`${path.relative(root, htmlFile)}: missing description metadata`);

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) failures.push(`${path.relative(root, htmlFile)}: duplicate ids ${duplicateIds.join(", ")}`);

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
