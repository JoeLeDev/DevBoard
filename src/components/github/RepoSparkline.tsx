"use client"

import { Card } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts"
import { Activity, PieChart as PieChartIcon } from "lucide-react"

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

function LangTooltip({ payload }: any) {
  if (!payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm">
      <div className="font-medium">{data.lang}</div>
      <div>{data.pct.toFixed(1)}%</div>
    </div>
  )
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']

export default function RepoSparkline({
  repoFullName,
  weeks,
  langs,
  commitStatus,
}: {
  repoFullName: string
  weeks: WeekPoint[]
  langs: LangSlice[]
  commitStatus: 'success' | 'analyzing' | 'error'
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
        {commitStatus === 'analyzing' ? (
          <div className="h-36 w-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Analyse en cours...</span>
              </div>
              <p className="text-xs">GitHub génère les statistiques</p>
            </div>
          </div>
        ) : weeks && weeks.length > 0 ? (
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
        ) : (
          <div className="h-36 w-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p>Aucun commit</p>
              <p>dans les 12 dernières semaines</p>
            </div>
          </div>
        )}
      </div>

      {/* Langages */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <PieChartIcon className="h-4 w-4" />
          <span>Langages {langs.length > 0 ? `(${langs.length})` : '(non disponible)'}</span>
        </div>
        {langs.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={langs}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ lang, pct }) => `${lang} ${pct.toFixed(1)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="pct"
                >
                  {langs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<LangTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 w-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p>Données de langages</p>
              <p>non disponibles</p>
              <p className="text-xs mt-1">(repo vide ou en cours d'analyse)</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}