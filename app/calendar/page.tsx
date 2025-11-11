'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Film, Tv, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import Link from 'next/link';

interface MovieRelease {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
}

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [upcomingMovies, setUpcomingMovies] = useState<MovieRelease[]>([]);
  const [upcomingTV, setUpcomingTV] = useState<MovieRelease[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      loadUpcomingReleases();
    }
  }, [user, selectedMonth, selectedYear, activeTab]);

  const loadUpcomingReleases = async () => {
    try {
      setLoading(true);

      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = getLastDayOfMonth(selectedYear, selectedMonth);

      if (activeTab === 'movies') {
        const moviesData = await api.getUpcomingMovies();
        const filtered = moviesData.filter((m: any) => {
          if (!m.release_date) return false;
          const releaseDate = new Date(m.release_date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return releaseDate >= start && releaseDate <= end;
        });
        setUpcomingMovies(filtered.map((m: any) => ({
          id: m.id,
          title: m.title || m.name || 'Sans titre',
          release_date: m.release_date,
          poster_path: m.poster_path,
          overview: m.overview,
          vote_average: m.vote_average,
          media_type: 'movie' as const
        })));
      } else {
        // Pour les séries, utiliser airingToday et filtrer
        const tvData = await api.getAiringTodayTVShows();
        setUpcomingTV(tvData.map((t: any) => ({
          id: t.id,
          title: t.name || t.title || 'Sans titre',
          release_date: t.first_air_date || new Date().toISOString().split('T')[0],
          poster_path: t.poster_path,
          overview: t.overview,
          vote_average: t.vote_average,
          media_type: 'tv' as const
        })));
      }
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastDayOfMonth = (year: number, month: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const currentReleases = activeTab === 'movies' ? upcomingMovies : upcomingTV;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Calendrier des Sorties
            </h1>
            <p className="text-gray-400">Ne manquez aucune sortie de vos films et séries préférés</p>
          </motion.div>

          {/* Month Selector */}
          <div className="flex items-center justify-between mb-8 bg-white/5 rounded-xl p-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-3">
              <CalendarIcon size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-bold">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                activeTab === 'movies'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Film size={20} />
              Films
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
                activeTab === 'tv'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Tv size={20} />
              Séries
            </button>
          </div>

          {/* Releases List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : currentReleases.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aucune sortie prévue ce mois-ci</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentReleases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/${release.media_type}/${release.id}`}>
                    <div className="bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all group cursor-pointer">
                      {/* Poster */}
                      <div className="relative aspect-[2/3] overflow-hidden">
                        {release.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${release.poster_path}`}
                            alt={release.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            {release.media_type === 'movie' ? <Film size={48} /> : <Tv size={48} />}
                          </div>
                        )}
                        
                        {/* Date Badge */}
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                          <Clock size={14} className="inline mr-1" />
                          <span className="text-xs font-medium">
                            {new Date(release.release_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Rating Badge */}
                        {release.vote_average > 0 && (
                          <div className="absolute top-3 left-3 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                            <Star size={14} className="fill-black text-black" />
                            <span className="text-xs font-bold text-black">
                              {release.vote_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-cyan-400 transition">
                          {release.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {release.overview || 'Aucune description disponible'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <CalendarIcon size={14} />
                          {formatDate(release.release_date)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
