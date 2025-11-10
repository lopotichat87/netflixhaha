'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Sparkles, Smile, Frown, Zap, Heart, Ghost, Laugh } from 'lucide-react';
import { motion } from 'framer-motion';

const moods = [
  { id: 'joy', label: 'Joyeux', icon: Smile, color: 'from-yellow-500 to-orange-500', genres: [35, 10751] }, // Comedy, Family
  { id: 'sad', label: 'Mélancolique', icon: Frown, color: 'from-blue-500 to-indigo-500', genres: [18, 10749] }, // Drama, Romance
  { id: 'excited', label: 'Excité', icon: Zap, color: 'from-purple-500 to-pink-500', genres: [28, 12] }, // Action, Adventure
  { id: 'romantic', label: 'Romantique', icon: Heart, color: 'from-pink-500 to-rose-500', genres: [10749] }, // Romance
  { id: 'scared', label: 'Frisson', icon: Ghost, color: 'from-gray-700 to-black', genres: [27, 53] }, // Horror, Thriller
  { id: 'funny', label: 'Rire', icon: Laugh, color: 'from-green-500 to-teal-500', genres: [35] }, // Comedy
];

export default function DiscoverPage() {
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMoviesByMood = async (mood: typeof moods[0]) => {
    setSelectedMood(mood);
    setLoading(true);

    try {
      const { api } = await import('@/lib/api');
      
      // Charger des films selon les genres de l'humeur
      const genreMovies = await Promise.all(
        mood.genres.map(genreId => api.getMoviesByGenre(genreId))
      );

      // Combiner et mélanger les résultats
      const allMovies = genreMovies.flat();
      const shuffled = allMovies.sort(() => Math.random() - 0.5);
      setMovies(shuffled.slice(0, 12));
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood: typeof moods[0]) => {
    loadMoviesByMood(mood);
  };

  // Charger le premier mood au montage
  useState(() => {
    loadMoviesByMood(moods[0]);
  });

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={32} className="text-purple-400" />
            <h1 className="text-5xl font-bold">Découvrir par Humeur</h1>
          </div>
          <p className="text-xl text-gray-400">
            Trouvez le film parfait selon votre état d'esprit
          </p>
        </div>

        {/* Mood Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => handleMoodSelect(mood)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-2xl overflow-hidden transition ${
                selectedMood.id === mood.id
                  ? 'ring-4 ring-purple-500'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-20`} />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-16 h-16 bg-gradient-to-br ${mood.color} rounded-full flex items-center justify-center`}>
                  <mood.icon size={32} className="text-white" />
                </div>
                <span className="font-semibold">{mood.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <selectedMood.icon size={24} className="text-purple-400" />
              Films pour une humeur "{selectedMood.label}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <MovieCard key={movie.id} media={movie} mediaType="movie" />
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 p-8 bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Comment ça marche ?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Choisissez votre humeur</h4>
              <p className="text-gray-400">
                Sélectionnez l'émotion qui correspond à votre état d'esprit actuel
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">Découvrez des films</h4>
              <p className="text-gray-400">
                Notre algorithme vous suggère des films adaptés à votre humeur
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Profitez</h4>
              <p className="text-gray-400">
                Regardez et notez pour améliorer vos futures recommandations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
