import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@portfolio/ui/button"

import { pageItems } from "@/lib/search-index"

/**
 * The site-wide 404. GitHub Pages serves out/404.html for any unmatched path,
 * so this is the page a mistyped or stale URL lands on.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-7xl md:text-8xl font-bold text-gradient mb-4">404</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            This page doesn&apos;t exist
          </h1>
          <p className="text-muted-foreground mb-10">
            The link may be out of date, or the address slightly off. Everything
            on the site is one of these:
          </p>

          <ul className="grid sm:grid-cols-2 gap-3 text-left mb-10">
            {pageItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors h-full"
                >
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-sm text-muted-foreground mt-0.5">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-8 gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back home
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8 gap-2">
              <Link href="/projects">
                <Compass className="h-4 w-4" />
                See the work
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
