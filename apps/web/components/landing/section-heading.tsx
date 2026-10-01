import Link from "next/link"
import { ArrowRight } from "lucide-react"

/**
 * The heading row every landing-page section shares: a numbered eyebrow, a
 * serif title, and an optional "see all" link aligned to the right on wide
 * screens. Keeping it in one place holds the page's rhythm steady.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  link,
}: {
  index: string
  eyebrow: string
  title: React.ReactNode
  description?: string
  link?: { href: string; label: string }
}) {
  return (
    <header className="mb-10 md:mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span className="text-primary">{index}</span>
          <span aria-hidden="true"> / </span>
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mt-4">
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{description}</p>
        ) : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="group inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          {link.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : null}
    </header>
  )
}

/** Shared section frame: consistent vertical rhythm and a hairline divider. */
export function LandingSection({
  id,
  children,
}: {
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border">
      <div className="container mx-auto px-4 py-20 md:py-28 max-w-6xl">{children}</div>
    </section>
  )
}
