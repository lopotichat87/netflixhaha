import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import { api } from '@/lib/api';

export default async function SeriesPage() {
  // Fetch all TV show categories in parallel
  const [
    trendingTVShows,
    popularTVShows,
    topRatedTVShows,
    frenchTVShows,
    englishTVShows,
    actionTVShows,
    comedyTVShows,
    dramaTVShows,
    sciFiTVShows,
    crimeTVShows,
    animeTVShows,
    koreanDramas,
    spanishTVShows,
    animationTVShows,
    airingTodayTVShows,
    onTheAirTVShows,
  ] = await Promise.all([
    api.getTrendingTVShows(),
    api.getPopularTVShows(),
    api.getTopRatedTVShows(),
    api.getFrenchTVShows(),
    api.getEnglishTVShows(),
    api.getTVShowsByGenre(10759), // Action & Adventure
    api.getTVShowsByGenre(35), // Comedy
    api.getTVShowsByGenre(18), // Drama
    api.getTVShowsByGenre(10765), // Sci-Fi & Fantasy
    api.getTVShowsByGenre(80), // Crime
    api.getJapaneseContent('tv'), // Anime
    api.getKoreanContent('tv'), // K-dramas
    api.getSpanishContent('tv'), // Spanish series
    api.getAnimations('tv'),
    api.getAiringTodayTVShows(),
    api.getOnTheAirTVShows(),
  ]);

  // Use top 5 trending TV shows for the carousel
  const heroMedia = trendingTVShows.slice(0, 5);

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel Section */}
      {/* Hero Carousel */}
      <HeroCarousel media={heroMedia} />

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 px-4 md:px-16 pb-20 -mt-24">
        <MovieRowAnimated title="Séries tendances" media={trendingTVShows} />
        <MovieRowAnimated title="Diffusées aujourd'hui" media={airingTodayTVShows} />
        <MovieRowAnimated title="K-Dramas" media={koreanDramas} />
        <MovieRowAnimated title="Anime" media={animeTVShows} />
        <MovieRowAnimated title="Action & Aventure" media={actionTVShows} />
        <MovieRowAnimated title="Comédies" media={comedyTVShows} />
        <MovieRowAnimated title="Drames" media={dramaTVShows} />
        <MovieRowAnimated title="Science-Fiction & Fantasy" media={sciFiTVShows} />
        <MovieRowAnimated title="Séries policières" media={crimeTVShows} />
        <MovieRowAnimated title="Séries d'animation" media={animationTVShows} />
        <MovieRowAnimated title="Séries françaises (VF)" media={frenchTVShows} />
        <MovieRowAnimated title="Séries en VO" media={englishTVShows} />
        <MovieRowAnimated title="Séries espagnoles" media={spanishTVShows} />
        <MovieRowAnimated title="Séries populaires" media={popularTVShows} />
        <MovieRowAnimated title="Les mieux notées" media={topRatedTVShows} />
        <MovieRowAnimated title="À l'antenne" media={onTheAirTVShows} />
      </div>
    </div>
  );
}
