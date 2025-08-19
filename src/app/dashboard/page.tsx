import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import Link from "next/link"
import { NotebookPen, Github } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <ul className="space-y-2">
        <li>
          <Link className="inline-flex items-center gap-2 underline" href="/dashboard/notes">
            <NotebookPen className="h-4 w-4" /> Mes notes
          </Link>
        </li>
        <li>
          <Link className="inline-flex items-center gap-2 underline" href="/dashboard/github">
            <Github className="h-4 w-4" /> GitHub
          </Link>
        </li>
      </ul>
    </main>
  )
}
