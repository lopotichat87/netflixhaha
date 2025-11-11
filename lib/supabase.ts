import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client Supabase avec configuration optimale pour Next.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Types pour la base de données
export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  profile_pin?: string | null;
  is_kids?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  created_at: string;
  is_favorite?: boolean;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  progress: number;
  last_watched: string;
}

export interface WatchParty {
  id: string;
  host_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  room_code: string;
  created_at: string;
  is_active: boolean;
}

// Fonctions d'authentification
export const authHelpers = {
  signUp: async (email: string, password: string, username: string) => {
    // Nettoyer le username : remplacer espaces par underscores, tout en minuscules
    const cleanedUsername = username
      .trim() // Retirer espaces début/fin
      .toLowerCase()
      .replace(/\s+/g, '_') // Remplacer espaces par underscores
      .replace(/[^a-z0-9_]/g, '') // Retirer caractères spéciaux
      .replace(/_+$/g, '') // Retirer underscores à la fin
      .replace(/^_+/g, '') // Retirer underscores au début
      .substring(0, 20);
    
    if (cleanedUsername.length < 3) {
      throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanedUsername,
        },
        // URL de redirection après confirmation d'email
        emailRedirectTo: `${window.location.origin}/auth/login?confirmed=true`,
      },
    });
    
    if (error) throw error;
    
    // Le profil sera créé automatiquement par le trigger Supabase après confirmation
    // On retourne juste les données de l'utilisateur
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};

// Fonctions pour les favoris
export const favoritesHelpers = {
  addToFavorites: async (userId: string, mediaId: number, mediaType: 'movie' | 'tv', title: string, posterPath?: string) => {
    const { data, error } = await supabase
      .from('favorites')
      .upsert(
        {
          user_id: userId,
          media_id: mediaId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          is_favorite: true,
        },
        { 
          onConflict: 'user_id,media_id',
          ignoreDuplicates: false 
        }
      )
      .select();
    
    if (error) throw error;
    return data;
  },

  removeFromFavorites: async (userId: string, mediaId: number) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', mediaId);
    
    if (error) throw error;
  },

  getFavorites: async (userId: string, limit: number = 100, offset: number = 0) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, user_id, media_id, media_type, title, poster_path, created_at, is_favorite')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as Favorite[];
  },

  isFavorite: async (userId: string, mediaId: number) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('media_id', mediaId)
      .single();
    
    return !!data;
  },

  getTotalCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  },
};

// Fonctions pour l'historique
const getHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('watch_history')
    .select('id, user_id, media_id, media_type, title, poster_path, progress, last_watched')
    .eq('user_id', userId)
    .order('last_watched', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data as WatchHistory[];
};

const addToHistory = async (
  userId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  posterPath: string,
  progress: number
) => {
  const { data: existing } = await supabase
    .from('watch_history')
    .select('id')
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('watch_history')
      .update({
        progress,
        last_watched: new Date().toISOString(),
      })
      .eq('id', existing.id);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('watch_history')
      .insert([
        {
          user_id: userId,
          media_id: mediaId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          progress,
        },
      ]);
    
    if (error) throw error;
  }
};

const updateProgress = async (userId: string, mediaId: number, progress: number) => {
  const { error } = await supabase
    .from('watch_history')
    .update({ progress, last_watched: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('media_id', mediaId);
  
  if (error) throw error;
};

const clearHistory = async (userId: string) => {
  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
};

export const historyHelpers = {
  getHistory,
  addToHistory,
  updateProgress,
  clearHistory,
};

// Fonctions pour les profils
export const profileHelpers = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return data;
  },
};
