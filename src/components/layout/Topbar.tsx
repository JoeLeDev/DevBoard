"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import Sidebar from "./Sidebar"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthButton } from "@/components/AuthButton"

export default function Topbar() {
  return (
    <header className="h-14 border-b bg-background flex items-center px-3 justify-between md:justify-end">
      {/* Bouton menu mobile */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger aria-label="Ouvrir le menu" className="inline-flex items-center p-2 border rounded">
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />
        <AuthButton />
      </div>
    </header>
  )
}