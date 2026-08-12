import Link from "next/link"

import { cn } from "@portfolio/ui/lib/utils"

/**
 * The mark, drawn from the github.com/rahul-rocket profile:
 *
 * - the magenta -> violet -> blue gradient ring around a dark disc is the
 *   avatar's framing, reused here as the badge;
 * - the rocket is the handle itself (rahul-rocket), tilted as if launching.
 *
 * Inline SVG so it needs no asset file and stays crisp at any size. The
 * gradient ids are suffixed per instance because the header and footer both
 * render one on the same page and duplicate ids would collide.
 */
export function LogoMark({
  className,
  id = "logo",
}: {
  className?: string
  id?: string
}) {
  const ringId = `logo-ring-${id}`
  const flameId = `logo-flame-${id}`

  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Rahul — rocket monogram"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        {/* Avatar ring: magenta at the top-left, through violet, to blue. */}
        <linearGradient id={ringId} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#e040fb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id={flameId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Dark disc, then the gradient ring on top of its edge. */}
      <circle cx="20" cy="20" r="18" fill="#0a0a0f" />
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeWidth="3.5"
      />

      {/* Rocket, drawn upright and rotated so it climbs to the right. */}
      <g transform="rotate(-40 20 20)">
        <path
          d="M20 9.5c2.9 2.9 4.3 6.3 4.3 9.4v3.4h-8.6v-3.4c0-3.1 1.4-6.5 4.3-9.4Z"
          fill="#f8fafc"
        />
        <circle cx="20" cy="16.4" r="1.9" fill="#0a0a0f" />
        {/* Fins */}
        <path d="M15.7 18.9 12.6 23.4l3.1-1.1Z" fill="#cbd5e1" />
        <path d="M24.3 18.9l3.1 4.5-3.1-1.1Z" fill="#cbd5e1" />
        {/* Exhaust */}
        <path
          d="M17.9 23.1h4.2l-2.1 5.4Z"
          fill={`url(#${flameId})`}
        />
      </g>
    </svg>
  )
}

/** Mark plus wordmark, linking home. Used by the navbar and the footer. */
export function Logo({
  className,
  id = "logo",
}: {
  className?: string
  id?: string
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 text-xl font-bold group",
        className
      )}
      aria-label="Rahul — home"
    >
      <LogoMark
        id={id}
        className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6"
      />
      <span className="bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        Rahul
      </span>
    </Link>
  )
}
