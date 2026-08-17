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

const rootEntries = await readdir(root, { withFileTypes: true });
const htmlFiles = rootEntries.filter(entry => entry.isFile() && entry.name.endsWith(".html")).map(entry => entry.name);
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
const publicDirectories = ["admin", "assets", "covers", "fonts"];

for (const file of publicFiles) {
  await cp(path.join(root, file), path.join(output, file));
}
for (const directory of publicDirectories) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}

console.log(`Built ${htmlFiles.length} pages and public assets in ${path.relative(root, output)}/.`);
