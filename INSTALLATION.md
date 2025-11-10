# Installation et Configuration - Système de Notation Letterboxd

## 📋 Étape 1 : Exécuter la Migration SQL

Connectez-vous à votre dashboard Supabase et exécutez le fichier SQL :

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez le contenu de `supabase/migration.sql`
5. Cliquez sur **Run**

Cette migration va :
- ✅ Supprimer les anciennes tables (user_history, user_favorites, etc.)
- ✅ Créer les nouvelles tables (ratings, user_profiles, user_lists, etc.)
- ✅ Configurer les Row Level Security (RLS)
- ✅ Créer les vues et triggers automatiques

## 🎯 Fonctionnalités Implémentées

### 1. Système de Notation ⭐
- Notes sur 5 étoiles (avec demi-étoiles)
- Composant `RatingStars` interactif
- Modal `RatingModal` pour noter et critiquer

### 2. Boutons Fonctionnels

**Bouton "J'aime" ❤️**
- Ouvre une modal pour noter et commenter
- Sauvegarde dans la table `ratings`
- Affiche l'état (aimé/pas aimé)

**Bouton "Vu" 👁️**
- Marque comme visionné
- Enregistre la date de visionnage
- Toggle on/off

### 3. Page Publique `/reviews`
- Affiche toutes les notes et critiques de la communauté
- Filtre : Toutes les notes / Avec critiques
- Informations utilisateur avec avatar
- Badges : J'aime, Vu, Revu, Date

### 4. Helpers Supabase (`lib/ratings.ts`)
- `upsertRating()` - Créer/modifier une note
- `toggleLike()` - Gérer les likes
- `toggleWatched()` - Marquer comme vu
- `setRating()` - Définir une note
- `setReview()` - Ajouter une critique
- `getUserRating()` - Récupérer la note d'un utilisateur
- `getRecentRatings()` - Notes récentes (page publique)
- `getRecentReviews()` - Critiques récentes
- `getMediaRatings()` - Notes d'un média
- `getUserRatings()` - Notes d'un utilisateur
- `getMediaStats()` - Statistiques d'un média

## 📁 Fichiers Créés

```
supabase/
└── migration.sql              # Migration SQL complète

lib/
└── ratings.ts                 # Helpers pour ratings et reviews

components/
├── RatingStars.tsx           # Composant étoiles interactif
└── RatingModal.tsx           # Modal de notation

app/
└── reviews/
    └── page.tsx              # Page publique des notes/critiques
```

## 🔧 Utilisation

### Dans une page de film/série

```tsx
import { ratingsHelpers } from '@/lib/ratings';
import RatingModal from '@/components/RatingModal';
import RatingStars from '@/components/RatingStars';

// Charger la note de l'utilisateur
const [userRating, setUserRating] = useState(null);

useEffect(() => {
  const loadRating = async () => {
    const rating = await ratingsHelpers.getUserRating(user.id, mediaId, 'movie');
    setUserRating(rating);
  };
  loadRating();
}, [user, mediaId]);

// Bouton J'aime
<button onClick={() => setShowRatingModal(true)}>
  <Heart fill={userRating?.is_liked ? 'currentColor' : 'none'} />
  J'aime
</button>

// Bouton Vu
<button onClick={async () => {
  await ratingsHelpers.toggleWatched(user.id, mediaId, 'movie', title, poster, !userRating?.is_watched);
}}>
  <Eye />
  {userRating?.is_watched ? 'Vu' : 'Marquer comme vu'}
</button>

// Modal
<RatingModal
  isOpen={showRatingModal}
  onClose={() => setShowRatingModal(false)}
  mediaId={mediaId}
  mediaType="movie"
  mediaTitle={title}
  mediaPoster={poster}
  onSuccess={() => {
    // Recharger la note
  }}
/>
```

## 🗄️ Structure de la Base de Données

### Table `ratings`
```sql
- id (BIGSERIAL)
- user_id (UUID)
- media_id (INTEGER)
- media_type ('movie' | 'tv')
- media_title (VARCHAR)
- media_poster (TEXT)
- rating (DECIMAL 0-5)
- review (TEXT)
- watched_date (DATE)
- is_rewatch (BOOLEAN)
- is_liked (BOOLEAN)
- is_watched (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `user_profiles`
```sql
- id (UUID)
- username (VARCHAR)
- display_name (VARCHAR)
- bio (TEXT)
- avatar_url (TEXT)
- location (VARCHAR)
- website (VARCHAR)
- is_public (BOOLEAN)
```

### Table `user_lists`
```sql
- id (BIGSERIAL)
- user_id (UUID)
- name (VARCHAR)
- description (TEXT)
- is_public (BOOLEAN)
- is_ranked (BOOLEAN)
```

### Table `list_items`
```sql
- id (BIGSERIAL)
- list_id (BIGINT)
- media_id (INTEGER)
- media_type ('movie' | 'tv')
- media_title (VARCHAR)
- media_poster (TEXT)
- rank_order (INTEGER)
- notes (TEXT)
```

## 🚀 Navigation

La page "Activité" a été ajoutée au menu :
- **Desktop** : Menu "Contenu" → "Activité"
- **URL** : `/reviews`

## ✅ Tests

1. **Tester le bouton J'aime**
   - Cliquez sur "J'aime" sur une page film
   - La modal s'ouvre
   - Ajoutez une note et/ou critique
   - Enregistrez
   - Vérifiez que le bouton devient rouge "Aimé"

2. **Tester le bouton Vu**
   - Cliquez sur "Marquer comme vu"
   - Le bouton devient bleu "Vu"
   - Re-cliquez pour retirer

3. **Tester la page Activité**
   - Allez sur `/reviews`
   - Vérifiez que vos notes apparaissent
   - Testez le filtre "Avec critiques"

## 🔐 Sécurité (RLS)

Toutes les tables ont Row Level Security activé :
- ✅ Tout le monde peut voir les ratings publics
- ✅ Seul le propriétaire peut modifier/supprimer ses ratings
- ✅ Les profils publics sont visibles par tous
- ✅ Les listes privées ne sont visibles que par le propriétaire

## 📊 Prochaines Étapes

1. **Appliquer aux pages séries** (`/tv/[id]`)
2. **Statistiques utilisateur** avancées
3. **Système de suivi** (followers/following)
4. **Feed d'activité** des amis
5. **Journal de visionnage** avec calendrier
6. **Profils publics** utilisateurs

## 🐛 Dépannage

### Erreur "relation does not exist"
→ Exécutez la migration SQL dans Supabase

### Erreur "RLS policy violation"
→ Vérifiez que vous êtes connecté avec un compte valide

### Les notes ne s'affichent pas
→ Vérifiez que la vue `recent_ratings` existe dans Supabase

### Modal ne s'ouvre pas
→ Vérifiez la console pour les erreurs d'import

## 📝 Notes

- Le système utilise TMDB ID pour identifier les médias
- Les notes sont sur 5 étoiles (0.5 à 5.0)
- Les critiques sont optionnelles
- La date de visionnage est automatiquement la date du jour
- Un utilisateur ne peut noter qu'une fois par média (upsert)
