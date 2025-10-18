'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown, Clock, Heart, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutModal from './LogoutModal';

export default function UserMenu() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    router.push('/auth/login');
  };

  if (!mounted || loading) {
    return (
      <div className="w-10 h-10 bg-gray-700 rounded animate-pulse" />
    );
  }

  if (!user || !profile) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
      >
        Connexion
      </Link>
    );
  }

  // Parser l'avatar (format: "emoji|color")
  const [emoji, color] = profile.avatar_url?.split('|') || ['👤', 'bg-gray-600'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
      >
        {/* Avatar */}
        <div className={`w-10 h-10 ${color} rounded flex items-center justify-center text-xl`}>
          {emoji}
        </div>
        
        {/* Username (desktop only) */}
        <span className="hidden md:block font-semibold">{profile.username}</span>
        
        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-black/95 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Profile Info */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${color} rounded flex items-center justify-center text-2xl`}>
                    {emoji}
                  </div>
                  <div>
                    <p className="font-semibold">{profile.username}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                >
                  <User size={18} />
                  <span>Mon profil</span>
                </Link>

                <Link
                  href="/history"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                >
                  <Clock size={18} />
                  <span>Historique</span>
                </Link>

                <Link
                  href="/likes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                >
                  <Heart size={18} />
                  <span>Mes Likes</span>
                </Link>

                <Link
                  href="/stats"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                >
                  <TrendingUp size={18} />
                  <span>Statistiques</span>
                </Link>

                <Link
                  href="/profile/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition"
                >
                  <Settings size={18} />
                  <span>Paramètres</span>
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-left"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}
