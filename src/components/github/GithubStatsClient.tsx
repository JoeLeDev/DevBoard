"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Star, GitFork, RefreshCw } from "lucide-react"
import Link from "next/link"
import RepoSparkline from "./RepoSparkline"
import StatsTabs from "./StatsTabs"

type RepoStats = {
  repo: {
    id: number
    full_name: string
    html_url: string
    stargazers_count: number
    forks_count: number
  }
  weeks: Array<{ label: string; total: number }>
  langSlices: Array<{ lang: string; pct: number }>
  commitStatus: 'success' | 'analyzing' | 'error'
}

export default function GithubStatsClient({ 
  initialStats, 
  userName 
}: { 
  initialStats: RepoStats[]
  userName: string
}) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState(initialStats)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force le rechargement des données côté serveur
      router.refresh()
      // Attendre un peu pour que les données se mettent à jour
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">GitHub — Stats</h1>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Mise à jour...' : 'Actualiser'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {userName} — {stats.length} repos analysés
        </div>
        <div className="flex items-center gap-4">
          {isRefreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Récupération des données en cours...
            </div>
          )}
          <StatsTabs />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isRefreshing ? (
          // Skeleton loading pendant le rafraîchissement
          Array.from({ length: stats.length }).map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-36 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-56 w-full" />
              </div>
            </Card>
          ))
        ) : (
          stats.map(({ repo, weeks, langSlices, commitStatus }) => (
            <div key={repo.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href={repo.html_url}
                  target="_blank"
                  className="underline underline-offset-4 font-medium"
                >
                  {repo.full_name}
                </Link>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" /> {repo.stargazers_count}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3 w-3" /> {repo.forks_count}
                  </span>
                </div>
              </div>

              <RepoSparkline
                repoFullName={repo.full_name}
                weeks={weeks}
                langs={langSlices}
                commitStatus={commitStatus}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
