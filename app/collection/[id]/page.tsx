'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollectionPage() {
  const params = useParams();
  const collectionId = parseInt(params.id as string);
  
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/collection/${collectionId}?api_key=${API_KEY}&language=fr-FR`
      );
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[55vh] md:h-[60vh] min-h-[400px] md:min-h-[500px]">
        <div className="absolute inset-0 overflow-hidden">
          {collection.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`}
              alt={collection.name}
              className="w-full h-full object-contain md:object-cover object-center bg-black"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
        </div>

        <div className="absolute bottom-[10%] left-4 md:left-16 max-w-3xl z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">
            {collection.name}
          </h1>
          {collection.overview && (
            <p className="text-base md:text-lg text-gray-300 line-clamp-3 drop-shadow-xl">
              {collection.overview}
            </p>
          )}
        </div>
      </div>

      {/* Films de la collection */}
      <div className="px-4 md:px-16 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-bold">
            {collection.parts?.length} {collection.parts?.length > 1 ? 'Films' : 'Film'}
          </h2>
        </div>

        {/* Films en grille compacte */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {collection.parts
            ?.sort((a: any, b: any) => {
              const dateA = new Date(a.release_date || '0');
              const dateB = new Date(b.release_date || '0');
              return dateA.getTime() - dateB.getTime();
            })
            .map((movie: any, index: number) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/movie/${movie.id}`}>
                  <div className="group relative">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800 mb-2">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          Pas d'image
                        </div>
                      )}
                      
                      {/* Badge numéro */}
                      <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
                        <span className="text-xs font-bold text-white">#{index + 1}</span>
                      </div>

                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={20} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-1">
                      <h3 className="text-sm font-semibold line-clamp-2 mb-1 group-hover:text-red-500 transition-colors">
                        {movie.title}
                      </h3>
                      {movie.release_date && (
                        <p className="text-xs text-gray-500">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
