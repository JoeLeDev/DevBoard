"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function StatsTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const current = (search.get("sort") ?? "updated") as "updated" | "stars"

  function setTab(tab: "updated" | "stars") {
    const params = new URLSearchParams(search)
    params.set("sort", tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={current} onValueChange={(v) => setTab(v as "updated" | "stars")}>
      <TabsList>
        <TabsTrigger value="updated">Récents</TabsTrigger>
        <TabsTrigger value="stars">Étoiles</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}