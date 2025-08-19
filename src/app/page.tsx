import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthButton } from "@/components/AuthButton"

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">🚀 DevBoard</h1>
      <ThemeToggle />
      <AuthButton />
    </main>
  )
}