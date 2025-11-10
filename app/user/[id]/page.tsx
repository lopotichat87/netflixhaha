'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import RatingStars from '@/components/RatingStars';
import { ratingsHelpers } from '@/lib/ratings';
import { supabase } from '@/lib/supabase';
import { Users, Film, Tv, Star, Heart, Eye, Calendar, TrendingUp, MapPin, Globe, UserPlus, UserMinus, Settings } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  website: string;
  is_public: boolean;
  created_at: string;
}

interface UserStats {
  total_watched: number;
  total_liked: number;
  total_rated: number;
  total_reviews: number;
  avg_rating: number;
  movies_watched: number;
  series_watched: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ratings' | 'reviews' | 'likes' | 'watched' | 'playlists'>('ratings');
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const { data: ratings = [], isLoading: loadingRatings } = useQuery({
    queryKey: ['user-ratings', userId, activeTab],
    queryFn: async () => {
      if (activeTab === 'playlists') {
        return [];
      } else if (activeTab === 'likes') {
        return await ratingsHelpers.getUserLikes(userId);
      } else if (activeTab === 'watched') {
        return await ratingsHelpers.getUserWatched(userId);
      } else {
        return await ratingsHelpers.getUserRatings(userId, 50);
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
    loadFollowStats();
    loadFavoriteMovies();
    loadPlaylists();
    checkCurrentUser();
  }, [userId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      checkIfFollowing(user.id);
    }
  };

  const checkIfFollowing = async (currentUserId: string) => {
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      setIsFollowing(false);
    }
  };

  const loadFavoriteMovies = async () => {
    try {
      const likes = await ratingsHelpers.getUserLikes(userId);
      setFavoriteMovies(likes.slice(0, 4));
    } catch (error) {
      console.error('Error loading favorite movies:', error);
    }
  };

  const loadPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*, list_items(count)')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert('Connectez-vous pour suivre cet utilisateur');
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);
        setFollowers(prev => prev - 1);
        setIsFollowing(false);
      } else {
        await supabase
          .from('user_follows')
          .insert({ follower_id: currentUserId, following_id: userId });
        setFollowers(prev => prev + 1);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFollowStats = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      ]);

      setFollowers(followersRes.count || 0);
      setFollowing(followingRes.count || 0);
    } catch (error) {
      console.error('Error loading follow stats:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const filteredRatings = activeTab === 'reviews' 
    ? ratings.filter(r => r.review && r.review.trim() !== '')
    : ratings;

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto pb-20">
        <h1>Profil de {profile.username}</h1>
        <p>En cours de développement...</p>
      </div>
    </div>
  );
}
