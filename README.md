# DevBoard 🚀

Un tableau de bord développeur tout-en-un pour gérer vos projets, analyser vos statistiques GitHub et organiser vos notes en un seul endroit.

## ✨ Fonctionnalités

- **🔐 Authentification GitHub** - Connexion sécurisée avec votre compte GitHub
- **📊 Statistiques GitHub** - Analysez vos repositories, commits et langages de programmation
- **🌤️ Météo** - Consultez la météo de votre ville avec des unités personnalisables
- **📰 Actualités** - Restez informé des dernières nouvelles
- **📝 Notes & Organisation** - Gérez vos idées et tâches avec un système de statuts
- **🎨 Interface moderne** - Design responsive avec thème sombre/clair
- **📱 PWA Ready** - Application web progressive pour une expérience native

## 🛠️ Technologies utilisées

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: NextAuth.js
- **Graphiques**: Recharts
- **Notifications**: Sonner
- **Icônes**: Lucide React

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- PostgreSQL
- Compte GitHub (pour l'authentification)

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Joeledev/devboard.git
   cd devboard
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   # Base de données
   DATABASE_URL="postgresql://username:password@localhost:5432/devboard"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # GitHub OAuth
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   
   # API Météo (optionnel)
   WEATHER_API_KEY="your-openweathermap-api-key"
   ```

4. **Configuration de la base de données**
   ```bash
   # Générer le client Prisma
   npx prisma generate
   
   # Appliquer les migrations
   npx prisma db push
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir l'application**
   
   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur "New OAuth App"
3. Remplissez les informations :
   - **Application name**: DevBoard
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copiez le Client ID et Client Secret dans votre `.env.local`

## 📁 Structure du projet

```
devboard/
├── src/
│   ├── app/                    # App Router Next.js
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Pages du tableau de bord
│   │   │   ├── github/        # Statistiques GitHub
│   │   │   ├── notes/         # Gestion des notes
│   │   │   ├── news/          # Actualités
│   │   │   ├── settings/      # Paramètres utilisateur
│   │   │   └── weather/       # Météo
│   │   ├── globals.css        # Styles globaux
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil
│   ├── components/            # Composants réutilisables
│   └── lib/                   # Utilitaires et configurations
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── migrations/            # Migrations Prisma
├── public/                    # Assets statiques
└── package.json
```

## 🎯 Fonctionnalités détaillées

### 📊 Dashboard GitHub
- Visualisation des repositories publics et privés
- Statistiques de commits par période
- Analyse des langages de programmation utilisés
- Graphiques interactifs avec Recharts

### 📝 Système de notes
- Création, édition et suppression de notes
- Statuts : TODO, IN_PROGRESS, DONE
- Organisation par utilisateur
- Interface intuitive

### 🌤️ Widget météo
- Affichage de la météo actuelle
- Choix de la ville dans les paramètres
- Unités métriques/impériales configurables
- Mise à jour automatique

### ⚙️ Paramètres utilisateur
- Personnalisation des préférences météo
- Gestion du profil utilisateur
- Thème sombre/clair

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déployez automatiquement à chaque push

### Autres plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Développeur

Développé avec ❤️ par [Joeledev](https://github.com/Joeledev)

## 🐛 Signaler un bug

Si vous rencontrez un bug, veuillez créer un ticket sur [GitHub Issues](https://github.com/Joeledev/devboard/issues).

## 📞 Support

Pour toute question ou suggestion, n'hésitez pas à :
- Créer un ticket sur GitHub
- Me contacter directement

---

**DevBoard** - Votre tableau de bord développeur tout-en-un 🚀
