# COMPONENT INVENTORY

Every component the rebuild creates, its layer, and whether it costs client
JavaScript. No canonical counterpart — this document is freestanding.

Governed by [docs/UI_GUIDELINES.md](../UI_GUIDELINES.md) (anatomy, naming, the
review checklist) and [docs/ARCHITECTURE.md](../ARCHITECTURE.md) §5 (import
boundaries, enforced by Biome, already configured).

---

## 1. How to read the tables

**Layer** is the directory, and it determines what the component may import:

```
components/ui/       cross-domain primitives      → lib/, config/ only
components/layout/   the shell                    → components/, lib/, config/
components/motion/   motion primitives            → components/, lib/, config/
components/mdx/      MDX renderers                → components/, lib/, config/
components/seo/      JSON-LD emitters             → lib/, config/
features/<domain>/   domain logic + domain UI     → components/, lib/, config/
```

**Client** means the file carries `'use client'`. Every one of them is a
justification that must survive review — [PERFORMANCE.md](../PERFORMANCE.md) §2:
*"Every client component added to Home is spent from an already-overdrawn
budget."*

**The promotion rule applies** ([ARCHITECTURE.md](../ARCHITECTURE.md) §4): nothing
starts in `components/ui/` speculatively. A component listed there below is
listed because two features already need it, not because it might be reusable.

---

## 2. `components/ui/` — primitives

| Component | Client | Notes |
| --- | --- | --- |
| `button.tsx` | — | `cva` variants: `primary` `secondary` `ghost` `link` × `sm` `md` `lg`. `asChild` via Radix `Slot`. All five states in the base. |
| `magnetic.tsx` | **yes** | Wrapper adding magnetic pull + ripple to any child. `pointer: fine` + not-reduced gated; attaches nothing otherwise. ~0.7 KB |
| `card.tsx` | — | Compound: `Card` / `.Media` / `.Header` / `.Title` / `.Body` / `.Footer`. Elevation 1 + gradient hairline. |
| `spotlight.tsx` | **yes** | Writes `--mx`/`--my` to a ref's style from the shared pointer field. No React state. ~0.3 KB |
| `badge.tsx` | — | Stack tags, depth ratings, status. Text + shape, never color alone. |
| `separator.tsx` | — | Radix Separator, vendored. |
| ~~`dialog.tsx`~~ | — | **Not built, and not needed.** The native `<dialog>` + `showModal()` supplies the focus trap, `inert` background, Escape and focus restore. Budgeted at ~4.5 KB, shipped at 0 KB |
| `tooltip.tsx` | **yes** | Radix Tooltip. Never the only carrier of information. |
| `tabs.tsx` | **yes** | Radix Tabs, roving tabindex. `/skills`, `/uses`. |
| `accordion.tsx` | **yes** | Radix Accordion. Skills groups < 640px, FAQ. |
| `command.tsx` | **yes** | `cmdk`, vendored. Dynamically imported. |
| `copy-button.tsx` | **yes** | Icon swap + polite "Copied" live region, 1.5s. Inventory item 12. |
| `counter.tsx` | **yes** | `IntersectionObserver` + rAF, once. `tabular-nums` + reserved `ch` width — see [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) §3. |
| `prose.tsx` | — | The `72ch` / `68ch` measure container. Measure is enforced here, never per element. |
| `aurora.tsx` | — | `aria-hidden` backdrop: aurora composite + grain. **Pure CSS, zero JS.** |
| `gradient-border.tsx` | — | `::before` hairline. Hover changes opacity only. |
| `skeleton.tsx` | — | Matches final geometry exactly. Transform-based shimmer, off under reduced motion. |
| `icon.tsx` | — | Lucide, per-icon imports, `stroke-width: 1.75`, `aria-hidden` unless sole content. |

**Vendored, not installed** ([TECH_STACK.md](../TECH_STACK.md) §2): every Radix
and `cmdk` component is copied source, restyled to the token system. *"A
component sitting unused in `ui/` is deleted."*

**Check the platform before vendoring anything on this list.** `dialog.tsx` was
specified, budgeted, and then not needed — `<dialog>` does the job in every
browser in the support matrix. `tooltip`, `tabs`, `accordion` and `command` are
the remaining candidates, and each should be checked the same way before a
dependency entry is written for it. `popover` and `details`/`summary` cover more
than they used to.

**Nothing in this table exists yet except through M4's shell** (see §3). The
table is the inventory the rebuild creates, not a description of `src/`.

---

## 3. `components/layout/` — the shell

**Built at M4.** File names are what shipped, not what this table first guessed;
the guesses are noted because four other documents cite them.

| Component | Client | State | Notes |
| --- | --- | --- | --- |
| `site-header.tsx` | — | **built** | Server shell. Floating glass pill, elevation 2. Planned as `header.tsx` |
| `header-scroll-state.tsx` | **yes** | **built** | Hairline fade past 80px. rAF, CSS variables, no state. Planned as `header-scroll.tsx`; **opacity only, never height** — see [ROUTING_PLAN.md](./ROUTING_PLAN.md) §4 |
| `nav-link.tsx` | — | **built** | Plain `<a>` with `aria-current="page"`. Planned as `nav-primary.tsx`. Carries the long note on why this is not `next/link` |
| `mobile-nav.tsx` | **yes** | **built** | Trigger + native `<dialog>`. Full route list. Planned as `nav-mobile.tsx` |
| `site-footer.tsx` | — | **built** | Complete sitemap grouped by `nav.ts`. The no-JS safety net. Planned as `footer.tsx` |
| `skip-link.tsx` | — | **built** | First focusable on every page, targets `#main`, correct `scroll-margin-top` |
| `theme/theme-toggle.tsx` | **yes** | **built** | Icon cross-fade + 90° rotate. Announces resolved state. Lives in `components/theme/`, not `layout/` |
| `back-to-top.tsx` | **yes** | M5 | Appears past 2 viewports. A real `<button>` that moves focus, not just scroll |
| `breadcrumbs.tsx` | — | P-03 / B-03 | Case studies and posts only. `BreadcrumbList` JSON-LD |
| `page-header.tsx` | — | M6 | `h1` + one-line purpose. Every route uses it |
| `page-cta.tsx` | — | M6 | The contextual next action every page ends with |
| `command-palette.tsx` | **yes** | L-13 | Dynamic. Loads on first `⌘K` or trigger focus |
| ~~`route-announcer.tsx`~~ | — | **cut** | L-12 was built with `next/link` and reverted for +3.95 KB. Focus and announcement are the browser's on a document load — [ROUTING_PLAN.md](./ROUTING_PLAN.md) §5 |

`components/theme/` is a fourth directory the layer list in §1 does not name. It
follows the same rules as `layout/`; it exists because the theme toggle is not
part of the shell's navigation and reads better beside `lib/theme.ts`.

---

## 4. `components/motion/` — motion primitives

| Component | Client | State | Notes |
| --- | --- | --- | --- |
| `reveal.tsx` | **yes** | **built** | **`IntersectionObserver` + a CSS class.** Not Motion. The decision the budget rests on — [PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §3.1. **0.14 KB measured (M2)** |
| `stagger.tsx` | **yes** | M5 | Sets `--i` per child; CSS applies `animation-delay`. Delay is CSS, not JS |
| `text-reveal.tsx` | **yes** | M5 | Per-line clip + translate. **Never used on Home's `h1`** |
| `parallax.tsx` | **yes** | M5 | Decorative/media layers only. Shared rAF scroll subscriber |
| `motion-provider.tsx` | **yes** | M5 | `LazyMotion` + `domAnimation`, dynamically imported. Two remaining uses: the command palette and filter reflow |
| ~~`page-transition.tsx`~~ | — | **cut** | A cross-document fade needs a client router. Navigation is a document load — [ROUTING_PLAN.md](./ROUTING_PLAN.md) §5 |

**`reveal.tsx` is the load-bearing one**, and its guarantee is structural: the
served HTML has no `opacity: 0`. The CSS class is added *after* hydration, so
reduced motion, disabled JavaScript, a hydration error, and an observer that
never fires all land on "content is visible." Verified by `e2e/no-js.spec.ts`.

---

## 5. `features/` — domain UI

Each feature owns its components and exposes a barrel (`index.ts`) as its **only**
public surface. Cross-feature deep imports fail lint — F0-07, already enforced.

| Feature | Components | Client |
| --- | --- | --- |
| `home` | `hero` **(built, H-01)**, `capabilities` **(built, H-04)**, `selected-writing` **(built, H-05)**, `current-focus` **(built, H-06)**, `contact-cta` **(built, H-07)**, `eyebrow` **(built)**, `proof-strip`, `featured-projects`, `code-editor` | `code-editor` only |
| `projects` | `project-card`, `project-feature-row`, `project-filter`, `case-study-layout`, `case-study-toc`, `metric-row`, `architecture-diagram` | `project-filter`, `case-study-toc`, `architecture-diagram` |
| `blog` | `post-card`, `post-layout`, `post-toc`, `post-search`, `tag-filter`, `reading-progress`, `prev-next` | `post-search`, `post-toc`, `reading-progress` |
| `experience` | `role-card`, `year-rail`, `timeline`, `timeline-spine` | `timeline-spine` (GSAP, dynamic) |
| `skills` | `skill-group`, `skill-tag`, `depth-legend`, `depth-filter` | `depth-filter` |
| `open-source` | `repo-card`, `contribution-row`, `stat-grid`, `contribution-graph` | — (build-time data, static SVG) |
| `contact` | `contact-form`, `availability`, `channel-list` | `contact-form` |
| `about` | `facts-rail`, `principle-block`, `now-panel` | — |

**Note on `hero`, the first feature component built.** `features/home/hero.tsx`
is a Server Component and imports nothing that is not — `Section`, `Container`,
`Stack`, `Heading`, `Text`, `Button`. Its backdrop is the pure-CSS aurora, so
the section costs **zero bytes of JavaScript**. It has one piece of logic,
`lib/hero-actions.ts`, which resolves the hero's two calls-to-action against the
route manifest's `built` flag rather than hardcoding `/projects/` and
`/contact/`, neither of which exists yet; it takes its inputs as parameters so
the Phase 7 and Phase 9 states can be tested today. The feature's barrel exports
`Hero` and nothing else — the resolver is how it decides what to render, not an
API another layer composes with.

**Note on `contribution-graph`.** The brief asked for a GitHub contribution graph
with animated counters. Data is fetched **at build time** by the deploy workflow
and committed as JSON ([ARCHITECTURE.md](../ARCHITECTURE.md) §7, task C-08); the
graph renders as static SVG. Same visual, zero runtime cost, works offline — the
canonical document uses this exact feature as its worked example.

**Note on `code-editor`.** Home's animated editor. `aria-hidden` with a real text
alternative beside it, paused when off-screen, below the fold, never the LCP
element. This is where the brief's typing effect lives —
[ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) §1.2.

---

## 6. `components/mdx/` and `components/seo/`

**MDX** (B-06): `callout`, `figure`, `code-block`, `code-group`, `diagram`,
`steps`, `aside`, `metric`, `footnote`. All server components — MDX compiles at
build time and ships zero runtime. `code-block` wraps a client `copy-button`, and
that is the only client cost on a post page.

**SEO**: `json-ld.tsx` plus typed builders — `person`, `website`, `page`,
`article`, `breadcrumb`, `item-list`, `occupation`. One builder per type,
unit-tested for required fields.

**Built (H-08), and in one module rather than one file per type.** The builders
live in `lib/seo/structured-data.ts`, not the `lib/schema/` directory this
section first specified: they are eight small pure functions over one shared
pair of `@id` constants, and eight files whose imports are longer than their
bodies is indirection rather than structure. `structured-data.test.ts` pins the
required fields.

The emitter is a Server Component and costs 0 KB: a `type="application/ld+json"`
script is data the browser never executes. It escapes every `<` in the payload,
which is not theoretical hygiene — most of these builders take *authored*
content (titles, summaries, tag names) and a literal `</script>` inside a JSON
string closes the element. Putting the escape at the emitter means no later
builder has to remember it.

**One `<script>` per route, carrying a `@graph`.** `WebSite` and `Person` are
declared on `/` and referenced everywhere else by `@id` from one shared
constant, so the graph link cannot drift and a consumer sees one entity rather
than thirty. That is also why the root layout emits no JSON-LD even though
`WebSite` is site-wide: a layout cannot contribute a node to the page's graph,
so a tag there would be a second block, and nodes in separate blocks cannot
reference each other reliably. `e2e/seo.spec.ts` asserts the one-block rule.

---

## 7. `lib/` and hooks

Hooks live in `lib/hooks/`, not flat in `lib/` as this table first had them.

| Module | State | Purpose |
| --- | --- | --- |
| `cn.ts` | **built** | `clsx` + `tailwind-merge` |
| `format-date.ts` | **built** | Native `Intl`. No date library — [TECH_STACK.md](../TECH_STACK.md) §3 |
| `theme.ts` | **built** | Theme constants and the pre-paint script's contract |
| `progressive.ts` | **built** | `data-js-only` — hides controls that are dead without JavaScript. Not in the original plan; it is what makes the sheet trigger honest |
| `reveal-policy.ts` | **built** | Which elements may be hidden at mount. Keeps the no-JS guarantee in one testable place |
| `content/*` | **built** | Loaders wrapped in React `cache()`, Zod schemas. Cross-reference validation is F1-07, still open |
| `hooks/use-media-query.ts` | **built** | `matchMedia` with SSR-safe initial state |
| `hooks/use-reduced-motion.ts` | **built** | Wraps `matchMedia`, live-updating |
| `hooks/use-reveal.ts` | **built** | Shared `IntersectionObserver`, one instance for the page |
| `hooks/use-theme.ts` | **built** | ~50 lines. Replaces `next-themes` — §3.2 of the performance plan |
| `hooks/use-pointer-field.ts` | **built** | **One** listener, **one** rAF loop, many subscribers. Backs magnetic, spotlight, parallax — [PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §3.4 |
| `slug.ts` | B-03 | Slugify + heading-id extraction |
| `schema/*` | **built (H-08)** for `person` + `website`; the rest at M13 | JSON-LD builders, one per type |

---

## 8. Client-component budget on Home

The list, complete, because [PERFORMANCE.md](../PERFORMANCE.md) §2 requires each
one to have a reason:

| Component | Reason it cannot be a Server Component | State |
| --- | --- | --- |
| `theme-toggle` | Reads and writes `localStorage` | **shipped** |
| `header-scroll-state` | Scroll listener | **shipped** |
| `mobile-nav` | Open state (`showModal()`) | **shipped** |
| `reveal` / `stagger` | `IntersectionObserver` | **shipped** (reveal) |
| `magnetic` / `spotlight` | Pointer events | wanted |
| `counter` | rAF | wanted |
| `code-editor` | Timer | wanted |
| `back-to-top` | Scroll position | wanted |
| ~~`route-announcer`~~ | ~~`usePathname`~~ | **cut** — no client router |

**Home measures 111.57 KB gz against the 120 KB gate: 8.43 KB left**
(H-04…H-08). `Reveal` is back on the route — four of them, one per section
below the hero — and the four sections plus the reveal chunk together cost
**0.69 KB**. That is the whole client cost of "what I do", selected writing,
current focus and the contact CTA; the sections themselves are Server
Components, and the `Person`/`WebSite` JSON-LD is inert data the browser never
executes.

**Superseded, kept because it is the measurement the paragraph above rests on:**
Home measured **108.72 KB, 11.28 KB left** at H-01, when `Reveal` had just come
*off* the route — the placeholder that mounted it was replaced by the real hero,
which is a Server Component, and that alone returned 9.79 KB. Reveal returning
for 0.69 KB rather than 9.79 KB is the direct evidence that the cost was the
`cn` import and not the component.

**The paragraph this replaces said the 9.79 KB was React's hydration runtime. It
is not.** It is `tailwind-merge`, reaching the browser through `lib/cn.ts`; the
React runtime has been in the layout chunk since M4 and is paid by every route.
Measured: a client component with `useState` and no `cn` costs **0.27 KB**, the
same component importing `cn` costs **9.37 KB**. The full probe table is in
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §1.

**The five "wanted" rows are estimated at ~3.0 KB and 8.43 KB remains** — so on
current evidence they fit, *provided none of them imports `cn`*. That proviso is
now the whole budget question, and it is a better one than the feature-cut list
it replaces: `cn` in one client leaf costs more than all five features together.
H-10 owns it, and the decision is still one to make at M6 rather than discover
from a red build.

**The `reveal` row is the first of those estimates to be checked against a real
page**, and it came in at 0.69 KB for its chunk plus four call sites — inside
the ~0.3 KB-per-client-component figure the probe predicted, and an order of
magnitude under the 9.79 KB this table used to carry. One estimate confirmed is
not five, but it is the first evidence that the corrected model is the right one.

Everything else on Home — the hero, every card, the capability grid, the writing
list, the focus list, the contact CTA, the aurora, the grid, the grain, both
JSON-LD blocks, the footer — is a Server Component or pure CSS and ships
**zero** bytes. The backdrop was measured at exactly 0.00 KB.

---

## 9. Definition of done, per component

[UI_GUIDELINES.md](../UI_GUIDELINES.md) §12's checklist applies to every row in
this document, unchanged. The two that fail most often in a "premium" build:

- **All five interaction states defined** — default, hover, focus-visible,
  active, disabled. A glow-on-hover with no focus-visible equivalent is the
  characteristic failure of this visual style.
- **Contrast verified in both themes**, including against the new
  glass/aurora/grain contexts in
  [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §4.

## Related

[docs/UI_GUIDELINES.md](../UI_GUIDELINES.md) ·
[docs/ARCHITECTURE.md](../ARCHITECTURE.md) ·
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) ·
[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
