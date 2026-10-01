import { ImageResponse } from "next/og"
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects-data"

/**
 * A project's cover image, rendered ONCE, during `next build`.
 *
 * This is a route handler in an `output: 'export'` app, which is allowed for
 * exactly this shape: a GET with `force-static` and `generateStaticParams` is
 * executed at build time and written to out/ as a plain file
 * (`projects/<slug>/cover.png`). Nothing runs on GitHub Pages. A handler that
 * needs the request — a POST, cookies, search params — would fail the export,
 * which is the case the "no route.ts" rule in CLAUDE.md is about.
 *
 * PNG rather than SVG because Open Graph and Twitter cards do not render SVG,
 * and this one file serves both the share card and the on-page thumbnails.
 */
export const dynamic = "force-static"

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

const SIZE = { width: 1200, height: 630 } as const

// Satori (next/og) cannot read CSS variables and does not parse oklch(), so the
// palette is spelled out as sRGB approximations of tokens.css.
const COLORS = {
  bg: "#0b1120",
  surface: "#131b2e",
  border: "#26324a",
  text: "#f1f5f9",
  muted: "#94a3b8",
  teal: "#5cd9de",
  indigo: "#8aa3f5",
  violet: "#c3a0ec",
} as const

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) {
    return new Response("Not found", { status: 404 })
  }

  const stack = [...project.techStack.frontend, ...project.techStack.backend].slice(0, 6)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: COLORS.bg,
          backgroundImage: `radial-gradient(circle at 12% 0%, ${COLORS.teal}33, transparent 45%), radial-gradient(circle at 100% 100%, ${COLORS.violet}33, transparent 50%)`,
          color: COLORS.text,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              color: COLORS.teal,
              fontSize: 24,
            }}
          >
            {project.category}
          </div>
          <div style={{ display: "flex", color: COLORS.muted, fontSize: 24 }}>{project.year}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              backgroundImage: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.teal} 55%, ${COLORS.violet})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {project.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {stack.map((tech) => (
              <div
                key={tech}
                style={{
                  display: "flex",
                  padding: "6px 16px",
                  borderRadius: 10,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.muted,
                  fontSize: 22,
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: COLORS.muted }}>
            rahul-rocket.github.io/projects
          </div>
          <div
            style={{
              display: "flex",
              width: 220,
              height: 8,
              borderRadius: 999,
              backgroundImage: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.indigo}, ${COLORS.violet})`,
            }}
          />
        </div>
      </div>
    ),
    SIZE,
  )
}
