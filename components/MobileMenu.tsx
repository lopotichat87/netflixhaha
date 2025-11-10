'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Home, Film, Tv, Sparkles, Heart, List, TrendingUp, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Accueil', href: '/home' },
    { icon: Film, label: 'Films', href: '/movies' },
    { icon: Tv, label: 'Séries', href: '/browse/series' },
    { icon: List, label: 'Collections', href: '/sagas' },
    { icon: TrendingUp, label: 'Tendances', href: '/trending' },
    { icon: Sparkles, label: 'Nouveautés', href: '/nouveautes' },
    { icon: Heart, label: 'Mes Likes', href: '/likes' },
  ];

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-gray-800 rounded transition"
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-black border-l border-gray-800 z-50 md:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                    ReelVibe
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* User Info */}
                {user && profile && (
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded transition"
                  >
                    <div className={`w-12 h-12 ${profile.avatar_url?.split('|')[1] || 'bg-gray-600'} rounded-full flex items-center justify-center text-2xl`}>
                      {profile.avatar_url?.split('|')[0] || '👤'}
                    </div>
                    <div>
                      <p className="font-semibold">{profile.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Menu Items */}
              <nav className="p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded transition"
                      >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Footer */}
              {user && (
                <div className="p-4 border-t border-gray-800 mt-auto">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded transition mb-2"
                  >
                    <User size={20} />
                    <span>Mon Profil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded transition text-left"
                  >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              {!user && (
                <div className="p-4 border-t border-gray-800">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
                  >
                    Connexion
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
