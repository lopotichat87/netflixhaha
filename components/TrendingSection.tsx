'use client';

import { useAuth } from '@/contexts/AuthContext';
import MovieRowAnimated from './MovieRowAnimated';

interface TrendingSectionProps {
  media: any[];
}

export default function TrendingSection({ media }: TrendingSectionProps) {
  const { user } = useAuth();

  // Si l'utilisateur est connecté, afficher normalement après historique/reco
  // Si non connecté, cette section sera la première (car historique/reco ne s'affichent pas)
  return <MovieRowAnimated title="Tendances du moment" media={media} />;
}
