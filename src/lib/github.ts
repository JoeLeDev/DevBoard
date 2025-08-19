import "server-only"

const API = "https://api.github.com"

function buildHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "devboard"
  }
  const t = token ?? process.env.GITHUB_ACCESS_TOKEN
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function gh<T>(path: string, token?: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: buildHeaders(token),
    // Cache ISR-like : revalidate toutes les 5 min
    next: { revalidate }
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`GitHub ${res.status} ${res.statusText} – ${body}`)
  }
  return (await res.json()) as T
}

export type GhUser = {
  login: string
  name?: string
  avatar_url: string
  followers: number
  following: number
  public_repos: number
  html_url: string
  bio?: string
}

export type GhRepo = {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  pushed_at: string
  html_url: string
}

export async function getAuthenticatedUser(token?: string) {
  return gh<GhUser>("/user", token)
}

export async function getUserRepos(token?: string, perPage = 8) {
  // Repos de l’utilisateur connecté, triés par récente activité
  return gh<GhRepo[]>(`/user/repos?sort=updated&per_page=${perPage}`, token)
}