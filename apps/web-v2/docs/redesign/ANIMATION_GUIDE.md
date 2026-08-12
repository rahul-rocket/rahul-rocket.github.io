# ANIMATION GUIDE — premium motion

**Delta on [docs/ANIMATION_GUIDELINES.md](../ANIMATION_GUIDELINES.md).** The four
laws, the reduced-motion contract, the Lenis rules, the scroll rules, and the
§10 anti-pattern list are **unchanged and still binding**. This document extends
the §3 inventory and records what was cut and what replaced it.

---

## 1. Four effects from the brief were cut

Not deferred — cut, with a replacement for each. Recorded here because a
requirement that quietly disappears is indistinguishable from one that was
forgotten.

### 1.1 Three.js hero — cut

**Rule.** [TECH_STACK.md](../TECH_STACK.md) §2 gates React Three Fiber on three
conditions *and* a default: *"admitted only if it renders information that cannot
be conveyed in 2D **and** costs < 60 KB gz on a route that is not Home **and**
has a static image fallback… **Default answer is no.**"*

**Why it stays no.** `three` is ~155 KB gz at its smallest useful build, before
R3F and drei. That is more than the entire 120 KB hard limit for any route on
this site, on a Home route that measures **117.79 KB gz with 2.21 KB of
headroom**. Two of the three gate conditions fail outright, and the third — that
it render information not conveyable in 2D — fails too: a decorative hero mesh
renders no information at all.

**Replacement.** The static aurora composite plus a scroll-parallaxed layer stack
(§3, entry 21). Depth without a renderer.

### 1.2 Typewriter headline — cut

**Rule.** §10 blocker: *"Typewriter effects on a headline (delays LCP and defeats
screen readers)."* Reinforced by [PERFORMANCE.md](../PERFORMANCE.md) §4: *"the
LCP element is never animated in."*

**Why it stays cut.** The Home `<h1>` **is** the LCP element by design. A
typewriter defers LCP by its full run duration, and a screen reader announces a
live-updating text node either as gibberish or not at all.

**Replacement.** The typing effect moves to the **animated code editor** (§3,
entry 22), which is below the fold, is not the LCP element, is `aria-hidden`
with a real text alternative beside it, and pauses when off-screen. That is where
the effect was always more appropriate — it reads as a terminal, not as a
headline that cannot make up its mind.

### 1.3 Custom cursor — cut

**Rule.** §10 blocker: *"Custom cursors."*

**Why it stays cut.** A replaced cursor loses the OS's sub-frame tracking, breaks
the text I-beam and resize affordances, and is invisible to every touch and
keyboard user — so it is decoration paid for by everyone and enjoyed by some
mouse users.

**Replacement — and this is not a compromise, it is the better effect.**
**Magnetic buttons** (entry 15) and the **spotlight glow** (entry 16). Both are
cursor *interactions* without replacing the cursor, both are `pointer: fine` only,
and both degrade to nothing rather than to something broken.

### 1.4 Animated blobs / particle field — cut

**Rule.** §10 blocker: *"Auto-playing video or looping background animation."*
§1 law 3: animating `filter: blur` on a large surface is a review blocker. §1 law
4: motion runs once.

**Why it stays cut.** A looping background is the only thing on a static site
that costs CPU forever, on every device, whether or not anyone is looking at it —
and it is the effect most likely to drop a mid-range Android below the 55 fps
floor in §9.

**Replacement.** The painted aurora
([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2.2) plus grain. Reader scroll supplies
the movement across it, at zero cost, because the scroll is happening anyway.

---

## 2. What "premium" is actually made of

Having cut four things, it is worth stating what carries the feeling instead,
because the brief's list conflates two very different categories.

| Category | Examples | Cost | Verdict |
| --- | --- | --- | --- |
| **Continuous ambient motion** | Particle fields, blob loops, marquees, animated gradients | Permanent CPU, every reader, forever | Cut — all of it |
| **Response to intent** | Magnetic pull, spotlight, hover lift, ripple, focus glow | Paid only when a reader acts | Kept — all of it |

Every high-craft reference in the brief lives almost entirely in the second
category. Linear's interface has essentially no ambient motion; what it has is an
unusually high density of *responses*. Stripe's gradient is famously a **static**
mesh on most surfaces. Apple's product pages scrub to scroll — reader-driven,
not autonomous. The premium signal is **latency and precision**, not quantity of
movement.

That reframing is what makes the budget in §5 achievable rather than a
compromise.

---

## 3. Inventory additions

Canonical §3 lists items 1–14. **Two of them no longer stand, and both have been
corrected in the canonical document rather than contradicted here:**

- **Item 11, header condense.** Read "height + backdrop-blur on scroll past
  80px". The height half is a layout animation on an element in normal flow — it
  reflows the document under the reader and is paid out of the 0.02 CLS budget.
  M4 shipped opacity only, fading in a hairline.
- **Item 14, page transition.** A cross-document fade needs a client router,
  which was built and reverted for +3.95 KB gz per route. There is no page
  transition and there will not be one while navigation is a document load.

Added:

| # | Where | What | Duration / ease | Reduced-motion |
| --- | --- | --- | --- | --- |
| 15 | Primary buttons, social links | **Magnetic pull** — `translate` toward pointer, capped at 6px | rAF-tracked, 120ms `ease-out-quint` release | None — element static |
| 16 | Cards, hero, CTA panels | **Spotlight** — `--mx`/`--my` drive a radial gradient's position | Frame-linked, opacity only | Static, centered, or omitted |
| 17 | Cards, inputs, panels | **Gradient hairline** — `::before` opacity 0.4→1 on hover/focus | 150ms | Kept (opacity ≤ 150ms is sanctioned) |
| 18 | Proof strip, open-source stats | **Counter** — count to final value once on entry | 900ms, `ease-out-quint`, `once` | Final value rendered immediately |
| 19 | Section headings (not `h1` on Home) | **Text reveal** — per-line `translateY` + opacity behind a clip | 400ms total, 40ms per line | Rendered final |
| 20 | Images, diagrams | **Image reveal** — overlay panel `translateX` off | 400ms, `once` | Rendered final |
| 21 | Hero backdrop, section dividers | **Parallax** — decorative layers only, `translate3d` from scroll ratio | Frame-linked | Disabled, layers at rest position |
| 22 | Home, below fold | **Code editor typing** — `aria-hidden`, paused off-screen | 40ms/char, once | Final state, full text |
| 23 | Buttons | **Ripple** — `::after` scale + fade from pointer origin | 400ms, `once` per press | Omitted |
| 24 | Header | **Scroll progress rail** — `scaleX` on a ref | Frame-linked | Kept — it is information |
| 25 | Filter grids | **Layout shift** — Motion `layout` on filtered items | 200ms | Instant |

**Entry 21 carries a restriction the canonical list must be read alongside:**
§10 blocks *parallax on text*. Entries here parallax the **backdrop and media
only**. No text node on this site has a scroll-linked transform.

**Entry 18 has a CLS trap** and it is written down because it is easy to miss: a
counter that animates `0 → 1,284` changes the element's width on almost every
frame. Mitigated by `font-variant-numeric: tabular-nums` plus a `min-width` in
`ch` reserved from the final value's digit count. Without both, this single
effect can blow the 0.02 CLS budget by itself.

---

## 4. Technique selection — the important revision

Canonical §4's table stands, with one addition at the top that changes most of
the implementation:

| Need | Tool | Cost |
| --- | --- | --- |
| **Scroll reveal, stagger, parallax** | **`IntersectionObserver` + a CSS class** | **0.14 KB measured (M2), no dependency** |
| Hover, focus, simple state | CSS transitions | 0 KB |
| Presence / exit / layout animation | Motion, via `LazyMotion` + `domAnimation` | ~5 KB initial, ~16 KB lazy chunk |
| Long scrubbed timelines | GSAP + ScrollTrigger, dynamic, 2 uses | ~40 KB, code-split, 0 on Home |
| Frame-linked scalar | rAF + a CSS variable on a ref | ~0.2 KB |

**Why reveals do not use Motion.** Canonical §4 already says *"Prefer CSS. If a
transition can be done with a CSS class, it must be."* Scroll reveal is the most
common animation on the site by an order of magnitude — it appears in every
section of every route. Implemented with `whileInView`, it makes Motion a
dependency of every page and forces a `'use client'` boundary around most of the
tree. Implemented as a ~40-line `IntersectionObserver` primitive that toggles one
class, it costs **0.14 KB measured**, needs no provider, and — because the
animation lives entirely in CSS — **cannot leave content at `opacity: 0` when
JavaScript fails**, which is §5's no-JS guarantee held structurally rather than
by convention.

**Motion's reserved uses have gone from four to two**, and neither reduction was
a cut for its own sake:

| Reserved use | Standing |
| --- | --- |
| Command palette | Still Motion's, at L-13 |
| Filter reflow | Still Motion's, at A-04 / P-05 — `layout` is the one thing CSS genuinely cannot do here |
| ~~Mobile sheet~~ | Native `<dialog>` at M4. The browser animates it; no library involved |
| ~~Page cross-fade~~ | Impossible. Navigation is a document load — [ROUTING_PLAN.md](./ROUTING_PLAN.md) §5 |

Motion is **not installed**, and with two remaining uses — both dynamic, both on
routes that do not exist yet — it should not be until one of them is actually
built. A dependency admitted early is a dependency nobody re-justifies.

This one decision is the difference between Home fitting its budget and not. See
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) §3.

---

## 5. Reduced motion, restated for the new entries

The contract is unchanged: **the reduced-motion state is the finished state.**
Per new entry:

- 15, 21, 23 — **not registered at all.** No listener is attached; the code path
  is behind an early return, so it costs nothing rather than running and being
  ignored.
- 16, 17 — **static.** Spotlight renders centered or is omitted; the gradient
  hairline renders at full opacity.
- 18 — **final value, immediately.** Never a count, never a blank.
- 19, 20, 22 — **rendered final.** Text and images are simply present.
- 24, 25 — **kept.** Both convey state rather than decorate it, which is the same
  reasoning the canonical list applies to items 10 and 12.

All of it sits under the global CSS backstop in `themes.css`, which stays the one
sanctioned `!important` in the codebase.

**And the structural guarantee, which matters more than any of the above:**
because reveals are a CSS class toggled by an observer, the served HTML contains
no `opacity: 0`. Reduced motion, JavaScript disabled, an observer that never
fires, a hydration error — every failure mode lands on "the content is visible."
That is verified by `e2e/no-js.spec.ts`.

---

## 6. Pointer and input gating

Two effects are mouse-only and must be gated on capability, not on width:

```ts
const fine = window.matchMedia('(pointer: fine)').matches
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!fine || reduced) return   // attach nothing
```

A viewport-width check is the wrong test — it attaches pointer handlers to a
touchscreen laptop and skips them on a small-window desktop. Handlers that are
never attached also cost no INP, which is the budget these effects threaten.

---

## 7. Frame budget

Canonical §9's budgets stand. Added:

| Metric | Budget |
| --- | --- |
| Ambient animation frames while idle | **0** — nothing animates unattended |
| `pointermove` handler self-time | ≤ 1ms, rAF-coalesced, one per frame maximum |
| Reveal observer callback | ≤ 2ms for a full page of targets |
| `backdrop-filter` surfaces per view | ≤ 2 |

The first row is the one to defend. It is the property that separates this from a
portfolio that heats a phone.

## Related

[docs/ANIMATION_GUIDELINES.md](../ANIMATION_GUIDELINES.md) ·
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) ·
[PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) ·
[docs/ACCESSIBILITY.md](../ACCESSIBILITY.md)
