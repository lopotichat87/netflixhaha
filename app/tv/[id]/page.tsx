'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Play, Plus, ThumbsUp, Share2, Star, Calendar, Tv, Users } from 'lucide-react';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import SeasonSelector from '@/components/SeasonSelector';
import AddToListButton from '@/components/AddToListButton';
import { api, getImageUrl, getTitle, getReleaseDate } from '@/lib/api';
import Navbar from '@/components/Navbar';
import MovieRow from '@/components/MovieRow';

export default function TVPage() {
  const params = useParams();
  const tvId = parseInt(params.id as string);
  const [tvShow, setTvShow] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
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
              <Link href={`/watch/tv/${tvId}`}>
                <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-semibold hover:bg-white/80 transition">
                  <Play size={24} fill="currentColor" />
                  <span>Lecture</span>
                </button>
              </Link>

              <AddToListButton
                mediaId={tvId}
                mediaType="tv"
                title={getTitle(tvShow)}
                posterPath={tvShow.poster_path}
              />
            </div>

            <p className="text-base md:text-lg line-clamp-4 drop-shadow-xl max-w-xl">
              {tvShow.overview}
            </p>
          </div>
        </div>

        {/* TV Show Details */}
        <div className="px-4 md:px-16 py-12 space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Additional Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed">{tvShow.overview}</p>
              </div>

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
                <span>{tvShow.genres.map((g) => g.name).join(', ')}</span>
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
                  <span>{tvShow.created_by.map((c) => c.name).join(', ')}</span>
                </div>
              )}

              {tvShow.networks && tvShow.networks.length > 0 && (
                <div>
                  <span className="text-gray-400">Réseau: </span>
                  <span>{tvShow.networks.map((n) => n.name).join(', ')}</span>
                </div>
              )}

              {tvShow.production_companies.length > 0 && (
                <div>
                  <span className="text-gray-400">Production: </span>
                  <span>{tvShow.production_companies.map((c) => c.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Similar TV Shows */}
        {similar.length > 0 && (
          <div className="pb-16">
            <MovieRow title="Séries similaires" media={similar} />
          </div>
        )}
      </div>
    );
}
