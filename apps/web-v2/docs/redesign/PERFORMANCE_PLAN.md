# PERFORMANCE PLAN

**Delta on [docs/PERFORMANCE.md](../PERFORMANCE.md).** Every budget in that
document is unchanged. **No number here relaxes one**, and per
[CLAUDE.md](../../CLAUDE.md) §15.3 none may be relaxed to make CI pass.

This document is the plan for fitting a substantially more elaborate site inside
budgets that were set when the site was empty.

---

## 1. The problem, stated honestly

The measured starting position, from
[TASK_BACKLOG.md](../TASK_BACKLOG.md) and confirmed in
[PERFORMANCE.md](../PERFORMANCE.md) §2:

| | Home |
| --- | --- |
| JS target | 75 KB gz |
| JS hard limit (CI fails above) | 120 KB gz |
| **Measured today, zero client components** | **105 KB gz** |
| Headroom against target | **−30 KB** |
| Headroom against the CI gate | **+15 KB** — *before interactivity; see below* |

That 105 KB is Next.js 15's App Router baseline runtime on a page containing one
`<h1>` and two paragraphs. It is not a regression and it is not recoverable
without leaving Next.

> ## Corrected at H-01 — read this before the two sections below
>
> **Home measures 108.72 KB gz, with 11.28 KB of headroom against the 120 KB
> hard limit.** Not 117.79 KB with 2.21 KB, which is the number §1 and §2 are
> written around and which is quoted in four other documents.
>
> The 9.79 KB came back when H-01 replaced the placeholder Home page — which
> contained a `<Reveal>` — with the real hero, which is a Server Component.
> Three probe builds isolate the cause:
>
> | Home additionally contains | JS gz | Delta |
> | --- | --- | --- |
> | Hero only, no page-level client component | 108.72 KB | — |
> | \+ a client component with `useState` and no `cn` | 108.99 KB | **+0.27 KB** |
> | \+ a client component importing `cn` | 118.09 KB | **+9.37 KB** |
> | \+ `<Reveal>` (which imports `cn`) | 118.51 KB | +9.79 KB |
>
> **It is `tailwind-merge`, reaching the browser through `lib/cn.ts`.** React's
> client runtime is a real one-time cost, but it has been in the layout chunk
> since M4's shell and is therefore paid by every route already — which is why
> `/blog/` sat at 108.72 KB with three client components while Home sat at
> 118.51 KB with four. `reveal.tsx` is the only client component in the codebase
> that imports `cn`.
>
> **What this does and does not change.** The 105 KB App Router baseline is
> unchanged and the 75 KB target is still unreachable. What changes is the size
> of the site's own allowance — roughly **11 KB, not 2.21 KB** — and, more
> usefully, what the lever is: keeping `cn` out of client leaves is worth more
> than every feature-cut in §2 combined. H-10 owns the fix, and it is not a
> one-liner: `cn`'s `extendTailwindMerge` config exists to stop
> `cn('text-h1', 'text-text-muted')` silently dropping the size, so a
> `clsx`-only client variant has to be a deliberate, documented split rather
> than a deletion.
>
> The two sections below are left as written. The arithmetic in them is correct
> given what was known; the *attribution* is what was wrong, and rewriting them
> in place would hide the most useful thing here — that a number measured
> correctly can still be explained wrongly for three milestones.

### The hydration tax — measured at M2, and worse than the estimate above

The paragraph above was written before anything was mounted, and it was
**wrong in an important way**. Mounting the first client component on Home —
one `<Reveal>`, ~40 lines, no state — moved the route from 105.40 KB to
**115.19 KB gz**. Nearly 10 KB for a component whose own code is under 1 KB.

Isolating it (M2, three builds):

| Home contains | JS gz | Delta |
| --- | --- | --- |
| No client components | 105.40 KB | — |
| Aurora + grid + grain backdrop (pure CSS) | 105.40 KB | **0.00 KB** |
| \+ first client component (`<Reveal>`) | 115.19 KB | **+9.79 KB** |
| \+ second client component (a `useSyncExternalStore` hook) | 115.33 KB | **+0.14 KB** |

Two conclusions, and they point in opposite directions:

1. **The 9.79 KB is a one-time tax, not a per-component cost.** It is React's
   client runtime and hydration machinery, which Next omits entirely from a
   route with no client components and includes in full the moment one appears.
   The second component cost 0.14 KB — its own code and nothing else.
2. **It is paid the instant the route has any interactivity at all**, and it
   cannot be avoided by making the component smaller, deferred, or lazy. A theme
   toggle alone would trigger it.

**The corrected budget for Home was therefore:**

```
105.40 KB   Next.js App Router baseline
+ 9.79 KB   React hydration runtime (one-time, unavoidable)
──────────
 115.19 KB  floor for any interactive page
 120.00 KB  hard limit — CI fails above this
──────────
   4.81 KB  ← everything the site's own client code may cost, together
```

**4.81 KB, not the ~15 KB §2 was written against.**

### And then M4 spent more than half of it

The block above is a floor, not a balance, and reading it as a balance is the
mistake this section now exists to prevent. M4 shipped the shell — the theme
toggle, the header scroll state, the mobile nav trigger — and Home moved again:

| After | JS gz | Remaining against the 120 KB gate |
| --- | --- | --- |
| M2 (`Reveal` only) | 115.19 KB | 4.81 KB |
| **M4 (shell complete) — measured** | **117.79 KB** | **2.21 KB** |

**2.21 KB is the real number, and it is the one to quote.** Verified by
`pnpm build && pnpm size` at the head of this branch, not carried forward from a
note. The shell's three client components cost 2.60 KB between them, which is
cheap for what they do and still more than half of everything Home had.

**The trap in §2's table, now fixed there:** it lists nine features totalling
≈4.34 KB and reads as a plan that fits inside 4.81 KB. Three of those nine —
the theme provider, the header condense, and the reveal primitive — are *already
built and already counted in the 117.79 KB*. Read as a forward budget it
double-counts them, and it makes the remaining allowance look roughly twice its
real size. §2 is split into spent and remaining below.

The backdrop result is the one piece of unambiguously good news: aurora, grid,
and grain cost **exactly zero bytes of JavaScript**, which is the claim
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §2.2 made and now the measurement that
supports it.

**So the entire remaining premium feature set has to fit in 2.21 KB gz of
JavaScript on Home** before CI blocks the merge, and the 75 KB design target is
unreachable — the baseline alone exceeds it by 30 KB before a line is written.

The brief asked for Lighthouse 100. The honest statement is: **the gate is ≥ 95
and I intend to hold it; 100 is not something I will promise on a route with
2.21 KB of headroom.** Overstating this would be exactly the failure `CLAUDE.md`
§15.8 describes.

**CSS has moved too, and is fine.** `PERFORMANCE.md` §2 records 4.9 KB gz at
Phase 3; the surface layer and the shell took it to **7.69 KB against a 20 KB
budget**. Recorded because a number that grew 57% deserves a look even when it
is comfortable — the cause is `surfaces.css` plus the shell's utilities, both
expected, and the token layer is still emitting only what is used.

---

## 2. Where the bytes went, and what is left

> **Post-H-04…H-08 standing — four sections were added and Home moved 0.69 KB.**
> `pnpm build && pnpm size` on the merged tree: **/ — JS 111.57 KB gz** against
> the 120 KB hard limit (**8.43 KB left**), CSS **9.07 KB** against 20 KB. The
> other three routes are unchanged at 110.88 KB, because everything added is a
> Server Component and the only client code on the page is `Reveal`.
>
> **That 0.69 KB is `reveal.tsx`'s chunk plus the four `<Reveal>` call sites**,
> and it is the number the correction box in §1 predicted: a client component
> that does not import `cn` costs ~0.3 KB, and this one no longer does. The
> capability grid, the writing list, the focus list, the contact CTA, the
> aurora band and both JSON-LD blocks together cost **zero** — JSON-LD is
> `type="application/ld+json"`, which the browser never executes and
> `size-limit` correctly never counts.
>
> The useful comparison is against the version of this plan that budgeted
> `Reveal` at 9.79 KB: **five sections of Home fit inside what one `import
> { cn }` used to cost.** H-10's remaining question is unchanged and is now
> better evidenced.
>
> **Post-H-01 standing.** Home is **108.72 KB** and the remaining allowance is
> **11.28 KB**, not 2.21 KB — see the correction box in §1. The row-by-row
> accounting below is still the right accounting; only the total it is measured
> against moved. Two rows are now known to be wrong in a way worth naming:
> `Reveal` is **not** 0.14 KB *on a route that does not already ship
> `tailwind-merge`* — it is 9.79 KB, of which 9.37 KB is `cn` — and the "still
> to come" estimates below silently assume every one of those components will
> import `cn`. On the measured evidence a client component that avoids it costs
> ~0.3 KB, so the ≈3.0 KB estimate for the five wanted features is roughly
> right *only if* they each keep `cn` out. That is now the single decision that
> determines whether they all fit, and it belongs to H-10.

### Already spent — in the 117.79 KB, not available again

| Feature | Approach | Cost gz |
| --- | --- | --- |
| Reveal / stagger primitive | `IntersectionObserver` + CSS class | **0.14 KB (measured, M2)** |
| Theme toggle + pre-paint script | Hand-written, no `next-themes` | *within M4's 2.60 KB* |
| Header scroll state | rAF + CSS variables on a ref | *within M4's 2.60 KB* |
| Mobile nav trigger | Native `<dialog>`, `showModal()` | *within M4's 2.60 KB* |
| Aurora / grain / glass / gradients / grid | **Pure CSS** | **0.00 KB (measured, M2)** |

The three shell components are not costed individually because they landed in one
build and only their sum was measured. That is a small honesty debt: if the 2.21
KB has to be defended feature-by-feature at H-10, they should be re-measured one
at a time the way M2 measured `Reveal`.

### Still to come — competing for 2.21 KB

| Feature | Approach | Estimate gz |
| --- | --- | --- |
| Magnetic buttons | Shared pointer hook, `pointer: fine` gated | 0.7 KB |
| Spotlight | Same hook, CSS-variable write | 0.3 KB |
| Counter | `IntersectionObserver` + rAF | 0.5 KB |
| Code editor typing | Local, `aria-hidden`, off-screen paused | 0.8 KB |
| Parallax backdrop | Shared rAF scroll subscriber | 0.4 KB |
| Back-to-top | Scroll position + focus move | 0.3 KB |
| **Total wanted** | | **≈ 3.00 KB** |
| **Available** | | **2.21 KB** |

**This does not fit, and saying so now is the point of the table.** It is roughly
0.8 KB over, on estimates that have historically been optimistic. The honest
options, in the order they should be tried:

1. **Cut.** The code editor (0.8 KB) is decorative, below the fold, and
   `aria-hidden` — it is the single largest discretionary item and closing the
   gap with it alone would be a clean result.
2. **Merge.** Magnetic, spotlight, and parallax are already specified to share
   one pointer hook (§3.4); counter and reveal already share an observer.
   Back-to-top could subscribe to the same scroll source as the header rather
   than adding its own.
3. **Revise the target in `PERFORMANCE.md` §2**, with the reason, in the same PR.

What never happens is the fourth option: editing `.size-limit.cjs`. H-10 owns
this decision and it should be made deliberately at M6 rather than discovered by
a red build.

### What is not on Home — and one thing that never cost anything

**The mobile sheet was budgeted at ~4.5 KB and shipped at 0 KB.** The plan had
it as a Radix Dialog moved behind `next/dynamic` because 4.5 KB against a 4.81 KB
allowance would consume the route by itself. M4 built it on the native
`<dialog>` + `showModal()` instead: no library, nothing to dynamically import,
and the focus trap, Escape, focus restoration and background inertness come from
the browser. Its trigger is hidden without JavaScript (`data-js-only`), because a
button whose only behaviour is `showModal()` is a dead control otherwise, and the
footer site map is the documented fallback.

The dynamic-import plan was sound reasoning that a better primitive made
unnecessary. Motion, GSAP, Lenis, and the command palette are still excluded
below on exactly that reasoning.

Every number here is a budget until `pnpm size` says otherwise. A feature that
overruns is cut or made lazy — never accommodated by raising a limit.

### What is deliberately *not* on Home

| Excluded | Where it lives instead |
| --- | --- |
| Motion (`motion/react`) | Lazy chunk, loaded by the palette on open, and by filter reflow |
| GSAP + ScrollTrigger | `/journey` and `/projects/[slug]` only, dynamic import |
| Lenis | Dynamic, and only when `pointer: fine` and motion is not reduced |
| Command palette | Dynamic, imported on first `⌘K` or first focus of the trigger |
| Blog search index | `/blog` only |
| Three.js | Nowhere — see [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) §1.1 |

---

## 3. The four structural decisions that make it fit

Ordered by how much they save.

### 3.1 Reveals are CSS, not Motion

Detailed in [ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) §4. Scroll reveal is the
single most-used animation on the site. Building it on `whileInView` puts Motion
(~16 KB gz for `domAnimation`, plus the `LazyMotion` shell) on the critical path
of every route and forces `'use client'` high in the tree. Building it on
`IntersectionObserver` costs 0.14 KB *measured* and keeps the boundary at the
leaf.

**Saves ~16 KB on every route.** This is the decision the budget rests on, and
the hydration tax measured at M2 makes it load-bearing rather than merely
prudent: with 2.21 KB of allowance, Motion on the critical path would exceed the
gate seven times over on its own.

### 3.2 The theme provider is hand-written

`next-themes` is ~4 KB gz and solves a general problem — multiple theme values,
system sync, forced themes per route, class *and* attribute strategies. This site
needs one attribute, two values, one `localStorage` key, and one pre-paint inline
script that `DESIGN_SYSTEM.md` §10 already specifies exactly.

~50 lines. **Saves ~3 KB**, and removes a dependency that would need a
`TECH_STACK.md` §2 entry it cannot really justify.

### 3.3 Server Components stay the default, aggressively

Every page is a Server Component. The client boundary is pushed to the leaf in
every case:

- A card is a Server Component. Its *hover glow wrapper* is the client component.
- The projects index is a Server Component. Its *filter control* is client; the
  filtered list is DOM-level, driven by `data-` attributes and a CSS rule, not by
  re-rendering a React list.
- The blog index is a Server Component. Search filters DOM nodes already present
  in the HTML.

This last pattern matters twice: it is cheaper *and* it is what makes filtering
work with JavaScript disabled — the full list is simply in the HTML.

### 3.4 One shared pointer hook

Magnetic buttons, spotlight, and parallax are three effects that all need
`pointermove` or `scroll`, rAF coalescing, and capability gating. Implemented
separately that is three listener sets and three rAF loops. Implemented as one
`use-pointer-field` hook with subscribers, it is one listener, one loop, one gate.

Saves ~1 KB and, more importantly, bounds the INP cost at one coalesced handler
per frame regardless of how many elements subscribe.

---

## 4. What `size-limit` does not see

An honesty note, because the alternative is a budget that can be gamed without
anyone noticing.

`.size-limit.cjs` derives each route's budget from the `<script>` and `<link>`
tags in that route's `out/**/index.html`. That is the right measure for *initial*
payload, and its reasoning is sound. But it means **a dynamically imported chunk
is invisible to the gate**: moving 40 KB behind `next/dynamic` makes the number
go down whether or not a reader ends up downloading it.

Three uses of dynamic import in this plan (Motion, GSAP, the command palette) are
therefore *not* proven cheap by `size-limit`. They are justified instead by
**when** they load:

| Chunk | Loads when | Reader who never pays |
| --- | --- | --- |
| Motion | Command palette opens, or a filter grid reflows | Every reader who never opens the palette or filters a list |
| GSAP | `/journey` or a case study scrolls to the diagram | Everyone who never visits those two routes |
| Command palette | First `⌘K`, or focus of its trigger | Almost everyone |
| Lenis | Fine pointer + motion not reduced | Every touch and reduced-motion reader |

Lighthouse *does* see these on the routes where they load, since it measures TBT
and TTI on a real page load — so the gate that catches an abuse of dynamic import
is Lighthouse, not `size-limit`. Recorded so nobody later reads a green
`size-limit` as proof of something it never checked.

**Action item for M14:** add a `pnpm size:all` variant that sums *every* chunk a
route can reach, reported as advisory alongside the enforcing per-route number.

---

## 5. CLS — the three new risks

The 0.02 budget is the tightest constraint in the document, and the premium layer
introduces three ways to break it that did not previously exist.

| Risk | Mitigation |
| --- | --- |
| **Font swap** when DS-04 unblocks | `size-adjust` + `ascent/descent-override` measured against the real face, not copied. DS-05's acceptance is a measured CLS of exactly 0. |
| **Animated counters** resizing their container | `tabular-nums` + `min-width` in `ch` computed from the final value's digit count |
| **Reveal animations** that translate on the Y axis | Reveals animate `transform`, which never contributes to CLS. Any reveal implemented with `margin`, `height`, or `top` is a blocker — this is law 3 restated as a CLS rule |

Plus the existing rules, unchanged: every image and embed carries explicit
dimensions or `aspect-ratio`; `unsized-images` is already an `error` assertion in
`lighthouserc.json`.

---

## 6. LCP — unchanged and defended

| Route | LCP element | Guarantee |
| --- | --- | --- |
| `/` | The hero `<h1>` text | **Not animated. Not typed. Not revealed.** Present in the served HTML at full opacity. |

The aurora backdrop is a CSS `background-image` on a sibling element. It cannot
become the LCP element (gradients are not LCP candidates) and it cannot delay the
`<h1>`, because it costs no request and no decode.

The hero stagger (canonical inventory item 1) animates the elements *around* the
headline — eyebrow, subhead, actions. The headline itself is simply there.

---

## 7. Per-milestone verification

Every milestone in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) runs, before
its commit:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm check:export && pnpm check:links && pnpm check:contrast && pnpm size
```

And the milestones that touch a route's payload additionally run `pnpm lh` and
`pnpm test:e2e`.

**The rule when a budget fails:** find the bytes, or cut the feature. The two
things that never happen are editing `.size-limit.cjs` limits and editing
`lighthouserc.json` assertions. If a target genuinely needs to move, it moves in
[PERFORMANCE.md](../PERFORMANCE.md) §2, in the same PR, with the reason — which
is what that document already requires.

## Related

[docs/PERFORMANCE.md](../PERFORMANCE.md) ·
[ANIMATION_GUIDE.md](./ANIMATION_GUIDE.md) ·
[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) ·
[docs/TECH_STACK.md](../TECH_STACK.md)
