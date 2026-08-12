import Link from "next/link"
import { ArrowRight, Mail, MapPin } from "lucide-react"
import { Button } from "@portfolio/ui/button"

export function CtaBand() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-background to-purple-500/10 px-6 py-12 md:px-16 text-center">
          {/* Matches the hero's orbs so the page closes the way it opened. */}
          <div className="absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-sm text-muted-foreground">
                Available for opportunities
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Have something you want <span className="text-gradient">built?</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Whether it&apos;s a product from scratch, a codebase that needs
              untangling, or an extra pair of hands on an existing team — I&apos;d
              like to hear about it.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" asChild className="rounded-full px-8 gap-2 group">
                <Link href="/contact">
                  Start a conversation
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 gap-2">
                <a href="mailto:rahulrathore576@gmail.com">
                  <Mail className="h-4 w-4" />
                  rahulrathore576@gmail.com
                </a>
              </Button>
            </div>

            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <MapPin className="h-4 w-4" />
              Ahmedabad, India — working with teams anywhere
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
