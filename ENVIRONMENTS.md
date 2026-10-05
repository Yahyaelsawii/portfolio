# Portfolio environments

Last audited: 5 October 2026. This file describes verified state and the intended promotion path. Dashboard work listed below is still required.

| Surface | URL | Git source | Access | Current state |
| --- | --- | --- | --- | --- |
| Production | `https://yahyaelsawi.website` | Intended: `main` | Public | Live on Cloudflare Pages deployment `6ee149b9-0184-486e-9efa-eaf5be96c081` from 4 October. Its public homepage matches local uncommitted work, not remote `main`; the exact deployed Git SHA is unverified. GitHub Pages separately has `main` at `3bb886c`. |
| Staging | `https://stg.yahyaelsawi.website` | Intended: `staging` | Owner-only Cloudflare Access | Prepared in code; requested hostname did not resolve at audit. The existing `staging.yahyaelsawi.website` is a protected **production alias**, not an isolated staging deployment. |
| Lab | Branches such as `lab/homepage-experiment`, `feature/qwerty-connection`, `fix/mobile-layout` | Separate short-lived branches | Git access and protected previews | No permanent generic lab branch. |
| Archive | Versioned snapshot URLs, later linked from Qwerty | Reviewed immutable Git tags and commit SHAs | Public portfolio snapshots only | `V1` at `cfd16d1867f899ae0baafe5ccda17d5de44b721a` is historical evidence; no version tag or snapshot is published yet. |
| Qwerty | `https://yahyaelsawi.website/qwerty` | Separate **private** `Yahyaelsawii/qwerty` repository | Owner-only Cloudflare Access and Worker JWT verification | Private repository created; route and Access application still need Cloudflare configuration. |

## Verified branch map

- `main`: `3bb886ce8a2d2016613496bd8cd969525cf809a2`, the newest committed public portfolio. Its latest commit adjusts product design positioning. It is one commit ahead of `staging`.
- `staging` and `codex/p0-hardening`: both `e8b5c61d072b522f073cd2c7281f9fb1c669e2d7` at audit. `staging` has no verified deployment at the staging URL.
- `V1`: `cfd16d1867f899ae0baafe5ccda17d5de44b721a`, older design with a distinct HTML/CSS structure. Preserve it.
- `agent/portfolio-redesign`: `4ec53662d318769a304e69d4d1c5e4539091eeaf`, an August redesign milestone. It is 1 commit ahead and 24 behind `main` relative to its merge base. Later redesign, security, AI, and release work already lives on `main`; do not merge this old branch wholesale.
- The local `main` branch in the owner's original checkout was 13 commits behind the remote at audit. A separate working tree contained uncommitted work and must not be reset or discarded.
- The newer visual cleanup is in the original `codex/high-priority` working tree as uncommitted changes. Its `npm run check:release` passed on 5 October (53 unit tests and 16 desktop/mobile routes), but it needs review and an intentional commit before it can be promoted through staging. The live Cloudflare homepage matches its current headline; the exact full deployed artifact-to-commit correspondence is unverified.

## Actual Cloudflare state at audit

- The existing `yahya-elsawi-portfolio` Pages project says **No Git connection** in Workers & Pages. Its latest successful production deployment is labeled “Portfolio visual system cleanup” and has ID `6ee149b9-0184-486e-9efa-eaf5be96c081`; the dashboard labels its source `main`, but does not show a verified Git SHA. Its previous production deployment is labeled “Reposition homepage for product design roles.”
- The same Pages project contains historical **Preview / staging** deployments. A checked preview URL redirected unauthenticated requests to Cloudflare Access. Preview Access is enabled in project settings.
- `staging.yahyaelsawi.website` is an active custom domain on that production project and redirects unauthenticated visitors to Access. The dashboard lists it among **Production Domains**, so it currently mirrors production rather than the `staging` branch.
- `stg.yahyaelsawi.website` had no DNS resolution. `/qwerty` returned 404. Existing `/admin/` Access protection redirected unauthenticated requests to login.

## Promotion and rollback

1. Branch from current `main` or `staging` with a purposeful `lab/`, `feature/`, or `fix/` name. Keep experiments out of `main`.
2. Open a PR into `staging`; run `npm ci`, `npm run check:release`, and inspect the staging deployment, including access denial without login and approved-user access.
3. Promote the tested commit from `staging` to `main` by reviewed PR. Because the current Cloudflare Pages project has no Git connection and has a newer direct deployment, reconcile that artifact with committed source **before** changing production deployment. Wait for GitHub Pages and Cloudflare Pages deployments and verify the live routes, Functions, Access, and headers. Do not assume a push equals a successful release.
4. Roll back by reverting the faulty commit on `main` through a reviewed PR. For an urgent Cloudflare Pages incident, restore a known-good deployment in the dashboard and reconcile `main` immediately afterward. Never force-push or rewrite history.

Do not automatically merge `agent/portfolio-redesign`. Preserve all existing branches. `main` should be production-only.

## Staging build and isolation

`PORTFOLIO_ENV=staging npm run build` generates a staging badge, `noindex` meta tags, `X-Robots-Tag`, and a restrictive `robots.txt`. Cloudflare Pages also supplies `CF_PAGES_BRANCH`; any branch other than `main` builds as staging by default. The badge is deliberately small and fixed in the corner. The staging build suppresses site analytics and disables the contact form. A Pages Function middleware returns 503 for all staging `/api/*` and `/admin/api/*` requests, preventing production writes while the staging backend is unconfigured. Cloudflare Web Analytics must also be disabled on the staging Pages project. None of these controls replace Cloudflare Access.

The default `wrangler.jsonc` contains the production D1 binding. The staging workflow deliberately uses `wrangler.staging.jsonc`, which has **no** D1, Workers AI, or contact binding. `.github/workflows/staging-deploy.yml` runs on `staging` pushes only when the repository variable `STAGING_DEPLOY_READY=true`; leave that variable unset until the private Pages project, Access policy, and direct Pages hostname are verified. The workflow uses `CLOUDFLARE_STAGING_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub secrets. These must never be committed.

### Cloudflare actions still required

1. In **Workers & Pages**, create a **separate Direct Upload Pages project** named `yahya-portfolio-staging` with production branch `staging`. Use Direct Upload because the root `wrangler.jsonc` contains production bindings; the repository's gated GitHub Actions workflow will deploy only with `wrangler.staging.jsonc`. Do not attach the production D1 database, AI binding, contact credentials, or Web Analytics. Restrict the project's direct `pages.dev` hostname with Access **before the first deployment**. The existing production Pages project has **No Git connection**; do not mistake its manual `main` deployment label for automatic Git integration.
2. In that project's **Custom domains**, add `stg.yahyaelsawi.website` and follow the Pages DNS activation flow. The hostname currently has no DNS record. Confirm the live response is the `staging` commit, not `main`.
3. In **Zero Trust → Access → Applications**, create a self-hosted application for `stg.yahyaelsawi.website/*` (and the staging project's `*.pages.dev` hostname, including previews if enabled). Add an Allow policy for only the owner's verified identity. Set short sessions and require the identity provider's phishing-resistant MFA / WebAuthn security key where supported. Test unauthenticated and approved requests for the site and API. Protect the direct `pages.dev` hostname, not just the custom domain.
4. In GitHub repository **Settings → Secrets and variables → Actions**, add a Cloudflare API token scoped to Pages deployment as `CLOUDFLARE_STAGING_API_TOKEN` and the account ID as `CLOUDFLARE_ACCOUNT_ID`. After the private project and Access protection are verified, set repository variable `STAGING_DEPLOY_READY=true` and re-run the staging workflow. Check that the deployed artifact uses `wrangler.staging.jsonc`, has no production bindings, and serves no Qwerty files. The production project's preview URLs are already protected by Access; verify this remains true for all previews. Its active `staging.yahyaelsawi.website` domain is a protected production alias. Decide whether to retire or repoint that legacy alias only after `stg` works; do not silently treat it as staging.
5. Create a new **Qwerty** Access self-hosted application with paths for both `yahyaelsawi.website/qwerty` and `yahyaelsawi.website/qwerty/*`. Allow only the same owner identity with WebAuthn/security-key MFA. Record its audience (`AUD`) and configure the private Worker's `ACCESS_AUD` and `ADMIN_EMAIL`; `ACCESS_TEAM_DOMAIN` is already set to the existing team domain. Never copy an admin JWT or secret into Git.
6. Deploy the Worker from the private Qwerty repository, with `workers.dev` and preview URLs disabled. Attach two zone routes: `yahyaelsawi.website/qwerty` and `yahyaelsawi.website/qwerty/*`. Confirm that route matching takes precedence over the public Pages origin, that `/qwerty` and nested paths are protected, and that unrelated public routes still reach the portfolio. Test the Worker with no Access JWT, an invalid JWT, and the approved login. **Do not enable the route before Access and Worker JWT validation are both configured.**

Cloudflare instructions: [Pages project setup](https://developers.cloudflare.com/pages/get-started/git-integration/), [branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/), [Workers routes](https://developers.cloudflare.com/workers/configuration/routing/routes/), [Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/).

## Archive method

For each owner-approved release milestone, create a signed or annotated `portfolio-vN` tag on the exact reviewed commit. Build that commit with pinned dependencies, save a checksum manifest and build artifact, and deploy it to a version-specific Pages project or immutable deployment URL. Link that fixed URL from Qwerty only after comparing served files with the artifact. Do not point archive links at movable branch aliases. Retain the Git tag, commit, artifact checksum, and deployment ID in a release manifest. Old public portfolio snapshots may be public; private Qwerty data must never be bundled with them.

The `V1` branch and its `cfd16d1` commit are evidence for a first snapshot. The owner should confirm the desired V1 release boundary before a `portfolio-v1` tag is created. No `portfolio-v2` or `portfolio-v3` mapping is inferred from branch names.

## Public repository boundary

Never commit health or WHOOP records, applications or career records, notes, saved links, personal datasets, credentials, API secrets, Access tokens, or private Qwerty code to this public repository. The public build manifest explicitly excludes Qwerty and the artifact verifier rejects Qwerty paths. Keep Qwerty in its private repository with its own Cloudflare Worker and secrets. Access protects the UI; every future sensitive endpoint must validate the Access JWT server-side. Noindex and unlisted URLs do not provide authentication.
