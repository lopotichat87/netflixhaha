import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';

export function useRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const favorites = await favoritesHelpers.getFavorites(user.id);
      if (favorites.length === 0) return [];

      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      const detailsPromises = favorites.slice(0, 3).map(async (fav) => {
        const url = `https://api.themoviedb.org/3/${fav.media_type}/${fav.media_id}?api_key=${API_KEY}&language=fr-FR`;
        const response = await fetch(url);
        return response.json();
      });

      const details = await Promise.all(detailsPromises);
      const genreIds = new Set<number>();
      details.forEach(data => {
        (data.genres || []).slice(0, 2).forEach((genre: any) => genreIds.add(genre.id));
      });

      const genreArray = Array.from(genreIds).slice(0, 2);
      
      const recommendationsPromises = genreArray.map(async (genreId) => {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=fr-FR&with_genres=${genreId}&sort_by=popularity.desc&page=1`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results.slice(0, 5);
      });

      const allRecommendations = await Promise.all(recommendationsPromises);
      
      const uniqueRecs = Array.from(
        new Map(allRecommendations.flat().map(item => [item.id, item])).values()
      ).slice(0, 10);

      return uniqueRecs;
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
