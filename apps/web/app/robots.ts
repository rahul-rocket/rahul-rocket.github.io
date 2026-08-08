export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://rahul.dev"
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/static/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
