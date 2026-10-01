/**
 * The hero's AI motif: a small three-layer neural network in the status
 * panel's top corner. Not beside the headline — at `lg` the 19ch `mega`
 * heading runs almost the full container and anything placed there collides
 * with it.
 *
 * Same rules as the rest of the hero (see hero.tsx and motion.css):
 * - A server component, zero JavaScript.
 * - NOT A LOOP. ANIMATION_GUIDELINES §10 blocks looping background motion, so
 *   the edges draw in once (`u-mesh-draw`) and then sit still.
 * - NO OPACITY ANIMATION. The draw is a `stroke-dashoffset` change, and the
 *   base state — what ships in the HTML and what reduced motion sees — is the
 *   fully drawn network, so `e2e/no-js.spec.ts` has nothing to catch.
 * - `aria-hidden`: it carries no information.
 */

type Point = readonly [x: number, y: number]

const LAYERS: readonly (readonly Point[])[] = [
	[
		[40, 60],
		[40, 140],
		[40, 220],
	],
	[
		[180, 30],
		[180, 105],
		[180, 175],
		[180, 250],
	],
	[
		[320, 95],
		[320, 185],
	],
]

/** Every edge between adjacent layers — a fully connected network. */
const EDGES: readonly (readonly [Point, Point])[] = LAYERS.flatMap(
	(layer, i) => {
		const next = LAYERS[i + 1]
		return next ? layer.flatMap((a) => next.map((b) => [a, b] as const)) : []
	},
)

export function HeroMesh() {
	return (
		<svg
			viewBox="0 0 360 280"
			aria-hidden="true"
			focusable="false"
			className="pointer-events-none absolute top-5 right-5 w-24 sm:w-32"
		>
			<defs>
				<linearGradient id="hero-mesh-grad" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="var(--ui-spectrum-1)" />
					<stop offset="55%" stopColor="var(--ui-spectrum-2)" />
					<stop offset="100%" stopColor="var(--ui-spectrum-3)" />
				</linearGradient>
			</defs>

			<g stroke="url(#hero-mesh-grad)" strokeWidth="1" strokeOpacity="0.45">
				{EDGES.map(([[x1, y1], [x2, y2]], index) => (
					<line
						key={`${x1}-${y1}-${x2}-${y2}`}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						pathLength={1}
						className="u-mesh-draw"
						style={{ animationDelay: `${120 + index * 18}ms` }}
					/>
				))}
			</g>

			{LAYERS.flat().map(([x, y]) => (
				<g key={`${x}-${y}`}>
					<circle
						cx={x}
						cy={y}
						r="9"
						fill="var(--ui-bg)"
						stroke="var(--ui-border-strong)"
					/>
					<circle cx={x} cy={y} r="4" fill="url(#hero-mesh-grad)" />
				</g>
			))}
		</svg>
	)
}
