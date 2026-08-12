/**
 * The `projects` feature's public surface — ARCHITECTURE §5.
 *
 * `app/projects/**` imports from here and never from a path inside this
 * directory; Biome enforces it (F0-07). `lib/format-period.ts` is re-exported
 * because `/experience` and `/resume` render the same date ranges and a second
 * implementation of "Jun 2023 — Present" is exactly the drift a shared feature
 * barrel exists to prevent.
 */

export { CaseStudyHeader } from './case-study-header'
export { CaseStudyNav } from './case-study-nav'
export {
	formatMonth,
	formatMonthShort,
	formatPeriod,
	periodDuration,
} from './lib/format-period'
export { MetricList } from './metric-list'
export { ProjectCard } from './project-card'
export { ProjectsIndex } from './projects-index'
