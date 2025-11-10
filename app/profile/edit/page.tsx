'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import Avatar from '@/components/Avatar';
import { User, FileText, Save, X, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (profile) {
      setUsername(profile.username || '');
      setBio((profile as any).bio || '');
      setBannerUrl((profile as any).banner_url || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [user, profile, router]);

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    if (username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (username.length > 20) {
      setError('Le nom d\'utilisateur ne peut pas dépasser 20 caractères');
      return;
    }

    // Vérifier que le username ne contient que des caractères alphanumériques et _
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('@/lib/supabase');

      // Vérifier si le username est déjà pris (sauf si c'est le même)
      if (username !== profile?.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          setError('Ce nom d\'utilisateur est déjà pris');
          setLoading(false);
          return;
        }
      }

      // Préparer les données de mise à jour
      const updateData = {
        username: username.trim(),
        bio: bio.trim(),
        banner_url: bannerUrl.trim() || null,
        avatar_url: avatarUrl.trim() || profile?.avatar_url || '🎬|bg-red-600',
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Mise à jour du profil avec:', updateData);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      
      console.log('✅ Profil mis à jour avec succès');

      // Rafraîchir le profil dans le contexte
      await refreshProfile();

      setSaved(true);
      setTimeout(() => {
        router.push(`/profile/${username}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <User className="text-purple-400" size={36} />
            Modifier le profil
          </h1>
          <p className="text-gray-400 mt-2">Personnalisez votre profil ReelVibe</p>
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden mb-8"
        >
          {/* Banner Preview */}
          <div className="relative h-48 bg-gradient-to-br from-purple-900 via-pink-900 to-cyan-900">
            {bannerUrl && (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
          </div>

          {/* Avatar Preview */}
          <div className="px-8 -mt-16 relative z-10 pb-6">
            <div className="flex items-end gap-4">
              <Avatar
                avatarUrl={avatarUrl}
                size="2xl"
                className="border-4 border-[#1a1a1a] shadow-xl"
              />
              <div>
                <h2 className="text-2xl font-bold">{username || 'Username'}</h2>
                <p className="text-gray-400 text-sm">{bio || 'Aucune bio'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-white/10 p-8"
        >
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-400" />
                Photo de profil
              </h3>
              <ImageUpload
                currentImage={avatarUrl}
                onImageChange={setAvatarUrl}
                userId={user!.id}
                type="avatar"
                label=""
                aspectRatio="aspect-square"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <User size={16} className="text-purple-400" />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="johndoe"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                {username.length}/20 caractères • Lettres, chiffres et _ uniquement
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText size={16} className="text-purple-400" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Parlez-nous de vous..."
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {bio.length}/200 caractères
              </p>
            </div>

            {/* Banner Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                Bannière de profil
              </h3>
              <ImageUpload
                currentImage={bannerUrl}
                onImageChange={setBannerUrl}
                userId={user!.id}
                type="banner"
                label=""
                aspectRatio="aspect-[3/1]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2"
              >
                <X size={16} />
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2"
              >
                <Check size={16} />
                Profil enregistré avec succès !
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading || saved}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saved ? (
                  <>
                    <Check size={20} />
                    Enregistré !
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
