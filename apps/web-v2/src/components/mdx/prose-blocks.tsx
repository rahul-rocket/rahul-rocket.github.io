import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * B-06 — the remaining MDX blocks: `Aside`, `Steps`, `Step`, `Metric`,
 * `Metrics`, `TLDR`. docs/BLOG_SYSTEM.md §6.
 *
 * One file rather than five, because each is under twenty lines and they are
 * only ever imported together (the MDX map takes them as a set). Splitting them
 * would be five files whose entire content is a `<div>` with a class string —
 * CLAUDE.md §5's "duplication is cheaper than the wrong abstraction" has a twin
 * here, which is that indirection is not free either.
 *
 * Every one of these is a Server Component. Nothing in the MDX component set
 * carries `'use client'` except the code-block copy button, which is the only
 * one whose behaviour requires a browser API.
 */

/**
 * A margin note. `<aside>` because it *is* tangential — a screen-reader user
 * can skip it as a complementary region, which is exactly what the visual
 * treatment tells a sighted reader they may do.
 */
export function Aside({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<aside
			className={cn(
				'my-8 border-accent-muted border-l-2 pl-5 text-body text-text-muted leading-body italic',
				className,
			)}
		>
			{children}
		</aside>
	)
}

/**
 * The summary at the top of a long piece.
 *
 * Spelled out as "In short" rather than "TL;DR" in the rendered label: the
 * abbreviation is jargon, and CONTENT_STRATEGY §6 asks for a clause of
 * explanation on first use of any. The component keeps the short name because
 * that is what an author types.
 */
export function TLDR({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<section
			aria-label="In short"
			className={cn(
				'my-8 rounded-lg border border-border bg-surface p-6',
				className,
			)}
		>
			<p className="mb-2 font-heading text-text text-xs uppercase tracking-caps">
				In short
			</p>
			<div className="text-body text-text-muted leading-body [&>*+*]:mt-3">
				{children}
			</div>
		</section>
	)
}

/**
 * An ordered procedure. An `<ol>`, so the count and the position are announced
 * — a series of styled `<div>`s with numbers drawn in CSS tells a screen-reader
 * user nothing about how many steps remain.
 */
export function Steps({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<ol
			className={cn(
				'my-8 flex list-none flex-col gap-6 border-border border-l pl-0',
				className,
			)}
		>
			{children}
		</ol>
	)
}

export function Step({
	title,
	children,
}: {
	title: string
	children: ReactNode
}) {
	return (
		<li className="relative pl-6">
			{/* The rule marker. Decoration with no content, so it costs the
			    accessibility tree nothing and the <ol> keeps carrying the order. */}
			<span
				aria-hidden="true"
				className="-left-px absolute top-2 h-px w-4 bg-border-strong"
			/>
			<p className="font-heading text-h3 text-text leading-heading tracking-heading">
				{title}
			</p>
			<div className="mt-2 text-text-muted [&>*+*]:mt-3">{children}</div>
		</li>
	)
}

/**
 * P-10 — a measured outcome, rendered from one source.
 *
 * `method` IS REQUIRED. PROJECT_CASE_STUDIES §5: "Every number states its
 * measurement." A number on this site without one is an assertion, and the
 * required prop is what stops it being optional in a hurry. It renders as
 * visible text rather than a tooltip, because a claim's basis should not be
 * hover-only.
 */
export function Metric({
	label,
	before,
	after,
	method,
}: {
	label: string
	before?: string
	after: string
	method: string
}) {
	return (
		<li className="flex flex-col gap-1 border-border border-t py-4 first:border-t-0 first:pt-0">
			<p className="text-sm text-text-muted">{label}</p>
			<p className="flex flex-wrap items-baseline gap-2">
				{before ? (
					<>
						{/* `line-through` alone would be colour-and-decoration only; the
						    visually hidden words are what make the direction explicit to
						    a screen reader, which announces neither. */}
						<span className="sr-only">from</span>
						<span className="font-mono text-text-muted line-through">
							{before}
						</span>
						<span aria-hidden="true" className="text-text-subtle">
							→
						</span>
						<span className="sr-only">to</span>
					</>
				) : null}
				<span className="font-heading text-h3 text-accent leading-heading">
					{after}
				</span>
			</p>
			{/* Muted, not subtle: 13px text needs 4.5:1 and the subtle role is
			    contracted at the 3:1 large-text bar. */}
			<p className="text-text-muted text-xs">Measured: {method}</p>
		</li>
	)
}

export function Metrics({
	children,
	className,
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<ul className={cn('my-8 flex list-none flex-col pl-0', className)}>
			{children}
		</ul>
	)
}
