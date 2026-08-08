"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import Image, { type ImageProps } from "next/image"

type OptimizedImageProps = Omit<ImageProps, "onError"> & {
  onError?: () => void
}

// Optimized Image component with lazy loading, blur placeholder, and error handling
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  fill = false,
  sizes = "100vw",
  quality = 75,
  placeholder = "blur",
  blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIRAAAgEDBAMBAAAAAAAAAAAAAQIDAAQRBRIhMQYTQWH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAMBAQEAAAAAAAAAAAAAAAABAhEhMf/aAAwDAQACEQMRAD8AzWPxq+vNXuLh4Y0ilbcyEkjPHA/BUuv0ot2b7LGQxxnqp6f/2Q==",
  onError,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [, setHasError] = useState(false)

  // Fallback image
  const fallbackSrc = "/images/placeholder.jpg"

  const handleError = () => {
    setHasError(true)
    setImgSrc(fallbackSrc)
    onError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // next/image only accepts a blur placeholder when it can resolve the blur data,
  // which rules out remote URLs served through the loader.
  const isExternal = typeof imgSrc === "string" && imgSrc.startsWith("http")
  const blurProps =
    !isExternal && placeholder === "blur" ? ({ placeholder, blurDataURL } as const) : {}

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          priority={priority}
          className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={handleLoad}
          onError={handleError}
          {...blurProps}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={handleLoad}
        onError={handleError}
        {...blurProps}
        {...props}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </div>
  )
}

// Lazy loading wrapper for sections
export function LazySection({
  children,
  className = "",
  threshold = 0.1,
}: {
  children: ReactNode
  className?: string
  threshold?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "100px" }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {isVisible ? children : <div className="min-h-[200px]" />}
    </div>
  )
}

// Skeleton loader for content
export function Skeleton({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
      {...props}
    />
  )
}

// Image with loading skeleton
export function ImageWithSkeleton({
  src,
  alt,
  width,
  height,
  className = "",
  aspectRatio = "16/9",
  ...props
}: React.ComponentProps<"img"> & { aspectRatio?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0" />
      )}
      {hasError ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
          <span>Image not available</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          {...props}
        />
      )}
    </div>
  )
}
