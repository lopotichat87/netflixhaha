'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import RatingStars from '@/components/RatingStars';
import { ratingsHelpers, RatingWithUser } from '@/lib/ratings';
import { Star, MessageSquare, Heart, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'reviews'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['public-ratings', filter],
    queryFn: async () => {
      if (filter === 'reviews') {
        return await ratingsHelpers.getRecentReviews(50);
      }
      return await ratingsHelpers.getRecentRatings(50);
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Activité de la communauté</h1>
          <p className="text-gray-400">Découvrez ce que les autres regardent et pensent</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Toutes les notes
          </button>
          <button
            onClick={() => setFilter('reviews')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              filter === 'reviews'
                ? 'bg-white text-black'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Avec critiques
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-gray-800 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-1/4" />
                    <div className="h-6 bg-gray-800 rounded w-1/2" />
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ratings List */}
        {!isLoading && (
          <div className="grid gap-6">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition"
              >
                <div className="flex gap-4">
                  {/* Poster */}
                  <Link
                    href={`/${rating.media_type}/${rating.media_id}`}
                    className="flex-shrink-0"
                  >
                    {rating.media_poster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${rating.media_poster}`}
                        alt={rating.media_title}
                        className="w-16 md:w-20 h-24 md:h-30 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 md:w-20 h-24 md:h-30 bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-gray-600">?</span>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                        {rating.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {rating.display_name || rating.username || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Media Title */}
                    <Link
                      href={`/${rating.media_type}/${rating.media_id}`}
                      className="block mb-2"
                    >
                      <h3 className="text-lg font-semibold hover:text-red-500 transition">
                        {rating.media_title}
                      </h3>
                    </Link>

                    {/* Rating & Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {rating.rating && (
                        <div className="flex items-center gap-2">
                          <RatingStars rating={rating.rating} readonly size={16} />
                          <span className="text-sm font-semibold text-yellow-400">
                            {rating.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {rating.is_liked && (
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart size={14} fill="currentColor" />
                          <span className="text-xs">J'aime</span>
                        </div>
                      )}

                      {rating.is_watched && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Eye size={14} />
                          <span className="text-xs">Vu</span>
                        </div>
                      )}

                      {rating.is_rewatch && (
                        <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                          Revu
                        </span>
                      )}

                      {rating.watched_date && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar size={12} />
                          <span className="text-xs">
                            {new Date(rating.watched_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Review */}
                    {rating.review && (
                      <div className="mt-3 p-4 bg-gray-950 rounded-lg">
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {rating.review}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {ratings.length === 0 && (
              <div className="text-center py-20">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
                <h2 className="text-xl font-semibold mb-2">Aucune activité</h2>
                <p className="text-gray-400">
                  Soyez le premier à noter un film ou une série !
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
