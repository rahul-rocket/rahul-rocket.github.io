import type { Skill } from '@/lib/content/records'

/**
 * A-01 — the skills table. docs/CONTENT_STRATEGY.md §2, §3.3.
 *
 * THIS FILE IS A CROSS-REFERENCE TARGET, NOT JUST A PAGE'S DATA. Case-study and
 * experience `stack` arrays are arrays of the `id`s below, resolved at build
 * time by `src/lib/content/cross-reference.ts` (F1-07). An id that does not
 * appear here fails the build, which is what makes "every project using
 * Postgres" a free query rather than a second list to maintain.
 *
 * Renaming an id is therefore a breaking change across `content/`. Renaming a
 * `name` is free.
 *
 * ---------------------------------------------------------------------------
 * DEPTH RATINGS ARE CLAIMS ABOUT A REAL PERSON. Review them before the site is
 * indexed. `primary` says "I have debugged this under load at 2am"; the site's
 * entire argument is that its claims are checkable, and an inflated tier here
 * is the cheapest possible way to lose that. Downgrading is free.
 * ---------------------------------------------------------------------------
 */
export const skills: Skill[] = [
	/* --- Languages ------------------------------------------------------- */
	{
		id: 'typescript',
		name: 'TypeScript',
		group: 'Languages',
		depth: 'primary',
		note: 'Strict everywhere; types derived from schemas rather than hand-written.',
		evidence: '/blog/static-export-content-pipeline/',
	},
	{
		id: 'javascript',
		name: 'JavaScript',
		group: 'Languages',
		depth: 'primary',
		note: 'The runtime underneath the types — including the parts TypeScript hides.',
	},
	{
		id: 'sql',
		name: 'SQL',
		group: 'Languages',
		depth: 'primary',
		note: 'Query plans and index design, not just the query that returns rows.',
	},
	{
		id: 'python',
		name: 'Python',
		group: 'Languages',
		depth: 'working',
		note: 'Data tooling, migrations, and the scripts that outlive their sprint.',
	},
	{
		id: 'go',
		name: 'Go',
		group: 'Languages',
		depth: 'familiar',
		note: 'Read it comfortably; have shipped one small service in it.',
	},
	{
		id: 'rust',
		name: 'Rust',
		group: 'Languages',
		depth: 'familiar',
		note: 'Side projects and build tooling; not something I would claim in production.',
	},

	/* --- Frontend -------------------------------------------------------- */
	{
		id: 'react',
		name: 'React',
		group: 'Frontend',
		depth: 'primary',
		note: 'Server Components by default; client boundaries pushed as deep as they go.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'nextjs',
		name: 'Next.js',
		group: 'Frontend',
		depth: 'primary',
		note: 'App Router, static export, and the constraints that come with no server.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'css',
		name: 'CSS',
		group: 'Frontend',
		depth: 'primary',
		note: 'Cascade layers, container queries, and scroll-driven animation.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'tailwind',
		name: 'Tailwind CSS',
		group: 'Frontend',
		depth: 'primary',
		note: 'v4, over a semantic token layer — utilities never carry raw values.',
	},
	{
		id: 'html',
		name: 'Semantic HTML',
		group: 'Frontend',
		depth: 'primary',
		note: 'The first rule of ARIA is not to use ARIA; most of a11y is element choice.',
		evidence: '/skills/',
	},
	{
		id: 'web-performance',
		name: 'Web performance',
		group: 'Frontend',
		depth: 'primary',
		note: 'Core Web Vitals as merge gates rather than as a quarterly report.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'accessibility',
		name: 'Accessibility',
		group: 'Frontend',
		depth: 'working',
		note: 'WCAG 2.2 AA as a floor; automated tools catch under half of it.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'angular',
		name: 'Angular',
		group: 'Frontend',
		depth: 'working',
		note: 'Two production applications, including one migration off AngularJS.',
	},
	{
		id: 'motion',
		name: 'Motion / GSAP',
		group: 'Frontend',
		depth: 'working',
		note: 'Used sparingly and always with a reduced-motion path that shows the end state.',
	},

	/* --- Backend --------------------------------------------------------- */
	{
		id: 'nodejs',
		name: 'Node.js',
		group: 'Backend',
		depth: 'primary',
		note: 'Long-running services, streams, and the failure modes of the event loop.',
	},
	{
		id: 'rest',
		name: 'REST API design',
		group: 'Backend',
		depth: 'primary',
		note: 'Resource modelling, idempotency, pagination, and versioning that survives.',
	},
	{
		id: 'nestjs',
		name: 'NestJS',
		group: 'Backend',
		depth: 'working',
		note: 'Where a team benefits from an opinionated module boundary.',
	},
	{
		id: 'graphql',
		name: 'GraphQL',
		group: 'Backend',
		depth: 'working',
		note: 'Shipped it, and have also argued successfully against it.',
	},
	{
		id: 'auth',
		name: 'AuthN / AuthZ',
		group: 'Backend',
		depth: 'working',
		note: 'OAuth 2.1, OIDC, session vs token trade-offs, and role modelling.',
	},
	{
		id: 'event-driven',
		name: 'Event-driven systems',
		group: 'Backend',
		depth: 'working',
		note: 'Outbox pattern, at-least-once delivery, and idempotent consumers.',
	},
	{
		id: 'java',
		name: 'Java / Spring',
		group: 'Backend',
		depth: 'familiar',
		note: 'Maintained a Spring Boot service; comfortable reading, slower writing.',
	},

	/* --- Data ------------------------------------------------------------ */
	{
		id: 'postgres',
		name: 'PostgreSQL',
		group: 'Data',
		depth: 'primary',
		note: 'Schema design, migrations under load, and reading EXPLAIN honestly.',
	},
	{
		id: 'redis',
		name: 'Redis',
		group: 'Data',
		depth: 'working',
		note: 'Cache invalidation, rate limiting, and queues that need one dependency.',
	},
	{
		id: 'mongodb',
		name: 'MongoDB',
		group: 'Data',
		depth: 'working',
		note: 'Two production systems, one of which should have been Postgres.',
	},
	{
		id: 'data-modelling',
		name: 'Data modelling',
		group: 'Data',
		depth: 'primary',
		note: 'Normalise until it hurts, denormalise until it works, and write down why.',
	},
	{
		id: 'elasticsearch',
		name: 'Elasticsearch',
		group: 'Data',
		depth: 'familiar',
		note: 'Built search over it once; would want a specialist for anything larger.',
	},

	/* --- Infrastructure & DevOps ----------------------------------------- */
	{
		id: 'docker',
		name: 'Docker',
		group: 'Infrastructure & DevOps',
		depth: 'primary',
		note: 'Reproducible builds and images small enough that nobody dreads a deploy.',
	},
	{
		id: 'github-actions',
		name: 'GitHub Actions',
		group: 'Infrastructure & DevOps',
		depth: 'primary',
		note: 'Merge gates that have been observed failing — an unproven gate is not one.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'aws',
		name: 'AWS',
		group: 'Infrastructure & DevOps',
		depth: 'working',
		note: 'ECS, RDS, S3, CloudFront, IAM — enough to design it and to pay for it.',
	},
	{
		id: 'ci-cd',
		name: 'CI/CD',
		group: 'Infrastructure & DevOps',
		depth: 'primary',
		note: 'Trunk-based, small batches, and a rollback path exercised before it is needed.',
	},
	{
		id: 'observability',
		name: 'Observability',
		group: 'Infrastructure & DevOps',
		depth: 'working',
		note: 'Structured logs, RED metrics, and traces that answer a question someone asked.',
	},
	{
		id: 'terraform',
		name: 'Terraform',
		group: 'Infrastructure & DevOps',
		depth: 'familiar',
		note: 'Can extend an existing estate; would not start a new one unaided.',
	},
	{
		id: 'kubernetes',
		name: 'Kubernetes',
		group: 'Infrastructure & DevOps',
		depth: 'familiar',
		note: 'Operated services on it; have never been the person who owned the cluster.',
	},

	/* --- Architecture & Practices ---------------------------------------- */
	{
		id: 'system-design',
		name: 'System design',
		group: 'Architecture & Practices',
		depth: 'primary',
		note: 'Boundaries first, and the decision recorded with what it cost.',
		evidence: '/projects/',
	},
	{
		id: 'domain-modelling',
		name: 'Domain modelling',
		group: 'Architecture & Practices',
		depth: 'primary',
		note: 'The language of the business, in the code, without a translation layer.',
	},
	{
		id: 'adrs',
		name: 'Architecture decision records',
		group: 'Architecture & Practices',
		depth: 'primary',
		note: 'A decision nobody wrote down is a decision the next team will re-litigate.',
	},
	{
		id: 'migrations',
		name: 'Incremental migration',
		group: 'Architecture & Practices',
		depth: 'primary',
		note: 'Strangler-fig cutovers with both paths live and a measured switch.',
		evidence: '/projects/',
	},
	{
		id: 'code-review',
		name: 'Code review & mentoring',
		group: 'Architecture & Practices',
		depth: 'primary',
		note: 'Review is a teaching surface; a comment should outlive the pull request.',
	},
	{
		id: 'ddd',
		name: 'Domain-driven design',
		group: 'Architecture & Practices',
		depth: 'working',
		note: 'Bounded contexts and ubiquitous language; sceptical of the tactical patterns.',
	},

	/* --- Tooling --------------------------------------------------------- */
	{
		id: 'git',
		name: 'Git',
		group: 'Tooling',
		depth: 'primary',
		note: 'Small commits with bodies that explain why, because the log is documentation.',
	},
	{
		id: 'testing',
		name: 'Testing strategy',
		group: 'Tooling',
		depth: 'primary',
		note: 'Test what breaks, at the level it breaks; a skipped test is a lie in the suite.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'playwright',
		name: 'Playwright',
		group: 'Tooling',
		depth: 'working',
		note: 'End-to-end against the real artifact, never against a dev server.',
		evidence: '/projects/engineering-portfolio-platform/',
	},
	{
		id: 'vitest',
		name: 'Vitest',
		group: 'Tooling',
		depth: 'working',
		note: 'Unit tests for the logic that can be silently wrong — ranking, parsing, dates.',
	},
	{
		id: 'mdx',
		name: 'MDX',
		group: 'Tooling',
		depth: 'working',
		note: 'Content as data, validated at the boundary so bad content fails the build.',
		evidence: '/blog/static-export-content-pipeline/',
	},
	{
		id: 'figma',
		name: 'Figma',
		group: 'Tooling',
		depth: 'familiar',
		note: 'Enough to work from a file and to hand a design system back in tokens.',
	},
]
