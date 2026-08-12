import { cn } from '@/lib/cn'
import type { Metric } from '@/lib/content/schemas'

/**
 * P-10 — the metric row, rendered from frontmatter.
 * docs/PROJECT_CASE_STUDIES.md §4, §5.
 *
 * ONE SOURCE, TWO PLACES. This renders in the case-study header and again in
 * the Outcome section, from the same `metrics` array, which is why §4 makes
 * them structured data rather than prose. Two hand-written copies of three
 * numbers disagree within one edit and nothing catches it.
 *
 * `compact` is the header rendering: it drops the measurement method, which the
 * Outcome section shows in full. That is the one thing this component allows to
 * differ between the two, and it is a density decision rather than a content
 * one — the method is never *absent* from the page, only from the summary at
 * the top of it.
 *
 * DIRECTION IS NOT CONVEYED BY THE STRIKE-THROUGH ALONE. "from" and "to" are
 * visually hidden words inside the value, because `line-through` is not
 * announced by any screen reader and a bare "2.4s 380ms" is ambiguous about
 * which way the change went.
 */
export function MetricList({
	metrics,
	compact = false,
	className,
}: {
	metrics: readonly Metric[]
	compact?: boolean
	className?: string
}) {
	if (metrics.length === 0) return null

	return (
		<ul
			className={cn(
				'grid list-none grid-cols-1 gap-6 p-0',
				compact
					? 'rounded-lg border border-border bg-surface p-6 sm:grid-cols-3'
					: 'sm:grid-cols-2',
				className,
			)}
		>
			{metrics.map((metric) => (
				<li key={metric.label} className="flex flex-col gap-1">
					<p className="flex flex-wrap items-baseline gap-2">
						{metric.before ? (
							<>
								<span className="sr-only">from </span>
								<span className="font-mono text-sm text-text-muted line-through">
									{metric.before}
								</span>
								<span aria-hidden="true" className="text-text-subtle">
									→
								</span>
								<span className="sr-only"> to </span>
							</>
						) : null}
						<span className="font-heading text-accent text-h2 leading-heading tracking-heading">
							{metric.after}
						</span>
					</p>
					<p className="text-sm text-text">{metric.label}</p>
					{/* Muted, not subtle — 13px needs 4.5:1, and the subtle role is
					    contracted at the 3:1 large-text bar. See list-filter.tsx. */}
					{compact ? null : (
						<p className="text-text-muted text-xs">Measured: {metric.method}</p>
					)}
				</li>
			))}
		</ul>
	)
}
