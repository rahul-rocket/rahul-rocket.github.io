# DESIGN SYSTEM — premium layer

**Delta on [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md).** Everything not stated
here is unchanged: the two-layer token architecture, the `--ui-*` naming rule,
the `@theme inline` bridge, OKLCH, the contrast floors, the five interaction
states. Those are correct and this document does not touch them.

What changes: **direction B is locked**, and a *surface* layer is added on top of
the existing semantic layer to produce depth — glass, aurora, grain, glow,
gradient hairlines.

---

## 1. Direction B — "Instrument" — is locked

DS-11 asked for a choice among three built directions. **B wins.**

Consequences, all in milestone M1:

- `[data-direction="editorial"]` and `[data-direction="signal"]` are **deleted**
  from `themes.css`, along with the `--sand-*`, `--ochre-*`, and `--violet-*`
  primitives in `tokens.css`. DS-11's acceptance criterion says the losing two
  are deleted; carrying them costs bytes in every stylesheet and invites someone
  to reintroduce a second accent by accident.
- `design/hero-directions.html` is reduced to the winning direction and renamed
  to reflect that it is now a reference, not a comparison.
- `--ui-font-heading` stays `--ui-font-grotesque`. The serif display face
  (`--ui-font-display`) goes with Editorial.

**Why B, against the brief's reference set.** The brief named Apple, Linear,
Vercel, Stripe, Framer, Raycast, and Figma. Five of those seven are dark-first,
low-chroma, near-neutral surfaces with a single saturated accent used sparingly.
That is a description of Direction B. Direction C's electric violet reads as the
2023–24 AI-startup default and would date the site; Direction A is genuinely
distinctive but fights the dark-first, glass, and glow requirements at every step.

---

## 2. The surface layer — a third token tier

The canonical §2 defines two tiers: *primitives* (raw OKLCH) and *semantic*
(roles). The premium look needs a third:

```
tokens.css     primitives           --ink-*, --teal-*, --space-*
themes.css     semantic roles       --ui-bg, --ui-text, --ui-accent
surfaces.css   composed surfaces    --ui-glass-*, --ui-aurora-*, --ui-glow-*   ← NEW
```

**Why a third file rather than more entries in `themes.css`.** These tokens are
*compositions* — a gradient built from three semantic colors, a shadow built from
the accent. They are derived, so they belong downstream of the layer they derive
from, and keeping them separate means `check-contrast.mjs` can keep reading
`themes.css` as the authoritative list of flat color pairs without having to
learn to parse a `radial-gradient()`.

`surfaces.css` is imported by `globals.css` after `themes.css`, and — like
`themes.css` — components consume it and nothing else.

### 2.1 Glass

```css
:root {
  --ui-glass-bg: oklch(17% 0.012 264 / 0.72);
  --ui-glass-border: oklch(100% 0 0 / 0.09);
  --ui-glass-blur: 14px;
  --ui-glass-saturate: 1.6;
}
[data-theme="light"] {
  --ui-glass-bg: oklch(100% 0 0 / 0.72);
  --ui-glass-border: oklch(0% 0 0 / 0.07);
}
```

**Three hard rules**, because `backdrop-filter` is the single most expensive
property on this list:

1. **Only on small, fixed-size, fixed-position surfaces** — the header, the
   command palette, the mobile sheet, a tooltip. Never on a card grid, never on a
   full-width section, never on anything that scrolls with the page. A blurred
   surface forces the compositor to re-sample everything behind it on every
   frame; at header size that is free, at section size it costs 8–15ms a frame on
   a mid-range Android.
2. **Never animated.** Not the blur radius, not the opacity of the blurring
   layer. Animating either re-triggers the sample.
3. **The alpha floor is 0.72.** Text on glass must clear the same contrast floor
   as text on `--ui-surface`, and it is verified as if the backdrop were the
   *lightest* thing that can sit behind it — see §4.

`@supports not (backdrop-filter: blur(1px))` falls back to opaque
`--ui-surface-raised`. That is a complete design, not a degraded one.

### 2.2 Aurora — painted, not animated

The brief asked for aurora backgrounds, animated gradients, and animated blobs.
[ANIMATION_GUIDELINES.md](../ANIMATION_GUIDELINES.md) §10 blocks *"auto-playing
video or looping background animation"*, and §1 law 3 blocks animating
`filter: blur` on a large surface. Both blocks are correct: a looping blob field
is a permanent, unattended CPU cost paid by every reader, on a page whose LCP
budget has 30 KB of negative headroom before feature one.

**The replacement is a painting.** Three overlapping `radial-gradient()`s
composed into a single `background-image` on one `aria-hidden` element:

```css
:root {
  --ui-aurora-1: oklch(80% 0.115 195 / 0.13);   /* accent, upper left  */
  --ui-aurora-2: oklch(52.5% 0.09 205 / 0.16);  /* accent-muted, right */
  --ui-aurora-3: oklch(26% 0.013 264 / 0.55);   /* ink lift, base      */

  --ui-aurora:
    radial-gradient(60% 50% at 12% 0%,   var(--ui-aurora-1) 0%, transparent 70%),
    radial-gradient(45% 55% at 88% 18%,  var(--ui-aurora-2) 0%, transparent 72%),
    radial-gradient(90% 60% at 50% -10%, var(--ui-aurora-3) 0%, transparent 100%);
}
```

Zero JavaScript, zero animation frames, zero requests, ~0.3 KB of CSS. It is
static, which is exactly why it can be large and beautiful: a still image has no
frame budget to blow. Motion is supplied instead by the *reader's* scroll moving
content across it, which costs nothing because it is already happening.

**Where aurora may appear:** the hero backdrop, the contact CTA, the 404, and
section transitions. **Never behind body prose** — canonical §3 already says
gradients are a background wash and never sit behind text, and that stands.

### 2.3 Grain

A single inline `feTurbulence` SVG as a data URI, tiled:

```css
--ui-grain: url("data:image/svg+xml,%3Csvg xmlns=…feTurbulence baseFrequency='0.8'…");
--ui-grain-opacity: 0.035;
```

~380 bytes, no network request, no decode of a raster texture. It sits on the
same `aria-hidden` backdrop element as the aurora, above it, at ≤ 4% opacity.

**The rule that makes grain safe:** it is applied to the *backdrop*, never to a
text-bearing element, and never with `mix-blend-mode` over text. Grain over
glyphs measurably reduces effective contrast at small sizes and no automated
checker will catch it.

### 2.4 Glow and gradient hairlines

```css
--ui-glow-accent: 0 0 0 1px oklch(80% 0.115 195 / 0.18),
                  0 8px 32px -8px oklch(80% 0.115 195 / 0.28);
--ui-hairline-gradient: linear-gradient(
  180deg, oklch(100% 0 0 / 0.12), oklch(100% 0 0 / 0.02) 40%, transparent
);
--ui-spotlight: radial-gradient(
  240px circle at var(--mx, 50%) var(--my, 50%),
  oklch(80% 0.115 195 / 0.10), transparent 70%
);
```

- **Gradient borders** are a `::before` carrying `--ui-hairline-gradient` behind
  a `padding-box` background, *not* `border-image` (which cannot be rounded
  correctly) and *not* an animated conic gradient (which repaints every frame).
  Hover changes the pseudo-element's **opacity** only — transform/opacity
  compliant.
- **`--ui-spotlight`** is positioned by two custom properties written directly
  to a ref's inline style from a `pointermove` handler. No React state — that is
  [ANIMATION_GUIDELINES.md](../ANIMATION_GUIDELINES.md) §5's hard rule, and the
  INP budget depends on it.
- Glow is **never the only affordance** for a state. It accompanies a border or
  a color change that a reader with a low-quality display can also see.

---

## 3. Type — working around the blocked licensing decision

DS-04 and DS-05 are `blocked`, so every face today is a system fallback. The
rebuild does **not** wait on them, and does not pretend to be finished without
them.

**What is built now.** A metric-matched fallback stack declared with
`size-adjust`, `ascent-override`, and `descent-override`, so that when the real
`woff2` lands the swap produces a measured CLS of exactly 0 — which is DS-05's
acceptance criterion, satisfied in advance rather than retrofitted:

```css
@font-face {
  font-family: "Instrument Fallback";
  src: local("Inter"), local("Helvetica Neue"), local("Arial");
  size-adjust: 97.5%;      /* tuned against the intended face's x-height */
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
```

The percentages are placeholders keyed to the *intended* face and are re-measured
the day DS-04 unblocks. That is written down here rather than left implicit,
because a `size-adjust` value that nobody re-measures is worse than none — it
silently shifts type off its grid while looking deliberate.

**Display type gets one addition:** `--ui-font-size-mega`,
`clamp(3.25rem, 1.2rem + 9vw, 8rem)`, for the hero only. The existing
`--ui-font-size-display` tops out at 5.5rem, which does not read as "massive" at
1920px and above — and the brief's large-typography requirement is legitimate
premium vocabulary, not decoration.

`--ui-tracking-mega: -0.04em`. Optical tracking must tighten as size grows or
large type reads loose and amateur.

---

## 4. The contrast script gains three composited backdrops — **built at M1**

Before M1 the script reported 96 pairs across 6 contexts. The surface layer
introduces backdrops it could not see, so it would have kept reporting green
while the hero headline sat on an unverified gradient. Three backdrops were
added:

| New backdrop | Verified against | Context name in the script |
| --- | --- | --- |
| Aurora peak | The lightest point the aurora composite can reach over `--ui-bg` | `… · aurora peak` |
| Glass over aurora | `--ui-glass-bg` at its 0.72 alpha composited over aurora peak | `… · glass over aurora` |
| Grain | `--ui-bg` with the grain layer at maximum opacity | `… · grain` (specified here as `grain-lift`) |

**The result is 128 pairs across 8 contexts, all passing.** The arithmetic is
worth spelling out, because "three contexts added" to a six-context script does
not give nine and this document originally implied it did:

```
 6   contexts before M1   (Instrument, Editorial, Signal — each × dark and light)
−4   Editorial and Signal deleted when direction B was locked
+6   three new backdrops, each declared × dark and light
──
 8   contexts, 128 pairs
```

Contexts are **per theme**. A backdrop is one design idea and two entries, and
the light theme's is the one that fails — light-theme glass over a light aurora
is where the composite gets closest to the text. Anything that counts backdrops
rather than contexts will be wrong by a factor of two.

The script gained a small alpha-compositing helper (`src over dst`, ~15 lines) to
flatten a translucent token against its backdrop before measuring. Body text must
still clear **7:1** against every one of them; large text and UI, 4.5:1.

**One gap remains, and no count will find it: DS-12.** `--ui-bg-subtle` has no
pair in the contrast contract, so text placed on it is unverifiable rather than
failing — axe caught one in the footer that this script cannot see. A green run
of 128 pairs is evidence about the 128, and nothing at all about the 129th.

**This is the load-bearing check in the whole premium layer.** Glassmorphism,
aurora, and grain are the three most common ways a beautiful portfolio quietly
fails WCAG, and all three fail *invisibly* — they look fine to a designer on a
calibrated display in a dark room. The gate is the only thing that catches it.

---

## 5. Elevation, restated for three tiers

Canonical §6 allows three elevation levels and says depth in dark mode comes from
surface lightness plus a hairline, not shadow. Unchanged. The surface layer maps
onto it rather than adding a fourth:

| Level | Composition | Used by |
| --- | --- | --- |
| 0 — page | `--ui-bg` (+ aurora backdrop where sanctioned) | Page body |
| 1 — raised | `--ui-surface` + `--ui-border` hairline | Cards, panels |
| 2 — floating | `--ui-glass-bg` + `--ui-glass-border` + `--ui-shadow-overlay` | Header, palette, sheet, popover |

A "floating card" in the brief's sense is level 1 with a gradient hairline and a
hover lift — **not** level 2. Glass on a card grid is the rule-1 violation in
§2.1, and it is also the thing that makes a portfolio look like a template.

---

## 6. Anti-patterns added to the canonical list

Canonical §11's blocker list stands, plus:

- `backdrop-filter` on any element taller than the viewport or that scrolls
- An animated gradient, conic sweep, or blob loop of any kind
- Grain or aurora behind body prose
- Glow used as the sole indicator of an interactive state
- A second accent hue introduced "just for the gradient"
- `mix-blend-mode` on any element containing text
- A `size-adjust` value copied from another project rather than measured

## Related

[docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) ·
[ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) ·
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) ·
[docs/ACCESSIBILITY.md](../ACCESSIBILITY.md)
