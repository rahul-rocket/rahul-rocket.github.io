# MIGRATION PLAN

How the legacy Create React App frontend was removed, what replaced it, and the
one coupling that must not be forgotten at cutover.

---

## 1. The finding: the migration had already happened

A migration plan should start by measuring what is being migrated. The honest
measurement here is that **there was almost nothing left to migrate.**

The complete legacy frontend, at the moment of removal:

| File | Lines | Contents |
| --- | --- | --- |
| `src/App.js` | 16 | `react-router-dom` with two routes |
| `src/index.js` | 11 | CRA's `ReactDOM.createRoot` entry |
| `src/Pages/Home.js` | 11 | One `<h1>`, one `<p>` |
| `src/Pages/About.js` | 11 | One `<h1>`, one `<p>` |
| `src/App.css` | 38 | CRA's spinning-logo default stylesheet |
| `src/index.css` | 13 | CRA's default body reset |
| **Total** | **100** | |

The entire rendered content of the live site was:

```html
<h1>Welcome to My Personal Website!</h1>
<p>This is the home page of my website.</p>
```

There was no legacy design system, no component library, no animation layer, no
utility modules, no state management, and no build tooling worth preserving. The
"old architecture" was Create React App's `npx create-react-app` output with two
placeholder pages added.

**The architecture the brief asks for was already in place before this
milestone**, built across four earlier commits:

| Requirement | Status before this commit |
| --- | --- |
| Next.js App Router | `next@15.1.6`, `output: 'export'` — commit `6c6cab2` |
| TypeScript strict | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` |
| Tailwind CSS | v4, CSS-first, bridged to the token layer via `@theme inline` |
| Feature-first structure | Enforced by Biome `noRestrictedImports`, observed failing |
| Design system | OKLCH tokens, both themes, 128 contrast pairs asserted in CI |
| Motion layer | `Reveal` on `IntersectionObserver`, 0.14 KB measured |
| Performance gates | Lighthouse CI, `size-limit` per route, both observed failing |

(The 128 pairs are across 8 contexts — the arithmetic is in
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §4.)

So this milestone is not a rewrite. It is the **deletion** the rewrite left
behind, plus the cleanup of the machinery that existed only to quarantine the
deleted files.

## 2. What was removed

- The six files in §1.
- **`tsconfig.json`'s `exclude` list** for `src/App.js`, `src/index.js`,
  `src/Pages` — three entries whose only purpose was keeping untyped JavaScript
  out of the typecheck. `exclude` is now `["node_modules", "out", ".next"]`.
- **`biome.json`'s five CRA ignore patterns.** Biome now lints the whole of
  `src/` with no carve-outs.
- **`public/manifest.json`'s identity.** It still declared
  `"name": "Create React App Sample"` and `"short_name": "React App"`, and it was
  shipping to production in every build. Replaced with the real identity and the
  dark theme colour.

## 3. What was deliberately kept

Per the brief's preserve list, and per
[CLAUDE.md](../../CLAUDE.md) §15.7 ("prefer deleting to adding" — which cuts both
ways when the thing in front of you is load-bearing):

| Kept | Why |
| --- | --- |
| Git history | Every deleted file is recoverable |
| `docs/` — all 24 documents | The reasoning layer; the brief lists documentation as preserved |
| `public/` images and icons | Static assets. See the caveat in §5 |
| `next.config.mjs`'s `pageExtensions` | Its original reason is gone; its current one is not — see below |
| The token layer, CI gates, import boundaries | See §4 |

**`pageExtensions: ['ts', 'tsx', 'mdx']` stays, with a rewritten comment.** It
was added because Next's default extension list turned `src/Pages/Home.js` into a
real exported route (`/Home` and `/About` appeared in the first build). Those
files are gone, but the option now earns its place twice over: it guarantees a
stray `.js` can never silently become a published route, and F1-01's MDX routing
requires it.

## 4. What was NOT rebuilt from scratch, and why

The brief says *"Do NOT preserve the existing application architecture"* and
*"Everything else should be rebuilt."* Applied literally to this repository that
would mean deleting the following, all of which is the target architecture rather
than the legacy one:

- **The OKLCH token layer** — two themes designed separately, 128 contrast pairs
  asserted in CI across 8 contexts including alpha-composited aurora and glass
  backdrops. Rebuilding it would mean re-deriving the same values and re-finding
  the two light-theme contrast failures it has already caught.
- **The CI merge gate** — Lighthouse CI, `size-limit` per route, axe in both
  themes, export assertions, internal link checking. It has been **observed
  failing** on a deliberately bad PR, which is the only thing that makes a gate
  known to work ([TASK_BACKLOG.md](../TASK_BACKLOG.md), F0-12…15).
- **Biome import-boundary enforcement** — all three layer rules observed failing
  against throwaway fixtures before those fixtures were deleted.
- **The export assertions** — one per silent GitHub Pages failure mode, each of
  which produces a green build and a broken site.

Deleting verified, passing infrastructure to rewrite it identically is not a
migration; it is churn that trades known-good code for unknown-good code and
loses the evidence along with it. The instruction is written for a repository
with a large legacy frontend to escape. This repository's legacy frontend was
100 lines, and it is now zero.

**Everything the brief actually asks for is either already true or is on the
milestone list in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) §3.**

## 5. The deploy coupling — and how much of it Q-12 still owns

**This section was written before `deploy-pages.yml` existed, and the ground has
moved under it in the direction that reduces risk.**

`.github/workflows/deploy.yml` still contains the CRA pipeline:

```yaml
on: { push: { branches: [master] } }
- run: npm install
- run: npm run build
  publish_dir: ./build
```

Three facts about it, unchanged:

1. **It fires only on `master`.** This branch cannot affect it, and `master` is
   not present in this clone.
2. **It has never produced a successful run.** The CRA build dies on an
   `eslint-config-react-app` error before it emits anything. There was never a
   working legacy deploy — which is what made bringing the new one forward safe.
3. **It is left untouched deliberately** until the cutover deletes it
   ([CLAUDE.md](../../CLAUDE.md) §15.5).

### What changed: `develop` is the deployed branch

`.github/workflows/deploy-pages.yml` builds and publishes every push to
`develop` to `https://rahul-rocket.github.io`, `noindex`, with a `verify` job
that fails if the live URL is not serving the deployed commit.

**So "the live site is still the legacy build" is no longer true anywhere it is
written.** The live site is this export. Two consequences:

- The `noindex` in `src/app/layout.tsx` matters **more** than when it was
  written, not less: a crawler can now actually reach these placeholder pages at
  their canonical URLs. See [SEO_PLAN.md](./SEO_PLAN.md) §1.
- **The Pages source setting is already GitHub Actions.** It had to be — both
  `deploy-pages` runs to date, including `verify`, succeeded, and `verify` is
  precisely the check that goes red when the source is still "Deploy from a
  branch". The single most-feared cutover step is therefore already done and
  already proven.

### What Q-12 still owns

The coupling is real but smaller than this document claimed:

| Step | State |
| --- | --- |
| Delete the CRA source | **done** (M3a) |
| Switch Pages source to GitHub Actions | **done**, proven by two green `verify` jobs |
| Delete `deploy.yml` | Q-12 |
| Change `deploy-pages.yml`'s branch list from `[develop]` to `[master]` | Q-12 |
| Merge `develop` → `master` | Q-12 |
| Lift `robots: noindex` | Q-12 |

> **The failure mode has inverted, and the checklist should say so.** The old
> risk was "workflow replaced, source setting forgotten → green deploy, unchanged
> site". The remaining risk is the mirror image: **changing the branch list to
> `[master]` in the same commit that merges to `master`, and getting the order
> wrong, leaves the site published from a branch that no longer receives pushes.**
> Verify against the live URL after the cutover merge, not just against a green
> run — which is what Q-13's post-deploy smoke workflow is for.

**Also outstanding for Q-04:** `public/logo192.png` and `public/logo512.png` are
still Create React App's React-atom logo, and `favicon.ico` is CRA's default.
They were kept rather than deleted because `manifest.json` references them and
removing them would leave the site with no icon at all — but they are placeholder
branding, not Rahul's, and Q-04 owns replacing the set.

## 6. Verification

Run after removal, all green:

```
pnpm typecheck            no errors
pnpm lint                 clean, now with zero CRA carve-outs
pnpm test                 29 passing
pnpm build                static export
pnpm check:export         .nojekyll, dir/index.html form, no localhost URLs
pnpm check:links          all internal links resolve
pnpm check:contrast       128 pairs, 8 contexts
pnpm size                 within per-route budgets
pnpm test:e2e             6 passing, axe clean in both themes
```

The most useful signal is `pnpm lint` passing **without** the five CRA ignore
patterns: it is the direct evidence that nothing untyped or unformatted remains
in `src/`.

## Related

[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) ·
[docs/DEPLOYMENT.md](../DEPLOYMENT.md) §7 ·
[docs/GITHUB_PAGES.md](../GITHUB_PAGES.md) ·
[docs/TASK_BACKLOG.md](../TASK_BACKLOG.md) Q-12
