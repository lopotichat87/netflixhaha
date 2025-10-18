import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import { api } from '@/lib/api';

export default async function FilmsPage() {
  // Fetch all movie categories in parallel
  const [
    trendingMovies,
    popularMovies,
    topRatedMovies,
    frenchMovies,
    englishMovies,
    actionMovies,
    comedyMovies,
    horrorMovies,
    dramaMovies,
    sciFiMovies,
    romanceMovies,
    thrillerMovies,
    animationMovies,
    japaneseMovies,
    koreanMovies,
    documentaries,
    upcomingMovies,
    nowPlayingMovies,
  ] = await Promise.all([
    api.getTrendingMovies(),
    api.getPopularMovies(),
    api.getTopRatedMovies(),
    api.getFrenchMovies(),
    api.getEnglishMovies(),
    api.getMoviesByGenre(28), // Action
    api.getMoviesByGenre(35), // Comedy
    api.getMoviesByGenre(27), // Horror
    api.getMoviesByGenre(18), // Drama
    api.getMoviesByGenre(878), // Science Fiction
    api.getMoviesByGenre(10749), // Romance
    api.getMoviesByGenre(53), // Thriller
    api.getAnimations('movie'),
    api.getJapaneseContent('movie'), // Films japonais
    api.getKoreanContent('movie'), // Films coréens
    api.getDocumentaries(),
    api.getUpcomingMovies(),
    api.getNowPlayingMovies(),
  ]);

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel Section */}
      {/* Hero Carousel */}
      <HeroCarousel media={trendingMovies.slice(0, 5)} />

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 px-4 md:px-16 pb-20 -mt-24">
        <MovieRowAnimated title="Films tendances" media={trendingMovies} />
        <MovieRowAnimated title="Au cinéma maintenant" media={nowPlayingMovies} />
        <MovieRowAnimated title="Films d'animation japonais" media={animationMovies} />
        <MovieRowAnimated title="Films japonais" media={japaneseMovies} />
        <MovieRowAnimated title="Films coréens" media={koreanMovies} />
        <MovieRowAnimated title="Films d'action" media={actionMovies} />
        <MovieRowAnimated title="Comédies" media={comedyMovies} />
        <MovieRowAnimated title="Films d'horreur" media={horrorMovies} />
        <MovieRowAnimated title="Science-Fiction" media={sciFiMovies} />
        <MovieRowAnimated title="Drames" media={dramaMovies} />
        <MovieRowAnimated title="Films romantiques" media={romanceMovies} />
        <MovieRowAnimated title="Thrillers" media={thrillerMovies} />
        <MovieRowAnimated title="Films français (VF)" media={frenchMovies} />
        <MovieRowAnimated title="Films en VO" media={englishMovies} />
        <MovieRowAnimated title="Documentaires" media={documentaries} />
        <MovieRowAnimated title="Films populaires" media={popularMovies} />
        <MovieRowAnimated title="Les mieux notés" media={topRatedMovies} />
        <MovieRowAnimated title="Prochainement au cinéma" media={upcomingMovies} />
      </div>
    </div>
  );
}
