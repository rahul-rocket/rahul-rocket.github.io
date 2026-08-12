# CONTRIBUTING

This is a personal site with one maintainer, so this document is primarily a
contract with the future — the author six months from now, and any AI agent
working in the repository. External contributions are welcome in the narrow
forms described in §9.

## 1. Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Requires Node 22 (see `.nvmrc`) and pnpm 9+. `npm` and `yarn` are not supported —
`pnpm-lock.yaml` is the only lockfile, and a second one is a merge conflict
waiting to happen.

**Before any UI work, read** [CLAUDE.md](../CLAUDE.md) — it is the condensed
version of every rule in `docs/`.

## 2. Branching and commits

Branch from **`develop`**: `feat/…`, `fix/…`, `docs/…`, `refactor/…`, `perf/…`,
`content/…`, `chore/…`, `test/…`. PRs target `develop`.

`develop` is the mainline for the rebuild; `master` is production and still
serves the legacy Create React App site. See [DEPLOYMENT.md](./DEPLOYMENT.md) §2
for why the two are separate and when they converge.

**Conventional Commits, enforced by commitlint on `commit-msg`:**

```
<type>(<scope>): <subject>

[body: why, not what]

[footer: BREAKING CHANGE, Closes #n]
```

| Type | Use |
| --- | --- |
| `feat` | New user-facing capability |
| `fix` | Bug fix |
| `content` | Posts, case studies, copy, typed records |
| `docs` | Anything in `docs/`, `README.md`, `CLAUDE.md` |
| `style` | Formatting only, no behavior change |
| `refactor` | Restructuring with no behavior change |
| `perf` | Performance improvement (state the measured delta) |
| `a11y` | Accessibility improvement |
| `test` | Tests only |
| `build` / `ci` / `chore` | Tooling, dependencies, config |

Scopes: `home`, `blog`, `projects`, `about`, `contact`, `resume`, `nav`, `ui`,
`motion`, `seo`, `content`, `ci`, `deps`, `docs`.

Rules: subject in the imperative, lowercase, no trailing period, ≤ 72 characters.
**The body explains why** — the diff already shows what. One logical change per
commit.

```
feat(projects): add stack filtering via URL search params

Filter state in the URL rather than component state so a filtered
view is shareable and the back button behaves. Rules out a client
store for what is fundamentally navigation state.

Closes #34
```

## 3. Pull requests

One PR per logical change. A PR that touches five unrelated things cannot be
reviewed or reverted cleanly.

**Description template**

```markdown
## What
One paragraph.

## Why
The problem this solves. Link the backlog ID.

## Trade-offs
What was given up, and what was considered and rejected.

## Verification
How this was checked beyond CI — keyboard pass, reduced motion,
no-JS, measured numbers.

## Screenshots
Both themes, mobile and desktop, for any visual change.
```

The **Trade-offs** section is required and may not be "none." A change with no
trade-off usually means one has not been looked for. This is the same standard
the case studies are held to, applied inward.

## 4. Direct pushes

Permitted to `develop` for exactly two cases: a typo fix in prose, and a fix to a
broken deployment. `master` takes no direct pushes at all until the cutover —
every commit on it is deployed to the live site within two minutes. Everything
else goes through a PR, including changes by the sole maintainer. The PR is not bureaucracy here — it is where CI runs the gates.

## 5. Pull request checklist

Copied into every PR:

```markdown
### Code
- [ ] Typecheck, lint, and tests pass locally
- [ ] `'use client'` justified and pushed as deep as possible
- [ ] No literal colors, spacing, or durations — tokens only
- [ ] Layer import boundaries respected (ARCHITECTURE §5)
- [ ] No `any`; `unknown` + a guard where needed
- [ ] Copy sourced from content/config, not hardcoded

### Accessibility
- [ ] Semantic element chosen before ARIA
- [ ] Keyboard-operable; visible focus; sensible tab order
- [ ] Contrast verified in both themes
- [ ] Reduced-motion path implemented and tested
- [ ] Works with JavaScript disabled
- [ ] axe clean on affected routes

### Performance
- [ ] Route budgets respected (size-limit green)
- [ ] Images dimensioned; no layout shift
- [ ] transform/opacity animations only
- [ ] No React state driven by scroll

### Content & SEO
- [ ] Schemas validate (`pnpm content:validate`)
- [ ] Title ≤ 60, description 120–160
- [ ] Canonical and absolute og:image present
- [ ] No confidential client detail

### Housekeeping
- [ ] Backlog status updated
- [ ] Docs updated if a decision changed
- [ ] Screenshots for visual changes, both themes
```

Do not check a box that was not actually verified. A checklist that is filled in
by habit is worse than no checklist, because it converts a real gate into
theatre.

## 6. Definition of done

A task is done when: it works on mobile and desktop; it is keyboard-operable with
visible focus; it works under reduced motion; it works without JavaScript; it is
within budget; axe is clean; tests are written where §1 of
[TESTING.md](./TESTING.md) says they are warranted; documentation reflects any
changed decision; and the backlog status is updated.

"It works on my machine in Chrome at 1440px" is roughly 30% of done.

## 7. Documentation as code

**If a decision changes, the document changes in the same PR.** Documentation
that lags the code is worse than none — it actively misleads, and it is the
mechanism by which a well-planned project quietly becomes an unplanned one.

Adding a dependency requires an entry in [TECH_STACK.md](./TECH_STACK.md) §2 with
its justification, the alternatives rejected, and its byte cost. Raising a
performance budget requires editing [PERFORMANCE.md](./PERFORMANCE.md) §2 in the
same PR, with the reason.

## 8. Dependencies

Before adding one, answer: What breaks without it? What is the cheapest
alternative, including writing it? What does it cost in gzipped bytes on which
route? How maintained is it? What is the removal path?

Rules: exact versions, no ranges. One dependency change per PR, so a regression
is bisectable. Prefer build-time dependencies (zero client cost). Prefer 60 lines
of owned code over a 40 KB dependency for a single feature — the Contentlayer
decision in [TECH_STACK.md](./TECH_STACK.md) §2 is the worked example.

## 9. External contributions

Welcome: typo and factual corrections, accessibility bug reports (especially from
assistive-technology users — the most valuable reports this project can receive),
broken links, browser-specific rendering bugs, and security issues.

Not accepted: redesigns, feature additions, dependency swaps, or refactors.
This is a personal site whose design decisions are the point.

**Security issues:** email the address in `config/site.ts` rather than opening a
public issue.

**Issue reports** should include the URL, the browser and OS, the assistive
technology if any, what was expected, and what happened.

## 10. Working with AI agents

[CLAUDE.md](../CLAUDE.md) is the primary reference for any agent session. Agents
must: read the relevant `docs/` file before implementing in that area; follow the
layer boundaries; never introduce a dependency without a `TECH_STACK.md` entry;
never weaken a budget or a gate to make CI pass; and update the backlog and docs
in the same change.

The most important instruction for an agent here: **when a rule in `docs/` blocks
an implementation, raise it rather than route around it.** A silently violated
constraint is far more expensive than a paused task, because it is discovered
much later and usually by a reader rather than by CI.

## Related

[CLAUDE.md](../CLAUDE.md) · [TESTING.md](./TESTING.md) ·
[DEPLOYMENT.md](./DEPLOYMENT.md) · [TASK_BACKLOG.md](./TASK_BACKLOG.md)
