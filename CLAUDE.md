# CLAUDE.md

This file gives Claude Code context for working in this repository.

The full working guide lives in [AGENTS.md](./AGENTS.md) — read it first. It covers the
monorepo layout, commands, import conventions, and the strict-TypeScript rules that apply to
every change here.

## Quick reference

```bash
pnpm install          # pnpm only -- npm/yarn will produce the wrong lockfile
pnpm dev              # dev server on http://localhost:3000
pnpm check-types      # must pass before you call a change done
pnpm build            # must pass before you call a change done
pnpm lint
```

## Shape of the repo

- `apps/web` — the Next.js 16 App Router site. Alias `@/*` points at the app root.
- `packages/ui` — `@portfolio/ui`, the shared shadcn/ui library. Ships TS source; Next transpiles
  it. Import as `@portfolio/ui/button`, `@portfolio/ui/lib/utils`.
- `packages/typescript-config`, `packages/eslint-config` — shared presets.

## Things worth knowing before editing

- TypeScript runs with `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, and
  `noUnusedParameters`. Array and record indexing yields `T | undefined`; handle it rather
  than asserting. Reach for a real type before reaching for `any`.
- Inside `packages/ui` the `@/*` alias does not resolve — use relative imports.
- Tailwind is **v4 and configured in CSS** — the theme is the `@theme` block in
  `apps/web/app/globals.css`, and the `@source` directive there covers `packages/ui/src`, so a
  class that only appears in the UI package is still scanned. There is no `tailwind.config.ts`.
- Data lives in **Neon Postgres, accessed through Drizzle** (`apps/web/lib/db/`). Migrations
  are generated: `pnpm db:generate` then `pnpm db:migrate`, both run from `apps/web`.
- `apps/web/.env` is git-ignored; copy `apps/web/.env.example`. With `DATABASE_URL` unset,
  `/blog` falls back to seeded posts, `/api/contact` returns 500, and rate limits are skipped.
