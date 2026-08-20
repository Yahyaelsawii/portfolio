import { cp, lstat, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

if (output !== path.resolve(root, "dist")) throw new Error("Unexpected build output path");

try {
  const existing = await lstat(output);
  if (existing.isSymbolicLink() || !existing.isDirectory()) throw new Error("Build output must be a regular directory");
  await rm(output, { recursive: true });
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(output, { recursive: false });

const htmlFiles = [
  "404.html",
  "about.html",
  "contact.html",
  "deep-scan.html",
  "experience.html",
  "gift-it.html",
  "index.html",
  "infrastructure.html",
  "log.html",
  "mood-insights.html",
  "network-automation.html",
  "passwordless.html",
  "privacy.html",
  "project.html",
  "recruiter.html",
  "resume.html",
  "rit-app.html",
  "terminal.html",
  "vehicle-rental.html",
  "vr-neuroanatomy.html",
  "work.html"
];
const publicFiles = [
  ...htmlFiles,
  "_headers",
  "_routes.json",
  "dashboard.js",
  "main.js",
  "redirect.js",
  "robots.txt",
  "sitemap.xml",
  "styles.css"
];
const publicPaths = [
  ...publicFiles,
  "admin",
  "assets/favicon",
  "assets/pdfs",
  "assets/Pictures/responsive",
  "assets/Pictures/network-automation",
  "assets/Pictures/about-portrait-640.avif",
  "assets/Pictures/about-portrait-640.webp",
  "assets/Pictures/about-portrait-960.avif",
  "assets/Pictures/about-portrait-960.webp",
  "assets/Pictures/about-portrait-1440.avif",
  "assets/Pictures/about-portrait-1440.webp",
  "assets/Pictures/head_shot.webp",
  "covers",
  "fonts"
];

if (new Set(publicPaths).size !== publicPaths.length) throw new Error("Public build manifest contains duplicate paths");

async function assertNoSymlinks(source) {
  const details = await lstat(source);
  if (details.isSymbolicLink()) throw new Error(`Public build input cannot be a symbolic link: ${path.relative(root, source)}`);
  if (!details.isDirectory()) return;
  for (const entry of await readdir(source)) await assertNoSymlinks(path.join(source, entry));
}

for (const relativePath of publicPaths) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  await assertNoSymlinks(source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

console.log(`Built ${htmlFiles.length} pages and public assets in ${path.relative(root, output)}/.`);
