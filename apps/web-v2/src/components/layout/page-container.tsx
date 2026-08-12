import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/cn'
import { Breadcrumb, type Crumb } from './breadcrumb'
import { PageBackdrop } from './page-backdrop'

/**
 * The wrapper every route's content sits in.
 *
 * WHY THIS EXISTS WHEN `Container` AND `Section` ALREADY DO.
 *
 * It is not a third layout primitive — it is the one composition of the two that
 * every page repeats, named once. Without it, each new page opens with the same
 * four lines (`Section spacing="lead"` → `Container width` → breadcrumb → gap
 * stack), and the fourth page to be written gets one of them subtly wrong. The
 * primitives stay general; this fixes the page-level defaults.
 *
 * It deliberately does NOT render an `<h1>`, a title, or a description. Those
 * are content, they differ per route, and a container that emits them would make
 * every page's most important element the property of a shared component —
 * CLAUDE.md §5's "routes are thin" cuts the other way here: thin means the page
 * composes, not that the shell writes the page.
 *
 * `as="div"` on the Section is load-bearing. `Section` defaults to `<section>`,
 * and a `<section>` with no accessible name is a generic region that adds a
 * nameless entry to the landmark list of every page — the reasoning is in that
 * component's own header. The page's landmark is `<main>`, which the root layout
 * already provides.
 *
 * `spacing="lead"` by default because this is the first thing under a sticky
 * header that already occupies 4.5rem; a full section pad below it reads as a
 * hole (see `sectionVariants`).
 *
 * IT ALSO OWNS THE PAGE'S BACKDROP, which is new and is the one thing here that
 * is not purely a layout default — see `<PageBackdrop />` below and the note on
 * that component for why the root layout could not hold it.
 */

/**
 * The five backdrop arrangements from surfaces.css.
 *
 * A tone rotates which spectrum hue leads the page mesh and where its mass
 * sits. It is the answer to "every page should have its own visual identity"
 * that does not cost a different layout per route — layout is where consistency
 * lives, light is where identity can vary for free. Three custom properties,
 * zero bytes of JavaScript, no per-route CSS.
 *
 * Named for the KIND of page rather than for the hue, so the names survive a
 * palette change. Which route gets which is in the table in DESIGN_SYSTEM §14.
 *
 * Every tone is verified by `pnpm check:contrast` in both themes — see the
 * `TONES` list in that script, and the warning attached to it about what
 * happens if a tone is added there and not here.
 */
export type PageTone = 'work' | 'writing' | 'record' | 'contact'

export interface PageContainerProps {
	children: React.ReactNode
	/**
	 * `page` (1440px) for index and landing layouts, `reading` (72ch) for prose.
	 * The measure is enforced by the container, never per element — DESIGN_SYSTEM
	 * §4.
	 */
	width?: 'page' | 'reading'
	/** Rendered above the children. Omit on top-level routes — see `Breadcrumb`. */
	breadcrumb?: readonly Crumb[]
	/** `lead` under the header, `section` for a page that starts with its own hero. */
	spacing?: 'lead' | 'section' | 'compact' | 'none'
	/**
	 * The page's backdrop arrangement. Omitted means the default (teal-led)
	 * composition, which is Home's — so an untoned page is not unstyled, it is
	 * the identity tone.
	 */
	tone?: PageTone
	className?: string
}

export function PageContainer({
	children,
	width = 'page',
	breadcrumb,
	spacing = 'lead',
	tone,
	className,
}: PageContainerProps) {
	return (
		<Section as="div" spacing={spacing}>
			{/*
			  The page's ambient backdrop. Rendered here rather than in the root
			  layout so the tone actually reaches it — see the long note on the
			  component, which is a good deal less obvious than it looks.

			  Every route that uses `PageContainer` gets one for free; Home, the 404
			  and the error boundary render their own because they do not.
			*/}
			<PageBackdrop tone={tone} />

			<Container width={width}>
				{/*
				  A flex column with `gap`, not margins on the children. UI_GUIDELINES
				  §5: spacing is the parent's job, and a child that carries its own
				  outer margin cannot be reused in a layout its author never saw. This
				  is the parent.
				*/}
				<div className={cn('flex flex-col gap-8', className)}>
					{breadcrumb?.length ? <Breadcrumb items={breadcrumb} /> : null}
					{children}
				</div>
			</Container>
		</Section>
	)
}
