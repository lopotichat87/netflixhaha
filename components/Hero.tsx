'use client';

import { Media, getImageUrl, getTitle, getReleaseDate } from '@/lib/api';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface HeroProps {
  media: Media;
}

export default function Hero({ media }: HeroProps) {
  return (
    <div className="relative h-[56.25vw] max-h-[800px] min-h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(media.backdrop_path, 'original')}
          alt={getTitle(media)}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <motion.div 
        className="absolute bottom-[20%] left-4 md:left-16 max-w-xl md:max-w-2xl z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {getTitle(media)}
        </motion.h1>
        
        <motion.p 
          className="text-sm md:text-lg mb-6 line-clamp-3 drop-shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {media.overview}
        </motion.p>

        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button variant="default" size="lg" className="gap-2">
            <Play size={24} fill="currentColor" />
            <span>Lecture</span>
          </Button>
          
          <Button variant="secondary" size="lg" className="gap-2">
            <Info size={24} />
            <span>Plus d'infos</span>
          </Button>
        </motion.div>

        {/* Rating */}
        <motion.div 
          className="mt-6 flex items-center gap-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <span className="text-green-500 font-semibold">
            {Math.round(media.vote_average * 10)}% Match
          </span>
          <span className="border border-gray-400 px-2 py-0.5">
            {getReleaseDate(media).split('-')[0] || 'N/A'}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
