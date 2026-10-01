import type { LucideIcon } from "lucide-react"
import { Bot, Code2, Layers, Server, Smartphone, Wrench } from "lucide-react"

/**
 * Generated cover art for a featured project, in place of a hot-linked stock
 * photo. It ships with the page (no network request, nothing to 404), follows
 * the theme tokens in both light and dark, and says something about the project
 * — its category and stack — instead of showing an unrelated photo.
 *
 * Decorative: the card's heading already names the project, so it is
 * `aria-hidden`.
 */

const categoryIcons: Record<string, LucideIcon> = {
  "AI/ML": Bot,
  Backend: Server,
  "Developer Tools": Wrench,
  Frontend: Code2,
  "Full Stack": Layers,
  Mobile: Smartphone,
}

/** Widths for the fake code lines, so every cover isn't identical. */
const LINE_SETS = [
  [62, 84, 48, 70, 36],
  [74, 52, 88, 40, 66],
  [56, 80, 64, 30, 72],
] as const

export function ProjectCover({
  title,
  category,
  technologies,
  variant,
}: {
  title: string
  category: string
  technologies: readonly string[]
  variant: number
}) {
  const Icon = categoryIcons[category] ?? Layers
  const lines = LINE_SETS[variant % LINE_SETS.length] ?? LINE_SETS[0]
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden bg-linear-to-br from-primary/15 via-secondary to-spectrum-3/20"
    >
      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_80%_70%_at_50%_50%,#000_40%,transparent_100%)]" />

      {/* Glows */}
      <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-spectrum-3/25 blur-3xl" />

      {/* Editor window */}
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 sm:inset-x-12 rounded-xl border border-border bg-card/85 shadow-2xl backdrop-blur-sm transition-transform duration-700 group-hover:-translate-y-[54%] group-hover:rotate-[-1deg]">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 truncate font-mono text-[11px] text-muted-foreground">
            ~/{slug}
          </span>
        </div>
        <div className="flex gap-5 p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-spectrum-3 text-primary-foreground shadow-lg">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 space-y-2.5 pt-1">
            {lines.map((width, i) => (
              <div
                key={i}
                className={`h-2 rounded-full ${i === 0 ? "bg-primary/60" : i === 2 ? "bg-spectrum-3/40" : "bg-muted-foreground/20"}`}
                style={{ width: `${width}%`, marginLeft: i === 2 || i === 3 ? "1rem" : undefined }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 border-t border-border px-5 py-3">
          {technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
