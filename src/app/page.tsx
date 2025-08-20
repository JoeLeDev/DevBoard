import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthButton } from "@/components/AuthButton"
import { Github, Code, BarChart3, BookOpen } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">DevBoard</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse-glow"></div>
                <div className="relative bg-background border rounded-full p-6 shadow-lg">
                  <Code className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              DevBoard
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Votre tableau de bord développeur tout-en-un. Gérez vos projets, 
              analysez vos statistiques GitHub et organisez vos notes en un seul endroit.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animate-delay-100">
              <Github className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Statistiques GitHub</h3>
              <p className="text-muted-foreground text-sm">
                Analysez vos repositories, commits et langages de programmation
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animate-delay-200">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tableaux de bord</h3>
              <p className="text-muted-foreground text-sm">
                Visualisez vos données avec des graphiques interactifs
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up animate-delay-300">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notes & Organisation</h3>
              <p className="text-muted-foreground text-sm">
                Gardez vos idées et tâches organisées
              </p>
            </div>
          </div>

          {/* Login Section */}
          <div className="text-center animate-fade-in-up animate-delay-400">
            <div className="bg-card border rounded-xl p-8 shadow-lg max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Commencer</h2>
              <p className="text-muted-foreground mb-6">
                Connectez-vous avec votre compte GitHub pour accéder à toutes les fonctionnalités
              </p>
              <AuthButton />
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 text-sm text-muted-foreground animate-fade-in-up animate-delay-500">
            <p>Développé par <a href="https://github.com/Joeledev" className="text-primary hover:underline">Joeledev</a></p>
            <p>Vous avez des suggestions ? <a href="https://github.com/Joeledev/devboard/issues" className="text-primary hover:underline">Créez un ticket</a></p>

          </footer>
        </div>
      </main>
    </div>
  )
}