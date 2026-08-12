import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Section } from '@/components/ui/section'
import { Stack } from '@/components/ui/stack'
import { Surface } from '@/components/ui/surface'
import { Text } from '@/components/ui/text'
import { routeByPath } from '@/config/nav'

/**
 * `<PageFooterCTA />` — docs/WEBSITE_STRUCTURE.md §3, §5.
 *
 * "Every page ends with a next action — a dead end is a lost reader." This is
 * that rule as a component, and it is on every route.
 *
 * THE ACTIONS RESOLVE THROUGH THE ROUTE MANIFEST, the same way the hero's do
 * (`features/home/lib/hero-actions.ts`). A CTA pointing at an unbuilt route
 * fails `check:links`, and on GitHub Pages a 404 is terminal — there is no
 * redirect to catch it. Passing a path that is not `built: true` therefore
 * drops the action rather than shipping a dead link, and the fallback below
 * guarantees at least one action always renders.
 *
 * Zero JavaScript: two `<a>` elements styled as buttons via `asChild`.
 */

const HEADING_ID = 'page-cta-heading'

export interface CtaAction {
	label: string
	/** A route path (gated on `built`) or an absolute external URL (never gated). */
	href: string
}

function isAvailable(action: CtaAction): boolean {
	if (/^https?:\/\//.test(action.href)) return true
	if (action.href.startsWith('#') || action.href.startsWith('mailto:')) {
		return true
	}
	return routeByPath(action.href)?.built === true
}

export function PageFooterCTA({
	title,
	body,
	actions,
}: {
	title: string
	body: string
	/** In priority order. The first available one is rendered as primary. */
	actions: readonly CtaAction[]
}) {
	const available = actions.filter(isAvailable).slice(0, 2)

	// A CTA with nothing to point at is the dead end this component exists to
	// prevent, so the fallback is Home — which always exists by definition.
	const resolved =
		available.length > 0 ? available : [{ label: 'Back to home', href: '/' }]

	return (
		<Section labelledBy={HEADING_ID} spacing="compact">
			{/*
			  A PANEL, NOT A RULE AND A HEADING.

			  This used to be `border-t pt-12` — the visual weight of a horizontal
			  line — on the last thing every one of fourteen routes says. The page's
			  closing action is the one element whose whole job is to be noticed, and
			  it was the quietest block on the page.

			  `level="panel"` is the section-sized glass: lower blur than the header's
			  because blur cost scales with area, verified by `check:contrast` as its
			  own composited context. `u-edge` is the spectrum hairline along the top,
			  `u-dots` the masked dot field behind it. All three are painted, none
			  animate, and together they cost no JavaScript at all.
			*/}
			<Surface
				level="panel"
				radius="2xl"
				className="u-edge relative isolate overflow-hidden px-6 py-12 sm:px-10 sm:py-14"
			>
				<div className="u-dots" aria-hidden="true" />

				<Stack gap={8} align="start" className="relative">
					<Stack gap={3} align="start">
						<Heading id={HEADING_ID} level={2} size="h1">
							{title}
						</Heading>
						<Text size="lede" tone="muted" className="max-w-lede">
							{body}
						</Text>
					</Stack>

					<Stack direction="row" gap={3} wrap>
						{resolved.map((action, index) => (
							<Button
								key={action.href}
								asChild
								size="lg"
								variant={index === 0 ? 'primary' : 'secondary'}
							>
								<a href={action.href}>{action.label}</a>
							</Button>
						))}
					</Stack>
				</Stack>
			</Surface>
		</Section>
	)
}
