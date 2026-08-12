# design/

Standalone HTML previews for Phase 2. **Nothing here ships.**

These files exist because the design system has to be judged before the Next.js
application exists (Phase 3). They load `src/styles/tokens.css`,
`src/styles/themes.css` and `src/styles/surfaces.css` directly, so what you see
is the real token layer — not a mockup of it. If a token changes, these pages
change with it.

That is also the standing argument for those three files being plain `:root`
custom properties rather than a Tailwind `@theme` block: `@theme` only exists
inside Tailwind's compilation context, so over `file://` these pages would
render unstyled ([DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md) §2).

| File | Task | What it answers |
| --- | --- | --- |
| `hero.html` | DS-11 | The chosen direction, and the surface layer over it — aurora, grain, glass, gradient hairline, glow. |
| `tokens.html` | DS-10 | What does every token actually look like, in each theme? |

**DS-11 is decided: direction B, "Instrument".** `hero-directions.html` — the
three-way comparison it was decided from — has been deleted along with
directions A and C. They are in git history if the choice is ever revisited.

## Viewing

Open either file directly in a browser — no build step, no server:

```bash
start design/hero.html
```

Both have a theme toggle. Neither has a direction selector any more — there is
only one direction.

## Rules these files follow

Even though they are throwaway, they obey the real constraints, because a mockup
that cheats proves nothing:

- Every color, size, space, radius and duration is a token. No literals.
- The `<h1>` is never animated — it is the LCP element
  ([PERFORMANCE.md](../docs/PERFORMANCE.md) §4).
- Entrance motion respects `prefers-reduced-motion` and the 400ms budget.
- Touch targets are ≥ 44px; focus rings are visible with a 2px offset.

## Fonts are not final

`DS-04` is unresolved, so these render in the metric-matched fallback declared in
`globals.css` (`Inter`, then a system stack). Proportions and rhythm are
indicative; the real grotesque will change the character of the hero noticeably.

The fallback carries `size-adjust`/`ascent-override` values keyed to the
*intended* face, so the eventual swap costs zero layout shift (DS-05) — **and
they must be re-measured the day DS-04 unblocks.** A `size-adjust` nobody
re-measures silently shifts type off its grid while looking deliberate.

## Lifecycle

1. ~~The losing two are deleted from `themes.css` and from
   `hero-directions.html`.~~ Done (M1).
2. ~~The winner's semantic mapping becomes the only one in `:root`.~~ Done (M1).
3. `tokens.html` is rebuilt as a real `/playground/tokens` route.
4. This directory is deleted.

`hero.html` outlives step 3 by a little: it is the visual reference M6 builds the
Home hero against, and it is the only place the surface layer can be judged
without a build. It goes when M6 lands.
