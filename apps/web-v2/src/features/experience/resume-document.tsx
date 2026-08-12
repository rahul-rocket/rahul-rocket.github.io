import { contactEmail, site } from '@/config/site'
import { formatPeriod } from '@/features/projects'
import type { Experience, Skill, SkillGroup } from '@/lib/content/records'

/**
 * C-04 — the résumé, rendered from the SAME data as `/experience`.
 * docs/WEBSITE_STRUCTURE.md §4.11.
 *
 * ONE SOURCE, TWO PRESENTATIONS, AND THE CI PDF IS A THIRD RENDERING OF THE
 * SECOND. C-06's acceptance criterion is that "the PDF and the HTML cannot
 * disagree, because both render from `experience.ts`" — the PDF is produced by
 * printing this page, so there is no third copy of anything and no export step
 * that could drift.
 *
 * DENSITY IS THE DESIGN. This is the one page on the site optimised for a
 * reader who is scanning eleven of them, so it drops the site's usual generous
 * rhythm: tighter spacing, no reveal animations, no decorative surfaces, and
 * every claim in the first two lines of its bullet.
 *
 * PRINT STYLES ARE IN `print.css` (C-05) AND NOT IN THIS COMPONENT. A `print:`
 * variant scattered across thirty class strings is unreviewable and cannot
 * express the two rules that matter most — hiding the shell, and expanding link
 * URLs after their text — so the print rules are one readable stylesheet keyed
 * off `[data-resume]`, which is set here.
 */
export function ResumeDocument({
	roles,
	skillGroups,
	summary,
}: {
	roles: readonly Experience[]
	skillGroups: readonly { group: SkillGroup; items: Skill[] }[]
	summary: string
}) {
	return (
		<div data-resume="" className="flex flex-col gap-10">
			{/* The contact block. In the DOM before the roles because that is the
			    order a recruiter reads it, and the order a printed page needs. */}
			<section aria-labelledby="resume-contact" className="flex flex-col gap-2">
				<h2 id="resume-contact" className="sr-only">
					Contact details
				</h2>
				<p className="text-text-muted text-sm">
					<a href={`mailto:${contactEmail()}`}>{contactEmail()}</a>
					{' · '}
					<a href={site.social.github} rel="me">
						{site.social.github.replace('https://', '')}
					</a>
					{' · '}
					<a href={site.url}>{site.url.replace('https://', '')}</a>
				</p>
				<p className="max-w-reading text-text-muted">{summary}</p>
			</section>

			<section
				aria-labelledby="resume-experience"
				className="flex flex-col gap-6"
			>
				<h2
					id="resume-experience"
					className="border-border border-b pb-2 font-heading text-h3 text-text leading-heading tracking-heading"
				>
					Experience
				</h2>

				<ol className="flex list-none flex-col gap-8 p-0">
					{roles.map((role) => (
						<li key={role.id} className="flex flex-col gap-2">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
								<h3 className="font-heading text-text leading-heading">
									{role.title}
									<span className="text-text-muted"> · {role.company}</span>
								</h3>
								<p className="shrink-0 font-mono text-sm text-text-muted">
									<time dateTime={role.startedAt}>
										{formatPeriod({ from: role.startedAt, to: role.endedAt })}
									</time>
								</p>
							</div>

							<p className="text-sm text-text-muted italic">{role.mandate}</p>

							<ul className="flex list-disc flex-col gap-1 pl-5">
								{role.outcomes.map((outcome) => (
									<li
										key={outcome.slice(0, 40)}
										className="text-sm text-text-muted"
									>
										{outcome}
									</li>
								))}
							</ul>
						</li>
					))}
				</ol>
			</section>

			<section aria-labelledby="resume-skills" className="flex flex-col gap-4">
				<h2
					id="resume-skills"
					className="border-border border-b pb-2 font-heading text-h3 text-text leading-heading tracking-heading"
				>
					Skills
				</h2>

				{/*
				  `primary` and `working` only. A résumé is a claim about what someone
				  can be relied on for, and "Familiar" entries — which `/skills` keeps
				  deliberately, because knowing the boundary of one's knowledge is a
				  signal — read on a résumé as padding. The full honest list, with its
				  three tiers and their definitions, is one link away.
				*/}
				<dl className="flex flex-col gap-3">
					{skillGroups.map((entry) => {
						const items = entry.items.filter(
							(skill) => skill.depth !== 'familiar',
						)
						if (items.length === 0) return null

						return (
							<div
								key={entry.group}
								className="flex flex-col gap-1 sm:flex-row sm:gap-4"
							>
								<dt className="shrink-0 text-text text-sm sm:w-52">
									{entry.group}
								</dt>
								<dd className="text-sm text-text-muted">
									{items.map((skill) => skill.name).join(' · ')}
								</dd>
							</div>
						)
					})}
				</dl>

				<p className="text-sm text-text-muted">
					Full list with depth ratings and their definitions:{' '}
					<a href="/skills/">the skills page</a>.
				</p>
			</section>
		</div>
	)
}
