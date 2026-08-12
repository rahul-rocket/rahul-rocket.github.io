import { HeroSection } from '@/components/sections/hero-section'
import { StatsBand } from '@/components/landing/stats-band'
import { AboutPreview } from '@/components/landing/about-preview'
import { WhatIDo } from '@/components/landing/what-i-do'
import { FeaturedProjects } from '@/components/landing/featured-projects'
import { ExperiencePreview } from '@/components/landing/experience-preview'
import { LatestPosts } from '@/components/landing/latest-posts'
import { GitHubActivity } from '@/components/landing/github-activity'
import { GetInTouchSection } from '@/components/landing/get-in-touch-section'
import { CtaBand } from '@/components/landing/cta-band'

// JSON-LD for the homepage
const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Rahul",
    jobTitle: "Software Developer",
    description: "Professional Software Developer based in Ahmedabad, India. Specializing in React, Next.js, Node.js, and modern web technologies.",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev",
    email: "rahulrathore576@gmail.com",
    telephone: "+91-8264110143",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "India",
    },
    sameAs: [
      "https://github.com/rahul",
      "https://linkedin.com/in/rahul",
      "https://twitter.com/rahul",
    ],
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "NestJS",
      "PostgreSQL",
      "MongoDB",
      "Tailwind CSS",
      "Web Development",
    ],
  },
}

/**
 * `LatestPosts` reads Postgres, which on a static export happens once during
 * `next build` -- same contract as /blog. Declaring the page static keeps the
 * export honest about that.
 */
export const dynamic = "force-static"

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/*
        The landing page is a teaser for the rest of the site: each block below
        summarises a section and links to its own route (app/about, app/skills,
        app/experience, app/projects, app/contact). Content is pulled from the
        same modules those pages use, so the two cannot drift apart.
      */}
      <article>
        <HeroSection />
        <StatsBand />
        <AboutPreview />
        <WhatIDo />
        <FeaturedProjects />
        <GitHubActivity />
        <ExperiencePreview />
        <LatestPosts />
        <GetInTouchSection />
        <CtaBand />
      </article>
    </>
  )
}
