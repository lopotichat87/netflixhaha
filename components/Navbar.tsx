'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { Search, Bell, Film, Users, LogIn, UserPlus } from 'lucide-react';
import UserMenu from './UserMenu';
import UserSearch from './UserSearch';
import MobileMenu from './MobileMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchTab, setSearchTab] = useState<'films' | 'users'>('films');
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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl md:text-4xl font-bold transition-all duration-300 group-hover:scale-105" style={{ color: 'var(--color-primary)' }}>
              ReelVibe
            </div>
            <div className="hidden md:block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          </Link>
          
          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li>
              <Link href="/home" className="transition font-medium hover:text-[var(--color-primary)]">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/movies" className="transition font-medium hover:text-[var(--color-primary)]">
                Films
              </Link>
            </li>
            <li>
              <Link href="/browse/series" className="transition font-medium hover:text-[var(--color-primary)]">
                Séries
              </Link>
            </li>
            <li>
              <Link href="/sagas" className="transition font-medium hover:text-[var(--color-primary)]">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/nouveautes" className="transition font-medium hover:text-[var(--color-primary)]">
                Nouveautés
              </Link>
            </li>
            <li>
              <Link href="/trending" className="transition font-medium hover:text-[var(--color-primary)]">
                Tendances
              </Link>
            </li>

            {/* Dropdown Ma Collection - Seulement si connecté */}
            {user && (
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
                        { href: '/reviews', label: 'Mes Critiques' },
                        { href: '/stats', label: 'Statistiques' },
                        { href: '/watched', label: 'Films Vus' }
                      ].map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            closed: { opacity: 0, x: -20 },
                            open: { opacity: 1, x: 0 }
                          }}
                        >
                          <Link 
                            href={item.href} 
                            className="block px-4 py-2 transition rounded"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.1)';
                              e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = '';
                            }}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              </li>
            )}

            {/* Dropdown Communauté */}
            <li 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('communaute')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="transition flex items-center gap-1 font-medium hover:text-[var(--color-primary)]">
                Communauté
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: openDropdown === 'communaute' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openDropdown === 'communaute' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-56 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl py-2 overflow-hidden"
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
                        { href: '/social', label: 'Social', icon: 'Users' },
                        { href: '/friends', label: 'Mes Amis', icon: 'Users' },
                        { href: '/calendar', label: 'Calendrier', icon: 'Calendar' }
                      ].map((item) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            closed: { opacity: 0, x: -20 },
                            open: { opacity: 1, x: 0 }
                          }}
                        >
                          <Link 
                            href={item.href} 
                            className="block px-4 py-2 transition rounded"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.1)';
                              e.currentTarget.style.color = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '';
                              e.currentTarget.style.color = '';
                            }}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Button */}
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
          >
            <Search size={18} className="text-gray-300 group-hover:text-white transition" />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition">Rechercher</span>
          </Link>

          {/* Auth Buttons ou User Menu */}
          {!loading && (
            <>
              {user ? (
                <div className="hidden md:block">
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/auth/login">
                    <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition font-medium">
                      <LogIn size={18} />
                      Connexion
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold text-white" style={{ background: 'var(--gradient-button)' }}>
                      <UserPlus size={18} />
                      S'inscrire
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>

    </nav>
  );
}
