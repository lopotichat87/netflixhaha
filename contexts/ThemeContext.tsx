'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getStoredTheme, applyTheme, themes } from '@/lib/theme';

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeName: string) => void;
  availableThemes: typeof themes;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState(getStoredTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Charger le thème depuis Supabase si l'utilisateur est connecté
    const loadUserTheme = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('theme')
            .eq('user_id', user.id)
            .single();
          
          if (preferences?.theme) {
            setCurrentTheme(preferences.theme);
            applyTheme(preferences.theme);
            return;
          }
        }
      } catch (error) {
        console.log('No saved theme preference, using default');
      }
      
      // Appliquer le thème par défaut si pas de préférence
      applyTheme(currentTheme);
    };
    
    loadUserTheme();
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, mounted]);

  const setTheme = (themeName: string) => {
    setCurrentTheme(themeName);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
