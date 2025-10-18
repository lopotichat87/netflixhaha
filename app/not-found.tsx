'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Home, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-8xl font-bold text-white">404</h1>
          <h2 className="text-3xl font-semibold text-white">Page introuvable</h2>
          <p className="text-gray-400 text-lg">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 transition"
            >
              <Home size={20} />
              Retour à l'accueil
            </Link>
            <Link
              href="/recherche"
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700 transition"
            >
              <Search size={20} />
              Rechercher
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
