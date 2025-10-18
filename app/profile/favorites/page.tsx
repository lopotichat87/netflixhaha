'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { favoritesHelpers, Favorite } from '@/lib/supabase';
import MovieCard from '@/components/MovieCard';

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await favoritesHelpers.getFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (mediaId: number) => {
    if (!user) return;
    
    try {
      await favoritesHelpers.removeFromFavorites(user.id, mediaId);
      setFavorites(favorites.filter(f => f.media_id !== mediaId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const filteredFavorites = favorites.filter(f => 
    filter === 'all' || f.media_type === filter
  );

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Ma Liste</h1>
                <p className="text-gray-400">{favorites.length} élément{favorites.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilter('movie')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'movie' ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Films
              </button>
              <button
                onClick={() => setFilter('tv')}
                className={`px-4 py-2 rounded transition ${
                  filter === 'tv' ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Séries
              </button>
            </div>
          </div>

          {/* Favorites Grid */}
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={64} className="mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-semibold mb-2">
                {filter === 'all' ? 'Votre liste est vide' : `Aucun ${filter === 'movie' ? 'film' : 'série'} dans votre liste`}
              </h2>
              <p className="text-gray-400 mb-6">
                Ajoutez des films et séries à votre liste pour les retrouver facilement
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition"
              >
                Découvrir du contenu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFavorites.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <MovieCard
                    media={{
                      id: item.media_id,
                      title: item.media_type === 'movie' ? item.title : undefined,
                      name: item.media_type === 'tv' ? item.title : undefined,
                      poster_path: item.poster_path || '',
                      backdrop_path: null,
                      overview: '',
                      vote_average: 0,
                      vote_count: 0,
                      popularity: 0,
                      release_date: item.media_type === 'movie' ? item.created_at : undefined,
                      first_air_date: item.media_type === 'tv' ? item.created_at : undefined,
                      media_type: item.media_type,
                      genre_ids: [],
                      adult: false,
                      original_language: 'fr',
                      original_title: item.title,
                    }}
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFavorite(item.media_id)}
                    className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
