# ROUTING

**Delta on [docs/WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md).** Every page
specification in §4 of that document stands. This document records how the
brief's 14 requested pages reconcile with the documented route map, and specifies
the navigation model — which is where the brief and the canonical document
genuinely disagreed.

---

## 1. The brief's pages, mapped

| Brief asked for | Resolves to | Status |
| --- | --- | --- |
| Home | `/` | Documented |
| About | `/about` | Documented |
| Experience | `/experience` | Documented |
| Projects | `/projects`, `/projects/[slug]` | Documented |
| Open Source | `/open-source` | Documented |
| Blog | `/blog`, `/blog/[slug]`, `/blog/tags/[tag]` | Documented |
| **Tech Stack** | **`/skills`** | Same page, documented name |
| **Timeline** | **`/journey`** | Same page, documented name |
| Resume | `/resume` | Documented |
| Contact | `/contact` | Documented |
| **Now** | **`/now`** | **New — added** |
| **Achievements** | — | **Deferred** |
| **Speaking** | — | **Deferred** |
| **Services** | — | **Deferred** |
| — | `/uses` | Documented, kept |

### Why "Tech Stack" is `/skills` and "Timeline" is `/journey`

They are the same pages under different names, and the documented names are
better. `/skills` carries a *depth rating* per entry (Primary / Working /
Familiar) — [WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §4.4 calls this the
honesty rule and bans percentage bars and star ratings because *"they are
unfalsifiable and every reader knows it."* "Tech Stack" invites the logo wall
that [VISION.md](../VISION.md) names as portfolio failure mode #1. Same content,
and the name keeps the page pointed at the honest version of it.

The brief also asked for an "interactive technology cloud." A tag cloud sizes
words by an unstated metric, which is the same unfalsifiable claim in another
shape. The interactive element is instead **filtering by depth via URL search
params** (A-04), which is shareable and back-button correct.

### Why three routes are deferred

[WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §1 states the rule directly:
*"A route exists only when it has enough content to justify a page a reader would
not regret opening… Certifications with two entries belongs as a section on
`/about`, not a route."* `/speaking` and `/certifications` are already deferred
by name in that document, gated on **5+ substantial entries**.

| Deferred | Gate | Lives meanwhile as |
| --- | --- | --- |
| `/speaking` | 5+ talks | A section on `/about` |
| `/achievements` | 5+ entries with a verifiable third party | A section on `/about`; metrics on `/experience` |
| `/services` | A decision to take freelance work | Availability line on `/contact` |

`/services` has a second problem worth naming: [PERSONAL_BRAND.md](../PERSONAL_BRAND.md)
§3 bans salesmanship voice, and a services page is difficult to write inside that
constraint without becoming the thing the site argues against.

**Each is one file away.** The layouts, motion primitives, and content schemas
they need are all built by this plan. Adding one is a content decision, not an
engineering one.

### Why `/now` is added

It is the cheapest honest page on the site: a dated snapshot of current work,
reading, and availability. [WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §4.1
already names "Current focus" as *"the strongest signal that the site is
maintained"* — `/now` is that section with a URL and a `dateModified`.

**It was locked as a decision and then had nothing behind it for two
milestones.** `/now` appears in this plan set's four locked decisions, in the
route map below, and in [SEO_PLAN.md](./SEO_PLAN.md) §2 with its own schema — but
it was never added to `WEBSITE_STRUCTURE.md` §1, never added to
`src/config/nav.ts`, and no backlog task created it. A route that three planning
documents assume and nothing owns is the exact failure the `built` flag was
designed to make visible, and it slipped past because it was never in the
manifest to be flagged.

Both gaps are now closed: the canonical route map carries it, and **C-12** owns
building it in Phase 9. The manifest entry lands with C-12, `built: false`, like
every other unbuilt route.

---

## 2. The complete route map

```
/                          Home
/about                     About
/journey                   Timeline / professional journey
/skills                    Skills & technologies
/experience                Experience
/projects                  Projects index
/projects/[slug]           Case study
/open-source               Open source
/blog                      Blog index
/blog/[slug]               Post
/blog/tags/[tag]           Tag archive
/uses                      Uses
/now                       Now                              ← new
/resume                    Resume
/contact                   Contact
/404                       Not found  (app/not-found.tsx → 404.html)
```

16 routes. Every dynamic segment is enumerated at build by
`generateStaticParams` from the content manifest — mandatory under
`output: 'export'` ([ARCHITECTURE.md](../ARCHITECTURE.md) §7).

**What exists today: `/`, `/blog`, `/blog/[slug]`, and `404`.** The other twelve
are `built: false` in the manifest, which is why the header and footer render
Home and Blog and nothing else. `/now` is not in the manifest at all yet — see
§1. The map above is the plan; `src/config/nav.ts` is the state, and the two are
reconciled by one boolean per route rather than by anyone remembering.

---

## 3. The route manifest is the single source

`src/config/nav.ts` (task F1-08) is authoritative. **It is built** — this section
records what actually shipped, because the interface below is not the one this
plan first specified and the difference matters.

```ts
export interface StaticRoute {
  /** Site-absolute, with the trailing slash `trailingSlash: true` requires. */
  path: string
  label: string
  /** Expected `<h1>` text. Asserted by the E2E navigation spec. */
  heading: string
  /** Sitemap priority — docs/WEBSITE_STRUCTURE.md §6. */
  priority: number
  /** False while the route is not yet built. See below — this is the key field. */
  built: boolean
}
```

Consumers, as they stand:

```
config/nav.ts
   ├── Header primary nav        built
   ├── Mobile sheet              built
   ├── Footer sitemap            built  (grouped by `footerGroups`, a separate const)
   ├── e2e/routes.ts             built  — the F0-11 placeholder is closed
   ├── sitemap.ts                Q-03
   ├── Command palette           L-13
   └── Breadcrumbs               P-03 / B-03
```

`.size-limit.cjs` was listed here as an eighth consumer and is not one: it walks
`out/` and derives a budget per emitted `index.html`. That is strictly better —
it cannot miss a route the manifest forgot — and the two should stay independent.

### Four differences from the specified interface, and why each won

- **`path`, not `href`, and it carries a trailing slash.** `trailingSlash: true`
  is mandatory under `output: 'export'`, so a manifest storing `/about` would
  have every consumer append the slash independently. One of them eventually
  wouldn't.
- **`heading` was added.** It is the expected `<h1>`, asserted by the navigation
  spec, so the manifest tests the page rather than merely listing it.
- **`built` was added, and it is the most important field in the file.** The
  manifest is the complete *plan*; the header and footer render only
  `built: true`. Without it, `check-links.mjs` — which fails the build on an
  href with no file behind it — would keep the shell unmergeable until every
  Phase 5–9 page existed. Flipping one flag is the last step of building a page
  and the single edit that adds a route to nav, footer, sitemap and E2E at once.
- **`description`, `group` and `changeFrequency` were not built.** Each was
  specified for a consumer that does not exist yet: `description` for the command
  palette (L-13), `group` for a footer grouping that shipped as a separate
  `footerGroups` const, `changeFrequency` for `sitemap.ts` (Q-03). Adding fields
  ahead of their consumer is how a manifest acquires values nobody maintains.
  **They are owed** — `description` at L-13 and `changeFrequency` at Q-03 — and
  [SEO_PLAN.md](./SEO_PLAN.md) §3 depends on the latter.

This closes the note recorded against F0-11/F0-13: adding a route automatically
adds it to navigation, a11y, and SEO coverage. Forgetting to test a page is not
possible, which is the property worth having.

---

## 4. Navigation model — where the brief was overruled

The brief asked for a **mega menu** and a **floating dock**.
[WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §2 caps the primary nav at five
items: *"Five is the limit because a nav that requires reading is a nav that
failed."* A mega menu is the opposite premise — it exists to present many items
at once.

**Resolution: the header is the floating dock, and the command palette is the
mega menu.**

### The header

One element that satisfies both requirements without adding a second navigation
surface:

- A **floating glass pill**, inset from the viewport edge, not a full-bleed bar.
  That is the "floating dock" affordance, on the object that was going to be
  sticky anyway.
- Elevation level 2 ([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §5) — the one
  sanctioned place for `backdrop-filter` alongside the palette and sheet.
- **Condenses on scroll past 80px** (canonical inventory item 11) — **opacity
  only**, instant under reduced motion. This originally read "height and backdrop
  opacity", and the height half was wrong: a sticky header occupies normal flow,
  so shrinking it reflows the document under the reader's eye. That is a layout
  animation, against the "cheap" law, paid out of the 0.02 CLS budget on every
  route. The header keeps its height and fades in a hairline instead. Canonical
  item 11 has been corrected to match.
- Carries the **scroll progress rail** as a 2px `scaleX` element on its bottom
  edge (inventory item 24).

Two navigation surfaces — a header *and* a dock — would mean two tab stops for
the same links, two focus orders, and a screen reader announcing the site's
navigation twice. That is a real accessibility cost for a visual idea that one
element already delivers.

### Primary nav — five items

**About · Projects · Blog · Uses · Contact**

Unchanged from the canonical document. Experience, Journey, Skills, Open Source,
Resume, and Now are *destinations*, not entry points: reachable from `/about`,
from the footer, and from the palette.

### Command palette — the mega menu, done right

`⌘K` / `Ctrl+K`, plus a visible trigger in the header so it is discoverable
without knowing the shortcut.

| Section | Contents |
| --- | --- |
| Navigation | All 16 routes with descriptions, from `nav.ts` |
| Writing | Every post title, fuzzy-matched |
| Work | Every case study |
| Actions | Toggle theme · copy email · download résumé · view source |

It presents everything a mega menu would, with **search**, on **every page**, for
**~4 KB loaded on first invocation**. It is strictly better than a mega menu,
except that it is not visible until asked for — which the visible trigger fixes.

**It remains a pure enhancement.** [WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md)
§2: *"never the only path to anything."* Every route it reaches is in the footer
sitemap, in plain HTML, with JavaScript disabled.

### Footer

The complete site map — all 16 routes grouped by `nav.ts`'s `group` field, plus
social profiles, email, and a build line. The footer is the accessibility safety
net and the no-JS path, and it is why the primary nav can afford to be five items.

### Mobile

A focus-trapped sheet with the full route list. Escape closes, backdrop closes,
focus restores to the trigger, background is inert.

**Built on the native `<dialog>` + `showModal()`, not Radix.** The browser
supplies every one of those four behaviours, so the ~4.5 KB the plan budgeted for
a vendored dialog is 0 KB — and it handles the cases a hand-rolled or library
`keydown` trap misses, notably screen-reader virtual cursors and find-in-page.
Its trigger is hidden without JavaScript (`data-js-only`), because a button whose
only behaviour is `showModal()` is a dead control; the footer site map is the
documented no-JS path and is asserted in `e2e/no-js.spec.ts`.

---

## 4a. Breadcrumbs

`/projects/[slug]` and `/blog/[slug]` only, backed by `BreadcrumbList` structured
data. Unchanged from canonical §2.

---

## 5. Route-change behavior — navigation is a document load

**This section was specified against `next/link` and is rewritten against what
shipped.** L-12 was built as "adopt `next/link`, and manage focus so that
adopting it is not an accessibility regression". Both halves worked. Then
`size-limit` failed: client routing costs **+3.95 KB gz on every route**, and
Home went 117.79 → 121.74 KB against a 120 KB hard limit. Budgets are not
negotiable to land a feature ([CLAUDE.md](../../CLAUDE.md) §15.3), so all of it
came back out. Navigation is plain `<a>`.

| Concern | Behavior |
| --- | --- |
| Focus | The browser's. A new document starts focus at the top with the skip link first — exactly what the focus manager was recreating |
| Announcement | The document load itself. Adding a live region here would announce one navigation twice, in two phrasings |
| Transition | **None.** A cross-document fade cannot be done without a client router or a View Transition, and neither is affordable |
| Scroll | The browser's, including restoration on back/forward |
| Prefetch | **None.** There is no `next/link`, so nothing prefetches |

**Four moving parts were deleted and the behaviour is identical.** On a static
export a navigation is a cache hit and a paint, so the transition speed being
bought was close to nothing — and the guarantees above are now the platform's
rather than this codebase's, which is the stronger place for them to live.

`e2e/route-change.spec.ts` pins it: it asserts that navigation **is** a document
load, so reintroducing `next/link` for the transition fails the suite instead of
silently removing three guarantees. It drives the **footer** rather than the
header nav, because the primary nav is `hidden md:block` and a header-driven
draft timed out under the mobile project while appearing to pass.

**Consequences for two things this plan set specified elsewhere**, both now
removed at source: there is no `route-announcer.tsx`
([COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §3) and no
`page-transition.tsx` (§4), and canonical inventory item 14, "page transition —
cross-fade of main content", cannot happen. `LazyMotion`'s reserved uses drop
from four to two.

Still explicitly rejected, per canonical §6, should a client router ever be
affordable: shared-element transitions between routes, full-screen wipes, and
route loading curtains.

---

## 6. Adding a route

The checklist in [WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §7 applies
unchanged, plus one mechanical step: **add the entry to `config/nav.ts`.** That
single edit propagates to all eight consumers in §3, including the E2E and a11y
coverage. A route that is not in the manifest is not tested, and a route that is
not tested does not ship.

## Related

[docs/WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) ·
[SEO_PLAN.md](./SEO_PLAN.md) ·
[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) ·
[docs/CONTENT_STRATEGY.md](../CONTENT_STRATEGY.md)
