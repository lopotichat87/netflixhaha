'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number;
}

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

interface SeasonSelectorProps {
  seasons: Season[];
  tvId: number;
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
}

export default function SeasonSelector({ seasons, tvId, onEpisodeSelect }: SeasonSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const handleSeasonChange = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setIsSeasonOpen(false);
    setLoadingEpisodes(true);

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des épisodes:', error);
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const currentSeason = seasons.find(s => s.season_number === selectedSeason);

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <div className="relative">
        <button
          onClick={() => setIsSeasonOpen(!isSeasonOpen)}
          className="w-full md:w-64 flex items-center justify-between bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition"
        >
          <span className="font-semibold">
            {currentSeason?.name || `Saison ${selectedSeason}`}
          </span>
          <ChevronDown
            size={20}
            className={`transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isSeasonOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full md:w-64 mt-2 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
            >
              {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => handleSeasonChange(season.season_number)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition ${
                    season.season_number === selectedSeason ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="font-semibold">{season.name}</div>
                  <div className="text-sm text-gray-400">
                    {season.episode_count} épisode{season.episode_count > 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Episodes List */}
      {loadingEpisodes ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid gap-4">
          {episodes.map((episode) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition cursor-pointer"
              onClick={() => {
                onEpisodeSelect(selectedSeason, episode.episode_number);
                // Scroll vers le titre de la page
                setTimeout(() => {
                  const titleElement = document.querySelector('h1');
                  if (titleElement) {
                    titleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <div className="flex gap-4 p-4">
                {/* Episode Thumbnail */}
                <div className="w-40 md:w-48 aspect-video flex-shrink-0 bg-gray-900 rounded overflow-hidden">
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                      Pas d'aperçu
                    </div>
                  )}
                </div>

                {/* Episode Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base md:text-lg mb-1">
                        {episode.episode_number}. {episode.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400">
                        {episode.runtime ? `${episode.runtime} min` : 'Durée inconnue'}
                      </p>
                    </div>
                    <button className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-black rounded hover:bg-gray-200 transition font-semibold text-sm whitespace-nowrap">
                      Regarder
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 line-clamp-2">
                    {episode.overview || 'Aucune description disponible'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          Sélectionnez une saison pour voir les épisodes
        </div>
      )}
    </div>
  );
}
