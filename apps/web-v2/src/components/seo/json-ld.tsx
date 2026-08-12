import type { JsonLd } from '@/lib/seo/structured-data'

/**
 * Q-05 / H-08 — the one place structured data becomes a `<script>`.
 * docs/SEO.md §5.
 *
 * §5 requires JSON-LD to be "emitted as `<script type="application/ld+json">`,
 * generated from typed objects so malformed schema is a type error". The typed
 * objects are the builders in `lib/seo/structured-data.ts`; this is the emitter,
 * and keeping it to one component means the serialisation rule below is written
 * once.
 *
 * A SERVER COMPONENT, AND THEREFORE 0 KB. A `<script type="application/ld+json">`
 * is data, not code — the browser never executes it — so this costs bytes in the
 * HTML and nothing in the JavaScript budget. It is also why the tag survives
 * with JavaScript disabled, which is what a crawler with a script budget
 * effectively is.
 *
 * WHY `<` IS ESCAPED AND NOTHING ELSE IS.
 *
 * `dangerouslySetInnerHTML` is unavoidable: React escapes text children, and an
 * escaped `&` or `<` inside a JSON-LD body makes the block unparseable. The
 * hazard that remains is not injection from a reader — every value here is
 * built at export time from typed content — it is the HTML parser, which ends a
 * `<script>` element at the literal byte sequence `</script>` wherever it
 * appears, including inside a JSON string, because it does not understand JSON.
 * A value containing that sequence would close the tag early and inject the
 * remainder of the payload into the document as markup. Escaping every `<` to
 * its JSON escape makes the sequence unrepresentable in the output while
 * leaving the parsed value byte-identical: a JSON reader resolves the escape
 * back to `<`, and the HTML parser never sees one.
 *
 * That matters even though every value is a build-time constant today, because
 * it will not stay that way: post titles, case-study summaries and tag names
 * are already schema values, and those are authored content. The escape belongs
 * at the emitter, where it cannot be forgotten by the next builder, rather than
 * at each call site.
 */
const LD_JSON = 'application/ld+json'

export function JsonLdScript({ data }: { data: JsonLd }) {
	const __html = serialize(data)

	// Kept to ONE line for the same reason the boot script in app/layout.tsx is:
	// a Biome suppression applies only to the line that follows it, so a
	// multi-line element would move the flagged prop out from under the comment
	// and silently stop suppressing anything. The type and the payload are
	// hoisted above to keep this inside the 80-column formatter limit.
	//
	// biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD body; `serialize` escapes every `<`, so nothing in it can close the element.
	return <script type={LD_JSON} dangerouslySetInnerHTML={{ __html }} />
}

function serialize(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, '\\u003c')
}
