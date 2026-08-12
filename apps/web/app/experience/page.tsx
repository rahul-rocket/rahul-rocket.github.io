import type { Metadata } from 'next'

import { ExperienceSection } from '@/components/sections/experience-section'

export const metadata: Metadata = {
  title: 'Experience',
  description:
    "Rahul's professional experience as a software developer — roles, responsibilities and the products shipped along the way.",
  alternates: { canonical: '/experience' },
}

export default function ExperiencePage() {
  return (
    <div className="pt-16">
      <ExperienceSection />
    </div>
  )
}
