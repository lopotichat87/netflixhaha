'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { statsHelpers, ViewingStat } from '@/lib/stats';
import { ratingsHelpers, Rating } from '@/lib/ratings';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { Clock, TrendingUp, Film, Tv, Star, MessageSquare, Heart, Eye } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const GENRE_MAP: { [key: number]: string } = {
  28: 'Action',
  12: 'Aventure',
  16: 'Animation',
  35: 'Comédie',
  80: 'Crime',
  99: 'Documentaire',
  18: 'Drame',
  10751: 'Familial',
  14: 'Fantastique',
  36: 'Histoire',
  27: 'Horreur',
  10402: 'Musique',
  9648: 'Mystère',
  10749: 'Romance',
  878: 'Science-Fiction',
  10770: 'Téléfilm',
  53: 'Thriller',
  10752: 'Guerre',
  37: 'Western',
};

const COLORS = ['#E50914', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export default function StatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ViewingStat[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [topGenres, setTopGenres] = useState<{ genre_id: number; count: number }[]>([]);
  const [trends, setTrends] = useState<{ date: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Rafraîchir les stats toutes les 30 secondes
    const interval = setInterval(() => {
      if (user) {
        loadStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [statsData, time, genres, trendsData, ratingsData] = await Promise.all([
        statsHelpers.getViewingStats(user.id),
        statsHelpers.getTotalWatchTime(user.id),
        statsHelpers.getTopGenres(user.id),
        statsHelpers.getWatchingTrends(user.id, 30),
        ratingsHelpers.getUserRatings(user.id, 1000),
      ]);

      setStats(statsData);
      setTotalTime(time);
      setTopGenres(genres);
      setTrends(trendsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 px-4 md:px-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Connectez-vous</h1>
          <p className="text-gray-400 mb-8">Vous devez être connecté pour voir vos statistiques</p>
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-red-600 rounded font-semibold hover:bg-red-700 transition">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const movieCount = stats.filter(s => s.media_type === 'movie').length;
  const tvCount = stats.filter(s => s.media_type === 'tv').length;
  const completedCount = stats.filter(s => s.completed).length;
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;

  // Stats des ratings
  const totalRatings = ratings.filter(r => r.rating !== null).length;
  const totalReviews = ratings.filter(r => r.review && r.review.trim() !== '').length;
  const totalLikes = ratings.filter(r => r.is_liked).length;
  const totalWatched = ratings.filter(r => r.is_watched).length;
  const averageRating = totalRatings > 0 
    ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings).toFixed(1)
    : '0';

  // Top films/séries notés
  const topRatedContent = ratings
    .filter(r => r.rating !== null && r.rating >= 4)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  const genreData = topGenres.map(g => ({
    name: GENRE_MAP[g.genre_id] || `Genre ${g.genre_id}`,
    value: g.count,
  }));

  const trendData = trends.map(t => ({
    date: new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    heures: Math.round(t.minutes / 60 * 10) / 10,
  }));

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Mes Statistiques</h1>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
          >
            <TrendingUp size={20} />
            <span className="hidden md:inline">Actualiser</span>
          </button>
        </div>

        {/* Cards Overview avec mini graphiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Notes données avec graphique radial */}
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-6 rounded-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <Star size={24} />
              <h3 className="text-sm font-semibold">Notes données</h3>
            </div>
            <p className="text-3xl font-bold relative z-10">{totalRatings}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-white/70">Moyenne: {averageRating}/5</p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={10}
                    className={parseFloat(averageRating) >= star ? 'fill-white text-white' : 'text-white/30'}
                  />
                ))}
              </div>
            </div>
            {/* Mini graphique radial */}
            <div className="absolute -right-8 -bottom-8 opacity-20">
              <ResponsiveContainer width={120} height={120}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={[{ value: (parseFloat(averageRating) / 5) * 100 }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" fill="#fff" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare size={24} />
              <h3 className="text-sm font-semibold">Reviews</h3>
            </div>
            <p className="text-3xl font-bold">{totalReviews}</p>
            <p className="text-xs text-white/70 mt-1">Critiques écrites</p>
            {/* Icône décorative */}
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <MessageSquare size={80} />
            </div>
          </div>

          {/* Likes avec progression */}
          <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Heart size={24} />
              <h3 className="text-sm font-semibold">Likes</h3>
            </div>
            <p className="text-3xl font-bold">{totalLikes}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Contenus aimés</span>
                <span>{Math.round((totalLikes / Math.max(totalWatched, 1)) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalLikes / Math.max(totalWatched, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Vus avec mini graphique circulaire */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <Eye size={24} />
              <h3 className="text-sm font-semibold">Vus</h3>
            </div>
            <p className="text-3xl font-bold">{totalWatched}</p>
            <p className="text-xs text-white/70 mt-1">Films/Séries</p>
            {/* Mini pie chart */}
            {totalWatched > 0 && (
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <ResponsiveContainer width={80} height={80}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Films', value: ratings.filter(r => r.media_type === 'movie' && r.is_watched).length },
                        { name: 'Séries', value: ratings.filter(r => r.media_type === 'tv' && r.is_watched).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={35}
                      fill="#fff"
                      dataKey="value"
                    >
                      <Cell fill="#fff" />
                      <Cell fill="#ffffff66" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats avec graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Films vs Séries - Graphique comparatif */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Films vs Séries notés</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={[
                  { name: 'Films', count: ratings.filter(r => r.media_type === 'movie' && r.rating !== null).length, fill: '#3B82F6' },
                  { name: 'Séries', count: ratings.filter(r => r.media_type === 'tv' && r.rating !== null).length, fill: '#8B5CF6' }
                ]}
                layout="vertical"
              >
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={60} style={{ fontSize: '12px' }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  <Cell fill="#3B82F6" />
                  <Cell fill="#8B5CF6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-400">{ratings.filter(r => r.media_type === 'movie' && r.rating !== null).length} films</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-400">{ratings.filter(r => r.media_type === 'tv' && r.rating !== null).length} séries</span>
              </div>
            </div>
          </div>

          {/* Activité de notation avec graphique */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Activité de notation</h3>
            <div className="flex items-end justify-center gap-2 h-[120px]">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-20 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.min((totalRatings / Math.max(totalRatings, 1)) * 100, 100)}%` }}
                />
                <span className="text-2xl font-bold">{totalRatings}</span>
                <span className="text-xs text-gray-400">Notes</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-20 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.min((totalReviews / Math.max(totalRatings, 1)) * 100, 100)}%` }}
                />
                <span className="text-2xl font-bold">{totalReviews}</span>
                <span className="text-xs text-gray-400">Reviews</span>
              </div>
            </div>
          </div>

          {/* Répartition des notes */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Répartition des notes</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter(r => r.rating === star).length;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-12">
                      <Star size={12} className="fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{star}</span>
                    </div>
                    <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {count > 0 && <span className="text-xs font-semibold">{count}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-12">

            {/* Top Rated Content */}
            {topRatedContent.length > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mieux notés</h2>
                  <Link 
                    href="/likes"
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Voir tout →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {topRatedContent.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/${item.media_type}/${item.media_id}`}
                      className="group"
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                        {item.media_poster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w342${item.media_poster}`}
                            alt={item.media_title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.media_type === 'movie' ? <Film size={32} /> : <Tv size={32} />}
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-xs flex items-center gap-1">
                          <Star size={12} className="fill-current" />
                          {item.rating}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-purple-400 transition">
                        {item.media_title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Genres */}
            {genreData.length > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Genres préférés</h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-2">
                    {genreData.map((genre, index) => (
                      <div key={genre.name} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="flex-1">{genre.name}</span>
                        <span className="font-bold">{genre.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            {totalReviews > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Mes dernières reviews</h2>
                  <Link 
                    href="/reviews"
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition group"
                  >
                    <span>Voir tout</span>
                    <TrendingUp size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {ratings
                    .filter(r => r.review && r.review.trim() !== '')
                    .slice(0, 3)
                    .map((rating) => (
                      <Link
                        key={rating.id}
                        href={`/${rating.media_type}/${rating.media_id}`}
                        className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
                      >
                        <div className="flex gap-4">
                          {rating.media_poster && (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${rating.media_poster}`}
                              alt={rating.media_title}
                              className="w-16 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold group-hover:text-purple-400 transition truncate">
                                {rating.media_title}
                              </h3>
                              {rating.rating && (
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <Star size={16} className="fill-current" />
                                  <span className="font-semibold">{rating.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 line-clamp-2">{rating.review}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(rating.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Historique récent */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Notes récentes</h2>
                {ratings.filter(r => r.rating !== null).length > 3 && (
                  <button
                    onClick={() => {
                      const elem = document.getElementById('all-ratings');
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition group"
                  >
                    <span>Voir tout ({ratings.filter(r => r.rating !== null).length})</span>
                    <TrendingUp size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {ratings
                  .filter(r => r.rating !== null)
                  .slice(0, 3)
                  .map((rating) => (
                  <div key={rating.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                    <div className="flex items-center gap-3">
                      {rating.media_poster && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${rating.media_poster}`}
                          alt={rating.media_title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{rating.media_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= (rating.rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(rating.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="px-2 py-1 bg-yellow-500/20 rounded">
                        <span className="text-sm font-bold text-yellow-500">{rating.rating}/5</span>
                      </div>
                      {rating.is_liked && (
                        <Heart size={14} className="text-pink-500 fill-pink-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
