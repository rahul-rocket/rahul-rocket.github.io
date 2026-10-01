import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Button } from "@portfolio/ui/button"

import { LandingSection, SectionHeading } from "@/components/landing/section-heading"
import { contactChannels, type ContactChannel } from "@/lib/contact-channels"

const EMAIL = "rahulrathore576@gmail.com"

// Email is the headline above, location is the closing line, and "website"
// is this site -- the list keeps only the channels that go somewhere else.
const OMITTED: ReadonlySet<ContactChannel["icon"]> = new Set(["email", "website", "location"])
const linkChannels = contactChannels.filter(
  (channel): channel is ContactChannel & { href: string } =>
    channel.href !== undefined && !OMITTED.has(channel.icon),
)

export function Contact() {
  return (
    <LandingSection id="contact">
      <SectionHeading
        index="05"
        eyebrow="Contact"
        title={
          <>
            Have something you want <em className="text-primary">built</em>?
          </>
        }
        description="A product from scratch, a codebase that needs untangling, or a role on your team — I'd like to hear about it."
      />

      <div className="grid gap-12 md:grid-cols-[1fr_20rem]">
        <div>
          <a
            href={`mailto:${EMAIL}`}
            className="font-bold text-3xl sm:text-4xl md:text-5xl break-all underline decoration-border decoration-1 underline-offset-8 hover:decoration-primary transition-colors"
          >
            {EMAIL}
          </a>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="rounded-full px-7 gap-2 group">
              <Link href="/contact">
                Start a conversation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Ahmedabad, India — working with teams anywhere.
          </p>
        </div>

        <ul className="divide-y divide-border border-y border-border self-start">
          {linkChannels.map((channel) => {
            const isExternal = channel.href.startsWith("http")
            return (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  className="group flex items-start justify-between gap-4 py-4"
                  {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span>
                    <span className="font-medium">{channel.label}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">
                      {channel.bestFor}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </LandingSection>
  )
}
