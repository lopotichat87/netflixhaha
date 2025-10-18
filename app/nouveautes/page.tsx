import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import { api } from '@/lib/api';

export default async function NouveautesPage() {
  // Fetch new content (movies + TV shows)
  const [
    trendingAll,
    upcomingMovies,
    nowPlayingMovies,
    airingTodayTVShows,
    onTheAirTVShows,
  ] = await Promise.all([
    api.getTrendingAll('day'),
    api.getUpcomingMovies(),
    api.getNowPlayingMovies(),
    api.getAiringTodayTVShows(),
    api.getOnTheAirTVShows(),
  ]);

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel Section */}
      {/* Hero Carousel */}
      <HeroCarousel media={trendingAll.slice(0, 5)} />

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 px-4 md:px-16 pb-20 -mt-24">
        <MovieRowAnimated title="Tendances aujourd'hui" media={trendingAll} />
        <MovieRowAnimated title="Nouveaux films au cinéma" media={nowPlayingMovies} />
        <MovieRowAnimated title="Prochainement au cinéma" media={upcomingMovies} />
        <MovieRowAnimated title="Nouvelles séries diffusées aujourd'hui" media={airingTodayTVShows} />
        <MovieRowAnimated title="Séries à l'antenne" media={onTheAirTVShows} />
      </div>
    </div>
  );
}
