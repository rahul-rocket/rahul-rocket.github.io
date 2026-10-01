import { type JsonLd, serializeJsonLd } from "@/lib/structured-data"

/** The one way a page emits JSON-LD -- see `serializeJsonLd` for why. */
export function JsonLdScript({ data }: { data: JsonLd }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
