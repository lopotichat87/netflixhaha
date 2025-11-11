'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Users, UserPlus, UserMinus, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  bio?: string;
}

interface SearchResult {
  id: string;
  username: string;
  avatar_url: string;
  bio?: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [followers, setFollowers] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Attendre que l'auth soit chargé avant de rediriger
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadFriends();
  }, [user, authLoading, router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadFriends = async () => {
    if (!user) {
      console.log('⚠️ loadFriends: pas d\'utilisateur');
      return;
    }

    try {
      console.log('🔄 Chargement friends pour user:', user.id);

      // Charger tous les utilisateurs suivis (following)
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      console.log('📊 Follows data:', followsData?.length || 0, 'résultats');

      if (followsError) {
        console.error('❌ Erreur following:', followsError);
      } else if (followsData && followsData.length > 0) {
        // Récupérer les profils des utilisateurs suivis
        const followingIds = followsData.map(f => f.following_id);
        console.log('👥 Following IDs:', followingIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, username, avatar_url, bio')
          .in('user_id', followingIds);

        if (profilesError) {
          console.error('❌ Erreur profiles:', profilesError);
        } else if (profilesData) {
          console.log('✅ Friends chargés:', profilesData.length);
          // Mapper avec user_id comme identifiant principal
          const friendsList = profilesData.map(p => ({
            id: p.user_id,
            username: p.username,
            avatar_url: p.avatar_url,
            bio: p.bio,
          }));
          setFriends(friendsList);
          setFollowingUsers(new Set(friendsList.map(f => f.id)));
        }
      } else {
        console.log('ℹ️ Aucun abonnement');
        setFriends([]);
        setFollowingUsers(new Set());
      }

      // Charger les followers (ceux qui te suivent)
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      console.log('📊 Followers data:', followersData?.length || 0, 'résultats');

      if (followersError) {
        console.error('❌ Erreur followers:', followersError);
      } else if (followersData && followersData.length > 0) {
        // Récupérer les profils des followers
        const followerIds = followersData.map(f => f.follower_id);
        console.log('👥 Follower IDs:', followerIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, username, avatar_url, bio')
          .in('user_id', followerIds);

        if (profilesError) {
          console.error('❌ Erreur profiles followers:', profilesError);
        } else if (profilesData) {
          console.log('✅ Followers chargés:', profilesData.length);
          // Mapper avec user_id comme identifiant principal
          const followersList = profilesData.map(p => ({
            id: p.user_id,
            username: p.username,
            avatar_url: p.avatar_url,
            bio: p.bio,
          }));
          setFollowers(followersList);
        }
      } else {
        console.log('ℹ️ Aucun follower');
        setFollowers([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      console.log('🔍 Recherche utilisateurs:', searchQuery);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, username, avatar_url, bio')
        .ilike('username', `%${searchQuery}%`)
        .neq('user_id', user!.id)
        .limit(20);

      if (error) {
        console.error('❌ Erreur recherche:', error);
        return;
      }

      console.log('✅ Résultats trouvés:', data?.length || 0);

      // Mapper avec user_id comme id
      const results = data?.map(p => ({
        id: p.user_id,
        username: p.username,
        avatar_url: p.avatar_url,
        bio: p.bio,
      })) || [];

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user || followingInProgress.has(targetUserId)) return;

    const isCurrentlyFollowing = followingUsers.has(targetUserId);
    
    // Mise à jour optimiste immédiate de l'UI
    if (isCurrentlyFollowing) {
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    } else {
      setFollowingUsers(prev => new Set(prev).add(targetUserId));
    }

    setFollowingInProgress(prev => new Set(prev).add(targetUserId));

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) {
          // Rollback en cas d'erreur
          setFollowingUsers(prev => new Set(prev).add(targetUserId));
          throw error;
        }
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error && error.code !== '23505') {
          // Rollback en cas d'erreur (sauf si duplicate)
          setFollowingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(targetUserId);
            return newSet;
          });
          throw error;
        }
      }
      
      // Recharger en background pour sync followers/friends
      loadFriends();
    } catch (error: any) {
      console.error('Error follow/unfollow:', error);
    } finally {
      setFollowingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  const getAvatar = (avatar_url: string) => {
    if (!avatar_url) return { emoji: '👤', color: 'bg-gray-600', isImage: false };
    
    if (avatar_url.startsWith('http')) {
      return { emoji: '', color: '', isImage: true, url: avatar_url };
    }
    
    const parts = avatar_url.split('|');
    return { emoji: parts[0] || '👤', color: parts[1] || 'bg-gray-600', isImage: false };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mes Amis
          </h1>
          <div className="flex gap-6 text-gray-400">
            <p>{friends.length} abonnement{friends.length > 1 ? 's' : ''}</p>
            <span>•</span>
            <p>{followers.length} follower{followers.length > 1 ? 's' : ''}</p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition text-white"
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Résultats de recherche {searching && <span className="text-sm text-gray-400">(recherche...)</span>}
            </h2>
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result) => {
                  const avatar = getAvatar(result.avatar_url);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                    >
                      <Link href={`/user/${result.id}`} className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                          {avatar.isImage ? (
                            <img src={avatar.url} alt={result.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`${avatar.color} w-full h-full flex items-center justify-center text-2xl`}>
                              {avatar.emoji}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{result.username}</div>
                          {result.bio && (
                            <div className="text-sm text-gray-400 truncate">{result.bio}</div>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => handleFollow(result.id)}
                        disabled={followingInProgress.has(result.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                          followingUsers.has(result.id)
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-purple-600 hover:bg-purple-700'
                        } ${followingInProgress.has(result.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {followingInProgress.has(result.id) ? (
                          '...'
                        ) : followingUsers.has(result.id) ? (
                          <>
                            <UserMinus size={16} />
                            Ne plus suivre
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            Suivre
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : !searching ? (
              <div className="text-center py-8 text-gray-400">
                Aucun utilisateur trouvé
              </div>
            ) : null}
          </div>
        )}

        {/* Friends List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Mes abonnements ({friends.length})</h2>
          {friends.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {friends.map((friend) => {
                const avatar = getAvatar(friend.avatar_url);
                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Link href={`/user/${friend.id}`}>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                          {avatar.isImage ? (
                            <img src={avatar.url} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`${avatar.color} w-full h-full flex items-center justify-center text-3xl`}>
                              {avatar.emoji}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold group-hover:text-purple-400 transition truncate">{friend.username}</div>
                          {friend.bio && (
                            <div className="text-sm text-gray-400 truncate">{friend.bio}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <Users size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">Vous ne suivez personne encore</p>
              <p className="text-sm text-gray-500">Utilisez la recherche pour trouver des utilisateurs à suivre</p>
            </div>
          )}
        </div>

        {/* Followers List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mes followers ({followers.length})</h2>
          {followers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {followers.map((follower) => {
                const avatar = getAvatar(follower.avatar_url);
                const isFollowingBack = followingUsers.has(follower.id);
                return (
                  <motion.div
                    key={follower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition"
                  >
                    <Link href={`/user/${follower.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                        {avatar.isImage ? (
                          <img src={avatar.url} alt={follower.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`${avatar.color} w-full h-full flex items-center justify-center text-3xl`}>
                            {avatar.emoji}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{follower.username}</div>
                        {follower.bio && (
                          <div className="text-sm text-gray-400 truncate">{follower.bio}</div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleFollow(follower.id)}
                      disabled={followingInProgress.has(follower.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                        isFollowingBack
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } ${followingInProgress.has(follower.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {followingInProgress.has(follower.id) 
                        ? '...' 
                        : isFollowingBack 
                          ? 'Suivi' 
                          : 'Suivre'
                      }
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <Users size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">Personne ne vous suit encore</p>
              <p className="text-sm text-gray-500">Partagez votre profil pour gagner des followers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
