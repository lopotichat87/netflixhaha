'use client';

import { Media } from '@/lib/api';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MovieRowProps {
  title: string;
  media: Media[];
}

export default function MovieRowAnimated({ title, media }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  return (
    <motion.div 
      className="space-y-2 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <h2 className="text-xl md:text-2xl font-semibold mb-4 px-4 md:px-16">{title}</h2>
      
      <div className="relative group px-4 md:px-16">
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
            className="absolute left-4 md:left-16 top-0 bottom-0 z-40 w-16 bg-gradient-to-r from-black/80 to-transparent hover:from-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Scroll left"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={48} className="drop-shadow-lg" />
          </motion.button>
        )}

        <div
          ref={rowRef}
          className="flex gap-2 overflow-x-scroll scrollbar-hide scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            overflowY: 'visible'
          }}
        >
          {media.map((item) => (
            <div 
              key={item.id} 
              className="min-w-[150px] md:min-w-[200px]"
            >
              <MovieCard media={item} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <motion.button
            onClick={() => scroll('right')}
            className="absolute right-4 md:right-16 top-0 bottom-0 z-40 w-16 bg-gradient-to-l from-black/80 to-transparent hover:from-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            aria-label="Scroll right"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={48} className="drop-shadow-lg" />
          </motion.button>
        )}

        {/* Hint indicator for first time - shows briefly then fades */}
        {showRightArrow && (
          <motion.div
            className="absolute right-8 md:right-20 top-1/2 -translate-y-1/2 z-35 pointer-events-none"
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: [0, 0.6, 0.6, 0],
              x: [-10, 0, 0, 10]
            }}
            transition={{ 
              duration: 3,
              times: [0, 0.3, 0.7, 1],
              delay: 0.5
            }}
          >
            <ChevronRight size={32} className="text-white/60" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
