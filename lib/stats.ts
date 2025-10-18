import { supabase } from './supabase';

// ============================================
// STATISTIQUES DE VISIONNAGE
// ============================================

export interface ViewingStat {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  watch_duration: number;
  completed: boolean;
  watched_at: string;
}

async function addViewingStat(
  userId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv',
  genreIds: number[],
  watchDuration: number,
  completed: boolean
): Promise<void> {
  const { error } = await supabase
    .from('viewing_stats')
    .insert({
      user_id: userId,
      media_id: mediaId,
      media_type: mediaType,
      genre_ids: genreIds,
      watch_duration: watchDuration,
      completed,
    });

  if (error) throw error;
}

async function getViewingStats(userId: string): Promise<ViewingStat[]> {
  const { data, error } = await supabase
    .from('viewing_stats')
    .select('*')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getTotalWatchTime(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('viewing_stats')
    .select('watch_duration')
    .eq('user_id', userId);

  if (error) throw error;
  return data?.reduce((sum, stat) => sum + stat.watch_duration, 0) || 0;
}

async function getTopGenres(userId: string): Promise<{ genre_id: number; count: number }[]> {
  const stats = await getViewingStats(userId);
  const genreCounts: { [key: number]: number } = {};

  stats.forEach(stat => {
    stat.genre_ids?.forEach(genreId => {
      genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
    });
  });

  return Object.entries(genreCounts)
    .map(([genre_id, count]) => ({ genre_id: parseInt(genre_id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function getWatchingTrends(userId: string, days: number = 30): Promise<{ date: string; minutes: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('viewing_stats')
    .select('watched_at, watch_duration')
    .eq('user_id', userId)
    .gte('watched_at', startDate.toISOString())
    .order('watched_at', { ascending: true });

  if (error) throw error;

  // Grouper par jour
  const dailyStats: { [key: string]: number } = {};
  data?.forEach(stat => {
    const date = new Date(stat.watched_at).toISOString().split('T')[0];
    dailyStats[date] = (dailyStats[date] || 0) + stat.watch_duration;
  });

  return Object.entries(dailyStats).map(([date, minutes]) => ({ date, minutes }));
}

export const statsHelpers = {
  addViewingStat,
  getViewingStats,
  getTotalWatchTime,
  getTopGenres,
  getWatchingTrends,
};
