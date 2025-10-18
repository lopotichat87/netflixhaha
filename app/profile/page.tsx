'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Edit, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !profile) {
    router.push('/auth/login');
    return null;
  }

  const [emoji, color] = profile.avatar_url?.split('|') || ['👤', 'bg-gray-600'];

  const menuItems = [
    { label: 'Compte', href: '/profile/settings' },
    { label: 'Historique', href: '/history' },
    { label: 'Mes Likes', href: '/likes' },
    { label: 'Mes Listes', href: '/my-lists' },
    { label: 'Statistiques', href: '/stats' },
    { label: 'Watch Party', href: '/watch-party' },
  ];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-20">
        {/* Header */}
        <div className="border-b border-gray-800 px-4 md:px-16 py-8">
          <h1 className="text-4xl md:text-6xl font-medium">Compte</h1>
        </div>

        {/* Content */}
        <div className="px-4 md:px-16 py-12 max-w-5xl">
          {/* Membership Section */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Abonnement</h2>
                <p className="text-lg mb-1">{user.email}</p>
                <p className="text-gray-400 text-sm">Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Profil</h2>
            
            <div className="flex items-center justify-between p-4 hover:bg-gray-900 transition rounded">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${color} rounded flex items-center justify-center text-3xl`}>
                  {emoji}
                </div>
                <div>
                  <p className="font-medium text-lg">{profile.username}</p>
                  {profile.is_kids && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded mt-1 inline-block">
                      Profil Enfant
                    </span>
                  )}
                </div>
              </div>
              <Link 
                href="/profile/settings"
                className="text-gray-400 hover:text-white transition"
              >
                <Edit size={20} />
              </Link>
            </div>
          </div>

          {/* Settings Menu */}
          <div className="mb-8 pb-8 border-b border-gray-800">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider mb-6">Paramètres</h2>
            
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-4 hover:bg-gray-900 transition rounded group"
                >
                  <span className="text-lg">{item.label}</span>
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div>
            <button
              onClick={async () => {
                const { supabase } = await import('@/lib/supabase');
                await supabase.auth.signOut();
                router.push('/auth/login');
              }}
              className="text-gray-400 hover:text-white text-lg underline transition"
            >
              Se déconnecter de tous les appareils
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
