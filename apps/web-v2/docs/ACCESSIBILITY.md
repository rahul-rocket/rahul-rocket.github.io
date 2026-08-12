# ACCESSIBILITY

## 1. The standard and why it is non-negotiable

**Target: WCAG 2.2 Level AA, with AAA for text contrast.** Lighthouse
Accessibility = 100 and zero axe violations are merge gates, not aspirations.

Two reasons, in order of importance:

1. **It is correct.** People use this site with screen readers, keyboards,
   magnification, and reduced motion. Excluding them is a defect.
2. **It is the argument.** A site claiming engineering craft that fails a
   keyboard user has disproven its own thesis in ten seconds. The audience
   includes engineers who will tab through it
   ([TARGET_AUDIENCE.md](./TARGET_AUDIENCE.md) P4/P5).

Note that automated tools catch roughly 30–40% of real issues. The manual
checklist in §9 is where the actual guarantee comes from; CI only prevents
regressions in what can be automated.

## 2. Semantic HTML is the foundation

The first accessibility decision in every component is choosing the right
element ([UI_GUIDELINES.md](./UI_GUIDELINES.md) §4). Native elements bring
keyboard behavior, focus management, and screen-reader semantics for free, and
they cannot drift out of sync with the visual design the way ARIA can.

**Landmarks per page:** exactly one `<header>`, one `<nav>` (labelled when there
are several), one `<main id="main">`, one `<footer>`. Complementary content uses
`<aside>`. Every `<section>` used as a landmark carries `aria-labelledby`.

**Headings:** one `<h1>`; levels never skip; the outline is checked by reading
the page with headings-only navigation, not by looking at it.

## 3. Keyboard

**The guarantee: every action on the site is reachable and operable by keyboard
alone, and the focused element is always visible.**

| Key | Behavior |
| --- | --- |
| `Tab` / `Shift+Tab` | Move through interactive elements in DOM order |
| `Enter` | Activate links and buttons |
| `Space` | Activate buttons, toggle checkboxes, scroll the page |
| `Escape` | Close dialog, sheet, palette, or popover; restore focus to the trigger |
| `↑ ↓ ← →` | Move within composite widgets (tabs, menus, palette results) |
| `Home` / `End` | Jump within lists and the page |
| `⌘K` / `Ctrl+K` | Command palette (enhancement only) |

**Rules**
- **Skip link first.** The first focusable element on every page targets
  `#main`, visible on focus, with correct `scroll-margin-top` under the sticky
  header.
- **DOM order equals visual order.** CSS reordering (`order`, `grid-area`,
  `row-reverse`) that changes reading sequence is a blocker — this is why the
  Journey timeline's alternating layout is CSS-only over an `<ol>`
  ([WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.3).
- **No positive `tabindex`.** Ever.
- **No keyboard traps** other than intentional, escapable modal focus traps.
- Custom scrollable regions (code blocks, wide tables) get `tabindex="0"` and an
  accessible name so they are keyboard-scrollable.

## 4. Focus management

- `:focus-visible` ring on every interactive element: 2px, `--ui-focus`,
  2px offset, matching the element's radius. `outline: none` without an equally
  visible replacement is a **hard blocker** ([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §9).
- The ring must clear 3:1 contrast against **both** the element and the adjacent
  background, in both themes.
- **Dialogs:** focus moves in on open, is trapped, returns to the trigger on
  close, and the background is `inert`.
- **Route change:** focus moves to the new page's `<h1>` and the route change is
  announced in a polite live region. Without this, a screen-reader user
  navigating a client-routed SPA has no idea the page changed.
- **Never scroll focus off-screen.** Any sticky element must be accounted for in
  `scroll-margin-top`.

## 5. Screen readers

**Test matrix** (manual, each phase):

| Reader | Browser | OS | Priority |
| --- | --- | --- | --- |
| NVDA | Firefox | Windows | Primary (dev platform) |
| VoiceOver | Safari | macOS | Primary |
| VoiceOver | Safari | iOS | Secondary |
| TalkBack | Chrome | Android | Secondary |

**Rules**
- **ARIA is a last resort.** The first rule of ARIA is not to use ARIA. Bad ARIA
  is worse than none, because it overrides correct native semantics.
- Icon-only controls have an `aria-label`; decorative icons are `aria-hidden`.
- Live regions: `aria-live="polite"` for filter counts, copy confirmations, and
  form status; `assertive` only for errors that interrupt a task.
- Link text is meaningful out of context — no "click here" or bare "Read more"
  (use a visually hidden suffix naming the target).
- `alt` describes purpose; decorative images use `alt=""`.
- Abbreviations expanded on first use in prose rather than via `<abbr>` alone.
- Language declared: `<html lang="en">`; any inline foreign phrase gets `lang`.

## 6. Color and contrast

| Content | Minimum | Note |
| --- | --- | --- |
| Body text | **7:1 (AAA)** | Above the AA requirement, deliberately |
| Large text (≥ 24px, or 19px bold) | 4.5:1 | |
| UI components, borders, icons | 3:1 | WCAG 1.4.11 |
| Focus indicator | 3:1 against both adjacent surfaces | WCAG 2.4.11 |
| Disabled elements | Exempt, but kept legible | |

**Rules**
- Verified in **both** themes. A contrast script runs over the semantic token
  pairs in CI and fails the build on a violation — checking manually does not
  scale past the first palette tweak.
- **Never color alone** to convey information (WCAG 1.4.1). Any state signalled
  by color also carries text, an icon, or a shape.
- Text over images or gradients requires a scrim guaranteeing the ratio at the
  worst pixel, not the average.
- `--ui-text-muted` must still clear 4.5:1 — elegant low-contrast gray is the
  most common portfolio failure and it is banned ([DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §3).

## 7. Motion and vestibular safety

Full rules in [ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) §2. The
accessibility contract:

- `prefers-reduced-motion: reduce` is honored by every animation, with a global
  CSS backstop so a missed component cannot regress the guarantee.
- Reduced motion renders the **finished** state — never a hidden one.
- No parallax, no auto-playing motion, no content that moves for more than 5
  seconds without a pause control (WCAG 2.2.2).
- Lenis is disabled entirely under reduced motion and on touch devices.

## 8. Zoom, reflow, and target size

- **400% zoom (WCAG 1.4.10):** content reflows to a single column with no
  horizontal scrolling, at a 320px equivalent viewport width.
- **200% browser zoom:** no clipping, no overlap, all functionality retained.
- **Text spacing (WCAG 1.4.12):** survives line-height 1.5, letter-spacing
  0.12em, word-spacing 0.16em, paragraph-spacing 2em without loss of content.
  Achieved by never using fixed heights on text containers
  ([UI_GUIDELINES.md](./UI_GUIDELINES.md) §5).
- **Target size (WCAG 2.5.8, 2.2 AA):** ≥ 24×24px minimum, ≥ 44×44px target,
  including dense tag lists.
- Full functionality in both portrait and landscape (WCAG 1.3.4).

## 9. Manual audit checklist

Run before every phase merge. This is the real gate.

- [ ] Unplug the mouse. Complete every user journey — read a case study, filter
      projects, submit the contact form, toggle the theme, open and close the
      mobile nav.
- [ ] Tab through each page; focus is always visible and never lost or trapped.
- [ ] Navigate by headings, then by landmarks, in NVDA and VoiceOver.
- [ ] Enable reduced motion at the OS level; confirm all content is present and
      readable.
- [ ] Zoom to 400%; confirm single-column reflow with no horizontal scroll.
- [ ] Disable JavaScript; confirm all content, navigation, and links work.
- [ ] Toggle both themes; run the contrast check.
- [ ] Use Windows High Contrast Mode; confirm nothing disappears (borders must
      not rely solely on `background-color`).
- [ ] Submit the contact form with errors; confirm errors are announced and
      focus lands sensibly.
- [ ] Read every image's `alt` aloud out of context; confirm each is useful.

## 10. Automated checks in CI

| Check | Tool | Gate |
| --- | --- | --- |
| Rule violations on all key routes, both themes | `@axe-core/playwright` | Zero violations |
| Lighthouse Accessibility | Lighthouse CI | = 100 |
| Token contrast pairs | Custom script over the semantic layer | Zero failures |
| Heading order, landmarks, `lang`, `alt` presence | axe rules | Zero |
| Keyboard reachability smoke test | Playwright tab-order test | Pass |

## 11. Known limitations, stated honestly

- Complex SVG architecture diagrams are inherently visual. Mitigation: a required
  prose equivalent that is the source of truth
  ([PROJECT_CASE_STUDIES.md](./PROJECT_CASE_STUDIES.md) §6). This is a real
  limitation, mitigated rather than solved.
- The command palette is an enhancement; every action it offers exists elsewhere.
  Now built (L-13) and asserted: its trigger is hidden without JavaScript, and
  `e2e/command-palette.spec.ts` checks that every route it lists is also in the
  footer site map as plain HTML. Its rows are real links and buttons rather than
  `role="option"`, so they are operable by Tab alone; the arrow keys are an
  accelerator on top, not the only way in. `showModal()` supplies the focus trap,
  Escape, and the inert background — with two corrections the browser does not
  make. Opened by ⌘K with focus nowhere, closing would drop the reader on
  `<body>`, so the palette restores focus to its own trigger in exactly that
  case. And **`showModal()`'s Escape cannot be relied on in a dialog that focuses
  a text field**: Safari/WebKit gives the focused field first refusal on the key
  (its native "revert the value" behaviour), so the dialog's cancel step never
  runs and the palette was unclosable by keyboard in Safari. Any dialog we add
  with an input inside it must close on Escape explicitly, as the palette now
  does — and must be verified on WebKit, because Chromium and Firefox both hide
  this. Windows WebKit does **not** reproduce it; `ci.yml`'s `ubuntu-latest`
  WebKit is where it is observable.
- The scroll progress rail is `aria-hidden`: scroll position is already exposed
  to assistive technology by the viewport, and a second unlabelled announcement
  of it is noise. The back-to-top control is a link to `#main`, not a scripted
  button, so it works with JavaScript disabled and moves focus as well as the
  viewport. Both are hidden with `visibility`/`display` rather than `opacity`,
  because an invisible but focusable control is a keyboard trap.
- The résumé PDF has weaker semantics than HTML; the HTML version is the primary
  and is always current ([WEBSITE_STRUCTURE.md](./WEBSITE_STRUCTURE.md) §4.11).
- No user testing with people who rely on assistive technology is planned for
  launch. This is the largest gap in the guarantee, and it is stated rather than
  papered over; it is a Phase 11 item in the backlog.

## Related

[UI_GUIDELINES.md](./UI_GUIDELINES.md) · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) ·
[ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) · [TESTING.md](./TESTING.md)
