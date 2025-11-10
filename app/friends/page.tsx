'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Users, UserPlus, Check, X, Search } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  status: 'pending' | 'accepted';
  isSender: boolean;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadFriends();
  }, [user, router]);

  const loadFriends = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');

      // Charger les amitiés acceptées
      const { data: accepted } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          profiles!friendships_friend_id_fkey(username, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`);

      // Charger les demandes en attente
      const { data: pending } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          status,
          profiles!friendships_friend_id_fkey(username, avatar_url)
        `)
        .eq('status', 'pending')
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`);

      if (accepted) {
        setFriends(accepted.map((f: any) => ({
          id: f.id,
          username: f.profiles.username,
          avatar_url: f.profiles.avatar_url,
          status: 'accepted',
          isSender: f.user_id === user!.id,
        })));
      }

      if (pending) {
        setPendingRequests(pending.map((f: any) => ({
          id: f.id,
          username: f.profiles.username,
          avatar_url: f.profiles.avatar_url,
          status: 'pending',
          isSender: f.user_id === user!.id,
        })));
      }

    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);
      loadFriends();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      loadFriends();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const getAvatar = (avatar_url: string) => {
    if (!avatar_url) return { emoji: '👤', color: 'bg-gray-600' };
    const parts = avatar_url.split('|');
    return { emoji: parts[0] || '👤', color: parts[1] || 'bg-gray-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Amis</h1>
            <p className="text-gray-400">{friends.length} amis</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Pending Requests */}
        {pendingRequests.filter(req => !req.isSender).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Demandes d'amitié</h2>
            <div className="space-y-3">
              {pendingRequests.filter(req => !req.isSender).map((request) => {
                const avatar = getAvatar(request.avatar_url);
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`${avatar.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                        {avatar.emoji}
                      </div>
                      <div>
                        <div className="font-semibold">{request.username}</div>
                        <div className="text-sm text-gray-400">Vous a envoyé une demande</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="p-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Mes amis ({friends.length})</h2>
          {friends.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {friends.map((friend) => {
                const avatar = getAvatar(friend.avatar_url);
                return (
                  <Link key={friend.id} href={`/profile/${friend.username}`}>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <div className={`${avatar.color} w-14 h-14 rounded-full flex items-center justify-center text-3xl`}>
                        {avatar.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{friend.username}</div>
                        <div className="text-sm text-gray-400">Ami</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Vous n'avez pas encore d'amis</p>
              <p className="text-sm mt-2">Cherchez des utilisateurs pour les ajouter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
