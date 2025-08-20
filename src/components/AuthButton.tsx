"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, User, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AuthButton({ compact = false }: { compact?: boolean }) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignIn = async () => {
    await signIn("github", { callbackUrl: "/dashboard" })
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (session) {
    if (compact) {
      return (
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{session.user?.name}</span>
          <LogOut className="h-4 w-4" />
        </Button>
      )
    }
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 bg-card border rounded-lg px-4 py-3">
          <User className="h-5 w-5 text-primary" />
          <p className="font-medium">{session.user?.name}</p>
        </div>
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    )
  }
  
  return (
    <Button 
      onClick={handleSignIn} 
      size="lg"
      className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
    >
      <Github className="h-5 w-5 mr-3" />
      Se connecter avec GitHub
    </Button>
  )
}