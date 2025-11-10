'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLockScreen?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  showLockScreen = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !showLockScreen) {
      router.push(redirectTo);
    }
  }, [user, loading, redirectTo, showLockScreen, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show lock screen
  if (!user && showLockScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-600/20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Lock size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connexion requise</h2>
            <p className="text-gray-400 mb-6">
              Vous devez être connecté pour accéder à cette page
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition font-semibold"
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect
  if (!user) {
    return null;
  }

  // Authenticated - show content
  return <>{children}</>;
}
