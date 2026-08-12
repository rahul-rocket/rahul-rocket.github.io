import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Class-name merge. `clsx` for conditionals, `tailwind-merge` for conflicts.
 *
 * WHY THIS IS CONFIGURED RATHER THAN THE ONE-LINE DEFAULT.
 *
 * tailwind-merge decides which classes conflict by matching the part after the
 * prefix against validators. `text-lg` is a font size because `lg` is a t-shirt
 * size; anything else after `text-` falls through to the *color* group, which is
 * a catch-all.
 *
 * Our type scale is named `mega` `display` `h1` `h2` `h3` `body` `sm` `xs`
 * (docs/DESIGN_SYSTEM.md §4), and our text colors are named `text` `text-muted`
 * `text-subtle` (§3). None of the size names is a t-shirt size, so with the
 * default config every one of them is classified as a color — and
 * `cn('text-h1', 'text-text-muted')` silently drops the size, because
 * tailwind-merge believes the two are the same property.
 *
 * That failure is invisible: no error, no warning, just a heading that renders
 * at body size somewhere down the line. The same collision exists for
 * `shadow-*`, `font-*`, and `ease-*`, where our token names also sit in a
 * namespace that has both a value group and a color/weight group.
 *
 * So the groups below are declared explicitly. `extend` ADDS to the built-in
 * group, so standard Tailwind classes keep working unchanged and only our token
 * names are reclassified. `cn.test.ts` asserts both directions of each
 * collision — that same-group classes still override, and that
 * different-group classes still coexist.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			// Sizes, so they stop being read as colors.
			'font-size': [
				{ text: ['mega', 'display', 'h1', 'h2', 'h3', 'body', 'sm', 'xs'] },
			],
			// Families, so they stop being read as weights.
			'font-family': [{ font: ['heading', 'body', 'mono'] }],
			// Elevation, so it stops being read as a shadow *color*.
			shadow: [{ shadow: ['overlay', 'glow-accent', 'soft'] }],
			// `ease-in-out` is standard; `ease-out-quint` is ours.
			ease: [{ ease: ['out-quint'] }],
			leading: [{ leading: ['mega', 'display', 'heading', 'body'] }],
			tracking: [{ tracking: ['mega', 'display', 'heading', 'body', 'caps'] }],
		},
	},
})

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}
