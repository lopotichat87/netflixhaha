import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import { api } from '@/lib/api';
import { Sparkles, Calendar, Film } from 'lucide-react';

export default async function NouveautesPage() {
  // Fetch vraiment les nouveautés récentes
  const [
    upcomingMovies,
    nowPlayingMovies,
    topRatedRecent,
    airingTodayTVShows,
    onTheAirTVShows,
    popularTVShows,
  ] = await Promise.all([
    api.getUpcomingMovies(),
    api.getNowPlayingMovies(),
    api.getTopRatedMovies(),
    api.getAiringTodayTVShows(),
    api.getOnTheAirTVShows(),
    api.getPopularTVShows(),
  ]);

  // Utiliser les films au cinéma pour le hero
  const heroMedia = nowPlayingMovies.slice(0, 5);

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel avec les films actuellement au cinéma */}
      <HeroCarousel media={heroMedia} />

      {/* Header Section */}
      <div className="relative z-10 px-4 md:px-16 -mt-20 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Nouveautés</h1>
            <p className="text-gray-400 text-sm">Les dernières sorties et prochaines nouveautés</p>
          </div>
        </div>
      </div>

      {/* Content Rows - Vraies nouveautés */}
      <div className="relative z-10 space-y-8 px-4 md:px-16 pb-20">
        {/* Films au cinéma MAINTENANT */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Film className="text-green-400" size={20} />
            <h2 className="text-xl md:text-2xl font-semibold">Au cinéma maintenant</h2>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
              En salle
            </span>
          </div>
          <MovieRowAnimated title="" media={nowPlayingMovies} />
        </div>

        {/* Prochainement au cinéma */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-400" size={20} />
            <h2 className="text-xl md:text-2xl font-semibold">Prochainement</h2>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
              Bientôt
            </span>
          </div>
          <MovieRowAnimated title="" media={upcomingMovies} />
        </div>

        {/* Séries diffusées aujourd'hui */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl md:text-2xl font-semibold">Épisodes diffusés aujourd'hui</h2>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">
              Aujourd'hui
            </span>
          </div>
          <MovieRowAnimated title="" media={airingTodayTVShows} />
        </div>

        {/* Séries en cours de diffusion */}
        <MovieRowAnimated title="Séries à l'antenne" media={onTheAirTVShows} />
        
        {/* Séries populaires récentes */}
        <MovieRowAnimated title="Nouvelles séries populaires" media={popularTVShows} />

        {/* Films récents bien notés */}
        <MovieRowAnimated title="Films récents bien notés" media={topRatedRecent.slice(0, 20)} />
      </div>
    </div>
  );
}
