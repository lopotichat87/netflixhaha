# Sécurité et Restrictions d'Accès

## Pages Protégées (Authentification Requise)

### 1. Pages Personnelles
- `/likes` - Mes likes
- `/my-lists` - Mes listes
- `/reviews` - Mes critiques
- `/stats` - Mes statistiques
- `/watched` - Films vus
- `/settings` - Paramètres du compte

**Protection:** Redirection automatique vers `/auth/login` si non connecté

### 2. Pages Profil (Accès Mixte)
- `/profile/[username]` - Profil public (lecture pour tous, édition propriétaire uniquement)
- `/profile/[username]/edit` - Édition profil (propriétaire uniquement)

**Protection:** Lecture publique, modification restreinte

### 3. Actions Protégées sur Pages Publiques

#### Films/Séries (`/movie/[id]`, `/tv/[id]`)
**Actions réservées aux utilisateurs connectés:**
- ⭐ Noter le film
- 💬 Laisser une critique
- ❤️ Ajouter aux likes
- 📝 Ajouter à une liste
- 👁️ Marquer comme vu

**Comportement:** Overlay "Connexion requise" sur les boutons

#### Page d'activité (`/activity`)
- **Lecture:** Publique (tout le monde peut voir)
- **Interactions:** Réservées (like, commentaire)

## Pages Publiques (Accès Libre)

### Sans Restriction
- `/` - Page d'accueil
- `/landing` - Landing page
- `/movies` - Catalogue films
- `/tv-shows` - Catalogue séries
- `/search` - Recherche
- `/movie/[id]` - Détail film (lecture)
- `/tv/[id]` - Détail série (lecture)
- `/person/[id]` - Acteur/réalisateur
- `/genre/[genre]` - Films par genre
- `/activity` - Fil d'activité (lecture)

### Pages Authentification
- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/auth/forgot-password` - Mot de passe oublié

**Comportement:** Redirection vers `/` si déjà connecté

## Niveaux de Sécurité

### Niveau 1: Public Total
- Accessible à tous
- Pas de restrictions
- Exemples: Catalogue, recherche, détails films

### Niveau 2: Public avec Actions Limitées
- Lecture publique
- Actions réservées aux connectés
- Overlay "Connexion requise" sur actions
- Exemples: Noter, commenter

### Niveau 3: Semi-Privé
- Lecture publique
- Édition propriétaire uniquement
- Exemples: Pages profil

### Niveau 4: Privé
- Connexion obligatoire
- Redirection automatique si non connecté
- Exemples: /likes, /my-lists, /settings

## Composants de Sécurité

### `<ProtectedRoute>`
Protège une page entière
```tsx
<ProtectedRoute showLockScreen={true}>
  <MyPrivatePage />
</ProtectedRoute>
```

### `<AuthRequired>`
Protège un composant ou une action
```tsx
<AuthRequired action="liker ce film">
  <LikeButton />
</AuthRequired>
```

## RLS Supabase (Row Level Security)

### Tables avec Accès Public (SELECT)
- `profiles` - Profils publics
- `favorites` - Likes/favoris publics
- `reviews` - Critiques publiques
- `user_lists` (si is_public = true)
- `activities` - Activités publiques

### Tables avec Accès Restreint
- `ratings` - Notes personnelles
- `user_follows` - Follows privés
- `user_lists` (si is_public = false)

### Policies Standards
- **SELECT:** Public ou owner
- **INSERT:** Owner uniquement
- **UPDATE:** Owner uniquement
- **DELETE:** Owner uniquement

## Vérifications Côté Client

### useAuth Hook
```tsx
const { user, loading } = useAuth();

if (loading) return <Loading />;
if (!user) return <LoginRequired />;
```

### Vérification Propriétaire
```tsx
const isOwner = user?.id === profileData.user_id;
if (!isOwner) return <Forbidden />;
```

## Bonnes Pratiques

1. ✅ Toujours vérifier `loading` avant `user`
2. ✅ Afficher un feedback clair ("Connexion requise")
3. ✅ Proposer un bouton "Se connecter" visible
4. ✅ Sauvegarder l'URL de destination pour redirect après login
5. ✅ Désactiver les boutons au lieu de les cacher (meilleure UX)
6. ✅ Messages d'erreur clairs et utiles
7. ✅ Policies RLS strictes côté serveur
8. ✅ Validation côté client ET serveur

## États d'Erreur

### 401 Unauthorized
- Utilisateur non authentifié
- Redirection vers `/auth/login`

### 403 Forbidden
- Utilisateur authentifié mais pas autorisé
- Message: "Vous n'êtes pas autorisé à effectuer cette action"

### 404 Not Found
- Ressource inexistante
- Message: "Page ou ressource introuvable"
