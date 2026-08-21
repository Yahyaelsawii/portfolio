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
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/api/health") {
      response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      response.end(JSON.stringify({ ready:false, ai:false, logging:false, privacyHashing:false, atomicRateLimiting:false }));
      return;
    }
    const file = await resolveRequest(pathname);
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
const routes = ["/", "/work", "/about", "/recruiter", "/resume", "/contact", "/terminal", "/privacy", "/work/gift-it", "/work/rit-app", "/work/passwordless", "/work/vehicle-rental", "/work/mood-insights", "/work/network-automation", "/work/vr-neuroanatomy", "/admin/log/"];
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
  if (!await interactionPage.locator("#professional-experience-panel").isVisible()) failures.push("work tabs: Professional Experience is not open by default");
  if (await interactionPage.locator("#case-studies-panel").isVisible()) failures.push("work tabs: Case Studies should be closed by default");
  await interactionPage.getByRole("tab", { name: /Case studies/ }).click();
  await interactionPage.getByRole("button", { name: "UX", exact: true }).click();
  const visibleProjects = await interactionPage.locator("#all-projects .project-card:visible").count();
  if (visibleProjects !== 4) failures.push(`work filter: expected 4 UX projects, found ${visibleProjects}`);
  await interactionPage.locator("#all-projects .project-image-button:visible").first().click();
  if (!await interactionPage.locator("dialog.image-lightbox[open]").isVisible()) failures.push("project lightbox: did not open from a project card on mobile");
  await interactionPage.keyboard.press("Escape");
  if (await interactionPage.locator("dialog.image-lightbox[open]").count()) failures.push("project lightbox: Escape did not close it");

  await interactionPage.goto(`${base}/`, { waitUntil: "networkidle" });
  const menu = interactionPage.getByRole("button", { name: "Toggle navigation" });
  await menu.click();
  if (await menu.getAttribute("aria-expanded") !== "true") failures.push("mobile menu: did not expose its open state");
  await interactionPage.keyboard.press("Escape");
  if (await menu.getAttribute("aria-expanded") !== "false") failures.push("mobile menu: Escape did not close it");

  await interactionPage.goto(`${base}/work/network-automation`, { waitUntil: "networkidle" });
  await interactionPage.getByRole("button", { name: "Introduce fault" }).click();
  if (await interactionPage.locator("#network-demo").getAttribute("data-state") !== "fault") failures.push("network demo: fault state did not activate");
  await interactionPage.getByRole("button", { name: "Recover" }).click();
  await interactionPage.waitForFunction(() => document.querySelector("#network-demo")?.dataset.state === "healthy");
  await interactionPage.close();
  await interactionContext.close();

  const detailContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const detailPage = await detailContext.newPage();
  await detailPage.goto(`${base}/work`, { waitUntil: "networkidle" });
  await detailPage.getByRole("tab", { name: /Case studies/ }).click();
  const projectOrder = await detailPage.locator("#all-projects .project-card").evaluateAll(cards => cards.map(card => new URL(card.dataset.projectUrl, location.origin).pathname));
  const expectedOrder = ["/work/vr-neuroanatomy", "/work/network-automation", "/work/mood-insights", "/work/rit-app", "/work/gift-it", "/work/passwordless", "/work/vehicle-rental"];
  if (JSON.stringify(projectOrder) !== JSON.stringify(expectedOrder)) failures.push(`work sorting: ${projectOrder.join(", ")}`);
  const figmaCardLinks = detailPage.locator("#all-projects .project-figma-link");
  if (await figmaCardLinks.count() !== 3) failures.push(`work Figma actions: expected 3 direct links, found ${await figmaCardLinks.count()}`);
  const giftItExperience = detailPage.locator(".experience-card", { hasText:"Gift It · Dubai" });
  if (await giftItExperience.locator(".fact-list li").count() !== 3) failures.push("Gift It experience: expected three responsibility bullets");

  for (const route of ["/work/mood-insights", "/work/passwordless", "/work/rit-app"]) {
    await detailPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
    if (!await detailPage.getByRole("link", { name:"Open Figma file" }).isVisible()) failures.push(`${route}: missing Figma action`);
  }

  for (const route of ["/work/gift-it", "/work/passwordless"]) {
    await detailPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const croppedGallery = detailPage.locator("#section-5 .gallery-screen-crop");
    if (await croppedGallery.count() !== 1 || await croppedGallery.locator("img").count() !== 3) failures.push(`${route}: Final UI device-frame crop is missing`);
    await croppedGallery.locator("img").first().click();
    if (!await detailPage.locator("dialog.image-lightbox[open] .image-lightbox-stage.is-device-crop").isVisible()) failures.push(`${route}: cropped image did not open in the lightbox`);
    await detailPage.keyboard.press("Escape");
  }

  await detailPage.goto(`${base}/work/network-automation`, { waitUntil: "networkidle" });
  await detailPage.locator(".case-figure img").first().click();
  if (!await detailPage.locator("dialog.image-lightbox[open]").isVisible()) failures.push("network automation: case-study image did not open in the lightbox");
  await detailPage.keyboard.press("Escape");

  for (const route of ["/work/gift-it", "/work/rit-app", "/work/passwordless", "/work/vehicle-rental", "/work/mood-insights", "/work/network-automation", "/work/vr-neuroanatomy"]) {
    await detailPage.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const proofCards = await detailPage.locator(".project-proof-card").count();
    if (proofCards !== 5) failures.push(`${route}: expected 5 verified project-record cards, found ${proofCards}`);
  }

  await detailPage.goto(`${base}/recruiter`, { waitUntil: "networkidle" });
  if (!await detailPage.locator("#product-role-panel").isVisible()) failures.push("recruiter roles: Product & UX should be open by default");
  if (await detailPage.locator("#frontend-role-panel").isVisible() || await detailPage.locator("#cybersecurity-role-panel").isVisible()) failures.push("recruiter roles: inactive panels should be hidden");
  await detailPage.getByRole("tab", { name:"Cybersecurity & Networks" }).click();
  if (!await detailPage.locator("#cybersecurity-role-panel").isVisible()) failures.push("recruiter roles: Cybersecurity & Networks panel did not open");
  if (new URL(detailPage.url()).searchParams.get("role") !== "cybersecurity") failures.push("recruiter roles: role selection was not reflected in the URL");
  await detailPage.goto(`${base}/recruiter?role=frontend`, { waitUntil: "networkidle" });
  if (!await detailPage.locator("#frontend-role-panel").isVisible()) failures.push("recruiter roles: URL-selected Frontend panel did not open");
  const recruiterPackLink = detailPage.getByRole("link", { name:"Open recruiter pack" });
  if (!await recruiterPackLink.isVisible()) failures.push("recruiter brief: primary link is missing");
  const recruiterPackHref = await recruiterPackLink.getAttribute("href");
  if (!recruiterPackHref?.endsWith("Yahya_ElSawi_Recruiter_Pack.pdf")) failures.push("recruiter brief: link does not target the generated PDF");

  await detailPage.goto(`${base}/resume`, { waitUntil: "networkidle" });
  if (await detailPage.locator("#resume-skills").isVisible() || await detailPage.locator("#resume-credentials").isVisible()) failures.push("resume tabs: detail panels should be hidden initially");
  await detailPage.getByRole("tab", { name:"Credentials by Category" }).click();
  const credentialPreviews = detailPage.locator("#resume-credentials .certificate picture");
  if (await credentialPreviews.count() !== 11) failures.push(`resume credentials: expected 11 previews, found ${await credentialPreviews.count()}`);
  await detailPage.waitForFunction(() => [...document.querySelectorAll("#resume-credentials .certificate img")].every(image => image.complete && image.naturalWidth > 0));
  await detailPage.getByRole("tab", { name:"Skills Reflected in the Work" }).click();
  if (!await detailPage.locator("#resume-skills").isVisible()) failures.push("resume tabs: skills panel did not open");

  await detailPage.goto(`${base}/terminal`, { waitUntil: "networkidle" });
  await detailPage.waitForFunction(() => document.querySelector("#ai-mode-indicator")?.textContent.trim() === "Offline / Prefilled answers");
  if (!await detailPage.locator("#ai-mode-indicator.is-offline").isVisible()) failures.push("terminal availability: offline fallback state was not shown");
  const terminalHeights = await detailPage.evaluate(() => ({
    terminal:document.querySelector(".ai-terminal")?.getBoundingClientRect().height || 0,
    sidebar:document.querySelector(".ai-sidebar")?.getBoundingClientRect().height || 0
  }));
  if (Math.abs(terminalHeights.terminal - terminalHeights.sidebar) > 2) failures.push(`terminal height: ${terminalHeights.terminal}px vs ${terminalHeights.sidebar}px`);
  await detailPage.route("**/api/chat", route => route.fulfill({ status:503, contentType:"application/json", body:JSON.stringify({ message:"AI binding unavailable" }) }));
  await detailPage.getByLabel("Ask about Yahya").fill("Is Yahya available to relocate?");
  await detailPage.getByRole("button", { name:"Ask Yahya'AI" }).click();
  await detailPage.waitForFunction(() => [...document.querySelectorAll(".ai-message-assistant .ai-message-body")].some(message => message.textContent.includes("open to remote work and relocation")));
  if (await detailPage.locator("#ai-request-status").innerText() !== "Local knowledge") failures.push("terminal fallback: local knowledge status was not shown");
  if (await detailPage.locator("#ai-mode-indicator").innerText() !== "Offline / Prefilled answers") failures.push("terminal fallback: availability tag did not stay offline");
  await detailPage.unroute("**/api/chat");

  await detailPage.route("**/api/contact", route => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify({ ok:true }) }));
  await detailPage.goto(`${base}/contact`, { waitUntil: "networkidle" });
  await detailPage.getByLabel("Your name").fill("Local Test");
  await detailPage.getByLabel("Email address").fill("local@example.com");
  await detailPage.getByLabel("Message", { exact:true }).fill("This is a local browser delivery test.");
  await detailPage.getByRole("button", { name:"Send message" }).click();
  await detailPage.waitForFunction(() => document.querySelector("#form-success")?.textContent.includes("Message sent"));
  const contactStatus = await detailPage.locator("#form-success").innerText();
  if (!contactStatus.includes("Message sent")) failures.push(`contact form: ${contactStatus}`);

  await detailPage.goto(`${base}/`, { waitUntil: "networkidle" });
  const featuredCards = detailPage.locator("#featured-projects .project-card");
  if (await featuredCards.count() !== 3) failures.push(`home projects: expected 3 featured cards, found ${await featuredCards.count()}`);
  const featuredTops = await featuredCards.evaluateAll(cards => cards.map(card => Math.round(card.getBoundingClientRect().top)));
  if (Math.max(...featuredTops) - Math.min(...featuredTops) > 2) failures.push(`home projects: cards are not on one desktop row (${featuredTops.join(", ")})`);
  const primaryButton = detailPage.locator(".btn-primary").first();
  const arrowBefore = await primaryButton.evaluate(node => getComputedStyle(node, "::after").opacity);
  await primaryButton.hover();
  await detailPage.waitForTimeout(220);
  const arrowAfter = await primaryButton.evaluate(node => getComputedStyle(node, "::after").opacity);
  if (arrowBefore !== "0" || Number(arrowAfter) < 0.9) failures.push(`button arrow: expected hover-only transition, got ${arrowBefore} to ${arrowAfter}`);
  const scrollTop = detailPage.getByRole("button", { name:"Go to the top of the page" });
  await detailPage.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await detailPage.waitForFunction(() => !document.querySelector(".scroll-top")?.hidden);
  const scrollTopPosition = await detailPage.evaluate(() => {
    const button = document.querySelector(".scroll-top");
    const footer = document.querySelector(".footer");
    const buttonBox = button.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    return {
      nestedInFooter:Boolean(button.closest("footer")),
      rightGap:innerWidth - buttonBox.right,
      footerClearance:footerBox.top - buttonBox.bottom
    };
  });
  if (scrollTopPosition.nestedInFooter) failures.push("scroll to top: control is nested inside the footer");
  if (scrollTopPosition.rightGap < 10 || scrollTopPosition.rightGap > 22) failures.push(`scroll to top: expected a right-side overlay, got ${scrollTopPosition.rightGap}px from the edge`);
  if (scrollTopPosition.footerClearance < 10) failures.push(`scroll to top: overlaps the footer by ${Math.abs(scrollTopPosition.footerClearance)}px`);
  await scrollTop.click();
  await detailPage.waitForFunction(() => scrollY <= 1);
  await detailPage.close();
  await detailContext.close();
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
