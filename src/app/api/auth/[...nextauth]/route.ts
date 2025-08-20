import NextAuth, { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: "database",
    },
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
        authorization: {
          params: {
            scope: 'read:user user:email repo',
          },
        },
      }),
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
      signIn: async ({ user, account, profile }) => {
        if (account?.provider === "github" && account.access_token) {
          console.log("🔄 Mise à jour du token GitHub pour l'utilisateur:", user.id)
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
          console.log("✅ Token GitHub mis à jour")
        }
        return true;
      },
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }