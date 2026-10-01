import { Cloud, Database, GitBranch, Palette, Server } from "lucide-react"

/** Skill categories, shared by the /skills page and the /resume page. */
export const skillCategories = [
  {
    title: "Frontend",
    icon: Palette,
    color: "from-spectrum-1 to-spectrum-2",
    bgColor: "bg-spectrum-1/10",
    borderColor: "hover:border-spectrum-1/50",
    skills: [
      { name: "React", icon: "⚛️", level: 95 },
      { name: "Next.js", icon: "▲", level: 92 },
      { name: "TypeScript", icon: "TS", level: 90 },
      { name: "Angular", icon: "🅰️", level: 75 },
      { name: "Tailwind CSS", icon: "🎨", level: 95 },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    color: "from-spectrum-2 to-spectrum-3",
    bgColor: "bg-spectrum-2/10",
    borderColor: "hover:border-spectrum-2/50",
    skills: [
      { name: "Node.js", icon: "🟢", level: 90 },
      { name: "NestJS", icon: "🐱", level: 85 },
      { name: "REST APIs", icon: "🔌", level: 92 },
    ],
  },
  {
    title: "Database",
    icon: Database,
    color: "from-spectrum-3 to-spectrum-1",
    bgColor: "bg-spectrum-3/10",
    borderColor: "hover:border-spectrum-3/50",
    skills: [
      { name: "PostgreSQL", icon: "🐘", level: 88 },
      { name: "MongoDB", icon: "🍃", level: 85 },
      { name: "Supabase", icon: "⚡", level: 80 },
    ],
  },
  {
    title: "DevOps & Tools",
    icon: GitBranch,
    color: "from-spectrum-1 to-spectrum-2",
    bgColor: "bg-spectrum-1/10",
    borderColor: "hover:border-spectrum-1/50",
    skills: [
      { name: "Git", icon: "📦", level: 95 },
      { name: "GitHub", icon: "🐙", level: 92 },
      { name: "Docker", icon: "🐳", level: 80 },
      { name: "CI/CD", icon: "🔄", level: 82 },
    ],
  },
  {
    title: "Cloud & Deployment",
    icon: Cloud,
    color: "from-spectrum-2 to-spectrum-3",
    bgColor: "bg-spectrum-2/10",
    borderColor: "hover:border-spectrum-2/50",
    skills: [
      { name: "Vercel", icon: "▲", level: 90 },
      { name: "Firebase", icon: "🔥", level: 85 },
    ],
  },
]
