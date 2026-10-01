import Link from "next/link"
import { ArrowRight, Code2, Sparkles, Users } from "lucide-react"
import { Button } from "@portfolio/ui/button"

const traits = [
  {
    icon: Code2,
    title: "Clean, boring code",
    description: "Readable beats clever. The next person to open the file is usually me.",
  },
  {
    icon: Sparkles,
    title: "Product-minded",
    description: "I'd rather understand why a feature exists than just implement the ticket.",
  },
  {
    icon: Users,
    title: "Team-first",
    description: "Code review, mentoring, and writing things down are part of the job.",
  },
]

export function AboutPreview() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              A developer from <span className="text-gradient">Ahmedabad</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              I&apos;m Rahul. I build web applications end to end — the interface
              people actually touch, the API behind it, and the deployment pipeline
              that gets it live.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I started out curious about how websites worked, and that turned into
              a career spent making them faster, tidier, and easier for the next
              developer to pick up. These days that mostly means React, Next.js,
              TypeScript and Node.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2 group">
              <Link href="/about">
                More about me
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-4">
            {traits.map((trait) => (
              <li
                key={trait.title}
                className="flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                  <trait.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{trait.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {trait.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
