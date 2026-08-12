/**
 * The `home` feature's only public surface — ARCHITECTURE §5.
 *
 * `app/page.tsx` imports from here and never from a path inside this
 * directory. The boundary is enforced by Biome (F0-07), not by convention: a
 * deep import from another feature fails lint with a message naming the rule.
 *
 * `lib/actions.ts` and `eyebrow.tsx` are deliberately not re-exported. The
 * first is how this feature decides what to render, not something another layer
 * composes with; the second is one feature's typographic device, and a barrel
 * entry is the difference between an internal detail and an API. If `/about`
 * wants the eyebrow it gets promoted to `components/ui/` — not exported from
 * here.
 */

export { Capabilities } from './capabilities'
export { ContactCta } from './contact-cta'
export { CurrentFocus } from './current-focus'
export { FeaturedProjects } from './featured-projects'
export { Hero } from './hero'
export { type ProofPoint, ProofStrip } from './proof-strip'
export { SelectedWriting } from './selected-writing'
