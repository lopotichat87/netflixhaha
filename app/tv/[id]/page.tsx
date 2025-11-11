'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Eye, Star, Calendar, Tv, Users } from 'lucide-react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import AddToListButton from '@/components/AddToListButton';
import RatingModal from '@/components/RatingModal';
import { useAuth } from '@/contexts/AuthContext';
import { favoritesHelpers } from '@/lib/supabase';
import { ratingsHelpers } from '@/lib/ratings';
import { api, getImageUrl, getTitle, getReleaseDate } from '@/lib/api';
import Navbar from '@/components/Navbar';
import MovieRow from '@/components/MovieRow';
import Comments from '@/components/Comments';

export default function TVPage() {
  const params = useParams();
  const tvId = parseInt(params.id as string);
  const { user } = useAuth();
  const [tvShow, setTvShow] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTVShow = async () => {
      if (isNaN(tvId)) return;
      
      try {
        const [tvShowData, videosData, similarData, credits] = await Promise.all([
          api.getTVShowDetails(tvId),
          api.getTVShowVideos(tvId),
          api.getSimilarTVShows(tvId),
          fetch(`https://api.themoviedb.org/3/tv/${tvId}/credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`).then(res => res.json()),
        ]);
        
        setTvShow(tvShowData);
        setVideos(videosData);
        setSimilar(similarData);
        setCast(credits.cast || []);
      } catch (error) {
        console.error('Error loading TV show:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTVShow();
  }, [tvId]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      
      try {
        const favorites = await favoritesHelpers.getFavorites(user.id);
        const isFav = favorites.some((f: any) => f.media_id === tvId);
        setIsLiked(isFav);
        
        const rating = await ratingsHelpers.getUserRating(user.id, tvId, 'tv');
        if (rating) {
          setIsWatched(rating.is_watched || false);
          setUserRating(rating.rating || null);
          setIsLiked(rating.is_liked || false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    checkStatus();
  }, [user, tvId]);

  const toggleFavorite = async () => {
    if (!user) {
      alert('Connectez-vous pour ajouter des favoris');
      return;
    }
    
    if (!tvShow) return;

    try {
      const newLikedState = !isLiked;
      await ratingsHelpers.toggleLike(
        user.id,
        tvId,
        'tv',
        getTitle(tvShow),
        tvShow.poster_path || '',
        newLikedState
      );
      setIsLiked(newLikedState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la modification du like.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!tvShow) {
    return null;
  }

  const trailer = videos.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  return (
      <div className="relative bg-[#141414] min-h-screen">
        <Navbar />

        {/* Hero Section with Backdrop */}
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[450px] md:min-h-[600px]">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={getImageUrl(tvShow.backdrop_path, 'original')}
              alt={getTitle(tvShow)}
              className="w-full h-full object-contain md:object-cover object-center bg-black"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
          </div>

          {/* TV Show Info */}
          <div className="absolute bottom-[15%] left-4 md:left-16 max-w-2xl z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
              {getTitle(tvShow)}
            </h1>

            {tvShow.tagline && (
              <p className="text-lg md:text-xl italic text-gray-300 mb-4">
                "{tvShow.tagline}"
              </p>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm md:text-base">
              <span className="text-green-500 font-semibold text-lg">
                {Math.round(tvShow.vote_average * 10)}% Match
              </span>
              <span>{getReleaseDate(tvShow).split('-')[0]}</span>
              {tvShow.number_of_seasons && (
                <span className="border border-gray-400 px-2 py-0.5">
                  {tvShow.number_of_seasons} saison{tvShow.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              <span className="border border-gray-400 px-2 py-0.5">HD</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button 
                onClick={() => setShowRatingModal(true)}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-white/80 transition"
              >
                <Star size={20} fill={userRating ? 'currentColor' : 'none'} />
                <span>{userRating ? `Noté ${userRating}/5` : 'Noter'}</span>
              </button>

              <button 
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
                  isLiked 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                <span>J'aime</span>
              </button>

              <AddToListButton
                mediaId={tvId}
                mediaType="tv"
                title={getTitle(tvShow)}
                posterPath={tvShow.poster_path}
              />
            </div>

            {tvShow.overview && (
              <p className="text-base md:text-lg line-clamp-3 drop-shadow-xl max-w-2xl leading-relaxed text-gray-100">
                {tvShow.overview}
              </p>
            )}
          </div>
        </div>

        {/* TV Show Details */}
        <div className="px-4 md:px-16 py-12 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Additional Info */}
            <div className="md:col-span-2 space-y-6">
              {tvShow.overview && (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Tv size={24} className="text-red-600" />
                    Synopsis
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                    {tvShow.overview}
                  </p>
                </div>
              )}

              {trailer && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Bande-annonce</h2>
                  <div className="aspect-video bg-black rounded overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
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
                <span>{tvShow.genres.map((g: any) => g.name).join(', ')}</span>
              </div>

              <div>
                <span className="text-gray-400">Première diffusion: </span>
                <span>{new Date(getReleaseDate(tvShow)).toLocaleDateString('fr-FR')}</span>
              </div>

              {tvShow.number_of_seasons && (
                <div>
                  <span className="text-gray-400">Saisons: </span>
                  <span>{tvShow.number_of_seasons}</span>
                </div>
              )}

              {tvShow.number_of_episodes && (
                <div>
                  <span className="text-gray-400">Épisodes: </span>
                  <span>{tvShow.number_of_episodes}</span>
                </div>
              )}

              <div>
                <span className="text-gray-400">Note: </span>
                <span>{tvShow.vote_average.toFixed(1)}/10 ({tvShow.vote_count} votes)</span>
              </div>

              <div>
                <span className="text-gray-400">Statut: </span>
                <span>{tvShow.status}</span>
              </div>

              {tvShow.created_by && tvShow.created_by.length > 0 && (
                <div>
                  <span className="text-gray-400">Créé par: </span>
                  <span>{tvShow.created_by.map((c: any) => c.name).join(', ')}</span>
                </div>
              )}

              {tvShow.networks && tvShow.networks.length > 0 && (
                <div>
                  <span className="text-gray-400">Réseau: </span>
                  <span>{tvShow.networks.map((n: any) => n.name).join(', ')}</span>
                </div>
              )}

              {tvShow.production_companies.length > 0 && (
                <div>
                  <span className="text-gray-400">Production: </span>
                  <span>{tvShow.production_companies.map((c: any) => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="pb-16 px-4 md:px-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Distribution</h2>
              <span className="text-sm text-gray-400">{cast.length} acteurs</span>
            </div>
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
                className="cast-scroll flex gap-3 overflow-x-scroll pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {cast.map((actor: any) => (
                  <Link key={actor.id} href={`/person/${actor.id}`} className="flex-shrink-0 w-32 md:w-36 group cursor-pointer">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-3 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="text-4xl">👤</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h3 className="text-sm font-bold line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">{actor.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{actor.character}</p>
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

        {/* Comments Section */}
        <div className="px-4 md:px-16 pb-12">
          <Comments mediaId={tvId} mediaType="tv" />
        </div>

        {/* Similar TV Shows */}
        {similar.length > 0 && (
          <div className="pb-16">
            <MovieRow title="Séries similaires" media={similar} />
          </div>
        )}

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          mediaId={tvId}
          mediaType="tv"
          mediaTitle={getTitle(tvShow)}
          mediaPoster={tvShow.poster_path}
          onSuccess={() => {
            // Recharger les données
            if (user) {
              ratingsHelpers.getUserRating(user.id, tvId, 'tv').then(rating => {
                if (rating) {
                  setIsWatched(rating.is_watched || false);
                  setUserRating(rating.rating || null);
                  setIsLiked(rating.is_liked || false);
                }
              });
            }
          }}
        />
      </div>
    );
}
