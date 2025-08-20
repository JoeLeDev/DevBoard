import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import WeatherClient from "@/components/weather/WeatherClient"
import { CloudSun } from "lucide-react"
import Link from "next/link"

export const revalidate = 0

export default async function WeatherPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CloudSun className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Météo</h1>
      </div>
      <WeatherClient />
      <div className="flex justify-end">
        <Link href="/dashboard/weather/stats" className="text-sm underline underline-offset-4">
          Voir les stats
        </Link>
      </div>
    </div>
  )
}