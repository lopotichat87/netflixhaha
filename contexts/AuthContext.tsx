'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, profileHelpers } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  pinVerified: boolean;
  setPinVerified: (verified: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  pinVerified: false,
  setPinVerified: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(() => {
    // Récupérer l'état du PIN depuis localStorage au démarrage
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('currentUserId');
      return localStorage.getItem(`pinVerified_${userId}`) === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Nettoyer le localStorage si le refresh token est invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUserId');
          localStorage.removeItem('pinVerified');
        }
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        // Stocker l'ID utilisateur
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', session.user.id);
        }
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setPinVerified(false);
        if (typeof window !== 'undefined') {
          const userId = localStorage.getItem('currentUserId');
          localStorage.removeItem(`pinVerified_${userId}`);
          localStorage.removeItem('currentUserId');
        }
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUserId', session.user.id);
          // Vérifier si le PIN est déjà validé pour cet utilisateur
          const pinStatus = localStorage.getItem(`pinVerified_${session.user.id}`);
          setPinVerified(pinStatus === 'true');
        }
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const data = await profileHelpers.getProfile(userId);
      
      if (!data) {
        // Si le profil n'existe pas, créer un profil par défaut
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const username = userData.user.email?.split('@')[0] || 'User';
          const randomEmoji = ['😊', '🎬', '🍿', '🎭', '🎪', '🎨'][Math.floor(Math.random() * 6)];
          const randomColor = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600'][Math.floor(Math.random() * 5)];
          
          await supabase.from('profiles').insert({
            user_id: userId,
            username,
            avatar_url: `${randomEmoji}|${randomColor}`,
          });
          
          // Recharger le profil
          const newProfile = await profileHelpers.getProfile(userId);
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('currentUserId');
      localStorage.removeItem(`pinVerified_${userId}`);
      localStorage.removeItem('currentUserId');
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPinVerified(false);
  };

  // Fonction wrapper pour setPinVerified qui persiste dans localStorage
  const updatePinVerified = (verified: boolean) => {
    setPinVerified(verified);
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('currentUserId');
      if (verified && userId) {
        localStorage.setItem(`pinVerified_${userId}`, 'true');
      } else if (userId) {
        localStorage.removeItem(`pinVerified_${userId}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, pinVerified, setPinVerified: updatePinVerified, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
