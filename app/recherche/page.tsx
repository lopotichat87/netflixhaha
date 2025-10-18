'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { api, Media } from '@/lib/api';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'movies' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'date'>('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(q);
    }
  }, [searchParams]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: Media[] = [];
      
      if (searchType === 'all') {
        searchResults = await api.searchMulti(searchQuery);
      } else if (searchType === 'movies') {
        searchResults = await api.searchMovies(searchQuery);
      } else {
        searchResults = await api.searchTVShows(searchQuery);
      }
      
      // Apply filters
      let filteredResults = searchResults;
      
      // Filter by rating
      if (minRating > 0) {
        filteredResults = filteredResults.filter(item => item.vote_average >= minRating);
      }
      
      // Filter by year
      if (selectedYear !== 'all') {
        filteredResults = filteredResults.filter(item => {
          const year = (item.release_date || item.first_air_date || '').split('-')[0];
          return year === selectedYear;
        });
      }
      
      // Sort results
      filteredResults.sort((a, b) => {
        if (sortBy === 'popularity') {
          return b.popularity - a.popularity;
        } else if (sortBy === 'rating') {
          return b.vote_average - a.vote_average;
        } else {
          const dateA = new Date(a.release_date || a.first_air_date || '').getTime();
          const dateB = new Date(b.release_date || b.first_air_date || '').getTime();
          return dateB - dateA;
        }
      });
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-16">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des films, séries..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-14 pr-4 py-4 text-lg focus:outline-none focus:border-white transition"
                autoFocus
              />
            </div>
          </form>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <button
              onClick={() => {
                setSearchType('all');
                if (query) handleSearch(query);
              }}
              className={`px-6 py-2 rounded-full transition ${
                searchType === 'all'
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => {
                setSearchType('movies');
                if (query) handleSearch(query);
              }}
              className={`px-6 py-2 rounded-full transition ${
                searchType === 'movies'
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Films
            </button>
            <button
              onClick={() => {
                setSearchType('tv');
                if (query) handleSearch(query);
              }}
              className={`px-6 py-2 rounded-full transition ${
                searchType === 'tv'
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Séries
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto flex items-center gap-2 px-6 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
            >
              <SlidersHorizontal size={18} />
              <span>Filtres avancés</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-6 bg-gray-800 rounded-lg"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Trier par</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value as any);
                        if (query) handleSearch(query);
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                    >
                      <option value="popularity">Popularité</option>
                      <option value="rating">Note</option>
                      <option value="date">Date de sortie</option>
                    </select>
                  </div>

                  {/* Min Rating */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Note minimum: {minRating}/10
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => {
                        setMinRating(parseFloat(e.target.value));
                        if (query) handleSearch(query);
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Année</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        if (query) handleSearch(query);
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-white"
                    >
                      <option value="all">Toutes</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {results.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <MovieCard media={item} />
                </motion.div>
              ))}
            </div>
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              Aucun résultat pour "{query}"
            </p>
            <p className="text-gray-500 mt-2">
              Essayez avec d'autres mots-clés
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-xl">
              Recherchez vos films et séries préférés
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
