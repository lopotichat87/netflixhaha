'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Sparkles } from 'lucide-react';
import MovieRow from './MovieRow';
import Link from 'next/link';

export default function PersonalizedRecommendations() {
  const { user } = useAuth();
  const { data: recommendations = [], isLoading: loading } = useRecommendations();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="px-4 md:px-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-xl md:text-2xl font-semibold">Recommandé pour vous</h2>
          </div>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[120px] md:min-w-[160px] aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-8">
        <div className="px-4 md:px-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-400" size={24} />
            <h2 className="text-xl md:text-2xl font-semibold">Recommandé pour vous</h2>
          </div>
          <div className="relative overflow-hidden rounded-lg" style={{ height: '200px' }}>
            {/* Blurred background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 blur-sm"></div>
            
            {/* Lock overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <Link href="/auth/login" className="text-white hover:underline text-lg font-medium">
                    Connectez-vous pour des recommandations personnalisées
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Ne rien afficher si vide
  }

  return (
    <div className="mb-8">
      <div className="px-4 md:px-16">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-purple-400" size={24} />
          <h2 className="text-xl md:text-2xl font-semibold">Recommandé pour vous</h2>
        </div>
      </div>
      <MovieRow title="" media={recommendations} />
    </div>
  );
}
