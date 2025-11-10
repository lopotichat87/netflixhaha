'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  action?: string; // "liker", "commenter", "noter", etc.
}

export default function AuthRequired({ 
  children, 
  fallback,
  action = "effectuer cette action"
}: AuthRequiredProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <Lock size={32} className="mx-auto mb-2 text-purple-400" />
            <p className="text-sm font-semibold mb-2">Connexion requise</p>
            <p className="text-xs text-gray-400 mb-3">
              Pour {action}
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-sm font-semibold flex items-center gap-2 mx-auto"
            >
              <LogIn size={16} />
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
