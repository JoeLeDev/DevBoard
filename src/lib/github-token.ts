
import "server-only"
import { prisma } from "./prisma"

/**
 * Récupèration du token GitHub de l'utilisateur connecté via NextAuth (table Account).
 * Fallback: undefined si pas de token (ex: autre provider).
 */
export async function getGithubAccessTokenByEmail(email: string) {
  console.log("🔍 Recherche du token GitHub pour l'email:", email)
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log("❌ Utilisateur non trouvé pour l'email:", email)
    return undefined
  }
  console.log("✅ Utilisateur trouvé:", user.id)

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: "github" },
    select: { access_token: true }
  })
  
  if (!account) {
    console.log("❌ Compte GitHub non trouvé pour l'utilisateur:", user.id)
    return undefined
  }
  
  console.log("✅ Token GitHub trouvé pour l'utilisateur:", user.id)
  return account.access_token
}