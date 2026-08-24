# Yahya'AI — Cloudflare setup

The production portfolio uses Cloudflare Pages, Pages Functions, Workers AI, D1, Access, and a scheduled retention Worker. It does not require an OpenAI API subscription and it does not train on visitor conversations.

## What is already built

- `/terminal.html`: public AI chat with recruiter-focused prompts and evidence links.
- Page-aware and recruiter modes passed from approved portfolio links; context never expands the public knowledge boundary.
- `/functions/api/chat.js`: server-side assistant endpoint using fast Llama 3.1 8B with IBM Granite 4.0 Micro as an automatic fallback.
- `/functions/api/contact.js`: validated, rate-limited contact delivery through Resend without opening the visitor's email application.
- `/functions/_shared/profile.js`: approved public knowledge base.
- `/schema.sql`: privacy-safe website and assistant analytics plus future monthly knowledge candidates.
- `/functions/api/health.js`: binding status without revealing secrets.
- `/admin/`: fail-closed two-tab dashboard for anonymous website activity and assistant performance.
- `/admin/log/`: private developer log covered by the same Cloudflare Access application.
- `/workers/retention.js`: daily D1 cleanup using the same retention policy as request-time cleanup.

The assistant answers only from the approved profile. Unknown facts are declined. Salary questions are redirected and flagged. Private/security questions are blocked before reaching the model.

## Connect the GitHub repository to Cloudflare Pages

1. In Cloudflare, open **Workers & Pages** and choose **Create application** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select `Yahyaelsawii/portfolio`.
3. Use `main` as the production branch.
4. Framework preset: **None**.
5. Build command: `npm run build`.
6. Build output directory: `dist`.
7. Deploy. Cloudflare will provide a free `pages.dev` address.

Use Git integration or `wrangler pages deploy dist`; never publish the repository root. Pages Functions in `/functions` are compiled with the Pages deployment.

## Enable privacy-first Web Analytics

Cloudflare Web Analytics is enabled for the production Pages project as of 20 August 2026. The dashboard injects its beacon on the next deployment; no analytics token or inline beacon belongs in this repository.

1. Open the Pages project → **Metrics**.
2. Confirm **Web Analytics is enabled**.
3. Keep `_headers` compatible with `https://static.cloudflareinsights.com` and the analytics connection endpoint.
4. Keep `privacy.html` synchronized with the enabled service.
5. After deployment, inspect the production document for Cloudflare's injected beacon and verify that analytics requests are not blocked by the CSP.

## Add Workers AI

1. Open the new Pages project → **Settings** → **Bindings**.
2. Add a **Workers AI** binding.
3. Set the variable name to exactly `AI`.
4. Save it for Production and Preview, then redeploy.

Workers AI currently includes a free daily allocation. If the allowance is exhausted, the public assistant will show a temporary-unavailable message instead of creating a bill.

## Add D1 privacy and abuse controls

D1 is required for the public assistant. The endpoint fails closed when logging, hashing, or atomic rate limiting is unavailable.

1. Open **Storage & Databases** → **D1 SQL Database** → **Create**.
2. Name it `yahya-portfolio-ai`.
3. Open its SQL console and execute the contents of `schema.sql`.
4. Return to the Pages project → **Settings** → **Bindings**.
5. Add a **D1 database** binding named exactly `DB`, selecting `yahya-portfolio-ai`.
6. Save for Production and Preview.

## Add the hashing secret

1. Open the Pages project → **Settings** → **Variables and Secrets**.
2. Add an encrypted secret named exactly `LOG_HASH_SECRET`.
3. Use a randomly generated value of at least 32 characters. Do not commit it to Git.
4. Save it for Production and Preview, then redeploy.

This secret creates one-way, rotating visitor and session hashes for abuse control and anonymous analytics. The database never stores raw IP addresses, device hostnames, user-agent strings, or exact live locations. Assistant records contain only the redacted question and answer, coarse Cloudflare country/region/city, timing, model, and review flag. Website records contain the public route, referrer domain, device category, browser family, and coarse Cloudflare location. Email addresses and phone-like values submitted in questions are redacted before logging; blocked private-topic wording is not saved.

The public assistant fails closed when D1, the hashing secret, or the atomic rate-limit table is unavailable. Apply `schema.sql` before deploying code that depends on a newer schema.

## Configure direct contact delivery

The contact form posts to the first-party `/api/contact` Pages Function. It validates same-origin requests and field lengths, uses a honeypot, rate limits by a one-way IP hash, and does not store message contents. When FormSubmit rejects Cloudflare's server-to-server delivery path, the validated browser retries the same approved FormSubmit endpoint directly and reports its result.

1. Verify a sending domain in Resend.
2. For Resend delivery, add an encrypted secret named `RESEND_API_KEY`.
3. For Resend delivery, set `CONTACT_FROM_EMAIL` to a sender on that verified domain, such as `Portfolio <portfolio@example.com>`.
4. Without Resend, keep `CONTACT_FORM_ENDPOINT` set to the approved V1 FormSubmit AJAX endpoint and activate that form from the owner email. The Cloudflare Function attempts delivery first; the browser fallback handles provider incompatibility only after a server-side failure.
5. Keep `ADMIN_EMAIL` set to the inbox that should receive portfolio messages.
6. Apply the current `schema.sql` so the `contact_rate_limits` table exists, then redeploy.

The endpoint fails closed with a user-facing retry message if neither delivery provider is configured, or if D1 or the hashing secret is unavailable.

## Deploy scheduled retention

`wrangler.retention.jsonc` defines `yahya-portfolio-retention`, a Worker that uses the production D1 binding and runs every day at 02:17 UTC. Request and dashboard activity also apply the same cleanup policy.

```bash
npx wrangler deploy --config wrangler.retention.jsonc
npx wrangler deployments list --config wrangler.retention.jsonc
```

The policy deletes detailed website visits and individual conversation records older than 90 days, and rate-limit windows older than one day. Keep `functions/_shared/retention.js`, `privacy.html`, and the Worker schedule synchronized.

## Verify the deployment

Run `npm ci` and `npm run check:release` before deployment. This validates HTML, JavaScript, local references, unit tests, the public-only artifact, responsive layouts, accessibility, and key interactions. Deploy `dist/`, never the repository root.

1. Visit `/api/health` on the canonical domain or `pages.dev` fallback. It should report `"ready": true`, `"ai": true`, `"contactDelivery": true`, `"logging": true`, `"privacyHashing": true`, `"atomicRateLimiting": true`, `"conversationRetentionDays": 90`, and `"scheduledRetention": true`.
2. Open `/terminal.html` and ask: `What kind of roles is Yahya looking for?`
3. Ask a salary question and confirm it is redirected with a flag.
4. Inspect D1 and confirm no raw IP or hostname column exists.

Pages observability is configured in the Cloudflare dashboard. Do not add the Worker-style `observability` block to `wrangler.jsonc`; current Wrangler releases reject it for Pages projects.

## Protect the private dashboard with Cloudflare Access

Cloudflare Access protects the private admin routes on the canonical `yahyaelsawi.website` host. The original `yahya-elsawi-portfolio-bnj.pages.dev` hostname remains available as the Cloudflare Pages service and fallback origin. The `Portfolio Admin` self-hosted application protects `/admin/*`, including `/admin/log/` and `/admin/api/*`, and its Allow policy accepts only `yahyaelsawi1@gmail.com`.

`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, and `ADMIN_EMAIL` are declared in `wrangler.jsonc`; they are application identifiers, not credentials. Keep the Access application destinations and audience synchronized with that file if the Pages hostname changes. After a relevant change, redeploy, confirm an unauthenticated request is redirected to Access, and authenticate at `/admin/` with the approved email.

The API validates the Access JWT issuer, audience, lifetime, RS256 signature, and exact email. Missing or invalid configuration fails closed. The dashboard never returns raw IP addresses, hostnames, visitor hashes, or complete session hashes. It shows only short anonymous session codes for grouping recent page views.

## How the AI improves safely

The public model must not rewrite its own knowledge. The private dashboard foundation is now present; a later monthly review workflow can search approved public sources and save suggestions in `knowledge_candidates` as `pending`. Nothing becomes public until Yahya approves it.

That approval workflow is the safe version of “forever learning”: continuous discovery, evidence attached to every suggestion, human approval, versioned publication, and easy rollback.

## Official references

- Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Workers AI models: https://developers.cloudflare.com/workers-ai/models/
- Llama 3.1 8B Instruct Fast: https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fast/
- Granite 4.0 H Micro: https://developers.cloudflare.com/workers-ai/models/granite-4.0-h-micro/
- Pages Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Pages Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Cloudflare Web Analytics setup: https://developers.cloudflare.com/web-analytics/get-started/
- Cloudflare Web Analytics collection: https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- D1 Worker binding API: https://developers.cloudflare.com/d1/worker-api/
- Cron Triggers: https://developers.cloudflare.com/workers/configuration/cron-triggers/
- Cloudflare Access self-hosted applications: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
- Cloudflare Access JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
