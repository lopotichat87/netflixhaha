'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Heart, Star, Film, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface Media {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  media_type: string;
}

export default function AllFavoritesPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [favoriteMovies, setFavoriteMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    loadFavorites();
  }, [username]);

  const loadFavorites = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Récupérer le profil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)
        .single();

      if (!profileData) return;

      // Charger tous les favoris (is_favorite = true)
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('media_id, media_type, created_at')
        .eq('user_id', profileData.user_id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      // Enrichir avec TMDB
      const enrichedFavorites = await Promise.all(
        (favoritesData || []).map(async (fav: any) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/${fav.media_type}/${fav.media_id}?api_key=${API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            return {
              id: fav.media_id,
              media_type: fav.media_type,
              title: data.title || data.name || 'Sans titre',
              poster_path: data.poster_path || '',
              vote_average: data.vote_average || 0,
              release_date: data.release_date || data.first_air_date || '',
            };
          } catch {
            return null;
          }
        })
      );

      const validFavorites = enrichedFavorites.filter((m): m is any => m !== null && !!m.poster_path);
      setFavoriteMovies(validFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE);
  const displayedMovies = favoriteMovies.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Star size={24} className="text-white fill-white" />
              </div>
              Favoris de {username}
            </h1>
            <p className="text-gray-400 mt-1">{favoriteMovies.length} films préférés</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : favoriteMovies.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-gray-700">
            <Star size={64} className="mx-auto mb-4 text-yellow-500/20" />
            <p className="text-xl text-gray-400 font-semibold mb-2">Aucun film préféré</p>
            <p className="text-sm text-gray-600">Ajoutez vos films favoris parmi vos likes</p>
          </div>
        ) : (
          <>
            {/* Grid avec design premium */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedMovies.map((movie) => (
                <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg ring-2 ring-yellow-500/20 group-hover:ring-yellow-500/60 transition-all">
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
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Star badge */}
                      <div className="absolute top-3 right-3 bg-yellow-500 p-2 rounded-lg shadow-lg">
                        <Star size={16} className="fill-white text-white" />
                      </div>
                      
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-lg">
                          {movie.title}
                        </h3>
                      </div>
                    </div>
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
                                ? 'bg-yellow-500 text-white font-semibold' 
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
                                ? 'bg-yellow-500 text-white font-semibold' 
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
