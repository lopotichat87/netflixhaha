'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { Search, Bell } from 'lucide-react';
import UserMenu from './UserMenu';
import MobileMenu from './MobileMenu';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      NProgress.start();
      router.push(`/recherche?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const searchMedia = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await response.json();
      setSearchResults(data.results?.slice(0, 5) || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchMedia(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-16 py-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-red-600 text-2xl md:text-3xl font-bold">
            NETFLIX
          </Link>
          
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li>
              <Link href="/" className="hover:text-gray-300 transition">
                Accueil
              </Link>
            </li>

            {/* Dropdown Contenu */}
            <li 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('contenu')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="hover:text-gray-300 transition flex items-center gap-1">
                Contenu
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: openDropdown === 'contenu' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openDropdown === 'contenu' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl py-2 overflow-hidden"
                  >
                    <motion.div
                      initial="closed"
                      animate="open"
                      variants={{
                        open: {
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {[
                        { href: '/series', label: 'Séries' },
                        { href: '/films', label: 'Films' },
                        { href: '/sagas', label: 'Sagas' },
                        { href: '/nouveautes', label: 'Nouveautés' }
                      ].map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            closed: { opacity: 0, x: -20 },
                            open: { opacity: 1, x: 0 }
                          }}
                        >
                          <Link href={item.href} className="block px-4 py-2 hover:bg-gray-800 transition">
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {/* Dropdown Ma Collection */}
            <li 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('collection')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="hover:text-gray-300 transition flex items-center gap-1">
                Ma Collection
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: openDropdown === 'collection' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openDropdown === 'collection' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl py-2 overflow-hidden"
                  >
                    <motion.div
                      initial="closed"
                      animate="open"
                      variants={{
                        open: {
                          transition: { staggerChildren: 0.05 }
                        }
                      }}
                    >
                      {[
                        { href: '/likes', label: 'Mes Likes' },
                        { href: '/my-lists', label: 'Mes Listes' },
                        { href: '/history', label: 'Historique' },
                        { href: '/stats', label: 'Statistiques' }
                      ].map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            closed: { opacity: 0, x: -20 },
                            open: { opacity: 1, x: 0 }
                          }}
                        >
                          <Link href={item.href} className="block px-4 py-2 hover:bg-gray-800 transition">
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            <li>
              <Link href="/watch-party" className="hover:text-gray-300 transition flex items-center gap-1">
                <span className="text-purple-400">●</span>
                Watch Party
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Search - Hidden on mobile */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchInput(e.target.value);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Rechercher..."
              className="w-0 md:w-64 px-4 py-2 bg-gray-900 border border-gray-700 rounded-full focus:outline-none focus:border-white transition-all duration-300 focus:w-64"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full md:w-96 bg-black/95 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.media_type}-${result.id}`}
                    href={`/${result.media_type}/${result.id}`}
                    onClick={() => {
                      setShowResults(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 transition"
                  >
                    {result.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                        alt={result.title || result.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center text-gray-600">
                        ?
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{result.title || result.name}</p>
                      <p className="text-xs text-gray-400">
                        {result.media_type === 'movie' ? 'Film' : 'Série'} • {result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* User Menu - Desktop only */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>

    </nav>
  );
}
