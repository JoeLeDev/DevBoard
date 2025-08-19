import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthButton } from "@/components/AuthButton"
import Link from "next/link"

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold"> DevBoard</h1>
      <ThemeToggle />
      <AuthButton />
      <p className="text-blue-500"><Link href="/dashboard">Dashboard</Link></p>
    </main>
  )
}