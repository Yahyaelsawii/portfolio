import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axePath = require.resolve("axe-core/axe.min.js");
const root = path.join(process.cwd(), "dist");
const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

async function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\//, "");
  const initial = path.resolve(root, relative);
  const rootRelative = path.relative(root, initial);
  if (rootRelative === ".." || rootRelative.startsWith(`..${path.sep}`)) return null;

  const candidates = [initial];
  if (!path.extname(initial)) candidates.push(`${initial}.html`, path.join(initial, "index.html"));
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next clean-URL representation.
    }
  }
  return path.join(root, "404.html");
}

const server = createServer(async (request, response) => {
  try {
    const file = await resolveRequest(new URL(request.url, "http://localhost").pathname);
    if (!file) {
      response.writeHead(400).end("Bad request");
      return;
    }
    const isFallback = path.basename(file) === "404.html" && !request.url.startsWith("/404");
    response.writeHead(isFallback ? 404 : 200, {
      "content-type": mimeTypes[path.extname(file)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(await readFile(file));
  } catch (error) {
    response.writeHead(500).end(error.message);
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const base = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const failures = [];
const routes = ["/", "/work", "/about", "/experience", "/recruiter", "/resume", "/contact", "/terminal", "/privacy", "/gift-it", "/network-automation", "/vr-neuroanatomy"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on("pageerror", error => runtimeErrors.push(error.message));
      page.on("console", message => {
        if (message.type() === "error") {
          const location = message.location().url;
          runtimeErrors.push(`${message.text()}${location ? ` (${location})` : ""}`);
        }
      });
      page.on("response", resourceResponse => {
        if (resourceResponse.status() >= 400) {
          runtimeErrors.push(`HTTP ${resourceResponse.status()} ${resourceResponse.url()}`);
        }
      });

      const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      if (!response?.ok()) failures.push(`${viewport.name} ${route}: HTTP ${response?.status()}`);
      const state = await page.evaluate(() => ({
        h1: [...document.querySelectorAll("h1")].filter(node => node.getClientRects().length).length,
        main: Boolean(document.querySelector("main")),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        title: document.title
      }));
      if (state.h1 !== 1) failures.push(`${viewport.name} ${route}: expected one visible h1, found ${state.h1}`);
      if (!state.main) failures.push(`${viewport.name} ${route}: missing main landmark`);
      if (state.overflow > 1) failures.push(`${viewport.name} ${route}: horizontal overflow ${state.overflow}px`);
      if (!state.title.trim()) failures.push(`${viewport.name} ${route}: empty title`);
      if (runtimeErrors.length) failures.push(`${viewport.name} ${route}: ${runtimeErrors.join(" | ")}`);

      await page.addScriptTag({ path: axePath });
      const axe = await page.evaluate(async () => globalThis.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }
      }));
      for (const violation of axe.violations) {
        const targets = violation.nodes.slice(0, 3).flatMap(node => node.target).join(", ");
        failures.push(`${viewport.name} ${route}: axe ${violation.id} (${targets})`);
      }
      await page.close();
    }
    await context.close();
  }

  const interactionContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const interactionPage = await interactionContext.newPage();
  await interactionPage.goto(`${base}/work`, { waitUntil: "networkidle" });
  await interactionPage.getByRole("button", { name: "UX", exact: true }).click();
  const visibleProjects = await interactionPage.locator("#all-projects .project-card:visible").count();
  if (visibleProjects !== 4) failures.push(`work filter: expected 4 UX projects, found ${visibleProjects}`);

  await interactionPage.goto(`${base}/`, { waitUntil: "networkidle" });
  const menu = interactionPage.getByRole("button", { name: "Toggle navigation" });
  await menu.click();
  if (await menu.getAttribute("aria-expanded") !== "true") failures.push("mobile menu: did not expose its open state");
  await interactionPage.keyboard.press("Escape");
  if (await menu.getAttribute("aria-expanded") !== "false") failures.push("mobile menu: Escape did not close it");

  await interactionPage.goto(`${base}/network-automation`, { waitUntil: "networkidle" });
  await interactionPage.getByRole("button", { name: "Introduce fault" }).click();
  if (await interactionPage.locator("#network-demo").getAttribute("data-state") !== "fault") failures.push("network demo: fault state did not activate");
  await interactionPage.getByRole("button", { name: "Recover" }).click();
  await interactionPage.waitForFunction(() => document.querySelector("#network-demo")?.dataset.state === "healthy");
  await interactionPage.close();
  await interactionContext.close();
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
} else {
  console.log(`Verified ${routes.length} routes at desktop and mobile sizes with WCAG checks and key interaction smoke tests.`);
}
