import { NextResponse } from "next/server"

const BASE = "https://api.openweathermap.org/data/2.5"

type Search = {
  lat?: string
  lon?: string
  q?: string // city name
  units?: "metric" | "imperial"
}

function withUnits(units?: string) {
  return (units === "imperial" || units === "metric") ? units : "metric"
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const params: Search = {
    lat: searchParams.get("lat") ?? undefined,
    lon: searchParams.get("lon") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    units: withUnits(searchParams.get("units") ?? undefined) as "metric" | "imperial",
  }

  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENWEATHER_API_KEY" }, { status: 500 })
  }
  // Construire la query (lat/lon prioritaire sinon q=city)
  const baseParams = new URLSearchParams()
  baseParams.set("appid", apiKey)
  if (params.units) {
    baseParams.set("units", params.units)
  }
  if (params.lat && params.lon) {
    baseParams.set("lat", params.lat)
    baseParams.set("lon", params.lon)
  } else if (params.q) {
    baseParams.set("q", params.q)
  } else {
    // Fallback par défaut: Paris
    baseParams.set("q", "Paris")
  }

  const weatherUrl = `${BASE}/weather?${baseParams.toString()}`
  const forecastUrl = `${BASE}/forecast?${baseParams.toString()}`

  // Cache côté fetch pour éviter de spammer l’API (10 min)
  const [curRes, fcRes] = await Promise.all([
    fetch(weatherUrl, { next: { revalidate: 600 } }),
    fetch(forecastUrl, { next: { revalidate: 600 } }),
  ])

  if (!curRes.ok) {
    const txt = await curRes.text().catch(() => "")
    return NextResponse.json({ error: `weather fetch failed: ${txt}` }, { status: 502 })
  }
  if (!fcRes.ok) {
    const txt = await fcRes.text().catch(() => "")
    return NextResponse.json({ error: `forecast fetch failed: ${txt}` }, { status: 502 })
  }

  const current = await curRes.json()
  const forecast = await fcRes.json()

  // Simplification côté serveur : hourly (prochaines 24h ~ 8 pas de 3h) + daily (5 jours)
  type FItem = {
    dt: number
    main: { temp: number; temp_min: number; temp_max: number; humidity: number }
    weather: { main: string; description: string; icon: string }[]
    wind: { speed: number }
    dt_txt: string
  }

  const hourly = (forecast.list as FItem[]).slice(0, 8).map((it) => ({
    dt: it.dt,
    temp: it.main.temp,
    icon: it.weather?.[0]?.icon ?? "01d",
    main: it.weather?.[0]?.main ?? "",
    desc: it.weather?.[0]?.description ?? "",
  }))

  // Regroupement par jour pour min/max
  const byDay = new Map<string, { min: number; max: number; icon: string; count: Record<string, number> }>()
  for (const it of forecast.list as FItem[]) {
    const day = it.dt_txt.split(" ")[0] // YYYY-MM-DD
    const cur = byDay.get(day) ?? { min: it.main.temp_min, max: it.main.temp_max, icon: it.weather?.[0]?.icon ?? "01d", count: {} }
    cur.min = Math.min(cur.min, it.main.temp_min)
    cur.max = Math.max(cur.max, it.main.temp_max)
    const ic = it.weather?.[0]?.icon ?? "01d"
    cur.count[ic] = (cur.count[ic] ?? 0) + 1
    byDay.set(day, cur)
  }
  const allDays = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5)
    .map(([date, val]) => {
      const icon = Object.entries(val.count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? val.icon
      return { date, min: val.min, max: val.max, icon }
    })

  return NextResponse.json({
    units: params.units,
    current,
    hourly,
    daily: allDays,
  })
}