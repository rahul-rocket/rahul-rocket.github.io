import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Badge } from "@portfolio/ui/badge"

/**
 * Shared shell for the four legal/reference pages. There is no typography
 * plugin in this app, so the element styles are applied here with arbitrary
 * child selectors rather than a `prose` class.
 */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  /** Human-readable date, e.g. "13 August 2026". */
  updated: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{title}</span>
          </nav>

          <header className="mb-10">
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <span className="text-primary">Legal</span>
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {updated}
            </p>
            {intro ? (
              <div className="text-muted-foreground leading-relaxed mt-6">
                {intro}
              </div>
            ) : null}
          </header>

          <article
            className="
              space-y-4 text-muted-foreground leading-relaxed
              [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3
              [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
              [&_strong]:text-foreground [&_strong]:font-semibold
              [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
            "
          >
            {children}
          </article>
        </div>
      </div>
    </div>
  )
}
