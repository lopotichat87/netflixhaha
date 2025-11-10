'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Heart, Star, Film, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface Media {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  media_type: string;
  is_favorite?: boolean;
}

export default function AllLikesPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [likedMovies, setLikedMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    loadLikes();
  }, [username]);

  const loadLikes = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Récupérer le profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single();

      if (!profileData) return;

      // Charger tous les likes
      const { data: allLikesData } = await supabase
        .from('favorites')
        .select('media_id, media_type, is_favorite')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false });

      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      // Enrichir avec TMDB
      const enrichedLikes = await Promise.all(
        (allLikesData || []).map(async (like: any) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/${like.media_type}/${like.media_id}?api_key=${API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            return {
              id: like.media_id,
              media_type: like.media_type,
              title: data.title || data.name || 'Sans titre',
              poster_path: data.poster_path || '',
              vote_average: data.vote_average || 0,
              release_date: data.release_date || data.first_air_date || '',
              is_favorite: like.is_favorite === true,
            };
          } catch {
            return null;
          }
        })
      );

      const validLikes = enrichedLikes.filter((m): m is any => m !== null && !!m.poster_path);
      setLikedMovies(validLikes);
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(likedMovies.length / ITEMS_PER_PAGE);
  const displayedMovies = likedMovies.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart size={32} className="text-pink-500 fill-pink-500" />
              Tous les likes de {username}
            </h1>
            <p className="text-gray-400 mt-1">{likedMovies.length} films likés</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : likedMovies.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto mb-4 text-pink-500/20" />
            <p className="text-xl text-gray-400">Aucun film liké</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayedMovies.map((movie) => (
                <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Film size={48} className="text-gray-600" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 bg-pink-500/90 p-1.5 rounded-lg">
                        <Heart size={14} className="fill-white" />
                      </div>
                      
                      {movie.is_favorite && (
                        <div className="absolute top-2 right-2 bg-yellow-500 p-1.5 rounded-lg">
                          <Star size={14} className="fill-white text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold line-clamp-2">
                      {movie.title}
                    </h3>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                  >
                    Précédent
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => {
                      if (totalPages <= 7) {
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-10 h-10 rounded-lg transition ${
                              currentPage === i 
                                ? 'bg-purple-600 text-white font-semibold' 
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      }
                      if (i === 0 || i === 1 || i === totalPages - 1 || i === currentPage) {
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-10 h-10 rounded-lg transition ${
                              currentPage === i 
                                ? 'bg-purple-600 text-white font-semibold' 
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      }
                      if (i === 2 && currentPage > 3) {
                        return <span key={i} className="px-2 text-gray-600">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                  >
                    Suivant
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Page {currentPage + 1} sur {totalPages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
