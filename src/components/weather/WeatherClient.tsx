"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, Thermometer, Droplets, Wind, Sunrise, Sunset } from "lucide-react"

type WeatherData = {
  units: "metric" | "imperial"
  current: any
  hourly: { dt: number; temp: number; icon: string; main: string; desc: string }[]
  daily: { date: string; min: number; max: number; icon: string }[]
}

export default function WeatherClient() {
  const [units, setUnits] = useState<"metric" | "imperial">(
    (typeof window !== "undefined" && (localStorage.getItem("wx_units") as "metric" | "imperial")) || "metric"
  )
  const [city, setCity] = useState<string>(() => (typeof window !== "undefined" && localStorage.getItem("wx_city")) || "")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem("wx_units", units)
  }, [units])

  function fmtTemp(n?: number) {
    if (typeof n !== "number") return "-"
    return `${Math.round(n)}°${units === "metric" ? "C" : "F"}`
  }
  function fmtWind(ms?: number) {
    if (typeof ms !== "number") return "-"
    return units === "metric" ? `${Math.round(ms)} m/s` : `${Math.round(ms)} mph`
  }
  function fmtTime(ts?: number) {
    if (!ts) return "-"
    const d = new Date(ts * 1000)
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }

  async function fetchWeatherByCoords(lat: number, lon: number) {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${units}`)
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as WeatherData
      setData(json)
    } catch (e: any) {
      setError("Erreur lors de la récupération météo.")
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeatherByCity(q: string) {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(q)}&units=${units}`)
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as WeatherData
      setData(json)
      localStorage.setItem("wx_city", q)
    } catch (e: any) {
      setError("Ville introuvable ou erreur réseau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Première tentative: ville sauvegardée, sinon géoloc navigateur, sinon Paris via API (fallback côté serveur)
    if (city) {
      fetchWeatherByCity(city)
      return
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeatherByCity("Paris"),
        { enableHighAccuracy: false, timeout: 5000 }
      )
    } else {
      fetchWeatherByCity("Paris")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]) // refetch si on change d'unités

  return (
    <div className="space-y-6">
      {/* Barre de contrôle */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <Input
              placeholder="Entrer une ville (ex: Paris)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && city.trim()) fetchWeatherByCity(city.trim())
              }}
              className="w-64"
            />
            <Button
              variant="secondary"
              onClick={() => city.trim() ? fetchWeatherByCity(city.trim()) : fetchWeatherByCity("Paris")}
            >
              Rechercher
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Select value={units} onValueChange={(v: "metric" | "imperial") => setUnits(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Unités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Celsius (m/s)</SelectItem>
                <SelectItem value="imperial">Fahrenheit (mph)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              if (data?.current?.coord?.lat && data?.current?.coord?.lon) {
                fetchWeatherByCoords(data.current.coord.lat, data.current.coord.lon)
              } else if (city) {
                fetchWeatherByCity(city)
              } else {
                fetchWeatherByCity("Paris")
              }
            }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* State */}
      {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Contenu */}
      {data && (
        <div className="space-y-4">
          {/* Carte actuelle */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xl font-semibold">
                  {data.current.name ?? "Localisation"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {data.current.weather?.[0]?.description ?? ""}
                </div>
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <Thermometer className="h-6 w-6" />
                  <span>{fmtTemp(data.current.main?.temp)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  <span>Humidité</span>
                  <Badge variant="secondary">{data.current.main?.humidity ?? "-"}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  <span>Vent</span>
                  <Badge variant="secondary">{fmtWind(data.current.wind?.speed)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Sunrise className="h-4 w-4" />
                  <span>Lever</span>
                  <Badge variant="secondary">{fmtTime(data.current.sys?.sunrise)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset className="h-4 w-4" />
                  <span>Coucher</span>
                  <Badge variant="secondary">{fmtTime(data.current.sys?.sunset)}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* 24 prochaines heures */}
          <Card className="p-4">
            <div className="font-semibold mb-3">Prochaines 24 h</div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {data.hourly.map((h) => (
                <div key={h.dt} className="border rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(h.dt * 1000).toLocaleTimeString(undefined, { hour: "2-digit" })}
                  </div>
                  <div className="text-sm font-medium">{fmtTemp(h.temp)}</div>
                  <div className="text-xs text-muted-foreground">{h.main}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* 5 jours */}
          <Card className="p-4">
            <div className="font-semibold mb-3">Prochains jours</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {data.daily.map((d) => (
                <div key={d.date} className="border rounded-lg p-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.date).toLocaleDateString(undefined, { weekday: "short", day: "2-digit" })}
                  </div>
                  <div className="text-sm font-medium">
                    {fmtTemp(d.max)} / {fmtTemp(d.min)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}