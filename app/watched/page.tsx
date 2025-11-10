'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Star, Film } from 'lucide-react';
import { motion } from 'framer-motion';

interface WatchedMedia {
  id: number;
  title: string;
  poster_path: string;
  media_type: string;
  rating?: number;
  watched_at: string;
}

export default function WatchedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [watchedMedia, setWatchedMedia] = useState<WatchedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadWatched();
  }, [user, router]);

  const loadWatched = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('ratings')
        .select('media_id, media_title, media_poster, media_type, rating, updated_at')
        .eq('user_id', user!.id)
        .eq('is_watched', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setWatchedMedia(data.map((item: any) => ({
          id: item.media_id,
          title: item.media_title || 'Sans titre',
          poster_path: item.media_poster || '',
          media_type: item.media_type || 'movie',
          rating: item.rating,
          watched_at: item.updated_at,
        })));
      }
    } catch (error) {
      console.error('Error loading watched media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = filter === 'all' 
    ? watchedMedia 
    : watchedMedia.filter(m => m.media_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Films & Séries vus</h1>
              <p className="text-gray-400">{watchedMedia.length} vus au total</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Tous ({watchedMedia.length})
            </button>
            <button
              onClick={() => setFilter('movie')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'movie'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Films ({watchedMedia.filter(m => m.media_type === 'movie').length})
            </button>
            <button
              onClick={() => setFilter('tv')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'tv'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Séries ({watchedMedia.filter(m => m.media_type === 'tv').length})
            </button>
          </div>
        </div>

        {/* Grid */}
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map((media) => (
              <Link key={media.id} href={`/${media.media_type}/${media.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-800 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    {media.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={48} className="text-gray-600" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                      {media.media_type === 'tv' ? 'Série' : 'Film'}
                    </div>

                    {/* Watched Badge */}
                    <div className="absolute top-2 right-2 bg-gradient-to-br from-green-500 to-emerald-600 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                      <span className="text-xs font-semibold text-white">Vu</span>
                    </div>

                    {/* Rating if exists */}
                    {media.rating && (
                      <div className="absolute bottom-2 right-2 bg-gradient-to-br from-yellow-500 to-orange-500 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={12} className="text-white fill-white" />
                        <span className="text-xs font-bold text-white">{media.rating}</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-xs text-gray-300 mb-1">
                        Vu le {new Date(media.watched_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-2 transition">
                    {media.title}
                  </h3>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye size={40} className="text-green-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucun film vu</h2>
            <p className="text-gray-400 mb-6">
              Marquez des films comme vus pour les retrouver ici
            </p>
            <Link href="/home">
              <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold">
                Découvrir des films
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
