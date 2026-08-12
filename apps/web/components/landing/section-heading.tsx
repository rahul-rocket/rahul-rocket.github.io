import { Badge } from "@portfolio/ui/badge"

/**
 * The heading block every landing-page teaser shares, so the rhythm of the
 * page stays the same from one section to the next.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: string
}) {
  return (
    <div className="text-center mb-10 md:mb-12">
      <Badge variant="outline" className="mb-4 px-4 py-1">
        <span className="text-primary">{eyebrow}</span>
      </Badge>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
          {description}
        </p>
      ) : null}
    </div>
  )
}
