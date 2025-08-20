import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGithubAccessTokenByEmail } from "@/lib/github-token"
import {
  getAuthenticatedUser, getUserRepos,
  getRepoCommitActivity, getRepoLanguages,
  lastNWeeksTotals, languagePercentages,
} from "@/lib/github"
import GithubStatsClient from "@/components/github/GithubStatsClient"

export const revalidate = 300 // 5 min pour la page (les stats ont leurs propres caches)

export default async function GithubStatsPage({ searchParams }: { searchParams: Promise<{ sort?: "updated" | "stars" }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/")

  const token = await getGithubAccessTokenByEmail(session.user.email)
  const me = await getAuthenticatedUser(token || undefined).catch(() => null)
  if (!me) {
    redirect("/dashboard/github") // fallback vers la page de base si pas d'accès
  }

  const params = await searchParams
  const sort = (params?.sort ?? "updated") as "updated" | "stars"
  const repos = await getUserRepos(token || undefined, 8, sort)

  // Récupère stats en parallèle (limité à 8 repos)
  const stats = await Promise.all(
    repos.map(async (r) => {
      const [activity, langs] = await Promise.all([
        getRepoCommitActivity(r.owner.login, r.name, token || undefined),
        getRepoLanguages(r.owner.login, r.name, token || undefined),
      ])
      const weeks = lastNWeeksTotals(activity, 12).map((w) => ({
        label: new Date(w.week * 1000).toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" }),
        total: w.total,
      }))
      const langSlices = languagePercentages(langs, 2)
      const commitStatus = activity?.status || 'error'
      console.log(`📋 Repo ${r.full_name}: ${langSlices.length} langage(s) affiché(s), statut commits: ${commitStatus}`)
      return { 
        repo: {
          id: r.id,
          full_name: r.full_name,
          html_url: r.html_url,
          stargazers_count: r.stargazers_count,
          forks_count: r.forks_count,
        }, 
        weeks, 
        langSlices,
        commitStatus
      }
    })
  )

  return (
    <GithubStatsClient 
      initialStats={stats}
      userName={me.name ?? me.login}
    />
  )
}