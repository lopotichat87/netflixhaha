import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import ContinueWatching from '@/components/ContinueWatching';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import { api } from '@/lib/api';

export default async function Home() {
  // Fetch all categories in parallel (films + séries)
  const [
    trendingAll,
    popularMovies,
    popularTVShows,
    topRatedMovies,
    frenchMovies,
    frenchTVShows,
    englishMovies,
    englishTVShows,
    actionMovies,
    comedyMovies,
    horrorMovies,
    sciFiTVShows,
    animeTVShows,
    animeMovies,
    koreanDramas,
    koreanMovies,
    japaneseMovies,
    documentaries,
    upcomingMovies,
    airingTodayTVShows,
  ] = await Promise.all([
    api.getTrendingAll(),
    api.getPopularMovies(),
    api.getPopularTVShows(),
    api.getTopRatedMovies(),
    api.getFrenchMovies(),
    api.getFrenchTVShows(),
    api.getEnglishMovies(),
    api.getEnglishTVShows(),
    api.getMoviesByGenre(28), // Action
    api.getMoviesByGenre(35), // Comedy
    api.getMoviesByGenre(27), // Horror
    api.getTVShowsByGenre(10765), // Sci-Fi & Fantasy
    api.getJapaneseContent('tv'), // Anime (séries)
    api.getAnimations('movie'), // Films d'animation/anime
    api.getKoreanContent('tv'), // K-dramas
    api.getKoreanContent('movie'), // Films coréens
    api.getJapaneseContent('movie'), // Films japonais
    api.getDocumentaries(),
    api.getUpcomingMovies(),
    api.getAiringTodayTVShows(),
  ]);

  // Use top 5 trending items for the carousel
  const heroMedia = trendingAll.slice(0, 5);

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel Section */}
      <HeroCarousel media={heroMedia.slice(0, 5)} />

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 pb-20 -mt-24">
        {/* Toujours afficher l'historique en premier */}
        <div className="min-h-[200px]">
          <ContinueWatching />
        </div>
        
        {/* Toujours afficher les recommandations en second */}
        <div className="min-h-[200px]">
          <PersonalizedRecommendations />
        </div>
        
        <MovieRowAnimated title="Tendances du moment" media={trendingAll} />
        <MovieRowAnimated title="Anime (Séries)" media={animeTVShows} />
        <MovieRowAnimated title="Films d'animation japonais" media={animeMovies} />
        <MovieRowAnimated title="Films japonais" media={japaneseMovies} />
        <MovieRowAnimated title="K-Dramas" media={koreanDramas} />
        <MovieRowAnimated title="Films coréens" media={koreanMovies} />
        <MovieRowAnimated title="Films d'action" media={actionMovies} />
        <MovieRowAnimated title="Comédies" media={comedyMovies} />
        <MovieRowAnimated title="Films populaires" media={popularMovies} />
        <MovieRowAnimated title="Séries populaires" media={popularTVShows} />
        <MovieRowAnimated title="Films français (VF)" media={frenchMovies} />
        <MovieRowAnimated title="Séries françaises (VF)" media={frenchTVShows} />
        <MovieRowAnimated title="Films en VO" media={englishMovies} />
        <MovieRowAnimated title="Séries en VO" media={englishTVShows} />
        <MovieRowAnimated title="Science-Fiction & Fantasy" media={sciFiTVShows} />
        <MovieRowAnimated title="Films d'horreur" media={horrorMovies} />
        <MovieRowAnimated title="Documentaires" media={documentaries} />
        <MovieRowAnimated title="Les mieux notés" media={topRatedMovies} />
        <MovieRowAnimated title="Prochainement au cinéma" media={upcomingMovies} />
        <MovieRowAnimated title="Séries diffusées aujourd'hui" media={airingTodayTVShows} />
      </div>
    </div>
  );
}
