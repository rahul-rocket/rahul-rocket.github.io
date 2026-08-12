# VISION

## The one-sentence version

A portfolio that a senior engineer would open, keep open, and forward to someone
else — because the site itself is the strongest item in it.

## The problem with portfolios

Most engineering portfolios fail in one of three predictable ways:

1. **The logo wall.** A grid of framework icons. It signals exposure, not
   ability, and it is indistinguishable from every other logo wall.
2. **The screenshot dump.** Projects presented as pictures with a one-line
   caption. The reader learns what it looked like, never what was hard.
3. **The template.** A well-known starter with the name swapped. It reads as
   "did not want to build this," which is a strange message on a page whose
   entire purpose is "I like building things."

All three share a root cause: they describe rather than demonstrate.

## The alternative

**Demonstrate.** Three commitments follow from that word.

### 1. Show the decision, not the outcome

Anyone can ship a feature. The interesting artifact is the reasoning: what the
constraint was, what options existed, what was traded away, what it cost, and
what the author would do differently. Every project page is structured to force
that content to exist — a case study with a Problem section that is longer than
the Tech Stack section.

Corollary: a project with no interesting decision does not belong on the site.
Three real case studies beat twelve entries.

### 2. Make the medium the message

The site is a build artifact. If it loads instantly, responds to a keyboard
perfectly, degrades gracefully with JavaScript disabled, and scores 99 on
Lighthouse, that is a claim about engineering ability that no paragraph can
make. This is why the performance and accessibility budgets in
[PERFORMANCE.md](./PERFORMANCE.md) and [ACCESSIBILITY.md](./ACCESSIBILITY.md)
are treated as product requirements rather than nice-to-haves.

### 3. Leave the door open

Every claim links somewhere inspectable: a repository, a deployed demo, a
published article, a running Playground experiment. The Playground exists
specifically so there is always something on the site that is *live code* rather
than prose about code.

## How it should feel

The target emotional read, in order of the first ten seconds:

> *Calm* → *this person has taste* → *oh, that was smooth* → *let me read this one*

Concretely:

**Calm.** Generous whitespace, one accent color, one typeface family plus a
mono. Apart from one restrained hero reveal on load, nothing moves until the
reader does something. The first screen has a single focal point and a single
primary action.

**Considered.** Optical alignment, consistent rhythm, real typographic detail
(tabular figures in stats, hanging punctuation, correct dashes). The kind of
thing that is invisible when present and obvious when absent.

**Responsive in the physical sense.** Interactions acknowledge input within
100ms. Hovers have direction. Transitions have continuity — an element that
leaves should look like it went somewhere. See [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md).

**Confident.** First person, direct, specific. "I cut p95 from 1.8s to 340ms by
moving the join into a materialized view" — not "passionate about performance."

## What it should not feel like

| Avoid | Because |
| --- | --- |
| Glassmorphism panels stacked over gradient meshes | 2021 dribbble aesthetic; costs paint performance; reduces contrast |
| Rainbow gradient text on every heading | Ubiquitous; fights the content; usually fails contrast |
| Full-page scroll-jacking | Breaks find-in-page, keyboard scroll, and the reader's model of the page |
| A cursor-following blob | Costs a rAF loop for zero information |
| Typewriter effect cycling job titles | Delays the one sentence the reader came for |
| "Awwwards-style" preloader | Adds latency to prove the site is slow |
| Neon-on-black terminal theme | Signals a persona rather than a practice |

The test for any effect: **remove it and see whether the page communicates
worse.** If it communicates the same, it was decoration with a runtime cost.

## Influences, and what is taken from each

Original composition; specific lessons borrowed:

- **Linear** — density without noise; keyboard-first interaction; the idea that
  a marketing page can move at software speed.
- **Vercel** — restraint in color; type as the primary design element; dark mode
  treated as a first-class design, not an inverted stylesheet.
- **Stripe** — documentation as a designed surface; long-form technical content
  that is genuinely pleasant to read.
- **Apple** — scroll as a narrative device, used sparingly and with real craft.
- **Raycast** — a command palette as the power-user path through the product.
- **Framer** — motion with weight and follow-through rather than linear fades.

What is *not* borrowed: layout structures, color palettes, illustration styles,
or copy. See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the palette derivation,
which starts from an original hue.

## The signature moments

A site is remembered for two or three specific things. The deliberate candidates,
in priority order:

1. **The hero's opening.** A single, restrained, high-craft reveal — staggered
   text with real typographic masking, one time, within the 400ms entrance
   budget ([ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §1), respecting
   `prefers-reduced-motion`, and never animating the LCP `<h1>` itself. It sets
   the quality bar in the first second.
2. **The command palette (`⌘K`).** Navigate anywhere, search posts and projects,
   toggle theme, copy email. It is useful, it is a nod to the audience, and it
   is a small piece of real engineering.
3. **The case-study architecture diagram.** Each project renders its own system
   diagram, animated on scroll, drawn from data rather than an exported PNG.

Everything else supports these. If a phase runs long, cut elsewhere first.

## Editorial principle

> **Fewer, deeper, verifiable.**

When choosing between adding a section and improving an existing one, improve the
existing one. When choosing between a tenth project and a better third case
study, write the case study.
