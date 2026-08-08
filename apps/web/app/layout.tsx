import type React from 'react'
import type { Metadata, Viewport } from 'next'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: "Rahul | Software Developer - Ahmedabad, India",
    template: "%s | Rahul - Software Developer",
  },
  description: "Professional Software Developer based in Ahmedabad, India. Specializing in React, Next.js, TypeScript, Node.js, and modern web technologies. View my projects, skills, and experience.",
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
    "Rahul",
    "portfolio",
    "freelance developer",
  ],
  authors: [{ name: "Rahul", url: baseUrl }],
  creator: "Rahul",
  publisher: "Rahul",
  
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
    siteName: "Rahul - Software Developer",
    title: "Rahul | Software Developer - Ahmedabad, India",
    description: "Professional Software Developer based in Ahmedabad, India. Specializing in React, Next.js, Node.js, and modern web technologies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rahul - Software Developer Portfolio",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Rahul | Software Developer - Ahmedabad, India",
    description: "Professional Software Developer based in Ahmedabad, India. Specializing in React, Next.js, Node.js, and modern web technologies.",
    images: ["/og-image.png"],
    creator: "@rahul",
    site: "@rahul",
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
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#7c3aed" },
    ],
  },
  
  // Verification
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    // Next has no first-class `bing` key; it goes through `other` as a raw meta tag.
    other: {
      "msvalidate.01": "bing-verification-code",
    },
  },
  
  // App-specific
  applicationName: "Rahul - Software Developer",
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

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Rahul",
  url: baseUrl,
  image: `${baseUrl}/profile.jpg`,
  sameAs: [
    "https://github.com/rahul",
    "https://linkedin.com/in/rahul",
    "https://twitter.com/rahul",
  ],
  jobTitle: "Software Developer",
  worksFor: {
    "@type": "Organization",
    name: "Freelance / RapidTech Plus",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ahmedabad",
    addressRegion: "Gujarat",
    addressCountry: "India",
  },
  email: "rahul@rapidtechplus.com",
  telephone: "+91-8264110143",
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "JavaScript",
    "Web Development",
    "Full-Stack Development",
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
            <Navbar />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
