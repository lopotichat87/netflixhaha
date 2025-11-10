# 🔧 Guide de Dépannage - Films ne s'affichent pas

## ✅ Solutions Rapides

### 1. **Redémarrer le Serveur**

Le plus souvent, un simple redémarrage résout le problème :

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis relancer :
npm run dev
```

### 2. **Vérifier la Console du Navigateur**

1. Ouvrez votre navigateur sur `http://localhost:3000`
2. Appuyez sur `F12` ou `Cmd+Option+I` (Mac)
3. Allez dans l'onglet **Console**
4. Cherchez les erreurs en rouge

**Erreurs courantes et solutions :**

#### ❌ "relation ratings does not exist"
**Cause** : La table `ratings` n'existe pas dans Supabase  
**Solution** : Appliquez la migration SQL

```sql
-- Connectez-vous à Supabase Dashboard
-- SQL Editor → Copiez tout le contenu de supabase/migration.sql
-- Exécutez le script
```

#### ❌ "Failed to fetch"
**Cause** : Problème avec l'API TMDB  
**Solution** : Vérifiez votre clé API dans `.env.local`

```bash
# Vérifier si la clé existe
cat .env.local | grep TMDB
```

#### ❌ "Cannot read property of undefined"
**Cause** : Données mal formées  
**Solution** : Le composant est maintenant plus robuste, redémarrez

### 3. **Vérifier que le Serveur Démarre**

```bash
# Vérifier si le port 3000 est occupé
lsof -i :3000

# Tuer le processus si besoin
kill -9 [PID]

# Relancer
npm run dev
```

### 4. **Vérifier les Variables d'Environnement**

Votre fichier `.env.local` doit contenir :

```env
NEXT_PUBLIC_TMDB_API_KEY=votre_cle_ici
NEXT_PUBLIC_SUPABASE_URL=votre_url_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_ici
```

**Test rapide :**
```bash
# Afficher les variables (masquées)
cat .env.local
```

### 5. **Nettoyer le Cache Next.js**

```bash
# Supprimer le dossier .next
rm -rf .next

# Réinstaller les dépendances
npm install

# Relancer
npm run dev
```

---

## 🔍 Diagnostic Complet

### Étape 1 : Vérifier l'API TMDB

Testez directement l'API :

```bash
curl "https://api.themoviedb.org/3/trending/all/week?api_key=VOTRE_CLE&language=fr-FR"
```

Si ça retourne des films, votre clé API est bonne.

### Étape 2 : Vérifier Supabase

1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Table Editor → Vérifiez que ces tables existent :
   - `ratings`
   - `user_profiles`
   - `user_lists`
   - `list_items`

**Si elles n'existent pas :** Appliquez `supabase/migration.sql`

### Étape 3 : Vérifier les Logs du Serveur

Dans le terminal où vous avez lancé `npm run dev`, regardez :

```
✓ Ready in 3.2s
○ Compiling / ...
✓ Compiled / in 1.5s
```

**Si vous voyez des erreurs :**
- TypeScript errors → Lisez l'erreur
- Module not found → `npm install`
- Syntax error → Vérifiez le fichier mentionné

### Étape 4 : Mode Débogage

Ajoutez des `console.log` dans `MovieCard.tsx` :

```tsx
export default function MovieCard({ media }: { media: Media }) {
  console.log('🎬 Rendering MovieCard:', media.title || media.name);
  
  // ... reste du code
}
```

Si vous ne voyez pas ces logs dans la console, le problème est plus haut (page ou API).

---

## 🚨 Problèmes Spécifiques

### Problème : Page blanche

**Causes possibles :**
1. Erreur JavaScript fatale
2. Problème de compilation
3. Route inexistante

**Solution :**
```bash
# Ouvrir la console du navigateur
# Lire l'erreur exacte
# Corriger le fichier mentionné
```

### Problème : Loading infini

**Causes possibles :**
1. API TMDB ne répond pas
2. Clé API invalide
3. Quota API dépassé

**Solution :**
```bash
# Tester l'API directement
curl "https://api.themoviedb.org/3/trending/all/week?api_key=VOTRE_CLE"

# Si erreur 401 → Clé invalide
# Si erreur 429 → Quota dépassé (attendez 10 secondes)
```

### Problème : Films en double ou manquants

**Causes possibles :**
1. Cache du navigateur
2. Données mal filtrées

**Solution :**
```bash
# Vider le cache du navigateur
# Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
```

---

## 🔧 Modifications Récentes

J'ai rendu le composant `MovieCard.tsx` plus robuste :

✅ **Avant** : Crash si table `ratings` n'existe pas  
✅ **Après** : Affiche les films même sans Supabase configuré

Le composant gère maintenant gracieusement :
- Absence de table `ratings`
- Absence de table `favorites`
- Utilisateur non connecté
- Erreurs réseau

---

## 📝 Checklist de Vérification

Cochez au fur et à mesure :

- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Port 3000 accessible (`http://localhost:3000`)
- [ ] Pas d'erreur dans le terminal
- [ ] Pas d'erreur dans la console navigateur
- [ ] Variables d'environnement configurées
- [ ] Clé API TMDB valide
- [ ] Migration Supabase appliquée (optionnel pour voir les films)

---

## 💡 Test Minimal

Pour tester si c'est juste un problème Supabase :

1. **Déconnectez-vous** de l'application
2. **Actualisez** la page d'accueil
3. Les films devraient s'afficher (sans badges)

Si ça marche déconnecté mais pas connecté :
→ Problème Supabase → Appliquez la migration

Si ça ne marche ni connecté ni déconnecté :
→ Problème API TMDB → Vérifiez la clé

---

## 🆘 Besoin d'Aide ?

### Informations à fournir :

1. **Message d'erreur exact** (console navigateur)
2. **Logs du terminal** (où tourne `npm run dev`)
3. **Étapes pour reproduire** le problème
4. **Ce qui s'affiche** (page blanche, loading, etc.)

### Commandes de diagnostic :

```bash
# Version Node
node --version

# Version npm
npm --version

# État du serveur
ps aux | grep "next dev"

# Fichiers modifiés récemment
git status
```

---

## ✅ Solution Temporaire

Si rien ne fonctionne, revenez à une version simple de `MovieCard.tsx` :

```bash
# Sauvegarder la version actuelle
cp components/MovieCard.tsx components/MovieCard.backup.tsx

# Option : Utilisez git pour revenir en arrière
git checkout HEAD~1 components/MovieCard.tsx

# Redémarrer
npm run dev
```

**Note** : Cela supprimera les nouveaux badges mais les films s'afficheront.

---

## 🎯 Résumé

**Dans 90% des cas, la solution est :**

1. ✅ Redémarrer le serveur (`Ctrl+C` puis `npm run dev`)
2. ✅ Vider le cache du navigateur (`Cmd+Shift+R`)
3. ✅ Vérifier la console pour les erreurs

**Le composant est maintenant robuste et devrait afficher les films même si Supabase n'est pas configuré.**
