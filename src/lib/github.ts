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
  fork: boolean
}

export async function getAuthenticatedUser(token?: string) {
  return gh<GhUser>("/user", token)
}
export async function getUserRepos(token?: string, perPage = 8, sort: "updated" | "stars" = "updated") {
  // Récupère seulement les repos dont l'utilisateur est propriétaire (pas les forks)
  const repos = await gh<GhRepo[]>(`/user/repos?sort=updated&per_page=${perPage * 2}&type=owner`, token, 600)
  
  // Filtre pour ne garder que les repos dont l'utilisateur est propriétaire
  const ownedRepos = repos.filter(repo => !repo.fork)
  
  // Limite le nombre de repos retournés
  const limitedRepos = ownedRepos.slice(0, perPage)
  
  if (sort === "stars") {
    return limitedRepos.sort((a: GhRepo, b: GhRepo) => b.stargazers_count - a.stargazers_count)
  }
  return limitedRepos
}

/** Commit activity: 52 semaines (tableau d'objets { total, week, days[7] }) */
type CommitWeek = { total: number; week: number; days: number[] }

/** Peut renvoyer 202 pendant la génération côté GitHub -> on tente un 2e call en no-store, sinon null */
export async function getRepoCommitActivity(
  owner: string,
  repo: string,
  token?: string,
): Promise<{ data: CommitWeek[] | null; status: 'success' | 'analyzing' | 'error' }> {
  const url = `/repos/${owner}/${repo}/stats/commit_activity`
  
  // Premier essai avec cache court pour éviter les problèmes de cache
  let res = await fetch(`${API}${url}`, { 
    headers: buildHeaders(token), 
    next: { revalidate: 300 } // Cache de 5 minutes au lieu de 24h
  })
  
  // Si GitHub génère encore les stats (202), on attend un peu et on réessaie
  if (res.status === 202) {
    console.log(`🔄 GitHub génère les stats pour ${owner}/${repo}, nouvelle tentative...`)
    // Attendre 2 secondes avant de réessayer
    await new Promise(resolve => setTimeout(resolve, 2000))
    res = await fetch(`${API}${url}`, { 
      headers: buildHeaders(token), 
      cache: "no-store" 
    })
  }
  
  // Si toujours 202, on abandonne pour ce repo
  if (res.status === 202) {
    console.log(`❌ Impossible de récupérer les stats pour ${owner}/${repo} (toujours en génération)`)
    return { data: null, status: 'analyzing' }
  }
  
  if (!res.ok) {
    console.log(`❌ Erreur ${res.status} pour les stats de ${owner}/${repo}`)
    return { data: null, status: 'error' }
  }
  
  console.log(`✅ Stats récupérées pour ${owner}/${repo}`)
  return { data: (await res.json()) as CommitWeek[], status: 'success' }
}

/** Répartition des langages (bytes par langage) */
export async function getRepoLanguages(owner: string, repo: string, token?: string) {
  type LangMap = Record<string, number>
  try {
    const langs = await gh<LangMap>(`/repos/${owner}/${repo}/languages`, token, 3600)
    console.log(`🌐 Langages pour ${owner}/${repo}:`, langs)
    return langs
  } catch (error: any) {
    if (error.message?.includes('403')) {
      console.log(`🚫 Accès refusé aux langages pour ${owner}/${repo} (repo privé ou permissions insuffisantes)`)
    } else if (error.message?.includes('404')) {
      console.log(`🔍 Repo ${owner}/${repo} non trouvé ou inaccessible`)
    } else {
      console.log(`❌ Erreur lors de la récupération des langages pour ${owner}/${repo}:`, error.message)
    }
    return null
  }
}

/** Utilitaires pour stats */
export function lastNWeeksTotals(activity: { data: CommitWeek[] | null; status: 'success' | 'analyzing' | 'error' } | null, n = 12) {
  if (!activity || activity.status !== 'success' || !activity.data || !Array.isArray(activity.data)) return []
  const weeks = activity.data.slice(-n)
  return weeks.map((w) => ({ week: w.week, total: w.total }))
}
export function languagePercentages(langMap: Record<string, number> | null, top = 5) {
  if (!langMap) {
    console.log("❌ Aucune donnée de langages")
    return []
  }
  
  const entries = Object.entries(langMap)
  if (entries.length === 0) {
    console.log("❌ Aucun langage détecté")
    return []
  }
  
  const sum = entries.reduce((acc, [, v]) => acc + v, 0) || 1
  const sorted = entries.sort((a, b) => b[1] - a[1])
  
  console.log(`📊 Langages détectés pour ${entries.length} langage(s):`, sorted.map(([lang, bytes]) => `${lang}: ${((bytes / sum) * 100).toFixed(1)}%`))
  
  // Si il n'y a qu'un seul langage, on l'affiche toujours
  if (entries.length === 1) {
    const [lang, bytes] = entries[0]
    const pct = (bytes / sum) * 100
    console.log(`✅ Langage unique: ${lang} (${pct.toFixed(1)}%)`)
    return [{ lang, pct }]
  }
  
  // Sinon, on affiche tous les langages qui représentent plus de 2% (au lieu de 5%)
  const significant = sorted.filter(([, v]) => (v / sum) * 100 >= 2)
  const res = significant.map(([k, v]) => ({ lang: k, pct: (v / sum) * 100 }))
  
  console.log(`✅ Langages significatifs (≥2%):`, res.map(l => `${l.lang}: ${l.pct.toFixed(1)}%`))
  return res
}
