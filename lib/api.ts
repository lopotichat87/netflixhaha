import axios from 'axios';

// API TMDB avec support multilingue amélioré
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'fr-FR', // Français par défaut
    region: 'FR', // Région France pour le contenu local
  },
});

// Types pour l'API
export interface Media {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  media_type?: 'movie' | 'tv';
}

export interface MediaDetails extends Media {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  budget?: number;
  revenue?: number;
  status: string;
  tagline: string;
  homepage: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  created_by?: Creator[];
  networks?: Network[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface MediaResponse {
  page: number;
  results: Media[];
  total_pages: number;
  total_results: number;
}

// Service API unifié pour films et séries
export const api = {
  // FILMS - Tendances
  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week'): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>(`/trending/movie/${timeWindow}`);
    return response.data.results;
  },

  // FILMS - Populaires en France
  getPopularMovies: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/movie/popular');
    return response.data.results;
  },

  // FILMS - Mieux notés
  getTopRatedMovies: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/movie/top_rated');
    return response.data.results;
  },

  // FILMS - Prochainement en France
  getUpcomingMovies: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/movie/upcoming');
    return response.data.results;
  },

  // FILMS - Au cinéma en France
  getNowPlayingMovies: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/movie/now_playing');
    return response.data.results;
  },

  // SÉRIES - Tendances
  getTrendingTVShows: async (timeWindow: 'day' | 'week' = 'week'): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>(`/trending/tv/${timeWindow}`);
    return response.data.results;
  },

  // SÉRIES - Populaires en France
  getPopularTVShows: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/tv/popular');
    return response.data.results;
  },

  // SÉRIES - Mieux notées
  getTopRatedTVShows: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/tv/top_rated');
    return response.data.results;
  },

  // SÉRIES - Diffusées aujourd'hui
  getAiringTodayTVShows: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/tv/airing_today');
    return response.data.results;
  },

  // SÉRIES - À l'antenne
  getOnTheAirTVShows: async (): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/tv/on_the_air');
    return response.data.results;
  },

  // MIXTE - Tendances (films + séries)
  getTrendingAll: async (timeWindow: 'day' | 'week' = 'week'): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>(`/trending/all/${timeWindow}`);
    return response.data.results;
  },

  // Détails d'un film
  getMovieDetails: async (movieId: number): Promise<MediaDetails> => {
    const response = await tmdbApi.get<MediaDetails>(`/movie/${movieId}`);
    return response.data;
  },

  // Détails d'une série
  getTVShowDetails: async (tvId: number): Promise<MediaDetails> => {
    const response = await tmdbApi.get<MediaDetails>(`/tv/${tvId}`);
    return response.data;
  },

  // Vidéos d'un film (bandes-annonces en français prioritaire)
  getMovieVideos: async (movieId: number): Promise<Video[]> => {
    const response = await tmdbApi.get<{ results: Video[] }>(`/movie/${movieId}/videos`);
    // Prioriser les vidéos en français
    const videos = response.data.results;
    const frenchVideos = videos.filter(v => v.iso_639_1 === 'fr');
    return frenchVideos.length > 0 ? frenchVideos : videos;
  },

  // Vidéos d'une série (bandes-annonces en français prioritaire)
  getTVShowVideos: async (tvId: number): Promise<Video[]> => {
    const response = await tmdbApi.get<{ results: Video[] }>(`/tv/${tvId}/videos`);
    const videos = response.data.results;
    const frenchVideos = videos.filter(v => v.iso_639_1 === 'fr');
    return frenchVideos.length > 0 ? frenchVideos : videos;
  },

  // Recherche films
  searchMovies: async (query: string): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/search/movie', {
      params: { query },
    });
    return response.data.results;
  },

  // Recherche séries
  searchTVShows: async (query: string): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/search/tv', {
      params: { query },
    });
    return response.data.results;
  },

  // Recherche multi (films + séries)
  searchMulti: async (query: string): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>('/search/multi', {
      params: { query },
    });
    return response.data.results.filter(item => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );
  },

  // Films similaires
  getSimilarMovies: async (movieId: number): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>(`/movie/${movieId}/similar`);
    return response.data.results;
  },

  // Séries similaires
  getSimilarTVShows: async (tvId: number): Promise<Media[]> => {
    const response = await tmdbApi.get<MediaResponse>(`/tv/${tvId}/similar`);
    return response.data.results;
  },

  // Get French movies (VF)
  getFrenchMovies: async (): Promise<Media[]> => {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_original_language: 'fr',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get French TV shows (VF)
  getFrenchTVShows: async (): Promise<Media[]> => {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_original_language: 'fr',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId: number): Promise<Media[]> => {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        'vote_count.gte': 100,
      },
    });
    return response.data.results;
  },

  // Get TV shows by genre
  getTVShowsByGenre: async (genreId: number): Promise<Media[]> => {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        'vote_count.gte': 50,
      },
    });
    return response.data.results;
  },

  // Get English movies (VO)
  async getEnglishMovies(): Promise<Media[]> {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_original_language: 'en',
        sort_by: 'popularity.desc',
        'vote_count.gte': 500,
      },
    });
    return response.data.results;
  },

  // Get English TV shows (VO)
  async getEnglishTVShows(): Promise<Media[]> {
    const response = await tmdbApi.get('/discover/tv', {
      params: {
        with_original_language: 'en',
        sort_by: 'popularity.desc',
        'vote_count.gte': 200,
      },
    });
    return response.data.results;
  },

  // Get Korean content (K-dramas, K-movies)
  async getKoreanContent(type: 'movie' | 'tv'): Promise<Media[]> {
    const response = await tmdbApi.get(`/discover/${type}`, {
      params: {
        with_original_language: 'ko',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get Japanese content (Anime, J-dramas)
  async getJapaneseContent(type: 'movie' | 'tv'): Promise<Media[]> {
    const response = await tmdbApi.get(`/discover/${type}`, {
      params: {
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get Spanish content
  async getSpanishContent(type: 'movie' | 'tv'): Promise<Media[]> {
    const response = await tmdbApi.get(`/discover/${type}`, {
      params: {
        with_original_language: 'es',
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get documentaries
  async getDocumentaries(): Promise<Media[]> {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: 99, // Documentary genre ID
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },

  // Get animations
  async getAnimations(type: 'movie' | 'tv'): Promise<Media[]> {
    const response = await tmdbApi.get(`/discover/${type}`, {
      params: {
        with_genres: 16, // Animation genre ID
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  },
};

// Helper pour obtenir l'URL complète de l'image
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Helper pour obtenir l'URL YouTube
export const getYouTubeUrl = (key: string): string => {
  return `https://www.youtube.com/watch?v=${key}`;
};

// Helper pour obtenir le titre (film ou série)
export const getTitle = (media: Media): string => {
  return media.title || media.name || 'Sans titre';
};

// Helper pour obtenir la date de sortie
export const getReleaseDate = (media: Media): string => {
  return media.release_date || media.first_air_date || '';
};

// Helper pour déterminer si c'est un film ou une série
export const getMediaType = (media: Media): 'movie' | 'tv' => {
  if (media.media_type) return media.media_type;
  return media.title ? 'movie' : 'tv';
};
