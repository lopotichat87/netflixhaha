// ReelVibe Theme System
// Configuration des thèmes et couleurs

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
    card: string;
    cardHover: string;
  };
  gradients: {
    hero: string;
    card: string;
    button: string;
  };
}

export const themes: Record<string, Theme> = {
  reelvibe: {
    name: 'reelvibe',
    displayName: 'ReelVibe',
    colors: {
      primary: '#A855F7', // Violet vibrant
      secondary: '#06B6D4', // Cyan électrique
      accent: '#EC4899', // Rose intense
      background: '#0A0A0A',
      foreground: '#FFFFFF',
      muted: '#9CA3AF',
      border: '#374151',
      card: '#1A1A1A',
      cardHover: '#262626',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #06B6D4 100%)',
      card: 'linear-gradient(180deg, rgba(168, 85, 247, 0.15) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    },
  },
  netflix: {
    name: 'netflix',
    displayName: 'Netflix',
    colors: {
      primary: '#E50914', // Rouge Netflix classique
      secondary: '#F40612', // Rouge vif
      accent: '#B20710', // Rouge sombre
      background: '#141414',
      foreground: '#FFFFFF',
      muted: '#B3B3B3',
      border: '#333333',
      card: '#181818',
      cardHover: '#222222',
    },
    gradients: {
      hero: 'linear-gradient(180deg, rgba(20, 20, 20, 0) 0%, #141414 100%)',
      card: 'linear-gradient(180deg, rgba(229, 9, 20, 0.1) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
    },
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    colors: {
      primary: '#0EA5E9', // Bleu océan
      secondary: '#06B6D4', // Cyan
      accent: '#8B5CF6', // Violet profondeur
      background: '#0F172A', // Bleu marine très sombre
      foreground: '#F1F5F9',
      muted: '#94A3B8',
      border: '#334155',
      card: '#1E293B',
      cardHover: '#27374D',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #8B5CF6 100%)',
      card: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    },
  },
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    colors: {
      primary: '#F59E0B', // Ambre chaud
      secondary: '#EF4444', // Rouge coucher de soleil
      accent: '#EC4899', // Rose tropical
      background: '#18181B', // Gris très sombre
      foreground: '#FAFAFA',
      muted: '#A1A1AA',
      border: '#3F3F46',
      card: '#27272A',
      cardHover: '#3F3F46',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)',
      card: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
  },
  emerald: {
    name: 'emerald',
    displayName: 'Emerald',
    colors: {
      primary: '#10B981', // Vert émeraude
      secondary: '#059669', // Vert profond
      accent: '#34D399', // Vert menthe
      background: '#0C0E0D', // Noir verdâtre
      foreground: '#ECFDF5',
      muted: '#9CA3AF',
      border: '#1F2937',
      card: '#1A1D1B',
      cardHover: '#242827',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #34D399 100%)',
      card: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
  },
  royal: {
    name: 'royal',
    displayName: 'Royal',
    colors: {
      primary: '#7C3AED', // Violet royal
      secondary: '#6D28D9', // Violet profond
      accent: '#A78BFA', // Lavande
      background: '#1E1B4B', // Indigo très sombre
      foreground: '#E0E7FF',
      muted: '#A5B4FC',
      border: '#4C1D95',
      card: '#312E81',
      cardHover: '#3730A3',
    },
    gradients: {
      hero: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #A78BFA 100%)',
      card: 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, transparent 100%)',
      button: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    },
  },
};

export const defaultTheme = 'reelvibe';

export function getTheme(themeName: string): Theme {
  return themes[themeName] || themes[defaultTheme];
}

export function applyTheme(themeName: string) {
  const theme = getTheme(themeName);
  const root = document.documentElement;

  // Appliquer les couleurs CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-foreground', theme.colors.foreground);
  root.style.setProperty('--color-muted', theme.colors.muted);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-card', theme.colors.card);
  root.style.setProperty('--color-card-hover', theme.colors.cardHover);

  // Appliquer les gradients
  root.style.setProperty('--gradient-hero', theme.gradients.hero);
  root.style.setProperty('--gradient-card', theme.gradients.card);
  root.style.setProperty('--gradient-button', theme.gradients.button);

  // Sauvegarder dans localStorage
  localStorage.setItem('reelvibe-theme', themeName);
}

export function getStoredTheme(): string {
  if (typeof window === 'undefined') return defaultTheme;
  return localStorage.getItem('reelvibe-theme') || defaultTheme;
}
