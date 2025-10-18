'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SeasonSelector from '@/components/SeasonSelector';
import TrailerPlayer from '@/components/TrailerPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { historyHelpers } from '@/lib/supabase';

interface StreamingSource {
  id: number;
  name: string;
  quality: string;
  language: string;
  url: string;
  server: string;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const type = params.type as string;
  const id = params.id as string;
  const mediaId = parseInt(id);

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState(0); // 0 = VidSrc (serveur par défaut)
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [watchProgress, setWatchProgress] = useState(0);

  useEffect(() => {
    if (!type || !id || isNaN(mediaId) || (type !== 'movie' && type !== 'tv')) {
      router.push('/');
      return;
    }
    loadMedia();
  }, [type, id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadMedia();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, type, id]);

  const loadMedia = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const BASE_URL = 'https://api.themoviedb.org/3';

      const response = await fetch(
        `${BASE_URL}/${type}/${mediaId}?api_key=${API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      setMedia(data);
      
      // Ajouter à l'historique si l'utilisateur est connecté
      if (user) {
        await historyHelpers.addToHistory(
          user.id,
          mediaId,
          type as 'movie' | 'tv',
          data.title || data.name,
          data.poster_path,
          0
        );
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder la progression toutes les 30 secondes
  useEffect(() => {
    if (!user || !media) return;

    const saveProgress = async () => {
      await historyHelpers.addToHistory(
        user.id,
        mediaId,
        type as 'movie' | 'tv',
        media.title || media.name,
        media.poster_path,
        watchProgress
      );
    };

    const interval = setInterval(() => {
      if (watchProgress > 0) {
        saveProgress();
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user, media, watchProgress, mediaId, type]);

  // Simuler la progression (dans un vrai player, on utiliserait les events du player)
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setWatchProgress((prev) => {
        if (prev >= 95) return 95; // Max 95% pour ne pas marquer comme terminé
        return prev + 1;
      });
    }, 60000); // +1% par minute

    return () => clearInterval(progressInterval);
  }, []);

  const handleEpisodeSelect = (season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setSelectedSource(0); // Reset to first source
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!media) {
    router.push('/');
    return null;
  }

  const title = media.title || media.name || 'Sans titre';
  const releaseYear = (media.release_date || media.first_air_date || '').split('-')[0];

  // Sources de streaming fiables VF/VO
  const streamingSources: StreamingSource[] = [
    {
      id: 1,
      name: 'VidSrc Pro',
      quality: '1080p',
      language: 'VF/VO',
      server: 'VidSrc Pro',
      url: type === 'movie'
        ? `https://vidsrc.pro/embed/movie/${mediaId}`
        : `https://vidsrc.pro/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      id: 2,
      name: 'VidSrc Prime',
      quality: '1080p',
      language: 'VF/VOSTFR',
      server: 'VidSrc',
      url: type === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${mediaId}`
        : `https://vidsrc.xyz/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      id: 3,
      name: 'VidSrc.to',
      quality: '1080p',
      language: 'Multi',
      server: 'VidSrc To',
      url: type === 'movie'
        ? `https://vidsrc.to/embed/movie/${mediaId}`
        : `https://vidsrc.to/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      id: 4,
      name: 'VidSrc.cc',
      quality: '1080p',
      language: 'VF/VO',
      server: 'VidSrc CC',
      url: type === 'movie'
        ? `https://vidsrc.cc/v2/embed/movie/${mediaId}`
        : `https://vidsrc.cc/v2/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      id: 5,
      name: 'VidSrc.me',
      quality: '1080p',
      language: 'Multi',
      server: 'VidSrc Me',
      url: type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${mediaId}`
        : `https://vidsrc.me/embed/tv?tmdb=${mediaId}&season=${selectedSeason}&episode=${selectedEpisode}`
    },
    {
      id: 6,
      name: 'Embed.su',
      quality: '1080p',
      language: 'VF/VO',
      server: 'Embed.su',
      url: type === 'movie'
        ? `https://embed.su/embed/movie/${mediaId}`
        : `https://embed.su/embed/tv/${mediaId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      id: 7,
      name: 'SuperEmbed',
      quality: '1080p',
      language: 'VF',
      server: 'SuperEmbed',
      url: type === 'movie'
        ? `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
    },
    {
      id: 8,
      name: 'MovieE',
      quality: '1080p',
      language: 'VF/VO',
      server: 'MovieE',
      url: type === 'movie'
        ? `https://moviesapi.club/movie/${mediaId}`
        : `https://moviesapi.club/tv/${mediaId}-${selectedSeason}-${selectedEpisode}`
    }
  ];

  const currentSource = streamingSources[selectedSource];

  return (
    <div className="relative bg-black min-h-screen">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="px-4 md:px-16 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
            <span className="text-sm">
              {autoRefresh ? 'Mise à jour auto ON' : 'Mise à jour auto OFF'}
            </span>
          </button>
        </div>

        {/* Title and Info */}
        <div className="px-4 md:px-16 py-4 bg-black">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {title}
            {type === 'tv' && ` - S${selectedSeason}E${selectedEpisode}`}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{releaseYear}</span>
            <span className="text-green-500 font-semibold">
              {Math.round((media.vote_average || 0) * 10)}% Match
            </span>
            {watchProgress > 0 && (
              <span className="text-blue-400">
                Progression: {watchProgress}%
              </span>
            )}
          </div>
        </div>

        {/* Main Video Player */}
        <div className="px-4 md:px-16">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              key={`${currentSource.id}-${selectedSeason}-${selectedEpisode}`}
              src={currentSource.url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
              style={{ border: 'none' }}
            />
          </div>
        </div>

        {/* Sources Selection - Moved above content */}
        <div className="px-4 md:px-16 py-6 bg-gradient-to-b from-black to-[#141414]">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Changer de source
              </h2>
              <span className="text-sm text-yellow-400">
                💡 Essayez plusieurs serveurs
              </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {streamingSources.map((source, index) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(index)}
                  className={`p-3 rounded-lg transition ${
                    selectedSource === index
                      ? 'bg-red-600 ring-2 ring-red-400'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-xs mb-1">{source.name}</div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                      <span>{source.quality}</span>
                      <span>•</span>
                      <span>{source.language}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Season/Episode Selector for TV Shows */}
          {type === 'tv' && media.seasons && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Épisodes</h2>
              <SeasonSelector
                seasons={media.seasons.filter((s: any) => s.season_number > 0)}
                tvId={mediaId}
                onEpisodeSelect={handleEpisodeSelect}
              />
            </div>
          )}

          {/* Synopsis */}
          {media.overview && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed">{media.overview}</p>
            </div>
          )}

          {/* Informations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {media.genres && media.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Détails</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Note: </span>
                  <span>{(media.vote_average || 0).toFixed(1)}/10</span>
                  <span className="text-gray-400 ml-2">({media.vote_count || 0} votes)</span>
                </div>
                <div>
                  <span className="text-gray-400">Source actuelle: </span>
                  <span className="text-red-400">{currentSource.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
