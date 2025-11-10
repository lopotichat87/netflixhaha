'use client';

import { useEffect, useState } from 'react';
import { Eye, Heart, Star, Users } from 'lucide-react';
import { ratingsHelpers } from '@/lib/ratings';

interface MediaStatsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  className?: string;
  showDetailed?: boolean;
}

interface Stats {
  total_ratings: number;
  average_rating: number;
  total_likes: number;
  total_watched: number;
}

export default function MediaStats({ 
  mediaId, 
  mediaType, 
  className = '',
  showDetailed = false 
}: MediaStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [mediaId, mediaType]);

  const loadStats = async () => {
    try {
      const data = await ratingsHelpers.getMediaStats(mediaId, mediaType);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (showDetailed) {
    return (
      <div className={`flex flex-wrap items-center gap-4 ${className}`}>
        {/* Note moyenne */}
        {stats.total_ratings > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 rounded-lg">
            <Star size={16} className="text-yellow-400" fill="currentColor" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-yellow-400">
                {stats.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                {formatNumber(stats.total_ratings)} notes
              </span>
            </div>
          </div>
        )}

        {/* Vues */}
        {stats.total_watched > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 rounded-lg">
            <Eye size={16} className="text-green-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-400">
                {formatNumber(stats.total_watched)}
              </span>
              <span className="text-xs text-gray-400">vues</span>
            </div>
          </div>
        )}

        {/* Likes */}
        {stats.total_likes > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-600/20 rounded-lg">
            <Heart size={16} className="text-red-400" fill="currentColor" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-red-400">
                {formatNumber(stats.total_likes)}
              </span>
              <span className="text-xs text-gray-400">likes</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Version compacte pour les cards
  return (
    <div className={`flex items-center gap-3 text-xs ${className}`}>
      {/* Note moyenne */}
      {stats.total_ratings > 0 && (
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-400" fill="currentColor" />
          <span className="font-semibold text-yellow-400">
            {stats.average_rating.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({formatNumber(stats.total_ratings)})
          </span>
        </div>
      )}

      {/* Vues */}
      {stats.total_watched > 0 && (
        <div className="flex items-center gap-1">
          <Eye size={12} className="text-green-400" />
          <span className="text-gray-300">{formatNumber(stats.total_watched)}</span>
        </div>
      )}

      {/* Likes */}
      {stats.total_likes > 0 && (
        <div className="flex items-center gap-1">
          <Heart size={12} className="text-red-400" fill="currentColor" />
          <span className="text-gray-300">{formatNumber(stats.total_likes)}</span>
        </div>
      )}
    </div>
  );
}
