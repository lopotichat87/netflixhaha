'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Star, MessageSquare, Heart, Users, TrendingUp, Film, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  type: 'rating' | 'review' | 'list' | 'like';
  content: string;
  movie_title?: string;
  movie_poster?: string;
  rating?: number;
  created_at: string;
}

export default function SocialPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');
  const [userStats, setUserStats] = useState({ followers: 0, reviews: 0, ratings: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadActivities();
      loadSuggestedUsers();
      loadFollowingUsers();
      loadUserStats();
      
      // Real-time updates pour les nouvelles activités
      const channel = supabase
        .channel('social_activities')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ratings' },
          () => loadActivities()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          () => loadActivities()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab]);

  const loadActivities = async () => {
    try {
      setLoadingData(true);
      
      let ratingsData, reviewsData, likesData, watchedData;

      if (activeTab === 'following') {
        // Charger seulement les activités des utilisateurs suivis
        const followingIds = Array.from(followingUsers);
        
        if (followingIds.length === 0) {
          setActivities([]);
          setLoadingData(false);
          return;
        }

        const { data: ratings } = await supabase
          .from('ratings')
          .select(`
            id,
            user_id,
            rating,
            is_liked,
            is_watched,
            media_id,
            media_title,
            media_poster,
            media_type,
            updated_at,
            profiles:user_id (username, avatar_url)
          `)
          .in('user_id', followingIds)
          .order('updated_at', { ascending: false })
          .limit(50);

        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            id,
            user_id,
            comment,
            media_id,
            media_type,
            created_at,
            profiles:user_id (username, avatar_url)
          `)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(30);

        ratingsData = ratings;
        reviewsData = reviews;
      } else {
        // Charger toutes les activités (mode "all")
        const { data: ratings } = await supabase
          .from('ratings')
          .select(`
            id,
            user_id,
            rating,
            is_liked,
            is_watched,
            media_id,
            media_title,
            media_poster,
            media_type,
            updated_at,
            profiles:user_id (username, avatar_url)
          `)
          .order('updated_at', { ascending: false })
          .limit(100);

        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            id,
            user_id,
            comment,
            media_id,
            media_type,
            created_at,
            profiles:user_id (username, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        ratingsData = ratings;
        reviewsData = reviews;
      }

      // Combiner et formater les activités
      const allActivities: Activity[] = [];

      ratingsData?.forEach(rating => {
        // Ajouter l'activité de notation si elle existe
        if (rating.rating && rating.rating > 0) {
          allActivities.push({
            id: `rating-${rating.id}`,
            user_id: rating.user_id,
            username: (rating.profiles as any)?.username || 'Utilisateur',
            avatar_url: (rating.profiles as any)?.avatar_url,
            type: 'rating',
            content: `a noté ${rating.media_title}`,
            movie_title: rating.media_title,
            movie_poster: rating.media_poster,
            rating: rating.rating,
            created_at: rating.updated_at,
          });
        }
        
        // Ajouter l'activité de like si elle existe
        if (rating.is_liked) {
          allActivities.push({
            id: `like-${rating.id}`,
            user_id: rating.user_id,
            username: (rating.profiles as any)?.username || 'Utilisateur',
            avatar_url: (rating.profiles as any)?.avatar_url,
            type: 'like',
            content: `a liké ${rating.media_title}`,
            movie_title: rating.media_title,
            movie_poster: rating.media_poster,
            created_at: rating.updated_at,
          });
        }
        
        // Ajouter l'activité "vu" si elle existe
        if (rating.is_watched) {
          allActivities.push({
            id: `watched-${rating.id}`,
            user_id: rating.user_id,
            username: (rating.profiles as any)?.username || 'Utilisateur',
            avatar_url: (rating.profiles as any)?.avatar_url,
            type: 'watched' as any,
            content: `a vu ${rating.media_title}`,
            movie_title: rating.media_title,
            movie_poster: rating.media_poster,
            created_at: rating.updated_at,
          });
        }
      });

      reviewsData?.forEach(review => {
        if (review.comment) {
          allActivities.push({
            id: `review-${review.id}`,
            user_id: review.user_id,
            username: (review.profiles as any)?.username || 'Utilisateur',
            avatar_url: (review.profiles as any)?.avatar_url,
            type: 'review',
            content: `a écrit une critique`,
            movie_title: review.comment.substring(0, 50) + (review.comment.length > 50 ? '...' : ''),
            movie_poster: undefined,
            created_at: review.created_at,
          });
        }
      });

      // Trier par date
      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(allActivities);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSuggestedUsers = async () => {
    if (!user) return;
    
    try {
      // D'abord, récupérer les IDs (user_id) qu'on suit déjà
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];

      // Récupérer TOUS les utilisateurs disponibles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, username, avatar_url, bio')
        .neq('user_id', user.id);

      if (profilesError) {
        console.error('Erreur SQL suggestedUsers:', profilesError);
        return;
      }

      // Filtrer pour exclure ceux qu'on suit déjà
      let availableProfiles = allProfiles?.filter(p => 
        !followingIds.includes(p.user_id)
      ) || [];

      // Si tous les utilisateurs ont été suivis, réinitialiser (montrer tous les users)
      if (availableProfiles.length === 0 && allProfiles && allProfiles.length > 0) {
        console.log('🔄 Tous les utilisateurs ont été suivis, réinitialisation...');
        availableProfiles = allProfiles;
      }

      // Randomiser l'ordre
      const shuffled = availableProfiles.sort(() => Math.random() - 0.5);
      
      // Prendre les 6 premiers
      const suggestedProfiles = shuffled.slice(0, 6);

      console.log('✨ Utilisateurs suggérés:', suggestedProfiles.length, '/', availableProfiles.length, 'disponibles');
      
      setSuggestedUsers(suggestedProfiles.map(p => ({
        id: p.user_id,
        username: p.username,
        avatar_url: p.avatar_url,
        bio: p.bio,
      })));
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadFollowingUsers = async () => {
    if (!user) return;
    
    try {
      // Vérifier si la table follows existe, sinon utiliser un Set vide
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!error && data) {
        setFollowingUsers(new Set(data.map(f => f.following_id)));
      }
    } catch (error) {
      console.log('Table follows pas encore créée, utilisation mode démo');
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Compter les followers
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Compter les reviews
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Compter les ratings
      const { count: ratingsCount } = await supabase
        .from('ratings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setUserStats({
        followers: followersCount || 0,
        reviews: reviewsCount || 0,
        ratings: ratingsCount || 0,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user || followingInProgress.has(targetUserId)) {
      return;
    }

    setFollowingInProgress(prev => new Set(prev).add(targetUserId));

    try {
      const isFollowing = followingUsers.has(targetUserId);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (!error) {
          setFollowingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(targetUserId);
            return newSet;
          });
          // Recharger les stats
          loadUserStats();
        } else {
          console.error('Erreur unfollow:', error);
        }
      } else {
        // Follow - Vérifier d'abord si existe déjà
        const { data: existing } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single();

        if (existing) {
          // Déjà suivi, juste mettre à jour l'état local
          setFollowingUsers(prev => new Set(prev).add(targetUserId));
        } else {
          // Créer le follow
          const { error } = await supabase
            .from('follows')
            .insert({
              follower_id: user.id,
              following_id: targetUserId,
            });

          if (error) {
            // Si erreur 409 (conflict), c'est que ça existe déjà
            if (error.code === '23505') {
              console.log('Déjà suivi, mise à jour état local');
              setFollowingUsers(prev => new Set(prev).add(targetUserId));
            } else {
              console.error('Erreur follow:', error);
            }
          } else {
            setFollowingUsers(prev => new Set(prev).add(targetUserId));
            // Recharger les stats et les activités
            loadUserStats();
            if (activeTab === 'following') {
              loadActivities();
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Erreur follow/unfollow:', error);
      // En cas d'erreur, recharger l'état depuis la BD
      loadFollowingUsers();
    } finally {
      setFollowingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Star size={20} className="text-yellow-500 fill-yellow-500" />;
      case 'review': return <MessageSquare size={20} className="text-purple-500" />;
      case 'like': return <Heart size={20} className="text-pink-500 fill-pink-500" />;
      case 'watched': return <Film size={20} className="text-green-500" />;
      default: return <Film size={20} className="text-cyan-500" />;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Activité Sociale
            </h1>
            <p className="text-gray-400">Découvrez ce que votre communauté regarde et aime</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            {[
              { key: 'all', label: 'Toutes les activités', icon: TrendingUp },
              { key: 'following', label: 'Mes abonnements', icon: Users },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Fil d'activité */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header avec compteur */}
              {!loadingData && activities.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-400">
                    {activeTab === 'following' 
                      ? `Activités de vos abonnements` 
                      : `Toutes les activités`
                    }
                  </h2>
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                    {activities.length} {activities.length === 1 ? 'activité' : 'activités'}
                  </span>
                </div>
              )}
              
              {loadingData ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl">
                  <Users size={48} className="mx-auto text-gray-600 mb-4" />
                  {activeTab === 'following' ? (
                    <>
                      <p className="text-gray-400 mb-4">Vous ne suivez personne encore</p>
                      <p className="text-sm text-gray-500">
                        Découvrez des utilisateurs à suivre dans la section "À suivre" →
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">Aucune activité récente</p>
                  )}
                </div>
              ) : (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Link href={`/user/${activity.user_id}`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {activity.avatar_url ? (
                            <img src={activity.avatar_url} alt={activity.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-white" />
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* User info */}
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/user/${activity.user_id}`} className="font-semibold hover:text-purple-400 transition">
                            {activity.username}
                          </Link>
                          <span className="text-gray-400">{activity.content}</span>
                          {activity.type === 'rating' && activity.rating && (
                            <div className="flex items-center gap-1 ml-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={i < activity.rating! ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Movie info */}
                        {activity.movie_poster && (
                          <div className="flex gap-3 mt-3">
                            <img
                              src={`https://image.tmdb.org/t/p/w200${activity.movie_poster}`}
                              alt={activity.movie_title}
                              className="w-16 h-24 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium group-hover:text-purple-400 transition">
                                {activity.movie_title}
                              </h4>
                            </div>
                          </div>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {getTimeAgo(activity.created_at)}
                          </span>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggestions */}
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users size={24} className="text-purple-400" />
                    À suivre
                  </h3>
                  <button
                    onClick={() => loadSuggestedUsers()}
                    className="text-xs text-purple-400 hover:text-purple-300 transition"
                    title="Actualiser les suggestions"
                  >
                    ↻ Actualiser
                  </button>
                </div>
                {suggestedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <Link href={`/user/${suggestedUser.id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center overflow-hidden">
                          {suggestedUser.avatar_url ? (
                            <img src={suggestedUser.avatar_url} alt={suggestedUser.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{suggestedUser.username}</p>
                          <p className="text-sm text-gray-400 truncate">{suggestedUser.bio || 'Cinéphile'}</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleFollow(suggestedUser.id)}
                        disabled={followingInProgress.has(suggestedUser.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                          followingUsers.has(suggestedUser.id)
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        } ${followingInProgress.has(suggestedUser.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {followingInProgress.has(suggestedUser.id) 
                          ? '...' 
                          : followingUsers.has(suggestedUser.id) 
                            ? 'Suivi' 
                            : 'Suivre'
                        }
                      </button>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>Aucune suggestion pour le moment</p>
                    <button
                      onClick={() => loadSuggestedUsers()}
                      className="mt-2 text-purple-400 hover:text-purple-300"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold mb-4">Votre Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Followers</span>
                    <span className="text-2xl font-bold text-purple-400">{userStats.followers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Critiques</span>
                    <span className="text-2xl font-bold text-pink-400">{userStats.reviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Notes</span>
                    <span className="text-2xl font-bold text-cyan-400">{userStats.ratings}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
