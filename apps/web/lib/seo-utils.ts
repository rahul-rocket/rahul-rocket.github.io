// SEO helper functions and components

import type { Metadata } from "next"

import type { Project } from "./types"

export interface PageMetadataOptions {
  title: string
  description: string
  path?: string
  image?: string
  type?: "website" | "article"
  noIndex?: boolean
}

export interface BlogPostSummary {
  title: string
  excerpt: string
  slug: string
  date: string
}

export interface BreadcrumbItem {
  name: string
  path?: string
}

// Generate page-specific metadata
export function generatePageMetadata({
  title,
  description,
  path = "",
  image = "/og-image.png",
  type = "website",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"
  const url = `${baseUrl}${path}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type,
      images: [
        {
          url: image.startsWith("http") ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${baseUrl}${image}`],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

// Generate JSON-LD for a project
export function generateProjectJsonLd(project: Project) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.overview,
    url: `${baseUrl}/projects/${project.id}`,
    image: project.thumbnail,
    author: {
      "@type": "Person",
      name: "Rahul",
      url: baseUrl,
    },
    applicationCategory: "WebApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareRequirements: project.techStack?.frontend?.join(", ") || "",
  }
}

// Generate JSON-LD for blog posts
export function generateBlogPostJsonLd(post: BlogPostSummary) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `${baseUrl}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Rahul",
      url: baseUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Rahul",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  }
}

// Generate breadcrumb JSON-LD
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path ? `${baseUrl}${item.path}` : undefined,
    })),
  }
}

// Accessibility helper: Generate ARIA labels
export type AriaLabelKind = "link" | "button" | "image" | "section" | "navigation" | "form"

export function getAriaLabel(type: AriaLabelKind, content: string): string {
  const labels: Record<AriaLabelKind, string> = {
    link: `Navigate to ${content}`,
    button: `Click to ${content}`,
    image: `Image: ${content}`,
    section: `Section: ${content}`,
    navigation: `${content} navigation`,
    form: `${content} form`,
  }
  return labels[type] || content
}

// Performance: Preload critical resources
export function getCriticalPreloads() {
  return [
    { href: "/fonts/inter-var.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  ]
}
