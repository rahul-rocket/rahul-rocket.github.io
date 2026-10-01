import { site } from "@/lib/site"

/**
 * `output: export` requires every metadata route to declare that it is
 * static. These read `process.env` at module scope, which is enough for Next to
 * treat the route as dynamic and fail the export rather than guess.
 */
export const dynamic = "force-static"

/**
 * Emitted as a static robots.txt at the root of the export.
 *
 * `/v2` is deliberately NOT disallowed: it is a second application published
 * from this same repository (`apps/web-v2`) and it ships its own robots.txt at
 * /v2/robots.txt. A rule here would override that one for the whole subtree,
 * because a crawler reads only the robots.txt at the origin root.
 */
export default function robots() {
  const baseUrl = site.url

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // "/api/" is gone with the static export — there are no API routes to
        // hide any more.
        disallow: ["/_next/", "/static/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
