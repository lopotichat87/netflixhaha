'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Heart, Star, MessageSquare, User, Film, Clock, TrendingUp, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'review' | 'like' | 'watched';
  user_id: string;
  username: string;
  avatar_url: string;
  media_id: number;
  media_type: string;
  media_title: string;
  media_poster: string;
  rating?: number;
  comment?: string;
  created_at: string;
}

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reviews' | 'likes' | 'watched'>('all');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadActivities();
  }, [user, searchParams]);

  const loadActivities = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      // Vérifier si on doit charger pour un utilisateur spécifique
      const usernameParam = searchParams.get('username');
      let userId = null;
      
      if (usernameParam) {
        console.log('🔍 Recherche du profil:', usernameParam);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, username, is_private')
          .eq('username', usernameParam)
          .single();
        
        console.log('👤 Profile trouvé:', profileData, 'Erreur:', profileError);
        
        if (profileData) {
          userId = profileData.user_id;
          setTargetUsername(profileData.username);
          setTargetUserId(userId);
          setIsPrivate(profileData.is_private || false);
          
          console.log('✅ User ID:', userId);
          
          // Vérifier si c'est son propre profil
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setIsOwnProfile(currentUser?.id === profileData.user_id);
          
          // Si le profil est privé et que ce n'est pas le propriétaire, ne pas charger les activités
          if (profileData.is_private && currentUser?.id !== profileData.user_id) {
            console.log('🔒 Profil privé - accès refusé');
            setLoading(false);
            return;
          }
        } else {
          console.log('❌ Profil non trouvé pour:', usernameParam);
        }
      }

      console.log('🔍 Loading activities for:', userId || 'all users');

      // Charger les ratings (notes + critiques)
      let ratingsQuery = supabase
        .from('ratings')
        .select(`
          id,
          user_id,
          media_id,
          media_type,
          media_title,
          media_poster,
          rating,
          review,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .not('rating', 'is', null);
      
      if (userId) {
        ratingsQuery = ratingsQuery.eq('user_id', userId);
      }
      
      ratingsQuery = ratingsQuery
        .order('created_at', { ascending: false })
        .limit(ITEMS_PER_PAGE); // Limité à 20 au lieu de 50
      
      const { data: ratings, error: ratingsError } = await ratingsQuery;
      console.log('📊 Ratings query for user_id:', userId);
      console.log('📊 Ratings loaded:', ratings?.length || 0, 'Données:', ratings);
      if (ratingsError) console.error('❌ Erreur ratings:', ratingsError);

      // Charger les likes (avec infos média)
      let likesQuery = supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          media_id,
          media_type,
          media_title,
          media_poster,
          created_at,
          profiles:user_id (username, avatar_url)
        `);
      
      if (userId) {
        likesQuery = likesQuery.eq('user_id', userId);
      }
      
      likesQuery = likesQuery
        .order('created_at', { ascending: false })
        .limit(10); // Limité à 10 likes
      
      const { data: likes, error: likesError } = await likesQuery;
      console.log('❤️ Likes query for user_id:', userId);
      console.log('❤️ Likes loaded:', likes?.length || 0, 'Données:', likes);
      if (likesError) console.error('❌ Erreur likes:', likesError);

      // Charger les films vus (avec infos média)
      let watchedQuery = supabase
        .from('ratings')
        .select(`
          id,
          user_id,
          media_id,
          media_type,
          media_title,
          media_poster,
          is_watched,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('is_watched', true);
      
      if (userId) {
        watchedQuery = watchedQuery.eq('user_id', userId);
      }
      
      watchedQuery = watchedQuery
        .order('created_at', { ascending: false })
        .limit(10); // Limité à 10 watched
      
      const { data: watched, error: watchedError } = await watchedQuery;
      console.log('👁️ Watched query for user_id:', userId);
      console.log('👁️ Watched loaded:', watched?.length || 0, 'Données:', watched);
      if (watchedError) console.error('❌ Erreur watched:', watchedError);

      // Récupérer les infos des médias depuis TMDB
      const allActivities: ActivityItem[] = [];

      // Ratings (notes + critiques)
      if (ratings) {
        for (const rating of ratings) {
          allActivities.push({
            id: rating.id,
            type: 'review',
            user_id: rating.user_id,
            username: (rating.profiles as any)?.username || 'Utilisateur',
            avatar_url: (rating.profiles as any)?.avatar_url || '',
            media_id: rating.media_id,
            media_type: rating.media_type,
            media_title: rating.media_title || 'Sans titre',
            media_poster: rating.media_poster || '',
            rating: rating.rating,
            comment: rating.review,
            created_at: rating.created_at,
          });
        }
      }

      // Likes
      if (likes) {
        for (const like of likes) {
          allActivities.push({
            id: like.id,
            type: 'like',
            user_id: like.user_id,
            username: (like.profiles as any)?.username || 'Utilisateur',
            avatar_url: (like.profiles as any)?.avatar_url || '',
            media_id: like.media_id,
            media_type: like.media_type,
            media_title: (like as any).media_title || 'Sans titre',
            media_poster: (like as any).media_poster || '',
            created_at: like.created_at,
          });
        }
      }

      // Watched
      if (watched) {
        for (const watch of watched) {
          allActivities.push({
            id: watch.id,
            type: 'watched',
            user_id: watch.user_id,
            username: (watch.profiles as any)?.username || 'Utilisateur',
            avatar_url: (watch.profiles as any)?.avatar_url || '',
            media_id: watch.media_id,
            media_type: watch.media_type,
            media_title: (watch as any).media_title || 'Sans titre',
            media_poster: (watch as any).media_poster || '',
            created_at: watch.created_at,
          });
        }
      }

      // Trier par date
      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log('✅ Total activities loaded:', allActivities.length);
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatar = (avatar_url: string) => {
    if (!avatar_url) return { emoji: '👤', color: 'bg-gray-600' };
    const parts = avatar_url.split('|');
    return { emoji: parts[0] || '👤', color: parts[1] || 'bg-gray-600' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review': return <MessageSquare size={16} className="text-[var(--color-primary)]" />;
      case 'like': return <Heart size={16} className="text-[var(--color-accent)]" />;
      case 'watched': return <Clock size={16} className="text-[var(--color-secondary)]" />;
      default: return <Activity size={16} />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'review':
        return 'a critiqué';
      case 'like':
        return 'aime';
      case 'watched':
        return 'a regardé';
      default:
        return 'a interagi avec';
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'reviews') return activity.type === 'review';
    if (filter === 'likes') return activity.type === 'like';
    if (filter === 'watched') return activity.type === 'watched';
    return true;
  });

  // Si le profil est privé et qu'on n'est pas le propriétaire
  if (isPrivate && !isOwnProfile && !loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="rounded-2xl p-8" style={{ 
              background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 168, 85, 247), 0.2), rgba(var(--color-accent-rgb, 236, 72, 153), 0.2))', 
              border: '1px solid rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' 
            }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-button)' }}>
                <Activity size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Activité Privée</h1>
              <p className="text-gray-400 mb-6">
                L'activité de <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{targetUsername}</span> est privée.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Seul {targetUsername} peut voir ses likes, favoris et critiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/home">
                  <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition w-full sm:w-auto">
                    Retour à l'accueil
                  </button>
                </Link>
                {!user && (
                  <Link href="/auth/login">
                    <button className="px-6 py-3 rounded-lg transition w-full sm:w-auto text-white" style={{ background: 'var(--gradient-button)' }}>
                      Se connecter
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-button)' }}>
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {targetUsername ? `Activité de ${targetUsername}` : 'Activité'}
              </h1>
              <p className="text-gray-400">
                {targetUsername ? `Les dernières activités de ${targetUsername}` : 'Ce qui se passe dans la communauté'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques dynamiques */}
        {!loading && activities.length > 0 && (
          <div className="mb-8 space-y-6">
            {/* Cartes statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total activités',
                  value: activities.length,
                  icon: Zap,
                  colorVar: 'primary'
                },
                {
                  label: 'Critiques',
                  value: activities.filter(a => a.type === 'review').length,
                  icon: MessageSquare,
                  colorVar: 'primary'
                },
                {
                  label: 'J\'aime',
                  value: activities.filter(a => a.type === 'like').length,
                  icon: Heart,
                  colorVar: 'accent'
                },
                {
                  label: 'Films vus',
                  value: activities.filter(a => a.type === 'watched').length,
                  icon: Eye,
                  colorVar: 'secondary'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="relative p-4 rounded-xl border border-white/10 overflow-hidden group hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
                  style={{ 
                    background: `linear-gradient(to bottom right, rgba(var(--color-${stat.colorVar}-rgb, 168, 85, 247), 0.2), rgba(var(--color-${stat.colorVar}-rgb, 168, 85, 247), 0.05))` 
                  }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl group-hover:opacity-20 transition opacity-10" style={{ background: `var(--gradient-${stat.colorVar === 'primary' ? 'button' : 'card'})` }}></div>
                  <div className="relative">
                    <stat.icon size={18} className="mb-2" style={{ color: `var(--color-${stat.colorVar})` }} />
                    <div className="text-2xl md:text-3xl font-black mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Timeline & Distribution */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Activité récente */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-5 rounded-xl"
                style={{ 
                  background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 168, 85, 247), 0.1), rgba(var(--color-accent-rgb, 236, 72, 153), 0.05))',
                  border: '1px solid rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-[var(--color-primary)]" />
                  <h3 className="font-bold">Activité récente</h3>
                </div>
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {activity.type === 'review' && <MessageSquare size={14} className="text-[var(--color-primary)]" />}
                        {activity.type === 'like' && <Heart size={14} className="text-[var(--color-accent)]" />}
                        {activity.type === 'watched' && <Eye size={14} className="text-[var(--color-secondary)]" />}
                        <span className="text-gray-400 truncate max-w-[180px]">
                          {activity.media_title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">{getRelativeTime(activity.created_at)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Distribution par type */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="p-5 rounded-xl"
                style={{ 
                  background: 'linear-gradient(to bottom right, rgba(var(--color-secondary-rgb, 34, 211, 238), 0.1), rgba(var(--color-primary-rgb, 168, 85, 247), 0.05))',
                  border: '1px solid rgba(var(--color-secondary-rgb, 34, 211, 238), 0.2)'
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-[var(--color-secondary)]" />
                  <h3 className="font-bold">Distribution</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { 
                      type: 'review', 
                      label: 'Critiques', 
                      count: activities.filter(a => a.type === 'review').length,
                      color: 'from-blue-500 to-cyan-500',
                      icon: '💬'
                    },
                    { 
                      type: 'like', 
                      label: 'J\'aime', 
                      count: activities.filter(a => a.type === 'like').length,
                      color: 'from-pink-500 to-red-500',
                      icon: '❤️'
                    },
                    { 
                      type: 'watched', 
                      label: 'Vus', 
                      count: activities.filter(a => a.type === 'watched').length,
                      color: 'from-green-500 to-emerald-500',
                      icon: '👁️'
                    }
                  ].map((item, idx) => {
                    const percentage = activities.length > 0 
                      ? Math.round((item.count / activities.length) * 100) 
                      : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between mb-1.5 text-sm">
                          <span className="text-gray-400">{item.icon} {item.label}</span>
                          <span className="font-bold">{item.count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ 
                              background: item.type === 'review' 
                                ? 'var(--gradient-button)' 
                                : item.type === 'like'
                                  ? 'linear-gradient(to right, var(--color-accent), var(--color-primary))'
                                  : 'linear-gradient(to right, var(--color-secondary), var(--color-primary))'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              filter === 'all'
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setFilter('reviews')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              filter === 'reviews'
                ? 'bg-white/15'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={filter === 'reviews' ? { backgroundColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)', color: 'var(--color-primary)' } : {}}
          >
            <MessageSquare size={16} />
            Critiques
          </button>
          <button
            onClick={() => setFilter('likes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              filter === 'likes'
                ? 'bg-white/15'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={filter === 'likes' ? { backgroundColor: 'rgba(var(--color-accent-rgb, 236, 72, 153), 0.2)', color: 'var(--color-accent)' } : {}}
          >
            <Heart size={16} />
            J'aime
          </button>
          <button
            onClick={() => setFilter('watched')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
              filter === 'watched'
                ? 'bg-white/15'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            style={filter === 'watched' ? { backgroundColor: 'rgba(var(--color-secondary-rgb, 34, 211, 238), 0.2)', color: 'var(--color-secondary)' } : {}}
          >
            <Clock size={16} />
            Vus
          </button>
        </div>

        {/* Activities Feed */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto rounded-2xl p-10"
              style={{ 
                background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 168, 85, 247), 0.1), rgba(var(--color-accent-rgb, 236, 72, 153), 0.1))', 
                border: '1px solid rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' 
              }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-button)' }}>
                <Activity size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                {targetUsername ? `${targetUsername} n'a pas encore d'activité` : 'Aucune activité pour le moment'}
              </h3>
              <p className="text-gray-400 mb-6">
                {targetUsername 
                  ? 'Revenez plus tard pour voir les activités !' 
                  : 'Commencez à noter des films, ajouter des favoris et partager vos critiques !'}
              </p>
              {!targetUsername && (
                <Link href="/home">
                  <button className="px-6 py-3 rounded-lg transition font-semibold text-white" style={{ background: 'var(--gradient-button)' }}>
                    Explorer des films
                  </button>
                </Link>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const avatar = getAvatar(activity.avatar_url);
              
              return (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/[0.07] transition"
                >
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Link href={`/profile/${activity.username}`}>
                      <div className={`${avatar.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer hover:ring-2 transition`} style={{ ['--tw-ring-color' as any]: 'var(--color-primary)' }}>
                        {avatar.emoji}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <Link href={`/profile/${activity.username}`}>
                            <span className="font-bold transition cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                              {activity.username}
                            </span>
                          </Link>
                          <span className="text-gray-400 mx-2">{getActivityText(activity)}</span>
                          <Link href={`/${activity.media_type}/${activity.media_id}`}>
                            <span className="font-semibold transition cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = ''}>
                              {activity.media_title}
                            </span>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getActivityIcon(activity.type)}
                          <span className="text-xs text-gray-500">{getRelativeTime(activity.created_at)}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex gap-4">
                        {/* Poster */}
                        {activity.media_poster && (
                          <Link href={`/${activity.media_type}/${activity.media_id}`}>
                            <img
                              src={`https://image.tmdb.org/t/p/w154${activity.media_poster}`}
                              alt={activity.media_title}
                              className="w-16 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:ring-2 transition"
                              style={{ ['--tw-ring-color' as any]: 'var(--color-primary)' }}
                            />
                          </Link>
                        )}

                        <div className="flex-1">
                          {/* Rating */}
                          {activity.rating && (
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={`${
                                    star <= activity.rating!
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Comment */}
                          {activity.comment && (
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                              "{activity.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
        </div>
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
