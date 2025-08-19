import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGithubAccessTokenByEmail } from "@/lib/github-token"
import { getAuthenticatedUser, getUserRepos } from "@/lib/github"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Github } from "lucide-react"
import Link from "next/link"

export const revalidate = 300 // 5 min

export default async function GithubPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/")

  const token = await getGithubAccessTokenByEmail(session.user.email)

  const [me, repos] = await Promise.all([
    getAuthenticatedUser(token).catch(() => null),
    getUserRepos(token, 8).catch(() => [])
  ])

  if (!me) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-bold"><Github className="h-4 w-4" /> GitHub</h1>
        <p className="text-sm opacity-80">
          Impossible d’accéder à GitHub pour ce compte. Assure-toi d’être connecté avec le provider GitHub
          (ou configure <code>GITHUB_ACCESS_TOKEN</code> dans ton <code>.env.local</code>).
        </p>
        <p className="text-sm">
          Doc callback: <code>/api/auth/callback/github</code>
        </p>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={me.avatar_url} alt={me.login} />
          <AvatarFallback>{(me.name ?? me.login).slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold"><Github className="h-4 w-4" /> GitHub — {me.name ?? me.login}</h1>
          <div className="text-sm opacity-80 flex gap-3">
            <a className="underline" href={me.html_url} target="_blank" rel="noreferrer">
              @{me.login}
            </a>
            <span>Repos publics: {me.public_repos}</span>
            <span>Followers: {me.followers}</span>
            <span>Following: {me.following}</span>
          </div>
          {me.bio && <p className="text-sm mt-1 opacity-80">{me.bio}</p>}
        </div>
      </div>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Derniers repos mis à jour</h2>
        <ul className="grid md:grid-cols-2 gap-3">
          {repos.map(repo => (
            <li key={repo.id} className="rounded-xl border p-4 hover:bg-muted/30 transition">
              <div className="flex items-center justify-between">
                <Link
                  href={repo.html_url}
                  target="_blank"
                  className="font-medium underline underline-offset-4"
                >
                  {repo.name}
                </Link>
                <span className="text-xs opacity-70">
                  {new Date(repo.pushed_at).toLocaleDateString()}
                </span>
              </div>
              {repo.description && (
                <p className="text-sm mt-1 opacity-80 line-clamp-2">{repo.description}</p>
              )}
              <div className="text-xs mt-2 flex gap-3 opacity-80">
                {repo.language && <span>Langage: {repo.language}</span>}
                <span>⭐ {repo.stargazers_count}</span>
                <span>🍴 {repo.forks_count}</span>
              </div>
            </li>
          ))}
          {repos.length === 0 && <p className="text-sm opacity-80">Aucun repo à afficher.</p>}
        </ul>
        <div className="flex justify-end">
          <Link href="/dashboard/github/stats" className="text-sm underline underline-offset-4">
            Voir les stats
          </Link>
        </div>
      </section>
    </main>
  )
}