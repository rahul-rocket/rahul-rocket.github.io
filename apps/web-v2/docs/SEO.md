# SEO

## 1. What success means here

This site is not competing for commercial keywords. Three outcomes matter:

1. **A name search resolves.** "Rahul Rocket" returns this site, with correct
   sitelinks and a knowledge-panel-shaped result.
2. **Shared links preview correctly** on Slack, LinkedIn, X, iMessage, WhatsApp,
   and Discord. A recruiter pasting the URL into a hiring channel is a real,
   frequent event, and a broken preview is a real, visible failure.
3. **Blog posts are findable** by the specific problem they solve — long-tail,
   low-volume, high-relevance queries.

Explicitly not a goal: ranking for "best full stack developer." Chasing it would
distort the content strategy toward volume, which contradicts
[BLOG_SYSTEM.md](./BLOG_SYSTEM.md) §1.

## 2. Structural advantages already in place

Most SEO work is architecture, and it is already decided:

- **Static HTML.** Every page is fully rendered at build — no JS execution needed
  for a crawler to see content.
- **Fast.** Core Web Vitals are a ranking input and the budgets are merge gates
  ([PERFORMANCE.md](./PERFORMANCE.md)).
- **Semantic markup and correct heading outlines** ([UI_GUIDELINES.md](./UI_GUIDELINES.md) §4).
- **Stable URLs**; nothing is deleted at its URL ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §7).
- **HTTPS** by default on GitHub Pages.

## 3. Metadata

Generated per route through Next.js's Metadata API, with a shared default in the
root layout and per-page overrides. Content is sourced from
`config/site.ts` and frontmatter — never hardcoded in a component.

| Field | Rule |
| --- | --- |
| `title` | ≤ 60 chars. Template: `%s — Rahul Rocket`. Home overrides to the full positioning line. |
| `description` | 120–160 chars. From `summary` frontmatter, whose Zod bounds enforce this at authoring time. |
| `canonical` | Absolute, self-referential, on every page. |
| `robots` | `index, follow` everywhere except drafts and the OG-image debug route. |
| `authors`, `creator` | From `site.ts`. |
| `alternates.types` | RSS/Atom/JSON feed links. |

**Why the length limits are Zod constraints, not guidelines:** a truncated SERP
snippet is invisible until someone searches. Making it a build failure moves the
discovery to the moment of authoring ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §4).

## 4. Open Graph and Twitter Cards

```
og:type          website | article
og:title         page title (without the site-name suffix)
og:description   summary
og:url           canonical absolute URL
og:image         1200×630 PNG, absolute URL
og:image:alt     required — a real description, not the title repeated
og:site_name     Rahul Rocket
og:locale        en_US
article:published_time / modified_time / tag   (articles only)

twitter:card     summary_large_image
twitter:title / :description / :image / :image:alt
twitter:creator  @handle
```

**OG image generation.** Images are generated **at build time** into `public/og/`
by a script using Satori + resvg, from the page title, a label (Case Study /
Article), and the headline metric where one exists. Not Next.js's
`opengraph-image` route handler — that requires a runtime, which static export
does not have. This is a concrete example of the constraint table in
[ARCHITECTURE.md](./ARCHITECTURE.md) §7 driving an implementation choice.

**Absolute URLs are mandatory.** Relative `og:image` paths fail on most
platforms, and this is the single most likely preview bug on GitHub Pages. A build assertion checks that every `og:image` starts with
`https://`.

## 5. Structured data (JSON-LD)

Emitted as `<script type="application/ld+json">`, generated from typed objects so
malformed schema is a type error.

| Route | Schema |
| --- | --- |
| `/` | `WebSite` (+ `SearchAction` if search exists) |
| `/` | `Person` with `name`, `jobTitle`, `url`, `sameAs[]`, `knowsAbout[]` |
| `/about` | `AboutPage` + `Person` |
| `/experience` | `Person.hasOccupation` / `OrganizationRole` |
| `/projects` | `CollectionPage` + `ItemList` |
| `/projects/[slug]` | `Article` + `TechArticle` |
| `/blog` | `Blog` |
| `/blog/[slug]` | `BlogPosting` |
| `/contact` | `ContactPage` |
| Case studies & posts | `BreadcrumbList` |

The `Person` entity with a complete `sameAs` array (GitHub, LinkedIn, X) is the
highest-leverage item on this list — it is what connects the site to the name
across Google's entity graph and drives outcome (1) in §1.

Validated in CI against Schema.org via a structured-data linter; a warning fails
the SEO job.

**State (H-08).** Every row is built, emitted by `components/seo/json-ld.tsx`
from typed builders in `lib/seo/structured-data.ts`, with
`structured-data.test.ts` pinning the required fields. Four details worth
knowing before adding the next builder:

- **The root layout row moved to `/`, and that is a correction rather than a
  regression.** Each route emits exactly ONE `<script type="application/ld+json">`
  carrying a `@graph`, which is what lets a `BreadcrumbList` reference the
  `WebPage` beside it. A layout cannot contribute a node to the page's graph, so
  emitting `WebSite` there would mean a second block on every route — and
  consumers differ on whether they merge nodes across blocks, which makes every
  cross-node reference conditional. `e2e/seo.spec.ts` asserts one block per page.
- **Nodes reference each other by `@id`**, from two shared constants, so
  `WebSite.author`/`publisher`, `Article.author` and the `Person` cannot drift
  apart. `WebSite` and `Person` are declared on `/`; every other page points at
  the same ids rather than re-declaring the author, which is the difference
  between one entity and thirty.
- **`sameAs` has one entry, and that is the honest state.** The table above
  names three profiles; `config/site.ts` knows one. It is derived from that
  object rather than written out, so adding a profile is one edit in one file.
- **`knowsAbout` is derived from `content/skills.ts`, and `SearchAction` is
  still absent.** The first waited on A-01 precisely so it would never be a
  hand-typed claim; it now lists the skills rated `primary`, which is the site's
  own definition of what it will defend. The second stays absent because §5's
  "if search exists" is not satisfied: the command palette navigates a fixed
  route list, it queries no index.

The CI structured-data linter is **not** built; it is Q-05.

## 6. Sitemap and robots

`sitemap.xml` is generated at build from the route manifest plus content files —
never hand-maintained. Priorities and change frequencies are in
[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §6. Drafts and future-dated posts
are excluded. `lastmod` comes from `updatedAt ?? publishedAt`, not the build
timestamp — a build-time `lastmod` on every URL trains crawlers to ignore the
field.

```
# robots.txt
User-agent: *
Allow: /
Disallow: /og-debug/
Sitemap: https://rahul-rocket.github.io/sitemap.xml
```

AI crawlers (GPTBot, CCBot, ClaudeBot) are **allowed**. The site's purpose is to
be found and understood; blocking them serves nothing here. This is a deliberate
decision, recorded so it is not re-litigated.

## 7. URL policy

- Lowercase, hyphenated, no dates, no file extensions.
- `trailingSlash: true` — required for correct directory serving on GitHub Pages,
  and the canonical form must match it exactly or every canonical tag is subtly
  wrong.
- Slugs are permanent; renames produce redirect stubs
  ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §6).
- No query parameters affect content. Filter params are UI state and are marked
  canonical to the base path.

## 8. Feeds, manifest, and icons

| Asset | Path | Notes |
| --- | --- | --- |
| RSS / Atom / JSON Feed | `/rss.xml`, `/atom.xml`, `/feed.json` | Full content; `<link rel="alternate">` in `<head>` |
| Web manifest | `/site.webmanifest` | Name, short name, theme color per theme, icons, `display: minimal-ui` |
| Icons | `/favicon.ico`, `/icon.svg`, `/apple-touch-icon.png` (180×180), maskable 192/512 | SVG icon is theme-aware via `prefers-color-scheme` |
| `humans.txt` | `/humans.txt` | Small, human, on-brand |

The manifest exists for a decent installed/pinned experience and for the
Lighthouse Best Practices score. This is not a PWA — no service worker. A service
worker on a static site of this size adds a cache-invalidation failure mode in
exchange for a benefit the CDN already provides.

## 9. Analytics and verification

- **No analytics at launch** ([BLOG_SYSTEM.md](./BLOG_SYSTEM.md) §10).
- **Google Search Console** is set up via a DNS or HTML-file verification. It
  provides the only data that would actually change decisions: which queries
  surface the site, and which pages have crawl or structured-data errors.
- Any future analytics must be cookieless, consent-banner-free, ≤ 2 KB, and
  non-render-blocking.

## 10. Anti-patterns

- Keyword stuffing in skills lists or alt text
- Hidden text or `display: none` keyword blocks
- Duplicate content across `/skills` and `/about`
- An `h1` chosen for its font size
- Alt text that repeats the caption verbatim
- Meta keywords (ignored since ~2009)
- Fabricated `datePublished` values to look fresh
- Interstitials or popups (a direct mobile ranking penalty, and hostile)

## 11. Verification

| Check | When | Gate |
| --- | --- | --- |
| Every page has title, description, canonical, OG image | CI, every build | Hard fail |
| All `og:image` URLs absolute and resolvable | CI | Hard fail |
| Structured data validates | CI | Hard fail |
| Sitemap contains every non-draft route, no drafts | CI | Hard fail |
| No broken internal links | CI (link checker over `out/`) | Hard fail |
| Lighthouse SEO = 100 | CI on 4 representative routes | Hard fail |
| Preview rendering on 6 platforms | Manual, per phase | Release checklist |
| Search Console errors | Monthly | Review |

## 12. Extensibility

- **Custom domain:** change `siteConfig.url`, add `CNAME`, and
  every canonical, OG URL, sitemap entry, and feed link follows — because all of
  them derive from one value. Then submit a change-of-address in Search Console
  and keep the `github.io` host serving redirect stubs.
- **i18n:** would add `hreflang` alternates; the metadata layer is already
  per-route generated, so this is additive.

## Related

[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) · [PERFORMANCE.md](./PERFORMANCE.md) ·
[BLOG_SYSTEM.md](./BLOG_SYSTEM.md) · [GITHUB_PAGES.md](./GITHUB_PAGES.md)
