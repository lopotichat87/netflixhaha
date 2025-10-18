'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { statsHelpers, ViewingStat } from '@/lib/stats';
import Navbar from '@/components/Navbar';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Film, Tv } from 'lucide-react';
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
      const [statsData, time, genres, trendsData] = await Promise.all([
        statsHelpers.getViewingStats(user.id),
        statsHelpers.getTotalWatchTime(user.id),
        statsHelpers.getTopGenres(user.id),
        statsHelpers.getWatchingTrends(user.id, 30),
      ]);

      setStats(statsData);
      setTotalTime(time);
      setTopGenres(genres);
      setTrends(trendsData);
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

        {/* Cards Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Film size={24} />
              <h3 className="text-sm font-semibold">Films regardés</h3>
            </div>
            <p className="text-3xl font-bold">{movieCount}</p>
            <p className="text-xs text-white/70 mt-1">Total</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Tv size={24} />
              <h3 className="text-sm font-semibold">Séries regardées</h3>
            </div>
            <p className="text-3xl font-bold">{tvCount}</p>
            <p className="text-xs text-white/70 mt-1">Total</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={24} />
              <h3 className="text-sm font-semibold">Terminés</h3>
            </div>
            <p className="text-3xl font-bold">{completedCount}</p>
            <p className="text-xs text-white/70 mt-1">Contenu complet</p>
          </div>
        </div>

        {stats.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl mb-2">Aucune statistique disponible</p>
            <p className="text-sm">Commencez à regarder des films et séries pour voir vos stats !</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Tendances de visionnage */}
            {trendData.length > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Tendances (30 derniers jours)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="heures" fill="#E50914" name="Heures regardées" />
                  </BarChart>
                </ResponsiveContainer>
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

            {/* Historique récent */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Activité récente</h2>
              <div className="space-y-3">
                {stats.slice(0, 10).map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      {stat.media_type === 'movie' ? <Film size={20} /> : <Tv size={20} />}
                      <div>
                        <p className="font-semibold text-sm">ID: {stat.media_id}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(stat.watched_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{stat.watch_duration} min</p>
                      {stat.completed && (
                        <p className="text-xs text-green-500">✓ Terminé</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
