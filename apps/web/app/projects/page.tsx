import type { Metadata } from 'next'

import { ProjectsSection } from '@/components/sections/projects-section'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected projects built by Rahul — web applications, APIs and tools built with React, Next.js, TypeScript and Node.js.',
  alternates: { canonical: '/projects' },
}

export default function ProjectsPage() {
  return (
    <div className="pt-16">
      <ProjectsSection />
    </div>
  )
}
