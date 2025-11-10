import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * Vérifie si l'utilisateur est connecté et redirige si nécessaire
   * @param redirectUrl URL de redirection si non connecté
   * @returns true si authentifié, false sinon
   */
  const requireAuth = useCallback((redirectUrl = '/auth/login') => {
    if (!user && !loading) {
      router.push(redirectUrl);
      return false;
    }
    return !!user;
  }, [user, loading, router]);

  /**
   * Vérifie si l'utilisateur est le propriétaire d'une ressource
   * @param ownerId ID du propriétaire de la ressource
   * @returns true si propriétaire, false sinon
   */
  const isOwner = useCallback((ownerId: string) => {
    return user?.id === ownerId;
  }, [user]);

  /**
   * Vérifie l'authentification et la propriété
   * @param ownerId ID du propriétaire
   * @param redirectUrl URL de redirection
   * @returns true si auth ET owner, false sinon
   */
  const requireOwnership = useCallback((ownerId: string, redirectUrl = '/') => {
    if (!requireAuth()) return false;
    
    if (!isOwner(ownerId)) {
      router.push(redirectUrl);
      return false;
    }
    
    return true;
  }, [requireAuth, isOwner, router]);

  /**
   * Wrapper pour les actions nécessitant une authentification
   * @param action Fonction à exécuter si authentifié
   * @param redirectUrl URL de redirection si non connecté
   */
  const withAuth = useCallback((
    action: () => void | Promise<void>,
    redirectUrl = '/auth/login'
  ) => {
    return () => {
      if (requireAuth(redirectUrl)) {
        action();
      }
    };
  }, [requireAuth]);

  /**
   * Wrapper pour les actions nécessitant la propriété
   * @param ownerId ID du propriétaire
   * @param action Fonction à exécuter si owner
   * @param redirectUrl URL de redirection
   */
  const withOwnership = useCallback((
    ownerId: string,
    action: () => void | Promise<void>,
    redirectUrl = '/'
  ) => {
    return () => {
      if (requireOwnership(ownerId, redirectUrl)) {
        action();
      }
    };
  }, [requireOwnership]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    requireAuth,
    isOwner,
    requireOwnership,
    withAuth,
    withOwnership,
  };
}

// Export type pour TypeScript
export type AuthGuard = ReturnType<typeof useAuthGuard>;
