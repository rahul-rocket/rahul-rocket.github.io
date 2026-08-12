# DESIGN SYSTEM

The token layer: color, type, space, radius, elevation, motion primitives. Tokens
are defined **once**, in CSS, and consumed by Tailwind utilities, raw CSS, and JS
animation code alike. This single-source property is the specific reason for
Tailwind v4 ([TECH_STACK.md](./TECH_STACK.md) §2).

## 1. Principles

1. **Tokens, never literals.** A hex code, a px value, or a duration in a
   component is a review blocker. If a value is needed and no token fits, the
   token set is wrong — fix the token set.
2. **Semantic over literal naming.** `--ui-surface-raised`, not
   `--ui-gray-800`. Semantic names survive a palette change; literal ones
   force a find-and-replace across the codebase.
3. **Two layers.** A *primitive* scale (raw values) and a *semantic* layer that
   maps primitives to roles. Components consume only the semantic layer.
4. **Constrained scales.** Every scale is small enough to memorize. If a
   designer needs a value between two steps, the answer is usually to pick one
   of the two.
5. **Both themes are designed.** Light is not `filter: invert()`. Contrast is
   verified in both.

## 2. Token architecture

```
src/styles/
  tokens.css       :root { primitives }              ← Phase 2, built
  themes.css       :root (dark) / [data-theme=light] ← Phase 2, built
  surfaces.css     composed surfaces (glass, aurora, grain, glow)  ← M1, built
  globals.css      @import "tailwindcss"; @theme inline { … }  ← Phase 3
  typography.css   prose styles for MDX                        ← Phase 3
  motion.css       reveal system + interaction primitives      ← M2, built
  utilities.css    classes for tokens Tailwind has no namespace for  ← §13
```

> **Amendment, M1 — a third tier.** `surfaces.css` holds tokens that are
> *compositions*: a gradient built from three semantic colors, a shadow built
> from the accent, a translucent glass fill. They sit downstream of the layer
> they derive from, and they are a separate file so that `check-contrast.mjs`
> can keep reading `themes.css` as the authoritative list of **flat** color
> pairs without learning to parse a `radial-gradient()`.
>
> The rule for components is unchanged and now covers both files: consume
> `themes.css` and `surfaces.css`, never `tokens.css`.
>
> The contrast script reads `surfaces.css` separately, flattens translucent
> tokens by **alpha compositing in gamma-encoded sRGB** (the space browsers
> actually blend in — compositing in linear light reports ratios that are wrong
> in the *passing* direction), and re-runs every pair in §3 against the result.
> That added three composited contexts per theme: aurora peak, glass over
> aurora, and grain. It caught two real failures on the first run — the light
> aurora dropped accent links to 4.13:1 and warning to 4.09:1 against a 4.5
> floor — which is the entire argument for the check: those two would have
> looked fine to anyone judging by eye.
>
> Full detail: [redesign/DESIGN_SYSTEM.md](./redesign/DESIGN_SYSTEM.md) §2.

**Why primitives live in `:root`, not in `@theme`.** `@theme` only exists inside
Tailwind's compilation context. Three consumers need these values *outside* it:
raw CSS and JS (GSAP, canvas), `scripts/check-contrast.mjs`, and the standalone
`design/*.html` mockups opened over `file://`. Declaring them in `@theme` would
leave all three reading nothing. Phase 3's `globals.css` bridges the two with
`@theme inline`, which maps Tailwind's namespace onto the existing variables —
so Tailwind utilities work without a single value being duplicated. The
single-source property is preserved; only its declaration site moved.

> **Resolved, Phase 3 (F0-04) — option 1 was taken.** The token side is now
> prefixed `--ui-`, and `globals.css` bridges it with
> `@theme inline { --color-bg: var(--ui-bg); … }`. The rule is one line: **a
> variable whose name Tailwind v4 would own is prefixed `--ui-`.** The owned
> namespaces are `--color-*` `--font-*` `--text-*` `--leading-*` `--tracking-*`
> `--radius-*` `--ease-*` `--shadow-*`. Names Tailwind does not own — `--ink-*`,
> `--space-*`, `--duration-*`, `--width-*`, `--border-hairline` — were left
> alone, because nothing forced them to change and a rename with no reason is
> just churn.
>
> Two details worth carrying forward:
>
> - The type scale is `--ui-font-size-h1`, not `--ui-text-h1`, so that a size
>   token can never be misread as one of the `--ui-text*` foreground **colors**.
> - `inline` is load-bearing, not decoration. A plain `@theme` copies the value
>   Tailwind resolves at build time — the dark theme's — and every utility would
>   be frozen in dark. `@theme inline` emits `var(--ui-bg)` into the utility, so
>   the `[data-theme="light"]` swap still flows through at runtime.
>
> The cost was as estimated: `themes.css`, `tokens.css`, `check-contrast.mjs`,
> and both `design/*.html`. `check-contrast.mjs` still reported 96 pairs across 6
> contexts, all passing — the same numbers as before the rename, which is the
> evidence that the rename was mechanical and changed no value. (M1 then took it
> to **128 pairs across 8 contexts**: four direction contexts deleted, six
> composited backdrop contexts added. The arithmetic is in
> [redesign/DESIGN_SYSTEM.md](./redesign/DESIGN_SYSTEM.md) §4.)
>
> One ergonomic wart is accepted rather than hidden: the color role is
> `text-muted`, and Tailwind's foreground-color utility prefix is also `text`, so
> the utility reads `text-text-muted` (and `bg-bg`, `border-border`). Renaming
> the roles to shadcn's `foreground`/`background` vocabulary would read better
> but would put §3's role table out of step with the code, which is the more
> expensive kind of wrong.
>
> The original analysis is kept below because the failure mode is subtle and
> someone will hit it again.

> **Correction, Phase 3 (F0-04).** The bridge described above does not work as
> written, and the reason is worth stating rather than quietly patching. The
> token names chosen here — `--color-*`, `--font-*`, `--text-*`, `--radius-*`,
> `--ease-*`, `--leading-*`, `--tracking-*`, `--shadow-*` — are exactly the
> namespaces Tailwind v4 reserves for its own theme variables. A bridge entry
> would read `--color-bg: var(--color-bg)`. Both declarations land on `:root`,
> so the variable resolves to itself and the utility emits nothing.
> `@theme inline` only works when the source variable has a name Tailwind does
> not own.
>
> One of the two sides must be renamed. The options, in order of preference:
>
> 1. **Rename the semantic layer to a `--ui-*` prefix** (`--ui-bg`,
>    `--ui-text-muted`), and bridge with `@theme inline { --color-bg:
>    var(--ui-bg); }`. This is the convention shadcn/ui adopted for v4 and the
>    one most contributors will recognise. Cost: touching `themes.css`,
>    `check-contrast.mjs`, and both `design/*.html` mockups — all of which
>    reference the current names.
> 2. **Keep `--color-*` and generate utilities with `@utility` instead**, one
>    declaration per property/token pair. No renaming, but a long hand-written
>    file that must be kept in step with the token set — i.e. a second source in
>    everything but name.
> 3. **Use no token utilities at all**, styling from `var()` in plain CSS. Loses
>    the ergonomics that justified Tailwind in [TECH_STACK.md](./TECH_STACK.md)
>    §2 in the first place.
>
> Option 1 is the recommendation.

```css
/* tokens.css — primitives. Nothing here is semantic. */
:root {
  --ink-50: oklch(97.5% 0.004 264);
  --ink-1000: oklch(9.5% 0.010 264);
  --teal-500: oklch(80% 0.115 195);
  --teal-700: oklch(52.5% 0.090 205);
  --ui-font-grotesque: "Neue Haas Grotesk Display", "Inter", ui-sans-serif, system-ui;
  --space-section: clamp(4rem, 10vw, 9rem);
  --ui-ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
}

/* themes.css — semantic layer. Components consume ONLY these. */
:root {
  --ui-bg: var(--ink-1000);
  --ui-surface: var(--ink-900);
  --ui-text: var(--ink-50);
  --ui-text-muted: var(--ink-300);
  --ui-border-strong: var(--ink-500);
  --ui-accent: var(--teal-500);
  --ui-focus: var(--ink-50);
}
[data-theme="light"] {
  --ui-bg: var(--ink-50);
  --ui-text: var(--ink-950);
  --ui-accent: var(--teal-700); /* two stops darker — see §3 */
  --ui-focus: var(--ink-950);
  /* …full remap, not an inversion */
}
```

Note the accent flips from a light step in dark mode to a dark step in light
mode. The same hue at the same lightness cannot clear 4.5:1 on both near-black
and near-white; a palette that uses one value for both has silently failed in
one of them.

**Why OKLCH.** Perceptually uniform: lightness steps look evenly spaced, and a
hue can be shifted without accidental luminance changes that break contrast.
Supported in every browser in the support matrix ([PERFORMANCE.md](./PERFORMANCE.md) §8).

## 3. Color

### Roles

| Semantic token | Role |
| --- | --- |
| `--ui-bg` | Page background |
| `--ui-surface` / `--ui-surface-raised` | Card, popover |
| `--ui-text` / `--ui-text-muted` | Body / secondary |
| `--ui-border` / `--ui-border-strong` | Hairlines / emphasized edges |
| `--ui-accent` / `--ui-accent-muted` | Signature hue, interactive emphasis |
| `--ui-focus` | Focus ring — always distinct from accent |
| `--ui-success` / `--ui-warning` / `--ui-danger` | Status only |

### Rules

- **One accent, plus a decorative spectrum (DS-14).** A single signature hue (a
  cool teal-cyan in the `195` range) carries *identity and meaning*: links,
  focus, active states, filled controls, the current-page marker. Two further
  hues — indigo `265` and violet `305` — exist for **light only**, in gradients
  that carry no information. The test a reviewer applies is one question:

  > Could a reader who sees this hue as grey miss something?
  > **Yes** → it is an accent, and it must be teal.
  > **No** → it is spectrum, and it may be indigo or violet.

  Concretely: the spectrum may appear in the page mesh, a display-heading fill,
  a glow, a decorative rule. It may never be a text colour that carries meaning,
  a control border, or the only difference between two states. It is **not
  bridged into Tailwind** — there is deliberately no `text-spectrum-2` utility,
  because the way to make this rule unbreakable is to not compile the utility
  that breaks it (see the note in `globals.css`).

- **Gradients on text are permitted at display sizes, and the rule is the WCAG
  large-text threshold rather than a judgement.** `--ui-gradient-text` opens at
  `--ui-text` and only runs into the spectrum after 16% of its length, so a
  heading is at full body-text contrast where it starts reading and the tail
  sits between the 3:1 large-text floor and the 4.5:1 body floor. It is
  therefore allowed exactly on the steps whose *smallest* clamp value clears
  24px — `mega` (52px), `display` (44px), `h1` (32px) — and forbidden on `h2`
  (24px, no margin) and `h3` (20px). `Heading`'s type enforces this: 
  `<Heading size="h3" gradient />` does not compile. It degrades to solid text
  without `background-clip`, under `forced-colors`, and in print.
- **Contrast floors.** Body text ≥ 7:1 (AAA). Large text and UI ≥ 4.5:1.
  Non-text UI boundaries ≥ 3:1. Verified in both themes in CI
  ([ACCESSIBILITY.md](./ACCESSIBILITY.md) §6).
- **Never color alone.** Any state signalled by color also has text, an icon, or
  a shape.
- **`--ui-text-subtle` is a large-text token, and that is a constraint, not a
  hint.** It is verified at 3:1, which is the AA bar for text ≥ 24px (or ≥ 18.66px
  bold). Used below that size it fails 4.5:1 and axe rejects the page — which is
  exactly what happened when the blog index rendered its date and reading-time
  meta line at `text-sm`. If the text is small, the token is `--ui-text-muted`.
  The two are one step apart in the ink scale and it is an easy, silent mistake:
  `check-contrast.mjs` passes, because the token meets *its own* contract, and
  only the rendered-page a11y job catches the misuse.
- **Muted text has a floor.** `--ui-text-muted` must still hit 4.5:1. "Elegant
  low-contrast gray" is the most common accessibility failure in portfolio
  design and it is banned here.

## 4. Typography

### Families

| Role | Face | Loading |
| --- | --- | --- |
| Display (h1–h2, hero) | A distinctive geometric/grotesque with real character | `next/font/local`, subset, `woff2`, preloaded |
| Text (body, UI) | A highly readable neutral sans | Same |
| Mono (code, metrics) | A code face with good legibility at 13–14px | Same, loaded only on routes with code |

**Rules.** Self-hosted only — no Google Fonts CDN (privacy, and a third-party
connection on the critical path). Total font budget **≤ 120 KB** across all
faces and weights. Maximum **four** font files: display 500 + text 400/600 +
mono 400. Latin subset only. `font-display: swap` with a metric-matched fallback
via `size-adjust`, so the swap causes no layout shift — CLS from font swap must
be 0.

### Scale

Fluid, `clamp()`-based, ratio ≈ 1.25 at mobile widening to ≈ 1.333 at desktop:

| Token | Use | Range |
| --- | --- | --- |
| `--text-display` | Hero h1 | 2.5rem → 4.5rem |
| `--text-h1` | Page h1 | 2rem → 3rem |
| `--text-h2` | Section | 1.5rem → 2rem |
| `--text-h3` | Subsection | 1.25rem → 1.5rem |
| `--text-body` | Prose | 1rem → 1.125rem |
| `--text-sm` / `--text-xs` | Meta, labels | 0.875rem / 0.8125rem |

**Never below 0.8125rem (13px)** for any text a reader must read.

### Prose rules

- Measure: 65–72ch. Enforced by a `prose` container, not per-element.
- Line height: 1.65 body, 1.15–1.25 display.
- Letter-spacing: slightly negative on display (−0.02em), zero on body.
- Headings never use `text-transform: uppercase` on multi-word phrases — it
  harms scanning and screen-reader pronunciation in some engines.

## 5. Spacing and layout

A 4px base with a constrained scale: `0.5 1 1.5 2 3 4 6 8 12 16 24` (×4px).

| Token | Value |
| --- | --- |
| `--space-section` | `clamp(4rem, 10vw, 9rem)` — vertical rhythm between sections |
| `--space-gutter` | `clamp(1rem, 5vw, 2rem)` — page side padding |
| `--width-prose` | `72ch` — the reading measure, for continuous body copy |
| `--width-container` | `1440px` — the layout container. It constrains LAYOUT, not measure: prose routes use `--width-prose` via `PageContainer width="reading"`, so widening this widened the header, the footer site map and the card grids and left every reading column untouched. |
| `--width-headline` | `16ch` — display measure for the mega hero heading (H-01) |
| `--width-lede` | `56ch` — display measure for a scanned lede (H-01) |
| `--hero-min-height` | `85svh` — the hero frame; see below |

**The two display measures are not the reading measure, and confusing them is
the mistake they exist to prevent.** `--width-prose` answers "how wide before a
line is tiring to read". The other two answer the opposite question: the text is
short, so the risk is a single line running the full 1440px container. Capping
the mega heading at 16ch is also what makes `text-wrap: balance` produce a
deliberate two-line shape rather than whatever the viewport happens to allow.

**`--hero-min-height` is a rule with a name.**
[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.1: *"Hero ≈ 85vh, never 100vh
— a visible content edge tells the reader to scroll."* 100vh is what a component
author reaches for by default and the difference is invisible in a diff, so the
intent is a token rather than a number. It is `svh` rather than `vh` because on
mobile browsers `vh` measures the viewport with the URL bar retracted — an 85vh
hero is taller than the visible screen on first paint, which removes the content
edge the rule exists to guarantee.

**Breakpoints** (mobile-first): `sm 640` · `md 768` · `lg 1024` · `xl 1280` ·
`2xl 1536`. Layout decisions are made at `lg` and `xl`; `sm`/`md` mostly adjust
type and padding.

**Rule.** Vertical rhythm is owned by the section wrapper, never by margins on
the last child. No `margin-bottom` on components — spacing is the parent's job.

## 6. Radius, borders, elevation

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 6px | Badges, inputs |
| `--radius-md` | 10px | Buttons, cards |
| `--radius-lg` | 16px | Panels, dialogs |
| `--radius-full` | 9999px | Pills, avatars |

**Elevation is not shadow-first.** In dark mode, shadows are nearly invisible;
depth comes from **surface lightness + a 1px border**. A shadow token exists but
is used only for genuinely floating layers (dialog, popover, dropdown). Three
elevation levels total — a fourth means the layout is confused.

## 7. Motion tokens

Owned here, applied per [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md).

| Token | Value | Use |
| --- | --- | --- |
| `--duration-instant` | 100ms | Color/opacity hover |
| `--duration-fast` | 150ms | Small transforms |
| `--duration-base` | 250ms | Reveals, most transitions |
| `--duration-slow` | 400ms | Entrances, dialogs |
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances (default) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Two-way transitions |
| `--ease-spring` | spring(stiffness 260, damping 30) | Interactive/physical feel |

Nothing exceeds 400ms except a deliberate, documented scroll-scrubbed timeline.

## 8. Iconography

Lucide, imported per-icon (tree-shaken), rendered at 16/20/24px with
`stroke-width: 1.75`. Icons are `aria-hidden` unless they are the sole content of
a control, in which case the control carries an `aria-label`. **No icon fonts.**
No mixing icon sets — one set is a brand decision.

## 9. Focus and interaction states

Every interactive element defines all five states: default, hover, focus-visible,
active, disabled. A component PR missing one is incomplete.

```css
:focus-visible {
  outline: 2px solid var(--ui-focus);
  outline-offset: 2px;
  border-radius: inherit;
}
```

`outline: none` without an equally visible replacement is a **hard blocker**.
Hover effects must not be the only affordance — touch and keyboard users never
see them.

## 10. Dark / light implementation

- `data-theme` attribute on `<html>`, set by an inline script **before first
  paint** to prevent a flash. This script is the one permitted render-blocking
  inline script on the site.
- Default: system preference; explicit choice persists to `localStorage`.
- `color-scheme` CSS property set so form controls and scrollbars match.
- Both themes ship in one stylesheet — no theme-swap network request.

## 11. Governance

**Adding a token** requires: the existing scale genuinely has no fit; a semantic
name; values for both themes; a contrast check if it is a color.
**Removing a literal** is always allowed and never needs discussion.

**Anti-patterns (review blockers)**
- Arbitrary Tailwind values in components: `text-[#3ab]`, `mt-[37px]`
- A duration or easing written inline in JS
- A new gray introduced because an existing one "looked slightly off"
- Any `!important`
- Theme-conditional logic in JS where a CSS variable would do

## 12. Extensibility

- **Rebranding** = editing `@theme` primitives. Semantic names and every
  component stay untouched.
- **A third theme** (e.g. high-contrast) = one more `[data-theme]` block.
- **A design-token export** for Figma is a JSON generation script over the same
  CSS variables — no second source.

## 13. The component layer — `src/components/ui/`

Built after §1–§12, and it is where every rule above stops being a document and
starts being a type error. Nothing here is a page and nothing here holds domain
logic; each file is a token consumer thin enough that its whole job is to make
one rule unbreakable.

| Component | The rule it enforces |
| --- | --- |
| `button` | §9's five states, in the **base** rather than per variant; 44px touch floor |
| `heading` | Level and size are **separate props** — UI_GUIDELINES §4's "a heading level chosen for its size is a blocker" |
| `text` / `SubtleText` | `--ui-text-subtle` is reachable only through the component that fixes the size large (§3) |
| `container` | The 72ch measure is a **container**, never per element (§4) |
| `section` | Vertical rhythm belongs to the wrapper, never to a child's margin (§5) |
| `stack` / `grid` / `AutoGrid` | Space is `gap`, never margin; the breakpoints are §5's five |
| `surface` | Three elevation levels, shadow on the floating one only (§6) |
| `card` | Composition over configuration; media reserves its ratio |
| `badge` | Status is a word plus a colour, never a colour |
| `divider` | Decorative rules are `aria-hidden`; `<hr>` needs no ARIA |
| `icon` / `icons` | 16/20/24px, `stroke-width: 1.75`, `aria-hidden` **by default** (§8) |
| `skeleton`, `prose`, `visually-hidden`, `slot` | UI_GUIDELINES §9, §4, and `asChild` |

Five decisions in it differ from, or extend, what §1–§12 say. Each is here
rather than only in a commit message because each looks like an oversight
otherwise.

**1. The icon set is vendored, not installed.** §8 says "Lucide, imported
per-icon (tree-shaken)". `lucide-react` is *not* a dependency: the geometry is
copied into `src/components/ui/icons.tsx` under Lucide's ISC licence, which is
the same treatment TECH_STACK §2 gives shadcn/ui ("copied source, not an
installed package"). An icon is ~15 lines of path data with no behaviour, Home's
headroom is 2.21 KB against a hard 120 KB gate, and vendoring makes §8's "one
set" structural — there is one file, and a second set cannot arrive without
visibly pasting a foreign shape into it. §8's intent is unchanged; only where
the paths live moved.

**2. `asChild` is a 34-line local `Slot`, not `@radix-ui/react-slot`.**
UI_GUIDELINES §1 names Radix's `Slot`, and Radix still arrives with the first
component whose *value* is behaviour — dialog, menu, tooltip, where focus traps
and roving tabindex are the entire point. `Slot` is not one of those; its whole
contract is "clone the child, merge className and style, chain handlers". When
Radix lands, `slot.tsx` is deleted in the same change.

**3. Four duration utility classes were added** (`utilities.css`). Tailwind v4
owns `--ease-*`, which globals.css bridges, but has **no `--duration-*` theme
namespace** — a duration token can only reach a utility as
`duration-[var(--duration-fast)]`, and an arbitrary value is precisely what §11
lists as a review blocker. `.duration-instant|fast|base|slow` close that hole.
There is no class beyond `slow`, because §7 says nothing exceeds 400ms.

**4. The five breakpoints in §5 are now declared** as `--breakpoint-*` in
globals.css. They are identical to Tailwind's defaults, so no output changes —
which is the point: the documented set and the compiled set are provably the
same list rather than two lists that happen to agree, and a sixth is visible in
review.

**5. `Section` offers no `--ui-bg-subtle` surface.** DS-12 is open against that
token precisely because the contrast contract has no text pair for it, so
`check:contrast` cannot see a failure there — axe found one in the footer. A
section always carries text, and offering the one surface not verified to hold
any would be shipping the known hole behind a friendly prop.

**Not yet consumed.** No page renders these — Phase 5 onwards does. TECH_STACK
§2's "a component sitting unused in `ui/` is deleted" therefore comes due at the
first milestone that builds a page: anything still without a call site then goes.

## 14. The spectrum, the tones, and the page mesh (DS-14)

Added in the visual redesign. Three ideas, one purpose: give the site depth and
per-route identity without a second layout, a second accent, or a byte of
JavaScript.

### The spectrum

Three hues roughly 70° apart in OKLCH — teal `195`, indigo `265`, violet `305`.
Closer together and a mesh built from them reads as a smudge of one colour;
further apart and it reads as two designs arguing. Chroma is held near the
teal's so no stop dominates. Only the teal is an accent; see §3.

### The tones

A **tone** rotates which spectrum hue leads the page backdrop and where its mass
sits. It is three custom properties, set by `data-tone` on `<PageBackdrop />`.
Layout is where consistency lives; light is where identity varies for free.

| Tone | Lead hue and weight | Routes |
| --- | --- | --- |
| *(default)* | Teal top-left, indigo answering right | `/`, `/about` |
| `work` | Indigo, mass right and high | `/projects`, case studies, `/services`, `/open-source` |
| `writing` | Violet, mass left and high | `/blog`, posts, tag archives, `/uses` |
| `record` | Teal, low and wide, almost no violet | `/experience`, `/journey`, `/skills`, `/resume`, `/now` |
| `contact` | All three converging on centre | `/contact` |

Tones are named for the **kind of page**, never for the hue: `data-tone="work"`
survives a palette change and `data-tone="indigo"` would put a literal colour
name in the markup, which §1.3 exists to prevent.

**Every tone is verified.** `scripts/check-contrast.mjs` generates its contexts
from a `TONES` list and composites each tone's aurora peak, header glass and
panel glass in both themes — 1,134 assertions across 42 contexts. A tone added
to `surfaces.css` and not to that list is the one edit that can silently
reintroduce an unverified backdrop, and the script carries a warning saying so.

### The page mesh

One `position: fixed` layer behind the whole document (`.u-page-backdrop`),
carrying the tone at about 40% of the hero aurora's strength. Fixed is a cost
decision, not a placement one: a fixed layer is painted once into its own
compositor layer and is not repainted as the document scrolls.

It is rendered by the **page**, not by the root layout, and the reason is worth
knowing before someone "fixes" it: a tone is a set of custom properties,
properties reach an element by inheriting from its *ancestors*, and a backdrop
mounted in the layout is a sibling of everything a page can annotate. Mounted
there, all fourteen routes render the default arrangement while the code reads
as though each has its own — a silent failure. See `page-backdrop.tsx`.

### What DS-12 changed

`--ui-bg-subtle` had **no pair** in the contrast contract. That is why the
footer and `Section` avoided it: a role the checker cannot see is a role that
can fail silently, and it did — axe rejected four routes in the light theme
while `pnpm check:contrast` reported "all pass". The fix was not to keep
avoiding the role but to give it the assertions every other surface had. Text,
muted text, subtle meta, accent, the strong border and all three status colours
are now asserted against it in both themes and all five tones. It is verified,
so it is used: the footer, `Section surface="subtle"`, and the badge fill.

The same pass added status colours on `--ui-surface`, which had been unverified
since the first status badge was rendered on a card.

## Related

[UI_GUIDELINES.md](./UI_GUIDELINES.md) · [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) ·
[ACCESSIBILITY.md](./ACCESSIBILITY.md) · [PERSONAL_BRAND.md](./PERSONAL_BRAND.md)
