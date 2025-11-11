'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Heart, Star, List, Film, TrendingUp, Calendar, Users, Settings, UserCircle, Eye, Edit3, UserPlus, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import EditProfileModal from '@/components/EditProfileModal';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/Avatar';

interface ProfileData {
  username: string;
  bio: string;
  avatar_url: string;
  banner_url?: string;
  created_at: string;
  user_id: string;
  is_private?: boolean;
  stats: {
    watched: number;
    rated: number;
    liked: number;
    lists: number;
  };
}

interface Media {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  media_type: string;
  rating?: number;
  review?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<'favorites' | 'likes' | 'watched' | 'ratings' | 'actors' | 'lists' | 'stats'>('favorites');
  const [favoriteMovies, setFavoriteMovies] = useState<Media[]>([]);
  const [likedMovies, setLikedMovies] = useState<Media[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<Media[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showAllLikes, setShowAllLikes] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [likesPage, setLikesPage] = useState(0);
  const [favoritesPage, setFavoritesPage] = useState(0);
  const ITEMS_PER_PAGE = 8;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [favoriteActors, setFavoriteActors] = useState<any[]>([]);
  const [thisYearWatched, setThisYearWatched] = useState(0);
  const [activityData, setActivityData] = useState<number[]>([]);
  const [moviesWatched, setMoviesWatched] = useState(0);
  const [seriesWatched, setSeriesWatched] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [followersProfiles, setFollowersProfiles] = useState<any[]>([]);
  const [followingProfiles, setFollowingProfiles] = useState<any[]>([]);
  const [userLists, setUserLists] = useState<any[]>([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [username]);

  // Recharger les données quand on revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [username]);

  const loadProfile = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      console.log('🔍 Recherche du profil pour username:', username);
      
      // Charger le profil - essayer d'abord exact match
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      // Si pas trouvé, essayer avec trim et différentes variantes
      if (profileError && profileError.code === 'PGRST116') {
        console.log('🔄 Pas trouvé, essai avec trim et variantes...');
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*');
        
        // Chercher manuellement avec trim
        if (profiles && profiles.length > 0) {
          profileData = profiles.find(p => 
            p.username?.trim().toLowerCase() === username.toLowerCase() ||
            p.username?.toLowerCase() === username.toLowerCase()
          ) || null;
          
          if (profileData) {
            profileError = null;
            console.log('✅ Profil trouvé avec trim:', profileData.username);
          }
        }
      }

      console.log('📊 Profil trouvé:', profileData);
      console.log('❌ Erreur:', profileError);

      if (profileError) {
        // Essayer de trouver tous les profils pour déboguer
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('username, user_id')
          .limit(10);
        console.log('📋 Tous les profils disponibles:', allProfiles);
        console.log('🔎 Vous cherchez:', username);
        throw profileError;
      }

      // Vérifier si c'est son propre profil
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwnProfile(user?.id === profileData.user_id);

      // Charger les followers (ceux qui suivent ce profil)
      const { data: followersData, count: followersCount } = await supabase
        .from('follows')
        .select('follower_id', { count: 'exact' })
        .eq('following_id', profileData.user_id);

      let followersProfilesData: any[] = [];
      if (followersData && followersData.length > 0) {
        const followerIds = followersData.map((f: any) => f.follower_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', followerIds);
        
        followersProfilesData = profiles || [];
      }

      // Charger les following (ceux que ce profil suit)
      const { data: followingData, count: followingCount } = await supabase
        .from('follows')
        .select('following_id', { count: 'exact' })
        .eq('follower_id', profileData.user_id);

      let followingProfilesData: any[] = [];
      if (followingData && followingData.length > 0) {
        const followingIds = followingData.map((f: any) => f.following_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', followingIds);
        
        followingProfilesData = profiles || [];
      }

      console.log('👥 Followers:', followersCount, '→', followersProfilesData.length, 'profils');
      console.log('👤 Following:', followingCount, '→', followingProfilesData.length, 'profils');

      setFollowersCount(followersCount || 0);
      setFollowingCount(followingCount || 0);
      setFollowersProfiles(followersProfilesData);
      setFollowingProfiles(followingProfilesData);

      // Vérifier si l'utilisateur suit déjà ce profil
      if (user?.id && user.id !== profileData.user_id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.user_id)
          .single();

        setIsFollowing(!!followData);
      }

      // Charger TOUTES les stats pour ce user
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('is_watched, rating, is_liked, media_type')
        .eq('user_id', profileData.user_id);

      // Charger les likes depuis la table favorites aussi
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.user_id);

      // Charger le nombre de reviews/critiques
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.user_id);

      // Charger le nombre de listes
      const { count: listsCount } = await supabase
        .from('user_lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profileData.user_id);

      // Calculer les stats en utilisant toutes les sources
      const watchedCount = allRatings?.filter(r => r.is_watched).length || 0;
      const ratedFromRatings = allRatings?.filter(r => r.rating !== null && r.rating > 0).length || 0;
      const likedFromRatings = allRatings?.filter(r => r.is_liked === true).length || 0;

      // Calculer les films vus cette année
      const currentYear = new Date().getFullYear();
      const { data: thisYearRatings } = await supabase
        .from('ratings')
        .select('created_at, is_watched')
        .eq('user_id', profileData.user_id)
        .eq('is_watched', true)
        .gte('created_at', `${currentYear}-01-01`);
      
      const thisYearCount = thisYearRatings?.length || 0;
      setThisYearWatched(thisYearCount);

      // Calculer films vus vs séries vues
      const moviesCount = allRatings?.filter(r => r.is_watched && r.media_type === 'movie').length || 0;
      const seriesCount = allRatings?.filter(r => r.is_watched && r.media_type === 'tv').length || 0;
      setMoviesWatched(moviesCount);
      setSeriesWatched(seriesCount);

      const stats = {
        watched: watchedCount,
        rated: Math.max(ratedFromRatings, reviewsCount || 0), // Prendre le max entre ratings et reviews
        liked: Math.max(likedFromRatings, favoritesCount || 0), // Prendre le max entre les deux sources
        lists: listsCount || 0,
      };

      console.log('Profile stats:', {
        watchedCount,
        ratedFromRatings,
        reviewsCount,
        likedFromRatings,
        favoritesCount,
        listsCount,
        finalStats: stats
      });

      setProfile({
        username: profileData.username,
        bio: profileData.bio || 'Cinéphile passionné',
        avatar_url: profileData.avatar_url || '',
        banner_url: profileData.banner_url,
        created_at: profileData.created_at,
        user_id: profileData.user_id,
        stats,
      });

      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      // Charger TOUS LES LIKES depuis la table favorites
      const { data: allLikesData, error: likesError } = await supabase
        .from('favorites')
        .select('media_id, media_type, created_at, is_favorite')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (likesError) {
        console.error('Erreur chargement likes:', likesError);
        console.warn('Si erreur "column is_favorite does not exist", exécutez: ALTER TABLE favorites ADD COLUMN is_favorite BOOLEAN DEFAULT false;');
      }

      console.log('Tous les likes chargés:', allLikesData?.length || 0);
      
      // LOG DÉTAILLÉ : Afficher TOUTES les données is_favorite
      console.log('🔍 DONNÉES BRUTES is_favorite:');
      allLikesData?.forEach((item, index) => {
        console.log(`  [${index}] ${item.media_type}/${item.media_id}: is_favorite =`, item.is_favorite, `(type: ${typeof item.is_favorite})`);
      });
      
      const favoriteTrueCount = allLikesData?.filter(l => l.is_favorite === true).length || 0;
      const favoriteFalseCount = allLikesData?.filter(l => l.is_favorite === false).length || 0;
      const favoriteNullCount = allLikesData?.filter(l => l.is_favorite === null).length || 0;
      const favoriteUndefinedCount = allLikesData?.filter(l => l.is_favorite === undefined).length || 0;
      
      console.log('📊 Comptage AVANT enrichissement:');
      console.log('  - true:', favoriteTrueCount);
      console.log('  - false:', favoriteFalseCount);
      console.log('  - null:', favoriteNullCount);
      console.log('  - undefined:', favoriteUndefinedCount);

      // Enrichir les likes avec TMDB
      const enrichedLikes = await Promise.all(
        (allLikesData || []).map(async (like: any) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/${like.media_type}/${like.media_id}?api_key=${API_KEY}&language=fr-FR`
            );
            const data = await response.json();
            return {
              id: like.media_id,
              media_type: like.media_type,
              title: data.title || data.name || 'Sans titre',
              poster_path: data.poster_path || '',
              vote_average: data.vote_average || 0,
              release_date: data.release_date || data.first_air_date || '',
              is_favorite: like.is_favorite === true, // Convertir explicitement en boolean
            };
          } catch {
            return null;
          }
        })
      );

      const validLikes = enrichedLikes.filter((m): m is any => m !== null && !!m.poster_path);
      console.log('✅ Likes enrichis:', validLikes.length);
      console.log('📊 Répartition is_favorite:', {
        true: validLikes.filter((m: any) => m.is_favorite === true).length,
        false: validLikes.filter((m: any) => m.is_favorite === false).length,
        null: validLikes.filter((m: any) => m.is_favorite === null).length,
        undefined: validLikes.filter((m: any) => m.is_favorite === undefined).length
      });
      
      // Convertir NULL en false pour tous les likes
      const likesWithBooleans = validLikes.map((m: any) => ({
        ...m,
        is_favorite: m.is_favorite === true // NULL/undefined/false deviennent false
      }));
      
      setLikedMovies(likesWithBooleans);

      // Filtrer les FAVORIS (is_favorite = true)
      const validFavorites = likesWithBooleans.filter((m: any) => m.is_favorite === true);
      console.log('⭐ Favoris détectés:', validFavorites.length);
      if (validFavorites.length > 0) {
        console.log('Premier favori:', validFavorites[0]);
      }

      setFavoriteMovies(validFavorites);
      
      // Créer un Set des IDs de favoris pour vérification rapide
      const favIds = new Set(validFavorites.map((f: Media) => `${f.media_type}-${f.id}`));
      setFavoriteIds(favIds);
      console.log('🎯 FavoriteIds Set créé avec', favIds.size, 'éléments');

      // Charger les films VUS (ratings.is_watched = true)
      const { data: watchedData } = await supabase
        .from('ratings')
        .select('media_id, media_title, media_poster, media_type, rating, updated_at')
        .eq('user_id', profileData.user_id)
        .eq('is_watched', true)
        .order('updated_at', { ascending: false })
        .limit(50);

      // Enrichir les films vus avec TMDB si nécessaire
      const enrichedWatched = await Promise.all(
        (watchedData || []).map(async (movie: any) => {
          if (!movie.media_title || !movie.media_poster) {
            try {
              const response = await fetch(
                `https://api.themoviedb.org/3/${movie.media_type}/${movie.media_id}?api_key=${API_KEY}&language=fr-FR`
              );
              const data = await response.json();
              return {
                id: movie.media_id,
                media_type: movie.media_type,
                title: data.title || data.name || 'Sans titre',
                poster_path: data.poster_path || '',
                vote_average: data.vote_average || 0,
                release_date: data.release_date || data.first_air_date || '',
                rating: movie.rating,
              };
            } catch {
              return {
                id: movie.media_id,
                media_type: movie.media_type,
                title: movie.media_title || 'Sans titre',
                poster_path: movie.media_poster || '',
                vote_average: 0,
                release_date: '',
                rating: movie.rating,
              };
            }
          }
          return {
            id: movie.media_id,
            media_type: movie.media_type,
            title: movie.media_title,
            poster_path: movie.media_poster,
            vote_average: 0,
            release_date: '',
            rating: movie.rating,
          };
        })
      );

      console.log('Films vus:', enrichedWatched.filter(m => m.poster_path).length);
      setWatchedMovies(enrichedWatched.filter(m => m.poster_path));

      // Charger les films notés depuis ratings ET reviews
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('media_id, media_title, media_poster, media_type, rating, review, updated_at')
        .eq('user_id', profileData.user_id)
        .not('rating', 'is', null)
        .gt('rating', 0)
        .order('updated_at', { ascending: false })
        .limit(50);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('media_id, media_type, rating, comment, created_at')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Combiner et dédupliquer
      const allRatingsMap = new Map();
      
      if (ratingsData) {
        ratingsData.forEach((r: any) => {
          allRatingsMap.set(`${r.media_type}-${r.media_id}`, {
            id: r.media_id,
            title: r.media_title || '',
            poster_path: r.media_poster || '',
            media_type: r.media_type || 'movie',
            rating: r.rating,
            review: r.review,
          });
        });
      }

      if (reviewsData) {
        reviewsData.forEach((r: any) => {
          const key = `${r.media_type}-${r.media_id}`;
          if (!allRatingsMap.has(key)) {
            allRatingsMap.set(key, {
              id: r.media_id,
              media_type: r.media_type,
              rating: r.rating,
              review: r.comment,
              title: '',
              poster_path: '',
            });
          }
        });
      }

      const ratedMoviesData = Array.from(allRatingsMap.values()).slice(0, 24);
      
      // Récupérer les infos manquantes depuis TMDB
      const enrichedRatings = await Promise.all(
        ratedMoviesData.map(async (movie) => {
          if (!movie.title || !movie.poster_path) {
            try {
              const response = await fetch(
                `https://api.themoviedb.org/3/${movie.media_type}/${movie.id}?api_key=${API_KEY}&language=fr-FR`
              );
              const data = await response.json();
              return {
                ...movie,
                title: data.title || data.name || 'Sans titre',
                poster_path: data.poster_path || '',
                vote_average: data.vote_average || 0,
                release_date: data.release_date || data.first_air_date || '',
              };
            } catch {
              return movie;
            }
          }
          return movie;
        })
      );

      console.log('Rated movies total:', enrichedRatings.length);
      setRatedMovies(enrichedRatings.filter(m => m.poster_path));

      // Charger les acteurs favoris
      const { data: actors, error: actorsError } = await supabase
        .from('favorite_actors')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false });

      console.log('Favorite actors:', actors?.length || 0, actorsError);

      if (actors && actors.length > 0) {
        setFavoriteActors(actors);
      }

      // Calculer l'activité des 6 derniers mois
      const monthlyActivity = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const { count } = await supabase
          .from('ratings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.user_id)
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());
        
        monthlyActivity.push(count || 0);
      }
      setActivityData(monthlyActivity);

      // Charger les listes de l'utilisateur
      const { data: listsData, error: listsError } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', profileData.user_id)
        .order('created_at', { ascending: false });

      if (listsError) {
        console.error('Erreur chargement listes:', listsError);
      } else {
        // Pour chaque liste, charger les éléments
        const listsWithItems = await Promise.all(
          (listsData || []).map(async (list: any) => {
            const { data: itemsData, count } = await supabase
              .from('list_items')
              .select('media_id, media_type, media_title, media_poster_path', { count: 'exact' })
              .eq('list_id', list.id)
              .limit(4);

            return {
              ...list,
              items: itemsData || [],
              itemsCount: count || 0,
            };
          })
        );

        console.log('Listes chargées:', listsWithItems.length);
        setUserLists(listsWithItems);
      }

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) {
      // Rediriger vers login si pas connecté
      const router = (await import('next/navigation')).useRouter;
      router().push('/auth/login');
      return;
    }

    setFollowLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('friend_id', profile.user_id);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        // Recharger les profils des followers
        loadProfile();
      } else {
        // Follow
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUser.id,
            friend_id: profile.user_id,
            status: 'accepted'
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        // Recharger les profils des followers
        loadProfile();
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      alert('Erreur lors du suivi: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Profil introuvable</h1>
            <p className="text-gray-400 mb-6">Cet utilisateur n'existe pas</p>
            <Link href="/home">
              <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                Retour à l'accueil
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si le profil est privé et si l'utilisateur n'est pas le propriétaire
  if (profile.is_private && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-600/20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <UserCircle size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Profil Privé</h1>
              <p className="text-gray-400 mb-6">
                Ce profil est privé. Seul <span className="text-purple-400 font-semibold">{profile.username}</span> peut voir son contenu.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/home">
                  <button className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition w-full sm:w-auto">
                    Retour à l'accueil
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition w-full sm:w-auto">
                    Se connecter
                  </button>
                </Link>
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

      {/* Banner */}
      <div className="relative h-64 bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900 mt-20">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          {/* Avatar */}
          <Avatar 
            avatarUrl={profile.avatar_url} 
            size="2xl"
            className="border-4 border-[#141414] shadow-xl"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{profile.username}</h1>
              {isOwnProfile && (
                <Link href="/settings">
                  <button 
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition font-semibold text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Modifier
                  </button>
                </Link>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">{profile.bio}</p>
            
            {/* Stats - Scroll horizontal sur mobile */}
            <div className="mt-4 sm:mt-6">
              {/* Mobile + Desktop: Ligne horizontale avec scroll si nécessaire */}
              <div className="flex items-center gap-3 md:gap-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{moviesWatched}</div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Films</div>
                </div>
                <div className="h-10 w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{seriesWatched}</div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Séries</div>
                </div>
                <div className="h-10 w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{thisYearWatched}</div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Cette année</div>
                </div>
                <div className="h-10 w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{followingCount}</div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Following</div>
                </div>
                <div className="h-10 w-px bg-gray-700"></div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{followersCount}</div>
                  <div className="text-xs text-gray-600 mt-1 uppercase tracking-wider">Followers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && (
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base flex-1 md:flex-initial ${
                  isFollowing
                    ? 'bg-white/10 hover:bg-red-600/20 border border-white/20 hover:border-red-500'
                    : 'shadow-lg shadow-purple-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={!isFollowing ? { background: 'var(--gradient-button)' } : {}}
              >
                {followLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
                    <span>{isFollowing ? 'Ne plus suivre' : 'Suivre'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'favorites', label: 'Favoris', icon: Star },
              { id: 'likes', label: 'Likes', icon: Heart },
              { id: 'watched', label: 'Vus', icon: Eye },
              { id: 'ratings', label: 'Notes', icon: Star },
              { id: 'actors', label: 'Acteurs', icon: UserCircle },
              { id: 'lists', label: 'Listes', icon: List },
              { id: 'stats', label: 'Stats', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 sm:pb-4 border-b-2 transition whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content avec sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          {/* Main content */}
          <div className="lg:col-span-2">
          {activeTab === 'likes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Films likés ({likedMovies.length})</h2>
                <Link 
                  href={`/profile/${profile.username}/all-likes`}
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                >
                  Voir tout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {likedMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {likedMovies.slice(likesPage * ITEMS_PER_PAGE, (likesPage + 1) * ITEMS_PER_PAGE).map((movie: any) => {
                      const isFavorite = movie.is_favorite === true;
                      
                      const toggleFavorite = async (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (!isOwnProfile) return;
                        
                        try {
                          const { supabase } = await import('@/lib/supabase');
                          
                          console.log(`🔄 Toggle favori pour "${movie.title}" (${movie.media_type}/${movie.id})`);
                          console.log(`   État actuel: ${isFavorite ? 'FAVORI' : 'NON FAVORI'}`);
                          console.log(`   Nouvelle valeur: ${!isFavorite}`);
                          
                          // Toggle is_favorite dans la table favorites
                          const { data: updateResult, error } = await supabase
                            .from('favorites')
                            .update({ is_favorite: !isFavorite })
                            .eq('media_id', movie.id)
                            .eq('media_type', movie.media_type)
                            .select();
                          
                          if (error) {
                            console.error('❌ Erreur UPDATE:', error);
                            alert('Erreur lors de la mise à jour. Assurez-vous que la colonne is_favorite existe dans la table favorites.');
                            return;
                          }
                          
                          console.log('✅ UPDATE réussi. Résultat:', updateResult);
                          console.log(`✨ ${isFavorite ? 'Retiré des' : 'Ajouté aux'} favoris: ${movie.title}`);
                          
                          // Vérifier immédiatement en BDD
                          const { data: verifyData } = await supabase
                            .from('favorites')
                            .select('media_id, media_type, is_favorite')
                            .eq('media_id', movie.id)
                            .eq('media_type', movie.media_type)
                            .single();
                          
                          console.log('🔍 Vérification en BDD après UPDATE:', verifyData);
                          
                          // Mettre à jour l'état local immédiatement
                          const updatedMovie = { ...movie, is_favorite: !isFavorite };
                          
                          if (isFavorite) {
                            // Retirer des favoris
                            setFavoriteIds(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(`${movie.media_type}-${movie.id}`);
                              return newSet;
                            });
                            setFavoriteMovies(prev => prev.filter(f => !(f.id === movie.id && f.media_type === movie.media_type)));
                          } else {
                            // Ajouter aux favoris
                            setFavoriteIds(prev => new Set(prev).add(`${movie.media_type}-${movie.id}`));
                            setFavoriteMovies(prev => [...prev, updatedMovie]);
                          }
                          
                          // Mettre à jour dans likedMovies
                          setLikedMovies(prev => prev.map(m => 
                            m.id === movie.id && m.media_type === movie.media_type 
                              ? updatedMovie 
                              : m
                          ));
                        } catch (error) {
                          console.error('Error toggling favorite:', error);
                        }
                      };
                      
                      return (
                        <div key={movie.id} className="relative">
                          <Link href={`/${movie.media_type}/${movie.id}`}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="group cursor-pointer"
                            >
                              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                                {movie.poster_path ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <Film size={48} className="text-gray-600" />
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 bg-pink-500/90 p-1.5 rounded-lg">
                                  <Heart size={14} className="fill-white" />
                                </div>
                                {isOwnProfile && (
                                  <button
                                    onClick={toggleFavorite}
                                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 z-10 ${
                                      isFavorite 
                                        ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                                        : 'bg-gray-800/80 hover:bg-gray-700'
                                    }`}
                                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                  >
                                    <Star size={14} className={isFavorite ? 'fill-white text-white' : 'text-gray-400'} />
                                  </button>
                                )}
                                {movie.rating && (
                                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-semibold">{movie.rating}</span>
                                  </div>
                                )}
                              </div>
                              <h3 className="text-sm font-semibold line-clamp-2 transition">
                                {movie.title}
                              </h3>
                            </motion.div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  {/* Pagination avec numéros */}
                  {likedMovies.length > ITEMS_PER_PAGE && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLikesPage(Math.max(0, likesPage - 1))}
                          disabled={likesPage === 0}
                          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                        >
                          Précédent
                        </button>
                        
                        {/* Numéros de pages */}
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.ceil(likedMovies.length / ITEMS_PER_PAGE) }, (_, i) => {
                            const totalPages = Math.ceil(likedMovies.length / ITEMS_PER_PAGE);
                            // Afficher seulement les premières pages, ... et dernière page si trop de pages
                            if (totalPages <= 7) {
                              return (
                                <button
                                  key={i}
                                  onClick={() => setLikesPage(i)}
                                  className={`w-10 h-10 rounded-lg transition ${
                                    likesPage === i 
                                      ? 'bg-purple-600 text-white font-semibold' 
                                      : 'bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            }
                            // Si beaucoup de pages, n'afficher que 1, 2, ..., dernière
                            if (i === 0 || i === 1 || i === totalPages - 1 || i === likesPage) {
                              return (
                                <button
                                  key={i}
                                  onClick={() => setLikesPage(i)}
                                  className={`w-10 h-10 rounded-lg transition ${
                                    likesPage === i 
                                      ? 'bg-purple-600 text-white font-semibold' 
                                      : 'bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            }
                            if (i === 2 && likesPage > 3) {
                              return <span key={i} className="px-2 text-gray-600">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setLikesPage(Math.min(Math.ceil(likedMovies.length / ITEMS_PER_PAGE) - 1, likesPage + 1))}
                          disabled={likesPage >= Math.ceil(likedMovies.length / ITEMS_PER_PAGE) - 1}
                          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                        >
                          Suivant
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Page {likesPage + 1} sur {Math.ceil(likedMovies.length / ITEMS_PER_PAGE)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Heart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucun film liké pour le moment</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Mes films préférés</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isOwnProfile 
                      ? 'Sélectionnez vos favoris dans l\'onglet Likes' 
                      : 'Sélection spéciale parmi les likes'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500/10 px-4 py-2 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xl font-bold text-yellow-500">{favoriteMovies.length}</span>
                    </div>
                  </div>
                  {favoriteMovies.length > 0 && (
                    <Link 
                      href={`/profile/${profile.username}/all-favorites`}
                      className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
                    >
                      Voir tout
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
              {favoriteMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {favoriteMovies.slice(favoritesPage * ITEMS_PER_PAGE, (favoritesPage + 1) * ITEMS_PER_PAGE).map((movie) => (
                      <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg ring-2 ring-yellow-500/20 group-hover:ring-yellow-500/60 transition-all">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Film size={48} className="text-gray-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-3 right-3 bg-yellow-500 p-2 rounded-lg shadow-lg">
                              <Star size={16} className="fill-white text-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-lg">
                                {movie.title}
                              </h3>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Pagination Favoris */}
                  {favoriteMovies.length > ITEMS_PER_PAGE && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFavoritesPage(Math.max(0, favoritesPage - 1))}
                          disabled={favoritesPage === 0}
                          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                        >
                          Précédent
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE) }, (_, i) => {
                            const totalPages = Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE);
                            if (totalPages <= 7) {
                              return (
                                <button
                                  key={i}
                                  onClick={() => setFavoritesPage(i)}
                                  className={`w-10 h-10 rounded-lg transition ${
                                    favoritesPage === i 
                                      ? 'bg-yellow-500 text-white font-semibold' 
                                      : 'bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            }
                            if (i === 0 || i === 1 || i === totalPages - 1 || i === favoritesPage) {
                              return (
                                <button
                                  key={i}
                                  onClick={() => setFavoritesPage(i)}
                                  className={`w-10 h-10 rounded-lg transition ${
                                    favoritesPage === i 
                                      ? 'bg-yellow-500 text-white font-semibold' 
                                      : 'bg-gray-800 hover:bg-gray-700'
                                  }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            }
                            if (i === 2 && favoritesPage > 3) {
                              return <span key={i} className="px-2 text-gray-600">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setFavoritesPage(Math.min(Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE) - 1, favoritesPage + 1))}
                          disabled={favoritesPage >= Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE) - 1}
                          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
                        >
                          Suivant
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Page {favoritesPage + 1} sur {Math.ceil(favoriteMovies.length / ITEMS_PER_PAGE)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-gray-700">
                  <Star size={64} className="mx-auto mb-4 text-yellow-500/20" />
                  <p className="text-lg font-semibold text-gray-400 mb-2">Aucun film préféré</p>
                  <p className="text-sm text-gray-600">Ajoutez vos films favoris parmi vos likes</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'watched' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Films vus ({watchedMovies.length})</h2>
              {watchedMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {watchedMovies.slice(0, 24).map((movie) => (
                      <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Film size={48} className="text-gray-600" />
                              </div>
                            )}
                            {movie.rating && (
                              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-semibold">{movie.rating}</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-green-500/90 p-1.5 rounded-lg">
                              <Eye size={14} className="text-white" />
                            </div>
                          </div>
                          <h3 className="text-sm font-semibold line-clamp-2 transition">
                            {movie.title}
                          </h3>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  {watchedMovies.length > 24 && (
                    <div className="text-center mt-8">
                      <p className="text-sm text-gray-500">
                        {watchedMovies.length - 24} autres films vus
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Eye size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucun film vu pour le moment</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ratings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Films & Séries notés ({profile.stats.rated})</h2>
                {ratedMovies.length > 6 && (
                  <Link
                    href="/activity"
                    className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                  >
                    Tout voir →
                  </Link>
                )}
              </div>
              {ratedMovies.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ratedMovies.slice(0, 6).map((movie) => (
                      <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                        <div
                          className="flex gap-4 p-4 bg-gradient-to-r from-white/5 to-white/[0.02] rounded-xl transition-all border border-white/5 shadow-lg"
                        >
                          <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <Film size={32} className="text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-bold">{movie.rating}</span>
                              </div>
                            </div>
                            {movie.review && (
                              <p className="text-gray-400 text-sm line-clamp-2">{movie.review}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Star size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucune note pour le moment</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'actors' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Acteurs favoris ({favoriteActors.length})</h2>
              {favoriteActors.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {favoriteActors.map((actor) => (
                    <Link key={actor.id} href={`/person/${actor.actor_id}`}>
                      <motion.div
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-1.5 bg-gray-800 ring-1 ring-white/10">
                          {actor.actor_profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.actor_profile_path}`}
                              alt={actor.actor_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserCircle size={32} className="text-gray-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                          <div className="absolute top-1 right-1 bg-pink-500/90 p-1 rounded">
                            <Heart size={10} className="fill-white" />
                          </div>
                        </div>
                        <h3 className="text-xs font-medium line-clamp-1 group-hover:text-purple-400 transition">
                          {actor.actor_name}
                        </h3>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <UserCircle size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucun acteur favori</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lists' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Listes ({userLists.length})</h2>
                {isOwnProfile && (
                  <Link href="/my-lists">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2">
                      <List size={18} />
                      Gérer mes listes
                    </button>
                  </Link>
                )}
              </div>

              {userLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userLists.map((list: any) => (
                    <Link key={list.id} href={`/my-lists/${list.id}`}>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="group bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-purple-500/30 overflow-hidden cursor-pointer"
                      >
                        {/* Preview des posters */}
                        <div className="relative h-40 bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden">
                          {list.items.length > 0 ? (
                            <div className="flex h-full">
                              {list.items.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="flex-1 relative">
                                  {item.media_poster_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w300${item.media_poster_path}`}
                                      alt={item.media_title}
                                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                      <Film size={32} className="text-gray-600" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <List size={48} className="text-gray-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          
                          {/* Badge nombre d'éléments */}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-sm font-semibold">{list.itemsCount} {list.itemsCount > 1 ? 'éléments' : 'élément'}</span>
                          </div>
                        </div>

                        {/* Info de la liste */}
                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition">
                            {list.name}
                          </h3>
                          {list.description && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                              {list.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={14} />
                            <span>Créée le {new Date(list.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-gray-700">
                  <List size={64} className="mx-auto mb-4 text-purple-500/20" />
                  <p className="text-lg font-semibold text-gray-400 mb-2">
                    {isOwnProfile ? 'Aucune liste créée' : `${profile.username} n'a pas encore de liste`}
                  </p>
                  {isOwnProfile && (
                    <Link href="/my-lists">
                      <button className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition font-semibold">
                        Créer ma première liste
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Statistiques Détaillées</h2>
                <div className="text-xs text-gray-500">Mise à jour en temps réel</div>
              </div>

              {/* Stats principales - Cartes animées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Films vus', value: moviesWatched, icon: Film, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-900/20 to-cyan-900/20' },
                  { label: 'Séries vues', value: seriesWatched, icon: Film, color: 'from-purple-500 to-pink-500', bg: 'from-purple-900/20 to-pink-900/20' },
                  { label: 'Cette année', value: thisYearWatched, icon: Calendar, color: 'from-green-500 to-emerald-500', bg: 'from-green-900/20 to-emerald-900/20' },
                  { label: 'Total notés', value: profile.stats.rated, icon: Star, color: 'from-yellow-500 to-orange-500', bg: 'from-yellow-900/20 to-orange-900/20' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-5 rounded-xl bg-gradient-to-br ${stat.bg} border border-white/10 overflow-hidden group hover:border-white/30 transition`}
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`}></div>
                    <div className="relative">
                      <stat.icon size={20} className={`mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      <div className="text-3xl font-black mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Graphiques et détails */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Répartition Films/Séries */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-black border border-purple-500/20 rounded-xl"
                >
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Film size={20} className="text-purple-400" />
                    Répartition
                  </h3>
                  <div className="space-y-4">
                    {/* Films */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">🎬 Films</span>
                        <span className="text-sm font-bold">{moviesWatched} ({Math.round((moviesWatched / (moviesWatched + seriesWatched || 1)) * 100)}%)</span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(moviesWatched / (moviesWatched + seriesWatched || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        />
                      </div>
                    </div>
                    {/* Séries */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">📺 Séries</span>
                        <span className="text-sm font-bold">{seriesWatched} ({Math.round((seriesWatched / (moviesWatched + seriesWatched || 1)) * 100)}%)</span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(seriesWatched / (moviesWatched + seriesWatched || 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total visionné</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {moviesWatched + seriesWatched}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Activité et engagement */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-6 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-black border border-cyan-500/20 rounded-xl"
                >
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-400" />
                    Engagement
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: 'Films notés', value: profile.stats.rated, max: profile.stats.watched, icon: '⭐', color: 'from-yellow-500 to-orange-500' },
                      { label: 'Films likés', value: profile.stats.liked, max: profile.stats.watched, icon: '❤️', color: 'from-pink-500 to-red-500' },
                      { label: 'Listes créées', value: profile.stats.lists, max: 10, icon: '📝', color: 'from-green-500 to-emerald-500' },
                    ].map((item, idx) => {
                      const percentage = Math.min((item.value / (item.max || 1)) * 100, 100);
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">{item.icon} {item.label}</span>
                            <span className="text-sm font-bold">{item.value}</span>
                          </div>
                          <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                              className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Informations supplémentaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid md:grid-cols-3 gap-4"
              >
                <div className="p-5 bg-gradient-to-br from-pink-900/20 to-black border border-pink-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Membre depuis</div>
                      <div className="text-lg font-bold text-pink-400">
                        {new Date(profile.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Réseau</div>
                      <div className="text-lg font-bold text-blue-400">
                        {followersCount + followingCount} connexions
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-green-900/20 to-black border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Eye size={20} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Moyenne mensuelle</div>
                      <div className="text-lg font-bold text-green-400">
                        {activityData.length > 0 ? Math.round(activityData.reduce((a, b) => a + b, 0) / activityData.length) : 0} films/mois
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Favoris */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-500">Top Favoris</h3>
                </div>
                <span className="text-xs text-yellow-500/60 font-bold">{favoriteMovies.length}</span>
              </div>
              {favoriteMovies.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {favoriteMovies.slice(0, 8).map((movie) => (
                    <Link key={movie.id} href={`/${movie.media_type}/${movie.id}`}>
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 hover:ring-2 ring-yellow-500 transition group">
                        {movie.poster_path && (
                          <>
                            <img
                              src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Star size={20} className="text-yellow-500 fill-yellow-500" />
                            </div>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-yellow-500/60 text-center py-6">Sélectionnez vos favoris</p>
              )}
            </div>

            {/* Activité */}
            <div className="bg-gradient-to-br from-purple-900/10 via-pink-900/5 to-transparent rounded-xl p-5 border border-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Activité (6 mois)</h3>
                </div>
                <Link href={`/activity?username=${profile.username}`} className="text-xs text-purple-400 hover:text-purple-300 transition">
                  Voir tout →
                </Link>
              </div>
              
              {/* Graphique */}
              <div className="h-32 relative mb-6 group">
                {activityData.length > 0 ? (
                  <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                    <defs>
                      {/* Gradient pour le remplissage */}
                      <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1" />
                      </linearGradient>
                      {/* Gradient pour la ligne */}
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                        <stop offset="50%" stopColor="rgb(236, 72, 153)" />
                        <stop offset="100%" stopColor="rgb(6, 182, 212)" />
                      </linearGradient>
                      {/* Filtre glow */}
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Grille horizontale */}
                    <line x1="0" y1="25" x2="300" y2="25" stroke="rgb(55, 65, 81)" strokeWidth="0.5" opacity="0.3" strokeDasharray="5,5" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="rgb(55, 65, 81)" strokeWidth="0.5" opacity="0.3" strokeDasharray="5,5" />
                    <line x1="0" y1="75" x2="300" y2="75" stroke="rgb(55, 65, 81)" strokeWidth="0.5" opacity="0.3" strokeDasharray="5,5" />
                    <line x1="0" y1="95" x2="300" y2="95" stroke="rgb(75, 85, 99)" strokeWidth="1.5" />
                    
                    {/* Zone remplie */}
                    <path
                      fill="url(#activityGradient)"
                      d={`M 0,95 ${activityData.map((value, index) => {
                        const maxValue = Math.max(...activityData, 1);
                        const x = (index / (activityData.length - 1)) * 300;
                        const y = 90 - (value / maxValue) * 75;
                        return `L ${x},${y}`;
                      }).join(' ')} L 300,95 Z`}
                    />
                    
                    {/* Ligne de courbe */}
                    <path
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#glow)"
                      d={activityData.map((value, index) => {
                        const maxValue = Math.max(...activityData, 1);
                        const x = (index / (activityData.length - 1)) * 300;
                        const y = 90 - (value / maxValue) * 75;
                        return index === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Points sur la courbe */}
                    {activityData.map((value, index) => {
                      const maxValue = Math.max(...activityData, 1);
                      const x = (index / (activityData.length - 1)) * 300;
                      const y = 90 - (value / maxValue) * 75;
                      return (
                        <g key={index}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="5" 
                            fill="rgb(168, 85, 247)" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill="white"
                          />
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <TrendingUp size={32} className="opacity-20 mb-2" />
                    <p className="text-xs">Aucune activité</p>
                  </div>
                )}
              </div>
              
              {/* Valeurs avec labels des mois */}
              {activityData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    {activityData.map((value, index) => {
                      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                      const monthIndex = (new Date().getMonth() - (5 - index) + 12) % 12;
                      return (
                        <div key={index} className="text-center flex-1">
                          <div className="font-bold text-white mb-1">{value}</div>
                          <div className="text-gray-500 text-[10px]">{monthNames[monthIndex]}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                    <div className="text-[10px] text-gray-500">Total:</div>
                    <div className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {activityData.reduce((a, b) => a + b, 0)} films notés
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Rapides */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Informations du profil</h3>
                {isOwnProfile && (
                  <Link href="/settings">
                    <button className="p-2 hover:bg-purple-500/20 rounded-lg transition group">
                      <Settings size={16} className="text-gray-400 group-hover:text-purple-400 transition" />
                    </button>
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {/* Followers */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Followers</span>
                    <span className="text-lg font-bold text-white">{followersCount}</span>
                  </div>
                  {followersProfiles.length > 0 && (
                    <div className="flex items-center -space-x-2">
                      {followersProfiles.slice(0, 5).map((follower, idx) => (
                        <Link key={idx} href={`/profile/${follower.username}`}>
                          <div className="relative group">
                            <Avatar
                              avatarUrl={follower.avatar_url}
                              size="sm"
                              className="ring-2 ring-[#141414] hover:ring-purple-500 transition cursor-pointer"
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                              {follower.username}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {followersCount > 5 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-[#141414]">
                          +{followersCount - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-700"></div>

                {/* Following */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Following</span>
                    <span className="text-lg font-bold text-white">{followingCount}</span>
                  </div>
                  {followingProfiles.length > 0 && (
                    <div className="flex items-center -space-x-2">
                      {followingProfiles.slice(0, 5).map((following, idx) => (
                        <Link key={idx} href={`/profile/${following.username}`}>
                          <div className="relative group">
                            <Avatar
                              avatarUrl={following.avatar_url}
                              size="sm"
                              className="ring-2 ring-[#141414] hover:ring-purple-500 transition cursor-pointer"
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                              {following.username}
                            </div>
                          </div>
                        </Link>
                      ))}
                      {followingCount > 5 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-[#141414]">
                          +{followingCount - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-700"></div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Films vus</span>
                  <span className="text-lg font-bold text-purple-400">{profile.stats.watched}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUsername={profile.username}
        currentBio={profile.bio}
        currentBanner={profile.banner_url || ''}
        currentAvatar={profile.avatar_url || ''}
        onSave={loadProfile}
      />
    </div>
  );
}
