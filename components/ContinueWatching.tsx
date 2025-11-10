'use client';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ratingsHelpers } from '@/lib/ratings';

export default function ContinueWatching() {
  const { user } = useAuth();
  const [watched, setWatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  useEffect(() => {
    const loadWatched = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await ratingsHelpers.getUserWatched(user.id);
        setWatched(data.slice(0, 20)); // Limiter à 20 éléments
      } catch (error) {
        console.error('Error loading watched:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWatched();
  }, [user]);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      const newScrollLeft =
        direction === 'left'
          ? rowRef.current.scrollLeft - scrollAmount
          : rowRef.current.scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(() => {
        if (rowRef.current) {
          setShowLeftArrow(rowRef.current.scrollLeft > 0);
          setShowRightArrow(
            rowRef.current.scrollLeft <
              rowRef.current.scrollWidth - rowRef.current.clientWidth - 10
          );
        }
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Films et séries vus</h2>
        <div className="px-4 md:px-16">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[100px] md:min-w-[130px] aspect-[2/3] bg-gray-800 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Films et séries vus</h2>
        <div className="px-4 md:px-16">
          <div className="relative overflow-hidden rounded-lg" style={{ height: '200px' }}>
            {/* Blurred background */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 blur-sm"></div>
            
            {/* Lock overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <Link href="/auth/login" className="text-white hover:underline text-lg font-medium">
                    Connectez-vous pour noter vos films et séries
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (watched.length === 0) {
    return null; // Ne rien afficher si vide
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Films et séries vus</h2>
      
      <div className="relative px-4 md:px-16">
        {/* Gradient fade left */}
        {showLeftArrow && (
          <div className="absolute left-4 md:left-16 top-0 bottom-0 w-16 bg-gradient-to-r from-[#141414] to-transparent z-30 pointer-events-none" />
        )}
        
        {/* Gradient fade right */}
        {showRightArrow && (
          <div className="absolute right-4 md:right-16 top-0 bottom-0 w-16 bg-gradient-to-l from-[#141414] to-transparent z-30 pointer-events-none" />
        )}

        {showLeftArrow && (
          <motion.button
            onClick={() => scroll('left')}
            className="absolute left-4 md:left-16 top-0 bottom-0 z-40 w-16 bg-gradient-to-r from-black/80 to-transparent hover:from-black/90 flex items-center justify-center transition-all duration-300"
            aria-label="Scroll left"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={48} className="drop-shadow-lg" />
          </motion.button>
        )}

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-scroll scrollbar-hide scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            overflowY: 'hidden'
          }}
        >
          {watched.map((item) => (
            <Link
              key={item.id}
              href={`/${item.media_type}/${item.media_id}`}
              className="min-w-[100px] md:min-w-[130px] group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 mb-2 transition-transform duration-200 group-hover:-translate-y-1">
                {item.media_poster ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.media_poster}`}
                    alt={item.media_title}
                    className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
                {item.rating && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold">{item.rating}</span>
                  </div>
                )}
                {item.is_liked && (
                  <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm p-1.5 rounded-full">
                    <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-white transition-colors">
                {item.media_title}
              </h3>
            </Link>
          ))}
        </div>

        {showRightArrow && (
          <motion.button
            onClick={() => scroll('right')}
            className="absolute right-4 md:right-16 top-0 bottom-0 z-40 w-16 bg-gradient-to-l from-black/80 to-transparent hover:from-black/90 flex items-center justify-center transition-all duration-300"
            aria-label="Scroll right"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={48} className="drop-shadow-lg" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
