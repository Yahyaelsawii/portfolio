import { readFile, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { projects } from "../data/projects.js";

const username = "Yahyaelsawii";
const headers = {
  accept: "application/vnd.github+json",
  "x-github-api-version": "2022-11-28",
  "user-agent": "Yahya-Portfolio-Public-Presence-Review"
};
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function getJson(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`Public GitHub API request failed (${response.status})`);
  return response.json();
}

const [baseline, profile, repos] = await Promise.all([
  readFile(new URL("../data/public-presence-baseline.json", import.meta.url), "utf8").then(JSON.parse),
  getJson(`https://api.github.com/users/${username}`),
  getJson(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
]);
if (profile.login !== baseline.profile.login || !Array.isArray(repos)) throw new Error("The public profile did not match the reviewed baseline account");

const candidates = [];
for (const field of ["name", "bio", "location", "company", "blog", "public_repos"]) {
  if ((profile[field] ?? null) !== (baseline.profile[field] ?? null)) {
    candidates.push({ status: "potential match; owner review required", source: `https://github.com/${username}`, subject: `Profile field changed: ${field}`, before: baseline.profile[field] ?? null, observed: profile[field] ?? null });
  }
}
const previousRepos = new Map(baseline.repositories.map(repo => [repo.name.toLowerCase(), repo]));
const currentRepos = new Map(repos.map(repo => [repo.name.toLowerCase(), repo]));
for (const [key, repo] of currentRepos) {
  const previous = previousRepos.get(key);
  if (!previous) {
    candidates.push({ status: "unconfirmed public repository; owner review required", source: repo.html_url, subject: `New public repository: ${repo.name}`, observed: { description: repo.description, homepage: repo.homepage, pushed_at: repo.pushed_at } });
    continue;
  }
  const changes = ["description", "homepage", "pushed_at"].filter(field => (repo[field] ?? null) !== (previous[field] ?? null));
  if (changes.length) candidates.push({ status: "potential match; contribution and relevance unverified", source: repo.html_url, subject: `Public repository changed: ${repo.name}`, changedFields: changes, observed: Object.fromEntries(changes.map(field => [field, repo[field] ?? null])) });
}
for (const [key, repo] of previousRepos) if (!currentRepos.has(key)) {
  candidates.push({ status: "possible removal or visibility change; confirm manually", source: repo.html_url, subject: `Repository no longer returned publicly: ${repo.name}` });
}

const sitemapResponse = await fetch("https://yahyaelsawi.website/sitemap.xml", { signal: AbortSignal.timeout(12_000) });
if (!sitemapResponse.ok) throw new Error(`Production sitemap request failed (${sitemapResponse.status})`);
const sitemap = await sitemapResponse.text();
for (const project of projects.filter(item => !item.locked)) {
  const canonicalUrl = `https://yahyaelsawi.website${project.url}`;
  if (!sitemap.includes(`<loc>${canonicalUrl}</loc>`)) {
    candidates.push({ status: "production discoverability issue; owner review required", source: "https://yahyaelsawi.website/sitemap.xml", subject: `Public project missing from production sitemap: ${project.title}`, expectedUrl: canonicalUrl });
  }
}

const approvedProjects = projects.filter(project => !project.locked);
const report = {
  generatedAt: new Date().toISOString(),
  knowledgeVersion: "2026-10-28.1",
  approvedProjectCount: approvedProjects.length,
  approvedProjects: approvedProjects.map(({ title, url, displayDate, status }) => ({ title, url: `https://yahyaelsawi.website${url}`, displayDate: displayDate || null, status: status || null })),
  sourcesChecked: ["GitHub public REST API profile and repositories", "Production sitemap and approved public project routes"],
  sourcesNotScraped: [{ source: "LinkedIn", reason: "No public API or authorized data access is configured; authenticated/restricted pages are not scraped." }],
  candidateCount: candidates.length,
  candidates,
  reviewBoundary: "This report is a review queue only. Public profile or repository changes are not verified career facts. Do not publish them or update Yahya'AI until Yahya approves a supported change and the approved source is merged."
};
const directory = process.env.RUNNER_TEMP || os.tmpdir();
await mkdir(directory, { recursive: true });
const jsonPath = path.join(directory, "portfolio-presence-review.json");
const markdownPath = path.join(directory, "portfolio-presence-review.md");
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
const markdown = [
  `# Monthly public-presence review`,
  `Generated: ${report.generatedAt}`,
  `Knowledge version: ${report.knowledgeVersion}`,
  `Approved public projects checked: ${report.approvedProjectCount}`,
  `Public-source candidates requiring owner review: ${report.candidateCount}`,
  "",
  "## Candidates",
  ...(candidates.length ? candidates.map(item => `- **${item.status}** — ${item.subject} (${item.source})`) : ["- No profile or repository changes were found against the reviewed snapshot."]),
  "",
  "## Review boundary",
  report.reviewBoundary,
  "",
  "LinkedIn was not scraped because no permitted public API or authorized access is configured."
].join("\n");
await writeFile(markdownPath, `${markdown}\n`);
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
console.log(`Wrote owner-review report with ${candidates.length} candidate(s): ${markdownPath}`);
