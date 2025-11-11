import Link from 'next/link';
import { Film } from 'lucide-react';

export default function PublicNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 pt-6">
      <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-2">
              <Film size={32} className="text-purple-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ReelVibe
              </span>
            </Link>

            {/* Menu Links - Center */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/help" className="text-gray-300 hover:text-white transition-colors font-medium">
                Aide
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors font-medium">
                Conditions
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors font-medium">
                Confidentialité
              </Link>
            </div>

            {/* Action Buttons - Right */}
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <button className="hidden sm:block px-4 py-2 text-white hover:text-gray-300 transition-colors font-medium">
                  Connexion
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                  Créer un compte
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
