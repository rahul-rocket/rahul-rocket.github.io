#!/usr/bin/env node

/*
 * Summarise .lighthouseci/ as one V1-vs-V2 table.
 *
 * lighthouserc.json audits the same pages of both apps, served together from
 * _pages/ exactly as Pages serves them, so the numbers are comparable. This
 * reduces the per-run reports to the median per URL and prints a Markdown
 * table — to stdout, and to the Actions job summary when GITHUB_STEP_SUMMARY
 * is set. It reports; it never fails the build (lhci's assertions do that).
 *
 * Usage:  node scripts/lighthouse-summary.mjs [dir]   (default: .lighthouseci)
 */

import { appendFileSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const dir = process.argv[2] ?? ".lighthouseci"

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"]
const METRICS = [
  ["largest-contentful-paint", "LCP", (v) => `${Math.round(v)} ms`],
  ["cumulative-layout-shift", "CLS", (v) => v.toFixed(3)],
  ["total-blocking-time", "TBT", (v) => `${Math.round(v)} ms`],
]

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** @type {Map<string, object[]>} path → that path's reports */
const byPath = new Map()
for (const file of readdirSync(dir)) {
  if (!file.endsWith(".report.json")) continue
  const report = JSON.parse(readFileSync(join(dir, file), "utf8"))
  // lhci serves _pages/ on a random port; the path is the stable key.
  const path = new URL(report.requestedUrl).pathname
  byPath.set(path, [...(byPath.get(path) ?? []), report])
}

if (byPath.size === 0) {
  console.error(`lighthouse-summary: no reports in ${dir}/`)
  process.exit(1)
}

const header = [
  "Page",
  "App",
  ...CATEGORIES.map((c) => c.replace("best-practices", "BP")),
  ...METRICS.map(([, label]) => label),
]
const rows = [...byPath.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, reports]) => [
    `\`${path}\``,
    path.startsWith("/v2/") ? "V2" : "V1",
    ...CATEGORIES.map((id) =>
      String(Math.round(median(reports.map((r) => r.categories[id]?.score ?? 0)) * 100))
    ),
    ...METRICS.map(([id, , format]) =>
      format(median(reports.map((r) => r.audits[id]?.numericValue ?? 0)))
    ),
  ])

const table = [
  `### Lighthouse — V1 vs V2 (median of ${Math.max(...[...byPath.values()].map((r) => r.length))} runs, simulated mobile)`,
  "",
  `| ${header.join(" | ")} |`,
  `| ${header.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${row.join(" | ")} |`),
  "",
].join("\n")

console.log(table)
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`)
}
