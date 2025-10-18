'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, getImageUrl, getTitle } from '@/lib/api';
import Navbar from '@/components/Navbar';
import MovieRow from '@/components/MovieRow';
import { Play, Plus, ThumbsUp, Share2, Star, Calendar, Clock, Film, Users } from 'lucide-react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import AddToListButton from '@/components/AddToListButton';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';

export default function MoviePage() {
  const params = useParams();
  const movieId = parseInt(params.id as string);
  const { user } = useAuth();
  
  const [movie, setMovie] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [trailer, setTrailer] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const [movieData, videos, similarData, credits] = await Promise.all([
          api.getMovieDetails(movieId),
          api.getMovieVideos(movieId),
          api.getSimilarMovies(movieId),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`).then(res => res.json()),
        ]);

        setMovie(movieData);
        setSimilar(similarData);
        setCast(credits.cast || []);
        
        const trailerVideo = videos.find(
          (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        setTrailer(trailerVideo);

        // Charger la collection si elle existe
        if ((movieData as any).belongs_to_collection) {
          const collectionResponse = await fetch(
            `https://api.themoviedb.org/3/collection/${(movieData as any).belongs_to_collection.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
          );
          const collectionData = await collectionResponse.json();
          setCollection(collectionData);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [movieId]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      
      try {
        const favorites = await favoritesHelpers.getFavorites(user.id);
        const isFav = favorites.some((f: any) => f.media_id === movieId);
        setIsLiked(isFav);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [user, movieId]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Connectez-vous pour ajouter des favoris');
      return;
    }
    
    if (!movie) return;

    try {
      if (isLiked) {
        await favoritesHelpers.removeFromFavorites(user.id, movieId);
        setIsLiked(false);
      } else {
        await favoritesHelpers.addToFavorites(
          user.id,
          movieId,
          'movie',
          movie.title,
          movie.poster_path || ''
        );
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de l\'ajout aux favoris. Vérifiez votre connexion Supabase.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
      <div className="relative bg-[#141414] min-h-screen">
        <Navbar />

        {/* Hero Section with Backdrop */}
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[450px] md:min-h-[600px]">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              className="w-full h-full object-contain md:object-cover object-center bg-black"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
          </div>

          {/* Movie Info */}
          <div className="absolute bottom-[15%] left-4 md:left-16 max-w-2xl z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
              {getTitle(movie)}
            </h1>

            {movie.tagline && (
              <p className="text-lg md:text-xl italic text-gray-300 mb-4">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm md:text-base">
              <span className="text-green-500 font-semibold text-lg">
                {Math.round(movie.vote_average * 10)}% Match
              </span>
              {movie.release_date && <span>{movie.release_date.split('-')[0]}</span>}
              {movie.runtime && (
                <span className="border border-gray-400 px-2 py-0.5">
                  {movie.runtime} min
                </span>
              )}
              <span className="border border-gray-400 px-2 py-0.5">HD</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link href={`/watch/movie/${movieId}`}>
                <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-white/80 transition">
                  <Play size={24} fill="currentColor" />
                  <span>Lecture</span>
                </button>
              </Link>

              <AddToListButton
                mediaId={movieId}
                mediaType="movie"
                title={movie.title}
                posterPath={movie.poster_path}
              />

              <button 
                onClick={toggleFavorite}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition ${
                  isLiked 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-400 hover:border-white'
                }`}
              >
                <ThumbsUp size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="text-base md:text-lg line-clamp-4 drop-shadow-xl max-w-xl">
              {movie.overview}
            </p>
          </div>
        </div>

        {/* Movie Details */}
        <div className="px-4 md:px-16 py-12 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Additional Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>

              {trailer && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Bande-annonce</h2>
                  <div className="aspect-video bg-black rounded overflow-hidden max-w-2xl">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailer.key}?vq=hd1080&hd=1`}
                      title={trailer.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-400">Genres: </span>
                <span>{movie.genres.map((g: any) => g.name).join(', ')}</span>
              </div>

              {movie.release_date && (
                <div>
                  <span className="text-gray-400">Date de sortie: </span>
                  <span>{new Date(movie.release_date).toLocaleDateString('fr-FR')}</span>
                </div>
              )}

              {movie.runtime && (
                <div>
                  <span className="text-gray-400">Durée: </span>
                  <span>{movie.runtime} minutes</span>
                </div>
              )}

              <div>
                <span className="text-gray-400">Note: </span>
                <span>{movie.vote_average.toFixed(1)}/10 ({movie.vote_count} votes)</span>
              </div>

              <div>
                <span className="text-gray-400">Statut: </span>
                <span>{movie.status}</span>
              </div>

              {movie.budget && movie.budget > 0 && (
                <div>
                  <span className="text-gray-400">Budget: </span>
                  <span>${movie.budget.toLocaleString()}</span>
                </div>
              )}

              {movie.revenue && movie.revenue > 0 && (
                <div>
                  <span className="text-gray-400">Recettes: </span>
                  <span>${movie.revenue.toLocaleString()}</span>
                </div>
              )}

              {movie.production_companies.length > 0 && (
                <div>
                  <span className="text-gray-400">Production: </span>
                  <span>{movie.production_companies.map((c: any) => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collection */}
        {collection && collection.parts && collection.parts.length > 1 && (
          <div className="pb-16 px-4 md:px-16">
            {/* Banner avec backdrop */}
            <div className="relative h-24 md:h-28 rounded-lg overflow-hidden mb-6">
              <div className="absolute inset-0">
                {collection.backdrop_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w1280${collection.backdrop_path}`}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              </div>
              
              <div className="relative h-full flex items-center justify-between px-4 md:px-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Saga</span>
                  <h2 className="text-lg md:text-xl font-bold">{collection.name}</h2>
                </div>
                <Link 
                  href={`/collection/${collection.id}`}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2"
                >
                  <span>Voir tout</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Films avec MovieRow */}
            <div className="-mx-4 md:-mx-16">
              <MovieRow 
                title="" 
                media={collection.parts
                  ?.sort((a: any, b: any) => {
                    const dateA = new Date(a.release_date || '0');
                    const dateB = new Date(b.release_date || '0');
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((film: any) => ({
                    ...film,
                    media_type: 'movie'
                  })) || []}
              />
            </div>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="pb-16 px-4 md:px-16">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Distribution</h2>
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={(e) => {
                  const container = e.currentTarget.parentElement?.querySelector('.cast-scroll') as HTMLElement;
                  if (container) {
                    container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
                  }
                }}
                className="scroll-left-cast hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-3 rounded-full items-center justify-center transition shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div 
                ref={(el) => {
                  if (el && !el.dataset.scrollSetup) {
                    el.dataset.scrollSetup = 'true';
                    const parent = el.parentElement;
                    const leftBtn = parent?.querySelector('.scroll-left-cast') as HTMLElement;
                    const rightBtn = parent?.querySelector('.scroll-right-cast') as HTMLElement;
                    
                    const updateArrows = () => {
                      if (leftBtn && rightBtn) {
                        const hasScroll = el.scrollWidth > el.clientWidth;
                        leftBtn.style.display = hasScroll && el.scrollLeft > 0 ? 'flex' : 'none';
                        rightBtn.style.display = hasScroll && el.scrollLeft < el.scrollWidth - el.clientWidth - 10 ? 'flex' : 'none';
                      }
                    };
                    
                    el.addEventListener('scroll', updateArrows);
                    window.addEventListener('resize', updateArrows);
                    updateArrows();
                  }
                }}
                className="cast-scroll flex gap-3 overflow-x-scroll pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {cast.map((actor: any) => (
                  <Link key={actor.id} href={`/person/${actor.id}`} className="flex-shrink-0 w-24 md:w-28 group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 mb-2 transition-transform duration-200 group-hover:-translate-y-1">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold line-clamp-2 mb-0.5 group-hover:text-white transition-colors">{actor.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-400 transition-colors">{actor.character}</p>
                  </Link>
                ))}
              </div>
              
              {/* Right Arrow */}
              <button
                onClick={(e) => {
                  const container = e.currentTarget.parentElement?.querySelector('.cast-scroll') as HTMLElement;
                  if (container) {
                    container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
                  }
                }}
                className="scroll-right-cast hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black p-3 rounded-full items-center justify-center transition shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="pb-16">
            <MovieRow title="Films similaires" media={similar} />
          </div>
        )}
      </div>
    );
}
