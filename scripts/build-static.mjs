import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const siteUrl = "https://yahya-elsawi-portfolio-bnj.pages.dev";
const personId = `${siteUrl}/#yahya-el-sawi`;

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
  "assets/logos",
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
  "assets/Pictures/head_shot.webp",
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

for (const relativePath of publicPaths) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  await assertNoSymlinks(source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
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
  description: "Dubai-based UI/UX designer and frontend developer with cybersecurity, database, and network automation experience.",
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

const projects = [
  { slug: "gift-it", name: "Gift It Checkout & E-Invite Redesign", description: "A production-informed UX case study covering checkout friction, trust, confirmation, and transactional communication." },
  { slug: "rit-app", name: "RIT Student App 2.0", description: "An academic mobile product proposal focused on unified student access, sign-in reliability, and notifications." },
  { slug: "passwordless", name: "Passwordless Login & Signup Redesign", description: "A mobile-first UX/UI design and handoff for a clearer passwordless authentication flow." },
  { slug: "vehicle-rental", name: "Vehicle Rental Operations Database", description: "An Oracle-backed academic operations system with relational design, access control, transactions, and reporting queries." },
  { slug: "mood-insights", name: "Mood Insights & Stress Alerts", description: "A non-clinical UX concept for daily check-ins, mood patterns, and reflective insights." },
  { slug: "network-automation", name: "SmartMall AI Network Automation", description: "An equal-contribution academic proof of concept for evidence-led network diagnosis, correction, and validation.", collaborative: true },
  { slug: "vr-neuroanatomy", name: "VR Neuroanatomy", description: "This is an ongoing research project. Further details cannot be disclosed at this stage." }
];
const orderedProjects = ["vr-neuroanatomy", "network-automation", "mood-insights", "rit-app", "gift-it", "passwordless", "vehicle-rental"]
  .map(slug => projects.find(project => project.slug === slug));
if (orderedProjects.some(project => !project)) throw new Error("Structured-data project order references an unknown project");

function projectSchema(project) {
  const url = `${siteUrl}/work/${project.slug}`;
  if (project.slug === "vr-neuroanatomy") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: project.name,
          description: project.description,
          url
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Work", item: `${siteUrl}/work` },
            { "@type": "ListItem", position: 3, name: project.name, item: url }
          ]
        }
      ]
    };
  }
  const work = {
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: project.name,
    description: project.description,
    url,
    inLanguage: "en",
    ...(project.collaborative ? { contributor: { "@id": personId } } : { author: { "@id": personId } })
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
          { "@type": "ListItem", position: 3, name: project.name, item: url }
        ]
      }
    ]
  };
}

await mkdir(path.join(output, "work"), { recursive:true });
await cp(path.join(root, "work.html"), path.join(output, "work", "index.html"));

for (const [sourcePath, routePath] of Object.entries(cleanRoutes)) {
  await copyCleanRoute(sourcePath, routePath);
}

for (const [sourcePath, routePath] of Object.entries(privateCleanRoutes)) {
  await copyPrivateLogRoute(sourcePath, routePath);
}

for (const [sourcePath, routePath] of Object.entries(projectRoutes)) {
  const destination = path.join(output, routePath);
  await mkdir(path.dirname(destination), { recursive:true });
  await cp(path.join(root, sourcePath), destination);
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
          name: project.name,
          url: `${siteUrl}/work/${project.slug}`
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
  structuredRoutes.set(`work/${project.slug}/index.html`, projectSchema(project));
}

for (const [routePath, data] of structuredRoutes) await injectStructuredData(routePath, data);

console.log(`Built ${htmlFiles.length} source pages, ${Object.keys(cleanRoutes).length + 1} public clean page routes, ${Object.keys(privateCleanRoutes).length} private clean page route, ${Object.keys(projectRoutes).length} project routes, ${structuredRoutes.size} structured-data documents, and public assets in ${path.relative(root, output)}/.`);
