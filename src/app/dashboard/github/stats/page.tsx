import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGithubAccessTokenByEmail } from "@/lib/github-token"
import {
  getAuthenticatedUser, getUserRepos,
  getRepoCommitActivity, getRepoLanguages,
  lastNWeeksTotals, languagePercentages,
} from "@/lib/github"
import RepoSparkline from "@/components/github/RepoSparkline"
import StatsTabs from "@/components/github/StatsTabs"
import { BarChart3, Star, GitFork } from "lucide-react"
import Link from "next/link"

export const revalidate = 3600 // 1h pour la page (les stats/lan g ont leurs propres caches)

export default async function GithubStatsPage({ searchParams }: { searchParams: { sort?: "updated" | "stars" } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/")

  const token = await getGithubAccessTokenByEmail(session.user.email)
  const me = await getAuthenticatedUser(token).catch(() => null)
  if (!me) {
    redirect("/dashboard/github") // fallback vers la page de base si pas d’accès
  }

  const sort = (searchParams?.sort ?? "updated") as "updated" | "stars"
  const repos = await getUserRepos(token, 8, sort)

  // Récupère stats en parallèle (limité à 8 repos)
  const stats = await Promise.all(
    repos.map(async (r) => {
      const [activity, langs] = await Promise.all([
        getRepoCommitActivity(r.owner.login, r.name, token),
        getRepoLanguages(r.owner.login, r.name, token),
      ])
      const weeks = lastNWeeksTotals(activity, 12).map((w) => ({
        label: new Date(w.week * 1000).toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" }),
        total: w.total,
      }))
      const langSlices = languagePercentages(langs, 2)
      return { repo: r, weeks, langSlices }
    })
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5" />
        <h1 className="text-2xl font-bold">GitHub — Stats</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {me.name ?? me.login} — {repos.length} repos analysés
        </div>
        <StatsTabs />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map(({ repo, weeks, langSlices }) => (
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
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {repo.stargazers_count}</span>
                <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" /> {repo.forks_count}</span>
              </div>
            </div>

            <RepoSparkline
              repoFullName={repo.full_name}
              weeks={weeks}
              langs={langSlices}
            />
          </div>
        ))}
      </div>
    </div>
  )
}