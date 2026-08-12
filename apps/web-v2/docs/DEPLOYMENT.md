# DEPLOYMENT

How code becomes the live site, what gates it passes, and how to recover when
something goes wrong.

## 1. Model

```
merge to develop ──► CI (merge gate) ──► merge to master ──► deploy ──► verify
                          │                                     │
                          └── fail ⇒ nothing merges             ▼
                                                    https://rahul-rocket.github.io
```

Single environment, continuous deployment from `master`. Every push to `master`
goes live in roughly two minutes.

**`master` is the deployed branch; `develop` is where work accumulates.** One
branch owns the live URL, because a GitHub Pages site has exactly one source: if
two branches deployed, the live site would be a function of push ordering rather
than of anything anyone decided.

This arrangement arrived earlier than planned, in two steps. The original plan
kept the legacy Create React App build live from `master` until Phase 10.
That plan assumed a working legacy deploy, and there wasn't one — `deploy.yml`
failed on every run it ever had, `react-scripts build` dying on an
`eslint-config-react-app` error before producing a `build/` directory. No push
had updated the live URL since the repository was created, so "keep the live
site safe" was protecting nothing. Deployment was pointed at `develop` as an
interim, then moved to `master` once the rebuild was the only thing `master`
would sensibly hold.

The export ships `robots: noindex` ([SEO.md](./SEO.md)) for as long as it is a
skeleton. Deploying from `master` does not change that: the branch name is not
an argument about whether the content is ready, and every route is still a
placeholder. Lifting `noindex` is gated on real content, not on the cutover
having happened.

**Why no staging environment.** For a static site with no data, no auth, and no
migrations, a staging environment mostly provides the illusion of safety. The
real verification — a production-identical build served locally — is available in
15 seconds via `pnpm build && pnpm start`. Pull request previews (§5) cover the
"see it before merging" need. Rollback is fast and total (§8). Adding staging
would add a deploy step and a config axis for no proportional benefit.

## 2. Branching

| Branch | Role |
| --- | --- |
| `master` | **Production, and the only branch that deploys.** Protected. Every commit reaches the live site. |
| `develop` | **Default branch and mainline.** Base for all work branches; target for all PRs. Runs the full CI gate; publishes nothing. |
| `feat/*`, `fix/*`, `docs/*`, `chore/*` | Short-lived work branches, cut from `develop` |

**Why two long-lived branches, when this document otherwise argues for one.**
Because the merge gate and the publish decision are two different decisions, and
`develop` is where they are allowed to be separate. A change proves itself
against the full gate — Playwright, axe, Lighthouse, budgets — by merging to
`develop`. Promoting `develop` to `master` is then a decision about whether the
accumulated state is worth serving, made deliberately rather than as a
side-effect of the last PR to go green.

The cost is real: two branches means the possibility of drift, and every promotion
is a step somebody has to remember. Trunk-based development is the better default
for most projects, and this is a documented exception rather than a drift away
from it. It is worth it here only because the site is a portfolio whose live state
is itself an argument — an in-progress section reaching the URL is a worse failure
than a slower path to publishing it.

Rules: no direct pushes to `master` — it is reached by merging `develop`, never
by committing to it; every change arrives via PR with green CI; linear history
via squash merge, so each branch reads as one commit per change and `git revert`
reverts a whole feature.

## 3. CI pipeline

`.github/workflows/ci.yml`. Runs on every PR and every push to `develop` or
`master`. Jobs run in parallel where possible; all must pass.

One `build` job produces `out/` once and uploads it as an artifact; `budgets`,
`e2e`, `lighthouse`, and `size-diff` all download that same artifact. Building
per job would be slower and would let two jobs disagree about what they tested,
which would make the gate meaningless in exactly the case it exists for.

| Job | Command | Gate |
| --- | --- | --- |
| Install | `pnpm install --frozen-lockfile` | Lockfile drift fails |
| Typecheck | `pnpm typecheck` | Any error |
| Lint & format | `pnpm lint` (Biome) | Any error |
| Content validation | `pnpm content:validate` | Any schema failure |
| Unit tests | `pnpm test` | Any failure |
| Build | `pnpm build` | Any error or warning-as-error |
| Export assertions | `.nojekyll` present, no `.html` files outside directory form, export ≤ 15 MB | Any failure |
| Link check | `pnpm check:links` over `out/` | Any broken internal link |
| Bundle budgets | `size-limit` per route | Any budget exceeded |
| E2E + a11y | `pnpm test:e2e` (Playwright + axe) | Any failure or a11y violation |
| Lighthouse | `pnpm lh` on 4 routes, 3 runs, median | Any category below target |

Concurrency is grouped per branch with cancel-in-progress, so a rapid second push
does not race the first.

## 4. Deployment workflow

`.github/workflows/deploy-pages.yml`, triggered on push to `master` and manually
via `workflow_dispatch`. (The nightly cron of §6 is not wired up yet — it has
nothing to refresh until build-time GitHub data and scheduled posts exist.)

`workflow_dispatch` builds and publishes whichever ref it is dispatched on,
which is what makes it the re-deploy path in §8 — and also means dispatching it
from `develop` publishes `develop`. Dispatch from `master` unless you mean not
to.

The legacy `deploy.yml` is gone, deleted in the same change that pointed this
workflow at `master`. It never produced a successful run (§1), and leaving a
second Pages-adjacent workflow in the repository would have meant two plausible
answers to "what deploys this site".

Three jobs: `build` → `deploy` → `verify`.

`build` runs typecheck, lint, unit tests, `pnpm build`, the export assertions
and the link check, then stamps `out/build-info.json` with the commit SHA and
uploads the Pages artifact. Playwright, axe and Lighthouse are deliberately
*not* here. They are the merge gate in `ci.yml`, which every change clears on
its way into `develop` — running them again at publish time would re-litigate a
decision already made, and would put a ten-minute Lighthouse run between a
`master` merge and the site reflecting it. What this job checks is narrower and
different in kind: not "is this change good" but "is this export servable".

`verify` fetches `build-info.json` from the live URL and fails if the commit it
reports is not the one just deployed. This exists because "the deploy succeeded"
and "the site changed" are different claims that come apart in exactly one
common case — see §7 and §11.

The workflow's permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write        # OIDC — no long-lived token

concurrency:
  group: pages
  cancel-in-progress: false   # never cancel a deploy mid-flight
```

Still to be added to `build`, each with the task that brings it: `fetch-github-data`
(O-04), OG image generation (H-09), the feeds (Q-03), and the résumé PDF (R-06).
Each is a build step producing a file in `out/`, so none of them changes the
shape of the workflow — they slot in between the install and `pnpm build`.

**`cancel-in-progress: false` on the deploy group is deliberate.** Cancelling a
deployment mid-publish can leave the Pages artifact in an inconsistent state.
CI *is* cancellable; deploys are not.

All actions are pinned to a major version at minimum, and third-party actions to
a commit SHA — a supply-chain measure that matters more than usual for a
workflow holding `pages: write`.

## 5. Pull request previews

A separate workflow builds every PR and uploads `out/` as an artifact, then
comments with the Lighthouse summary and the per-route bundle-size diff versus
`master`.

Full hosted previews are not available on GitHub Pages (one site per repository).
Reviewing a PR visually means downloading the artifact or checking the branch out
and running `pnpm build && pnpm start`. This is a genuine friction cost of
GitHub Pages, accepted in exchange for zero hosting cost and zero vendor
coupling; it is one of the concrete reasons a move to Cloudflare Pages would be
reconsidered later.

## 6. Scheduled rebuilds

A nightly cron (`0 3 * * *` UTC) rebuilds and redeploys. It exists for three
reasons:

1. **Scheduled content publishes itself** — a post with a future `publishedAt`
   goes live without a push ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §5).
2. **Build-time GitHub data refreshes** — repository stars and contribution data
   on `/open-source` stay current without any client-side fetching.
3. **Rot detection** — a build that breaks because of an upstream change surfaces
   overnight rather than on the next deploy, weeks later.

The cron skips deployment if the generated output is byte-identical to what is
live, so a quiet week produces no deployment noise.

## 7. The cutover from the legacy deployment — done

Kept as a record, because the sequence explains why the repository looks the way
it does.

The original plan held the legacy Create React App build live until Phase 10 and
moved everything in one commit. That plan assumed a working legacy deploy, and
there wasn't one (§1), so it was resequenced and carried out early:

1. The CRA source was deleted
   ([redesign/MIGRATION_PLAN.md](./redesign/MIGRATION_PLAN.md)).
2. `deploy-pages.yml` was added, publishing `develop` as an interim.
3. `develop` was merged into `master`, `deploy-pages.yml` retargeted to
   `master`, and `deploy.yml` and `yarn.lock` deleted. `master` now holds the
   Next.js application and is the deployed branch.

**The one manual step, which no workflow can perform for itself:** Settings →
Pages → Build and deployment → Source must be **GitHub Actions**. While it is
set to a branch, the Pages artifact API is ignored, `deploy-pages` reports
success, and the live site does not change. This is the single most likely
failure in the whole deployment story and it is invisible from the Actions tab —
which is what the `verify` job in §4 exists to expose.

Two things deliberately did *not* move with the cutover:

- **`robots: noindex` stays.** It is gated on real content existing behind every
  route, not on which branch deploys. Lifting it is a Phase 10 step (§1).
- **The two-branch split stays.** `master` deploying does not collapse it; §2
  explains what it now buys.

Still outstanding: delete the `gh-pages` branch, which holds an unrelated
snapshot of the original source and has never served the site.

## 8. Rollback

**Preferred — revert the commit:**

```bash
git revert <sha> && git push origin master
```

Two minutes to live, keeps history honest, and CI re-verifies the reverted state.

**Faster — redeploy a previous artifact:** re-run the last known-good deploy
workflow from the Actions tab. Roughly 40 seconds, but `master` still contains
the bad commit, so it is a stopgap that must be followed by a revert.

**Recovery target:** under 5 minutes from detection to a good state.

## 9. Post-deploy checklist

Automated smoke test after every deploy (a workflow step that fails loudly):

- [ ] `/` returns 200 and contains the expected `<h1>`
- [ ] A bogus URL returns 404 with the custom page
- [ ] `/sitemap.xml`, `/robots.txt`, `/rss.xml` return 200 with valid content
- [ ] A representative `og:image` URL returns 200 and is absolute
- [ ] CSS and JS load (a `.nojekyll` regression is caught here)
- [ ] The résumé PDF is present and current

Manual, per release: link preview rendering on Slack, LinkedIn, X, and iMessage;
a keyboard pass; a real-device mobile check.

## 10. Secrets and permissions

| Secret | Use |
| --- | --- |
| `GITHUB_TOKEN` (automatic) | Checkout and Pages deploy via OIDC |
| `FORMSPREE_ENDPOINT` | Public by nature (it ships in the client) — kept as a repo variable for portability, not secrecy |

No other secrets exist. Workflows use least-privilege `permissions` blocks per
job. `pull_request_target` is never used — it is the standard vector for
untrusted-fork code gaining write access.

## 11. Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `verify` job fails: live commit is not the deployed one | Pages source still set to a branch | Switch source to GitHub Actions (§7) |
| Pushed to `develop`, site unchanged | Only `master` deploys (§2) | Merge `develop` into `master` |
| Deploy succeeds, site unchanged, `verify` green | CDN cache; `verify` passed on an earlier attempt | Hard-reload; if it persists, re-dispatch the workflow |
| Site loads unstyled | `.nojekyll` missing from `out/` | Restore `public/.nojekyll`; the CI assertion should have caught it |
| Nested routes 404 on refresh | `trailingSlash` disabled | Restore `trailingSlash: true` ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §3) |
| Link previews broken | Relative `og:image` | Absolute URLs from `siteConfig.url` |
| Build fails only in CI | Case-sensitive imports (Linux vs Windows) | Fix the import casing; this is the classic Windows-dev/Linux-CI failure |
| Lockfile error | `pnpm-lock.yaml` not committed | Commit the lockfile |
| Deploy stuck | Concurrency group held by a hung run | Cancel the stuck run; re-dispatch |

## 12. Extensibility

- **A second host** (Cloudflare Pages, Netlify) requires no application change —
  point it at `out/`. Worth doing if security headers or PR previews become
  important enough ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §8).
- **Custom domain:** [GITHUB_PAGES.md](./GITHUB_PAGES.md) §7.
- **Uptime monitoring:** an external cron pinging `/` would be the first
  observability addition, since there is no runtime to instrument.

## Related

[GITHUB_PAGES.md](./GITHUB_PAGES.md) · [CONTRIBUTING.md](./CONTRIBUTING.md) ·
[PERFORMANCE.md](./PERFORMANCE.md) · [TESTING.md](./TESTING.md)
