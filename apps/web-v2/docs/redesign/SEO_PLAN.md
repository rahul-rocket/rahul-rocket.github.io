# SEO PLAN

**Delta on [docs/SEO.md](../SEO.md).** That document is complete and correct —
metadata rules, OG/Twitter tags, JSON-LD shapes, feed policy, and the Satori
build-time OG pipeline all stand. This document covers only what the rebuild
adds: the new routes' schemas, the noindex constraint that governs this entire
branch, and the build assertions.

---

## 1. The constraint that governs this branch: `robots: noindex`

`src/app/layout.tsx` sets `robots: { index: false, follow: false }`, with the
reason in a comment:

> *Nothing here is indexed until the Phase 10 cutover.*
>
> *This matters more now than when it was written, not less: the export is
> continuously published to the real URL (`.github/workflows/deploy-pages.yml`),
> so a crawler can reach it. Every page it would find today is a placeholder, and
> placeholders indexed under the canonical URLs would outlive the deployment that
> produced them.*

**This stays exactly as it is for every milestone in this plan.** It is the single
most important SEO decision on the branch, and it is the one most likely to be
"fixed" by someone implementing metadata who sees `noindex` and assumes it is a
mistake.

**The reason changed while the directive did not, and that is worth noticing.**
This section originally justified `noindex` with *"the live site is still the
legacy build"* — i.e. nothing was serving these pages, so indexing them was a
hypothetical. That is no longer true: `develop` publishes to
`https://rahul-rocket.github.io` on every push, so the placeholder pages are
live, crawlable-in-principle, and sitting at the canonical URLs. The directive
survived a change that invalidated its stated reason, which is lucky rather than
principled — a justification that has quietly gone false is how a correct
setting gets removed by someone who checks the reason and finds it wrong.

Three consequences that are easy to get wrong:

1. **All metadata is built and correct anyway.** Canonicals, OG tags, JSON-LD,
   sitemap, and feeds are implemented and verified now. Only the `index`
   directive waits. Building them at cutover time under deadline pressure is how
   preview bugs ship.
2. **`lighthouserc.json` skips `canonical` and `is-crawlable`** because of it.
   Q-01 owns removing them from the skip list at cutover — [PERFORMANCE.md](../PERFORMANCE.md)
   §2 already records that *"a skipped audit that nobody owns is how a gate
   rots."* This plan does not remove them early and does not add to the list.
3. **The flip is one line, and it belongs to Q-12**, the cutover PR. It is called
   out here so it is on that PR's checklist rather than discovered afterwards.

Placeholder content (see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) §7)
makes this doubly important: the branch will carry pages with invented sample
text for a while, and `noindex` is what guarantees none of it is ever attributed
to a real person by a search engine.

---

## 2. Structured data for the new and changed routes

Canonical §5's table covers the documented routes. Added:

| Route | Schema | Notes |
| --- | --- | --- |
| `/now` | `WebPage` + `dateModified` | `dateModified` is the point of the page; it comes from the content file's own `updated` field, never from the build date |
| `/skills` | `ItemList` of `DefinedTerm` | Already specified; entries carry the depth rating as `description`, never as a rating value — a `Rating` here would be the unfalsifiable claim §4.4 bans |
| `/journey` | `Person` + `ProfilePage` | Low sitemap priority (0.5); supporting narrative |
| `/open-source` | `ItemList` of `SoftwareSourceCode` | `codeRepository` absolute; star counts from build-time JSON, never client-fetched |
| `/blog/tags/[tag]` | `CollectionPage` + `ItemList` | Priority 0.3 |

**Every JSON-LD object is built from a typed builder in
`src/lib/seo/structured-data.ts` (this said `src/lib/schema/`; the builders are
one module rather than one file per type), not hand-written in a page.** Canonical §5 already requires *"generated from typed
objects so malformed schema is a type error"*; the builders are where that
guarantee lives. One builder per schema type, each returning a typed object, each
unit-tested for required fields.

---

## 3. Sitemap and feeds

- **`app/sitemap.ts`** derives from `config/nav.ts` plus the content manifests, so
  a route cannot be added to navigation and forgotten in the sitemap — they are
  the same edit. `priority` is a field on the manifest; **`changeFrequency` is
  not, yet.** It was specified in [ROUTING_PLAN.md](./ROUTING_PLAN.md) §3 and
  deliberately not built, because its only consumer is this file and a manifest
  field with no consumer is a field nobody maintains. **Q-03 adds it**, alongside
  the sitemap that reads it.
- **Only `built: true` routes belong in the sitemap.** The manifest is the
  complete plan and the export is a subset of it; a sitemap listing a route with
  no file behind it is a 404 submitted to a crawler on purpose. The same filter
  the header and footer already apply.
- **`lastmod` is real.** It comes from the content file's `updated` frontmatter,
  falling back to `date`. It is never `new Date()` at build time: a sitemap that
  claims every page changed on every deploy trains crawlers to ignore its
  `lastmod` entirely.
- **Feeds** (RSS, Atom, JSON) are generated by a build script into
  `public/feed.xml`, `public/atom.xml`, `public/feed.json` — not by a route
  handler, which static export does not have. Full content, absolute URLs.

---

## 4. Build assertions

Canonical §4 requires one assertion (every `og:image` absolute). This plan adds
`scripts/check-seo.mjs`, run in CI beside `check-export.mjs`, asserting over
`out/`:

| Assertion | Catches |
| --- | --- |
| Exactly one `<h1>` per page | Heading-outline regressions that axe rates as "moderate" and Lighthouse misses |
| `<title>` present and ≤ 60 chars | Truncated SERP snippets |
| `description` present and 120–160 chars | Same, from the other end |
| Canonical present and absolute | The relative-canonical bug, invisible in local preview |
| Every `og:image` absolute **and resolvable in `out/`** | Q-02, extended — an absolute URL pointing at a file that was never generated previews as a broken image |
| `og:image:alt` present and not equal to the title | The laziest possible alt text |
| JSON-LD parses and has `@type` | A malformed script tag that silently emits nothing |
| No `noindex` on a route not expected to carry it | The inverse of §1 — catches an accidental page-level noindex after cutover |

These are `.mjs` with zero dependencies, matching `check-export.mjs`,
`check-links.mjs`, and `check-contrast.mjs`. F0-16's note applies: *"a build gate
that needs a transpiler to run can be broken by the transpiler."*

**Note on the last row.** Until cutover it asserts the *presence* of noindex
site-wide; Q-12 inverts it. The assertion is written now with the inversion as a
single constant, so the cutover cannot forget it.

---

## 5. What is deliberately not done

| Not doing | Why |
| --- | --- |
| Analytics of any kind | [SEO.md](../SEO.md) §9 — consent banner cost. The stated trade-off is that field data is absent by design |
| Keyword-targeted content | [SEO.md](../SEO.md) §1 — would distort the content strategy toward volume |
| A tag cloud | Same objection as the skills cloud — [ROUTING_PLAN.md](./ROUTING_PLAN.md) §1 |
| Schema markup for things that do not exist | An `AggregateRating` or a fake `Review` is structured-data spam and risks a manual action |
| Newsletter signup | The brief asked for it. It needs a third-party endpoint and a privacy story, and there is nothing to send yet. Deferred until there are posts worth a subscription — the RSS/Atom/JSON feeds serve the same reader in the meantime, with no data collection |

## Related

[docs/SEO.md](../SEO.md) · [ROUTING_PLAN.md](./ROUTING_PLAN.md) ·
[docs/CONTENT_STRATEGY.md](../CONTENT_STRATEGY.md) ·
[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
