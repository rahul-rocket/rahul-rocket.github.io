# CONTENT STRATEGY

The content model, where each kind of content lives, how it is validated, and the
editorial standards it must meet. The governing principle: **content is data in
Git, validated at build time, and never edited through a UI.**

## 1. Why files, not a CMS

| Option | Verdict |
| --- | --- |
| MDX + TS files in the repo | **Chosen** |
| Headless CMS (Sanity, Contentful) | Rejected — a runtime dependency, an auth surface, a monthly cost, and a network call, all to serve one author |
| Markdown + a Git-based CMS UI (Decap) | Rejected — an admin build and an OAuth proxy for an author who is already comfortable in an editor |
| Hardcoded in components | Rejected — makes copy edits code changes and blocks reuse across `/resume` and `/experience` |

Consequences accepted: no non-technical editing, and every content change is a
commit and a deploy (~2 minutes). Both are fine for a single engineer author, and
the Git history of the content is itself a useful artifact.

## 2. Format decision per content type

**Rule of thumb:** if it is *prose*, it is MDX. If it is *records*, it is
TypeScript.

| Content | Location | Format | Why |
| --- | --- | --- | --- |
| Blog posts | `content/blog/*.mdx` | MDX + frontmatter | Long prose with occasional components |
| Case studies | `content/projects/*.mdx` | MDX + frontmatter | Long prose with diagrams |
| Project index entries | Frontmatter of the above | — | One source; the index derives from it |
| Experience | `content/experience.ts` | TypeScript | Structured records, consumed by 2 pages + résumé |
| Journey milestones | `content/journey.ts` | TypeScript | Structured, ordered |
| Skills | `content/skills.ts` | TypeScript | Structured, filterable, cross-linked |
| Open source | `content/open-source.ts` + `generated/repos.json` | TS + build-time JSON | Hand-written context; live metrics fetched at build |
| Achievements | `content/achievements.ts` | TypeScript | Short records |
| Certifications | `content/certifications.ts` | TypeScript | Short records |
| Uses | `content/uses.mdx` | MDX | Prose-ish list with commentary |
| Social profiles, identity | `config/site.ts` | TypeScript | Single source for metadata, footer, structured data |
| Testimonials (optional) | `content/testimonials.ts` | TypeScript | Requires written permission per entry |
| UI microcopy | `config/copy.ts` | TypeScript | Keeps strings out of components |

**Why TypeScript rather than JSON or YAML for records.** Type errors surface in
the editor as they are typed, comments explaining an entry are allowed, and
values can reference each other (a case study can point at a skill by its typed
id, and a typo fails `tsc`). JSON gives none of that.

## 3. Single-source rules

These prevent the most likely long-term drift:

1. **Identity** lives only in `config/site.ts` — name, role line, URL, email,
   socials. Metadata, structured data, footer, and résumé consume it.
2. **Experience** is written once and rendered by `/experience`, `/resume`, and
   the PDF. There is no second copy of the work history.
3. **Skills** are ids. A case study's `stack: ['typescript', 'postgres']`
   references `skills.ts` entries; an unknown id fails the build. This is what
   makes "show all projects using Postgres" free.
4. **Project metadata** lives in case-study frontmatter. The `/projects` index
   is derived, so an index card can never disagree with the case study it links
   to.

## 4. Validation

Every content source passes a Zod schema at build time
([ARCHITECTURE.md](./ARCHITECTURE.md) §8).

```ts
export const postSchema = z.object({
  title: z.string().min(10).max(70),
  summary: z.string().min(60).max(180),   // also the meta description
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).min(1).max(5),
  draft: z.boolean().default(false),
  ogImage: z.string().optional(),
});
export type Post = z.infer<typeof postSchema>;
```

The length bounds are not decoration — they enforce the SEO limits from
[SEO.md](./SEO.md) §3 at the point of authoring, so a truncated search snippet
becomes a build failure rather than a discovery six months later.

`pnpm content:validate` runs the schemas without a full build, and runs in CI on
every PR and in the pre-commit hook for staged content files.

## 5. Drafts and scheduling

- `draft: true` — excluded from the index, feeds, and sitemap in production;
  visible in `pnpm dev` with a visible "DRAFT" banner.
- A `publishedAt` in the future is excluded from production builds. A nightly
  GitHub Actions cron rebuilds the site, so a scheduled post publishes itself
  without a push ([DEPLOYMENT.md](./DEPLOYMENT.md) §6).
- Drafts live on `master` — no separate content branch. Simplicity beats
  ceremony for one author.

## 6. Editorial standards

Applies to all prose. Enforced by review, not tooling.

- **Lead with the point.** No throat-clearing introductions ("In today's
  fast-paced world of software development…").
- **Numbers over adjectives** ([PERSONAL_BRAND.md](./PERSONAL_BRAND.md) §3).
- **Name the trade-off.** Every technical piece states what the choice cost.
- **Own the credit accurately.** "I" for personal work, "we" for team work, with
  the role stated.
- **No unexplained jargon.** First use of a term gets a clause of explanation.
- **Every claim is checkable.** Link the repo, the article, the spec, or state
  how the number was measured.
- **Confidentiality.** No client name, metric, screenshot, or architecture detail
  is published without permission. When permission is unavailable: anonymize
  ("a mid-size logistics platform"), round metrics, and redraw diagrams
  generically. When in doubt, leave it out — a case study is not worth an NDA
  breach.
- **Accuracy over recency.** A post that has aged is updated with a dated note or
  marked outdated; it is not silently deleted.

## 7. Content lifecycle

```
draft (draft: true) → review (self-edit after 24h) → publish (draft: false)
   → maintain (dated update notes) → archive (marked outdated, kept at its URL)
```

**Nothing is ever deleted at its URL.** A removed page becomes a redirect stub
([GITHUB_PAGES.md](./GITHUB_PAGES.md) §6). Breaking a link that someone shared is
a failure of craft, and it is directly visible.

**Route promotion criteria** (referenced by
[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §1): a content type earns its own
route at **five or more substantial entries**. Below that it is a section on an
existing page. This is why Certifications and Speaking are deferred.

## 8. Content volume targets

Quality gates, not quotas — but a site with one case study does not achieve its
purpose.

| Type | Launch minimum | Year-one target |
| --- | --- | --- |
| Case studies | 3 | 6 |
| Blog posts | 4 | 12 |
| Experience entries | complete history | complete history |
| Skills | 30–45 with honest depth ratings | maintained |
| Open source entries | 3 substantial | 6 |

**Launch is gated on the minimums.** Shipping the design with placeholder
projects would violate the site's entire premise.

## 9. Authoring workflow

```bash
pnpm new:post "Title of the post"     # scaffolds MDX with valid frontmatter
pnpm content:validate                  # schema check, fast
pnpm dev                               # preview, drafts visible
```

Then: commit with a `content:` Conventional Commit type, push, PR (or direct
push for typo fixes on content — see [CONTRIBUTING.md](./CONTRIBUTING.md) §4).

## 10. Media assets

| Asset | Location | Rule |
| --- | --- | --- |
| Post/case-study images | `public/content/<slug>/` | Co-located by slug; deleted with the content |
| Optimized variants | Generated at build | Never committed |
| OG images | Generated at build | Never committed |
| Résumé PDF | Generated in CI | Never committed |
| Portrait, favicon, logo | `public/brand/` | Committed; the only hand-managed images |

Source images are committed at a sensible maximum (≤ 2000px wide, ≤ 500 KB) —
the build produces every variant. No image over 500 KB enters Git history, which
is checked by a pre-commit hook.

## 11. Extensibility

- **A new content type** (talks, notes): add a schema, a loader, a route, and a
  manifest entry — ~1 hour, no architectural change
  ([ARCHITECTURE.md](./ARCHITECTURE.md) §11).
- **A newsletter** would consume the existing RSS feed; no content change needed.
- **i18n** would add a locale field to the frontmatter schema and a route group;
  because no copy is hardcoded in components (§2, [UI_GUIDELINES.md](./UI_GUIDELINES.md) §10),
  this stays a content problem rather than a rewrite.

## Related

[BLOG_SYSTEM.md](./BLOG_SYSTEM.md) · [PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) ·
[SEO.md](./SEO.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
