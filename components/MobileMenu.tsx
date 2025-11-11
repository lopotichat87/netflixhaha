'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu, X, Home, Film, Tv, Sparkles, Heart, List, TrendingUp, User, LogOut, 
  Search, Users, Star, Clock, BarChart3, Settings, Eye, MessageSquare, Activity,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['navigation']);
  const { user, profile } = useAuth();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const mainItems = [
    { icon: Home, label: 'Accueil', href: '/home' },
    { icon: Search, label: 'Rechercher', href: '/recherche' },
    { icon: Film, label: 'Films', href: '/movies' },
    { icon: Tv, label: 'Séries', href: '/browse/series' },
    { icon: TrendingUp, label: 'Tendances', href: '/trending' },
    { icon: Sparkles, label: 'Nouveautés', href: '/nouveautes' },
    { icon: List, label: 'Collections', href: '/sagas' },
  ];

  const myCollectionItems = [
    { icon: Heart, label: 'Mes Favoris', href: '/likes' },
    { icon: Star, label: 'Mes Notes', href: '/reviews' },
    { icon: Eye, label: 'Films Vus', href: '/watched' },
    { icon: MessageSquare, label: 'Mes Critiques', href: '/reviews' },
    { icon: List, label: 'Mes Listes', href: '/my-lists' },
    { icon: Clock, label: 'Historique', href: '/history' },
  ];

  const communityItems = [
    { icon: Users, label: 'Communauté', href: '/social' },
    { icon: Activity, label: 'Activité', href: '/activity' },
    { icon: Users, label: 'Amis', href: '/friends' },
  ];

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg transition relative group"
        style={{ 
          backgroundColor: isOpen ? 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' : 'transparent'
        }}
        aria-label="Menu"
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "closed"}
        >
          {isOpen ? (
            <X size={24} style={{ color: 'var(--color-primary)' }} />
          ) : (
            <Menu size={24} className="text-white group-hover:text-[var(--color-primary)]" />
          )}
        </motion.div>
        
        {/* Indicator Badge */}
        {!isOpen && user && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        )}
      </motion.button>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 w-80 bg-[#141414] border-l z-50 md:hidden overflow-y-auto transition-transform duration-300"
            style={{ 
              borderColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.3)',
              transform: 'translateX(0)'
            }}
          >
              {/* Header */}
              <div className="p-5 border-b" style={{ borderColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                    ReelVibe
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* User Info */}
                {user && profile && (
                  <Link
                    href={`/profile/${profile.username}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg transition hover:opacity-80"
                    style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.1)' }}
                  >
                    {profile.avatar_url && profile.avatar_url.includes('http') ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 ${profile.avatar_url?.split('|')[1] || 'bg-gray-600'} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                        {profile.avatar_url?.split('|')[0] || '👤'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{profile.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Menu Sections */}
              <nav className="p-3">
                {/* Principal */}
                <div className="mb-3">
                  <button
                    onClick={() => toggleSection('navigation')}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition group"
                  >
                    <h3 className="text-xs font-semibold uppercase text-gray-500 group-hover:text-gray-400">Navigation</h3>
                    {expandedSections.includes('navigation') ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.includes('navigation') && (
                    <ul className="space-y-1 mt-1">
                      {mainItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition group"
                          >
                            <item.icon size={20} className="group-hover:text-[var(--color-primary)]" />
                            <span className="group-hover:text-[var(--color-primary)]">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ma Collection */}
                {user && (
                  <div className="mb-3">
                    <button
                      onClick={() => toggleSection('collection')}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition group"
                    >
                      <h3 className="text-xs font-semibold uppercase text-gray-500 group-hover:text-gray-400">Ma Collection</h3>
                      {expandedSections.includes('collection') ? (
                        <ChevronDown size={16} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.includes('collection') && (
                      <ul className="space-y-1 mt-1">
                        {myCollectionItems.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition group"
                            >
                              <item.icon size={20} className="group-hover:text-[var(--color-accent)]" />
                              <span className="group-hover:text-[var(--color-accent)]">{item.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Communauté */}
                {user && (
                  <div className="mb-3">
                    <button
                      onClick={() => toggleSection('community')}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition group"
                    >
                      <h3 className="text-xs font-semibold uppercase text-gray-500 group-hover:text-gray-400">Communauté</h3>
                      {expandedSections.includes('community') ? (
                        <ChevronDown size={16} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.includes('community') && (
                      <ul className="space-y-1 mt-1">
                        {communityItems.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition group"
                            >
                              <item.icon size={20} className="group-hover:text-[var(--color-secondary)]" />
                              <span className="group-hover:text-[var(--color-secondary)]">{item.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </nav>

              {/* Footer */}
              {user && (
                <div className="p-4 border-t mt-auto" style={{ borderColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' }}>
                  <Link
                    href="/profile/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition mb-2 group"
                  >
                    <Settings size={20} className="group-hover:text-[var(--color-primary)]" />
                    <span className="group-hover:text-[var(--color-primary)]">Paramètres</span>
                  </Link>
                  <Link
                    href="/stats"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition mb-2 group"
                  >
                    <BarChart3 size={20} className="group-hover:text-[var(--color-primary)]" />
                    <span className="group-hover:text-[var(--color-primary)]">Statistiques</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-lg transition text-left group"
                  >
                    <LogOut size={20} className="text-red-400 group-hover:text-red-300" />
                    <span className="text-red-400 group-hover:text-red-300">Déconnexion</span>
                  </button>
                </div>
              )}

              {!user && (
                <div className="p-4 border-t" style={{ borderColor: 'rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' }}>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition text-white"
                    style={{ background: 'var(--gradient-button)' }}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-lg font-semibold transition mt-2 border"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
    </>
  );
}
