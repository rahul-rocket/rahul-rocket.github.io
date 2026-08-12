# PERSONAL BRAND

What the site says about Rahul Rocket when no one is explaining it. Brand here
is not a logo — it is the set of consistent decisions that make the site
recognizable and the author credible.

## 1. Positioning statement

> **Rahul Rocket — Full Stack Software Engineer & Software Architect.**
> Builds production systems end to end, and can explain every decision inside them.

The two-part title is deliberate and load-bearing:

- **Full Stack Software Engineer** — proof of *delivery*. Ships whole features,
  front to back, including the unglamorous parts (migrations, auth, CI, on-call).
- **Software Architect** — proof of *judgment*. Chooses boundaries, weighs
  trade-offs, and is accountable for decisions that are expensive to reverse.

Most portfolios claim one. Claiming both is only credible if the evidence shows
both, which is why case studies are structured around decisions
([PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md)) rather than feature lists.

## 2. The three brand pillars

Every page must serve at least one. A section that serves none is cut.

| Pillar | Claim | How the site proves it |
| --- | --- | --- |
| **Craft** | The work is well-built, not just finished | The site itself: 95+ Lighthouse, 100 a11y, keyboard-complete, works without JS |
| **Judgment** | Knows *why*, not only *how* | Case studies with Problem → Options → Trade-off → Outcome; blog posts that show reasoning |
| **Clarity** | Can explain complex systems simply | Architecture diagrams, plain-language writing, no jargon-as-signal |

**The pillar test.** For any proposed feature, ask: *which pillar does this
strengthen, and what is the cheapest version that still strengthens it?* A
particle-field hero strengthens none — it signals "has a template." An
architecture diagram that animates its data flow on scroll strengthens Clarity,
and is worth its cost.

## 3. Voice and tone

The site speaks in **first person, plainly, without salesmanship**.

### Rules

1. **Concrete over abstract.** "Cut p95 checkout latency from 2.4s to 380ms" —
   not "improved performance significantly."
2. **Numbers or nothing.** A claim without a number is either removed or
   rewritten as an observation.
3. **No superlatives about self.** Never "passionate," "ninja," "rockstar,"
   "guru," "10x," "cutting-edge," "leveraging synergies." The work carries the
   claim.
4. **Own the trade-off.** Every case study names something that was given up.
   Admitting cost is the strongest available credibility signal, and its absence
   is the most common reason portfolios read as marketing.
5. **Active voice, short sentences.** Long enough to be precise, short enough to
   be skimmed.
6. **No false modesty either.** "I designed and led this" when true. Understating
   is as inaccurate as overstating.

### Attribution honesty

Team work is described as team work. Use "I" for personal contribution, "we" for
team outcomes, and state the role explicitly ("I owned the data layer and the
migration; a team of four delivered the product"). One overstated claim
discovered in an interview costs more than every honest claim gains.

### Voice examples

| Weak | Strong |
| --- | --- |
| "Passionate about building scalable solutions" | "I've run two systems past 10k req/s. Here is what broke first." |
| "Expert in React, Node, AWS" | "Six years of React in production; my last three architecture decisions and why" |
| "Worked on a fintech platform" | "Rebuilt settlement reconciliation; cut manual review from 6 hours/day to 20 minutes" |
| "Utilized microservices architecture" | "Split the monolith at the billing boundary — and kept everything else together on purpose" |

## 4. Visual identity direction

Detailed tokens live in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). The *brand*
constraints that drive them:

- **Dark-first, not dark-only.** Dark is the working environment of the audience;
  light mode is fully designed, never an afterthought.
- **One accent, used sparingly.** A single signature hue carries identity.
  Rainbow gradients read as template.
- **Typography is the identity.** A distinctive display face for headings paired
  with a highly readable text face does more brand work than any illustration,
  and costs a fraction of the bytes.
- **Generous space.** Confidence reads as restraint. Cramped layouts read as
  anxious.
- **No stock imagery. No AI-generated hero art. No 3D blobs.** These are the
  three fastest ways to look identical to every other portfolio.
- **Motion is punctuation.** Present, purposeful, never the point
  ([ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md)).

## 5. Naming and identity consistency

| Surface | Value |
| --- | --- |
| Display name | Rahul Rocket |
| Role line | Full Stack Software Engineer & Software Architect |
| Site | `https://rahul-rocket.github.io` (portable to a custom domain) |
| GitHub | `github.com/rahul-rocket` |
| Handle policy | Same handle across GitHub, LinkedIn, X, and email signature |

Identity strings live in exactly one place — `src/config/site.ts` — and are
consumed by metadata, structured data, the footer, and the resume. Changing the
role line is a one-line edit that propagates everywhere. See
[CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §3.

## 6. What this brand is not

Explicitly rejected positions, so they do not creep back in:

- **Not an agency.** No "Services," no pricing tables, no "Let's build your
  dream product." The site represents a person.
- **Not an influencer.** No newsletter popup, no follower counts, no
  "join 5,000 developers." The blog exists to demonstrate thinking, not to
  build an audience.
- **Not a résumé in HTML.** A résumé lists; this site argues.
- **Not a design showcase.** The design serves credibility. If a visual choice
  and a usability need conflict, usability wins — always, and it is recorded in
  [UI_GUIDELINES.md](./UI_GUIDELINES.md).

## 7. Consistency checklist (applies to every PR touching copy)

- [ ] Does the copy contain a number where a claim is made?
- [ ] Is any credit ambiguous between "I" and "we"?
- [ ] Any banned word from §3.3?
- [ ] Does this section serve a pillar from §2?
- [ ] Does it match the identity strings in `site.ts` rather than hardcoding?

## 8. Extensibility

The brand is designed to survive changes that are likely within 3–5 years:

- **A title change** (e.g. adding "AI Engineer") is a `site.ts` edit plus a
  reordering of skills — the pillars do not change.
- **A custom domain** changes one config value ([GITHUB_PAGES.md](./GITHUB_PAGES.md) §7).
- **A shift toward consulting** would add one page, not a repositioning — the
  Contact page already treats "work with me" as a first-class path.
- **Deprecating the blog** (if writing stops) degrades gracefully: the route
  disappears from navigation via the content manifest, not a code change.

## Related

[VISION.md](./VISION.md) · [TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) ·
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · [CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md)
