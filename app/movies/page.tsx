'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BrowseLayout from '@/components/BrowseLayout';
import MovieCard from '@/components/MovieCard';
import { Film, ChevronLeft, ChevronRight, Star, Clapperboard, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const cat = searchParams.get('category') || 'popular';
    setCurrentPage(page);
    setCategory(cat);
    loadMovies(cat, page);
  }, [searchParams]);

  const loadMovies = async (cat: string, page: number) => {
    setLoading(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      let endpoint = '';
      
      switch(cat) {
        case 'popular':
          endpoint = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`;
          break;
        case 'top_rated':
          endpoint = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=fr-FR&page=${page}`;
          break;
        case 'now_playing':
          endpoint = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=fr-FR&page=${page}`;
          break;
        case 'upcoming':
          endpoint = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=fr-FR&page=${page}`;
          break;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      
      setMovies(data.results.map((m: any) => ({ ...m, media_type: 'movie' })));
      setTotalPages(Math.min(data.total_pages, 500)); // TMDB limite à 500 pages
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/movies?category=${category}&page=${newPage}`);
  };

  const changeCategory = (newCat: string) => {
    setSearchQuery('');
    setIsSearching(false);
    router.push(`/movies?category=${newCat}&page=1`);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await response.json();
      setSearchResults(data.results.map((m: any) => ({ ...m, media_type: 'movie' })));
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'popular', label: 'Populaires' },
    { id: 'top_rated', label: 'Mieux notés' },
    { id: 'now_playing', label: 'Au cinéma' },
    { id: 'upcoming', label: 'À venir' }
  ];

  return (
    <BrowseLayout
      title="Films"
      description="Explorez notre catalogue de films"
      icon={Film}
      iconBg="from-blue-500 to-cyan-500"
    >
      <div>
        {/* Search Bar */}
        <div className="relative max-w-xl mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un film..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:bg-white/[0.07] focus:border-blue-500 transition placeholder:text-gray-600"
          />
        </div>

        {/* Categories */}
        {!isSearching && (
          <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => changeCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                category === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105 shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
          </div>
        )}

        {/* Results count */}
        {isSearching && !loading && (
          <p className="text-sm text-gray-500 mb-6">
            {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
              {(isSearching ? searchResults : movies).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                >
                  <MovieCard media={movie} size="large" />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {!isSearching && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  <span>Précédent</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => changePage(1)}
                      className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      1
                    </button>
                  )}
                  {currentPage > 3 && <span className="text-gray-500">...</span>}
                  {currentPage > 2 && (
                    <button
                      onClick={() => changePage(currentPage - 1)}
                      className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      {currentPage - 1}
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold">
                    {currentPage}
                  </button>
                  {currentPage < totalPages - 1 && (
                    <button
                      onClick={() => changePage(currentPage + 1)}
                      className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      {currentPage + 1}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && <span className="text-gray-500">...</span>}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => changePage(totalPages)}
                      className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Suivant</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Page info */}
            <div className="text-center mt-4 text-gray-400 text-sm">
              Page {currentPage} sur {totalPages}
            </div>
          </>
        )}
      </div>
    </BrowseLayout>
  );
}
