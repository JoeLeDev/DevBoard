import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NoteStatus } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json() as { title?: string; content?: string; status?: NoteStatus }
  const id = Number(params.id)
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  // Ensure ownership
  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.note.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      content: body.content ?? existing.content ?? "",
      status: body.status ?? existing.status,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const id = Number(params.id)
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.note.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}