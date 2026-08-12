/**
 * GitHub data, read at BUILD TIME only.
 *
 * This app is a static export, so there is no request-time fetch: whatever these
 * functions return during `next build` is baked into the HTML. Refreshing the
 * numbers means running a deploy, exactly like the Postgres-backed blog.
 *
 * Both functions return `null` rather than throwing when the data cannot be
 * had -- no network on a fresh clone, no token, a rate-limited runner -- because
 * `pnpm build` must succeed without any GitHub credentials. Callers render a
 * reduced variant in that case.
 */

export const GITHUB_LOGIN = "rahul-rocket"
export const GITHUB_URL = `https://github.com/${GITHUB_LOGIN}`

export interface GitHubProfile {
  login: string
  name: string
  bio: string
  avatarUrl: string
  followers: number
  following: number
  publicRepos: number
  company: string | null
  location: string | null
  htmlUrl: string
  createdAt: string
}

/** One day cell of the contribution calendar. */
export interface ContributionDay {
  date: string
  count: number
  /** 0 (none) through 4 (highest quartile), matching GitHub's own scale. */
  level: number
}

export interface ContributionCalendar {
  total: number
  /** 53 weeks, oldest first, each with up to 7 days. */
  weeks: ContributionDay[][]
}

const LEVELS: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

function token(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined
}

/**
 * Public profile. The REST endpoint needs no credentials -- unauthenticated
 * builds get 60 requests an hour, which is ample for one call per build.
 */
export async function getGitHubProfile(): Promise<GitHubProfile | null> {
  try {
    const auth = token()
    const response = await fetch(`https://api.github.com/users/${GITHUB_LOGIN}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "rahul-rocket.github.io-build",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as Record<string, unknown>

    return {
      login: String(data.login ?? GITHUB_LOGIN),
      name: String(data.name ?? "Rahul"),
      bio: String(data.bio ?? ""),
      // GitHub serves 460px by default; the mark renders at 96px, so ask for
      // 2x that and no more. There is no image optimizer on a static export.
      avatarUrl: data.avatar_url ? `${String(data.avatar_url)}&s=192` : "",
      followers: Number(data.followers ?? 0),
      following: Number(data.following ?? 0),
      publicRepos: Number(data.public_repos ?? 0),
      company: data.company ? String(data.company) : null,
      location: data.location ? String(data.location) : null,
      htmlUrl: String(data.html_url ?? GITHUB_URL),
      createdAt: String(data.created_at ?? ""),
    }
  } catch {
    return null
  }
}

/**
 * The contribution calendar behind the graph on the profile page.
 *
 * Only GitHub's GraphQL API exposes this, and GraphQL always requires a token --
 * so without `GITHUB_TOKEN`/`GH_TOKEN` in the environment this returns `null`
 * and the section renders without the heatmap. In CI the workflow passes the
 * job's own `GITHUB_TOKEN`; locally, `gh auth token` supplies one.
 */
export async function getContributionCalendar(): Promise<ContributionCalendar | null> {
  const auth = token()
  if (!auth) {
    return null
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount contributionLevel }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
        "User-Agent": "rahul-rocket.github.io-build",
      },
      body: JSON.stringify({ query, variables: { login: GITHUB_LOGIN } }),
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions?: number
              weeks?: {
                contributionDays?: {
                  date?: string
                  contributionCount?: number
                  contributionLevel?: string
                }[]
              }[]
            }
          }
        }
      }
    }

    const calendar =
      payload.data?.user?.contributionsCollection?.contributionCalendar
    if (!calendar?.weeks) {
      return null
    }

    return {
      total: calendar.totalContributions ?? 0,
      weeks: calendar.weeks.map((week) =>
        (week.contributionDays ?? []).map((day) => ({
          date: String(day.date ?? ""),
          count: day.contributionCount ?? 0,
          level: LEVELS[day.contributionLevel ?? "NONE"] ?? 0,
        }))
      ),
    }
  } catch {
    return null
  }
}
