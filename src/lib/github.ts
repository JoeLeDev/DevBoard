// lib/github.ts
import "server-only"

const API = "https://api.github.com"

function buildHeaders(token?: string): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "devboard",
  }
  const t = token ?? process.env.GITHUB_ACCESS_TOKEN
  if (t) h.Authorization = `Bearer ${t}`
  return h
}
async function gh<T>(path: string, token?: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: buildHeaders(token), next: { revalidate } })
  if (!res.ok) throw new Error(`GitHub ${res.status} ${res.statusText}`)
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
  owner: { login: string }
}

export async function getAuthenticatedUser(token?: string) {
  return gh<GhUser>("/user", token)
}
export async function getUserRepos(token?: string, perPage = 8, sort: "updated" | "stars" = "updated") {
  // GitHub ne permet pas sort=stars sur /user/repos. On récupère updated, puis on trie côté serveur si besoin.
  const repos = await gh<GhRepo>(`/user/repos?sort=updated&per_page=${perPage}`, token, 600)
  if (sort === "stars") {
    return repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
  }
  return repos
}

/** Commit activity: 52 semaines (tableau d'objets { total, week, days[7] }) */
type CommitWeek = { total: number; week: number; days: number[] }

/** Peut renvoyer 202 pendant la génération côté GitHub -> on tente un 2e call en no-store, sinon null */
export async function getRepoCommitActivity(
  owner: string,
  repo: string,
  token?: string,
): Promise<CommitWeek[] | null> {
  const url = `/repos/${owner}/${repo}/stats/commit_activity`
  // premier call avec cache d'1 jour
  let res = await fetch(`${API}${url}`, { headers: buildHeaders(token), next: { revalidate: 86400 } })
  if (res.status === 202) {
    res = await fetch(`${API}${url}`, { headers: buildHeaders(token), cache: "no-store" })
  }
  if (res.status === 202) return null
  if (!res.ok) return null
  return (await res.json()) as CommitWeek[]
}

/** Répartition des langages (bytes par langage) */
export async function getRepoLanguages(owner: string, repo: string, token?: string) {
  type LangMap = Record<string, number>
  return gh<LangMap>(`/repos/${owner}/${repo}/languages`, token, 86400)
}

/** Utilitaires pour stats */
export function lastNWeeksTotals(activity: CommitWeek[] | null, n = 12) {
  if (!activity || !Array.isArray(activity)) return []
  const weeks = activity.slice(-n)
  return weeks.map((w) => ({ week: w.week, total: w.total }))
}
export function languagePercentages(langMap: Record<string, number> | null, top = 3) {
  if (!langMap) return []
  const entries = Object.entries(langMap)
  const sum = entries.reduce((acc, [, v]) => acc + v, 0) || 1
  const sorted = entries.sort((a, b) => b[1] - a[1])
  const head = sorted.slice(0, top)
  const rest = sorted.slice(top)
  const restSum = rest.reduce((acc, [, v]) => acc + v, 0)
  const res = head.map(([k, v]) => ({ lang: k, pct: (v / sum) * 100 }))
  if (restSum > 0) res.push({ lang: "Other", pct: (restSum / sum) * 100 })
  return res
}
