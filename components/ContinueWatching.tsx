'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHistory } from '@/hooks/useHistory';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import HistoryCard from './HistoryCard';
import Link from 'next/link';

export default function ContinueWatching() {
  const { user } = useAuth();
  const { data: history = [], isLoading: loading } = useHistory();
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
        <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Votre historique</h2>
        <div className="px-4 md:px-16">
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
        <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Votre historique</h2>
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
                    Connectez-vous pour voir votre historique
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null; // Ne rien afficher si vide
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">Votre historique</h2>
      
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
          {history.map((item) => (
            <div 
              key={item.id} 
              className="min-w-[120px] md:min-w-[160px]"
            >
              <HistoryCard
                id={item.media_id}
                title={item.title}
                posterPath={item.poster_path || ''}
                mediaType={item.media_type}
                progress={item.progress}
              />
            </div>
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
