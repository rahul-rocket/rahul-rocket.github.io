/**
 * The `view-transition-name` shared by a case study's card title and its page
 * title — the pair the browser morphs between on a cross-document navigation
 * (motion.css, "PAGE TRANSITIONS").
 *
 * One function so the two ends cannot drift: a name that differs by one
 * character between `/projects/` and `/projects/<slug>/` does not fail, it
 * silently degrades to the root cross-fade.
 *
 * The prefix is load-bearing. A slug may start with a digit (`slugSchema`
 * allows `2024-rewrite`), and a CSS <custom-ident> may not, so the bare slug
 * would be an invalid name and the browser would drop it.
 */
export function caseStudyTransitionName(slug: string): string {
	return `case-study-${slug}`
}
