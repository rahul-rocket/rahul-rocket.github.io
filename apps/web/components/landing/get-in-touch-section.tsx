import { SectionHeading } from "@/components/landing/section-heading"
import { GetInTouch } from "@/components/get-in-touch"

export function GetInTouchSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Get in Touch"
          title={
            <>
              Pick the <span className="text-gradient">right channel</span>
            </>
          }
          description="Each of these reaches me — they just suit different things, so here's what each one is best for."
        />

        <div className="max-w-5xl mx-auto">
          <GetInTouch />
        </div>
      </div>
    </section>
  )
}
