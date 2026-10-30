import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { featuredProjects, findProject, galleryImageDimensions, orderedProjects, projects } from "../data/projects.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const siteUrl = "https://yahyaelsawi.website";
const environment = process.env.PORTFOLIO_ENV || (process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== "main" ? "staging" : "production");
if (!["production", "staging"].includes(environment)) throw new Error("PORTFOLIO_ENV must be production or staging");
const personId = `${siteUrl}/#yahya-el-sawi`;
const buildTargets = Object.freeze({
  featuredProjects: '<section class="project-grid" id="featured-projects" aria-labelledby="featured-projects-heading" tabindex="0"></section>',
  allProjects: "<!-- PROJECTS_BUILD_TARGET -->",
  projectDetail: '<main id="project-detail"></main>'
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function makeProjectRouteAssetsRootRelative(html) {
  return html.replace(/\b(href|src|srcset)=(['"])(.*?)\2/gi, (match, attribute, quote, value) => {
    const toRoot = candidate => {
      const trimmed = candidate.trimStart();
      return /^[/#?]|^[a-z][a-z\d+.-]*:/i.test(trimmed) ? candidate : `/${candidate}`;
    };
    const rootedValue = attribute.toLowerCase() === "srcset"
      ? value.split(",").map(candidate => {
          const [url, ...descriptor] = candidate.trim().split(/\s+/);
          return [toRoot(url), ...descriptor].join(" ");
        }).join(", ")
      : toRoot(value);
    return `${attribute}=${quote}${rootedValue}${quote}`;
  });
}

function renderProjectCard(project) {
  const category = `${project.category} ${project.tags.join(" ")}`.toLowerCase();
  const date = project.displayDate ? `<span class="project-date">${escapeHtml(project.displayDate)}</span>` : "";
  const contribution = project.role ? `<span class="project-contribution">${escapeHtml(project.role)}</span>` : "";
  const status = project.featuredStatus ? `<span class="project-status">${escapeHtml(project.featuredStatus)}</span>` : "";
  const figmaLink = project.figmaUrl
    ? `<a class="text-link project-figma-link" href="${escapeHtml(project.figmaUrl)}" target="_blank" rel="noopener noreferrer">Open Figma file</a>`
    : "";
  const coverAlt = project.locked
    ? "Abstract cover artwork for the locked project; no project details are shown"
    : `Illustrative cover artwork for ${project.title}; not a project screenshot`;
  const art = `<picture><source type="image/avif" srcset="/covers/${escapeHtml(project.cover)}-640.avif 640w, /covers/${escapeHtml(project.cover)}-960.avif 960w, /covers/${escapeHtml(project.cover)}-1440.avif 1440w" sizes="(max-width: 760px) 84vw, (max-width: 980px) 42vw, 28vw"><source type="image/webp" srcset="/covers/${escapeHtml(project.cover)}-640.webp 640w, /covers/${escapeHtml(project.cover)}-960.webp 960w, /covers/${escapeHtml(project.cover)}-1440.webp 1440w" sizes="(max-width: 760px) 84vw, (max-width: 980px) 42vw, 28vw"><img src="/covers/${escapeHtml(project.cover)}-960.webp" alt="${escapeHtml(coverAlt)}" width="960" height="640" loading="lazy" decoding="async"></picture>`;
  return `<article class="project-card" data-category="${escapeHtml(category)}" data-project-url="${escapeHtml(project.url)}">
    <a class="project-art" href="${escapeHtml(project.url)}" aria-label="Open ${escapeHtml(project.title)} case study"><span class="project-number">${escapeHtml(project.number)} / ${escapeHtml(project.category)}</span>${project.locked ? '<span class="project-state project-state-locked">Locked</span>' : ""}${art}<span class="project-art-note" aria-hidden="true">Illustrative cover</span></a>
    <div class="project-body"><span class="eyebrow">${escapeHtml(project.client)} · ${escapeHtml(project.category)}</span><h3><a href="${escapeHtml(project.url)}">${escapeHtml(project.title)}</a></h3>${date}${contribution}${status}${project.demo ? '<span class="project-status">Interactive demo</span>' : ""}<p>${escapeHtml(project.summary)}</p><div class="actions project-actions"><a class="text-link" data-project-link href="${escapeHtml(project.url)}">Open case study</a>${figmaLink}</div></div>
  </article>`;
}

function renderGalleryImage(src, alt) {
  const filename = src.split("/").pop() || "";
  const stem = filename.replace(/\.[^.]+$/, "");
  const [width, height] = galleryImageDimensions[stem] || [1200, 900];
  const responsivePath = "/assets/Pictures/responsive/";
  const sizes = "(max-width: 760px) calc(100vw - 68px), (max-width: 1180px) 33vw, 360px";
  return `<figure><picture><source type="image/avif" srcset="${responsivePath}${escapeHtml(stem)}-480.avif 480w, ${responsivePath}${escapeHtml(stem)}-768.avif 768w, ${responsivePath}${escapeHtml(stem)}-1200.avif 1200w" sizes="${sizes}"><source type="image/webp" srcset="${responsivePath}${escapeHtml(stem)}-480.webp 480w, ${responsivePath}${escapeHtml(stem)}-768.webp 768w, ${responsivePath}${escapeHtml(stem)}-1200.webp 1200w" sizes="${sizes}"><img src="${responsivePath}${escapeHtml(stem)}-1200.webp" data-full-src="${responsivePath}${escapeHtml(stem)}-1200.webp" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"></picture><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
}

function renderProjectSection(section, index) {
  const facts = section.facts ? `<ul class="fact-list">${section.facts.map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>` : "";
  const cards = section.cards ? `<div class="insight-grid">${section.cards.map(([title, text]) => `<div class="insight"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`).join("")}</div>` : "";
  const columns = section.columns ? `<div class="metric-grid">${section.columns.map(([title, items]) => `<div class="metric"><h3>${escapeHtml(title)}</h3><ul>${items.split("|").map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`).join("")}</div>` : "";
  const images = section.images ? `<div class="gallery${section.cropDeviceFrame ? " gallery-screen-crop" : ""}">${section.images.map(([src, alt]) => renderGalleryImage(src, alt)).join("")}</div>` : "";
  const visual = renderProjectVisual(section.visual);
  return `<article class="story-block" id="section-${index + 1}"><span class="eyebrow">${String(index + 1).padStart(2, "0")} / Case study</span><h2>${escapeHtml(section.title)}</h2>${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}${visual}${facts}${cards}${columns}${images}</article>`;
}

function renderProjectVisual(type) {
  if (type === "app-store-gallery") return `<div class="app-store-gallery" aria-label="Current Giftit Cards App Store screenshots">${[1,2,3,4,5].map((number, index) => `<figure><img src="/assets/Pictures/app-store/giftit-app-0${number}.jpg" alt="Giftit Cards App Store screenshot ${number}" width="222" height="480" loading="lazy" decoding="async"><figcaption>App Store screenshot ${String(index + 1).padStart(2, "0")} · Published product</figcaption></figure>`).join("")}</div><p class="scope-note">Screenshots shown are from the live App Store listing and document the product experience, not work attributed solely to me.</p>`;
  if (type === "four-p") return `<div class="giftit-four-p" aria-label="Four-part market-entry mix"><div><b>01 · Place</b><span>Digital + potential partners</span></div><div><b>02 · Product</b><span>Localized gifting experience</span></div><div><b>03 · Price</b><span>Offers + competitive position</span></div><div><b>04 · Promotion</b><span>Social, search + seasonal ideas</span></div></div>`;
  if (type === "funnel") return `<ol class="giftit-funnel" aria-label="Promotional funnel"><li><span>Awareness</span></li><li><span>Interest</span></li><li><span>Desire</span></li><li><span>Action</span></li></ol>`;
  if (type === "storyboard") return `<div class="giftit-storyboard" aria-label="Conceptual storyboard, not generated footage">${[["01 · Together", "A welcoming iftar table; establish the feeling of gathering."], ["02 · Another view", "A quieter home faces a difficult evening."], ["03 · The pause", "A moment connects the two scenes with empathy."], ["04 · Shared giving", "Friends consider a gift they can contribute to together."], ["05 · One table", "The story closes on the message: Gifting for All."], ["06 · Invitation", "A gentle call to action introduces collective gifting."]].map(([title, copy]) => `<div class="giftit-story-frame"><span class="giftit-frame-art" aria-hidden="true">◌</span><b>${title}</b><span>${copy}</span></div>`).join("")}</div><p class="scope-note">Conceptual storyboard placeholders · 9:16 short-form direction</p>`;
  if (type === "email-journey") return `<ol class="giftit-email-journey" aria-label="Customer email journey">${[["01", "Account", "Verification"], ["02", "Order", "Confirmation"], ["03", "Gift", "Delivery + e-invite"], ["04", "Resolution", "Follow-up" ]].map(([n, title, copy]) => `<li><span>${n}</span><b>${title}</b><small>${copy}</small></li>`).join("")}</ol>`;
  if (type === "email-preview") return `<div class="giftit-email-preview"><div class="giftit-email-chrome"><i></i><i></i><i></i><span>Giftit · Order update</span></div><div class="giftit-email-content"><span class="eyebrow">A gift is on its way</span><h3>Your gift is ready.</h3><p>Hi [Recipient name], [Sender name] has sent you a Giftit gift. Your message and next steps are below.</p><a class="btn btn-primary" href="#section-3" aria-label="Illustrative email call to action">View your gift</a><small>Illustrative template preview · dynamic fields shown as placeholders</small></div></div>`;
  if (type === "rtl-comparison") return `<div class="giftit-locale-grid"><div><span class="eyebrow">English · LTR</span><div class="giftit-locale-card" dir="ltr"><b>Send a thoughtful gift</b><p>Choose a gift and add a personal message.</p><span class="giftit-locale-cta">Explore gifts →</span></div></div><div><span class="eyebrow">Arabic · RTL concept</span><div class="giftit-locale-card" dir="rtl" lang="ar"><b>أرسل هدية مميزة</b><p>اختر هدية وأضف رسالة شخصية.</p><span class="giftit-locale-cta">اكتشف الهدايا ←</span></div></div></div><p class="scope-note">Conceptual reconstruction for layout illustration · not a production screenshot</p>`;
  if (type === "store-listing") return `<div class="giftit-store-concept"><div class="giftit-app-icon" aria-hidden="true">G</div><div><span class="eyebrow">Store listing concept · Giftit Cards</span><h3>Digital gifts, made personal.</h3><p>Send a gift on your own or bring people together to give as a group. Recipients choose from a broad catalog of brands.</p><div class="tags"><span class="tag">Individual gifts</span><span class="tag">Group gifting</span><span class="tag">E-invites</span><span class="tag">Flexible choice</span></div></div></div>`;
  return "";
}

function renderProjectDetail(project) {
  if (!project?.sections?.length) return "";
  const metadata = project.meta.map(([label, value]) => `<div class="meta"><small>${escapeHtml(label)}</small>${escapeHtml(value)}</div>`).join("");
  const verification = project.verification.map(([label, value]) => `<div class="project-proof-card"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const contents = project.sections.map((section, index) => `<a href="#section-${index + 1}">${String(index + 1).padStart(2, "0")} / ${escapeHtml(section.title)}</a>`).join("");
  const figmaButton = project.figmaUrl ? `<a class="btn btn-secondary" href="${escapeHtml(project.figmaUrl)}" target="_blank" rel="noopener noreferrer">Open Figma file</a>` : "";
  const appStoreButton = project.appStoreUrl ? `<a class="btn btn-primary" href="${escapeHtml(project.appStoreUrl)}" target="_blank" rel="noopener noreferrer">View the live app on the App Store</a>` : "";
  const relatedIds = {
    "giftit-app-positioning": ["giftit-email-lifecycle", "network-automation"],
    "giftit-email-lifecycle": ["giftit-app-positioning", "gift-it"],
    "network-automation": ["vehicle-rental", "giftit-app-positioning"],
    "mood-insights": ["rit-app", "giftit-app-positioning"],
    "rit-app": ["mood-insights", "network-automation"]
  }[project.id] || [];
  const relatedLinks = relatedIds.map(id => {
    const related = projects.find(item => item.id === id);
    return related ? `<a class="text-link" href="${escapeHtml(related.url)}">${escapeHtml(related.title)} →</a>` : "";
  }).join("");
  const coverAlt = project.locked
    ? "Abstract cover artwork for the locked project; no project details are shown"
    : `Illustrative cover artwork for ${project.title}; case-study evidence appears below`;
  const detailImage = `<picture><source type="image/avif" srcset="/covers/${escapeHtml(project.cover)}-640.avif 640w, /covers/${escapeHtml(project.cover)}-960.avif 960w, /covers/${escapeHtml(project.cover)}-1440.avif 1440w" sizes="(max-width: 820px) 100vw, 45vw"><source type="image/webp" srcset="/covers/${escapeHtml(project.cover)}-640.webp 640w, /covers/${escapeHtml(project.cover)}-960.webp 960w, /covers/${escapeHtml(project.cover)}-1440.webp 1440w" sizes="(max-width: 820px) 100vw, 45vw"><img src="/covers/${escapeHtml(project.cover)}-960.webp" data-full-src="/covers/${escapeHtml(project.cover)}-1440.webp" alt="${escapeHtml(coverAlt)}" width="960" height="640" decoding="async"></picture><p class="cover-caption">Illustrative cover artwork · Project evidence appears below</p>`;
  const detailVisualClass = "detail-visual";
  return `<section class="shell detail-hero"><div><span class="eyebrow">Case study ${escapeHtml(project.number)} / ${escapeHtml(project.client)}</span><h1>${escapeHtml(project.title)}</h1><p class="lead">${escapeHtml(project.summary)}</p>${project.status ? `<p class="scope-note"><strong>Scope:</strong> ${escapeHtml(project.status)}</p>` : ""}${project.note ? `<p class="scope-note">${escapeHtml(project.note)}</p>` : ""}${figmaButton || appStoreButton ? `<div class="actions detail-actions">${appStoreButton}${figmaButton}</div>` : ""}<div class="meta-grid">${metadata}</div></div><div class="${detailVisualClass}">${detailImage}</div></section>
  <section class="section project-proof"><div class="shell"><div class="section-head"><div><span class="eyebrow">Verified project record</span><h2>Evidence, scope, and outcome.</h2></div></div><dl class="project-proof-grid">${verification}</dl></div></section>
  <section class="section-soft"><div class="shell content-grid"><aside class="content-nav"><span class="eyebrow">Contents</span>${contents}<a href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya&#39;AI about this project</a><a href="/contact">Discuss this project</a></aside><div class="story">${project.sections.map(renderProjectSection).join("")}<article class="story-block next-project"><span class="eyebrow">Related work</span><h2>Continue with connected projects.</h2><div class="related-project-links">${relatedLinks}</div><div class="actions"><a class="btn btn-primary" href="/work?view=case-studies">All projects</a><a class="btn btn-secondary" href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya&#39;AI</a></div></article></div></div></section>`;
}

function replaceBuildTarget(source, target, content, sourcePath) {
  if (!source.includes(target)) throw new Error(`Missing static-render target in ${sourcePath}`);
  const closingTag = target.startsWith("<main") ? "</main>" : target.startsWith("<section") ? "</section>" : "</div>";
  const openingTag = target.slice(0, -closingTag.length);
  return source.replace(target, `${openingTag}${content}${closingTag}`);
}

function replaceBuildMarker(source, marker, content, sourcePath) {
  const start = source.indexOf(marker);
  const endMarker = "<!-- PROJECTS_BUILD_TARGET_END -->";
  const end = source.indexOf(endMarker, start + marker.length);
  if (start < 0 || end < 0) throw new Error(`Missing static-render target in ${sourcePath}`);
  return `${source.slice(0, start)}${content}${source.slice(end + endMarker.length)}`;
}

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
  "index.html",
  "infrastructure.html",
  "privacy.html",
  "terms.html",
  "project.html",
  "recruiter.html",
  "resume.html",
  "terminal.html",
  "work.html"
];
const publicFiles = [
  ...htmlFiles,
  "_headers",
  "_redirects",
  "_routes.json",
  "admin-router.js",
  "dashboard.js",
  "main.js",
  "personalization.js",
  "redirect.js",
  "robots.txt",
  "sitemap.xml",
  "styles.css"
];
const publicPaths = [
  ...publicFiles,
  "admin",
  "assets/favicon",
  "assets/logos/gift-it-official.png",
  "assets/logos/starlink-infinigate.svg",
  "assets/logos/credo-official.png",
  "assets/pdfs",
  "assets/Pictures/credentials",
  "assets/Pictures/resume",
  "assets/Pictures/responsive",
  "assets/Pictures/app-store",
  "assets/Pictures/network-automation",
  "assets/Pictures/about-portrait-640.avif",
  "assets/Pictures/about-portrait-640.webp",
  "assets/Pictures/about-portrait-960.avif",
  "assets/Pictures/about-portrait-960.webp",
  "assets/Pictures/about-portrait-1440.avif",
  "assets/Pictures/about-portrait-1440.webp",
  "assets/Pictures/home-portrait-480.avif",
  "assets/Pictures/home-portrait-480.webp",
  "assets/Pictures/home-portrait-768.avif",
  "assets/Pictures/home-portrait-768.webp",
  "assets/Pictures/home-portrait-1200.avif",
  "assets/Pictures/home-portrait-1200.webp",
  "covers",
  "fonts",
  "output/pdf"
];

if (new Set(publicPaths).size !== publicPaths.length) throw new Error("Public build manifest contains duplicate paths");

async function assertNoSymlinks(source) {
  const details = await lstat(source);
  if (details.isSymbolicLink()) throw new Error(`Public build input cannot be a symbolic link: ${path.relative(root, source)}`);
  if (!details.isDirectory()) return;
  for (const entry of await readdir(source)) await assertNoSymlinks(path.join(source, entry));
}

async function copyWithRetry(source, destination, options = {}, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await cp(source, destination, options);
      return;
    } catch (error) {
      if (!["ECANCELED", "EBUSY", "EIO"].includes(error.code) || attempt === attempts) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt * 250));
    }
  }
}

for (const relativePath of publicPaths) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  await assertNoSymlinks(source);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyWithRetry(source, destination, { recursive: true });
}

// Finder-created numbered copies are local workspace artifacts, not site assets.
const appStoreAssets = path.join(output, "assets/Pictures/app-store");
for (const filename of await readdir(appStoreAssets)) {
  if (/ \d+\.(?:avif|jpe?g|png|webp)$/i.test(filename)) {
    await rm(path.join(appStoreAssets, filename));
  }
}

await mkdir(path.join(output, "vendor"), { recursive: true });
await copyWithRetry(path.join(root, "node_modules/lenis/dist/lenis.mjs"), path.join(output, "vendor/lenis.js"));

const projectRoutes = {
  "gift-it.html": "work/gift-it/index.html",
  "rit-app.html": "work/rit-app/index.html",
  "passwordless.html": "work/passwordless/index.html",
  "vehicle-rental.html": "work/vehicle-rental/index.html",
  "mood-insights.html": "work/mood-insights/index.html",
  "vr-neuroanatomy.html": "work/vr-neuroanatomy/index.html",
  "network-automation.html": "work/network-automation/index.html",
  "giftit-saudi-market-entry.html": "work/giftit-saudi-market-entry/index.html",
  "giftit-one-table.html": "work/giftit-one-table/index.html",
  "giftit-email-lifecycle.html": "work/giftit-email-lifecycle/index.html",
  "giftit-saudi-arabic.html": "work/giftit-saudi-arabic/index.html",
  "giftit-app-positioning.html": "work/giftit-app-positioning/index.html"
};

const cleanRoutes = {
  "about.html": "about/index.html",
  "contact.html": "contact/index.html",
  "privacy.html": "privacy/index.html",
  "terms.html": "terms/index.html",
  "recruiter.html": "recruiter/index.html",
  "resume.html": "resume/index.html",
  "terminal.html": "terminal/index.html"
};

const privateCleanRoutes = {
  "admin/log.html": "admin/log/index.html"
};

async function copyCleanRoute(sourcePath, routePath) {
  const destination = path.join(output, routePath);
  const source = await readFile(path.join(root, sourcePath), "utf8");
  const html = source.replace(/<head>/i, '<head><base href="/">');
  if (html === source) throw new Error(`Clean route source has no <head>: ${sourcePath}`);
  await mkdir(path.dirname(destination), { recursive:true });
  await writeFile(destination, html);
}

async function copyPrivateLogRoute(sourcePath, routePath) {
  const source = await readFile(path.join(root, sourcePath), "utf8");
  const html = source
    .replace('href="../styles.css', 'href="/styles.css')
    .replace('src="../admin-router.js', 'src="/admin-router.js')
    .replace('src="../main.js', 'src="/main.js')
    .replace('href="../assets/', 'href="/assets/')
    .replaceAll('href="index.html"', 'href="/admin/"')
    .replace('href="../index.html"', 'href="/"');
  if (html === source) throw new Error(`Private route source was not normalized: ${sourcePath}`);
  for (const destinationPath of [sourcePath, routePath]) {
    const destination = path.join(output, destinationPath);
    await mkdir(path.dirname(destination), { recursive:true });
    await writeFile(destination, html);
  }
}

async function injectStructuredData(routePath, data) {
  const destination = path.join(output, routePath);
  const source = await readFile(destination, "utf8");
  const script = `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  const html = source.replace(/<\/head>/i, `${script}</head>`);
  if (html === source) throw new Error(`Structured-data target has no </head>: ${routePath}`);
  await writeFile(destination, html);
}

async function unifyPublicFooters() {
  const footer = '<footer class="footer"><div class="shell footer-row"><span>© 2026 Yahya El-Sawi · Dubai, UAE</span><nav class="footer-links" aria-label="Footer"><a class="text-link" href="/">Home</a><a class="text-link" href="/work">Work</a><a class="text-link" href="/about">About</a><a class="text-link" href="/contact">Contact</a><a class="text-link" href="/privacy">Privacy Policy</a><a class="text-link" href="/terms">Terms and Conditions</a><button type="button" class="text-link privacy-choice-link" data-open-personalization>Cookie settings</button></nav></div></footer>';
  const walk = async directory => (await Promise.all((await readdir(directory, { withFileTypes:true })).map(async entry => {
    if (entry.name === "admin") return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }))).flat();
  for (const file of await walk(output)) {
    if (!file.endsWith(".html")) continue;
    const source = await readFile(file, "utf8");
    if (!/<footer\b[^>]*class="[^"]*\bfooter\b[^"]*"[^>]*>[\s\S]*?<\/footer>/i.test(source)) continue;
    await writeFile(file, source.replace(/<footer\b[^>]*class="[^"]*\bfooter\b[^"]*"[^>]*>[\s\S]*?<\/footer>/i, footer));
  }
}

async function addNativeSkipLinks() {
  const walk = async directory => (await Promise.all((await readdir(directory, { withFileTypes:true })).map(async entry => {
    if (entry.name === "admin") return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }))).flat();
  for (const file of await walk(output)) {
    if (!file.endsWith(".html")) continue;
    let html = await readFile(file, "utf8");
    const mainMatch = html.match(/<main\b([^>]*)>/i);
    if (!mainMatch) continue;
    const mainAttrs = mainMatch[1]
      .replace(/\s+id=(['"])[^'"]*\1/i, "")
      .replace(/\s+tabindex=(['"])[^'"]*\1/i, "");
    html = html.replace(mainMatch[0], `<main${mainAttrs} id="main-content" tabindex="-1">`);
    html = html.replace(/<body\b([^>]*)>/i, '<body$1><a class="skip-link" href="#main-content">Skip to main content</a>');
    if (!html.includes('class="skip-link"')) throw new Error(`Could not add a native skip link to ${path.relative(output, file)}`);
    await writeFile(file, html);
  }
}

const person = {
  "@type": "Person",
  "@id": personId,
  name: "Yahya El-Sawi",
  url: `${siteUrl}/about`,
  image: `${siteUrl}/assets/Pictures/about-portrait-960.webp`,
  description: "Dubai-based product and UX designer with a software development background and evidence across frontend, AI, cybersecurity, databases, XR, and network automation.",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Rochester Institute of Technology Dubai"
  },
  knowsLanguage: ["Arabic", "English"],
  sameAs: [
    "https://www.linkedin.com/in/yahya-el-sawi/",
    "https://github.com/Yahyaelsawii"
  ]
};

function projectSchema(project) {
  const url = `${siteUrl}${project.url}`;
  if (project.id === "vr-neuroanatomy") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: project.title,
          description: project.summary,
          url
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Work", item: `${siteUrl}/work` },
            { "@type": "ListItem", position: 3, name: project.title, item: url }
          ]
        }
      ]
    };
  }
  const work = {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: project.title,
    description: project.summary,
    url,
    inLanguage: "en",
    ...(project.id === "network-automation" ? { contributor: { "@id": personId } } : { author: { "@id": personId } })
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      work,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Work", item: `${siteUrl}/work` },
          { "@type": "ListItem", position: 3, name: project.title, item: url }
        ]
      }
    ]
  };
}

const homepageSource = await readFile(path.join(root, "index.html"), "utf8");
const homepageHtml = replaceBuildTarget(
  homepageSource,
  buildTargets.featuredProjects,
  featuredProjects.map(renderProjectCard).join(""),
  "index.html"
);
await writeFile(path.join(output, "index.html"), homepageHtml);

const workSource = await readFile(path.join(root, "work.html"), "utf8");
const workHtml = replaceBuildMarker(
  workSource,
  buildTargets.allProjects,
  orderedProjects.map(renderProjectCard).join(""),
  "work.html"
);
await writeFile(path.join(output, "work.html"), workHtml);
await mkdir(path.join(output, "work"), { recursive:true });
await writeFile(path.join(output, "work", "index.html"), workHtml);

for (const [sourcePath, routePath] of Object.entries(cleanRoutes)) {
  await copyCleanRoute(sourcePath, routePath);
}

for (const [sourcePath, routePath] of Object.entries(privateCleanRoutes)) {
  await copyPrivateLogRoute(sourcePath, routePath);
}

for (const [sourcePath, routePath] of Object.entries(projectRoutes)) {
  const project = findProject(path.basename(sourcePath, ".html"));
  if (!project) throw new Error(`Project route has no structured data: ${sourcePath}`);
  const templatePath = project.id.startsWith("giftit-") ? "gift-it.html" : sourcePath;
  let source = await readFile(path.join(root, templatePath), "utf8");
  if (project.id.startsWith("giftit-")) {
    const description = escapeHtml(project.summary);
    source = source.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(project.title)} — Yahya El-Sawi</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${siteUrl}${project.url}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(project.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${siteUrl}${project.url}">`)
      .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${siteUrl}/covers/${escapeHtml(project.cover)}-social.jpg">`)
      .replace(/<body data-project-id="[^"]*">/, `<body data-project-id="${project.id}">`);
  }
  const html = project.sections?.length
    ? replaceBuildTarget(source, buildTargets.projectDetail, renderProjectDetail(project), sourcePath)
    : source;
  for (const destinationPath of [sourcePath, routePath]) {
    const routeHtml = destinationPath === routePath ? makeProjectRouteAssetsRootRelative(html) : html;
    const destination = path.join(output, destinationPath);
    await mkdir(path.dirname(destination), { recursive:true });
    await writeFile(destination, routeHtml);
  }
}

const personGraph = {
  "@context": "https://schema.org",
  "@graph": [person]
};
const profilePageGraph = pageUrl => ({
  "@context": "https://schema.org",
  "@graph": [
    person,
    { "@type": "ProfilePage", mainEntity: { "@id": personId }, url: pageUrl, inLanguage: "en" }
  ]
});
const workGraph = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    {
      "@type": "CollectionPage",
      name: "Work — Yahya El-Sawi",
      url: `${siteUrl}/work`,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: orderedProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: `${siteUrl}${project.url}`
        }))
      }
    }
  ]
};

const structuredRoutes = new Map([
  ["index.html", {
    "@context": "https://schema.org",
    "@graph": [
      person,
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "Yahya El-Sawi Portfolio", url: siteUrl, inLanguage: "en", author: { "@id": personId } }
    ]
  }],
  ["about.html", profilePageGraph(`${siteUrl}/about`)],
  ["about/index.html", profilePageGraph(`${siteUrl}/about`)],
  ["recruiter.html", profilePageGraph(`${siteUrl}/recruiter`)],
  ["recruiter/index.html", profilePageGraph(`${siteUrl}/recruiter`)],
  ["resume.html", personGraph],
  ["resume/index.html", personGraph],
  ["work.html", workGraph],
  ["work/index.html", workGraph]
]);

for (const project of projects) {
  structuredRoutes.set(`work/${project.id}/index.html`, projectSchema(project));
}

for (const [routePath, data] of structuredRoutes) await injectStructuredData(routePath, data);

await unifyPublicFooters();
await addNativeSkipLinks();

if (environment === "staging") {
  const walk = async directory => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }))).flat();
  for (const file of await walk(output)) {
    if (!file.endsWith(".html")) continue;
    let html = await readFile(file, "utf8");
    html = html.replace(/<html\b/i, '<html data-environment="staging"');
    html = html.replace(/<head>/i, '<head><meta name="robots" content="noindex,nofollow,noarchive">');
    html = html.replace(/<body([^>]*)>/i, '<body$1><div class="staging-indicator" role="status">STAGING · PRIVATE PREVIEW</div>');
    await writeFile(file, html);
  }
  await writeFile(path.join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
  await writeFile(path.join(output, "_headers"), `${await readFile(path.join(output, "_headers"), "utf8")}\n/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n`);
}

console.log(`Built ${htmlFiles.length} source pages, ${Object.keys(cleanRoutes).length + 1} public clean page routes, ${Object.keys(privateCleanRoutes).length} private clean page route, ${Object.keys(projectRoutes).length} project routes, ${structuredRoutes.size} structured-data documents, and public assets in ${path.relative(root, output)}/.`);
