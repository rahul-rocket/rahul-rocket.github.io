"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

/**
 * Sliding light/dark switch, ported from rapidtechplus/rapidtechplus.github.io
 * and re-pointed at this app's design tokens. It lives in the footer -- the
 * header carries the command palette instead.
 *
 * Renders a stable placeholder state until mounted, because the resolved theme
 * is only known on the client and a mismatch would hydrate badly.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = mounted ? resolvedTheme === "dark" : true

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      className="theme-switch"
      data-state={isDark ? "dark" : "light"}
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="theme-switch-track" aria-hidden>
        <Sun className="theme-switch-ico sun" size={14} />
        <Moon className="theme-switch-ico moon" size={14} />
        <span className="theme-switch-knob" />
      </span>
    </button>
  )
}
