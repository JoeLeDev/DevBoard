"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, NotebookPen, Github, Newspaper, CloudSun, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

const items: NavItem[] = [
  { href: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/notes",  label: "Notes",     icon: NotebookPen },
  { href: "/dashboard/github", label: "GitHub",    icon: Github },
  { href: "/dashboard/news",   label: "News",      icon: Newspaper },
  { href: "/dashboard/weather",label: "Météo",     icon: CloudSun },
  { href: "/dashboard/settings",label:"Settings",  icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-background">
      <div className="h-14 px-4 flex items-center font-semibold">DevBoard</div>
      <ScrollArea className="flex-1">
        <nav className="px-2 py-2 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/60"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-3 text-xs text-muted-foreground">v0.1</div>
    </aside>
  )
}