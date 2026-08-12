# ANIMATION GUIDELINES

Motion on this site has a job: make structure legible and interaction
responsive. Motion that exists to be noticed is a defect, because it spends the
reader's attention on the decoration instead of the argument.

## 1. The four laws

1. **Motion must survive removal.** If disabling all animation makes the page
   confusing or incomplete, the animation was load-bearing in the wrong way.
   Every animation's reduced-motion state is the *finished* state, never a
   hidden one.
2. **Motion must be fast.** Interaction feedback ≤ 150ms. Entrances ≤ 400ms.
   Anything longer is a scroll-scrubbed timeline the reader controls, or it is
   cut.
3. **Motion must be cheap.** `transform` and `opacity` only — the two properties
   the compositor can animate without layout or paint. Animating `width`,
   `height`, `top`, `left`, `margin`, or `filter: blur` on a large surface is a
   review blocker.
4. **Motion must run once.** Scroll reveals fire a single time
   (`viewport={{ once: true }}`). Re-animating on every scroll-by is the single
   most common way a portfolio becomes exhausting to read.

## 2. Reduced motion — the contract

```tsx
const reduced = useReducedMotion();
<motion.div
  initial={reduced ? false : { opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '0px 0px -15% 0px' }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
/>
```

`initial={false}` — not `initial={{ opacity: 1 }}` — so no animation is
registered at all under reduced motion.

Global CSS backstop, so a missed component cannot regress the guarantee:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

This is the **only** sanctioned `!important` in the codebase
([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §11).

Under reduced motion: Lenis is disabled entirely, GSAP ScrollTriggers are not
created, the scrubbed timeline renders in its final state, and opacity-only
cross-fades ≤ 150ms are still permitted (they do not trigger vestibular
responses and preserve a sense of state change).

## 3. Motion inventory

Everything animated on the site, exhaustively. Anything not on this list needs a
justification in its PR.

| # | Where | What | Duration / ease | Reduced-motion |
| --- | --- | --- | --- | --- |
| 1 | Hero (Home) | Stagger **rise only, no fade** — 18px, 3 elements, `--enter-index` | 400ms, `ease-out-quint`, 70ms stagger | Not applied at all |
| 2 | All sections | Reveal: opacity 0→1, y 24→0, once | 250ms | Rendered final |
| 3 | Cards | Hover: 2px lift, border → accent | 150ms | Color only |
| 4 | Buttons/links | Color and 1px underline offset | 100ms | Kept |
| 5 | Theme toggle | Icon cross-fade + 90° rotate | 200ms | Cross-fade only |
| 6 | Mobile nav | Sheet slide-in + backdrop fade | 250ms | Instant, backdrop fade only |
| 7 | Command palette | Scale 0.98→1 + fade | 150ms | Fade only |
| 8 | Journey timeline | `animation-timeline: view()` spine draw (no GSAP) | Scroll-linked | Spine complete, static |
| 9 | Case study diagram | GSAP scrub: SVG path draw-on | Scroll-linked | Diagram complete |
| 10 | Reading progress | Width via `transform: scaleX` on a ref | Frame-linked | Kept (it is information) |
| 11 | Header | Condense past 80px — **hairline opacity only, never height** | 200ms | Kept, instant |
| 12 | Copy button | Icon swap + "Copied" for 1.5s | 150ms | Kept |
| 13 | Skills filter | Layout reflow of tag list | 200ms `layout` | Instant |
| ~~14~~ | ~~Page transition~~ | **Cut** — navigation is a document load | — | — |
| 25 | Page + hero backdrop | `u-drift` — scroll-linked parallax on the mesh, ≤6% translate | Scroll-linked | Not applied at all |
| 26 | Hero backdrop | `u-enter-backdrop` — one-shot bloom, `scale(1.08)` → none | 700ms, `ease-out-quint` | Not applied at all |
| 27 | Cards (interactive only) | `u-lift` — 3px rise + glow opacity on a `::after` | 250ms | Not applied at all |
| 28 | Primary button | `u-beam` — sheen swept by `transform`, hover **and** focus-visible | 400ms | Not applied at all |
| 29 | Header | `u-header-rule` — spectrum hairline opacity past the scroll threshold | 150ms | Kept, instant |
| 15 | Primary buttons (hero, CTA) | **Magnetic pull** — `.u-magnetic`, `translate` toward the pointer, capped at 6px, released outside the field | rAF-coalesced, 250ms `ease-out-quint` | Lean not applied — the translate sits inside `no-preference` |
| 16 | Hero panel, proof strip | **Spotlight** — `.u-spotlight`, `--mx`/`--my` drive a radial gradient's position | Frame-linked, opacity only | **Kept** — a paint, not a movement |
| 17 | Cards, inputs, panels | **Gradient hairline** — `::before` opacity 0.4→1 on hover/focus | 150ms | Kept, at full opacity |
| ~~18~~ | ~~Proof strip~~ | **Cut — replaced by 30.** A count-up needs the rendered text to differ from the accessible text for the length of the run: JS rewriting `textContent` announces a stream of wrong numbers, and CSS `counter()` is not reliably exposed to the accessibility tree at all. Both trade a guarantee for a flourish. | — | — |
| 19 | Section headings (never `h1` on Home) | **Text reveal** — per-line `translateY` + opacity behind a clip | 400ms total, 40ms per line | Rendered final |
| 20 | Images, diagrams | **Image reveal** — overlay panel `translateX` off | 400ms, `once` | Rendered final |
| 21 | Hero backdrop, section dividers | **Parallax** — decorative and media layers only, `translate3d` from scroll ratio | Frame-linked | Not registered; layers at rest |
| 22 | Home, below fold | **Code editor typing** — `aria-hidden`, paused off-screen | 40ms/char, once | Final state, full text |
| 23 | Buttons | **Ripple** — `::after` scale + fade from pointer origin | 400ms, `once` per press | Omitted |
| 24 | Header | **Scroll progress rail** — `scaleX` from a CSS scroll timeline, **no ref, no JS** | Scroll-linked | Kept — it is information |
| 25 | Filter grids | **Layout shift** — Motion `layout` on filtered items | 200ms | Instant |
| 26 | Back-to-top button | **Reveal after one viewport** — opacity + `visibility` from a CSS scroll timeline, no JS | Scroll-linked, first 100vh | Kept — it is an affordance, not decoration |
| 30 | Proof strip figures | `u-rise` — the figure wipes up into a clipping host on a `view()` timeline. The real text is in the DOM the whole time and the accessible name never changes, which is what 18 could not offer | Scroll-linked, `entry 10%` → `cover 26%` | Not applied at all |
| 31 | Hero status panel | `u-float` — scroll-linked drift, ≤3.5rem, on the container and never on its text (§10 bans parallax on text) | Scroll-linked, `exit` range | Not applied at all |
| 32 | Header nav, hero disciplines, panel links | `u-sweep` — spectrum underline `scaleX(0)` → `1`, origin flipping left/right so it grows in and retreats the way it came | 250ms `ease-out-quint`, hover **and** focus-visible | Kept, instant |

**Items 15, 16 and 21 said "not registered — no listener attached" for four
milestones, and that was accurate: `usePointerField` and `.u-spotlight` were
both written, documented and shipped, and nothing in the repository called
either.** Two complete halves of an effect with no wire between them is the most
expensive kind of dead code, because it reads as finished in review.
`components/motion/pointer-effects.tsx` is the wire. It is mounted once in the
shell, renders nothing, tracks the pointed-at element by delegated `pointerover`
rather than by `elementFromPoint` — which forces a synchronous layout on every
frame the pointer moves — and drives every decorated element through `data-`
attributes, so `Card`, `Button` and the panels stay Server Components.

**Item 16 is kept under reduced motion, and that is the one entry in this table
where the distinction is worth stating.** A spotlight is a *paint*, not a
movement: nothing translates, nothing scales, and the only animated property is
the layer's own opacity. Removing it for a reader who asked for less motion
would take away a legibility cue they did not ask to lose. The magnetic lean in
item 15 genuinely is movement, so only that half sits inside the
`no-preference` query — the JS and the CSS agree on the split rather than one of
them guessing.

**Item 16 is also the one effect on the site whose contrast was unverifiable
until it was named.** `.u-spotlight` sets `isolation: isolate`, so its
`z-index: -1` pseudo-element paints *after* the host's background and *before*
the host's text — the glow sits between the panel and the words on it, and is
therefore the real backdrop for every text role there while a pointer is over
the surface. `check:contrast` parses flat colours and could not see a stop
inside a radial-gradient; axe does not evaluate hover states at all. The peak is
now `--ui-spotlight-peak`, the gradient's only consumer, and
`scripts/check-contrast.mjs` composites it over the panel glass over the aurora
peak in both themes and all five tones. It passes; it was not *known* to pass
before.

**Items 10, 12, 24 and 26 are kept under reduced motion deliberately:** they
convey state, not decoration. Reduced motion means "no vestibular triggers," not
"no feedback."

**Items 24 and 26 shipped as CSS scroll-driven animations, not as refs, and one
consequence had to be verified rather than assumed.** §4's rule — "if a
transition can be done with a CSS class, it must be" — applies to scroll-linked
motion too, now that `animation-timeline: scroll()` exists: no subscriber, no
per-frame work on the main thread, and nothing that can be broken by hydration.
The catch is §2's global backstop, which forces `animation-duration: 0.01ms
!important` onto every animation. Applied to a progress-based timeline that would
slam the rail to full width at the first pixel of scroll — not reduced motion,
but **false information**. It does not, because a scroll timeline resolves its
own duration and ignores `animation-duration`; that was measured in Chromium
under emulated `prefers-reduced-motion: reduce` before either shipped, and
`e2e/shell.spec.ts` asserts it so the backstop and the rail cannot silently
diverge. **No second `!important` was needed, and the one in themes.css remains
the only one in the codebase.**

Both are gated on `@supports (animation-timeline: scroll())`, and the fallback is
**absence**: a rail frozen at zero, or a floating button pinned over the content
at every scroll position, both read as a broken page, where a missing enhancement
reads as nothing at all.

**Item 7 shipped without its entrance.** The palette is a native `<dialog>`
(L-13) and appears instantly. The scale-and-fade would have to come from
`@starting-style` or from a transparent element in the served HTML — the second
fails the no-JS guarantee by design, and an instant dialog is inside §1's ≤150ms
feedback law either way. Same reasoning, and the same open revisit, as item 6.

**Item 11 lost its height change, and the reason generalizes.** It read "height +
backdrop-blur". A sticky header occupies normal flow, so shrinking it reflows the
document under the reader's eye — a layout animation, against §1's "cheap" law,
paid out of the 0.02 CLS budget on every route. The header keeps its height and
fades in a hairline. **Any animation of a box-model property on an element in
normal flow is the same bug wearing a different hat.**

**Item 14 is cut, not deferred.** A cross-document fade requires a client router;
`next/link` was built and reverted at L-12 because it costs +3.95 KB gz on every
route and Home had 2.21 KB of headroom. Navigation is a document load, and
`e2e/route-change.spec.ts` asserts it stays one.

**Item 21 carries a restriction that must be read alongside §10's blocker list:**
§10 blocks parallax *on text*. Entry 21 parallaxes backdrops and media only. No
text node on this site has a scroll-linked transform.

**Item 18 has a CLS trap.** A counter animating `0 → 1,284` changes its element's
width on nearly every frame. It needs `font-variant-numeric: tabular-nums` **and**
a `min-width` in `ch` reserved from the final value's digit count. Without both,
this one effect can exceed the 0.02 CLS budget by itself.

Entries 15–25 were added by the premium rebuild; the reasoning for each, and for
the four effects that were cut outright (Three.js hero, typewriter headline,
custom cursor, animated blob field), is in
[redesign/ANIMATION_GUIDE.md](./redesign/ANIMATION_GUIDE.md).

## 4. Technique selection

| Need | Tool |
| --- | --- |
| **Scroll reveal, stagger, parallax** | **`IntersectionObserver` + a CSS class — 0.14 KB measured, no dependency** |
| Hover, focus, simple state | CSS transitions |
| Enter/exit, presence, layout | Motion (`motion/react`) |
| Long scroll-scrubbed timelines | GSAP + ScrollTrigger (2 sanctioned uses) |
| Frame-linked scalar (progress bar) | `requestAnimationFrame` + CSS variable on a ref |
| Smooth scroll velocity | Lenis, subject to its three hard rules |

**The first row was added at M2 and it is load-bearing.** Scroll reveal is the
most-used animation on the site — every section of every route. Built on Motion's
`whileInView` it makes Motion a dependency of every page (~16 KB gz) and pushes
`'use client'` high into the tree. Built as one shared observer toggling one CSS
attribute it costs 0.14 KB, needs no provider, and — because the animation lives
entirely in CSS — **cannot strand content at `opacity: 0` when JavaScript fails.**
That last property is the no-JS guarantee held structurally rather than by
convention, and `e2e/no-js.spec.ts` asserts it.

**Prefer CSS.** If a transition can be done with a CSS class, it must be — it
ships zero JavaScript and cannot be broken by hydration. Motion is for what CSS
cannot express: presence (exit animations), layout animations, and orchestrated
sequences.

**Motion bundle rule.** Import via `LazyMotion` with the `domAnimation` feature
set and use `m.*` rather than `motion.*`, so the full feature bundle never ships.

**GSAP rule.** Dynamically imported, registered only on the two routes that use
it, and `ScrollTrigger.kill()`-ed on unmount. If GSAP appears in the Home route's
bundle, it has been misused ([TECH_STACK.md](./TECH_STACK.md) §2).

## 5. Scroll behavior

**Lenis, three hard rules** (violating any one removes Lenis from the project):
1. Disabled under `prefers-reduced-motion`.
2. Disabled on touch devices — native iOS/Android scroll is better than any
   emulation, and Lenis interferes with overscroll and address-bar behavior.
3. Must not break find-in-page, keyboard scrolling (Space/PageDown/Home/End),
   scrollbar dragging, or `scroll-margin-top` on anchor targets.

**Scroll-linked animation rules**
- Never trigger React state from a scroll event. Scroll updates refs or CSS
  variables directly.
- Everything scroll-driven is throttled to `requestAnimationFrame`.
- Reveal threshold: element is 15% into the viewport. Not 50% — content that
  appears only after being scrolled past is a bug on tall viewports.
- Nothing is `opacity: 0` in the served HTML unless JS is guaranteed to reveal
  it. Reveals are applied by a client component *after* hydration, so a no-JS
  reader sees everything. This is verified in the no-JS test
  ([TESTING.md](./TESTING.md)).

## 6. Page transitions

A cross-fade of `main` at 180ms, and nothing more. Explicitly rejected: shared
element transitions between routes, full-screen wipe transitions, and route
loading curtains. Under static export the next page is already prefetched — a
transition that lasts longer than the navigation makes the site feel *slower*
while pretending to feel fancy. Native View Transitions are a candidate for a
later phase, gated on Safari support and on it not delaying paint.

## 7. Loading states

The site is static; there is little to load. Where loading exists (fonts, images,
the OG image on a slow connection):

- Skeletons match final geometry exactly — a skeleton that causes a shift is
  worse than nothing.
- Skeleton shimmer is a `transform`-based sweep, not a `background-position`
  animation, and is disabled under reduced motion.
- No route-level loading spinner. Ever.

## 8. Micro-interactions

The small, cheap details that make an interface feel considered:

- Buttons depress 1px on `:active`.
- Copy-to-clipboard swaps icon and label for 1.5s, and announces "Copied" in a
  polite live region.
- Anchor headings reveal a `#` on hover **and** on focus.
- External links carry an icon with an `aria-label` suffix ("opens in a new tab")
  when `target="_blank"` — which is used sparingly.
- Focus ring transitions are instant, never eased. A ring that fades in reads as
  lag.

## 9. Performance budget for motion

| Metric | Budget |
| --- | --- |
| Frame rate during any animation | ≥ 55 fps on a mid-range Android |
| Animation JS on Home route | ≤ 25 KB gz |
| GSAP on Home route | 0 bytes |
| Long tasks caused by animation setup | 0 over 50ms |
| INP contribution from hover/transition | ≤ 20ms |

Verified via a Playwright trace on the Home and Journey routes each phase
([PERFORMANCE.md](./PERFORMANCE.md) §6).

## 10. Anti-patterns (blockers)

- Scroll-jacking: hijacking scroll to advance sections
- Parallax on text
- Entrance animations on body copy while it is being read
- Animations that repeat every time an element re-enters view
- Auto-playing video or looping background animation — **and this ban is the
  reason `u-drift` exists**. A keyframed blob field is the only thing on a
  static site that consumes CPU forever: on every device, in every tab that is
  not throttled, whether or not anyone is looking. A *scroll timeline* buys the
  same visual effect and charges only for movement the reader caused, so idle
  cost is exactly zero. When a brief asks for an animated background, that is
  the shape of the answer — not an exemption from this line.
- Custom cursors
- Preloader screens on a site that loads in under a second
- Typewriter effects on a headline (delays LCP and defeats screen readers)
- Marquees of technology logos
- Motion that runs before the reader has interacted, longer than 400ms

## 11. Review checklist

- [ ] On the §3 inventory, or justified in the PR description
- [ ] `transform`/`opacity` only
- [ ] Reduced-motion path implemented and manually tested
- [ ] `once: true` on scroll reveals
- [ ] Content visible without JS
- [ ] No React state driven by scroll
- [ ] GSAP (if used) dynamically imported and cleaned up
- [ ] Duration and easing come from tokens
- [ ] Verified at 55+ fps on a throttled CPU (4× slowdown)

## Related

[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §7 · [UI_GUIDELINES.md](./UI_GUIDELINES.md) ·
[ACCESSIBILITY.md](./ACCESSIBILITY.md) · [PERFORMANCE.md](./PERFORMANCE.md)
