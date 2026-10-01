import type React from 'react'
import type { Metadata, Viewport } from 'next'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { JsonLdScript } from '@/components/json-ld'
import { getPublishedPosts } from '@/lib/posts'
import type { SearchItem } from '@/lib/search-index'
import { site } from '@/lib/site'
import { graph, personSchema, websiteSchema } from '@/lib/structured-data'

const baseUrl = site.url
const defaultTitle = `${site.name} | ${site.role}`

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: defaultTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "software developer",
    "web developer",
    "full-stack developer",
    "React developer",
    "Next.js developer",
    "Node.js developer",
    "TypeScript",
    "JavaScript",
    "frontend developer",
    "backend developer",
    "Ahmedabad",
    "India",
    site.name,
    "portfolio",
    "freelance developer",
  ],
  authors: [{ name: site.name, url: baseUrl }],
  creator: site.name,
  publisher: site.name,

  // Canonical URL
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    siteName: site.name,
    title: defaultTitle,
    description: site.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${site.name} -- ${site.role}`,
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: site.description,
    images: ["/og-image.png"],
    creator: site.xHandle,
    site: site.xHandle,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // App-specific
  applicationName: site.name,
  category: "technology",

  // Other
  other: {
    "msapplication-TileColor": "#7c3aed",
    "theme-color": "#7c3aed",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  colorScheme: "dark light",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Posts feed the command palette's Blog group. Same build-time-only read as
  // /blog -- see the note there.
  const postItems: SearchItem[] = (await getPublishedPosts()).map((post) => ({
    href: `/blog/${post.slug}`,
    label: post.title,
    description: post.excerpt,
    keywords: post.tags,
  }))

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* JSON-LD Structured Data */}
        {/* Person + WebSite on every page; pages reference them by @id. */}
        <JsonLdScript data={graph(personSchema(), websiteSchema())} />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
          >
            Skip to main content
          </a>

          <div className="relative flex min-h-screen flex-col">
            <div className="no-print"><Navbar posts={postItems} /></div>
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <div className="no-print"><Footer /></div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
