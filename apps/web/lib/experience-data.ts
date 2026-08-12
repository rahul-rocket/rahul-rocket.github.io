/** Work history, shared by the /experience page and the landing-page preview. */

export interface Experience {
  id: number
  role: string
  company: string
  companyUrl: string
  location: string
  duration: string
  type: string
  description: string
  responsibilities: string[]
  achievements: string[]
  technologies: string[]
  /** Tailwind gradient stops, e.g. "from-violet-500 to-purple-500". */
  color: string
}

export const experiences: Experience[] = [
  {
    id: 1,
    role: "Senior Software Developer",
    company: "TechVision Solutions",
    companyUrl: "https://techvision.example.com",
    location: "Ahmedabad, India",
    duration: "Jan 2024 - Present",
    type: "Full-time",
    description: "Leading development of enterprise-grade web applications and mentoring a team of developers. Driving architectural decisions and implementing best practices across projects.",
    responsibilities: [
      "Architecting and developing scalable microservices using Node.js and NestJS",
      "Leading a team of 5 developers, conducting code reviews and mentoring sessions",
      "Implementing CI/CD pipelines and DevOps practices for streamlined deployments",
      "Collaborating with product managers to define technical requirements and timelines",
      "Optimizing application performance and database queries for high-traffic systems",
    ],
    achievements: [
      "Reduced API response time by 60% through query optimization and caching strategies",
      "Successfully delivered 3 major product launches within tight deadlines",
      "Implemented automated testing that increased code coverage from 45% to 85%",
      "Mentored 2 junior developers who were promoted to mid-level positions",
    ],
    technologies: ["React", "Next.js", "Node.js", "NestJS", "PostgreSQL", "Redis", "Docker", "AWS"],
    color: "from-violet-500 to-purple-500",
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Digital Dynamics",
    companyUrl: "https://digitaldynamics.example.com",
    location: "Ahmedabad, India",
    duration: "Jun 2022 - Dec 2023",
    type: "Full-time",
    description: "Developed and maintained multiple client-facing web applications using modern JavaScript frameworks. Worked in an agile environment with cross-functional teams.",
    responsibilities: [
      "Building responsive and performant frontend applications using React and Next.js",
      "Designing and implementing RESTful APIs with Node.js and Express",
      "Managing MongoDB and PostgreSQL databases with efficient schema designs",
      "Integrating third-party services and payment gateways (Stripe, Razorpay)",
      "Writing comprehensive unit and integration tests using Jest and Cypress",
    ],
    achievements: [
      "Built an e-commerce platform serving 50,000+ monthly active users",
      "Migrated legacy jQuery codebase to React, improving performance by 40%",
      "Implemented real-time features using WebSockets for live collaboration tools",
      "Received 'Developer of the Quarter' award for exceptional contributions",
    ],
    technologies: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "Tailwind CSS", "Vercel"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    role: "Frontend Developer",
    company: "WebCraft Studios",
    companyUrl: "https://webcraft.example.com",
    location: "Gandhinagar, India",
    duration: "Aug 2020 - May 2022",
    type: "Full-time",
    description: "Focused on creating pixel-perfect, responsive user interfaces and improving frontend performance. Collaborated closely with designers to implement modern UI/UX patterns.",
    responsibilities: [
      "Developing responsive web applications using React and modern CSS frameworks",
      "Implementing complex UI components and animations for enhanced user experience",
      "Collaborating with UI/UX designers to translate Figma designs into code",
      "Optimizing frontend performance through lazy loading and code splitting",
      "Maintaining and updating existing codebases with new features and bug fixes",
    ],
    achievements: [
      "Improved Lighthouse performance score from 65 to 95 across all projects",
      "Created a reusable component library used across 10+ client projects",
      "Reduced page load time by 50% through optimization techniques",
      "Successfully delivered 15+ client projects with 100% client satisfaction",
    ],
    technologies: ["React", "JavaScript", "SASS", "Tailwind CSS", "Redux", "Webpack", "Figma", "Git"],
    color: "from-emerald-500 to-green-500",
  },
  {
    id: 4,
    role: "Junior Web Developer",
    company: "StartUp Hub",
    companyUrl: "https://startuphub.example.com",
    location: "Ahmedabad, India",
    duration: "Jul 2019 - Jul 2020",
    type: "Full-time",
    description: "Started my professional journey as a junior developer, learning industry best practices and contributing to various web development projects in a fast-paced startup environment.",
    responsibilities: [
      "Assisting in frontend development using HTML, CSS, JavaScript, and React",
      "Learning and implementing responsive design principles",
      "Participating in daily standups and sprint planning meetings",
      "Debugging and fixing issues reported by QA team",
      "Documenting code and maintaining technical documentation",
    ],
    achievements: [
      "Quickly learned React and contributed to production code within 2 months",
      "Built an internal dashboard tool that saved 10 hours/week for the ops team",
      "Received positive feedback from senior developers for code quality",
      "Completed AWS Cloud Practitioner certification during tenure",
    ],
    technologies: ["HTML5", "CSS3", "JavaScript", "React", "Bootstrap", "Git", "Firebase", "Jira"],
    color: "from-orange-500 to-amber-500",
  },
]
