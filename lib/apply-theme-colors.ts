// Utilitaires pour appliquer les couleurs du thème dynamiquement
export const themeColors = {
  // Classes pour backgrounds
  primary: 'bg-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary)]',
  accent: 'bg-[var(--color-accent)]',
  card: 'bg-[var(--color-card)]',
  cardHover: 'hover:bg-[var(--color-card-hover)]',
  
  // Classes pour texte
  textPrimary: 'text-[var(--color-primary)]',
  textSecondary: 'text-[var(--color-secondary)]',
  textAccent: 'text-[var(--color-accent)]',
  textMuted: 'text-[var(--color-muted)]',
  
  // Classes pour bordures
  borderPrimary: 'border-[var(--color-primary)]',
  borderSecondary: 'border-[var(--color-secondary)]',
  borderAccent: 'border-[var(--color-accent)]',
  borderDefault: 'border-[var(--color-border)]',
  
  // Gradients
  gradientHero: 'bg-[var(--gradient-hero)]',
  gradientCard: 'bg-[var(--gradient-card)]',
  gradientButton: 'bg-[var(--gradient-button)]',
};

// Fonction pour obtenir la couleur actuelle du thème
export function getThemeColor(variable: keyof typeof themeColors): string {
  if (typeof window === 'undefined') return '';
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(`--color-${variable}`).trim();
}

// Fonction pour obtenir un style inline avec la couleur du thème
export function themeStyle(
  property: 'backgroundColor' | 'color' | 'borderColor' | 'background',
  colorVar: 'primary' | 'secondary' | 'accent' | 'card' | 'cardHover' | 'gradient-hero' | 'gradient-button' | 'gradient-card'
): React.CSSProperties {
  if (colorVar.startsWith('gradient')) {
    return { [property]: `var(--${colorVar})` };
  }
  return { [property]: `var(--color-${colorVar})` };
}
