import axios from 'axios';
import { Movie, MovieDetails, MovieResponse, Video } from '@/types/movie';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const tmdb = {
  // Get trending movies
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>(`/trending/movie/${timeWindow}`);
    return response.data.results;
  },

  // Get popular movies
  getPopular: async (): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/movie/popular');
    return response.data.results;
  },

  // Get top rated movies
  getTopRated: async (): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/movie/top_rated');
    return response.data.results;
  },

  // Get upcoming movies
  getUpcoming: async (): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/movie/upcoming');
    return response.data.results;
  },

  // Get now playing movies
  getNowPlaying: async (): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/movie/now_playing');
    return response.data.results;
  },

  // Get movies by genre
  getByGenre: async (genreId: number): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/discover/movie', {
      params: {
        with_genres: genreId,
      },
    });
    return response.data.results;
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    const response = await tmdbApi.get<MovieDetails>(`/movie/${movieId}`);
    return response.data;
  },

  // Get movie videos (trailers, teasers, etc.)
  getMovieVideos: async (movieId: number): Promise<Video[]> => {
    const response = await tmdbApi.get<{ results: Video[] }>(`/movie/${movieId}/videos`);
    return response.data.results;
  },

  // Search movies
  searchMovies: async (query: string): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>('/search/movie', {
      params: {
        query,
      },
    });
    return response.data.results;
  },

  // Get similar movies
  getSimilarMovies: async (movieId: number): Promise<Movie[]> => {
    const response = await tmdbApi.get<MovieResponse>(`/movie/${movieId}/similar`);
    return response.data.results;
  },
};

// Helper function to get full image URL
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Helper function to get YouTube video URL
export const getYouTubeUrl = (key: string): string => {
  return `https://www.youtube.com/watch?v=${key}`;
};
