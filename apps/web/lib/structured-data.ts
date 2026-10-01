import type { BlogPost } from "@/lib/posts"
import { absoluteUrl, site } from "@/lib/site"

/**
 * JSON-LD builders. Pages compose these; none of them repeat a fact.
 *
 * THE `Person` IS ONE NODE WITH AN `@id`, and everything else points at it by
 * reference. Two inline `Person` objects -- what the layout and the home page
 * used to emit -- are two unrelated people to a parser that happen to share a
 * name.
 *
 * Not published: a phone number. Structured data is harvested by crawlers and
 * AI tools in bulk, and email plus the contact form are the channels this site
 * offers.
 */

export type JsonLd = Record<string, unknown>

export const PERSON_ID = absoluteUrl("/#person")
export const WEBSITE_ID = absoluteUrl("/#website")

export function personSchema(): JsonLd {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: absoluteUrl("/"),
    jobTitle: site.role,
    description: site.description,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.locality,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
    sameAs: [...site.sameAs],
    knowsAbout: [...site.knowsAbout],
  }
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: site.name,
    description: site.description,
    publisher: { "@id": PERSON_ID },
  }
}

export function profilePageSchema(): JsonLd {
  return {
    "@type": "ProfilePage",
    url: absoluteUrl("/"),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
  }
}

export function blogPostingSchema(post: BlogPost): JsonLd {
  const url = absoluteUrl(`/blog/${post.slug}`)
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    keywords: post.tags.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  }
}

/** Wraps nodes in one `@graph` so their `@id` references resolve together. */
export function graph(...nodes: JsonLd[]): JsonLd {
  return { "@context": "https://schema.org", "@graph": nodes }
}

/**
 * Serialises for an inline `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is not safe here: a post title containing
 * `</script>` would close the tag and inject markup. Escaping `<` as `<`
 * keeps the JSON identical to a parser and inert to the HTML tokenizer.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
