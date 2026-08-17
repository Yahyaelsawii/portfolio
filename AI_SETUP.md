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

This secret creates one-way, rotating visitor and session hashes for abuse control. The database never stores raw IP addresses, device hostnames, user-agent strings, or exact live locations. It stores only the question, answer, coarse Cloudflare country/region/city, timing, model, and review flag. Email addresses and phone-like values submitted in questions are redacted before logging; blocked private-topic wording is not saved.

## Verify the deployment

1. Visit `/api/health` on the `pages.dev` site. It should report `"ai": true`; after D1 is connected it should also report `"logging": true`.
2. Open `/terminal.html` and ask: `What kind of roles is Yahya looking for?`
3. Ask a salary question and confirm it is redirected with a flag.
4. Inspect D1 and confirm no raw IP or hostname column exists.

## Protect the private dashboard with Cloudflare Access

The dashboard deliberately returns no analytics until Access is fully configured.

1. Open **Zero Trust** → **Access** → **Applications** and create one **Self-hosted** application.
2. Add both public hostnames to the same application: `yahya-elsawi-portfolio.pages.dev/admin/*` and `yahya-elsawi-portfolio.pages.dev/api/admin/*`.
3. Add one Allow policy whose Include rule is the email `yahyaelsawi1@gmail.com`. Use One-time PIN as the login method unless a Google identity provider is connected later.
4. Copy the application **AUD tag** and the Zero Trust team domain ending in `.cloudflareaccess.com`.
5. In the Pages project’s Production and Preview variables, add `ACCESS_AUD` and `ACCESS_TEAM_DOMAIN`. `ADMIN_EMAIL` is already declared in `wrangler.jsonc`.
6. Redeploy, open `/admin/`, and authenticate with the approved email.

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
