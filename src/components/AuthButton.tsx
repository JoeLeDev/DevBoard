"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { LogIn, LogOut, User } from "lucide-react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <User className="h-4 w-4" />
        <p>{session.user?.name}</p>
        <button onClick={() => signOut()} className="p-2 border rounded inline-flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    )
  }
  return (
    <button onClick={() => signIn("github")} className="p-2 border rounded inline-flex items-center gap-2">
      <LogIn className="h-4 w-4" />
      <span>Se connecter avec GitHub</span>
    </button>
  )
}