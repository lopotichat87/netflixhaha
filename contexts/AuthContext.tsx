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
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  pinVerified: false,
  setPinVerified: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
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
    let mounted = true;

    // Vérifier la session actuelle au chargement
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          
          // Stocker l'ID utilisateur de manière fiable
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('currentUserId', session.user.id);
              localStorage.setItem('userEmail', session.user.email || '');
            } catch (e) {
              console.error('LocalStorage error:', e);
            }
          }
          
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Init session error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setPinVerified(false);
        if (typeof window !== 'undefined') {
          try {
            const userId = localStorage.getItem('currentUserId');
            localStorage.removeItem(`pinVerified_${userId}`);
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('userEmail');
          } catch (e) {
            console.error('LocalStorage cleanup error:', e);
          }
        }
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('currentUserId', session.user.id);
            localStorage.setItem('userEmail', session.user.email || '');
            // Vérifier si le PIN est déjà validé pour cet utilisateur
            const pinStatus = localStorage.getItem(`pinVerified_${session.user.id}`);
            setPinVerified(pinStatus === 'true');
          } catch (e) {
            console.error('LocalStorage error:', e);
          }
        }
        await loadProfile(session.user.id);
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string, forceRefresh = false) => {
    try {
      // Toujours récupérer depuis la base de données (pas de cache)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Erreur chargement profil:', error);
        
        // Si le profil n'existe pas, créer un profil par défaut
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const username = (userData.user.email?.split('@')[0] || 'User')
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[^a-z0-9_]/g, '')
              .substring(0, 20);
            
            const randomEmoji = ['😊', '🎬', '🍿', '🎭', '🎪', '🎨'][Math.floor(Math.random() * 6)];
            const randomColor = ['bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-pink-600'][Math.floor(Math.random() * 5)];
            
            const { error: insertError } = await supabase.from('profiles').insert({
              user_id: userId,
              username,
              display_name: username,
              avatar_url: `${randomEmoji}|${randomColor}`,
            });
            
            if (insertError) {
              console.error('Erreur création profil:', insertError);
            } else {
              // Recharger le profil nouvellement créé
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();
              
              if (newProfile) {
                console.log('✅ Profil créé et chargé:', newProfile.username);
                setProfile(newProfile);
              }
            }
          }
        }
      } else {
        console.log('✅ Profil chargé:', data.username);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir manuellement le profil
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Rafraîchissement manuel du profil...');
      await loadProfile(user.id, true);
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
    <AuthContext.Provider value={{ user, profile, loading, pinVerified, setPinVerified: updatePinVerified, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
