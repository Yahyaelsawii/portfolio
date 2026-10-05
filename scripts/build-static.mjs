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
  featuredProjects: '<div class="project-grid" id="featured-projects"></div>',
  allProjects: '<div class="project-grid" id="all-projects"></div>',
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

function renderProjectCard(project) {
  const category = `${project.category} ${project.tags.join(" ")}`.toLowerCase();
  const figmaLink = project.figmaUrl
    ? `<a class="text-link project-figma-link" href="${escapeHtml(project.figmaUrl)}" target="_blank" rel="noopener noreferrer">Open Figma file</a>`
    : "";
  return `<article class="project-card" data-category="${escapeHtml(category)}" data-project-url="${escapeHtml(project.url)}">
    <a class="project-art" href="${escapeHtml(project.url)}" aria-label="Open ${escapeHtml(project.title)} case study"><span class="project-number">${escapeHtml(project.number)} / ${escapeHtml(project.category)}</span>${project.locked ? '<span class="project-state project-state-locked">Locked</span>' : project.demo ? '<span class="project-state">Interactive</span>' : ""}<picture><source type="image/avif" srcset="/covers/${escapeHtml(project.cover)}-640.avif 640w, /covers/${escapeHtml(project.cover)}-960.avif 960w, /covers/${escapeHtml(project.cover)}-1440.avif 1440w" sizes="(max-width: 820px) 100vw, 50vw"><source type="image/webp" srcset="/covers/${escapeHtml(project.cover)}-640.webp 640w, /covers/${escapeHtml(project.cover)}-960.webp 960w, /covers/${escapeHtml(project.cover)}-1440.webp 1440w" sizes="(max-width: 820px) 100vw, 50vw"><img src="/covers/${escapeHtml(project.cover)}-960.webp" alt="${escapeHtml(project.title)} project cover" width="960" height="640" loading="lazy" decoding="async"></picture></a>
    <div class="project-body"><span class="eyebrow">${escapeHtml(project.client)}</span><h3><a href="${escapeHtml(project.url)}">${escapeHtml(project.title)}</a></h3><p>${escapeHtml(project.summary)}</p><div class="actions project-actions"><a class="text-link" data-project-link href="${escapeHtml(project.url)}">Open case study</a>${figmaLink}</div></div>
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
  return `<article class="story-block" id="section-${index + 1}"><span class="eyebrow">${String(index + 1).padStart(2, "0")} / Case study</span><h2>${escapeHtml(section.title)}</h2>${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}${facts}${cards}${columns}${images}</article>`;
}

function renderProjectDetail(project) {
  if (!project?.sections?.length) return "";
  const metadata = project.meta.map(([label, value]) => `<div class="meta"><small>${escapeHtml(label)}</small>${escapeHtml(value)}</div>`).join("");
  const verification = project.verification.map(([label, value]) => `<div class="project-proof-card"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const contents = project.sections.map((section, index) => `<a href="#section-${index + 1}">${String(index + 1).padStart(2, "0")} / ${escapeHtml(section.title)}</a>`).join("");
  const figmaButton = project.figmaUrl ? `<a class="btn btn-secondary" href="${escapeHtml(project.figmaUrl)}" target="_blank" rel="noopener noreferrer">Open Figma file</a>` : "";
  return `<section class="shell detail-hero"><div><span class="eyebrow">Case study ${escapeHtml(project.number)} / ${escapeHtml(project.client)}</span><h1>${escapeHtml(project.title)}</h1><p class="lead">${escapeHtml(project.summary)}</p>${project.note ? `<p class="scope-note">${escapeHtml(project.note)}</p>` : ""}${figmaButton ? `<div class="actions detail-actions">${figmaButton}</div>` : ""}<div class="meta-grid">${metadata}</div></div><div class="detail-visual"><picture><source type="image/avif" srcset="/covers/${escapeHtml(project.cover)}-640.avif 640w, /covers/${escapeHtml(project.cover)}-960.avif 960w, /covers/${escapeHtml(project.cover)}-1440.avif 1440w" sizes="(max-width: 820px) 100vw, 45vw"><source type="image/webp" srcset="/covers/${escapeHtml(project.cover)}-640.webp 640w, /covers/${escapeHtml(project.cover)}-960.webp 960w, /covers/${escapeHtml(project.cover)}-1440.webp 1440w" sizes="(max-width: 820px) 100vw, 45vw"><img src="${escapeHtml(project.image)}" data-full-src="/covers/${escapeHtml(project.cover)}-1440.webp" alt="${escapeHtml(project.title)} cover artwork" width="960" height="640" decoding="async"></picture></div></section>
  <section class="section project-proof"><div class="shell"><div class="section-head"><div><span class="eyebrow">Verified project record</span><h2>Evidence, scope, and outcome.</h2></div></div><dl class="project-proof-grid">${verification}</dl></div></section>
  <section class="section-soft"><div class="shell content-grid"><aside class="content-nav"><span class="eyebrow">Contents</span>${contents}<a href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya&#39;AI about this project</a><a href="/contact">Discuss this project</a></aside><div class="story">${project.sections.map(renderProjectSection).join("")}<article class="story-block next-project"><span class="eyebrow">More work</span><h2>Explore another project.</h2><div class="actions"><a class="btn btn-primary" href="/work?view=case-studies">All projects</a><a class="btn btn-secondary" href="/terminal?context=${encodeURIComponent(project.id)}">Ask Yahya&#39;AI</a></div></article></div></div></section>`;
}

function replaceBuildTarget(source, target, content, sourcePath) {
  if (!source.includes(target)) throw new Error(`Missing static-render target in ${sourcePath}`);
  const closingTag = target.startsWith("<main") ? "</main>" : "</div>";
  const openingTag = target.slice(0, -closingTag.length);
  return source.replace(target, `${openingTag}${content}${closingTag}`);
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
  "assets/pdfs",
  "assets/Pictures/credentials",
  "assets/Pictures/resume",
  "assets/Pictures/responsive",
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

const projectRoutes = {
  "gift-it.html": "work/gift-it/index.html",
  "rit-app.html": "work/rit-app/index.html",
  "passwordless.html": "work/passwordless/index.html",
  "vehicle-rental.html": "work/vehicle-rental/index.html",
  "mood-insights.html": "work/mood-insights/index.html",
  "vr-neuroanatomy.html": "work/vr-neuroanatomy/index.html",
  "network-automation.html": "work/network-automation/index.html"
};

const cleanRoutes = {
  "about.html": "about/index.html",
  "contact.html": "contact/index.html",
  "privacy.html": "privacy/index.html",
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
const workHtml = replaceBuildTarget(
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
  const source = await readFile(path.join(root, sourcePath), "utf8");
  const html = project.sections?.length
    ? replaceBuildTarget(source, buildTargets.projectDetail, renderProjectDetail(project), sourcePath)
    : source;
  for (const destinationPath of [sourcePath, routePath]) {
    const destination = path.join(output, destinationPath);
    await mkdir(path.dirname(destination), { recursive:true });
    await writeFile(destination, html);
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
