# Portfolio Project Handoff

Last prepared: 17 August 2026

Repository: `https://github.com/Yahyaelsawii/portfolio`

Production branch: `main`

Feature baseline commit: `56e1828` (`Add flagship case studies and portfolio dashboard`)

This file is the continuation guide for Yahya El-Sawi, Codex, or any other AI/developer working on the portfolio from another computer. Read it before changing public facts, project attribution, AI behavior, analytics, Cloudflare configuration, or the locked VR page.

## 1. Executive state

- V1 is gone from the active website. The former V2 design is now the only main website.
- The current site is a static-first HTML/CSS/JavaScript portfolio with Cloudflare Pages Functions for the AI and private analytics API.
- The code is pushed to `main`. A local server at `127.0.0.1:4177` existed on the old PC, but that process is not portable and must be restarted on the new PC.
- The current public information architecture separates case studies from professional experience.
- Yahya AI is a real server-side Cloudflare Workers AI assistant grounded only in an approved profile. It is not a hard-coded fake terminal, although some safety-sensitive questions use deterministic policy replies.
- The SmartMall network-automation project is published as a full collaborative case study.
- VR Neuroanatomy has a public locked shell only. Its title and locked status are the only approved facts.
- The private AI dashboard is protected by Cloudflare Access on both its UI and API routes, with server-side JWT verification as a second layer.
- Monthly discovery, approval/rejection, Google Drive backup, and immediate email alerts are planned, not finished.
- AI conversations now have a published 90-day retention policy, activity-triggered deletion, atomic D1 rate limiting, and safer user-only history forwarding.
- The web resume is newer than the downloadable PDF CV. The PDF must be regenerated after StarLink details are finally verified.

## 2. Non-negotiable owner preferences

- Public name: **Yahya El-Sawi**.
- Design direction: modern, simple, clear, technical, and polished; avoid clutter and excessive sci-fi decoration.
- Recruiter clarity is more important than novelty.
- Terminal remains in the top navigation because Yahya explicitly asked to restore it.
- Costs should remain at zero wherever practical. Yahya does not want a paid API or SaaS bill beyond his existing ChatGPT Plus subscription.
- ChatGPT Plus does not include OpenAI API usage. The public site therefore uses Cloudflare Workers AI, not the OpenAI API.
- Do not add a paid service, usage-based API, domain purchase, or billing-enabled feature without explicit approval.
- Use best practices and stay legal. Do not collect raw IP addresses, hostnames, exact live locations, credentials, or unnecessary personal data.
- Any automatic AI “learning” must be approval-based. The public assistant must never rewrite its own knowledge.
- New facts must be found or supplied, shown to Yahya, and approved before they enter the public knowledge base.

## 3. What changed from V1

The earliest portfolio was retained temporarily as V1 while a Stitch-inspired redesign was developed as V2. Yahya later instructed that V1 be removed completely and V2 become the main website. Do not recreate a V1/V2 switch.

Major changes made during the redesign:

1. Promoted the modern V2 design to `index.html` and removed the V1 route/tab.
2. Repaired broken navigation, non-opening pages, alignment, responsive layout, and project-card overlay issues.
3. Migrated the useful content and project information from V1 into the current design.
4. Restored Terminal in the top navigation after it was accidentally removed.
5. Applied the newer restrained palette from the supplied design brief: off-white surfaces, dark slate text, teal accent, compact radii, and a subtle technical grid.
6. Added fast page-in/page-out transitions and motion with reduced-motion support.
7. Replaced repeated company/university logos with original project-specific artwork.
8. Added responsive AVIF/WebP images and `srcset` variants for covers, portraits, case-study screens, and SmartMall visuals.
9. Corrected the Vehicle Rental and Mood Insights main images and fixed the project-number/logo overlap across cards.
10. Restored all project pages and expanded their content while keeping design/implementation boundaries honest.
11. Grouped verified credentials into Education, Professional Development, Research Ethics & Compliance, and Challenges & Events.
12. Added four CITI certificates and expanded relevant research/compliance skills.
13. Added unique SEO titles, descriptions, canonical URLs, social images, `robots.txt`, `sitemap.xml`, security headers, a 404 page, and redirect compatibility pages.
14. Added a real Cloudflare Workers AI assistant, evidence links, loading bubbles, recruiter mode, page-aware context, logging, rate limiting, safety policies, and fallback models.
15. Added separate Professional Experience and Recruiter Quick View pages.
16. Added a public Developer Log and a private analytics dashboard foundation.
17. Added the locked VR Neuroanatomy shell with multiple independent disclosure protections.
18. Added StarLink cybersecurity training to professional experience and the approved knowledge base.
19. Turned the SmartMall network project into a full case study with optimized report visuals and an interactive recovery demonstration.

Useful history markers:

- `4ec5366` — promoted the redesigned portfolio.
- `0269a85` — merged the redesign into the default branch.
- `de972b3` — launched Yahya AI and expanded verified credentials.
- `56e1828` — added flagship case studies, StarLink experience, and the dashboard foundation.

If the exact old design must be inspected, use Git history. The current product direction is the post-V1 design.

Old-PC references that were used but are not committed:

- Stitch export/reference: `C:\Users\yahya\Downloads\stitch_modern_creative_ui_showcase\stitch_modern_creative_ui_showcase\`
- Palette/design brief: `C:\Users\yahya\Downloads\DESIGN.md`
- SmartMall source report: `C:\Users\yahya\Downloads\Final Project_Group4.docx`

The implemented design and optimized public assets are committed, so those first two references are not required to run the site. The SmartMall DOCX is required only if the next agent needs to re-audit the report against the public case study. No VR report or screenshots have been provided yet, and no StarLink certificate has been provided yet.

## 4. Current information architecture

### Primary pages

| Route/file | Purpose | Notes |
| --- | --- | --- |
| `/` / `index.html` | Main portfolio landing page | Product, frontend, XR, and network positioning; links to recruiter mode. |
| `/work` / `work.html` | Case-study index | Distinguishes published work, the locked VR project, and interactive SmartMall work. |
| `/experience` / `experience.html` | Professional employment/training | Gift It and StarLink; intentionally separate from academic/design case studies. |
| `/about` / `about.html` | Biography and working philosophy | Uses optimized portrait variants. |
| `/resume` / `resume.html` | Web resume, skills, grouped credentials | Links to the downloadable PDF CV, which currently needs a future refresh. |
| `/contact` / `contact.html` | Public contact details and mailto form | The form opens the visitor’s mail client; it is not a server-side form. |
| `/terminal` / `terminal.html` | Yahya AI chat | Supports general, recruiter, and page-context modes. |
| `/recruiter` / `recruiter.html` | 60-second recruiter view | Availability, mobility, evidence, and direct AI entry. |
| `/log` / `log.html` | Public developer log | Only approved, non-confidential updates. |
| `/admin/` | Private AI analytics | Must be protected with Cloudflare Access; API also verifies the Access JWT. |

### Project routes

| Project | Route | Public status | Attribution boundary |
| --- | --- | --- | --- |
| Gift It Checkout & E-Invite | `/gift-it` | Published | Product/UX work connected to professional Gift It experience. |
| RIT Student App 2.0 | `/rit-app` | Published | RIT project, dated September–December 2023. |
| Passwordless Login & Signup | `/passwordless` | Published | Yahya owned UX/UI and handoff specifications; do not imply production implementation. |
| Vehicle Rental Operations | `/vehicle-rental` | Published | Oracle/database and operations case study. |
| Mood Insights & Stress Alerts | `/mood-insights` | Published concept | UX/wellbeing concept; do not present simulated outcomes as measured clinical results. |
| SmartMall AI Network Automation | `/network-automation` | Published | Five-person collaborative RIT project; Yahya’s documented contribution was documentation and error handling. Team results must remain labeled as team results. |
| VR Neuroanatomy | `/vr-neuroanatomy` | Locked/noindex | Title and locked status only until written disclosure approval. |

Compatibility files `project.html`, `deep-scan.html`, and `infrastructure.html` redirect old links and are intentionally excluded from indexing.

### Navigation decision

Top navigation is Home, Work, About, Resume, Contact, and Terminal. Experience is reached through the Work split and recruiter page. This keeps the top bar compact while still separating employment from projects. If the navigation changes, retain recruiter clarity and mobile fit.

## 5. Design system and UI reasoning

The site should feel like a calm technical portfolio, not a game HUD.

Core tokens live at the top of `styles.css`:

- Main surface: `#f7f9fb`
- Main ink/primary: `#0f172a`
- Secondary slate: `#334155`
- Accent teal: `#38b2ac`
- Dark accent: `#226b68`
- Font pairing: local Plus Jakarta Sans + Space Mono
- Main content width: 1280px
- Small radii: 2–8px, not large bubbly cards
- Background: very light technical grid

Design principles used:

- Strong content hierarchy and whitespace.
- Evidence before decoration.
- One obvious action per section, with secondary actions visually quieter.
- Short, fast motion; avoid long cinematic transitions.
- Responsive images with explicit dimensions to reduce layout shift.
- Original covers instead of repeated logos or unapproved brand assets.
- Technical language is balanced by the portrait, biography, and public log.
- Interactive elements must teach something. The SmartMall demo explains failure/recovery instead of adding motion for its own sake.
- Accessibility basics include visible focus, semantic headings, keyboard-friendly controls, alt text, mobile navigation, and reduced-motion behavior.

Do not casually replace the palette, font system, spacing scale, or card geometry on one page. Update tokens and reusable components instead.

## 6. Approved public profile facts

The machine-readable source of truth is `functions/_shared/profile.js`. Public page copy and that profile must remain synchronized.

Approved identity and availability:

- Name: Yahya El-Sawi.
- Based in Dubai, UAE.
- Nationality: Egyptian.
- Languages: Arabic — native; English — native.
- Availability: as soon as needed.
- Open to remote work, relocation, and roles outside Dubai.
- UAE work authorization: self-sponsored Golden Visa.
- Public email: `yahyaelsawi1@gmail.com`.
- Public phone/WhatsApp: `+971 50 168 1229`.
- LinkedIn: `https://www.linkedin.com/in/yahya-elsawi/`.
- GitHub: `https://github.com/Yahyaelsawii`.
- Approved Instagram and Threads handle: `@ya7ya_sawii`.
- Approved X handle: `@yahya_sawii`. This approved X handle has not yet been added to the current profile/UI.
- No TikTok, YouTube, Facebook, Snapchat, Behance, or Dribbble account was approved for inclusion.

Positioning:

- UI/UX designer, frontend developer, product associate, and computing graduate.
- Target areas include UI/UX/product design, frontend/web development, software/product roles, and selected technical-system/network opportunities.
- Yahya previously asked that active role targeting follow LinkedIn, but no automatic LinkedIn sync exists. Any role update must be reviewed manually.

Salary policy:

- Never quote a salary or range.
- Redirect compensation discussion to Yahya once the role and responsibilities are clear.
- Log a salary flag for private review.
- “Immediate email alert” is not implemented yet; currently the flag appears in D1/private dashboard analytics.

## 7. Professional experience truth boundaries

### Gift It

- Started as an intern in May 2024 for three months, then transitioned to a full-time role.
- Current web representation: Software & Web Developer, May 2024–present.
- Approved high-level work includes production web features, UX, databases, testing, performance optimization, transactional emails, and product collaboration with the founder.

### StarLink, an Infinigate Group Company

- Portfolio title: Cybersecurity & IT Intern.
- Location: Dubai, UAE; on-site.
- Supplied dates: 9 June 2026–28 August 2026.
- The website explicitly says these dates are pending final certificate verification because earlier paperwork referenced a different start period.
- Part-time training, previously described as Monday–Friday, approximately 10:00–13:00.
- Approved high-level skills: Palo Alto/PAN-OS, Windows Server 2019, Active Directory, LDAP/LDAPS, SSL/TLS, Certificate Authority integration, firewall zones/policies, NAT, DHCP, DNS, routing, traffic/log analysis, Wireshark, VMware, Forcepoint DLP concepts, GlobalProtect exposure, and troubleshooting.
- Approved measurable lab validations: LDAP TCP 389, LDAPS TCP 636, client-to-internet traffic through security policy/NAT, and AD-based firewall administrator authentication.
- Do not invent business KPIs, percentages, revenue impact, ticket counts, or customer outcomes.
- Do not use the StarLink/Infinigate logo until explicit permission is confirmed.
- No StarLink work sample has been approved for public release.
- The known supervisor’s contact details and reference status are not public and must not be published.

StarLink confidentiality boundary: never publish internal/customer configurations, customer names or environments, real IP addresses, credentials, internal documents, architecture diagrams, procedures, cases, training material, email/communications, or screenshots containing company/customer data. Original isolated lab recreations may be used only when they contain no StarLink/customer confidential information and are clearly labeled as recreations.

## 8. SmartMall case-study source and attribution

Source report used on the old PC:

`C:\Users\yahya\Downloads\Final Project_Group4.docx`

That DOCX is not committed. Optimized public visuals extracted from the approved report are committed under `assets/Pictures/network-automation/`. The original file must be re-uploaded on the new PC if future source verification is required.

Approved framing:

- Title used publicly: SmartMall AI Network Automation.
- Original report framing: Secure Small Mall Automation System: An AI-Assisted Network Automation System.
- RIT Dubai, Network Design & Performance, Spring 2026.
- Five-person collaborative project; teammates approved public presentation.
- Yahya confirmed it was fully collaborative, while the report’s formal contribution table recorded Yahya at 16%, centered on documentation and error handling. The site resolves this honestly: the team designed/built collaboratively, Yahya’s documented contribution is stated, and group performance is labeled as team output.
- Fictional Bank, CoffeeShop, Carrefour, and IKEA names may remain.

Public system evidence:

- HTML/JavaScript/CSS presentation layer.
- Python automation, Netmiko, tenant/routing/correction/onboarding workflows.
- AI-assisted “Network Brain” in the report used Claude Sonnet API.
- GNS3 VM and Cisco router/switch proof of concept.
- Plain-English planning, dry-run/advisory/override/fix/deploy modes.
- Dynamic tenant onboarding/offboarding, routing planning, logs, reports, heartbeat/persistence, and closed-loop correction.
- Five trust zones/VLANs, router-on-a-stick, OSPF, ACLs, and QoS.
- Team validation improved ping checks from 7/10 before correction to 9/10 after correction; the report describes correction at about seven minutes.

Limitations that must remain honest:

- Small proof-of-concept topology.
- Full validation was slow; report described roughly five minutes and 15+ minute cycles.
- No concurrent onboarding.
- Reported model-call cost was approximately $0.50–$2 per prompt in that project context.
- ACL output could vary.
- IPv4 and Cisco only; no RBAC, WAN/multisite, or production deployment claim.

The interactive website topology is a simplified explanatory demo. It is not the original network, a live controller, or proof that the public website can configure infrastructure.

## 9. VR Neuroanatomy embargo

This is the strictest content rule in the project.

Approved public facts:

- Project title: VR Neuroanatomy.
- Status: locked pending written disclosure approval.

Everything else is non-public. Do not reveal, infer, confirm, deny, reconstruct, hint at, or encode:

- Methods or research design.
- Technologies, architecture, code, or interfaces.
- Screenshots or simulated screenshots.
- Collaborators, participants, testing, recruitment, or study procedure.
- Results, findings, hypotheses, paper status, publication venue, or timeline.
- Details derived indirectly from Yahya’s generic XR skills.

Current protections:

- Locked page contains only a neutral abstract lock/capsule cover.
- `noindex,nofollow,noarchive` meta tag.
- `robots.txt` disallow.
- `X-Robots-Tag` and no-store headers in `_headers`.
- Omitted from `sitemap.xml`.
- Deterministic block in `functions/api/chat.js`.
- System-prompt rule and profile privacy boundary.

Unlock checklist after written clearance:

1. Record exactly what content is approved.
2. Build the case study from approved report/screens only.
3. Have Yahya approve every public claim and image.
4. Remove the AI deterministic embargo only to the approved scope.
5. Update `profile.js`, work data, metadata, sitemap, robots, and headers together.
6. Add canonical/OG metadata and test search visibility.
7. Keep any still-confidential methods/results blocked.

Do not “temporarily” expose content for testing on a public preview URL.

## 10. Credentials and resume

The resume page groups 10 verified records:

- Education: RIT BSc in Computing and Information Technologies, May 2026.
- Professional development: Software Design: Modeling with UML; Business Analysis & Process Management; My Marketing Experience Business Simulation; Odoo Technical Bootcamp.
- Research ethics/compliance: four CITI certificates for minimal-risk student research, social/behavioral research, export compliance, and research security.
- Challenge/event: RIT Dubai and ZainTECH Data Challenge.

Certificate PDFs are committed under `assets/pdfs/` with safe filenames. The four supplied CITI files were copied into that folder and are already linked.

Important gap: `resume.html` has StarLink/network/cybersecurity skills, but `assets/pdfs/Yahya_ElSawi_CV.pdf` has not been regenerated to include the latest StarLink and SmartMall updates. Do not continue calling it fully current after major content changes without updating the PDF.

The StarLink certificate has not been supplied. When received, verify the exact title and dates, add it to the appropriate credential category, update the record count, update the PDF CV, and remove the date caveat only if the certificate resolves it.

## 11. Yahya AI architecture

Relevant files:

- `terminal.html` — public interface.
- `main.js` — chat UI, session/history behavior, loading bubble, context/mode handling, and approved source cards.
- `functions/api/chat.js` — server-side validation, policy checks, Workers AI call, fallbacks, logging, redaction, and rate limiting.
- `functions/_shared/profile.js` — approved knowledge and evidence-source registry.
- `functions/api/health.js` — safe binding/knowledge-version status.
- `schema.sql` — D1 tables.

Models:

1. `@cf/meta/llama-3.1-8b-instruct-fast`
2. `@cf/ibm-granite/granite-4.0-h-micro` fallback

Behavior:

- Answers only from the approved serialized profile.
- Says it does not know when a fact is absent.
- Replies in the visitor’s language; Arabic and English are expected.
- Recruiter mode prioritizes role fit, evidence, availability, and a next step.
- Page context prioritizes approved facts but never expands the public boundary.
- Evidence links are attached by the application, not invented by the model.
- Salary, VR embargo, and private-topic requests are handled before the model call.
- Same-origin requests only; JSON body limit 16 KB; message limit 800 characters; up to eight history messages.
- Low-temperature responses, maximum 500 tokens.
- Rate limit is an atomic six questions/minute per daily privacy-hashed visitor. The assistant fails closed if D1, hashing, or the rate-limit table is unavailable.
- Email addresses and phone-like content in visitor questions are redacted from logs.
- Blocked private-topic wording is stored only as `[blocked private-topic request]`.
- Client-supplied assistant-role history is discarded before model calls.
- Availability, target-role, and contact questions have deterministic approved fallbacks that do not require a model call.

Known reliability note: the most recent local AI test before the feature push received Cloudflare Workers AI error code 1031 from both models and correctly returned a temporary-unavailable response. Earlier calls worked. Treat this as an unverified transient/platform issue until production is tested again.

Immediate AI reliability improvement: add deterministic, source-grounded fallback answers for the highest-value recruiter questions (availability, role fit, contact, languages, visa, core projects, StarLink boundary) so the terminal remains useful when Workers AI is unavailable. Do not fake a generative answer.

## 12. Privacy-safe analytics and dashboard

The original idea included raw IPs, locations, and hostnames. That was intentionally narrowed for legality, privacy, and data minimization.

Current logging stores:

- Question and answer.
- Response time, model, flag, knowledge version, and timestamp.
- Coarse Cloudflare country/region/city when available.
- HMAC session hash.
- Daily rotating HMAC visitor hash derived from IP without storing the IP.

It does **not** store:

- Raw IP addresses.
- Device hostnames or reverse-DNS data.
- Exact live location or GPS.
- Raw user-agent strings.
- Credentials or private-topic wording.

The hashing secret must be at least 32 random characters and must never be committed.

Dashboard implementation:

- `/admin/` UI in `admin/index.html` and `dashboard.js`.
- `/api/admin/analytics` returns 30-day summary, flags, daily volume, coarse regions, and 50 recent conversations.
- `functions/_shared/access.js` verifies Cloudflare Access JWT algorithm, issuer, audience, lifetime, signature, and exact approved email.
- Approved dashboard email: `yahyaelsawi1@gmail.com`.
- Missing Access configuration fails closed.
- API never returns raw/session/visitor hashes.

Still missing:

- Approve/reject UI for `knowledge_candidates`.
- Log review notes/actions.
- Owner-triggered delete/export controls. Automatic 90-day conversation expiry is implemented during service activity.
- Salary/private flag email notifications.
- Monthly discovery job.
- Google Drive backup/export.
- A dashboard link to the public privacy notice.

The public `privacy.html` notice sets a 90-day limit for individual conversation records. Keep the notice, implementation, and any future retention-policy changes synchronized.

## 13. “Forever learning” plan

The intended system is continuous discovery with human approval, not self-training.

Planned lifecycle:

1. On the first of each month, collect candidate changes only from allowed public sources.
2. Save the proposed fact, source URL/title, short evidence, and discovery time as `pending` in `knowledge_candidates`.
3. Show pending candidates in the owner-only dashboard.
4. Yahya approves, edits, or rejects each item.
5. Only approved facts are versioned into the public knowledge file/database.
6. Keep a changelog and rollback path.
7. Never learn from visitor claims or publish facts merely because the model found them.

The schema table exists, but steps 1 and 3–6 are not implemented.

Because the project must remain free, do not promise an unlimited autonomous web crawl. A safe free MVP is an owner-triggered or Codex-scheduled monthly research task that prepares candidates, followed by manual approval. If automation later requires paid search/API usage, stop and ask.

Proposed Google Drive folder structure after one-time authorization:

- `Yahya Portfolio AI/01 Approved Knowledge`
- `Yahya Portfolio AI/02 Pending Review`
- `Yahya Portfolio AI/03 Evidence Sources`
- `Yahya Portfolio AI/04 Monthly Reports`
- `Yahya Portfolio AI/05 Analytics Backups`
- `Yahya Portfolio AI/06 Versions and Rollback`

Google Drive is not connected in the codebase and no Drive folder has been created yet.

## 14. Cloudflare production setup

Hosting target: free Cloudflare Pages `pages.dev` address; no custom domain exists.

Current expected canonical host: `https://yahya-elsawi-portfolio-bnj.pages.dev`.

Bindings in `wrangler.jsonc`:

- Workers AI binding: `AI` with remote inference for local development.
- D1 binding: `DB`, database `yahya-portfolio-ai`.
- Public variable: `ADMIN_EMAIL=yahyaelsawi1@gmail.com`.
- Public variable: `ACCESS_TEAM_DOMAIN=https://shrill-union-7062.cloudflareaccess.com`.
- Public variable: `ACCESS_AUD=e17cd74598693da30a1ca2626decf344550f59c0f7cebd2cf8b54fda3e9ba1ca`.
- Pages observability must be configured in Cloudflare rather than in `wrangler.jsonc`; Wrangler rejects the Worker-style `observability` block for Pages projects.

Secret that must exist in Cloudflare and never in Git:

- `LOG_HASH_SECRET`

The `Portfolio Admin` Cloudflare Access application protects both:

- `yahya-elsawi-portfolio-bnj.pages.dev/admin/*`
- `yahya-elsawi-portfolio-bnj.pages.dev/api/admin/*`

The `Portfolio owner` Allow policy accepts only `yahyaelsawi1@gmail.com`. The application ID is `081f1274-a7bd-4d5b-ada6-b542dae4f4e6`.

Production verification after every relevant deploy:

1. Confirm the Pages deployment built from the intended `main` commit.
2. Open `/api/health`; expect `ai: true`, `logging: true`, and `privacyHashing: true`.
3. Ask normal, Arabic, recruiter, salary, private, and VR questions.
4. Confirm salary/private flags in D1/dashboard.
5. Confirm Access blocks both admin UI and API for non-approved visitors.
6. Confirm no raw IP/hostname columns or API output exist.

The hardened build was deployed and its public routes, private-file exclusions, security headers, health endpoint, AI policy behavior, D1 logging, and unauthenticated Access redirects were verified on production.

If a custom domain is added later, replace the hard-coded canonical URLs, Open Graph URLs, `robots.txt` sitemap URL, and `sitemap.xml` locations globally.

## 15. New-PC setup

Prerequisites:

- Git.
- Node.js.
- GitHub authentication for `Yahyaelsawii`.
- Cloudflare/Wrangler authentication if local Pages Functions or deployment management is needed.

Clone and inspect:

```powershell
git clone https://github.com/Yahyaelsawii/portfolio.git
cd portfolio
git status -sb
git log -3 --oneline
```

Create `.dev.vars` from `.dev.vars.example`; use a new local random `LOG_HASH_SECRET`. Access variables are optional for public-page development, but the dashboard should fail closed without them. Never commit `.dev.vars`.

Initialize local D1 when needed:

```powershell
npx wrangler d1 execute yahya-portfolio-ai --local --file=schema.sql
```

Start local Pages and Functions:

```powershell
npm run build
npx wrangler pages dev dist --port 4177
```

Then open:

- `http://127.0.0.1:4177/`
- `http://127.0.0.1:4177/terminal.html`
- `http://127.0.0.1:4177/api/health`

The dependency-free `npm run build` command creates an explicit `dist/` artifact containing only public pages and assets. Cloudflare serves `dist/` and compiles `/functions` separately. Do not deploy the repository root because operational documents, tests, and schema files are not public assets.

## 16. Source-of-truth file map

| File/location | Responsibility |
| --- | --- |
| `main.js` | Project catalog/content for five standard case studies, UI behavior, transitions, terminal UI, filters, and interactive elements. |
| `styles.css` | Entire design system, responsive layout, animation, dashboard, case-study, and component styles. |
| `network-automation.html` | Standalone SmartMall narrative and figures. |
| `vr-neuroanatomy.html` | Embargo-safe locked shell only. |
| `experience.html` | Gift It and StarLink professional experience. |
| `resume.html` | Web skills and grouped credentials. |
| `functions/_shared/profile.js` | Public AI knowledge and approved evidence links. |
| `functions/api/chat.js` | AI/security/logging behavior. |
| `schema.sql` | D1 logging and future knowledge candidates. |
| `functions/_shared/access.js` | Cloudflare Access JWT validation. |
| `functions/api/admin/analytics.js` | Private analytics read API. |
| `admin/index.html`, `dashboard.js` | Private dashboard UI. |
| `wrangler.jsonc` | Cloudflare bindings and observability. |
| `_headers`, `_routes.json` | Security/cache headers and Functions routing. |
| `robots.txt`, `sitemap.xml` | Search visibility. |
| `AI_SETUP.md` | Operational Cloudflare setup guide. |
| `covers/` | Unique responsive project cover art and social images. |
| `assets/Pictures/responsive/` | Existing case-study responsive image variants. |
| `assets/Pictures/network-automation/` | SmartMall report-derived optimized visuals. |
| `assets/pdfs/` | Public CV and verified certificates. |

When changing a standard case study, update both its HTML metadata and its content entry in `main.js`. SmartMall and VR are standalone pages and need direct HTML edits. When changing any public fact, also update `profile.js` so Yahya AI does not contradict the website.

## 17. Verification already completed

Before feature commit `56e1828`:

- Static audit: 21 pages, zero errors, zero warnings.
- JavaScript syntax checks passed.
- Cloudflare Pages Functions compiled successfully.
- `git diff --check` passed.
- Desktop and 390px mobile checks passed without horizontal overflow.
- Network interactive demo reached healthy “Recovery verified” state.
- Responsive SmartMall AVIF assets loaded correctly after lazy loading.
- Experience and SmartMall pages had no browser console errors.
- VR page remained locked and excluded from indexing.
- Staged snapshot was scanned for obvious secret patterns before push.

These checks do not replace a production Lighthouse/network/security test.

## 18. Immediate improvements in priority order

### P0 — verify and protect production

1. Confirm Cloudflare deployed commit `56e1828` or later from `main`.
2. Verify `/api/health` reports AI, D1 logging, and privacy hashing correctly.
3. Re-test authorized admin access after any Access policy, audience, hostname, or identity-provider change.
4. Retest Workers AI after the earlier 1031 errors and inspect Cloudflare logs.
5. Confirm production D1 has the current `schema.sql` tables/indexes.
6. Verify the public AI/privacy notice and 90-day cleanup behavior in production.

### P1 — truth and recruiter consistency

1. Obtain StarLink’s final certificate/HR record and verify exact dates/title.
2. Regenerate `Yahya_ElSawi_CV.pdf` with StarLink, SmartMall, and cybersecurity skills.
3. Add the StarLink certificate to the grouped credentials if approved.
4. Add the approved X handle to `profile.js` and optionally the contact UI.
5. Review every project outcome and replace aspirational wording with measured evidence wherever new evidence exists.
6. Update sitemap `lastmod` dates when content is republished.

### P1 — AI resilience and owner controls

1. Expand deterministic curated fallback answers only when a high-value approved question repeatedly fails.
2. Build dashboard review actions, notes, export, and deletion.
3. Implement `knowledge_candidates` listing and approve/reject workflow.
4. Add salary/privacy flag notification only through a free, approved method.
5. Add rate-limit/abuse observability and ensure the site fails without generating a bill when free AI allocation is exhausted.

### P2 — performance and accessibility

1. Run Lighthouse on production and target 90+ Performance, Accessibility, Best Practices, and SEO.
2. Measure LCP, CLS, INP, image weight, cache headers, and Pages Function latency.
3. Run keyboard-only and screen-reader spot checks on nav, terminal, demo, filters, forms, and dashboard.
4. Test at 320, 390, 768, 1024, 1440, and ultrawide widths.
5. Validate social cards and convert remaining relative OG image URLs to absolute URLs if validators report issues.
6. Check the mailto contact experience and clearly label that it opens an email app.

### P2 — high-value “wow” improvements

1. Deepen the SmartMall interactive demonstration with an explainable event timeline, planned diff, validation evidence, and recovery state—still clearly simulated.
2. Add a recruiter evidence trail: claim → project proof → exact contribution → contact action.
3. Add subtle context-aware Terminal suggestions per case study.
4. Add safe original StarLink visuals only from Yahya’s isolated recreation lab and only after content review.
5. Use an abstract, non-informative lock animation on VR only if it reveals no project clues.
6. Add verified impact metrics to projects once evidence exists; metrics are more valuable than decorative animation.

### P3 — approved monthly learning and backups

1. Implement the owner-reviewed monthly candidate workflow.
2. Connect a dedicated Google Drive folder after one-time authorization.
3. Export monthly approved knowledge, review decisions, and privacy-safe analytics summaries.
4. Add versioned knowledge publication and rollback.

## 19. Safe change workflow for the next agent

For every new fact or project update:

1. Inspect the source evidence.
2. Separate public facts from private/confidential material.
3. Identify whether work is individual, collaborative, design-only, implemented, simulated, or measured.
4. Show proposed facts/wording to Yahya for approval when they change the public record.
5. Update page copy, project data, AI profile, metadata, and navigation/search files together.
6. Generate optimized responsive assets without committing confidential sources.
7. Run static link/content audit, JavaScript syntax checks, local Pages Functions compilation, desktop/mobile browser tests, AI policy tests, and `git diff --check`.
8. Review staged files for secrets and unrelated changes.
9. Commit intentionally and push only the requested branch.
10. Verify the production deployment rather than assuming Git push equals a successful release.

Do not:

- Reintroduce V1 or a V1/V2 tab.
- Unlock VR without written approval.
- Claim sole ownership of SmartMall.
- Claim Passwordless was implemented in production.
- Publish StarLink/customer artifacts or supervisor contact details.
- Invent outcomes, business metrics, dates, grades, or references.
- Store raw IPs/hostnames or show visitor/session hashes.
- Put API keys or Access secrets in Git.
- Let the AI self-edit its knowledge.
- Add paid services without approval.

## 20. Decision framework (“way of thinking”)

This is the practical reasoning framework used on the project. It is not private model chain-of-thought; it is the decision record another agent should follow.

1. **Truth before presentation.** A smaller honest claim is stronger than an impressive unverified claim.
2. **Recruiter scan first.** Within 60 seconds a visitor should understand Yahya’s role, evidence, availability, and how to contact him.
3. **Separate kinds of proof.** Employment, academic collaboration, design concepts, implemented systems, and research under embargo must not blur together.
4. **Progressive disclosure.** The index summarizes; case studies explain; recruiter mode compresses; AI answers follow-up questions with evidence.
5. **Privacy by design.** Collect the minimum required, hash identifiers, use coarse location, fail closed, and never expose logs publicly.
6. **Human-approved AI.** Retrieval is limited to curated facts, unknowns are admitted, sensitive categories are deterministic, and new facts require owner approval.
7. **Static-first reliability.** The portfolio remains useful if AI is down. Cloudflare Functions enhance it rather than owning all navigation/content.
8. **Performance is part of design.** Local fonts, AVIF/WebP variants, responsive sources, explicit dimensions, and short animations support usability.
9. **Original visual identity.** Project-specific art is preferable to repeated logos, especially when logo permission is unknown.
10. **Interactive elements need a job.** Motion and demos should clarify a system, disclose state, or guide action.
11. **Free-tier discipline.** Prefer Cloudflare’s free capabilities and graceful limits. No surprise charges.
12. **Security is layered.** UI hiding is never authentication; Access protects routes and server code verifies tokens again.

## 21. Best first task on the new PC

Start with production verification and private-dashboard setup, not another redesign:

1. Clone `main` and read this file plus `AI_SETUP.md`.
2. Check the Cloudflare deployment and `/api/health`.
3. Keep Cloudflare Access protection for `/admin/*` and `/api/admin/*` synchronized with the configured Pages hostname.
4. Retest normal and policy AI questions.
5. Add the privacy/retention notice.
6. Then update the CV and StarLink record when the official certificate is available.

After those items, the highest-value product work is the approval-based monthly knowledge dashboard, followed by a deeper SmartMall interactive demo. VR remains locked until written clearance.
