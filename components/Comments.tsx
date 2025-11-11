'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Star, MessageSquare, Send, Trash2, Edit2, Check, X, Filter, TrendingUp, Clock, AlertTriangle, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Comment {
  id: string;
  user_id: string;
  media_id: number;
  media_type: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  username: string;
  avatar_url: string;
}

interface CommentsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export default function Comments({ mediaId, mediaType }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadComments();
    loadUserReview();
  }, [mediaId, mediaType, user]);

  // Charger l'avis existant de l'utilisateur
  const loadUserReview = async () => {
    if (!user) return;

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('reviews')
        .select('rating, comment')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .single();

      if (data) {
        setRating(data.rating);
        setComment(data.comment);
      }
    } catch (error) {
      // Pas d'avis existant, c'est normal
    }
  };

  const loadComments = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      console.log('🔄 Chargement avis pour:', { mediaId, mediaType });
      
      // Étape 1 : Récupérer les reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, user_id, media_id, media_type, rating, comment, created_at, updated_at')
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('❌ Erreur chargement avis:', reviewsError);
        throw reviewsError;
      }

      console.log('📊 Avis récupérés:', reviewsData?.length || 0);

      if (!reviewsData || reviewsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Étape 2 : Récupérer les profiles des users
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      console.log('👥 User IDs à récupérer:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('❌ Erreur profiles:', profilesError);
      }
      
      console.log('📊 Profiles récupérés:', profilesData);

      // Créer un map des profiles par user_id (pas par id)
      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      const formattedComments = reviewsData.map((review: any) => {
        const profile = profilesMap.get(review.user_id);
        console.log('👤 Review user_id:', review.user_id, '→ Profile:', profile);
        return {
          id: review.id,
          user_id: review.user_id,
          media_id: review.media_id,
          media_type: review.media_type,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          updated_at: review.updated_at,
          username: profile?.username || 'Utilisateur',
          avatar_url: profile?.avatar_url || '',
        };
      });

      console.log('✅ Avis formatés:', formattedComments.length);
      setComments(formattedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtre de vulgarité
  const moderateContent = (text: string): { clean: string; hasVulgar: boolean } => {
    const vulgarWords = [
      'merde', 'putain', 'con', 'connard', 'salope', 'enculé', 'pute',
      'chier', 'bordel', 'connasse', 'enfoiré', 'bite', 'couille'
    ];
    
    let cleanText = text;
    let hasVulgar = false;
    
    vulgarWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(cleanText)) {
        hasVulgar = true;
        cleanText = cleanText.replace(regex, word[0] + '*'.repeat(word.length - 1));
      }
    });
    
    return { clean: cleanText, hasVulgar };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !comment.trim() || rating === 0) return;

    // Modérer le contenu
    const { clean: moderatedComment, hasVulgar } = moderateContent(comment.trim());

    setSubmitting(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      // Vérifier si l'utilisateur a déjà posté un avis
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType)
        .single();

      if (existingReview) {
        // UPDATE l'avis existant
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: moderatedComment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id);

        if (error) throw error;
      } else {
        // INSERT nouvel avis
        const { error } = await supabase.from('reviews').insert({
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          rating,
          comment: moderatedComment,
        });

        if (error) throw error;
      }

      if (hasVulgar) {
        alert('⚠️ Votre commentaire contenait des mots inappropriés qui ont été modérés.');
      }

      setComment('');
      setRating(0);
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editComment.trim() || editRating === 0) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          comment: editComment.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;

      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getAvatar = (avatar_url: string) => {
    if (!avatar_url) return { emoji: '👤', color: 'bg-gray-600', isImage: false };
    
    // Vérifier si c'est une URL d'image (Supabase ou autre)
    if (avatar_url.includes('http://') || avatar_url.includes('https://')) {
      return { imageUrl: avatar_url, isImage: true };
    }
    
    // Sinon, c'est un emoji avec couleur
    const parts = avatar_url.split('|');
    return { emoji: parts[0] || '👤', color: parts[1] || 'bg-gray-600', isImage: false };
  };

  // Statistiques
  const averageRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : '0';
  
  const hasRatings = comments.length > 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: comments.filter(c => c.rating === rating).length,
    percentage: comments.length > 0 ? (comments.filter(c => c.rating === rating).length / comments.length) * 100 : 0
  }));

  // Tri et filtrage
  const filteredComments = comments
    .filter(c => filterRating === null || c.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header avec stats améliorées */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold">Critiques</h2>
              <p className="text-xs text-gray-500">
                {comments.length} {comments.length > 1 ? 'avis' : 'avis'}
              </p>
            </div>
          </div>
          
          {hasRatings && (
            <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-400">{averageRating}</div>
                <div className="text-[10px] text-gray-500">/ 5</div>
              </div>
            </div>
          )}
        </div>

        {hasRatings && (
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
            <div className="text-xs font-semibold mb-3 text-gray-400">Distribution des notes</div>
            <div className="space-y-1.5">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-xs font-medium">{rating}</span>
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtres et tri - Compact */}
        {comments.length > 1 && (
          <div className="flex items-center justify-between gap-2 p-3 bg-white/5 rounded-lg border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Trier:</span>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2 py-1 rounded transition ${
                  sortBy === 'recent' ? 'bg-purple-600 text-white' : 'hover:bg-white/5'
                }`}
              >
                Récents
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-2 py-1 rounded transition ${
                  sortBy === 'rating' ? 'bg-purple-600 text-white' : 'hover:bg-white/5'
                }`}
              >
                Top notes
              </button>
            </div>

            {/* Filtre par note */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Note:</span>
              {[null, 5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating || 'all'}
                  onClick={() => setFilterRating(rating)}
                  className={`px-2 py-0.5 rounded transition ${
                    filterRating === rating
                      ? 'bg-yellow-600 text-white'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {rating ? `${rating}★` : 'Tous'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout - Minimaliste et compact */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 max-w-2xl">
          <div className="flex items-start gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
            {/* Rating compact à gauche */}
            <div className="flex flex-col items-start gap-2 min-w-fit">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500">Noter</span>
            </div>

            {/* Textarea compact */}
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Votre avis..."
                rows={2}
                maxLength={500}
                className="w-full px-3 py-2 bg-black/30 border border-white/5 rounded text-sm focus:outline-none focus:border-purple-500/30 transition resize-none placeholder:text-gray-600"
                required
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-600">{comment.length}/500</span>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim() || rating === 0}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? '...' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="max-w-2xl py-8 px-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-3 text-gray-500">
            <MessageSquare size={20} className="text-gray-600" />
            <div>
              <p className="text-sm font-medium">
                {comments.length === 0 
                  ? 'Aucun avis pour le moment' 
                  : 'Aucun avis correspondant aux filtres'}
              </p>
              <p className="text-xs text-gray-600">
                {comments.length === 0 
                  ? 'Soyez le premier à partager votre avis' 
                  : 'Essayez de modifier les filtres'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredComments.map((review) => {
              const avatar = getAvatar(review.avatar_url);
              const isEditing = editingId === review.id;
              const isOwner = user?.id === review.user_id;

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/5 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Link href={`/profile/${review.username}`}>
                      {avatar.isImage && avatar.imageUrl ? (
                        <img 
                          src={avatar.imageUrl}
                          alt={review.username}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:ring-2 ring-purple-500 transition border-2 border-white/20"
                        />
                      ) : (
                        <div className={`${avatar.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer hover:ring-2 ring-purple-500 transition`}>
                          {avatar.emoji}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link href={`/profile/${review.username}`}>
                            <h4 className="font-bold hover:text-purple-400 transition">{review.username}</h4>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                            {review.updated_at !== review.created_at && (
                              <span className="text-xs">(modifié)</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {isOwner && !isEditing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(review.id);
                                setEditComment(review.comment);
                                setEditRating(review.rating);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      {isEditing ? (
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setEditRating(star)}
                            >
                              <Star
                                size={20}
                                className={`${
                                  star <= editRating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={18}
                              className={`${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Comment */}
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition resize-none text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(review.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 rounded-lg hover:bg-green-700 transition text-sm"
                            >
                              <Check size={16} />
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                            >
                              <X size={16} />
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
