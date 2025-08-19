
import "server-only"
import { prisma } from "./prisma"

/**
 * Récupèration du token GitHub de l'utilisateur connecté via NextAuth (table Account).
 * Fallback: undefined si pas de token (ex: autre provider).
 */
export async function getGithubAccessTokenByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return undefined

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "github" },
    select: { access_token: true }
  })
  return account?.access_token ?? undefined
}