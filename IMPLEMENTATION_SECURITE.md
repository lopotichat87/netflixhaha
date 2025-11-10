# Guide d'Implémentation de la Sécurité

## Pages à Protéger

### 1. Page /likes

```tsx
// app/likes/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LikesPage() {
  return (
    <ProtectedRoute showLockScreen={true}>
      {/* Contenu de la page likes */}
    </ProtectedRoute>
  );
}
```

### 2. Page /my-lists

```tsx
// app/my-lists/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyListsPage() {
  return (
    <ProtectedRoute>
      {/* Contenu de la page */}
    </ProtectedRoute>
  );
}
```

### 3. Page /settings

```tsx
// app/settings/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      {/* Paramètres utilisateur */}
    </ProtectedRoute>
  );
}
```

### 4. Page /watched

```tsx
// app/watched/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function WatchedPage() {
  return (
    <ProtectedRoute showLockScreen={true}>
      {/* Films vus */}
    </ProtectedRoute>
  );
}
```

## Actions à Protéger

### 1. Bouton Like/Favorite (Pages Films/Séries)

```tsx
// Dans MovieDetailPage ou TVShowPage
import AuthRequired from '@/components/AuthRequired';

// Au lieu de:
<button onClick={handleLike}>
  <Heart />
</button>

// Utiliser:
<AuthRequired action="liker ce film">
  <button onClick={handleLike}>
    <Heart />
  </button>
</AuthRequired>
```

### 2. Bouton Noter

```tsx
<AuthRequired action="noter ce film">
  <button onClick={() => setShowRatingModal(true)}>
    <Star /> Noter
  </button>
</AuthRequired>
```

### 3. Section Commentaires

```tsx
// Dans Comments.tsx
import { useAuth } from '@/contexts/AuthContext';

export default function Comments() {
  const { user } = useAuth();
  
  return (
    <div>
      {/* Afficher les commentaires (public) */}
      <CommentsList />
      
      {/* Formulaire uniquement si connecté */}
      {user ? (
        <CommentForm />
      ) : (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
          <Lock size={48} className="mx-auto mb-4 text-purple-400" />
          <p className="mb-4">Connectez-vous pour laisser un avis</p>
          <Link href="/auth/login">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              Se connecter
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
```

### 4. Bouton Ajouter à une Liste

```tsx
<AuthRequired action="ajouter à une liste">
  <AddToListButton mediaId={id} mediaType="movie" />
</AuthRequired>
```

### 5. Bouton Follow/Unfollow (Profils)

```tsx
// Dans ProfilePage
{!isOwnProfile && (
  <AuthRequired action="suivre cet utilisateur">
    <button onClick={handleFollow}>
      {isFollowing ? 'Ne plus suivre' : 'Suivre'}
    </button>
  </AuthRequired>
)}
```

## Vérifications dans le Code

### Check si Propriétaire

```tsx
const { user } = useAuth();
const isOwner = user?.id === profileData.user_id;

// N'afficher les boutons d'édition que si propriétaire
{isOwner && (
  <button onClick={editProfile}>
    Modifier le profil
  </button>
)}
```

### Check avant Action

```tsx
const handleLike = async () => {
  if (!user) {
    router.push('/auth/login');
    return;
  }
  
  // Effectuer l'action
  await likeMovie(movieId);
};
```

### Loading State

```tsx
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  return <LoginRequired />;
}

return <ProtectedContent />;
```

## Navbar - Adaptation selon Auth

```tsx
// components/Navbar.tsx
const { user } = useAuth();

{user ? (
  <>
    <Link href="/likes">Mes Likes</Link>
    <Link href="/my-lists">Mes Listes</Link>
    <Link href="/profile">Mon Profil</Link>
  </>
) : (
  <>
    <Link href="/auth/login">Connexion</Link>
    <Link href="/auth/register">Inscription</Link>
  </>
)}
```

## Messages d'Erreur Personnalisés

### Par Type d'Action

```tsx
const authMessages = {
  like: "liker des films",
  comment: "laisser des commentaires",
  rate: "noter des films",
  list: "créer des listes",
  follow: "suivre des utilisateurs"
};

<AuthRequired action={authMessages[actionType]}>
  {children}
</AuthRequired>
```

## Pages Auth - Redirect si Connecté

```tsx
// app/auth/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner />;
  if (user) return null; // Redirige déjà

  return <LoginForm />;
}
```

## Récapitulatif Actions

| Action | Page | Protection | Comportement |
|--------|------|-----------|-------------|
| Voir catalogue | `/movies`, `/tv-shows` | ❌ Aucune | Public |
| Voir détails | `/movie/[id]` | ❌ Aucune | Public |
| Noter | `/movie/[id]` | ✅ Auth | Overlay connexion |
| Commenter | `/movie/[id]` | ✅ Auth | Overlay connexion |
| Liker | `/movie/[id]` | ✅ Auth | Overlay connexion |
| Voir profil | `/profile/[user]` | ❌ Aucune | Public |
| Éditer profil | `/profile/[user]/edit` | ✅ Auth + Owner | Redirect |
| Voir mes likes | `/likes` | ✅ Auth | Lock screen |
| Créer liste | `/my-lists` | ✅ Auth | Lock screen |
| Paramètres | `/settings` | ✅ Auth | Lock screen |

## Checklist Implémentation

- [ ] Installer `<ProtectedRoute>` sur pages privées
- [ ] Wrapper actions sensibles avec `<AuthRequired>`
- [ ] Vérifier `isOwner` avant édition
- [ ] Ajouter redirects dans pages auth si connecté
- [ ] Adapter Navbar selon état auth
- [ ] Messages clairs "Connexion requise"
- [ ] Loading states partout
- [ ] Tester en mode non connecté
- [ ] Tester en mode connecté
- [ ] Tester édition profil autre user
- [ ] Vérifier RLS Supabase
