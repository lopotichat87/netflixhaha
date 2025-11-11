'use client';

import { Media, getTitle, getReleaseDate } from '@/lib/api';
import { Star, Heart, Plus, Eye, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';
import { ratingsHelpers } from '@/lib/ratings';

export default function MovieCard({ media, size = 'small' }: { media: Media; size?: 'small' | 'large' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const { user } = useAuth();
  
  const title = media.title || media.name || 'Sans titre';
  const imageUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder-movie.jpg';
  
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

  // Charger les données de rating et favoris
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Charger le rating
        const rating = await ratingsHelpers.getUserRating(user.id, media.id, mediaType as 'movie' | 'tv');
        if (rating) {
          setUserRating(rating.rating);
          setIsLiked(rating.is_liked);
          setIsWatched(rating.is_watched);
        } else {
          // Si pas de rating, vérifier juste les favoris
          try {
            const favorites = await favoritesHelpers.getFavorites(user.id);
            const isFav = favorites.some(f => f.media_id === media.id);
            setIsLiked(isFav);
          } catch (favError) {
            // Ignorer les erreurs de favoris
            console.log('Favorites not loaded:', favError);
          }
        }
      } catch (error) {
        // Ignorer silencieusement les erreurs pour ne pas bloquer l'affichage
        console.log('Rating data not loaded (table may not exist):', error);
      }
    };

    loadData();
  }, [user, media.id, mediaType]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Connectez-vous pour ajouter des favoris');
      return;
    }

    try {
      if (isLiked) {
        await favoritesHelpers.removeFromFavorites(user.id, media.id);
        setIsLiked(false);
      } else {
        await favoritesHelpers.addToFavorites(
          user.id,
          media.id,
          mediaType,
          title,
          media.poster_path || ''
        );
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de l\'ajout aux favoris. Vérifiez votre connexion Supabase.');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <Link
        href={`/${mediaType}/${media.id}`}
        className="relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Poster */}
        <div className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg transition-transform duration-300 will-change-transform ${
          isHovered ? 'scale-105 shadow-2xl' : ''
        }`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Media Type Badge */}
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg">
              {mediaType === 'tv' ? '📺 Série' : '🎬 Film'}
            </div>
          </div>

          {/* Status Badges - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-30">
            {/* Rating Badge */}
            {userRating && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg ring-2 ring-white/20"
              >
                <Star size={12} className="text-white fill-white" />
                <span className="text-xs font-bold text-white">{userRating}</span>
              </motion.div>
            )}
            
            {/* Like Badge */}
            {isLiked && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 }}
                className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 backdrop-blur-sm p-1.5 rounded-full shadow-lg ring-2 ring-white/20"
              >
                <Heart size={12} className="fill-white text-white" />
              </motion.div>
            )}
            
            {/* Watched Badge */}
            {isWatched && (
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg ring-2 ring-white/20"
              >
                <Check size={12} className="text-white" strokeWidth={3} />
                <span className="text-xs font-bold text-white tracking-tight">Vu</span>
              </motion.div>
            )}
          </div>
          
          {/* TMDB Rating - Bottom Left */}
          <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/10 z-30">
            <span className="text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {Math.round(media.vote_average * 10)}%
            </span>
          </div>
          
          {/* Hover Overlay with all content */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/40 flex flex-col justify-center p-3 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Content */}
                <div className="space-y-2 mt-auto mb-8">
                  <h3 className="font-bold text-sm line-clamp-1 leading-tight">
                    {getTitle(media)}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs flex-wrap">
                    <span className="text-white font-semibold">
                      {getReleaseDate(media).split('-')[0] || 'N/A'}
                    </span>
                    {media.vote_average > 0 && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-green-400 font-semibold">
                          {Math.round(media.vote_average * 10)}%
                        </span>
                      </>
                    )}
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-xs">
                      {mediaType === 'tv' ? 'Série' : 'Film'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex items-center ${size === 'large' ? 'gap-2' : 'gap-1'} pt-1`}>
                    <button 
                      onClick={toggleFavorite}
                      className={`flex items-center justify-center ${size === 'large' ? 'gap-1 px-3 py-1.5 text-[11px]' : 'gap-0.5 px-2 py-0.5 text-[9.5px]'} rounded font-medium transition ${
                        isLiked 
                          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' 
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      <Heart size={size === 'large' ? 12 : 10} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{isLiked ? 'Liké' : 'J\'aime'}</span>
                    </button>
                    
                    <button 
                      className={`flex items-center justify-center ${size === 'large' ? 'gap-1 px-3 py-1.5 text-[11px]' : 'gap-0.5 px-2 py-0.5 text-[9.5px]'} rounded font-medium bg-white/15 hover:bg-white/25 transition text-white`}
                    >
                      <Plus size={size === 'large' ? 12 : 10} />
                      <span>Liste</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </div>
  );
}
