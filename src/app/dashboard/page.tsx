import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold"> Dashboard</h1>
      <p>Bienvenue {session.user.name ?? "développeur"} !</p>
      <p className="text-blue-500"><Link href="/dashboard/notes">Mes notes</Link></p>
    </main>
  )
}
