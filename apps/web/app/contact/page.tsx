import type { Metadata } from 'next'

import { ContactSection } from '@/components/sections/contact-section'
import { GetInTouch } from '@/components/get-in-touch'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Rahul — software developer based in Ahmedabad, India. Available for freelance and full-time work.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="pt-16">
      <ContactSection />

      {/* The channel list from the GitHub profile README -- what each way of
          reaching me is actually best for. */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Other ways to <span className="text-gradient">reach me</span>
          </h2>
          <GetInTouch />
        </div>
      </section>
    </div>
  )
}
