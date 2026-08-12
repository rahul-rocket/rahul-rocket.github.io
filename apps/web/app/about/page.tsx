import type { Metadata } from 'next'

import { AboutSection } from '@/components/sections/about-section'

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Rahul — a software developer from Ahmedabad, India, building scalable web applications with React, Next.js, TypeScript and Node.js.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="pt-16">
      <AboutSection />
    </div>
  )
}
