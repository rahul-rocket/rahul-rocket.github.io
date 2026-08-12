"use client"

import { useEffect, useState } from "react"
import { ArrowRight, Mail, ChevronDown } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { Button } from "@portfolio/ui/button"
import { Badge } from "@portfolio/ui/badge"
import Link from "next/link"

const techStack = [
  { name: "React", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { name: "Next.js", color: "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20" },
  { name: "TypeScript", color: "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20" },
  { name: "Backend", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  { name: "APIs", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
]

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-purple-500/5" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`space-y-8 text-center lg:text-left transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-muted-foreground">Available for opportunities</span>
            </div>

            {/* Main heading with animation */}
            <div className="space-y-4">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
              >
                <span className="block text-foreground">Hi, I'm</span>
                <span className="block bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Rahul
                </span>
                <span className="block text-foreground text-3xl sm:text-4xl lg:text-5xl mt-2">
                  Software Developer
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className={`text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              Building scalable web applications with modern technologies.
              Passionate about clean code, great user experiences, and solving complex problems.
            </p>

            {/* Tech stack badges */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-2 transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              {techStack.map((tech, index) => (
                <Badge
                  key={tech.name}
                  variant="outline"
                  className={`${tech.color} px-3 py-1 text-sm font-medium transition-all duration-300 hover:scale-105`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tech.name}
                </Badge>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap justify-center lg:justify-start gap-4 pt-4 transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              <Button size="lg" asChild className="rounded-full px-8 gap-2 group">
                <Link href="/#projects">
                  View Projects
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                <Link href="/#contact">
                  Contact Me
                </Link>
              </Button>
            </div>

            {/* Social Links */}
            <div
              className={`flex justify-center lg:justify-start gap-4 pt-4 transition-all duration-700 delay-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="GitHub Profile"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:rahul@rapidtechplus.com"
                className="p-3 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:-translate-y-1"
                aria-label="Email Me"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Right Content - Developer Illustration */}
          <div
            className={`relative hidden lg:flex items-center justify-center transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              {/* Decorative circle behind illustration */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl scale-75" />
              
              {/* Developer illustration/avatar container */}
              <div className="relative w-80 h-80 xl:w-96 xl:h-96">
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-2 border-purple-500/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="absolute inset-8 rounded-full border-2 border-pink-500/20 animate-pulse" style={{ animationDelay: "1s" }} />
                
                {/* Developer illustration SVG */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background circle */}
                    <circle cx="200" cy="200" r="180" className="fill-secondary" />
                    
                    {/* Laptop */}
                    <rect x="100" y="200" width="200" height="120" rx="8" className="fill-muted stroke-border" strokeWidth="2" />
                    <rect x="110" y="210" width="180" height="90" rx="4" className="fill-background" />
                    
                    {/* Code on screen */}
                    <rect x="125" y="225" width="60" height="8" rx="2" className="fill-primary" />
                    <rect x="125" y="240" width="100" height="8" rx="2" className="fill-muted-foreground/30" />
                    <rect x="140" y="255" width="80" height="8" rx="2" className="fill-purple-500/50" />
                    <rect x="140" y="270" width="60" height="8" rx="2" className="fill-green-500/50" />
                    <rect x="125" y="285" width="70" height="8" rx="2" className="fill-muted-foreground/30" />
                    
                    {/* Keyboard base */}
                    <ellipse cx="200" cy="330" rx="110" ry="15" className="fill-muted stroke-border" strokeWidth="2" />
                    
                    {/* Person - Head */}
                    <circle cx="200" cy="120" r="50" className="fill-amber-200 dark:fill-amber-300" />
                    
                    {/* Hair */}
                    <path d="M150 120 Q150 70 200 70 Q250 70 250 120 Q250 100 230 95 Q200 85 170 95 Q150 100 150 120" className="fill-gray-800 dark:fill-gray-900" />
                    
                    {/* Face */}
                    <ellipse cx="180" cy="115" rx="5" ry="6" className="fill-gray-800" />
                    <ellipse cx="220" cy="115" rx="5" ry="6" className="fill-gray-800" />
                    <path d="M190 135 Q200 145 210 135" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="stroke-gray-800" fill="none" />
                    
                    {/* Body/Shirt */}
                    <path d="M150 170 Q150 200 170 200 L230 200 Q250 200 250 170 Q250 155 200 155 Q150 155 150 170" className="fill-primary" />
                    
                    {/* Arms */}
                    <path d="M155 180 Q130 190 120 220" stroke="currentColor" strokeWidth="20" strokeLinecap="round" className="stroke-primary" />
                    <path d="M245 180 Q270 190 280 220" stroke="currentColor" strokeWidth="20" strokeLinecap="round" className="stroke-primary" />
                    
                    {/* Hands */}
                    <circle cx="120" cy="225" r="12" className="fill-amber-200 dark:fill-amber-300" />
                    <circle cx="280" cy="225" r="12" className="fill-amber-200 dark:fill-amber-300" />
                    
                    {/* Floating elements */}
                    <g className="animate-bounce" style={{ animationDuration: "3s" }}>
                      <rect x="300" y="100" width="40" height="40" rx="8" className="fill-blue-500/20 stroke-blue-500" strokeWidth="2" />
                      <text x="320" y="127" textAnchor="middle" className="fill-blue-500 text-xs font-bold">&lt;/&gt;</text>
                    </g>
                    
                    <g className="animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
                      <rect x="60" y="150" width="35" height="35" rx="6" className="fill-green-500/20 stroke-green-500" strokeWidth="2" />
                      <text x="77" y="173" textAnchor="middle" className="fill-green-500 text-xs font-bold">{ }</text>
                    </g>
                    
                    <g className="animate-bounce" style={{ animationDuration: "2s", animationDelay: "1s" }}>
                      <circle cx="320" cy="250" r="18" className="fill-purple-500/20 stroke-purple-500" strokeWidth="2" />
                      <text x="320" y="255" textAnchor="middle" className="fill-purple-500 text-xs font-bold">TS</text>
                    </g>
                  </svg>
                </div>
              </div>
              
              {/* Floating tech icons */}
              <div className="absolute -top-4 -right-4 p-3 bg-card rounded-xl shadow-lg border border-border animate-bounce" style={{ animationDuration: "3s" }}>
                <span className="text-2xl">⚛️</span>
              </div>
              <div className="absolute -bottom-4 -left-4 p-3 bg-card rounded-xl shadow-lg border border-border animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="absolute top-1/2 -right-8 p-3 bg-card rounded-xl shadow-lg border border-border animate-bounce" style={{ animationDuration: "2s", animationDelay: "1s" }}>
                <span className="text-2xl">💻</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Link
            href="/#about"
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </Link>
        </div>
      </div>
    </section>
  )
}