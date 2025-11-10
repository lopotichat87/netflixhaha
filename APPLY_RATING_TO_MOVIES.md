# Guide : Appliquer le système de notation aux pages films

Le fichier `app/movie/[id]/page.tsx` a été restauré à son état original.
Voici comment appliquer manuellement les modifications pour le système de notation.

## Étape 1 : Imports

Remplacez la ligne 8 :
```tsx
import { Play, Plus, ThumbsUp, Share2, Star, Calendar, Clock, Film, Users } from 'lucide-react';
```

Par :
```tsx
import { Share2, Star, Calendar, Clock, Film, Users, Eye, Heart, Bookmark } from 'lucide-react';
```

Remplacez les lignes 12-13 :
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';
```

Par :
```tsx
import { useAuth } from '@/contexts/AuthContext';
import { ratingsHelpers } from '@/lib/ratings';
import RatingModal from '@/components/RatingModal';
import RatingStars from '@/components/RatingStars';
```

## Étape 2 : State

Remplacez les lignes 25-27 :
```tsx
const [isLiked, setIsLiked] = useState(false);
const [isInList, setIsInList] = useState(false);
const [loading, setLoading] = useState(true);
```

Par :
```tsx
const [userRating, setUserRating] = useState<any>(null);
const [showRatingModal, setShowRatingModal] = useState(false);
const [loading, setLoading] = useState(true);
```

## Étape 3 : Charger le rating utilisateur

Après le premier `useEffect` (ligne ~64), ajoutez :
```tsx
useEffect(() => {
  const loadUserRating = async () => {
    if (!user) return;
    
    try {
      const rating = await ratingsHelpers.getUserRating(user.id, movieId, 'movie');
      setUserRating(rating);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  loadUserRating();
}, [user, movieId]);
```

## Étape 4 : Handlers

Remplacez les fonctions `checkFavorite` et `toggleFavorite` (lignes ~66-108) par :
```tsx
const handleLikeClick = () => {
  if (!user) {
    alert('Connectez-vous pour aimer ce film');
    return;
  }
  setShowRatingModal(true);
};

const handleWatchedClick = async () => {
  if (!user) {
    alert('Connectez-vous pour marquer comme vu');
    return;
  }
  
  if (!movie) return;

  try {
    const newWatchedState = !userRating?.is_watched;
    await ratingsHelpers.toggleWatched(
      user.id,
      movieId,
      'movie',
      movie.title,
      movie.poster_path,
      newWatchedState
    );
    
    const updated = await ratingsHelpers.getUserRating(user.id, movieId, 'movie');
    setUserRating(updated);
  } catch (error) {
    console.error('Error toggling watched:', error);
  }
};
```

## Étape 5 : Boutons (ligne ~163-188)

Remplacez la section des boutons par :
```tsx
<div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
  <button 
    onClick={handleLikeClick}
    className={`flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded font-semibold transition text-sm md:text-base ${
      userRating?.is_liked 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
    }`}
  >
    <Heart size={20} className="md:w-6 md:h-6" fill={userRating?.is_liked ? 'currentColor' : 'none'} />
    <span>{userRating?.is_liked ? 'Aimé' : 'J\'aime'}</span>
  </button>

  <button 
    onClick={handleWatchedClick}
    className={`flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded font-semibold transition text-sm md:text-base ${
      userRating?.is_watched 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
    }`}
  >
    <Eye size={20} className="md:w-6 md:h-6" />
    <span>{userRating?.is_watched ? 'Vu' : 'Marquer comme vu'}</span>
  </button>

  <AddToListButton
    mediaId={movieId}
    mediaType="movie"
    title={movie.title}
    posterPath={movie.poster_path}
  />

  {userRating?.rating && (
    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 rounded">
      <Star size={16} className="text-yellow-400" fill="currentColor" />
      <span className="text-sm font-semibold">{userRating.rating.toFixed(1)}</span>
    </div>
  )}
</div>
```

## Étape 6 : Modal (avant la fermeture finale du return)

Juste avant `</div>` final (ligne ~419), ajoutez :
```tsx
      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        mediaId={movieId}
        mediaType="movie"
        mediaTitle={movie.title}
        mediaPoster={movie.poster_path}
        onSuccess={async () => {
          const updated = await ratingsHelpers.getUserRating(user!.id, movieId, 'movie');
          setUserRating(updated);
        }}
      />
```

## Résultat

Après ces modifications :
- ✅ Bouton "J'aime" ouvre la modal de notation
- ✅ Bouton "Vu" marque comme visionné
- ✅ Affiche la note de l'utilisateur si elle existe
- ✅ Modal complète avec étoiles, critique, date

## Appliquer aux séries

Pour appliquer les mêmes modifications à `/app/tv/[id]/page.tsx`, suivez les mêmes étapes en remplaçant :
- `'movie'` par `'tv'`
- `movieId` par `tvId`
- `movie.title` par `getTitle(tvShow)`
