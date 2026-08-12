# The redesign plan set

Eight planning documents for the premium rebuild, plus this note explaining how
they relate to the canonical `docs/` set.

## The rule that outranks everything else here: these are plans, not records

**Where a document in this directory states a measured number, a file name, or an
API, and the repository says otherwise, the repository is right and the document
is stale.** The authority order is:

```
the code and a fresh `pnpm build && pnpm size`   ← measurements
docs/TASK_BACKLOG.md                             ← status, and why a plan changed
docs/                                            ← the canonical contract
docs/redesign/                                   ← intent, and the reasoning for it
```

This is not a formality. The first consistency review of this plan set (M4) found
that its most-cited number — Home's remaining JavaScript headroom — was quoted in
three documents at a value that two milestones of real work had already spent,
and that a component costed at 4.5 KB had shipped at 0 KB on a different
technology. Both were true when written. Neither was true when read.

So each document now carries its measurements with the milestone that produced
them, and a plan that has been overtaken by a measurement says so in place rather
than being quietly corrected — the correction is the interesting part.

## Why these are deltas, not replacements

[CLAUDE.md](../../CLAUDE.md) opens with one governance rule: *"When this file and
a `docs/` file disagree, **`docs/` wins**."* Five of the eight documents here
collide by topic with a canonical document that already exists and is already
correct:

| This document | Canonical document it layers on |
| --- | --- |
| `DESIGN_SYSTEM.md` | [docs/DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) |
| `ANIMATION_GUIDE.md` | [docs/ANIMATION_GUIDELINES.md](../ANIMATION_GUIDELINES.md) |
| `ROUTING_PLAN.md` | [docs/WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) |
| `PERFORMANCE_PLAN.md` | [docs/PERFORMANCE.md](../PERFORMANCE.md) |
| `SEO_PLAN.md` | [docs/SEO.md](../SEO.md) |

Writing a second, freestanding `DESIGN_SYSTEM.md` would produce two documents
that disagree the first time either is edited, with nothing to say which wins.
That is the specific failure mode `CLAUDE.md` exists to prevent, and it is worse
than having no second document at all.

So each file here states **only what changes**, and carries the rule that governs
it:

> **Anything not stated here is unchanged and the canonical document still
> governs.** Where a delta contradicts its canonical document, the canonical
> document is amended in the same commit — never left to rot.

`IMPLEMENTATION_PLAN.md`, `MIGRATION_PLAN.md` and `COMPONENT_ARCHITECTURE.md`
have no canonical counterpart and are freestanding.

## The four decisions this plan set is built on

Locked before any of it was written, because each one changes everything
downstream:

1. **Design direction B — "Instrument"** wins DS-11. Dark-first near-black ink,
   teal-cyan accent, tight grotesque display. Directions A ("Editorial") and C
   ("Signal") are deleted, per DS-11's stated acceptance.
2. **The animation guidelines are honored, not weakened.** Three.js, the
   typewriter headline, the custom cursor, and the animated particle/blob field
   are cut. The premium feel is produced by other means — §2 of
   `ANIMATION_GUIDE.md` names each replacement.
3. **Routes map onto the documented map.** "Tech Stack" is `/skills`, "Timeline"
   is `/journey`. `/speaking`, `/achievements`, and `/services` are deferred
   until real content exists, per
   [WEBSITE_STRUCTURE.md](../WEBSITE_STRUCTURE.md) §1's route-count discipline.
   `/now` is added — and until C-12 lands it is the one part of this decision
   with nothing behind it; see `ROUTING_PLAN.md` §1.
4. **Content is placeholder, and flagged as placeholder.** Schemas, loaders, and
   templates are real; the facts are not, and nothing fabricated is presented as
   true. See `IMPLEMENTATION_PLAN.md` §7.

## Where the work actually is

M1–M4 have landed. [TASK_BACKLOG.md](../TASK_BACKLOG.md) is the authority on
per-task status; the short version, so a reader of this directory is not
navigating a plan set that describes an empty repository:

| Milestone | State |
| --- | --- |
| M1 design system, M2 primitives, M3 config, M4 shell | **landed** |
| M7 content pipeline | **landed early** — it is Phase 3 work, and it shipped before M4 |
| M5 motion, M6 Home, M8–M15 | not started |

Two decisions taken during M2–M4 overturned things this plan set had specified,
and both are now reflected throughout it: navigation is **plain `<a>` document
loads**, not `next/link` (ROUTING_PLAN §5), and the mobile sheet is the **native
`<dialog>`**, not Radix (COMPONENT_ARCHITECTURE §2). Each was a budget decision
with an accessibility dividend, and each is pinned by a test so it cannot be
undone silently.

## Reading order

| If you are | Read |
| --- | --- |
| Picking up the work | `IMPLEMENTATION_PLAN.md` |
| Asking what happened to the old site | `MIGRATION_PLAN.md` |
| Building a component | `COMPONENT_ARCHITECTURE.md`, `DESIGN_SYSTEM.md` |
| Adding motion | `ANIMATION_GUIDE.md` |
| Adding a route | `ROUTING_PLAN.md`, `SEO_PLAN.md` |
| Investigating a budget failure | `PERFORMANCE_PLAN.md` |
