"use client"

import { Card } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts"
import { Activity, PieChart } from "lucide-react"

type WeekPoint = { label: string; total: number }
type LangSlice = { lang: string; pct: number }

function CommitsTooltip({ label, payload }: any) {
  const v = payload?.[0]?.value
  if (v == null) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm">
      <div className="font-medium">{label}</div>
      <div>{v} commits</div>
    </div>
  )
}

export default function RepoSparkline({
  repoFullName,
  weeks,
  langs,
}: {
  repoFullName: string
  weeks: WeekPoint[]
  langs: LangSlice[]
}) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{repoFullName}</div>
      </div>

      {/* Commits (12 dernières semaines) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4" />
          <span>Commits — 12 dernières semaines</span>
        </div>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CommitsTooltip />} />
              <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Langages */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <PieChart className="h-4 w-4" />
          <span>Langages</span>
        </div>
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={langs} layout="vertical" margin={{ top: 8, right: 12, bottom: 8, left: 40 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="lang" />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Bar dataKey="pct">
                {langs.map((_, i) => (
                  <Cell key={i} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  )
}