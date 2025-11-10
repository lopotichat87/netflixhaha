'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Film, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface UserResult {
  username: string;
  avatar_url: string;
  bio?: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'films' | 'community'>('films');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaResults, setMediaResults] = useState<SearchResult[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const searchMedia = async (query: string) => {
    if (!query.trim()) {
      setMediaResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await response.json();
      setMediaResults(data.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').slice(0, 20) || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUserResults([]);
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, bio')
        .ilike('username', `%${query}%`)
        .limit(20);

      setUserResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'films') {
        searchMedia(searchQuery);
      } else {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const getAvatar = (avatar_url: string) => {
    if (!avatar_url) return { emoji: '👤', color: 'bg-gray-600' };
    const parts = avatar_url.split('|');
    return { emoji: parts[0] || '👤', color: parts[1] || 'bg-gray-600' };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header minimaliste */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight">Rechercher</h1>
          <p className="text-base text-gray-500">Explorez notre catalogue de films, séries et membres</p>
        </div>

        {/* Search Bar avec tabs intégrés */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'films' ? 'Rechercher un film ou une série...' : 'Rechercher un membre de la communauté...'}
              className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:bg-white/[0.07] focus:border-white/20 transition-all placeholder:text-gray-600 text-base"
              autoFocus
            />
          </div>
          
          {/* Tabs minimalistes */}
          <div className="flex gap-6 mt-6 border-b border-white/10">
            <button
              onClick={() => {
                setActiveTab('films');
                setMediaResults([]);
                setUserResults([]);
                setSearchQuery('');
              }}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                activeTab === 'films'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Film size={16} />
                <span>Films & Séries</span>
              </div>
              {activeTab === 'films' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('community');
                setMediaResults([]);
                setUserResults([]);
                setSearchQuery('');
              }}
              className={`pb-3 px-1 text-sm font-medium transition-all relative ${
                activeTab === 'community'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Communauté</span>
              </div>
              {activeTab === 'community' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : searchQuery.length > 0 ? (
          <div>
            {activeTab === 'films' && mediaResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-gray-500 mb-6">{mediaResults.length} résultat{mediaResults.length > 1 ? 's' : ''}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {mediaResults.map((result) => (
                    <Link key={`${result.media_type}-${result.id}`} href={`/${result.media_type}/${result.id}`}>
                      <motion.div
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className="cursor-pointer group"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                          {result.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                              alt={result.title || result.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film size={48} className="text-gray-600" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium">
                            {result.media_type === 'tv' ? 'Série' : 'Film'}
                          </div>
                          {result.vote_average > 0 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                              <span className="text-xs font-semibold text-green-400">
                                {Math.round(result.vote_average * 10)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-medium line-clamp-2 mt-3">
                          {result.title || result.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {result.release_date?.split('-')[0] || result.first_air_date?.split('-')[0]}
                        </p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'community' && userResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-gray-500 mb-6">{userResults.length} membre{userResults.length > 1 ? 's' : ''}</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userResults.map((user) => {
                    const avatar = getAvatar(user.avatar_url);
                    return (
                      <Link key={user.username} href={`/profile/${user.username}`}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-4 p-5 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition-all border border-white/5 hover:border-white/10"
                        >
                          <div className={`${avatar.color} w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-white/10`}>
                            {avatar.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate">{user.username}</p>
                            {user.bio && (
                              <p className="text-sm text-gray-500 truncate mt-0.5">{user.bio}</p>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {((activeTab === 'films' && mediaResults.length === 0) ||
              (activeTab === 'community' && userResults.length === 0)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-300">Aucun résultat</h3>
                <p className="text-sm text-gray-500">Essayez avec d'autres mots-clés</p>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-medium mb-2 text-gray-300">Commencez votre recherche</h3>
            <p className="text-sm text-gray-500">Utilisez la barre de recherche ci-dessus</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
