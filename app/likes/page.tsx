'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers, Favorite } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Heart, Sparkles, ArrowLeft, Film, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function LikesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; mediaId: number | null }>({
    isOpen: false,
    mediaId: null,
  });

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await favoritesHelpers.getFavorites(user.id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const removeFavorite = async (mediaId: number) => {
    if (!user) return;
    await favoritesHelpers.removeFromFavorites(user.id, mediaId);
  };

  const toggleFavorite = async (mediaId: number, mediaType: string, currentValue: boolean) => {
    if (!user) return;
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      await supabase
        .from('favorites')
        .update({ is_favorite: !currentValue })
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      // Recharger les données
      queryClient.invalidateQueries({ queryKey: ['favorites', user.id] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };


  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {loading ? (
        <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                <div>
                  <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !user ? (
        <div className="pt-32 px-4 md:px-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Connectez-vous pour voir vos likes</h1>
        </div>
      ) : (
        <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto pb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-800 rounded-full transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Heart size={32} className="text-red-500" fill="currentColor" />
                  <h1 className="text-3xl font-bold">Mes Likes</h1>
                </div>
                <p className="text-gray-400">
                  {favorites.length} {favorites.length > 1 ? 'contenus aimés' : 'contenu aimé'}
                </p>
              </div>
            </div>
          </div>

          {/* Favorites Grid */}
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-pink-400 opacity-50" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Aucun like pour le moment</h2>
              <p className="text-gray-400 mb-6">
                Commencez à liker des films et séries pour les retrouver ici
              </p>
              <Link
                href="/home"
                className="inline-block px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Découvrir du contenu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.map((item) => {
                const isFavorite = (item as any).is_favorite === true;
                
                return (
                <div key={item.id} className="relative">
                  <Link href={`/${item.media_type}/${item.media_id}`}>
                    <div className="cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={48} className="text-gray-600" />
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                          {item.media_type === 'tv' ? 'Série' : 'Film'}
                        </div>

                        {/* Like Badge */}
                        <div className="absolute bottom-2 left-2 bg-gradient-to-br from-pink-500 to-red-500 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
                          <Heart size={12} className="fill-white text-white" />
                        </div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmDialog({ isOpen: true, mediaId: item.media_id });
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-xs font-semibold transition"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold line-clamp-2 mt-2 transition">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                  
                  {/* Bouton Favori */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item.media_id, item.media_type, isFavorite);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 z-10 ${
                      isFavorite 
                        ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                        : 'bg-gray-800/80 hover:bg-gray-700'
                    }`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star size={14} className={isFavorite ? 'fill-white text-white' : 'text-gray-400'} />
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, mediaId: null })}
        onConfirm={() => {
          if (confirmDialog.mediaId) {
            removeFavorite(confirmDialog.mediaId);
          }
        }}
        title="Retirer des likes"
        message="Êtes-vous sûr de vouloir retirer ce contenu de vos likes ?"
        confirmText="Retirer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
