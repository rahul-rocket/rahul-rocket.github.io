import { ArrowUpRight, Globe, Mail, MapPin } from "lucide-react"

import { Github, Linkedin, Upwork, X } from "@/components/brand-icons"
import { contactChannels, type ContactChannel } from "@/lib/contact-channels"

const ICONS = {
  website: Globe,
  linkedin: Linkedin,
  email: Mail,
  x: X,
  github: Github,
  upwork: Upwork,
  location: MapPin,
} as const

function ChannelCard({ channel }: { channel: ContactChannel }) {
  const Icon = ICONS[channel.icon]

  const body = (
    <>
      <span className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-semibold">
          {channel.label}
          {channel.href ? (
            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          ) : null}
        </span>
        {channel.detail ? (
          <span className="block text-xs text-primary truncate">
            {channel.detail}
          </span>
        ) : null}
        <span className="block text-sm text-muted-foreground mt-1 leading-relaxed">
          {channel.bestFor}
        </span>
      </span>
    </>
  )

  const className =
    "group flex gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all h-full"

  // The location row is information, not a destination.
  if (!channel.href) {
    return <div className={className}>{body}</div>
  }

  const isExternal = channel.href.startsWith("http")

  return (
    <a
      href={channel.href}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  )
}

/**
 * The channel list from the github.com/rahul-rocket README, rendered as cards.
 * Each one states what it is best for, which is the point of the original
 * table -- otherwise it is just the social row again.
 *
 * Used on both the landing page and /contact, so `heading` is caller-supplied.
 */
export function GetInTouch({ className }: { className?: string }) {
  return (
    <ul className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className ?? ""}`}>
      {contactChannels.map((channel) => (
        <li key={channel.label} className="contents">
          <ChannelCard channel={channel} />
        </li>
      ))}
    </ul>
  )
}
