"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@portfolio/ui/button"
import { cn } from "@portfolio/ui/lib/utils"

import { CommandPalette } from "@/components/command-palette"
import { Logo } from "@/components/logo"
import type { SearchItem } from "@/lib/search-index"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

export function Navbar({ posts = [] }: { posts?: SearchItem[] }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Navigating away should not leave the mobile sheet hanging open.
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Every menu entry is its own route now, so the active item is just the
  // current path. Sub-routes (/projects/<slug>, /blog/<slug>) light up their
  // parent.
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 py-4">
        {/*
          Three tracks rather than `justify-between`: the outer two are equal
          width, which is what keeps the menu optically centred in the viewport
          regardless of how wide the logo or the search field get.
        */}
        <div className="flex items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex-1 lg:flex-none">
            <Logo id="nav" />
          </div>

          {/* Desktop Navigation -- centre track */}
          <div className="hidden lg:flex items-center gap-1 justify-self-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActiveLink(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions -- the theme switch lives in the footer now. */}
          <div className="flex items-center gap-2 justify-end lg:justify-self-end">
            <CommandPalette posts={posts} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActiveLink(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}