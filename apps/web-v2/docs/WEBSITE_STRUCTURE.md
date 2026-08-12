# WEBSITE STRUCTURE

The complete information architecture: every route, its purpose, its sections,
its responsive and motion behavior, and its accessibility and SEO obligations.
This document is the contract that page implementation PRs are reviewed against.

## 1. Route map

```
/                          Home
/about                     About Me
/journey                   Professional Journey (timeline)
/skills                    Skills & Technologies
/experience                Experience
/projects                  Featured Projects (index)
/projects/[slug]           Project Case Study
/open-source               Open Source
/blog                      Technical Blog (index)
/blog/[slug]               Blog Post
/blog/tags/[tag]           Tag archive
/uses                      Uses (tools & setup)
/services                  Services (how an engagement is shaped)
/now                       Now (dated snapshot of current work)
/resume                    Resume
/contact                   Contact
/404                       Not Found            (app/not-found.tsx → 404.html)

Deferred (Phase 11+, gated on real content existing):
/speaking                  Talks & community
/certifications            Certifications
```

**Route count discipline.** A route exists only when it has enough content to
justify a page a reader would not regret opening. Certifications with two entries
belongs as a section on `/about`, not a route. This rule is why `/speaking` and
`/certifications` are deferred rather than scaffolded empty — see
[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §7 for the promotion criteria.

**`/now` passes that rule where a thicker page would not.** It is a dated
snapshot of current work, reading, and availability — §4.1 already names "Current
focus" as *"the strongest signal that the site is maintained"*, and `/now` is
that section with a URL and a real `dateModified`. It is cheap to keep honest
precisely because it is small, and a `/now` that has not been touched in a year
says something true. Owned by **C-12**; the reasoning is in
[redesign/ROUTING_PLAN.md](./redesign/ROUTING_PLAN.md) §1.

**`/services` is an addition to this map, made with the page.** §1's route-count
discipline says a route exists only when it has enough content to justify a page
a reader would not regret opening; this one earns it by answering a question no
other page answers. `/contact` says how to reach the author and `/about` says how
he works — neither says what a piece of work looks like or when it is the wrong
fit. It carries no rates (those depend on scope) and no availability claim
(`/now` carries that, where a date makes it honest). Specification in §4.14.

Note the process point, which is C-12's lesson applied: the route entered
`src/config/nav.ts` and this document in the same change that built it. A locked
route decision that reaches neither is invisible to planning — the manifest only
defends routes that reach it.

**Where the export actually is.** `src/config/nav.ts` carries every route above
with a `built` flag, and the header, footer, sitemap and E2E suite render only
`built: true`. **Every route in the map above is now `built: true`** — the
export is 30 pages, and the manifest and the contract have converged. That
convergence is the end of the `built` flag's usefulness for this list and the
beginning of its usefulness for the next one: `/speaking` and `/certifications`
are still deferred and still absent, and the flag is how they will be tracked
when they are decided.

## 2. Navigation model

**Primary nav (desktop, 5 items max):** About · Projects · Blog · Uses · Contact
Five is the limit because a nav that requires reading is a nav that failed.
Experience, Journey, Skills, Open Source, and Resume are reachable from About and
from the footer — they are *destinations*, not *entry points*.

**Mobile:** a sheet/drawer with the full route list, focus-trapped, dismissible
via Escape and backdrop, restoring focus to the trigger on close.

**Footer:** the complete site map, social profiles, email, and a build/version
line. The footer is the accessibility safety net — every route is reachable from
every page without JavaScript.

**Command palette (⌘K / Ctrl+K):** navigation, blog search, theme toggle, copy
email. A progressive enhancement — never the only path to anything.

**Breadcrumbs:** on `/projects/[slug]` and `/blog/[slug]` only, backed by
`BreadcrumbList` structured data.

## 3. Shared page anatomy

Every page composes the same skeleton, which is why the layout is defined once:

```
<SkipLink />            → first focusable element, targets #main
<Header />              → sticky, condenses on scroll, backdrop-blur
<main id="main">
  <PageHeader />        → h1 + one-line purpose statement
  …sections
  <PageFooterCTA />     → contextual next action
</main>
<Footer />
```

**Universal rules**
- Exactly one `<h1>` per page; heading levels never skip.
- Every section is a `<section>` with an `aria-labelledby` pointing at its heading.
- Max content width `72ch` for prose, `1200px` for layout.
- Every page ends with a next action — a dead end is a lost reader.

## 4. Page specifications

### 4.1 `/` — Home

**Purpose.** Establish identity, credibility, and a path forward in 30 seconds.
**Primary audience.** P1 (recruiter), then everyone.

**Sections**
1. **Hero** — name, role line, one-sentence positioning, two actions
   (View Projects / Get in Touch). Text-first; no image dependency for meaning.
2. **Proof strip** — 3–4 metrics (years, systems shipped, scale handled). Numbers
   only, each verifiable elsewhere on the site.
3. **Featured projects** — exactly three, each with the problem stated in one
   line, linking to the case study.
4. **What I do** — three capability blocks mapping to the brand pillars
   ([PERSONAL_BRAND.md](./PERSONAL_BRAND.md) §2).
5. **Selected writing** — three most recent posts.
6. **Current focus** — what is being worked on now; the strongest signal that
   the site is maintained.
7. **Contact CTA.**

**Layout.** Single column, generous vertical rhythm. Hero ≈ 85vh, never 100vh —
a visible content edge tells the reader to scroll.
**Responsive.** Mobile: one column, hero type scales via `clamp()`, actions become
full-width stacked buttons. Desktop ≥ 1024px: featured projects in an asymmetric
3-up arrangement so it does not read as a card grid.
**Animation.** Hero: staggered fade-and-rise on load, ≤ 400ms total, once.
Sections: `whileInView` reveal at 15% threshold, once, 24px travel.
**Accessibility.** LCP element is the `<h1>` text. No motion required to read
anything. Hero actions are real links.
**SEO.** `WebSite` + `Person` structured data. Title: `Rahul Rocket — Full Stack
Software Engineer & Software Architect`. This is the canonical root.
**Budget.** Strictest on the site: LCP ≤ 1.8s on throttled 4G, ≤ 100 KB JS gz.

**State: all seven sections are built (M7).** Sections 2 and 3 — the proof
strip and featured projects — were blocked at H-01…H-08 on content rather than
on layout, and both unblocked with the record layer (A-01) and `/projects/`:
every proof figure is now computed from the same corpus the page it links to
renders, so a metric cannot disagree with its own evidence.

Two notes on what shipped, because each departs from a sentence above:

- **"Three most recent posts" renders what exists, and nothing when there are
  none.** A section heading over an empty list reads as a rendering bug rather
  than as a young site, so the whole section is omitted at zero.
- **"Current focus" carries a hand-authored date, never the build's.** The
  section's entire value is being a claim about *when* it was last true, and a
  `new Date()` would re-date it on every deploy. Same rule C-12 sets for
  `/now`'s `dateModified`. The two still hold their copy separately — H-12.

The two divergences below were taken at H-01 and both still stand.

1. **The `<h1>` is the role line, and the name is the eyebrow above it** — not
   the other way round. A page's heading should be its subject, and on Home the
   subject is what this person does; the name is already the wordmark, the
   `<title>` and the footer. `src/config/home.ts` composes the string once and
   pins it against both `nav.ts` and `site.role` in a unit test.
2. **The two actions are resolved from the route manifest, not fixed.** "View
   projects" and "Get in touch" are the specified pair and remain the first two
   candidates. They were unlinkable while `/projects/` and `/contact/` were
   unbuilt — an internal href with no file behind it fails `check:links` — so
   the hero renders the first two candidates whose destinations exist and
   offered Writing and GitHub until those routes landed. It now offers the
   specified pair, without an edit: the mechanism is what made the intermediate
   state honest rather than broken, and it stays for the next unbuilt route.

**The `≤ 100 KB JS gz` figure above is not the enforced budget and never was.**
[PERFORMANCE.md](./PERFORMANCE.md) §2 sets Home's target at **75 KB** and the
hard limit CI gates on at **120 KB**; Home measures **114.01 KB** with all seven
sections built. Three numbers for one budget is one too many — PERFORMANCE.md §2
is authoritative and this line is a stale third opinion. H-10 still owns
reconciling them, and the reconciliation is now a decision rather than a task:
the gap is Next's ~105 KB baseline, not this site's code, which is under 5 KB on
its heaviest route.

---

### 4.2 `/about` — About Me

**Purpose.** The human and professional narrative; how this person works.
**Primary audience.** P2, P3.

**Sections:** narrative intro (3–4 paragraphs, first person) · how I work
(principles with a concrete example each) · what I'm learning · quick facts
(location, timezone, availability, languages) · beyond code (brief, human) ·
links onward to Journey, Experience, Skills.

**Layout.** Prose column `65ch` with a sticky secondary rail on ≥ 1280px holding
quick facts and a portrait.
**Responsive.** Rail collapses **below** the prose on < 1280px — a deliberate
change from "above", made when the page was built. Placing it above would mean
the DOM order and the visual order disagree at one of the two sizes, and CSS
reordering that changes reading sequence is a blocker (CLAUDE.md §8). The rail
follows the narrative in the DOM at every width and moves to the side at `xl`
via `flex-row-reverse`; a reader on a phone gets the story first, which is also
the better reading order. The portrait is not built — there is no photograph in
the repository, and the rail is complete without one.
**Animation.** Minimal — paragraph-level fade-in only. This page is for reading.
**Accessibility.** Portrait has a descriptive `alt`; decorative texture is
`aria-hidden`.
**SEO.** `AboutPage` + `Person` (`sameAs` social profiles). The primary target
for a name search.

---

### 4.3 `/journey` — Professional Journey

**Purpose.** Show trajectory and inflection points, not a duty list. The
narrative counterpart to `/experience`.

**Sections:** an opening frame ("the through-line") · a chronological timeline of
5–9 milestones, each with year, title, one-paragraph story, and what changed as
a result · a closing "what's next."

**Layout.** Vertical timeline with a progress spine; alternating sides on
≥ 1024px, single-sided on mobile.
**Animation.** GSAP ScrollTrigger scrubs the spine's draw as the reader scrolls —
one of only two sanctioned GSAP usages ([TECH_STACK.md](./TECH_STACK.md) §2).
Milestones fade in individually. Under reduced motion the spine renders complete
and static.
**Accessibility.** The timeline is an ordered list (`<ol>`) semantically; visual
alternation is CSS only, so reading order always matches DOM order. Scroll
animation never gates content visibility — the reduced-motion and no-JS states
show everything.
**SEO.** Low priority in the sitemap (0.5); it is a supporting narrative page.

---

### 4.4 `/skills` — Skills & Technologies

**Purpose.** Answer "does this person know X" quickly and honestly.

**Sections:** grouped by domain (Languages · Frontend · Backend · Data · Infra &
DevOps · Architecture & Practices · Tooling). Each entry carries a **depth
rating** (Primary / Working / Familiar) and, where meaningful, a link to the
project or post where it was used.

**The honesty rule.** No percentage bars, no five-star ratings — they are
unfalsifiable and every reader knows it. Three named tiers with a stated
definition are honest and more useful. "Familiar" entries are kept: knowing the
boundary of one's knowledge is itself a signal.

**Layout.** Grouped sections, dense tag layout, filterable by depth via URL
search params (shareable, back-button correct).
**Responsive.** Tags wrap naturally; groups become accordions on < 640px.
**Animation.** Stagger-in per group, ≤ 30ms per item, capped at 300ms total.
**Accessibility.** The filter is a real fieldset of checkboxes with a live region
announcing result counts. Depth is conveyed by text, never by color alone.
**SEO.** Rich keyword surface; `ItemList` structured data.

---

### 4.5 `/experience` — Experience

**Purpose.** The verifiable professional record.

**Sections:** per role — company, title, dates, location/mode, one-line mandate,
3–5 outcome bullets (each with a number), stack used, and links to any related
case study.

**Bullet rule.** Outcome, not duty. "Responsible for the payments service" is
rewritten as "Owned payments; cut failed-charge rate from 4.1% to 0.6% in two
quarters."

**Layout.** Chronological cards, most recent first, with a sticky year marker on
desktop.
**Responsive.** Year marker moves inline above each card on mobile.
**Animation.** Reveal on scroll only.
**Accessibility.** Dates in `<time datetime>`; roles as headings so screen-reader
users can jump between them.
**SEO.** `Person.hasOccupation` / `OrganizationRole` structured data.

---

### 4.6 `/projects` — Featured Projects (index)

**Purpose.** Route the reader to the right case study.

**Sections:** intro framing what counts as a featured project · 3–6 project
entries · a link to secondary/smaller work · an Open Source cross-link.

**Entry contents:** title, one-line *problem* (not description), role, stack
badges, headline outcome metric, link to the case study.
**Layout.** Deliberately *not* a uniform grid — the top project gets a wide
feature row; the rest use a 2-up layout on ≥ 1024px. Asymmetry signals editorial
judgment and defeats the template look.
**Filtering.** By technology, via URL search params. No client-side data
fetching; the full list is in the HTML and filtering is DOM-level.
**Animation.** Card hover: 150ms lift and border-accent shift. Reveal on scroll.
**Accessibility.** The whole card is *not* a link; the title is the link, with a
`::after` overlay for the click target — this keeps the accessible name clean and
lets inner links work.
**SEO.** `CollectionPage` + `ItemList`. High sitemap priority (0.9).

---

### 4.7 `/projects/[slug]` — Project Case Study

**Purpose.** The site's core artifact — demonstrate engineering judgment.
**Full specification:** [PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md).

**Sections (fixed order):** header (title, role, period, stack, links) ·
Overview · The Problem · Constraints · Options Considered · The Decision ·
Architecture (diagram) · Implementation Highlights · Challenges & Solutions ·
Outcome (metrics) · What I'd Do Differently · Next/previous project.

**Layout.** Prose column with a sticky table of contents on ≥ 1280px; full-bleed
diagram sections.
**Animation.** Architecture diagram draws on as it enters view (GSAP, sanctioned
usage #2). Reading progress indicator in the header.
**Accessibility.** Diagrams are SVG with `<title>`/`<desc>` **and** a prose
equivalent immediately following — the prose is the source of truth, the diagram
is the aid. TOC is a `<nav aria-label="On this page">` with `aria-current`.
**SEO.** `Article` + `TechArticle` structured data, per-project OG image,
canonical URL, `generateStaticParams` from the MDX manifest.

---

### 4.8 `/open-source` — Open Source

**Purpose.** Show collaboration in public.

**Sections:** own projects (repo, purpose, stars/usage if meaningful) ·
contributions to others' projects (project, the PR, what it fixed, why it
mattered) · smaller contributions list · how to collaborate.

**Honesty rule.** A merged one-line typo fix is not a contribution worth a card.
Entries need a sentence of substance or they belong in the compact list.
**Data.** Repo metadata is fetched **at build time** by the deploy workflow and
committed as JSON — never client-side. See [ARCHITECTURE.md](./ARCHITECTURE.md) §7.
**Animation.** Reveal only.
**SEO.** `ItemList` of `SoftwareSourceCode`.

---

### 4.9 `/blog` and `/blog/[slug]` — Technical Blog

**Full specification:** [BLOG_SYSTEM.md](./BLOG_SYSTEM.md).

**Index.** Chronological list with title, date, reading time, tags, and a
one-line hook. Search + tag filter via URL params. No pagination until > 30
posts (then static paginated routes).
**Post.** Prose column `68ch`, sticky TOC ≥ 1280px, build-time-highlighted code,
copy buttons, footnotes, prev/next, and a subtle contact CTA.
**Animation.** Reading progress bar; no entrance animation on the post body —
text that animates in while being read is hostile.
**Accessibility.** Code blocks are focusable and scrollable by keyboard with an
accessible label naming the language. Headings anchor-linked with visible focus.
**SEO.** `BlogPosting` structured data, RSS/Atom/JSON feeds, per-post OG image,
`/blog/tags/[tag]` archives statically generated.

---

### 4.10 `/uses` — Uses

**Purpose.** Taste and pragmatism, cheaply. A well-known genre this audience
enjoys; also a natural inbound-link magnet.

**Sections:** hardware · editor & terminal · daily software · services ·
dotfiles link. Each entry gets one line on *why*, which is the only part worth
reading.
**Layout.** Definition-list style; dense, scannable.
**Animation.** None beyond hover.
**SEO.** Low priority; genuinely useful, so it earns links.

---

### 4.11 `/resume` — Resume

**Purpose.** Serve P1 in one click.

**Sections:** a web-readable résumé rendered from the same structured data as
`/experience` and `/skills` — one source, two presentations — plus a prominent
"Download PDF" button.
**Implementation.** The PDF is generated in CI from the web version (Playwright
print-to-PDF) so the two can never drift. Filename is versioned:
`rahul-rocket-resume-YYYY-MM.pdf`.
**Print styles.** `@media print` produces a clean single-column document: nav,
footer, and decoration removed, links expanded to show URLs.
**Accessibility.** The PDF is a fallback, not the primary — the HTML version is
fully accessible and always current.
**SEO.** `noindex` is *not* used; this page is a legitimate landing target for a
name search.

---

### 4.12 `/contact` — Contact

**Purpose.** Convert interest into a message with minimal friction.

**Sections:** a direct email (copyable, `mailto:`) · a short form · "what to
include for a fast reply" · availability and response-time expectation · social
profiles.

**Form under static export.** There is no backend. The form POSTs to a
third-party endpoint (Formspree) and degrades to a `mailto:` link with a
pre-filled subject and body if JavaScript is unavailable or the endpoint fails.
See [ARCHITECTURE.md](./ARCHITECTURE.md) §7.
**Validation.** Client-side, inline, on blur — never only on submit. Errors are
associated via `aria-describedby` and announced in a live region.
**Anti-spam.** Honeypot field + time-to-submit heuristic. **No CAPTCHA** — it is
an accessibility tax on the reader for the author's convenience.
**Accessibility.** Every input has a real `<label>`. Success and failure states
are announced, focus moves to the status message.
**SEO.** `ContactPage` structured data.

---

### 4.13 `/404` — Not Found

**Purpose.** Recover the reader.

**Sections:** a plain, non-cute explanation · search · links to the five most
useful routes · contact link.
**Implementation.** `app/not-found.tsx` exports to `404.html`, which GitHub Pages
serves for unknown paths natively ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §5).
**Accessibility.** Focus moves to the `<h1>` on load; the page is fully
navigable without JS.
**Rule.** No 404 joke animations. A reader who is lost wants a way out.

---

### 4.14 `/services` — Services

**Purpose.** Say what a piece of work with this person actually looks like, and
when it is the wrong fit.
**Primary audience.** P3 (founder / hiring manager with a budget), then P2.

**Sections:** four engagement shapes — architecture review, delivery,
incremental migration, and performance and accessibility remediation — each with
a summary, three to six concrete deliverables, and a "best for" line that names
the fit.

**The `bestFor` field is a qualifier and that is deliberate.** Telling a reader
this is the wrong engagement for them is the cheapest credibility available on a
page of this genre, and it saves both parties a call. It is a required schema
field for the same reason `method` is required on a metric.

**No rates, no availability, no client list.** Pricing depends on scope and a
number here would be meaningless or wrong; a stale availability line is worse
than none, which is why `/now` owns availability; and no client is named without
permission on record ([PERSONAL_BRAND.md](./PERSONAL_BRAND.md) §3).

**Layout.** Two-up card grid from 1024px, single column below.
**Animation.** None beyond hover.
**Accessibility.** Each card is an `<article>` under a real heading; the
deliverables are a list, not styled paragraphs.
**SEO.** `CollectionPage` + `ItemList`. Priority 0.7.

---

### 4.15 `/now` — Now

**Purpose.** A dated snapshot of current work, reading and availability.
**Full reasoning:** [redesign/ROUTING_PLAN.md](./redesign/ROUTING_PLAN.md) §1;
owned by C-12.

**Sections:** an intro, two to six titled groups of one-line items, and an
availability statement.

**The date is the feature.** `dateModified` comes from the `updated` field in
`content/now.ts` and NEVER from the build date — a `/now` that claims to have
been updated on every deploy has converted its one honest signal into noise. The
corollary is that this page going stale is *information*, not a bug.

**SEO.** `WebPage` with a real `dateModified`. Priority 0.5.

---

## 5. Cross-page systems

| System | Behavior |
| --- | --- |
| Theme | Dark default, light fully designed, respects `prefers-color-scheme`, persisted, resolved pre-paint |
| Skip link | Present on every page, first in tab order, visible on focus |
| Reading progress | Case studies and blog posts only |
| Prev/next | Case studies and blog posts only |
| Contextual CTA | Every page ends with one relevant next action |
| Command palette | Global, ⌘K, progressive enhancement |
| Focus ring | Uniform, high-contrast, never removed |

## 6. Sitemap priorities

| Route | Priority | Change frequency |
| --- | --- | --- |
| `/` | 1.0 | monthly |
| `/projects`, `/projects/[slug]` | 0.9 | monthly |
| `/blog`, `/blog/[slug]` | 0.8 | weekly |
| `/about`, `/contact`, `/resume` | 0.7 | monthly |
| `/experience`, `/skills`, `/open-source` | 0.6 | monthly |
| `/journey`, `/uses`, `/now` | 0.5 | yearly |
| `/services` | 0.7 | monthly |
| `/blog/tags/[tag]` | 0.3 | weekly |

## 7. Adding a page — the checklist

A new route PR must include: purpose statement · audience mapping · section list ·
responsive behavior at 3 breakpoints · animation plan with reduced-motion path ·
heading outline · metadata and structured data · sitemap entry · nav or footer
placement · a stated performance budget.

If any of these cannot be answered, the page is not ready to exist.

## Related

[TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) · [UI_GUIDELINES.md](./UI_GUIDELINES.md) ·
[PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) · [SEO.md](./SEO.md) ·
[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
