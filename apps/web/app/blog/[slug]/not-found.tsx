import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@portfolio/ui/button"

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center">
      <div className="container mx-auto px-4 text-center max-w-lg">
        <FileQuestion className="h-14 w-14 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Article not found</h1>
        <p className="text-muted-foreground mb-8">
          That post either moved or was never published.
        </p>
        <Button asChild className="rounded-full px-8">
          <Link href="/blog">Browse all articles</Link>
        </Button>
      </div>
    </div>
  )
}
