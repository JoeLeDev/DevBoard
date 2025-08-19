"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const MAP = { top: "top", new: "new", best: "best" } as const
type TabKey = keyof typeof MAP

export default function NewsTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const current = (search.get("t") ?? "top") as TabKey

  function setTab(tab: TabKey) {
    const params = new URLSearchParams(search)
    params.set("t", tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={current} onValueChange={(v) => setTab(v as TabKey)}>
      <TabsList>
        <TabsTrigger value="top">Top</TabsTrigger>
        <TabsTrigger value="new">New</TabsTrigger>
        <TabsTrigger value="best">Best</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}