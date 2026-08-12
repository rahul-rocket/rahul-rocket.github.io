# TARGET AUDIENCE

Who reads this site, what they need in the first 30 seconds, and what design
decision each of them forces. Audience analysis is only useful if it changes the
build — every persona below ends with concrete implications.

## 1. The audience is small and high-value

This site is not optimized for traffic. A realistic month is 200–800 visitors,
of which perhaps 15 matter. Every decision optimizes for **the 15**, not the
average. This is the single most important framing in the document: it justifies
depth over breadth, case studies over cards, and a hard performance budget over
a flashy hero.

## 2. Personas

### P1 — The Recruiter / Sourcer
**Time on site:** 20–60 seconds. Often mobile, often mid-scroll through 30 tabs.
**Wants:** role, seniority, stack, years, location, availability, résumé link.
**Fails if:** the stack is not visible without scrolling, or the résumé takes
more than one click.

**Implications**
- Role + primary stack appear above the fold on Home, as text (not in an image,
  not gated behind an animation).
- A persistent, obvious résumé affordance: `/resume` route **and** a direct PDF
  download.
- Contact email is copyable in one interaction from every page (footer).
- Skills must be text-scannable — a real list, not only icons.

---

### P2 — The Hiring Manager / Engineering Lead
**Time on site:** 3–8 minutes. Desktop. Reads one project properly.
**Wants:** evidence of ownership and judgment; scope of systems handled; how the
person thinks when constrained; whether they will need supervision.
**Fails if:** projects are described by feature list, with no problem statement
and no trade-off.

**Implications**
- Case studies are the primary artifact, structured Problem → Constraints →
  Options → Decision → Outcome ([PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md)).
- Each case study names a trade-off accepted and a thing that would be done
  differently.
- Experience entries state scope (team size, traffic, data volume), not duties.
- Featured Projects surfaces **three**, deeply — not twelve, shallowly.

---

### P3 — The CTO / Founder evaluating for contract work
**Time on site:** 2–5 minutes, with intent.
**Wants:** can this person own a system end to end; do they understand cost,
delivery risk, and maintenance; how do we start.
**Fails if:** there is no clear path from "impressed" to "in touch."

**Implications**
- Contact page frames engagement explicitly (what a good first message contains,
  what response time to expect) rather than a bare form.
- At least one case study covers a *whole system delivered*, including
  deployment and handover — not only a UI.
- Architecture thinking is visible: diagrams, constraint discussion, and the
  reason a boring choice was made where it was made.

---

### P4 — The Peer Engineer / Open Source Collaborator
**Time on site:** variable; arrives from a blog link, GitHub, or a share.
**Wants:** the technical substance; the repo; whether the code is any good.
**Fails if:** the blog post is fluff, or code samples are screenshots.

**Implications**
- Blog posts are self-contained and deep enough to be worth a bookmark
  ([BLOG_SYSTEM.md](./BLOG_SYSTEM.md)).
- Real, copyable, syntax-highlighted code — never images of code.
- Prominent GitHub links; an Open Source page with actual contributions and
  their context.
- The site's own source is public and clean. This audience *will* look. That
  fact is itself a quality forcing function.

---

### P5 — The Skeptic
Present inside every other persona. Assumes claims are inflated until shown
otherwise.
**Wants:** falsifiable evidence.
**Fails if:** claims are unverifiable or the site is slow, broken on mobile, or
inaccessible — because that contradicts the claim of craft directly.

**Implications**
- Every claim links to something inspectable: repo, live link, article, or a
  stated metric with its measurement method.
- The site's own quality is the primary evidence. This is why the performance
  and accessibility budgets are merge gates ([PERFORMANCE.md](./PERFORMANCE.md),
  [ACCESSIBILITY.md](./ACCESSIBILITY.md)) rather than aspirations.
- No fabricated testimonials, no invented metrics, no logo wall of companies
  never worked with.

## 3. Audience-to-page mapping

| Page | Primary | Secondary | Must deliver in 10s |
| --- | --- | --- | --- |
| Home | P1 | all | Name, role, stack, three proofs, contact path |
| About | P2 | P3 | Trajectory and working style |
| Experience | P1 | P2 | Companies, roles, dates, scope |
| Skills | P1 | P4 | Scannable depth-rated technology list |
| Projects | P2 | P3 | Three substantial systems |
| Case study | P2 | P3, P5 | The problem and the decision |
| Open Source | P4 | P5 | Real contributions with links |
| Blog | P4 | P5 | Substance, fast |
| Uses | P4 | — | Tooling taste |
| Resume | P1 | — | PDF in one click |
| Contact | P3 | P1 | How to reach and what happens next |

## 4. Access context (drives the budgets)

| Condition | Assumption | Consequence |
| --- | --- | --- |
| Device | ~45% mobile, incl. recruiters | Mobile-first layout; touch targets ≥ 44px |
| Network | Assume 4G, not fibre | LCP budget measured on throttled 4G |
| Screen reader | Low frequency, high stakes | Full support is non-negotiable, not conditional on usage stats |
| Reduced motion | Meaningful minority | Every animation has a reduced-motion path |
| JS disabled / blocked | Rare but real (corporate proxies) | All content and navigation work without JS |
| Referral source | Often a shared link | Link previews must render correctly on every platform ([SEO.md](./SEO.md)) |

## 5. Non-audience

Stated to prevent scope creep:

- **Search-engine traffic at volume.** SEO exists so that a name search resolves
  and shared links preview well — not to rank for "best react developer."
- **Beginners looking for tutorials.** The blog assumes a working engineer.
- **The author's future self as a CMS user.** Content is edited as files in Git.
  No admin UI will ever be built.

## 6. How this is verified

- **Hallway test before launch:** five readers matching P1/P2, 30 seconds on
  Home, then asked to name the role, the primary stack, and one project.
  Target 4/5 correct ([GOALS.md](./GOALS.md) O1).
- **Recruiter path test:** from a cold load on mobile, reach the résumé PDF in
  ≤ 2 interactions.
- **Skeptic test:** pick any three claims on the site at random; each must resolve
  to evidence in one click.

## Related

[VISION.md](./VISION.md) · [PERSONAL_BRAND.md](./PERSONAL_BRAND.md) ·
[WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) · [GOALS.md](./GOALS.md)
