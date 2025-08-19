"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Bonjour {session.user?.name}</p>
        <button
          onClick={() => signOut()}
          className="p-2 border rounded"
        >
          Logout
        </button>
      </div>
    )
  }
  return (
    <button
      onClick={() => signIn("github")}
      className="p-2 border rounded"
    >
      Se connecter avec GitHub
    </button>
  )
}