import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Body = {
  weatherCity?: string | null
  weatherUnits?: "metric" | "imperial"
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    include: { userSettings: true }
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({
    weatherCity: user.userSettings?.weatherCity ?? null,
    weatherUnits: (user.userSettings?.weatherUnits as "metric" | "imperial") ?? "metric",
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = (await req.json()) as Body

  if (body.weatherUnits && !["metric", "imperial"].includes(body.weatherUnits)) {
    return NextResponse.json({ error: "Invalid units" }, { status: 400 })
  }

  const updated = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      weatherCity: typeof body.weatherCity === "string" ? body.weatherCity : undefined,
      weatherUnits: body.weatherUnits ?? undefined,
    },
    create: {
      userId: user.id,
      weatherCity: typeof body.weatherCity === "string" ? body.weatherCity : null,
      weatherUnits: body.weatherUnits ?? "metric",
    },
    select: { weatherCity: true, weatherUnits: true },
  })

  return NextResponse.json(updated)
}