"use client"

import { Card } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, AreaChart, Area,
} from "recharts"
import { LineChart as LineChartIcon, BarChart3, Droplets, Wind } from "lucide-react"

type Hourly = { dt: number; temp: number; humidity?: number; windSpeed?: number }
type Daily = { date: string; min: number; max: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TempTooltip({ label, payload, units }: any) {
  const p = payload?.[0]?.value
  if (p == null) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{label}</div>
      <div className="text-blue-600">{Math.round(p)}°{units === "metric" ? "C" : "F"}</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DualTooltip({ label, payload, units }: any) {
  if (!payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const min = payload.find((x: any) => x.dataKey === "min")?.value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const max = payload.find((x: any) => x.dataKey === "max")?.value
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{label}</div>
      <div className="text-blue-400">Min: {Math.round(min)}°{units === "metric" ? "C" : "F"}</div>
      <div className="text-red-500">Max: {Math.round(max)}°{units === "metric" ? "C" : "F"}</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HumidityTooltip({ label, payload }: any) {
  const p = payload?.[0]?.value
  if (p == null) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{label}</div>
      <div className="text-cyan-600">{Math.round(p)}%</div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WindTooltip({ label, payload, units }: any) {
  const p = payload?.[0]?.value
  if (p == null) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
      <div className="font-medium">{label}</div>
      <div className="text-gray-600">{Math.round(p)} {units === "metric" ? "m/s" : "mph"}</div>
    </div>
  )
}

export default function WeatherCharts({
  units,
  hourly,
  daily,
}: {
  units: "metric" | "imperial"
  hourly: { dt: number; temp: number; icon?: string; main?: string; humidity?: number; windSpeed?: number }[]
  daily: { date: string; min: number; max: number; icon?: string }[]
}) {
  const hourlyData: Hourly[] = hourly.map(h => ({
    dt: h.dt,
    temp: h.temp,
    humidity: h.humidity,
    windSpeed: h.windSpeed,
  }))

  const hourlyLabels = hourlyData.map(h =>
    new Date(h.dt * 1000).toLocaleTimeString(undefined, { hour: "2-digit" })
  )

  const hourlySeries = hourlyData.map((h, i) => ({
    time: hourlyLabels[i],
    temp: Math.round(h.temp),
    humidity: h.humidity,
    windSpeed: h.windSpeed,
  }))

  const dailySeries: Daily[] = daily.map(d => ({
    date: new Date(d.date).toLocaleDateString(undefined, { weekday: "short", day: "2-digit" }),
    min: Math.round(d.min),
    max: Math.round(d.max),
  }))

  return (
    <div className="space-y-6">
      {/* Température - 24h */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-blue-600" />
          <div className="font-semibold text-lg">Température — Prochaines 24h</div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlySeries} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(v) => `${v}°`} 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={(p) => <TempTooltip {...p} units={units} />} />
              <Line 
                type="monotone" 
                dataKey="temp" 
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                stroke="#3B82F6" 
                strokeWidth={3}
                activeDot={{ r: 6, stroke: "#1D4ED8", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Min/Max - 5 jours */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-600" />
          <div className="font-semibold text-lg">Min/Max — 5 prochains jours</div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySeries} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(v) => `${v}°`} 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={(p) => <DualTooltip {...p} units={units} />} />
              <Bar 
                dataKey="min" 
                fill="#60A5FA" 
                radius={[4, 4, 0, 0]}
                name="Min"
              />
              <Bar 
                dataKey="max" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
                name="Max"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Humidité - 24h */}
      {hourlySeries.some(h => h.humidity) && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-600" />
            <div className="font-semibold text-lg">Humidité — Prochaines 24h</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySeries} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(v) => `${v}%`} 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={(p) => <HumidityTooltip {...p} />} />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#06B6D4" 
                  fill="#06B6D4" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Vent - 24h */}
      {hourlySeries.some(h => h.windSpeed) && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wind className="h-5 w-5 text-gray-600" />
            <div className="font-semibold text-lg">Vent — Prochaines 24h</div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlySeries} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(v) => `${v} ${units === "metric" ? "m/s" : "mph"}`} 
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={(p) => <WindTooltip {...p} units={units} />} />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  dot={{ fill: "#6B7280", strokeWidth: 2, r: 4 }}
                  stroke="#6B7280" 
                  strokeWidth={3}
                  activeDot={{ r: 6, stroke: "#374151", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}