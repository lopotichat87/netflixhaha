'use client';

import { Media } from '@/lib/api';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface MovieRowProps {
  title: string;
  media: Media[];
}

export default function MovieRow({ title, media }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Vérifier si le scroll est nécessaire
  useEffect(() => {
    const checkScroll = () => {
      if (rowRef.current) {
        const hasScroll = rowRef.current.scrollWidth > rowRef.current.clientWidth;
        setShowRightArrow(hasScroll && rowRef.current.scrollLeft < rowRef.current.scrollWidth - rowRef.current.clientWidth - 10);
        setShowLeftArrow(hasScroll && rowRef.current.scrollLeft > 0);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [media]);

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

      // Update arrow visibility
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
    <div className="space-y-2 px-4 md:px-16 mb-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="relative movie-row-container">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft size={40} />
          </button>
        )}

        {/* Movies Container */}
        <div
          ref={rowRef}
          onScroll={() => {
            if (rowRef.current) {
              setShowLeftArrow(rowRef.current.scrollLeft > 0);
              setShowRightArrow(
                rowRef.current.scrollLeft < rowRef.current.scrollWidth - rowRef.current.clientWidth - 10
              );
            }
          }}
          className="flex gap-2 overflow-x-scroll scrollbar-hide scroll-smooth movie-row-scroll"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            overflowY: 'hidden'
          }}
          onMouseEnter={(e) => {
            const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
            buttons?.forEach(btn => btn.style.opacity = '1');
          }}
          onMouseLeave={(e) => {
            const buttons = e.currentTarget.parentElement?.querySelectorAll('button');
            buttons?.forEach(btn => btn.style.opacity = '0');
          }}
        >
          {media.map((item) => (
            <div key={item.id} className="w-[100px] md:w-[130px] flex-shrink-0">
              <MovieCard media={item} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight size={40} />
          </button>
        )}
      </div>
    </div>
  );
}
