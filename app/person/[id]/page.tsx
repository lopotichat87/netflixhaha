'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { ArrowLeft, Calendar, MapPin, Briefcase, Film, Tv, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function PersonPage() {
  const params = useParams();
  const personId = parseInt(params.id as string);

  const { user } = useAuth();
  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const loadPerson = async () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

        const [personData, creditsData] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${API_KEY}&language=fr-FR`).then(res => res.json()),
          fetch(`https://api.themoviedb.org/3/person/${personId}/combined_credits?api_key=${API_KEY}&language=fr-FR`).then(res => res.json()),
        ]);

        setPerson(personData);

        // Trier par popularité et prendre les 20 premiers
        const sortedCredits = [...(creditsData.cast || []), ...(creditsData.crew || [])]
          .filter((item: any) => item.poster_path)
          .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 20);

        setCredits(sortedCredits);
      } catch (error) {
        console.error('Error loading person:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
    if (user) {
      checkFavorite();
    }
  }, [personId, user]);

  const checkFavorite = async () => {
    if (!user) return;
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('favorite_actors')
        .select('id')
        .eq('user_id', user.id)
        .eq('actor_id', personId)
        .single();
      
      setIsFavorite(!!data);
    } catch (error) {
      // Pas en favori
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('Vous devez être connecté pour ajouter un acteur en favori');
      return;
    }

    setFavLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');

      if (isFavorite) {
        // Retirer des favoris
        await supabase
          .from('favorite_actors')
          .delete()
          .eq('user_id', user.id)
          .eq('actor_id', personId);
        setIsFavorite(false);
      } else {
        // Ajouter aux favoris
        await supabase
          .from('favorite_actors')
          .insert({
            user_id: user.id,
            actor_id: personId,
            actor_name: person.name,
            actor_profile_path: person.profile_path,
          });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la mise à jour des favoris');
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!person) {
    return null;
  }

  const age = person.birthday ? Math.floor((new Date().getTime() - new Date(person.birthday).getTime()) / 31557600000) : null;

  const movies = credits.filter(c => c.media_type === 'movie');
  const tvShows = credits.filter(c => c.media_type === 'tv');

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {/* Hero Section avec image de fond */}
      <div className="relative h-[55vh] md:h-[60vh] min-h-[450px] md:min-h-[500px]">
        {/* Photo de fond */}
        {person.profile_path && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/original${person.profile_path}`}
              alt={person.name}
              className="w-full h-full object-contain md:object-cover object-center opacity-30 blur-sm bg-black"
            />
          </div>
        )}

        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/60 to-[#141414]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-[#141414]/80" />

        {/* Contenu Hero */}
        <div className="relative h-full px-4 md:px-16 pt-24 pb-12">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start md:items-end h-full pb-4 md:pb-8">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-64"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-2xl ring-2 ring-white/10">
                {person.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <span className="text-4xl sm:text-5xl md:text-6xl">👤</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Nom et métier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3">{person.name}</h1>

              {/* Métier et infos */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-sm md:text-base">
                {person.known_for_department && (
                  <div className="flex items-center gap-1.5 md:gap-2 text-gray-300">
                    <Briefcase size={16} className="md:w-5 md:h-5" />
                    <span>{person.known_for_department}</span>
                  </div>
                )}
                {person.birthday && (
                  <>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-300">
                      <Calendar size={16} className="md:w-5 md:h-5" />
                      <span>
                        {new Date(person.birthday).toLocaleDateString('fr-FR', { year: 'numeric' })}
                        {age && ` (${age} ans)`}
                      </span>
                    </div>
                  </>
                )}
                {person.place_of_birth && (
                  <>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-300">
                      <MapPin size={16} className="md:w-5 md:h-5" />
                      <span className="line-clamp-1">{person.place_of_birth.split(',').pop()?.trim()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Bouton Favori */}
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`mt-4 flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isFavorite
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } disabled:opacity-50`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                <span>{isFavorite ? 'Acteur favori' : 'Ajouter aux favoris'}</span>
              </button>

              {/* Stats */}
              <div className="flex items-center gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Film size={18} className="text-blue-400 md:w-5 md:h-5" />
                  <span className="text-xl md:text-2xl font-bold text-blue-400">{movies.length}</span>
                  <span className="text-gray-400 text-xs md:text-sm">Films</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Tv size={18} className="text-purple-400 md:w-5 md:h-5" />
                  <span className="text-xl md:text-2xl font-bold text-purple-400">{tvShows.length}</span>
                  <span className="text-gray-400 text-xs md:text-sm">Séries</span>
                </div>
              </div>

              {/* Description courte */}
              {person.biography && (
                <p className="text-gray-300 max-w-3xl line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm md:text-base leading-relaxed mt-4">
                  {person.biography}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Biographie complète */}
      <div className="px-4 md:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          {person.biography && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="bg-gray-900 rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4">Biographie</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            </motion.div>
          )}

          {/* Filmographie */}
          {credits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6">Filmographie</h2>

              {/* Films */}
              {movies.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Film size={20} className="text-blue-400" />
                    Films ({movies.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {movies.map((item: any) => (
                      <MovieCard
                        key={`movie-${item.id}`}
                        media={{ ...item, media_type: 'movie' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Séries */}
              {tvShows.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Tv size={20} className="text-purple-400" />
                    Séries ({tvShows.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {tvShows.map((item: any) => (
                      <MovieCard
                        key={`tv-${item.id}`}
                        media={{ ...item, media_type: 'tv' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
