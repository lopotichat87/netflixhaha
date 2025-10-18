// Google Analytics 4 Configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Log specific events
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track movie views
export const trackMovieView = (movieId: number, movieTitle: string) => {
  event({
    action: 'view_movie',
    category: 'Movies',
    label: movieTitle,
    value: movieId,
  });
};

// Track movie plays
export const trackMoviePlay = (movieId: number, movieTitle: string) => {
  event({
    action: 'play_movie',
    category: 'Movies',
    label: movieTitle,
    value: movieId,
  });
};

// Track searches
export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'Search',
    label: query,
  });
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
