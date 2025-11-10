'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, FileText, Image, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from './ImageUpload';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentBio: string;
  currentBanner: string;
  currentAvatar: string;
  onSave: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentBio,
  currentBanner,
  currentAvatar,
  onSave
}: EditProfileModalProps) {
  const { user, refreshProfile } = useAuth();
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [bannerUrl, setBannerUrl] = useState(currentBanner);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUsername(currentUsername);
    setBio(currentBio);
    setBannerUrl(currentBanner);
    setAvatarUrl(currentAvatar);
  }, [currentUsername, currentBio, currentBanner, currentAvatar]);

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
      if (username !== currentUsername) {
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
        avatar_url: avatarUrl.trim() || currentAvatar, // Garder l'avatar actuel si vide
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
        onSave();
        onClose();
        setSaved(false);
      }, 1000);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-2xl max-w-2xl w-full border border-white/10 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User size={24} className="text-purple-400" />
                Modifier le profil
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <ImageUpload
                currentImage={avatarUrl}
                onImageChange={setAvatarUrl}
                userId={user!.id}
                type="avatar"
                label="Photo de profil"
                aspectRatio="aspect-square"
              />
              
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
              <ImageUpload
                currentImage={bannerUrl}
                onImageChange={setBannerUrl}
                userId={user!.id}
                type="banner"
                label="Bannière de profil (optionnel)"
                aspectRatio="aspect-[3/1]"
              />

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
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
      )}
    </AnimatePresence>
  );
}
