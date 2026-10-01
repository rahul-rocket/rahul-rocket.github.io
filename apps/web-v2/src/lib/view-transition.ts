/**
 * `view-transition-name`s shared between a card title and the `<h1>` of the
 * page it links to — the pairs the browser morphs between on a cross-document
 * navigation (motion.css, "PAGE TRANSITIONS").
 *
 * One module so neither end can drift: a name that differs by one character
 * between the index and the detail page does not fail, it silently degrades to
 * the root cross-fade. And one module so the prefixes stay distinct — a case
 * study and a post may share a slug, and two elements with the same name on
 * one page abort the whole transition.
 *
 * The prefixes are also load-bearing for validity. `slugSchema` allows a slug
 * that starts with a digit (`2024-rewrite`), and a CSS <custom-ident> may not,
 * so a bare slug would be an invalid name that the browser drops.
 */
export function caseStudyTransitionName(slug: string): string {
	return `case-study-${slug}`
}

export function postTransitionName(slug: string): string {
	return `post-${slug}`
}
