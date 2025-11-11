'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Calendar, Film, Tv } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [trendingMedia, setTrendingMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    loadTrending();
  }, [timeWindow, mediaType]);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      // Charger les 3 premières pages pour avoir plus de contenu
      const pages = [1, 2, 3];
      const allResults = await Promise.all(
        pages.map(async (page) => {
          const endpoint = `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}&language=fr-FR&page=${page}`;
          const response = await fetch(endpoint);
          const data = await response.json();
          return data.results || [];
        })
      );
      
      // Combiner tous les résultats
      const combinedResults = allResults.flat();
      setTrendingMedia(combinedResults);
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Tendances</h1>
              <p className="text-gray-400 text-sm mt-1">Ce qui fait le buzz en ce moment</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Time Window */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTimeWindow('day')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeWindow === 'day'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={16} />
              <span>Aujourd'hui</span>
            </button>
            <button
              onClick={() => setTimeWindow('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeWindow === 'week'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={16} />
              <span>Cette semaine</span>
            </button>
          </div>

          {/* Media Type */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMediaType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mediaType === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setMediaType('movie')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mediaType === 'movie'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film size={16} />
              <span>Films</span>
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mediaType === 'tv'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv size={16} />
              <span>Séries</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-gray-500 mb-6">
              {trendingMedia.length} {mediaType === 'movie' ? 'films' : mediaType === 'tv' ? 'séries' : 'contenus'} tendance
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMedia.map((media, index) => (
                <motion.div
                  key={media.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <div className="relative">
                    {/* Trending Badge */}
                    <div className="absolute -top-2 -left-2 z-20 w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      #{index + 1}
                    </div>
                    <MovieCard media={{ ...media, media_type: media.media_type || mediaType }} size="large" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
