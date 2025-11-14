#!/usr/bin/env node

// Script de build personnalisé pour éviter les erreurs Prisma sur Vercel
const { execSync } = require('child_process');

try {
  // Générer le client Prisma
  console.log('🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Lancer le build Next.js
  console.log('🚀 Build Next.js...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build terminé avec succès !');
} catch (error) {
  console.error('❌ Erreur de build:', error.message);
  process.exit(1);
}
