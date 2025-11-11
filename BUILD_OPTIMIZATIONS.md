# Optimisations de Build

## Problème
Le build Vercel se bloquait pendant la compilation.

## Solutions appliquées

### 1. Configuration Next.js (`next.config.ts`)
- ✅ Désactivé `reactStrictMode` (false) pour éviter les doubles rendus en dev
- ✅ Ajouté `recharts` aux packages optimisés
- ✅ Activé `swcMinify` pour une minification plus rapide
- ✅ Désactivé `poweredByHeader` pour réduire la taille

### 2. Scripts de Build (`package.json`)
- ✅ Augmenté la limite mémoire Node : `--max-old-space-size=4096`
- Permet d'éviter les erreurs "JavaScript heap out of memory"

### 3. Fichier `.vercelignore`
- ✅ Créé pour exclure les fichiers inutiles :
  - Fichiers Markdown (*.md)
  - Scripts SQL (*.sql)  
  - Fichiers de configuration IDE
  - Logs et caches

### 4. Optimisations existantes
- TypeScript : `ignoreBuildErrors: true`
- ESLint : `ignoreDuringBuilds: true`
- Images TMDB configurées

## Résultat attendu
- ⚡ Build plus rapide
- 💾 Moins de mémoire utilisée
- ✅ Pas de blocage pendant la compilation

## Commandes utiles

```bash
# Build local pour tester
npm run build

# Déploiement Vercel
vercel --prod
```

## Notes
- Le premier build peut prendre 2-3 minutes
- Les builds suivants seront plus rapides grâce au cache
