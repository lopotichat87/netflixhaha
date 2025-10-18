'use client';

import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface TrailerPlayerProps {
  movieId?: number;
  tvId?: number;
}

export default function TrailerPlayer({ movieId, tvId }: TrailerPlayerProps) {
  const [trailer, setTrailer] = useState<any>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrailer();
  }, [movieId, tvId]);

  const loadTrailer = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const BASE_URL = 'https://api.themoviedb.org/3';
      const type = movieId ? 'movie' : 'tv';
      const id = movieId || tvId;

      const response = await fetch(
        `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      
      const trailerVideo = data.results?.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      ) || data.results?.[0];

      setTrailer(trailerVideo);
    } catch (error) {
      console.error('Erreur chargement trailer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full md:w-80 aspect-video bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  if (!trailer) {
    return (
      <div className="w-full md:w-80 aspect-video bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        Aucune bande-annonce disponible
      </div>
    );
  }

  return (
    <div className="relative">
      {!showTrailer ? (
        <button
          onClick={() => setShowTrailer(true)}
          className="relative w-full md:w-80 aspect-video bg-gray-900 rounded-lg overflow-hidden group"
        >
          <img
            src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
            alt="Trailer thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-700 flex items-center justify-center transition">
              <Play size={28} fill="white" className="text-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
            <p className="text-sm font-semibold">{trailer.name}</p>
          </div>
        </button>
      ) : (
        <div className="w-full md:w-80 aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
