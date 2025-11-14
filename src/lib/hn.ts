import "server-only"

const BASE = "https://hacker-news.firebaseio.com/v0"

export type HnItem = {
  id: number
  type: "story" | "job" | "comment" | "poll" | "pollopt"
  by?: string
  time?: number // unix seconds
  title?: string
  url?: string
  score?: number
  descendants?: number
  kids?: number[]
}

export type HnList = "top" | "new" | "best" | "dev" | "tech"

function pathForList(list: HnList) {
  switch (list) {
    case "new": return "/newstories.json"
    case "best": return "/beststories.json"
    case "dev":
    case "tech":
    default: return "/topstories.json"
  }
}

async function gh<T>(url: string, revalidate = 300): Promise<T> {
  const res = await fetch(url, { next: { revalidate } })
  if (!res.ok) throw new Error(`HN ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export async function getStoryIds(list: HnList, limit = 20): Promise<number[]> {
  const ids = await gh<number[]>(`${BASE}${pathForList(list)}`)
  return ids.slice(0, limit)
}

export async function getItem(id: number): Promise<HnItem> {
  return gh<HnItem>(`${BASE}/item/${id}.json`)
}

// Mots-clés pour filtrer les news de développement
const DEV_KEYWORDS = [
  "javascript", "typescript", "react", "vue", "angular", "node", "python", "java", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin",
  "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab", "vscode", "vim", "emacs",
  "api", "rest", "graphql", "database", "sql", "nosql", "mongodb", "postgresql", "mysql", "redis",
  "webpack", "vite", "babel", "eslint", "prettier", "jest", "cypress", "testing", "ci/cd", "deployment",
  "frontend", "backend", "fullstack", "devops", "microservices", "serverless", "cloud", "ai", "ml", "machine learning"
]

const TECH_KEYWORDS = [
  "startup", "funding", "venture", "acquisition", "ipo", "tech", "technology", "innovation", "product", "saas", "platform",
  "mobile", "ios", "android", "app", "software", "hardware", "chip", "semiconductor", "quantum", "blockchain", "crypto",
  "web3", "metaverse", "vr", "ar", "ai", "artificial intelligence", "robotics", "automation", "iot", "5g", "6g"
]

function isDevRelated(item: HnItem): boolean {
  if (!item.title) return false
  const title = item.title.toLowerCase()
  return DEV_KEYWORDS.some(keyword => title.includes(keyword.toLowerCase()))
}

function isTechRelated(item: HnItem): boolean {
  if (!item.title) return false
  const title = item.title.toLowerCase()
  return TECH_KEYWORDS.some(keyword => title.includes(keyword.toLowerCase()))
}

export async function getStories(list: HnList, limit = 20): Promise<HnItem[]> {
  const ids = await getStoryIds(list, limit)
  const items = await Promise.all(ids.map((id) => getItem(id)))
  // Filtre les items null/undefined (rare) et ne garde que les "story"
  let stories = items.filter((it): it is HnItem => !!it && it.type === "story")
  
  // Applique les filtres spécifiques
  if (list === "dev") {
    stories = stories.filter(isDevRelated)
  } else if (list === "tech") {
    stories = stories.filter(isTechRelated)
  }
  
  return stories
}

export function domainFromUrl(url?: string) {
  try {
    if (!url) return "news.ycombinator.com"
    return new URL(url).hostname
  } catch {
    return "news.ycombinator.com"
  }
}

export function itemUrl(it: HnItem) {
  return it.url ?? `https://news.ycombinator.com/item?id=${it.id}`
}

export function hnDiscussionUrl(id: number) {
  return `https://news.ycombinator.com/item?id=${id}`
}