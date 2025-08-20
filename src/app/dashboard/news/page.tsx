import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getStories, domainFromUrl, itemUrl, hnDiscussionUrl, type HnList } from "@/lib/hn"
import NewsTabs from "@/components/news/NewsTabs"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Newspaper, ExternalLink, MessageSquare } from "lucide-react"

export const revalidate = 300 // 5 min

function relTime(unixSeconds?: number) {
  if (!unixSeconds) return ""
  const diff = Date.now() - unixSeconds * 1000
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  const days = Math.round(hours / 24)
  return `${days} j`
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { t?: HnList }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/")

  const list = (searchParams?.t ?? "top") as HnList
  const stories = await getStories(list, 20)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Newspaper className="h-5 w-5" />
        <h1 className="text-2xl font-bold">News</h1>
      </div>

      <NewsTabs />

      <Separator />

      <ul className="space-y-3">
        {stories.map((s) => {
          const domain = domainFromUrl(s.url)
          return (
            <li key={s.id} className="border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Link
                    href={itemUrl(s)}
                    target="_blank"
                    className="font-medium underline underline-offset-4"
                  >
                    {s.title ?? "Untitled"}
                  </Link>
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                    <span>{domain}</span>
                    <span>•</span>
                    <span>by {s.by ?? "unknown"}</span>
                    <span>•</span>
                    <span>{relTime(s.time)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {typeof s.score === "number" && (
                    <Badge variant="secondary">{s.score} pts</Badge>
                  )}
                  <Link
                    href={hnDiscussionUrl(s.id)}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm"
                    aria-label="Voir discussion sur Hacker News"
                    title="Voir discussion sur Hacker News"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                  <Link
                    href={itemUrl(s)}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm"
                    aria-label="Ouvrir l’article"
                    title="Ouvrir l’article"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
