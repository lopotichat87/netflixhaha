'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
}

export default function SagasPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCollections(collections);
    } else {
      const filtered = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCollections(filtered);
    }
  }, [searchQuery, collections]);

  const loadCollections = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      
      // IDs des collections/sagas populaires
      const popularCollectionIds = [
        // Marvel Universe
        131295, // Marvel Cinematic Universe - Phase 1
        131296, // Marvel Cinematic Universe - Phase 2
        131292, // Marvel Cinematic Universe - Phase 3
        131293, // Marvel Cinematic Universe - Phase 4
        86311, // The Avengers
        556, // Spider-Man
        131296, // Iron Man
        131292, // Captain America
        131295, // Thor
        422834, // Guardians of the Galaxy
        284433, // Deadpool
        748, // X-Men
        453993, // Wolverine
        1709, // Blade
        
        // DC Universe
        263, // The Dark Knight
        948485, // DC Extended Universe
        209131, // Superman
        284433, // Batman
        
        // Star Wars
        10, // Star Wars
        
        // Harry Potter & Wizarding World
        1241, // Harry Potter
        529892, // Fantastic Beasts
        
        // Fast & Furious
        9485, // Fast & Furious
        
        // James Bond
        645, // James Bond
        
        // The Matrix
        2344, // The Matrix
        
        // Alien
        8091, // Alien
        135416, // Predator
        
        // Jurassic Park
        328, // Jurassic Park
        
        // Die Hard
        1570, // Die Hard
        
        // Mad Max
        8945, // Mad Max
        
        // Pirates of the Caribbean
        295, // Pirates of the Caribbean
        
        // Mission: Impossible
        87359, // Mission: Impossible
        
        // Godzilla & MonsterVerse
        535313, // Godzilla (MonsterVerse)
        374509, // Godzilla
        
        // Lord of the Rings & Hobbit
        623, // The Lord of the Rings
        121938, // The Hobbit
        
        // Terminator
        8580, // Terminator
        
        // Rocky & Creed
        1575, // Rocky
        553, // Rambo
        
        // John Wick
        125574, // John Wick
        
        // Kingsman
        404609, // Kingsman
        
        // Sherlock Holmes
        86066, // Sherlock Holmes
        
        // Ghostbusters
        2980, // Ghostbusters
        
        // Men in Black
        86055, // Men in Black
        
        // Ocean's
        304, // Ocean's
        
        // The Hangover
        1733, // The Hangover
        
        // Animation - Pixar & DreamWorks
        86119, // Shrek
        137697, // Toy Story
        87096, // How to Train Your Dragon
        544, // Ice Age
        87118, // Despicable Me
        544669, // Kung Fu Panda
        91361, // Cars
        137106, // Finding Nemo
        
        // The Godfather
        131, // The Godfather
        
        // Back to the Future
        264, // Back to the Future
        
        // Lethal Weapon
        2150, // Lethal Weapon
        
        // Planet of the Apes
        8354, // Planet of the Apes
        
        // Horror Classics
        230, // The Naked Gun
        91361, // Halloween
        656, // A Nightmare on Elm Street
        2806, // American Pie
        86027, // Saw
        1582, // Scream
        91363, // Friday the 13th
        8581, // The Conjuring
        
        // Austin Powers
        495, // Austin Powers
        
        // Indiana Jones
        87800, // Indiana Jones
        
        // Bourne
        2883, // Bourne
        
        // Hunger Games
        131635, // The Hunger Games
        
        // Twilight
        33514, // Twilight
        
        // Divergent
        283579, // Divergent
        
        // Maze Runner
        295130, // Maze Runner
        
        // Transformers
        8650, // Transformers
        
        // Star Trek
        151, // Star Trek
        
        // Underworld
        2326, // Underworld
        
        // Resident Evil
        17255, // Resident Evil
        
        // The Expendables
        126125, // The Expendables
        
        // Now You See Me
        382320, // Now You See Me
        
        // 21 Jump Street
        212562, // 21 Jump Street
        
        // Bad Boys
        14890, // Bad Boys
        
        // Rush Hour
        90863, // Rush Hour
        
        // Night at the Museum
        85861, // Night at the Museum
        
        // Fantastic Four
        9744, // Fantastic Four
        
        // Chronicles of Narnia
        420, // Chronicles of Narnia
      ];      
      // Supprimer les doublons
      const uniqueCollectionIds = [...new Set(popularCollectionIds)];

      const collectionsData = await Promise.all(
        uniqueCollectionIds.map(async (id) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}&language=fr-FR`
            );
            if (response.ok) {
              return await response.json();
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      const validCollections = collectionsData.filter((c) => c !== null);
      setCollections(validCollections);
      setFilteredCollections(validCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
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

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-32 px-4 md:px-16 pb-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Film size={40} className="text-red-600" />
            <h1 className="text-4xl md:text-5xl font-bold">Sagas & Collections</h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Découvrez les plus grandes sagas du cinéma
          </p>

          {/* Search Bar */}
          <div className="max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une saga..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-white transition"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-6">
          {filteredCollections.length} saga{filteredCollections.length > 1 ? 's' : ''} trouvée{filteredCollections.length > 1 ? 's' : ''}
        </p>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/collection/${collection.id}`}>
                <div className="group relative aspect-video rounded-lg overflow-hidden bg-gray-900 hover:scale-105 transition-transform duration-300">
                  {collection.backdrop_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w780${collection.backdrop_path}`}
                      alt={collection.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : collection.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${collection.poster_path}`}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Film size={48} className="text-gray-600" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold line-clamp-2 group-hover:text-red-500 transition-colors">
                        {collection.name}
                      </h3>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white text-black px-6 py-3 rounded-full font-semibold">
                        Voir la saga
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {collections.length === 0 && !loading && (
          <div className="text-center py-20">
            <Film size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucune saga trouvée</h2>
            <p className="text-gray-400">
              Les collections seront bientôt disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
