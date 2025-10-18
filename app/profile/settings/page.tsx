'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase, profileHelpers } from '@/lib/supabase';

const AVATARS = [
  { id: 1, emoji: '🎬', color: 'bg-red-600' },
  { id: 2, emoji: '🍿', color: 'bg-blue-600' },
  { id: 3, emoji: '🎭', color: 'bg-purple-600' },
  { id: 4, emoji: '🎪', color: 'bg-green-600' },
  { id: 5, emoji: '🎨', color: 'bg-yellow-600' },
  { id: 6, emoji: '🎮', color: 'bg-pink-600' },
  { id: 7, emoji: '🎸', color: 'bg-indigo-600' },
  { id: 8, emoji: '🎯', color: 'bg-orange-600' },
];

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(profile?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const [emoji, color] = profile?.avatar_url?.split('|') || ['👤', 'bg-gray-600'];
    return AVATARS.find(a => a.emoji === emoji && a.color === color) || AVATARS[0];
  });
  const [profilePin, setProfilePin] = useState('');
  const [usePin, setUsePin] = useState(!!profile?.profile_pin);
  const [isKids, setIsKids] = useState(profile?.is_kids || false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      await profileHelpers.updateProfile(user.id, {
        username,
        avatar_url: `${selectedAvatar.emoji}|${selectedAvatar.color}`,
        profile_pin: usePin ? profilePin : null,
        is_kids: isKids,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Paramètres du profil</h1>
              <p className="text-gray-400">Personnalisez votre profil</p>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-600/20 border border-green-600 rounded-lg">
              ✅ Profil mis à jour avec succès !
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-900 rounded-lg p-8 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-3">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-white transition"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">Avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`${avatar.color} aspect-square rounded-lg flex items-center justify-center text-4xl transition ${
                      selectedAvatar.id === avatar.id ? 'ring-4 ring-white scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN Protection */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePin}
                  onChange={(e) => setUsePin(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Protéger ce profil avec un code PIN</span>
              </label>

              {usePin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <input
                    type="text"
                    value={profilePin}
                    onChange={(e) => setProfilePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="Code PIN (4 chiffres)"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-center text-2xl tracking-widest focus:outline-none focus:border-white transition"
                  />
                </motion.div>
              )}
            </div>

            {/* Kids Mode */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm">Profil enfant (contenu adapté)</span>
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !username}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 py-3 rounded font-semibold transition"
            >
              <Save size={20} />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
