import { HeroSection } from '@/components/sections/hero-section'
import { StatsBand } from '@/components/landing/stats-band'
import { AboutPreview } from '@/components/landing/about-preview'
import { WhatIDo } from '@/components/landing/what-i-do'
import { FeaturedProjects } from '@/components/landing/featured-projects'
import { ExperiencePreview } from '@/components/landing/experience-preview'
import { LatestPosts } from '@/components/landing/latest-posts'
import { GitHubActivity } from '@/components/landing/github-activity'
import { JsonLdScript } from '@/components/json-ld'
import { graph, profilePageSchema } from '@/lib/structured-data'
import { GetInTouchSection } from '@/components/landing/get-in-touch-section'
import { CtaBand } from '@/components/landing/cta-band'


/**
 * `LatestPosts` reads Postgres, which on a static export happens once during
 * `next build` -- same contract as /blog. Declaring the page static keeps the
 * export honest about that.
 */
export const dynamic = "force-static"

export default function HomePage() {
  return (
    <>
      {/* The Person itself is in the layout's graph; this points at it. */}
      <JsonLdScript data={graph(profilePageSchema())} />

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
