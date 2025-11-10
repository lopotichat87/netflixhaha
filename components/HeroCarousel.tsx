'use client';

import { useState, useEffect } from 'react';
import { Media, getImageUrl, getTitle, getReleaseDate, getMediaType } from '@/lib/api';
import { Star, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeroCarouselProps {
  media: Media[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({ media, autoPlayInterval = 8000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (isPaused || media.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, media.length, autoPlayInterval]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!currentMedia) return null;

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <img
            src={getImageUrl(currentMedia.backdrop_path, 'original')}
            alt={getTitle(currentMedia)}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition opacity-0 hover:opacity-100 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute bottom-[20%] left-4 md:left-16 max-w-xl md:max-w-2xl z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {getTitle(currentMedia)}
          </motion.h1>

          <motion.p
            className="text-sm md:text-lg mb-6 line-clamp-3 drop-shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {currentMedia.overview}
          </motion.p>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href={`/${getMediaType(currentMedia)}/${currentMedia.id}`}>
              <Button variant="default" size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
                <Star size={20} />
                <span>Noter</span>
              </Button>
            </Link>

            <Link href={`/${getMediaType(currentMedia)}/${currentMedia.id}`}>
              <Button variant="secondary" size="lg" className="gap-2 bg-white/10 hover:bg-white/20">
                <Info size={20} />
                <span>Plus d'infos</span>
              </Button>
            </Link>
          </motion.div>

          {/* Rating */}
          <motion.div
            className="mt-6 flex items-center gap-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <span className="text-green-500 font-semibold">
              {Math.round(currentMedia.vote_average * 10)}% Match
            </span>
            <span className="border border-gray-400 px-2 py-0.5">
              {getReleaseDate(currentMedia).split('-')[0] || 'N/A'}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-24 right-4 md:right-16 z-20 flex gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
