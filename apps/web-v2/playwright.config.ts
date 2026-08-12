import { defineConfig, devices } from '@playwright/test'

/**
 * F0-11 — E2E configuration. docs/TESTING.md §4.
 *
 * The single most important line in this file is `webServer.command`: the suite
 * runs against `serve out/`, the real static export, and never against
 * `next dev`. The dev server hides `basePath`, trailing-slash resolution, the
 * real 404, and production bundling — precisely the four things that break on
 * GitHub Pages (docs/GITHUB_PAGES.md §11). A suite that passes against the dev
 * server proves nothing about what is deployed.
 *
 * The port is NOT 3000, and `reuseExistingServer` is false everywhere rather
 * than only in CI. Both come from the same incident: the first local run of this
 * suite passed a `<h1>` assertion against an unrelated Next dev server that
 * happened to hold port 3000, and reported someone else's page as this site's.
 * A test harness that silently binds to whatever is already listening can
 * report green for software it never loaded, which is worse than no harness.
 * A dedicated port costs one server start per run.
 */

const PORT = 4319
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,

	// A committed `test.only` silently narrows the suite to one spec while still
	// reporting green. In CI that is a lie, so it is an error.
	forbidOnly: !!process.env.CI,

	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI
		? [['github'], ['html', { open: 'never' }], ['list']]
		: [['list']],

	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
		{ name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
	],

	webServer: {
		// `pnpm build` is NOT run here. CI builds once and reuses out/; running it
		// from the webServer hook would rebuild per shard and hide the case where
		// the suite is pointed at a stale export.
		command: 'pnpm start:test',
		url: BASE_URL,
		reuseExistingServer: false,
		timeout: 60_000,
	},
})
