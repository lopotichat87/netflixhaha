'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { activityTracker } from '@/lib/activity-tracker';

export default function ActivityTracker() {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;

    // Démarrer une session
    const initSession = async () => {
      try {
        const sessionId = await activityTracker.startSession(user.id);
        sessionIdRef.current = sessionId;
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    initSession();

    // Tracker l'activité de l'utilisateur
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Événements d'activité
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Mettre à jour la session toutes les 60 secondes
    const sessionUpdate = setInterval(async () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      // Si inactif pendant plus de 5 minutes, terminer la session
      if (timeSinceLastActivity > 5 * 60 * 1000 && sessionIdRef.current) {
        await activityTracker.endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      } else if (sessionIdRef.current && timeSinceLastActivity < 5 * 60 * 1000) {
        // Mettre à jour la session active
        await activityTracker.endSession(sessionIdRef.current);
        const newSessionId = await activityTracker.startSession(user.id);
        sessionIdRef.current = newSessionId;
      }
    }, 60000);

    // Terminer la session lors de la fermeture
    const handleBeforeUnload = async () => {
      if (sessionIdRef.current) {
        await activityTracker.endSession(sessionIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(sessionUpdate);

      // Terminer la session au démontage
      if (sessionIdRef.current) {
        activityTracker.endSession(sessionIdRef.current);
      }
    };
  }, [user]);

  return null; // Composant invisible
}
