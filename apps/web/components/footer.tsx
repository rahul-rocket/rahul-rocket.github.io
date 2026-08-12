"use client"

import Link from "next/link"
import { Mail, MapPin, Heart, ArrowUp } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { Button } from "@portfolio/ui/button"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { legalItems } from "@/lib/search-index"

/** First year of public work -- the rahul-rocket GitHub account dates to 2018. */
const START_YEAR = 2018

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-border bg-card relative">
      {/* Back to top button */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <Button
          onClick={scrollToTop}
          size="icon"
          className="rounded-full shadow-lg h-12 w-12"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Logo id="footer" />
            <p className="text-muted-foreground max-w-md leading-relaxed">
              A passionate software developer crafting digital experiences with modern technologies.
              Building scalable, performant web applications from Ahmedabad, India.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <a
                href="mailto:rahulrathore576@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>rahulrathore576@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Ahmedabad, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/projects"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Projects
              </Link>
              <Link
                href="/experience"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Experience
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Let's connect and build something amazing together.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:rahulrathore576@gmail.com"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: copyright, the legal row, and the theme switch on one
            line at desktop width; the "made with" credit centred beneath. */}
        <div className="mt-12 pt-8 border-t border-border">
          {/* Equal outer tracks, so the legal row is optically centred rather
              than just placed between two items of unequal width. */}
          <div className="flex flex-col items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <p className="text-muted-foreground text-sm order-1 lg:justify-self-start">
              © {START_YEAR}–{currentYear} Rahul. All rights reserved.
            </p>

            <nav
              aria-label="Legal and sitemap"
              className="order-3 lg:order-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-self-center"
            >
              <Link
                href="/"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {legalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <span className="order-2 lg:order-3 flex items-center gap-2 lg:justify-self-end">
              <span className="text-muted-foreground text-sm">Theme</span>
              <ThemeToggle />
            </span>
          </div>

          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-6">
            Made with{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />{" "}
            in Ahmedabad, India
          </p>
        </div>
      </div>
    </footer>
  )
}
