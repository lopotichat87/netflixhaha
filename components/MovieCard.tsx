'use client';

import { Media, getTitle, getReleaseDate } from '@/lib/api';
import { Play, Plus, ThumbsUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { historyHelpers, favoritesHelpers } from '@/lib/supabase';

export default function MovieCard({ media }: { media: Media }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isInList, setIsInList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  
  const title = media.title || media.name || 'Sans titre';
  const imageUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/placeholder-movie.jpg';
  
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');

  // Charger la progression depuis l'historique
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        const history = await historyHelpers.getHistory(user.id);
        const item = history.find(h => h.media_id === media.id);
        if (item) {
          setProgress(item.progress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, [user, media.id]);

  // Charger l'état des favoris
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      
      try {
        const favorites = await favoritesHelpers.getFavorites(user.id);
        const isFav = favorites.some(f => f.media_id === media.id);
        setIsLiked(isFav);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [user, media.id]);

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
    <div className="relative">
      <Link
        href={`/${mediaType}/${media.id}`}
        className="relative block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />

          {/* Progress Bar */}
          {progress > 0 && progress < 95 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-10">
              <div
                className="h-full bg-red-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {/* Hover Overlay with all content */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 flex flex-col justify-end p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Title and Rating */}
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {getTitle(media)}
                </h3>
                
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="text-green-400 font-semibold">
                    {Math.round(media.vote_average * 10)}%
                  </span>
                  <span className="text-gray-400">
                    {getReleaseDate(media).split('-')[0] || 'N/A'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link href={`/watch/${mediaType}/${media.id}`}>
                    <button className="w-8 h-8 rounded-full bg-white hover:bg-white/80 flex items-center justify-center transition">
                      <Play size={16} fill="currentColor" className="text-black ml-0.5" />
                    </button>
                  </Link>
                  {progress > 0 && progress < 95 && (
                    <span className="text-xs text-gray-400">{progress}%</span>
                  )}
                  <button 
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition ${
                      isInList 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-500 hover:border-white'
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition ${
                      isLiked 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-500 hover:border-white'
                    }`}
                  >
                    <ThumbsUp size={12} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 line-clamp-4">
                  {media.overview || 'Aucune description disponible'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    </div>
  );
}
