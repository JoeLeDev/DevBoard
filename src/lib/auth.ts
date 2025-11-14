import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Vérification des variables d'environnement requises
const githubId = process.env.GITHUB_ID
const githubSecret = process.env.GITHUB_SECRET
const nextAuthUrl = process.env.NEXTAUTH_URL
const nextAuthSecret = process.env.NEXTAUTH_SECRET

// Fonction pour afficher les erreurs de manière visible
function logError(message: string) {
  const separator = "=".repeat(80)
  process.stderr.write(`\n${separator}\n`)
  process.stderr.write(`${message}\n`)
  process.stderr.write(`${separator}\n\n`)
  console.error(message)
}

// Vérifications critiques pour NextAuth
if (!nextAuthSecret) {
  logError("ERREUR CRITIQUE : NEXTAUTH_SECRET est requis pour NextAuth\nGénérez un secret avec : openssl rand -base64 32")
  throw new Error("NEXTAUTH_SECRET is required")
}

if (!nextAuthUrl) {
  logError("ERREUR CRITIQUE : NEXTAUTH_URL est requis pour NextAuth\nDéfinissez NEXTAUTH_URL avec l'URL de votre application")
  throw new Error("NEXTAUTH_URL is required")
}

if (!githubId || !githubSecret) {
  logError(`Erreur de configuration : GITHUB_ID et GITHUB_SECRET doivent être définis\nVariables d'environnement requises :\n   GITHUB_ID=votre_client_id\n   GITHUB_SECRET=votre_client_secret\n   NEXTAUTH_URL=${nextAuthUrl}\n   NEXTAUTH_SECRET=***`)
}

export const authOptions: NextAuthOptions = {
    secret: nextAuthSecret,
    adapter: prisma ? PrismaAdapter(prisma) : undefined,
    session: {
      strategy: "database",
    },
    providers: [
      ...(githubId && githubSecret ? [
        GitHubProvider({
          clientId: githubId,
          clientSecret: githubSecret,
          authorization: {
            params: {
              scope: 'read:user user:email repo',
            },
          },
        }),
      ] : []),
    ],
    pages: {
      signIn: "/",
      error: "/",
    },
    callbacks: {
      session: ({ session, user }) => ({
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      }),
      signIn: async ({ user, account }) => {
        if (account?.provider === "github" && account.access_token) {
          console.log("Mise à jour du token GitHub pour l'utilisateur:", user.id)
          // Forcer la mise à jour du token d'accès
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "github",
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
            },
            create: {
              userId: user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
            },
          });
          console.log("Token GitHub mis à jour")
        }
        return true;
      },
    },
}
