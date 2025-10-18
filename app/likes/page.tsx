'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers, Favorite } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LikesPage() {
  const { user } = useAuth();
  const router = useRouter();
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
              <Heart size={64} className="mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Aucun like pour le moment</h2>
              <p className="text-gray-400 mb-6">
                Commencez à liker des films et séries pour les retrouver ici !
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
              {favorites.map((item) => (
                <div key={item.id} className="relative group">
                  <Link href={`/${item.media_type}/${item.media_id}`}>
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          Pas d'image
                        </div>
                      )}
                      
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setConfirmDialog({ isOpen: true, mediaId: item.media_id });
                          }}
                          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Retirer
                        </button>
                        <Link
                          href={`/watch/${item.media_type}/${item.media_id}`}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Regarder
                        </Link>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-2">
                    <h3 className="text-sm font-semibold line-clamp-1">{item.title}</h3>
                  </div>
                </div>
              ))}
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
