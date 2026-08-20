# Yahya AI — Cloudflare setup

This first release uses Cloudflare Pages, Pages Functions, Workers AI, and optional D1 logging. It does not require an OpenAI API subscription and it does not train on visitor conversations.

## What is already built

- `/terminal.html`: public AI chat with recruiter-focused prompts and evidence links.
- Page-aware and recruiter modes passed from approved portfolio links; context never expands the public knowledge boundary.
- `/functions/api/chat.js`: server-side assistant endpoint using fast Llama 3.1 8B with IBM Granite 4.0 Micro as an automatic fallback.
- `/functions/_shared/profile.js`: approved public knowledge base.
- `/schema.sql`: privacy-safe interaction logs and future monthly knowledge candidates.
- `/functions/api/health.js`: binding status without revealing secrets.
- `/admin/`: fail-closed private analytics dashboard for questions, coarse regions, flags, and response health.

The assistant answers only from the approved profile. Unknown facts are declined. Salary questions are redirected and flagged. Private/security questions are blocked before reaching the model.

## Connect the GitHub repository to Cloudflare Pages

1. In Cloudflare, open **Workers & Pages** and choose **Create application** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select `Yahyaelsawii/portfolio`.
3. Use `main` as the production branch.
4. Framework preset: **None**.
5. Build command: `exit 0`.
6. Build output directory: `.`.
7. Deploy. Cloudflare will provide a free `pages.dev` address.

Use Git integration rather than dashboard drag-and-drop. Pages Functions in the repository’s `/functions` directory are compiled during a Git deployment.

## Add Workers AI

1. Open the new Pages project → **Settings** → **Bindings**.
2. Add a **Workers AI** binding.
3. Set the variable name to exactly `AI`.
4. Save it for Production and Preview, then redeploy.

Workers AI currently includes a free daily allocation. If the allowance is exhausted, the public assistant will show a temporary-unavailable message instead of creating a bill.

## Add D1 interaction logging

Logging is optional: the assistant works with only the `AI` binding.

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

This secret creates one-way, rotating visitor and session hashes for abuse control. The database never stores raw IP addresses, device hostnames, user-agent strings, or exact live locations. It stores only the question, answer, coarse Cloudflare country/region/city, timing, model, and review flag. Email addresses and phone-like values submitted in questions are redacted before logging; blocked private-topic wording is not saved. Conversation records older than 90 days and rate-limit counters older than one day are deleted during service activity.

The public assistant fails closed when D1, the hashing secret, or the atomic rate-limit table is unavailable. Apply `schema.sql` before deploying code that depends on a newer schema.

## Verify the deployment

Run `npm run check` before deployment. It validates JavaScript, local references, policy tests, and creates the public-only `dist/` artifact. Deploy `dist/`, never the repository root.

1. Visit `/api/health` on the `pages.dev` site. It should report `"ai": true`, `"logging": true`, `"privacyHashing": true`, `"atomicRateLimiting": true`, and `"conversationRetentionDays": 90`.
2. Open `/terminal.html` and ask: `What kind of roles is Yahya looking for?`
3. Ask a salary question and confirm it is redirected with a flag.
4. Inspect D1 and confirm no raw IP or hostname column exists.

Pages observability is configured in the Cloudflare dashboard. Do not add the Worker-style `observability` block to `wrangler.jsonc`; current Wrangler releases reject it for Pages projects.

## Protect the private dashboard with Cloudflare Access

Cloudflare Access is configured for the production `pages.dev` host. The `Portfolio Admin` self-hosted application protects both `yahya-elsawi-portfolio-bnj.pages.dev/admin/*` and `yahya-elsawi-portfolio-bnj.pages.dev/api/admin/*`. Its Allow policy accepts only `yahyaelsawi1@gmail.com`.

`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`, and `ADMIN_EMAIL` are declared in `wrangler.jsonc`; they are application identifiers, not credentials. Keep the Access application destinations and audience synchronized with that file if the Pages hostname changes. After a relevant change, redeploy, confirm an unauthenticated request is redirected to Access, and authenticate at `/admin/` with the approved email.

The API validates the Access JWT issuer, audience, lifetime, RS256 signature, and exact email. Missing or invalid configuration fails closed. The dashboard never returns raw IP addresses, hostnames, visitor hashes, or session hashes.

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
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare Access self-hosted applications: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/
- Cloudflare Access JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
