import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';

export function useRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { supabase } = await import('@/lib/supabase');
      
      // Charger les favoris ET les likes avec is_favorite
      const { data: allFavorites } = await supabase
        .from('favorites')
        .select('media_id, media_type, is_favorite')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!allFavorites || allFavorites.length === 0) return [];

      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      // Prioriser les favoris marqués
      const priorityFavorites = allFavorites.filter(f => f.is_favorite).slice(0, 5);
      const regularFavorites = allFavorites.filter(f => !f.is_favorite).slice(0, 10);
      const toAnalyze = [...priorityFavorites, ...regularFavorites].slice(0, 10);

      // 1. Récupérer les détails des films favoris
      const detailsPromises = toAnalyze.map(async (fav) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/${fav.media_type}/${fav.media_id}?api_key=${API_KEY}&language=fr-FR`
          );
          return await response.json();
        } catch {
          return null;
        }
      });

      const details = (await Promise.all(detailsPromises)).filter(d => d !== null);
      
      // 2. Analyser les genres (avec comptage pour prioriser)
      const genreCount = new Map<number, number>();
      details.forEach(data => {
        (data.genres || []).forEach((genre: any) => {
          genreCount.set(genre.id, (genreCount.get(genre.id) || 0) + 1);
        });
      });
      
      // Trier les genres par fréquence et prendre les top 3
      const topGenres = Array.from(genreCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => id);

      // 3. Utiliser l'API de recommandations TMDB basée sur les films aimés
      const tmdbRecommendations: any[] = [];
      for (const fav of toAnalyze.slice(0, 3)) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/${fav.media_type}/${fav.media_id}/recommendations?api_key=${API_KEY}&language=fr-FR&page=1`
          );
          const data = await response.json();
          tmdbRecommendations.push(...(data.results || []).slice(0, 5));
        } catch {}
      }

      // 4. Découvrir des films par genres préférés (mixte films + séries)
      const genreDiscovery: any[] = [];
      for (const genreId of topGenres) {
        try {
          // Films
          const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=fr-FR&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
          );
          const moviesData = await moviesResponse.json();
          genreDiscovery.push(...(moviesData.results || []).slice(0, 3));

          // Séries
          const tvResponse = await fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=fr-FR&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=50&page=1`
          );
          const tvData = await tvResponse.json();
          const tvResults = (tvData.results || []).slice(0, 2).map((item: any) => ({
            ...item,
            media_type: 'tv'
          }));
          genreDiscovery.push(...tvResults);
        } catch {}
      }

      // 5. Combiner toutes les recommandations
      const allRecommendations = [...tmdbRecommendations, ...genreDiscovery];
      
      // 6. Créer un Set des IDs déjà aimés pour les exclure
      const likedIds = new Set(allFavorites.map(f => `${f.media_type}-${f.media_id}`));
      
      // 7. Filtrer et dédupliquer
      const uniqueRecs = Array.from(
        new Map(
          allRecommendations
            .filter(item => !likedIds.has(`${item.media_type || 'movie'}-${item.id}`))
            .filter(item => item.poster_path) // Seulement avec poster
            .map(item => [item.id, {
              ...item,
              media_type: item.media_type || 'movie'
            }])
        ).values()
      );

      // 8. Trier par note et popularité, mélanger pour diversifier
      const sorted = uniqueRecs
        .sort((a, b) => (b.vote_average * 0.7 + b.popularity * 0.3) - (a.vote_average * 0.7 + a.popularity * 0.3))
        .slice(0, 20);

      // 9. Mélanger pour éviter de toujours avoir le même ordre
      const shuffled = sorted
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      return shuffled.slice(0, 15);
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
