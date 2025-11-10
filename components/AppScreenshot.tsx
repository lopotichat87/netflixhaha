'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AppScreenshotProps {
  imageSrc: string;
  alt: string;
  delay?: number;
}

export default function AppScreenshot({ imageSrc, alt, delay = 0 }: AppScreenshotProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className="relative group"
    >
      {/* Browser Chrome */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Browser Top Bar */}
        <div className="bg-gray-900 px-4 py-3 flex items-center gap-2 border-b border-white/10">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 ml-4 bg-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-500">
            reelvibe.app
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-video bg-gray-900">
          {!imageError ? (
            <motion.img
              src={imageSrc}
              alt={alt}
              className="w-full h-full object-cover object-top"
              onError={() => setImageError(true)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            // Fallback si l'image n'existe pas
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-400">Aperçu de l'application</p>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <p className="text-white font-semibold text-sm">{alt}</p>
          </motion.div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.div>
  );
}
