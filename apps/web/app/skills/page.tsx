import type { Metadata } from 'next'

import { SkillsSection } from '@/components/sections/skills-section'

export const metadata: Metadata = {
  title: 'Skills',
  description:
    'The languages, frameworks and tools Rahul works with — React, Next.js, TypeScript, Node.js, NestJS, PostgreSQL and more.',
  alternates: { canonical: '/skills' },
}

export default function SkillsPage() {
  return (
    <div className="pt-16">
      <SkillsSection />
    </div>
  )
}
