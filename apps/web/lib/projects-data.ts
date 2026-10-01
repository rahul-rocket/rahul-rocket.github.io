// Project data with detailed information for dynamic pages

import type { Project, ProjectsData } from "./types"

/**
 * Where a project's generated cover lives. The PNG is rendered at build time
 * by app/projects/[slug]/cover.png/route.tsx and exported as a static file, so
 * it is same-origin, cannot 404 on a third-party host, and is a real raster
 * image — which Open Graph and Twitter cards require (they ignore SVG).
 */
export function projectCoverPath(slug: string): string {
  return `/projects/${slug}/cover.png`
}

/**
 * Every entry here is a real repository. Facts come from each repo's README and
 * manifests; nothing is estimated. Private repositories carry no `github` link
 * (it would 404 for visitors), and `results` stays empty until there is a
 * measured number to put in it.
 */
export const projectsData: ProjectsData = {
  "ever-gauzy": {
    id: "ever-gauzy",
    title: "Ever Gauzy",
    subtitle: "Open-source business management platform (ERP / CRM / HRM)",
    category: "Open Source",
    status: "Open source · Live",
    role: "Core Contributor",
    client: "Ever Co.",
    year: "2026",
    period: "2020 – 2026",
    featured: true,
    github: "https://github.com/ever-co/ever-gauzy",
    demo: "https://app.gauzy.co",
    links: [
      { label: "Documentation", href: "https://docs.gauzy.co" },
      { label: "My commits", href: "https://github.com/ever-co/ever-gauzy/commits/develop?author=rahul-rocket" },
    ],
    thumbnail: projectCoverPath("ever-gauzy"),
    screenshots: [],
    summary:
      "Six years as a core contributor to a large open-source ERP/CRM/HRM platform — about 9,000 commits across the NestJS API, Angular apps, multi-database migrations, multi-tenancy and third-party integrations.",
    overview:
      "Ever Gauzy is an open business-management platform for collaborative, on-demand and sharing economies: HR with time tracking and performance monitoring, CRM, ERP, invoicing, payments and project management. It runs as web, desktop (Electron) and server apps over a headless API that other products — including Ever Teams — are built on.",
    problemStatement:
      "A platform used as both a product and a headless backend has to run on several databases, isolate many tenants in one deployment, integrate with the tools teams already use, and stay maintainable while dozens of contributors change it every week.",
    solutionApproach: [
      "Wrote and maintained database migrations for PostgreSQL, MySQL and SQLite side by side, so every schema change ships for all three.",
      "Worked on the dual TypeORM / MikroORM data layer that lets the platform run on either ORM.",
      "Built multi-tenant safeguards — tenant guards, tenant-scoped API keys and per-tenant custom SMTP.",
      "Built and maintained integrations: GitHub (Octokit, webhook issue sync), Hubstaff and Upwork time-tracking sync, Zapier webhooks, and Wasabi/S3 file storage.",
      "Added a global email service with template rendering, global API logging middleware, and plugin and integration packages.",
      "Kept the codebase healthy at scale: DeepScan and cspell fixes, dependency upgrades, and Angular/Nx build maintenance.",
    ],
    techStack: {
      frontend: ["Angular", "RxJS", "Nebular / ngx-admin", "Electron"],
      backend: ["NestJS", "TypeScript", "TypeORM", "MikroORM", "Knex", "PostgreSQL", "MySQL", "SQLite"],
      services: ["GitHub API (Octokit)", "Hubstaff", "Upwork", "Zapier", "Wasabi / S3", "SMTP"],
      devops: ["Nx", "Lerna", "Docker", "Kubernetes", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "9,000+" },
        { label: "Share of all commits", value: "≈ 32%" },
        { label: "Pull requests I merged", value: "2,000+" },
        { label: "Years active", value: "2020 – 2026" },
      ],
      highlights: [
        "Multi-database migrations (PostgreSQL, MySQL, SQLite) for core entities",
        "Tenant guards, tenant API keys and per-tenant custom SMTP",
        "GitHub ↔ Gauzy issue sync via webhooks and Octokit",
        "Hubstaff and Upwork activity and screenshot sync",
        "Zapier webhook subscriptions and Wasabi file storage provider",
        "Global email/template service and API logging middleware",
        "MikroORM support alongside TypeORM",
        "Static-analysis and spelling cleanups across the monorepo (DeepScan, cspell)",
      ],
      source:
        "git log on ever-co/ever-gauzy develop, counting commits under the author's names and emails (9,017 of 27,951).",
    },
    features: [
      "Time tracking with desktop timer, screenshots and activity",
      "Employee, team and project management",
      "CRM, invoicing, estimates and payments",
      "Multi-tenant, multi-organization deployments",
      "Integrations with GitHub, Hubstaff, Upwork and Zapier",
      "Headless APIs used by other Ever products",
    ],
    challenges: [
      {
        challenge: "Every schema change has to work on three databases",
        solution:
          "Database-specific migrations written for PostgreSQL, MySQL and SQLite for each change, rather than relying on ORM sync.",
      },
      {
        challenge: "Many tenants sharing one deployment",
        solution: "Tenant-scoped guards and API keys at the API layer, plus per-tenant configuration such as custom SMTP.",
      },
    ],
    learnings: [],
    results: [],
    relatedProjects: ["ever-teams", "nestjs-multi-orm"],
  },

  "ever-teams": {
    id: "ever-teams",
    title: "Ever Teams",
    subtitle: "Open-source work and project-management platform",
    category: "Open Source",
    status: "Open source · Live",
    role: "Contributor (backend APIs)",
    client: "Ever Co.",
    year: "2024",
    period: "2023 – 2024",
    featured: false,
    github: "https://github.com/ever-co/ever-teams",
    demo: "https://app.ever.team",
    links: [{ label: "Website", href: "https://ever.team" }],
    thumbnail: projectCoverPath("ever-teams"),
    screenshots: [],
    summary:
      "A Next.js and React Native work-management app built on Ever Gauzy's headless APIs. My part was on the API side: authentication and organization endpoints Teams depends on.",
    overview:
      "Ever Teams is an open work and project-management platform with web, mobile and browser-extension clients. It runs on top of the Ever Gauzy platform, using it as a headless backend.",
    problemStatement:
      "Ever Teams needs team-aware authentication and organization data from Gauzy's APIs, which were originally designed around Gauzy's own Angular app.",
    solutionApproach: [
      "Updated authentication APIs to include teams in the response.",
      "Fixed the user-organization list API and missing backend relations Teams relied on.",
    ],
    techStack: {
      frontend: ["Next.js", "React", "React Native (Expo)", "TypeScript"],
      backend: ["Ever Gauzy APIs", "NestJS"],
      services: [],
      devops: ["Nx", "Docker"],
    },
    contribution: {
      stats: [
        { label: "Commits in this repo", value: "6" },
        { label: "Active", value: "2023 – 2024" },
      ],
      highlights: [
        "Team-aware authentication APIs",
        "User-organization list API fix",
        "Missing backend relations (#2348)",
      ],
      source:
        "git log on ever-co/ever-teams develop. Most backend work for Teams landed in the Ever Gauzy repository instead.",
    },
    features: ["Team task management", "Time tracking", "Web, mobile and browser-extension clients"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["ever-gauzy"],
  },

  "iq-insights": {
    id: "iq-insights",
    title: "IQ Insights",
    subtitle: "SaaS IQ and personality-test platform",
    category: "Full Stack",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    period: "2025 – 2026",
    featured: true,
    thumbnail: projectCoverPath("iq-insights"),
    screenshots: [],
    summary:
      "A Turborepo monorepo with a Next.js 16 public site, a role-gated admin CMS and a NestJS 11 API on Supabase — adaptive tests, gamified progress, AI reports, Stripe + Razorpay billing and verifiable certificates.",
    overview:
      "IQ Insights is a SaaS assessment platform: users take adaptive IQ and personality tests, get instant scores and AI-generated cognitive reports, track progress with XP, badges and streaks, and download certificates that anyone can verify publicly.",
    problemStatement:
      "An assessment product touches auth, payments in two markets, content management, localisation and AI generation at once. Kept in one app, those concerns tangle; split across repos, shared types and schema drift apart.",
    solutionApproach: [
      "Turborepo + pnpm monorepo: apps/web (public site), apps/admin (CMS) and apps/api (NestJS), with shared @iqinsights/* packages consumed via workspace:*.",
      "Supabase owns auth and Postgres; migrations own the schema and row-level security guards data access, with four context-specific Supabase clients.",
      "Billing isolated in its own package behind one interface over Stripe and Razorpay; email isolated the same way over SendGrid.",
      "AI report generation kept provider-agnostic behind a spec, so the model vendor is a configuration choice rather than a rewrite.",
    ],
    techStack: {
      frontend: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "next-intl", "shadcn/ui"],
      backend: ["NestJS 11", "Supabase", "PostgreSQL", "Upstash Redis"],
      services: ["Stripe", "Razorpay", "SendGrid"],
      devops: ["Turborepo", "pnpm", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "745" },
        { label: "Share of all commits", value: "98%" },
        { label: "Active", value: "2025 – 2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (745 of 764).",
    },
    features: [
      "Multiple test types with adaptive questions and instant scoring",
      "Dashboard with history, progress and gamification (XP, badges, streaks)",
      "AI-generated cognitive insight reports",
      "Supabase SSR auth with role-gated admin access",
      "Stripe and Razorpay checkout and orders",
      "Downloadable, shareable, publicly verifiable certificates",
      "Localised routes under /[locale]/",
    ],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["kidzorides", "brainboost"],
  },

  planix: {
    id: "planix",
    title: "Planix",
    subtitle: "Self-hostable project-management platform",
    category: "Full Stack",
    status: "Foundation",
    role: "Architect",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: true,
    thumbnail: projectCoverPath("planix"),
    screenshots: [],
    summary:
      "A multi-tenant, keyboard-first alternative to Linear and Jira. The monorepo foundation is built — Next.js 15, NestJS 11 with OpenAPI, Prisma, Storybook — with layered dependency rules enforced in CI.",
    overview:
      "Planix is the foundation for a long-term project-management product, self-hosted or SaaS. Business features (auth, orgs, projects, tasks) are next; every locked decision is an ADR.",
    problemStatement: "Large monorepos rot when any package can import any other.",
    solutionApproach: [
      "Dependencies point downward only (app → feature → data-access/ui → sdk → util), enforced by turbo boundaries tags and eslint-plugin-boundaries.",
      "Domain contracts in a Zod sdk package shared by web and API.",
      "Per-app Dockerfiles built with turbo prune.",
    ],
    techStack: {
      frontend: ["Next.js 15", "React 19", "Tailwind CSS", "shadcn/ui", "Radix", "Storybook 8"],
      backend: ["NestJS 11", "Prisma", "PostgreSQL", "Redis", "Zod"],
      services: ["OpenAPI / Swagger"],
      devops: ["Turborepo", "pnpm", "Docker", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "252" },
        { label: "Share of all commits", value: "96%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (252 of 263).",
    },
    features: [],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["kickstart"],
  },

  brainboost: {
    id: "brainboost",
    title: "BrainBoost",
    subtitle: "A brain-training platform built for hundreds of games",
    category: "Mobile",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: true,
    thumbnail: projectCoverPath("brainboost"),
    screenshots: [],
    summary:
      "One Flutter app hosting many memory, focus, logic and maths games over a shared engine, progression system and design system — designed so game #300 costs the same as game #3.",
    overview:
      "BrainBoost is a brain-training platform, not a collection of games. The Flutter app (Android, iOS and playable web) hosts every game through a plugin contract; a Next.js site handles marketing and SEO, and a NestJS API stores progress.",
    problemStatement:
      "Game catalogues usually scale linearly in cost: each game reimplements timers, scoring, lives, hints and save state, and the UI drifts. The goal was a structure where adding a game is a folder, not a project.",
    solutionApproach: [
      "A game_api package defines the plugin contract every game implements; game_engine supplies timer, score, lives, hints, difficulty and save state.",
      "Shared core (entities, Result/Failure, config) and design_system packages keep every game consistent.",
      "The Flutter/TypeScript split — Flutter for the product, Next.js for marketing — is settled in an ADR so it isn't re-argued per feature.",
      "With hosted CI unavailable, a pre-push hook runs the cheap checks locally and prints which jobs still run nowhere, instead of implying a green build.",
    ],
    techStack: {
      frontend: ["Flutter", "Dart", "Next.js"],
      backend: ["NestJS", "Prisma", "PostgreSQL", "Redis"],
      services: [],
      devops: ["Turborepo", "pnpm", "Docker Compose", "Git hooks"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "239" },
        { label: "Share of all commits", value: "98%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (239 of 244).",
    },
    features: [
      "Games across memory, focus, logic, reaction speed, maths and creativity",
      "Shared progression system",
      "Plugin SDK for new games",
      "Android, iOS and playable web from one codebase",
    ],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["iq-insights", "planix"],
  },

  "creator-os": {
    id: "creator-os",
    title: "CreatorOS",
    subtitle: "Create once. Publish everywhere.",
    category: "AI/ML",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: false,
    thumbnail: projectCoverPath("creator-os"),
    screenshots: [],
    summary:
      "An AI content operating system for generating, managing and publishing content across multiple AI providers — Next.js app, NestJS gateway, BullMQ workers and Stripe credit metering.",
    overview:
      "CreatorOS lets creators generate text, image, video and voice content through one interface, then manage and publish it. It is built sprint by sprint from a version-controlled engineering handbook.",
    problemStatement: "Creators juggle a different AI tool per medium, with no shared library, billing or publishing flow.",
    solutionApproach: [
      "An ai package abstracts providers per modality (text, image, video, voice, search).",
      "Long-running generation runs in a BullMQ worker, not the request path.",
      "Better Auth for sessions/JWT; Stripe subscriptions with credit metering in a billing package.",
      "Local infra via Docker: Postgres, Redis and MinIO.",
    ],
    techStack: {
      frontend: ["Next.js", "TypeScript"],
      backend: ["NestJS", "BullMQ", "PostgreSQL", "Redis"],
      services: ["Stripe", "Better Auth", "MinIO"],
      devops: ["Turborepo", "pnpm", "Docker", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "223" },
        { label: "Share of all commits", value: "100%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (223 of 223).",
    },
    features: ["Multi-provider AI generation", "Background job processing", "Credit-metered subscriptions", "Admin console"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["blueprint-ai"],
  },

  kidzorides: {
    id: "kidzorides",
    title: "KidzoRides",
    subtitle: "Taking over and re-platforming an AI-generated booking product",
    category: "Full Stack",
    status: "Live · re-platforming",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    period: "2025 – 2026",
    featured: false,
    thumbnail: projectCoverPath("kidzorides"),
    screenshots: [],
    summary:
      "Rental bookings for birthday parties, school events and mall activations across India — a web booking wizard, WhatsApp booking, Razorpay payments and an operator console, mid-migration from MongoDB to Postgres.",
    overview:
      "The codebase was largely produced by an AI app builder; my work has been taking it over by hand — securing it, restructuring it and planning its re-platform. Customers browse a fleet of ride-on and electric toy cars, pick a date and duration, add extras and pay via Razorpay; the operator then handles delivery, setup and collection. WhatsApp is a first-class booking channel alongside the web wizard.",
    problemStatement:
      "The working product grew as 136 Next.js route handlers over raw MongoDB with hand-rolled auth. It shipped, but it carried unsigned admin tokens, hardcoded admin credentials and a double-booking race that a read-then-write availability check cannot close.",
    solutionApproach: [
      "Restructured into a Turborepo with apps/web (113 routes) and apps/admin (110 routes) on pnpm, with shared packages.",
      "Closed the Phase 0 security issues: admin auth is now HS256 JWT via jose keyed on JWT_SECRET, and the first admin is seeded from environment variables.",
      "Added an interim double-booking guard — a unique index on a discretised car|date|hour slot key — so the loser of a race gets a duplicate-key error instead of a second booking.",
      "Planned the target: NestJS API and worker, PostgreSQL on Supabase with Prisma, Supabase Auth and Storage, and an EXCLUDE USING gist constraint as the real overlap fix.",
    ],
    techStack: {
      frontend: ["Next.js", "React", "TypeScript"],
      backend: ["Next.js Route Handlers", "MongoDB", "NestJS (target)", "PostgreSQL / Prisma (target)"],
      services: ["Razorpay", "WhatsApp", "Supabase (target)"],
      devops: ["Turborepo", "pnpm", "Docker", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "144" },
        { label: "Share of all commits", value: "7%" },
        { label: "Active", value: "2025 – 2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (144 of 2,054). The rest of the history came from an AI app builder.",
    },
    features: [
      "Fleet browsing with date, duration and add-on selection",
      "Razorpay checkout",
      "WhatsApp as a booking channel",
      "OTP customer login with refresh tokens",
      "Operator console for delivery, setup and collection",
      "Coupons, expenses and user notifications",
    ],
    challenges: [
      {
        challenge: "Two customers booking the same car for overlapping slots",
        solution:
          "A unique index on a discretised slot key makes the race fail loudly today; because overlapping ranges aren't equality, the permanent fix is a Postgres exclusion constraint — the main driver of the database migration.",
      },
      {
        challenge: "Unsigned admin tokens and hardcoded admin credentials",
        solution: "Replaced with signed HS256 JWTs and an environment-seeded first admin.",
      },
    ],
    learnings: [],
    results: [],
    relatedProjects: ["decorra", "iq-insights"],
  },

  hisaab: {
    id: "hisaab",
    title: "Hisaab",
    subtitle: "Shared money. Sorted.",
    category: "Mobile",
    status: "Planning",
    role: "Architect",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: false,
    thumbnail: projectCoverPath("hisaab"),
    screenshots: [],
    summary:
      "A mobile-first shared-expense and settlement app. Architecture settled in ADRs before code: integer-paise money, guest-first membership via WhatsApp links, and a pure, exhaustively tested settlement engine.",
    overview:
      "Groups — trips, flats, events, families — record who paid for what; Hisaab computes each person's fair share, net balance and the shortest practical set of payments that settles everyone up.",
    problemStatement: "Splitting apps fail on rounding, on forcing every friend to sign up, and on settlement plans with too many transfers.",
    solutionApproach: [
      "Money is integer paise — never floats, never rupees (ADR-0006).",
      "Guests join from a WhatsApp link by typing a name; no account required (ADR-0009).",
      "Splitting, balances and settlement live in a framework-free domain package, ported from a tested prototype core.",
      "Planned stack: Expo / React Native app, NestJS API, Prisma, with dependency direction enforced by turbo boundaries.",
    ],
    techStack: {
      frontend: ["Expo", "React Native", "TypeScript"],
      backend: ["NestJS", "Prisma", "PostgreSQL"],
      services: ["Supabase (prototype)"],
      devops: ["Turborepo", "pnpm", "Husky", "commitlint"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "67" },
        { label: "Share of all commits", value: "100%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (67 of 67).",
    },
    features: ["Group expenses", "Fair-share and net-balance calculation", "Minimal settlement plan", "Guest participation"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["iq-insights"],
  },

  "blueprint-ai": {
    id: "blueprint-ai",
    title: "BlueprintAI",
    subtitle: "AI software-engineering platform — idea to starter repo",
    category: "AI/ML",
    status: "Design phase",
    role: "Architect",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: false,
    thumbnail: projectCoverPath("blueprint-ai"),
    screenshots: [],
    summary:
      "Models requirements, architecture, tech decisions, docs and scaffolding as a compiler pipeline over one canonical project model, so every generated artifact traces back to one source of truth.",
    overview:
      "Idea → Requirements → Architecture → Technology Decisions → Validation → Documentation → Scaffolding → AI Context → Starter Repository. The specification and ADRs gate implementation.",
    problemStatement: "Architecture and stack choices are ad-hoc human work whose documents drift from the code they describe.",
    solutionApproach: [
      "One canonical project model; every stage is a pass over it.",
      "Planned apps: web, api, worker and a sandbox runner; a module-boundary linter and matrix CI in tools/.",
      "Design reviewed against a working sibling codebase (CreatorOS) to re-cut priorities.",
    ],
    techStack: {
      frontend: ["TypeScript"],
      backend: ["Node.js"],
      services: [],
      devops: ["Turborepo", "pnpm", "gitleaks", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "40" },
        { label: "Share of all commits", value: "91%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (40 of 44).",
    },
    features: [],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["creator-os", "kickstart"],
  },

  decorra: {
    id: "decorra",
    title: "Decorra",
    subtitle: "Event-decoration and experiences booking platform",
    category: "Full Stack",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: false,
    thumbnail: projectCoverPath("decorra"),
    screenshots: [],
    summary:
      "Customer website, Expo mobile app, operations console and NestJS API in one monorepo, sharing a five-palette theme engine and typed domain models.",
    overview:
      "An original marketplace for celebration decor and experiences. Every app consumes the same design tokens and domain types (Experience, Booking, City…).",
    problemStatement: "Web and mobile apps that define their own themes and models drift apart visually and in data shape.",
    solutionApproach: [
      "Five switchable palettes defined once in a themes package — CSS variables with a no-flash boot script on the web, a React context over the same tokens on mobile.",
      "Shared domain types served by a NestJS catalog API.",
      "Fluid clamp()-based type scale with Fraunces and Plus Jakarta Sans.",
    ],
    techStack: {
      frontend: ["Next.js 16", "React 19", "Tailwind CSS v4", "Expo SDK 53", "React Native"],
      backend: ["NestJS 11"],
      services: [],
      devops: ["Turborepo", "pnpm", "Husky"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "38" },
        { label: "Share of all commits", value: "100%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (38 of 38).",
    },
    features: ["Multi-theme engine", "City selector, search and mega-nav", "Catalog of experiences, add-ons and bookings", "Operations console"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["kidzorides"],
  },

  kickstart: {
    id: "kickstart",
    title: "Kickstart",
    subtitle: "CLI that scaffolds production-ready repositories",
    category: "Developer Tools",
    status: "Active",
    role: "Author",
    client: "RapidTechPlus",
    year: "2026",
    period: "2026",
    featured: false,
    thumbnail: projectCoverPath("kickstart"),
    screenshots: [],
    summary:
      "npx create-kickstart — wraps official generators (create-next-app, create-vite, create-turbo, create-nx-workspace, nest new) and applies one consistent repository structure, interactively or fully by flags.",
    overview:
      "Framework-friendly rather than framework-specific: Kickstart delegates to official tooling, then layers on a consistent structure and optional tooling for single apps or Turborepo/Nx monorepos.",
    problemStatement: "Every new repo starts with the same hour of generator commands and structure decisions, done slightly differently each time.",
    solutionApproach: [
      "Commander for flags, Inquirer for prompts — any omitted flag is asked interactively.",
      "One generator module per scaffolding step; execa runs the official CLIs.",
      "--dry-run prints the commands instead of running them.",
      "Built with tsup and tested with Vitest; a single verify script is the pre-push gate.",
    ],
    techStack: {
      frontend: [],
      backend: ["Node.js", "TypeScript", "Commander", "Inquirer", "execa"],
      services: [],
      devops: ["tsup", "Vitest", "GitHub Actions"],
    },
    contribution: {
      stats: [
        { label: "Commits", value: "21" },
        { label: "Share of all commits", value: "100%" },
        { label: "Active", value: "2026" },
      ],
      highlights: [],
      source: "git log on the private repository's default branch, counting commits under the author's names and emails (21 of 21).",
    },
    features: [
      "Next.js, Vite React or Angular frontends",
      "NestJS, Express or Laravel backends",
      "Turborepo or Nx workspaces with an optional admin app",
      "pnpm, npm or yarn",
      "Dry-run mode",
    ],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["planix"],
  },

  "nestjs-multi-orm": {
    id: "nestjs-multi-orm",
    title: "NestJS Multi-ORM",
    subtitle: "TypeORM and MikroORM side by side in one NestJS app",
    category: "Backend",
    status: "Open source",
    role: "Author",
    client: "Personal",
    year: "2024",
    featured: false,
    github: "https://github.com/rahul-rocket/nestjs-multi-orm",
    thumbnail: projectCoverPath("nestjs-multi-orm"),
    screenshots: [],
    summary:
      "A NestJS module that integrates TypeORM and MikroORM so a project can use either — or both — behind a repository pattern and custom injection decorators.",
    overview:
      "A small reference project on PostgreSQL that isolates the dual-ORM pattern into one reusable module.",
    problemStatement: "Migrating between ORMs, or supporting both, usually forces every service to know which ORM it is talking to.",
    solutionApproach: [
      "Repository pattern abstracts database operations away from the ORM.",
      "Custom decorators inject the right repository for the configured ORM.",
      "Independent configuration per ORM, including MikroORM migrations and soft delete.",
    ],
    techStack: {
      frontend: [],
      backend: ["NestJS 10", "TypeScript", "TypeORM", "MikroORM", "PostgreSQL"],
      services: [],
      devops: ["Jest", "ESLint"],
    },
    features: ["Dual ORM integration", "Per-ORM configuration", "Repository pattern", "Injection decorators"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["ever-gauzy", "planix"],
  },
}

export function getAllProjectSlugs(): string[] {
  return Object.keys(projectsData)
}

// Get project by slug
export function getProjectBySlug(slug: string): Project | null {
  return projectsData[slug] ?? null
}

// Get related projects
export function getRelatedProjects(slugs: string[]): Project[] {
  return slugs
    .map((slug) => projectsData[slug])
    .filter((project): project is Project => Boolean(project))
}
