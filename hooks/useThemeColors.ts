import { useTheme } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

/**
 * Hook personnalisé pour accéder facilement aux couleurs du thème actuel
 * 
 * Usage:
 * const colors = useThemeColors();
 * <div style={{ backgroundColor: colors.primary }}>...</div>
 */
export function useThemeColors() {
  const { currentTheme, availableThemes } = useTheme();
  
  const colors = useMemo(() => {
    const theme = availableThemes[currentTheme];
    if (!theme) return availableThemes['reelvibe'].colors;
    
    return {
      // Couleurs
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      background: theme.colors.background,
      foreground: theme.colors.foreground,
      muted: theme.colors.muted,
      border: theme.colors.border,
      card: theme.colors.card,
      cardHover: theme.colors.cardHover,
      
      // Gradients
      gradientHero: theme.gradients.hero,
      gradientCard: theme.gradients.card,
      gradientButton: theme.gradients.button,
      
      // Helper styles
      primaryStyle: { color: theme.colors.primary },
      primaryBg: { backgroundColor: theme.colors.primary },
      secondaryStyle: { color: theme.colors.secondary },
      secondaryBg: { backgroundColor: theme.colors.secondary },
      accentStyle: { color: theme.colors.accent },
      accentBg: { backgroundColor: theme.colors.accent },
      gradientButtonStyle: { background: theme.gradients.button },
      gradientHeroStyle: { background: theme.gradients.hero },
    };
  }, [currentTheme, availableThemes]);
  
  return colors;
}

/**
 * Hook pour obtenir le nom du thème actuel
 */
export function useCurrentTheme() {
  const { currentTheme } = useTheme();
  return currentTheme;
}

/**
 * Hook pour obtenir toutes les informations du thème actuel
 */
export function useThemeInfo() {
  const { currentTheme, availableThemes } = useTheme();
  const theme = availableThemes[currentTheme] || availableThemes['reelvibe'];
  
  return {
    name: theme.name,
    displayName: theme.displayName,
    colors: theme.colors,
    gradients: theme.gradients,
    isDefault: theme.name === 'reelvibe',
  };
}
