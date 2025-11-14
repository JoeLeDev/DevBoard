import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Validation au moment de la création du handler pour s'assurer que les erreurs sont visibles
let handler: ReturnType<typeof NextAuth>
try {
  handler = NextAuth(authOptions)
} catch (error) {
  console.error("Erreur lors de l'initialisation de NextAuth:", error)
  throw error
}

export { handler as GET, handler as POST }