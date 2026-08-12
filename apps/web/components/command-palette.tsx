"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BookOpen,
  Briefcase,
  FileText,
  FolderGit2,
  Home,
  Mail,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  Wrench,
} from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@portfolio/ui/command"
import { DialogTitle } from "@portfolio/ui/dialog"

import { pageItems, projectItems, type SearchItem } from "@/lib/search-index"

const pageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "/": Home,
  "/about": User,
  "/skills": Wrench,
  "/experience": Briefcase,
  "/projects": FolderGit2,
  "/blog": BookOpen,
  "/contact": Mail,
}

const EMAIL = "rahulrathore576@gmail.com"

/**
 * This app's --accent token is the brand violet, not the muted surface shadcn
 * assumes, so the shared CommandItem's `data-[selected=true]:bg-accent` puts a
 * saturated violet behind the row while the secondary text stays slate --
 * roughly 1.5:1, i.e. invisible, in BOTH themes. Selecting on `secondary`
 * instead keeps every text token on the surface it was designed for.
 */
const ITEM_CLASS =
  "group data-[selected=true]:bg-secondary data-[selected=true]:text-foreground"

/**
 * ⌘K / Ctrl+K palette. The trigger renders as a search bar in the navbar; both
 * live here so the open state is shared without lifting it into the navbar.
 */
export function CommandPalette({ posts = [] }: { posts?: SearchItem[] }) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Every selection closes the dialog first, so the action never races the
  // dialog's own exit animation.
  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      {/* Desktop: a real-looking search field. Mobile: just the magnifier. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 h-9 w-56 xl:w-64 px-3 rounded-full border border-border bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Search the site"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="pointer-events-none hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Search the site"
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search</DialogTitle>
        <CommandInput placeholder="Search pages, projects and posts…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pageItems.map((item) => {
              const Icon = pageIcons[item.href] ?? FileText
              return (
                <CommandItem
                  key={item.href}
                  className={ITEM_CLASS}
                  value={item.label}
                  keywords={[item.description, ...item.keywords]}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground group-data-[selected=true]:text-foreground/80 truncate">
                    {item.description}
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Projects">
            {projectItems.map((item) => (
              <CommandItem
                key={item.href}
                className={ITEM_CLASS}
                value={item.label}
                keywords={[item.description, ...item.keywords]}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <FolderGit2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                <span className="ml-2 text-xs text-muted-foreground group-data-[selected=true]:text-foreground/80 truncate">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          {posts.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Blog">
                {posts.map((item) => (
                  <CommandItem
                    key={`${item.href}-${item.label}`}
                    className={ITEM_CLASS}
                    value={item.label}
                    keywords={[item.description, ...item.keywords]}
                    onSelect={() => runCommand(() => router.push(item.href))}
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          <CommandSeparator />

          <CommandGroup heading="Actions">
            <CommandItem
              className={ITEM_CLASS}
              value="Switch theme"
              keywords={["dark", "light", "appearance", "toggle"]}
              onSelect={() =>
                runCommand(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme</span>
            </CommandItem>
            <CommandItem
              className={ITEM_CLASS}
              value="Copy email address"
              keywords={["mail", "contact", EMAIL]}
              onSelect={() =>
                runCommand(() => {
                  void navigator.clipboard?.writeText(EMAIL)
                })
              }
            >
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Copy email address</span>
              <CommandShortcut className="group-data-[selected=true]:text-foreground/80">
                {EMAIL}
              </CommandShortcut>
            </CommandItem>
            <CommandItem
              className={ITEM_CLASS}
              value="Start a conversation"
              keywords={["hire", "available", "work", "opportunities", "contact"]}
              onSelect={() => runCommand(() => router.push("/contact"))}
            >
              <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Start a conversation</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Elsewhere">
            <CommandItem
              className={ITEM_CLASS}
              value="GitHub"
              keywords={["source", "code", "repositories"]}
              onSelect={() =>
                runCommand(() => window.open("https://github.com", "_blank", "noopener"))
              }
            >
              <Github className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>GitHub</span>
            </CommandItem>
            <CommandItem
              className={ITEM_CLASS}
              value="LinkedIn"
              keywords={["profile", "professional", "network"]}
              onSelect={() =>
                runCommand(() => window.open("https://linkedin.com", "_blank", "noopener"))
              }
            >
              <Linkedin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>LinkedIn</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
