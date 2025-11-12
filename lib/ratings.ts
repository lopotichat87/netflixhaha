import { supabase } from './supabase';

export interface Rating {
  id: number;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  media_title: string;
  media_poster: string | null;
  rating: number | null;
  review: string | null;
  watched_date: string | null;
  is_rewatch: boolean;
  is_liked: boolean;
  is_watched: boolean;
  created_at: string;
  updated_at: string;
}

export interface RatingWithUser extends Rating {
  username: string;
  display_name: string;
  avatar_url: string;
}

export const ratingsHelpers = {
  // Créer ou mettre à jour un rating
  async upsertRating(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    data: {
      rating?: number | null;
      review?: string | null;
      watched_date?: string | null;
      is_rewatch?: boolean;
      is_liked?: boolean;
      is_watched?: boolean;
    }
  ) {
    const { data: result, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        media_id: mediaId,
        media_type: mediaType,
        media_title: mediaTitle,
        media_poster: mediaPoster,
        ...data,
      }, {
        onConflict: 'user_id,media_id,media_type'
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Marquer comme "J'aime" (sans affecter les favoris)
  async toggleLike(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    isLiked: boolean
  ) {
    // Mise à jour uniquement de l'état is_liked dans la table ratings
    // sans toucher à la table favorites
    const { data, error } = await supabase.rpc('update_rating_like', {
      p_user_id: userId,
      p_media_id: mediaId,
      p_media_type: mediaType,
      p_media_title: mediaTitle,
      p_media_poster: mediaPoster,
      p_is_liked: isLiked
    });

    if (error) throw error;
    return data;
  },

  // Marquer comme "Vu"
  async toggleWatched(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    isWatched: boolean,
    watchedDate?: string
  ) {
    return this.upsertRating(userId, mediaId, mediaType, mediaTitle, mediaPoster, {
      is_watched: isWatched,
      watched_date: watchedDate || new Date().toISOString().split('T')[0],
    });
  },

  // Ajouter/Modifier une note
  async setRating(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    rating: number
  ) {
    return this.upsertRating(userId, mediaId, mediaType, mediaTitle, mediaPoster, {
      rating,
      is_watched: true,
      watched_date: new Date().toISOString().split('T')[0],
    });
  },

  // Ajouter/Modifier une review
  async setReview(
    userId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    mediaTitle: string,
    mediaPoster: string | null,
    review: string,
    rating?: number
  ) {
    return this.upsertRating(userId, mediaId, mediaType, mediaTitle, mediaPoster, {
      review,
      rating,
      is_watched: true,
      watched_date: new Date().toISOString().split('T')[0],
    });
  },

  // Récupérer le rating d'un utilisateur pour un média
  async getUserRating(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Récupérer tous les ratings récents (page publique)
  async getRecentRatings(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('recent_ratings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as RatingWithUser[];
  },

  // Récupérer les reviews récentes
  async getRecentReviews(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('recent_ratings')
      .select('*')
      .not('review', 'is', null)
      .neq('review', '')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as RatingWithUser[];
  },

  // Récupérer les ratings d'un média
  async getMediaRatings(mediaId: number, mediaType: 'movie' | 'tv', limit = 20) {
    const { data, error } = await supabase
      .from('recent_ratings')
      .select('*')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as RatingWithUser[];
  },

  // Récupérer les ratings d'un utilisateur
  async getUserRatings(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as Rating[];
  },

  // Récupérer les likes d'un utilisateur
  async getUserLikes(userId: string) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_liked', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Rating[];
  },

  // Récupérer les films/séries vus
  async getUserWatched(userId: string) {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_watched', true)
      .order('watched_date', { ascending: false });

    if (error) throw error;
    return data as Rating[];
  },

  // Supprimer un rating
  async deleteRating(userId: string, mediaId: number, mediaType: 'movie' | 'tv') {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (error) throw error;
  },

  // Statistiques d'un média
  async getMediaStats(mediaId: number, mediaType: 'movie' | 'tv') {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating, is_liked, is_watched')
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (error) throw error;

    const stats = {
      total_ratings: data.filter(r => r.rating !== null).length,
      average_rating: 0,
      total_likes: data.filter(r => r.is_liked).length,
      total_watched: data.filter(r => r.is_watched).length,
    };

    if (stats.total_ratings > 0) {
      const sum = data.reduce((acc, r) => acc + (r.rating || 0), 0);
      stats.average_rating = sum / stats.total_ratings;
    }

    return stats;
  },
};
