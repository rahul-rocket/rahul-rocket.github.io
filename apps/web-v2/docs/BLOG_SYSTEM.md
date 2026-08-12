# BLOG SYSTEM

The blog's purpose, its pipeline, and the rules that keep it fast and readable.

## 1. Purpose

The blog exists to **demonstrate thinking**, not to build an audience. It has no
newsletter popup, no follower count, and no posting schedule to satisfy. One
excellent post per quarter beats twelve thin ones — and thin posts actively
damage the credibility the site is built on.

A post earns publication if it answers yes to at least one:
- Did I learn something non-obvious that cost me time?
- Did I make a decision whose reasoning would help someone facing it?
- Can I explain something complex more clearly than the existing explanations?

Explicitly not published: framework release summaries, "10 tips" listicles,
tutorials that duplicate official docs, and anything where the honest summary is
"I read the changelog."

## 2. Pipeline

```
content/blog/*.mdx
   │  read (fs, build time)
   ▼
gray-matter → frontmatter + body
   │
   ▼
postSchema.parse()          ← Zod. Failure = build failure.
   │
   ▼
@next/mdx compile           ← remark/rehype plugins, build time
   │
   ▼
React Server Component      ← zero MDX runtime shipped
   │
   ▼
static HTML in out/blog/<slug>/index.html
```

**Plugins**

| Plugin | Job |
| --- | --- |
| `remark-gfm` | Tables, strikethrough, task lists, autolinks |
| `remark-frontmatter` | Frontmatter parsing |
| `rehype-slug` | Stable heading ids |
| `rehype-autolink-headings` | Anchor links (`behavior: 'append'`, visually hidden text) |
| `rehype-pretty-code` | Shiki highlighting **at build time** — 0 KB of highlighter shipped |
| `remark-reading-time` | Computed once, stored in metadata |

Custom transforms: an external-link rehype pass adding `rel="noopener noreferrer"`
and an accessible "opens in new tab" affordance, and an image pass mapping
Markdown images to the responsive `<Figure>` component.

## 3. Frontmatter contract

```yaml
---
title: "Why we split the monolith at exactly one seam"
summary: "Splitting a monolith is usually sold as an all-or-nothing migration. We extracted one service, kept the rest, and measured what it bought us."
publishedAt: 2026-03-14
updatedAt: 2026-05-02          # optional
tags: [architecture, postgres, migrations]
draft: false
ogImage: /content/monolith-seam/og.png   # optional; generated if absent
---
```

Constraints enforced by `postSchema` ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §4):
`title` 10–70 chars (SERP truncation), `summary` 60–180 chars (meta description
and OG description), 1–5 tags, dates coerced and validated.

**`summary` is doing three jobs** — the index hook, the meta description, and the
feed description. That is intentional: one field, no drift, and its length limits
are the SEO limits.

## 4. Slugs and URLs

- Slug = filename. `content/blog/monolith-seam.mdx` → `/blog/monolith-seam/`.
- Lowercase, hyphenated, no dates in the URL — dates in URLs make good posts look
  stale and make renaming impossible.
- **Slugs are permanent.** Renaming a published post requires a redirect stub
  ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §6).
- Trailing slash, matching `trailingSlash: true` in `next.config.mjs`, which is
  required for correct GitHub Pages directory serving.

## 5. Index page

- Reverse-chronological. Title, date, reading time, tags, and the `summary`.
- **Search and tag filtering are client-side over data already in the HTML** —
  every post's title, summary, and tags are in the served markup, so filtering is
  a DOM operation with no index to download and no network request. This scales
  fine to a few hundred posts; beyond that, a build-generated JSON index with a
  small fuzzy matcher is the next step (not built yet, deliberately).
- Filter state lives in URL search params — shareable and back-button correct.
- No pagination until 30 posts, then statically generated `/blog/page/[n]`.

## 6. Post page

**Layout.** `68ch` prose column, sticky TOC on ≥ 1280px, reading progress bar in
the header.

**Reading experience rules**
- **No entrance animation on body copy.** Text that fades in while being read is
  hostile ([ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §10).
- Code blocks: build-time highlighted, horizontally scrollable within their own
  container, `tabindex="0"` with an accessible label naming the language, a copy
  button, optional line highlighting and filename headers.
- Footnotes render at the end with bidirectional links.
- Images are lazy, dimensioned, and captioned via `<figure>`.
- Prev/next navigation by publication date.
- A single, quiet contact CTA at the end — no popup, ever.

**Available MDX components** (a closed set — anything else is a component PR):
`Callout` (note/warning/tip), `Figure`, `CodeGroup` (tabbed), `Diagram` (SVG with
required `title`/`desc` and a prose equivalent), `Aside`, `Metric`, `Steps`,
`TL;DR`.

Every component must render meaningfully **without JavaScript**, because the
static HTML is the article.

## 7. Tags

- 1–5 per post, lowercase, from a controlled vocabulary in `content/tags.ts`.
  An unknown tag fails the build — this prevents `nextjs`/`next.js`/`next`
  fragmentation.
- `/blog/tags/[tag]` archives are statically generated via `generateStaticParams`.
- A tag with fewer than 2 posts does not get a nav-visible archive link (the page
  still exists and is linked from posts).

## 8. Feeds

Generated at build into `public/`:

| Feed | Path | Notes |
| --- | --- | --- |
| RSS 2.0 | `/rss.xml` | The interoperability default |
| Atom | `/atom.xml` | Preferred by some readers |
| JSON Feed 1.1 | `/feed.json` | Cheap to generate, easy to consume |

Feeds carry the **full post content**, not truncated summaries — a truncated
feed exists to force clicks, and this blog has nothing to sell. Absolute URLs
throughout, correct `lastBuildDate`, and `<link rel="alternate">` in `<head>` on
every page.

## 9. Search-engine and social behavior

Per post: `BlogPosting` structured data (headline, datePublished, dateModified,
author, image, mainEntityOfPage), a canonical URL, an OG image generated at build
from the title + tags, and Twitter `summary_large_image`. Full rules in
[SEO.md](./SEO.md).

## 10. Analytics

None at launch. If a privacy-respecting, cookieless, no-consent-banner option is
added later, it must ship ≤ 2 KB, require no cookie banner, and never block
rendering. Google Analytics is excluded ([TECH_STACK.md](./TECH_STACK.md) §3) —
the cost is a consent banner on every page, which is a real UX tax paid for
numbers that would not change any decision here.

## 11. Performance budget (per post page)

| Metric | Budget |
| --- | --- |
| JS shipped | ≤ 90 KB gz |
| Syntax highlighter runtime | 0 KB |
| MDX runtime | 0 KB |
| LCP | ≤ 1.8s on throttled 4G |
| CLS | ≤ 0.02 |
| Fonts | ≤ 120 KB total (mono loaded only here and on case studies) |

## 12. Editorial checklist (before `draft: false`)

- [ ] The opening states the point within three sentences
- [ ] At least one number, measured and explained
- [ ] A trade-off or a limitation is named
- [ ] All code samples run as written
- [ ] Every claim links to evidence
- [ ] No confidential client detail ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §6)
- [ ] Read once after 24 hours, out loud
- [ ] `title` ≤ 70, `summary` ≤ 180
- [ ] Tags from the controlled vocabulary
- [ ] Headings form a sensible outline with no skipped levels
- [ ] Images have real `alt` text
- [ ] `pnpm content:validate` passes

## 13. Extensibility

- **Series** — add `series: { name, order }` to the schema and a navigation
  component. ~2 hours, no pipeline change.
- **Post comments** — no server exists; the deliberate answer is a "discuss on
  GitHub" link to a Discussions thread, not an embedded third-party widget.
- **Full-text search** at scale — build-generated JSON index + a small matcher,
  triggered when the index exceeds ~50 KB.
- **Cross-posting** — the RSS feed already carries full content; a script can
  syndicate to dev.to/Hashnode with a `canonical_url` pointing home.

## Related

[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) · [SEO.md](./SEO.md) ·
[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.9 · [PERFORMANCE.md](./PERFORMANCE.md)
