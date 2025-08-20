"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Flame, CalendarPlus, Star, Code, Rocket } from "lucide-react"

const MAP = { 
  top: "top", 
  new: "new", 
  best: "best",
  dev: "dev",
  tech: "tech"
} as const
type TabKey = keyof typeof MAP

export default function NewsTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const current = (search.get("t") ?? "top") as TabKey

  function setTab(tab: TabKey) {
    const params = new URLSearchParams(search)
    params.set("t", tab)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs value={current} onValueChange={(v) => setTab(v as TabKey)}>
      <TabsList>
        <TabsTrigger value="top"><Flame className="h-4 w-4" /> Top</TabsTrigger>
        <TabsTrigger value="new"><CalendarPlus className="h-4 w-4" /> New</TabsTrigger>
        <TabsTrigger value="best"><Star className="h-4 w-4" /> Best</TabsTrigger>
        <TabsTrigger value="dev"><Code className="h-4 w-4" /> Dev</TabsTrigger>
        <TabsTrigger value="tech"><Rocket className="h-4 w-4" /> Tech</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}