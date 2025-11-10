'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown, Clock, Heart, TrendingUp, Eye, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutModal from './LogoutModal';
import Avatar from './Avatar';

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

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-lg transition-all duration-300 group border border-transparent hover:border-purple-500/30"
      >
        {/* Avatar with ring and glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
          <Avatar
            avatarUrl={profile.avatar_url}
            size="md"
            className="relative ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition-all shadow-lg"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414] shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-60"></div>
          </div>
        </div>
        
        {/* Username - hidden on small screens */}
        <div className="hidden lg:block text-left">
          <div className="text-sm font-semibold leading-tight group-hover:text-purple-300 transition-colors">{profile?.username}</div>
          <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Mon profil</div>
        </div>
        
        {/* Chevron with gradient */}
        <ChevronDown 
          className={`hidden lg:block w-4 h-4 transition-all duration-300 text-gray-400 group-hover:text-purple-400 ${isOpen ? 'rotate-180' : ''}`}
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl shadow-purple-500/10 z-50 overflow-hidden"
            >
              {/* Profile Info compact */}
              <div className="relative p-3 border-b border-white/10 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-transparent">
                <div className="relative flex items-center gap-3">
                  <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-60 group-hover:opacity-100 transition"></div>
                    <Avatar
                      avatarUrl={profile.avatar_url}
                      size="lg"
                      className="relative ring-2 ring-black/50 shadow-xl"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black shadow-lg">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{profile.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5">
                <Link
                  href={`/profile/${profile.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200 group border border-transparent hover:border-purple-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Eye size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Mon Profil</span>
                </Link>

                <Link
                  href="/watched"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-200 group border border-transparent hover:border-blue-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <Clock size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Films vus</span>
                </Link>

                <Link
                  href="/likes"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-red-500/20 transition-all duration-200 group border border-transparent hover:border-pink-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
                    <Heart size={16} className="text-pink-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Mes Likes</span>
                </Link>

                <Link
                  href="/my-lists"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-200 group border border-transparent hover:border-green-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                    <List size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Mes Listes</span>
                </Link>

                <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                    <Settings size={16} className="text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Paramètres</span>
                </Link>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-red-500/20 hover:to-orange-500/20 transition-all duration-200 group border border-transparent hover:border-red-500/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                    <LogOut size={16} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm flex-1">Déconnexion</span>
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
