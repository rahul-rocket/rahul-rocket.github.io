import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * B-06 — `Figure`. docs/BLOG_SYSTEM.md §6, docs/UI_GUIDELINES.md §5.
 *
 * WIDTH AND HEIGHT ARE REQUIRED PROPS, NOT OPTIONAL ONES. This is the whole
 * reason the component exists: `mdx/components.tsx` throws on a bare Markdown
 * image precisely because Markdown cannot express dimensions, and an image
 * without them shifts the layout when it loads. CLS is a correctness bug here
 * with a 0.02 budget, and an author who cannot state an image's size has an
 * image whose size nobody knows.
 *
 * `alt` is required and may be empty — `alt=""` on a decorative image is a
 * deliberate, correct choice, and the required prop is what makes it a choice
 * rather than an omission.
 *
 * `next/image` is NOT used. `images.unoptimized` is forced by the static export
 * (there is no optimizer at runtime), so it would add a wrapper and a client
 * chunk in exchange for behaviour a plain `<img loading="lazy" decoding="async">`
 * already has.
 */
export function Figure({
	src,
	alt,
	width,
	height,
	caption,
	priority = false,
	className,
}: {
	src: string
	alt: string
	width: number
	height: number
	caption?: ReactNode
	/** Above the fold. Skips lazy loading so it is not deferred past the LCP. */
	priority?: boolean
	className?: string
}) {
	return (
		<figure className={cn('my-8 flex flex-col gap-3', className)}>
			{/* biome-ignore lint/performance/noImgElement: next/image needs a runtime optimizer; there is none in a static export. See the note above. */}
			<img
				src={src}
				alt={alt}
				width={width}
				height={height}
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				// `aspect-ratio` from the attributes plus `h-auto` is what actually
				// reserves the box: the attributes alone are overridden by any CSS
				// width, which `max-w-full` is.
				className="h-auto w-full rounded-md border border-border bg-surface"
			/>
			{caption ? (
				<figcaption className="text-sm text-text-muted">{caption}</figcaption>
			) : null}
		</figure>
	)
}
