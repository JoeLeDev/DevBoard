"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Note, NoteStatus } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectTrigger, SelectContent, SelectValue, SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  async function createNote() {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Requête invalide")
      return
    }
    setTitle(""); setContent("")
    router.refresh()
    toast.success("Note créée")
  }

  async function updateStatus(id: number, status: NoteStatus) {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      toast.error("Impossible de changer le statut")
      return
    }
    router.refresh()
  }

  async function deleteNote(id: number) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Erreur suppression")
      return
    }
    router.refresh()
    toast.success("Note supprimée")
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-3">
        <h2 className="font-semibold">Créer une note</h2>
        <Input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea placeholder="Contenu (optionnel)" value={content} onChange={e => setContent(e.target.value)} />
        <Button onClick={createNote} disabled={!title.trim()}>Enregistrer</Button>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {notes.map(n => (
          <Card key={n.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{n.title}</h3>
              <Badge variant="secondary">{n.status}</Badge>
            </div>
            {n.content && <p className="text-sm opacity-80">{n.content}</p>}

            <div className="flex items-center gap-2">
              <Select
                defaultValue={n.status}
                onValueChange={(v) => updateStatus(n.id, v as NoteStatus)}
              >
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">TODO</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="DONE">DONE</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={() => deleteNote(n.id)}>Supprimer</Button>
            </div>
          </Card>
        ))}
        {notes.length === 0 && <p>Aucune note pour l’instant.</p>}
      </div>
    </div>
  )
}