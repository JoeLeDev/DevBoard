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

export type HnList = "top" | "new" | "best"

function pathForList(list: HnList) {
  switch (list) {
    case "new": return "/newstories.json"
    case "best": return "/beststories.json"
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

export async function getStories(list: HnList, limit = 20): Promise<HnItem[]> {
  const ids = await getStoryIds(list, limit)
  const items = await Promise.all(ids.map((id) => getItem(id)))
  // Filtre les items null/undefined (rare) et ne garde que les "story"
  return items.filter((it): it is HnItem => !!it && it.type === "story")
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