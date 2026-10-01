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
  "iq-insights": {
    id: "iq-insights",
    title: "IQ Insights",
    subtitle: "SaaS IQ and personality-test platform",
    category: "Full Stack",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
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

  kidzorides: {
    id: "kidzorides",
    title: "KidzoRides",
    subtitle: "Booking platform for kids' ride-on car rentals",
    category: "Full Stack",
    status: "Live · re-platforming",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
    featured: true,
    thumbnail: projectCoverPath("kidzorides"),
    screenshots: [],
    summary:
      "Rental bookings for birthday parties, school events and mall activations across India — a web booking wizard, WhatsApp booking, Razorpay payments and an operator console, mid-migration from MongoDB to Postgres.",
    overview:
      "Customers browse a fleet of ride-on and electric toy cars, pick a date and duration, add extras and pay via Razorpay; the operator then handles delivery, setup and collection. WhatsApp is a first-class booking channel alongside the web wizard.",
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

  brainboost: {
    id: "brainboost",
    title: "BrainBoost",
    subtitle: "A brain-training platform built for hundreds of games",
    category: "Mobile",
    status: "In development",
    role: "Lead Engineer",
    client: "RapidTechPlus",
    year: "2026",
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
    features: [
      "Games across memory, focus, logic, reaction speed, maths and creativity",
      "Shared progression system",
      "Plugin SDK for new games",
      "Android, iOS and playable web from one codebase",
    ],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["tile-escape", "focus-deck"],
  },

  "options-signal-engine": {
    id: "options-signal-engine",
    title: "NIFTY / BANKNIFTY Signal Engine",
    subtitle: "Non-repainting options decision-support indicator for TradingView",
    category: "Trading Tools",
    status: "Active",
    role: "Author",
    client: "RapidTechPlus",
    year: "2026",
    featured: true,
    thumbnail: projectCoverPath("options-signal-engine"),
    screenshots: [],
    summary:
      "A multi-factor Pine Script v6 indicator and a backtest strategy generated from one shared signal core, with CI that fails if either generated script drifts from the source.",
    overview:
      "A decision-support indicator for NIFTY 50 and BANKNIFTY. It scores market regime, higher-timeframe trend, VWAP/EMA, momentum, volume, support/resistance, breakouts and risk/reward on closed candles, and only emits CALL or PUT when every hard gate passes.",
    problemStatement:
      "Pine Script can't share code between an indicator and a strategy without publishing a library. Copy-pasting the logic means the backtest silently stops describing the live signals.",
    solutionApproach: [
      "All signal logic lives in a single src/core.pine; indicator and strategy are thin header/footer wrappers.",
      "scripts/build.sh generates both scripts; CI runs it with --check and fails when a generated file is stale.",
      "A 0–100 score plus hard gates, directional vetoes and no-trade filters — no single indicator can trigger a signal.",
      "Signals evaluate on closed candles only, so they don't repaint.",
    ],
    techStack: {
      frontend: ["Pine Script v6", "TradingView"],
      backend: [],
      services: [],
      devops: ["Bash", "GitHub Actions"],
    },
    features: [
      "Live signals, dashboard and alerts on the chart",
      "Backtest strategy built from the same engine",
      "Market-regime no-trade filters",
      "Risk/reward gating before a signal fires",
    ],
    challenges: [
      {
        challenge: "Keeping the backtest honest about the live indicator",
        solution: "One source of truth compiled into both scripts, with a CI drift check.",
      },
    ],
    learnings: [],
    results: [],
    relatedProjects: ["kickstart"],
  },

  "tile-escape": {
    id: "tile-escape",
    title: "Tile Escape",
    subtitle: "8×8 puzzle game — web PWA and Flutter app",
    category: "Mobile",
    status: "Playable",
    role: "Sole Developer",
    client: "RapidTechPlus",
    year: "2026",
    featured: false,
    thumbnail: projectCoverPath("tile-escape"),
    screenshots: [],
    summary:
      "Reach the gold tile before falling blocks crush you. A single index.html grown into an offline-capable Next.js PWA and a Flutter app, with a TypeScript core and a Dart mirror kept in lockstep by mirrored test suites.",
    overview:
      "Every move the red blocks fall one row and a new row drops in — waiting is a move too. The original single-file prototype is preserved as the behavioural spec.",
    problemStatement:
      "Dart can't consume a TypeScript package, so the web and mobile apps can't share the rules engine.",
    solutionApproach: [
      "The ~180-line rules core exists twice — packages/game-core (TS) and a Dart mirror — with no DOM or framework dependencies.",
      "The two test suites mirror each other case for case with identical names and assertions; divergence shows up as suites that stop lining up.",
      "Rendering, input and persistence are deliberately per-platform.",
    ],
    techStack: {
      frontend: ["Next.js 15", "TypeScript", "PWA", "Flutter", "Dart"],
      backend: [],
      services: [],
      devops: ["Turborepo", "pnpm", "GitHub Actions"],
    },
    features: ["Installable, offline-capable PWA", "Swipe, keyboard and tap controls", "Flutter mobile app", "14 core unit tests + 28 Flutter tests"],
    challenges: [
      {
        challenge: "One game, two languages",
        solution: "Duplicate the small core on purpose and make mirrored test suites the drift detector.",
      },
    ],
    learnings: [],
    results: [],
    relatedProjects: ["focus-deck", "brainboost"],
  },

  "focus-deck": {
    id: "focus-deck",
    title: "Focus Deck",
    subtitle: "Local-first Pomodoro timer for web and desktop",
    category: "Frontend",
    status: "In development",
    role: "Sole Developer",
    client: "RapidTechPlus",
    year: "2026",
    featured: false,
    thumbnail: projectCoverPath("focus-deck"),
    screenshots: [],
    summary:
      "A Pomodoro timer with a task list and daily focus chart — no account, no server. Next.js 15 on the web and Tauri v2 on the desktop share one implementation; Flutter mobile is planned.",
    overview:
      "A prototype HTML page turned into a Turborepo monorepo. A written behaviour spec extracted from the prototype is the source of truth and the test plan.",
    problemStatement: "Timers that count ticks drift when a tab is throttled or a laptop sleeps.",
    solutionApproach: [
      "The timer works from absolute deadlines, never from counting ticks.",
      "packages/core stays pure TypeScript — no DOM or browser globals — enforced by lint.",
      "Storage keys and value shapes are identical on every platform, so there is one data format everywhere.",
      "Desktop uses OS-scheduled notifications through Tauri.",
    ],
    techStack: {
      frontend: ["Next.js 15", "TypeScript", "Tauri v2"],
      backend: [],
      services: [],
      devops: ["Turborepo", "pnpm", "Rust toolchain"],
    },
    features: ["Pomodoro timer", "Task list", "Daily focus chart", "Desktop notifications", "Fully offline"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["tile-escape"],
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

  hisaab: {
    id: "hisaab",
    title: "Hisaab",
    subtitle: "Shared money. Sorted.",
    category: "Mobile",
    status: "Planning",
    role: "Architect",
    client: "RapidTechPlus",
    year: "2026",
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
    features: ["Group expenses", "Fair-share and net-balance calculation", "Minimal settlement plan", "Guest participation"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["iq-insights"],
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
    features: ["Multi-theme engine", "City selector, search and mega-nav", "Catalog of experiences, add-ons and bookings", "Operations console"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["kidzorides"],
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
    features: ["Multi-provider AI generation", "Background job processing", "Credit-metered subscriptions", "Admin console"],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["blueprint-ai"],
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
    features: [],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["creator-os", "kickstart"],
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
    featured: false,
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
    features: [],
    challenges: [],
    learnings: [],
    results: [],
    relatedProjects: ["kickstart"],
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
    relatedProjects: ["planix"],
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
