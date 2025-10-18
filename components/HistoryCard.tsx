'use client';

import Link from 'next/link';

interface HistoryCardProps {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  progress: number;
}

export default function HistoryCard({ id, title, posterPath, mediaType, progress }: HistoryCardProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-movie.jpg';

  return (
    <Link
      href={`/watch/${mediaType}/${id}`}
      className="block group cursor-pointer relative"
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 transition-all duration-300 group-hover:scale-110 group-hover:z-50">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <div className="text-center px-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 mb-2">
              <span className="text-xs font-semibold">▶ Continuer</span>
            </div>
            <p className="text-xs font-medium line-clamp-2">{title}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-30">
            <div
              className="h-full bg-red-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
