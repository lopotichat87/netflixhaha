'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import MovieRowAnimated from '@/components/MovieRowAnimated';
import ContinueWatching from '@/components/ContinueWatching';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Page pour utilisateurs connectés
export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [heroMedia, setHeroMedia] = useState<any[]>([]);
  const [trendingAll, setTrendingAll] = useState<any[]>([]);
  const [popularMovies, setPopularMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<any[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<any[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<any[]>([]);
  const [airingTodayTV, setAiringTodayTV] = useState<any[]>([]);
  const [onTheAirTV, setOnTheAirTV] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Rediriger si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing');
    }
  }, [user, loading, router]);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          trending, 
          popular, 
          topRated, 
          upcoming, 
          nowPlaying,
          popularTV, 
          topRatedTV,
          airingToday,
          onTheAir
        ] = await Promise.all([
          api.getTrendingAll(),
          api.getPopularMovies(),
          api.getTopRatedMovies(),
          api.getUpcomingMovies(),
          api.getNowPlayingMovies(),
          api.getPopularTVShows(),
          api.getTopRatedTVShows(),
          api.getAiringTodayTVShows(),
          api.getOnTheAirTVShows()
        ]);
        
        setTrendingAll(trending);
        setHeroMedia(trending.slice(0, 5));
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
        setNowPlayingMovies(nowPlaying);
        setPopularTVShows(popularTV);
        setTopRatedTVShows(topRatedTV);
        setAiringTodayTV(airingToday);
        setOnTheAirTV(onTheAir);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative bg-[#141414] min-h-screen">
      <Navbar />
      
      {/* Hero Carousel Section */}
      {dataLoading ? (
        <div className="h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <HeroCarousel media={heroMedia} />
      )}

      {/* Content Rows */}
      <div className="relative z-10 space-y-8 pb-20 -mt-24">
        {/* Toujours afficher les films vus en premier */}
        <div className="min-h-[200px]">
          <ContinueWatching />
        </div>
        
        {/* Toujours afficher les recommandations en second */}
        <div className="min-h-[200px]">
          <PersonalizedRecommendations />
        </div>
        
        {/* Tendances */}
        {!dataLoading && trendingAll.length > 0 && (
          <MovieRowAnimated title="Tendances du moment" media={trendingAll} />
        )}

        {/* Films populaires */}
        {!dataLoading && popularMovies.length > 0 && (
          <MovieRowAnimated title="Films populaires" media={popularMovies} />
        )}

        {/* Séries populaires */}
        {!dataLoading && popularTVShows.length > 0 && (
          <MovieRowAnimated title="Séries populaires" media={popularTVShows} />
        )}

        {/* Films les mieux notés */}
        {!dataLoading && topRatedMovies.length > 0 && (
          <MovieRowAnimated title="Films les mieux notés" media={topRatedMovies} />
        )}

        {/* Séries les mieux notées */}
        {!dataLoading && topRatedTVShows.length > 0 && (
          <MovieRowAnimated title="Séries les mieux notées" media={topRatedTVShows} />
        )}

        {/* Au cinéma actuellement */}
        {!dataLoading && nowPlayingMovies.length > 0 && (
          <MovieRowAnimated title="Au cinéma actuellement" media={nowPlayingMovies} />
        )}

        {/* Prochainement */}
        {!dataLoading && upcomingMovies.length > 0 && (
          <MovieRowAnimated title="Prochainement au cinéma" media={upcomingMovies} />
        )}

        {/* Diffusé aujourd'hui */}
        {!dataLoading && airingTodayTV.length > 0 && (
          <MovieRowAnimated title="Séries diffusées aujourd'hui" media={airingTodayTV} />
        )}

        {/* En cours de diffusion */}
        {!dataLoading && onTheAirTV.length > 0 && (
          <MovieRowAnimated title="Séries en cours de diffusion" media={onTheAirTV} />
        )}
      </div>
    </div>
  );
}
