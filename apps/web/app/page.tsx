import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ContactSection } from '@/components/sections/contact-section'

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

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Main sections with semantic HTML */}
      <article>
        <HeroSection />

        <section aria-labelledby="about-heading">
          <AboutSection />
        </section>

        <section aria-labelledby="skills-heading">
          <SkillsSection />
        </section>

        <section aria-labelledby="experience-heading">
          <ExperienceSection />
        </section>

        <section aria-labelledby="projects-heading">
          <ProjectsSection />
        </section>

        <section aria-labelledby="contact-heading">
          <ContactSection />
        </section>
      </article>
    </>
  )
}
