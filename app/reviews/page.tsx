'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ratingsHelpers, RatingWithUser } from '@/lib/ratings';
import { useInfiniteQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { MessageSquare, Star, Heart, Calendar, User, Film, Tv, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['reviews'],
    queryFn: async ({ pageParam = 0 }) => {
      return await ratingsHelpers.getRecentReviews(ITEMS_PER_PAGE, pageParam * ITEMS_PER_PAGE);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE ? allPages.length : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    initialPageParam: 0,
  });

  const reviews = data?.pages.flat() || [];

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}
          />
        ))}
      </div>
    );
  };

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
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <MessageSquare size={36} className="text-purple-500" />
              Reviews de la Communauté
            </h1>
            <p className="text-gray-400 mt-1">
              Découvrez les avis et critiques des autres utilisateurs
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-36 bg-gray-800 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                    <div className="h-20 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-purple-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Aucune review pour le moment</h2>
            <p className="text-gray-400 mb-6">
              Soyez le premier à partager votre avis !
            </p>
            <Link
              href="/home"
              className="inline-block px-6 py-3 bg-purple-600 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Découvrir du contenu
            </Link>
          </div>
        ) : (
          <>
            {/* Reviews Grid */}
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800/80 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Poster */}
                    <Link 
                      href={`/${review.media_type}/${review.media_id}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-full md:w-32 aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 hover:scale-105 transition-transform duration-300">
                        {review.media_poster ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w342${review.media_poster}`}
                            alt={review.media_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {review.media_type === 'movie' ? (
                              <Film size={32} className="text-gray-600" />
                            ) : (
                              <Tv size={32} className="text-gray-600" />
                            )}
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                          {review.media_type === 'tv' ? 'Série' : 'Film'}
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/${review.media_type}/${review.media_id}`}
                            className="hover:text-purple-400 transition"
                          >
                            <h3 className="text-xl font-bold truncate">{review.media_title}</h3>
                          </Link>
                          
                          {/* User Info */}
                          <Link 
                            href={`/profile/${review.username}`}
                            className="flex items-center gap-2 mt-2 text-sm text-gray-400 hover:text-purple-400 transition group"
                          >
                            {review.avatar_url ? (
                              <img
                                src={review.avatar_url}
                                alt={review.username}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <User size={14} />
                              </div>
                            )}
                            <span className="font-medium group-hover:underline">
                              {review.display_name || review.username}
                            </span>
                          </Link>
                        </div>

                        {/* Rating */}
                        {review.rating && (
                          <div className="flex flex-col items-end gap-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-400 font-semibold">
                              {review.rating}/5
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
                        {review.review}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {new Date(review.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        {review.is_liked && (
                          <div className="flex items-center gap-1 text-pink-500">
                            <Heart size={14} className="fill-current" />
                            <span>J'aime</span>
                          </div>
                        )}

                        {review.is_rewatch && (
                          <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                            Revu
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="py-8 text-center">
              {isFetchingNextPage && (
                <div className="flex justify-center items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              {!hasNextPage && reviews.length > 0 && (
                <p className="text-gray-500 text-sm">Vous avez vu toutes les reviews</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
