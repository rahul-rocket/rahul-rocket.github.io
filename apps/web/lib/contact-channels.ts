/**
 * The "Get in Touch" channels, kept in step with the table in the
 * github.com/rahul-rocket profile README: each row says what the channel is
 * actually FOR, so the list is not just a repeat of the social icons.
 *
 * Channels the README deliberately leaves commented out (Discord, GitLab,
 * Stack Overflow, Freelancer) are omitted here too.
 */
export interface ContactChannel {
  /** lucide/brand icon name resolved by the component. */
  icon:
    | "website"
    | "linkedin"
    | "email"
    | "x"
    | "github"
    | "upwork"
    | "location"
  label: string
  /** Omitted for the location row, which is not a link. */
  href?: string
  /** Shown under the label -- the "Best for" column. */
  bestFor: string
  /** The address itself, where showing it is useful. */
  detail?: string
}

export const contactChannels: ContactChannel[] = [
  {
    icon: "email",
    label: "Email",
    href: "mailto:rahulrathore576@gmail.com",
    detail: "rahulrathore576@gmail.com",
    bestFor: "Direct enquiries and anything that needs a written reply",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rahul-rathore-940380108/",
    detail: "in/rahul-rathore",
    bestFor: "Roles, introductions, and anything hiring-related",
  },
  {
    icon: "github",
    label: "GitHub",
    href: "https://github.com/rahul-rocket",
    detail: "@rahul-rocket",
    bestFor: "Issues, pull requests, and questions about the code",
  },
  {
    icon: "x",
    label: "X",
    href: "https://x.com/rahulrathore576",
    detail: "@rahulrathore576",
    bestFor: "Short-form updates on what I am building",
  },
  {
    icon: "upwork",
    label: "Upwork",
    href: "https://www.upwork.com/freelancers/~01192228420671270c",
    bestFor: "Contract and freelance engagements",
  },
  {
    icon: "website",
    label: "Website",
    href: "https://rahul-rocket.github.io",
    detail: "rahul-rocket.github.io",
    bestFor: "Longer-form background and the professional record",
  },
  {
    icon: "location",
    label: "Ahmedabad, India",
    bestFor: "Timezone IST (UTC+5:30) — I work with teams anywhere",
  },
]
