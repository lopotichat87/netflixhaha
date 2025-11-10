'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Heart, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RatingStars from './RatingStars';
import { ratingsHelpers } from '@/lib/ratings';
import { useAuth } from '@/contexts/AuthContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  mediaPoster: string | null;
  onSuccess?: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  mediaTitle,
  mediaPoster,
  onSuccess,
}: RatingModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadExistingRating();
    }
  }, [isOpen, user, mediaId, mediaType]);

  const loadExistingRating = async () => {
    if (!user) return;
    
    try {
      const data = await ratingsHelpers.getUserRating(user.id, mediaId, mediaType);
      if (data) {
        setExistingRating(data);
        setRating(data.rating || 0);
        setReview(data.review || '');
        setWatchedDate(data.watched_date || new Date().toISOString().split('T')[0]);
        setIsLiked(data.is_liked || false);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await ratingsHelpers.upsertRating(
        user.id,
        mediaId,
        mediaType,
        mediaTitle,
        mediaPoster,
        {
          rating: rating > 0 ? rating : null,
          review: review.trim() || null,
          watched_date: watchedDate,
          is_watched: true,
          is_liked: isLiked,
        }
      );

      setSaveSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl max-w-2xl w-full shadow-2xl border border-gray-800"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
              <Star size={20} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl font-bold">Noter et critiquer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Media Info */}
          <div className="flex gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            {mediaPoster && (
              <div className="relative group">
                <img
                  src={`https://image.tmdb.org/t/p/w185${mediaPoster}`}
                  alt={mediaTitle}
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{mediaTitle}</h3>
              <span className="inline-block px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded-full text-xs font-medium text-purple-400">
                {mediaType === 'movie' ? 'Film' : 'Série'}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="p-3 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 rounded-lg border border-yellow-600/20">
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              Note
            </label>
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              size={32}
              showValue
            />
            {rating > 0 && (
              <p className="text-xs text-yellow-500/80 mt-1">
                {rating === 5 ? '⭐ Chef-d\'œuvre !' : rating >= 4 ? '👍 Excellent' : rating >= 3 ? '😊 Bien' : rating >= 2 ? '😐 Moyen' : '👎 Décevant'}
              </p>
            )}
          </div>

          {/* Review */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Critique (optionnel)
            </label>
            <div className="relative">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Qu'avez-vous pensé de ce film ? Partagez votre ressenti, vos impressions..."
                className="w-full px-4 py-3 bg-gray-900/70 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 resize-none transition"
                rows={4}
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {review.length}/1000 caractères
                </p>
                {review.length > 50 && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Check size={12} />
                    Belle critique !
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Watched Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" />
              Date de visionnage
            </label>
            <input
              type="date"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-gray-900/70 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Like Button */}
          <div className="p-4 bg-gradient-to-br from-pink-900/10 to-red-900/10 rounded-lg border border-pink-600/20">
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isLiked
                  ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300'
              }`}
            >
              <Heart size={20} className={isLiked ? 'fill-white' : ''} />
              <span>{isLiked ? 'J\'aime ce film ❤️' : 'Ajouter à mes favoris'}</span>
            </button>
            {isLiked && (
              <p className="text-xs text-pink-400 text-center mt-2">
                ✨ Ajouté à vos films préférés
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || saveSuccess}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition disabled:opacity-50 shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check size={20} />
                  Enregistré !
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  {existingRating ? 'Mettre à jour' : 'Enregistrer'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition border border-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
