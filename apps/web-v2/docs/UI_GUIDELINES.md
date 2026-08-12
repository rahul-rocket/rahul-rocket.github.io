# UI GUIDELINES

How components are built, named, composed, and reviewed. Where
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) defines the *values*, this document
defines the *practice*.

## 1. Component anatomy

Standard shape for every component:

```tsx
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors duration-fast focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-focus ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: { primary: '…', secondary: '…', ghost: '…' },
      size: { sm: '…', md: '…', lg: '…' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof button> {
  asChild?: boolean;
}
```

**Non-negotiables in that snippet**
- Variants via `cva` — never a `className` prop carrying layout decisions from
  the parent, and never boolean prop explosions (`isPrimary`, `isLarge`).
- Props extend the underlying element's props, so `type`, `aria-*`, `data-*`,
  and `ref` all pass through for free.
- `asChild` (Radix `Slot`) for polymorphism instead of an `as` prop — it keeps
  types honest and avoids a link rendering as a button.
- Focus and disabled states defined in the base, not per variant.

## 2. Naming conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component file | `kebab-case.tsx` | `project-card.tsx` |
| Component export | `PascalCase` | `ProjectCard` |
| Hook | `use-kebab.ts` → `useCamel` | `use-media-query.ts` |
| Util | `kebab-case.ts`, named exports | `format-date.ts` |
| Type | `PascalCase`, no `I` prefix | `Project`, `ProjectMeta` |
| Boolean prop | `is` / `has` / `can` | `isLoading`, `hasIcon` |
| Handler prop | `on` + event | `onSelect` |
| CSS variable | `--kebab-case`, semantic | `--ui-surface-raised` |
| Test file | `*.test.ts(x)` beside source | `format-date.test.ts` |

Files are kebab-case even though exports are PascalCase: case-insensitive
filesystems (macOS, Windows) make PascalCase filenames a recurring source of
phantom Git diffs. This project is developed on Windows — the rule is practical,
not stylistic.

## 3. Composition over configuration

When a component grows a third boolean or a fifth variant, split it.

```tsx
// Rejected — configuration
<Card title="…" subtitle="…" image="…" footer="…" showBadge badgeText="…" />

// Preferred — composition
<Card>
  <Card.Media src="…" alt="…" />
  <Card.Header><Badge>Case study</Badge><Card.Title>…</Card.Title></Card.Header>
  <Card.Body>…</Card.Body>
</Card>
```

Compound components keep the markup readable, let each part be styled
independently, and make it obvious when a layout does not fit the abstraction.

**Duplication is cheaper than the wrong abstraction.** Two similar cards in two
features stay separate until the promotion rule in
[ARCHITECTURE.md](./ARCHITECTURE.md) §4 is satisfied.

## 4. Semantic HTML first

The correct element is chosen before any ARIA is considered.

| Need | Element |
| --- | --- |
| Navigates | `<a href>` — always, even if styled as a button |
| Performs an action | `<button type="button">` |
| Submits | `<button type="submit">` inside `<form>` |
| Groups related inputs | `<fieldset>` + `<legend>` |
| A list of things | `<ul>` / `<ol>` — including card grids and timelines |
| Expandable content | `<details>`/`<summary>` when no animation is needed |
| Metadata pair | `<dl>`/`<dt>`/`<dd>` |
| A date | `<time datetime="…">` |

**Blockers:** a `<div onClick>`; a `<button>` that navigates; a link that
mutates; a heading level chosen for its size. Size is a class; level is meaning.

## 5. Layout rules

- **Flow, not fixed.** No fixed heights on content containers. Fluid type +
  `min-height` where a floor is needed.
- **Space is the parent's job.** Children never carry outer margins; parents use
  `gap` or a stack utility. This is what makes components reusable across
  layouts.
- **Reserve space for everything async or media.** Every image and embed has
  explicit `width`/`height` or an `aspect-ratio`. CLS budget is 0.02
  ([PERFORMANCE.md](./PERFORMANCE.md)); layout shift is a correctness bug.
- **Container queries** for components whose layout depends on their own width
  (cards in different columns) rather than piling on viewport breakpoints.
- **No horizontal scroll at any width ≥ 320px.** Tested at 320, 375, 768, 1024,
  1440, 1920.

## 6. Responsive practice

Mobile-first: unprefixed styles are the mobile design; breakpoints add.

- **Touch targets ≥ 44×44px**, including in dense areas like tag lists. Padding
  can extend the hit area beyond the visual bounds.
- **Hover is an enhancement.** Every hover-revealed affordance also exists in a
  persistent form or on focus.
- Test at the six widths above plus a 200% browser zoom pass and a 400% reflow
  check (WCAG 1.4.10) — at 400% content reflows to one column with no horizontal
  scrolling.

## 7. Images and media

- `next/image` with `images.unoptimized: true` (static export), fed by
  **pre-generated** responsive AVIF/WebP variants from the build script.
- Above-the-fold images: `priority`; everything else lazy.
- `alt` describes purpose, not appearance. Decorative images: `alt=""` +
  `aria-hidden`.
- No image contains text that matters — text is text.
- Screenshots in case studies get a caption via `<figure>`/`<figcaption>` and are
  clickable to a full-size view.

## 8. Forms

- Every input has a visible `<label>`. Placeholder is never a label.
- Errors: inline, adjacent to the field, linked with `aria-describedby`,
  `aria-invalid` set, announced in a live region, and never conveyed by red
  alone.
- Validate on blur and on submit; never on every keystroke before first blur.
- Correct `autocomplete`, `inputmode`, and `type` on every field.
- Submit button shows a busy state and remains focusable; disabling it on
  submission without announcing why is a trap.

## 9. Loading, empty, and error states

Every data-driven view defines three states. Under static export "loading" is
rare, but the states still exist for client-filtered views:

| State | Rule |
| --- | --- |
| Loading | Skeletons that match final geometry (no shift). Never a spinner alone for > 1s without text. |
| Empty | Explain why it is empty and give an action ("No projects match this filter — clear filters"). |
| Error | Plain language, a retry or an escape route, never a raw stack trace. |

## 10. Content-driven UI

Text comes from content or config, never hardcoded in components. This is what
makes the site editable without touching TSX and keeps a future i18n pass from
being a rewrite ([CONTENT_STRATEGY.md](./CONTENT_STRATEGY.md) §3).

## 11. Performance discipline in components

- `'use client'` at the deepest possible node ([ARCHITECTURE.md](./ARCHITECTURE.md) §6).
- Animate `transform` and `opacity` only.
- No scroll handler that triggers React state. Scroll drives refs/CSS variables.
- Barrel-free deep imports for third-party libraries (`lucide-react/icons/x`).
- Anything > 20 KB that is not immediately visible is `next/dynamic` with
  `ssr: false` only when it truly cannot render statically.

## 12. Component review checklist

- [ ] Semantic element chosen before ARIA
- [ ] Keyboard operable; visible focus; sensible tab order
- [ ] All five interaction states defined
- [ ] Tokens only — no literal colors, spacing, or durations
- [ ] Responsive at 320 → 1920 and at 400% zoom
- [ ] Reduced-motion path
- [ ] `'use client'` justified and minimal
- [ ] No layout shift (dimensions reserved)
- [ ] Props extend the native element; `ref` forwarded
- [ ] Copy sourced from content/config
- [ ] Contrast verified in both themes

## Related

[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · [ACCESSIBILITY.md](./ACCESSIBILITY.md) ·
[ANIMATION_GUIDELINES.md](./ANIMATION_GUIDELINES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
