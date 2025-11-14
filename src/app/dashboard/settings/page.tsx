import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsClient from "@/components/settings/SettingsClient"
import { Settings as SettingsIcon } from "lucide-react"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/")

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email! },
    include: { userSettings: true }
  })
  if (!user) redirect("/")

  const settings = user.userSettings

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <SettingsClient
        initialCity={settings?.weatherCity ?? ""}
        initialUnits={(settings?.weatherUnits as "metric" | "imperial") ?? "metric"}
      />
    </div>
  )
}