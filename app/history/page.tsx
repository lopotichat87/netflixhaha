'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';
import { historyHelpers } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await historyHelpers.getHistory(user.id);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await historyHelpers.clearHistory(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history', user?.id] });
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const clearHistory = () => {
    setShowClearConfirm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                <div>
                  <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-2" />
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
                  <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto pb-20">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-800 rounded-full transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold">Historique de visionnage</h1>
                <p className="text-gray-400">{history.length} élément{history.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
              >
                <Trash2 size={18} />
                <span>Effacer l'historique</span>
              </button>
            )}
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <div className="text-center py-20">
              <Clock size={64} className="mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-semibold mb-2">Aucun historique</h2>
              <p className="text-gray-400 mb-6">
                Commencez à regarder des films et séries pour voir votre historique ici
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
              {history.map((item) => (
                <div
                  key={item.id}
                  className="relative group"
                >
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
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-20">
                        <Link
                          href={`/watch/${item.media_type}/${item.media_id}`}
                          className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-200 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          {item.progress >= 95 ? 'Revoir' : 'Continuer'}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setItemToDelete(item.media_id);
                          }}
                          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                          <Trash2 size={18} />
                          Supprimer
                        </button>
                      </div>
                      
                      {/* Progress Bar */}
                      {item.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-10">
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  {/* Title and Date */}
                  <div className="mt-2">
                    <h3 className="text-sm font-semibold line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">
                      {new Date(item.last_watched).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Clear All History */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => clearHistoryMutation.mutate()}
        title="Effacer l'historique"
        message="Êtes-vous sûr de vouloir effacer tout votre historique ? Cette action est irréversible."
        confirmText="Tout effacer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Confirm Delete Single Item */}
      <ConfirmDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          // TODO: Implémenter la suppression d'un seul élément
          console.log('Delete item:', itemToDelete);
          setItemToDelete(null);
        }}
        title="Retirer de l'historique"
        message="Êtes-vous sûr de vouloir retirer ce contenu de votre historique ?"
        confirmText="Retirer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
