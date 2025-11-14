"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Save } from "lucide-react"

export default function SettingsClient({
  initialCity,
  initialUnits,
}: {
  initialCity: string
  initialUnits: "metric" | "imperial"
}) {
  const [city, setCity] = useState(initialCity)
  const [units, setUnits] = useState<"metric" | "imperial">(initialUnits)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/weather", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weatherCity: city.trim() || null, weatherUnits: units }),
      })
      if (!res.ok) throw new Error(await res.text())
      // Confort: sync localStorage pour que WeatherClient lise la même source
      localStorage.setItem("wx_units", units)
      if (city.trim()) localStorage.setItem("wx_city", city.trim())
      else localStorage.removeItem("wx_city")

      toast.success("Préférences enregistrées")
    } catch {
      toast.error("Impossible d'enregistrer")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-4 space-y-4 max-w-xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Ville par défaut</label>
        <Input
          placeholder="Paris"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Utilisée si la géolocalisation navigateur n’est pas disponible ou refusée.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Unités</label>
        <Select value={units} onValueChange={(v: "metric" | "imperial") => setUnits(v)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Choisir les unités" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">Celsius (m/s)</SelectItem>
            <SelectItem value="imperial">Fahrenheit (mph)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={save} disabled={saving} className="inline-flex items-center gap-2">
        <Save className="h-4 w-4" />
        <span>Enregistrer</span>
      </Button>
    </Card>
  )
}