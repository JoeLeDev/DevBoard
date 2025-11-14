import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import NotesClient from "@/components/notes/NotesClient"

export default async function NotesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/")

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) redirect("/")

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold"> Mes notes</h1>
      <NotesClient initialNotes={notes} />
    </main>
  )
}