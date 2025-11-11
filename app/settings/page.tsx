'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ThemeSelector from '@/components/ThemeSelector';
import ThemePreview from '@/components/ThemePreview';
import ImageUpload from '@/components/ImageUpload';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { User, Palette, Bell, Lock, LogOut, Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'account'>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (profile) {
      setUsername(profile.username || '');
      setBio((profile as any).bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setBannerUrl((profile as any).banner_url || '');
      setIsPrivate((profile as any).is_private || false);
    }
  }, [user, profile, router]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const { supabase } = await import('@/lib/supabase');

      // Sauvegarder le profil
      if (activeTab === 'profile') {
        await supabase
          .from('profiles')
          .update({
            username,
            bio,
            avatar_url: avatarUrl || profile?.avatar_url || '🎬|bg-red-600',
            banner_url: bannerUrl,
            is_private: isPrivate,
          })
          .eq('user_id', currentUser.id);
        
        // Rafraîchir le profil dans le contexte
        await refreshProfile();
      }

      // Sauvegarder les notifications
      if (activeTab === 'notifications') {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: currentUser.id,
            email_notifications: emailNotifs,
            push_notifications: pushNotifs,
          });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    router.push('/landing');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Compte', icon: Lock },
  ];

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  // Garantir que user et profile ne sont pas null pour TypeScript
  const currentUser = user;
  const currentProfile = profile;

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="mb-8">
          {/* Bouton Retour */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
          >
            <div className="p-2 rounded-lg bg-white/5 transition-colors" style={{ ['--hover-bg' as any]: 'rgba(var(--color-primary), 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-medium">Retour</span>
          </button>

          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent mb-2" style={{ backgroundImage: 'linear-gradient(to right, white, var(--color-primary), var(--color-accent))' }}>
            Paramètres
          </h1>
          <p className="text-gray-400 text-sm">Gérez vos préférences et informations de profil</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar - Sticky */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="space-y-2 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl p-2 border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg'
                      : 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                  style={activeTab === tab.id ? {
                    background: 'var(--gradient-button)',
                    boxShadow: '0 10px 15px -3px rgba(var(--color-primary-rgb, 168, 85, 247), 0.3)'
                  } : {}}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 shadow-xl">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <User className="text-[var(--color-primary)]" size={28} />
                  Informations du profil
                </h2>

                {/* Preview Avatar */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="border-2 rounded-full" style={{ borderColor: 'var(--color-primary)', opacity: 0.3 }}>
                    <Avatar
                      avatarUrl={avatarUrl}
                      size="xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{username || 'Votre nom'}</h3>
                    <p className="text-sm text-gray-400">{bio || 'Aucune bio'}</p>
                  </div>
                </div>

                {/* Avatar Upload - Compact */}
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="block text-sm font-semibold mb-3">Photo de profil</label>
                  <div className="max-w-xs">
                    <ImageUpload
                      currentImage={avatarUrl}
                      onImageChange={setAvatarUrl}
                      userId={currentUser.id}
                      type="avatar"
                      label=""
                      aspectRatio="aspect-square"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none transition focus:border-[var(--color-primary)]"
                    placeholder="JohnDoe"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {username.length}/20 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none transition resize-none focus:border-[var(--color-primary)]"
                    placeholder="Parlez-nous de vous..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/200 caractères
                  </p>
                </div>

                {/* Bannière Upload - Compact */}
                <div className="bg-white/5 rounded-lg p-4">
                  <label className="block text-sm font-semibold mb-3">Bannière de profil</label>
                  <div className="max-w-md">
                    <ImageUpload
                      currentImage={bannerUrl}
                      onImageChange={setBannerUrl}
                      userId={currentUser.id}
                      type="banner"
                      label=""
                      aspectRatio="aspect-[3/1]"
                    />
                  </div>
                </div>

                {/* Toggle Profil Privé */}
                <div className="p-6 rounded-xl" style={{ background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 168, 85, 247), 0.2), rgba(var(--color-accent-rgb, 236, 72, 153), 0.2))', border: '1px solid rgba(var(--color-primary-rgb, 168, 85, 247), 0.3)' }}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Lock size={20} className="text-[var(--color-primary)]" />
                        Profil privé
                      </div>
                      <div className="text-sm text-gray-400">
                        Si activé, votre profil ne sera visible que par vous. Les visiteurs non connectés ne pourront pas voir vos likes, favoris et critiques.
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-12 h-6 appearance-none bg-gray-700 rounded-full relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-6"
                        style={{ ['&:checked' as any]: { backgroundColor: 'var(--color-primary)' } }}
                        onChangeCapture={(e: any) => e.target.checked && (e.target.style.backgroundColor = 'var(--color-primary)')}
                      />
                    </div>
                  </label>
                  {isPrivate ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🔒</div>
                        <div className="flex-1">
                          <div className="font-bold text-red-300 mb-2">Profil Privé Activé</div>
                          <div className="text-sm text-red-200/80 space-y-1">
                            <p>✓ Votre profil n'est visible que par vous</p>
                            <p>✓ Vos likes, favoris et critiques sont cachés</p>
                            <p>✓ Votre activité n'apparaît pas publiquement</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🌍</div>
                        <div className="flex-1">
                          <div className="font-bold text-green-300 mb-2">Profil Public</div>
                          <div className="text-sm text-green-200/80 space-y-1">
                            <p>✓ Votre profil est visible par tous</p>
                            <p>✓ Vos activités apparaissent publiquement</p>
                            <p>✓ Les autres peuvent voir vos goûts cinématographiques</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg transition disabled:opacity-50 text-white"
                  style={{ background: 'var(--gradient-button)' }}
                >
                  <Save size={20} />
                  {loading ? 'Enregistrement...' : saved ? 'Enregistré' : 'Enregistrer'}
                </button>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Preview du thème actuel */}
                <ThemePreview />
                
                <ThemeSelector />
                
                {/* Informations supplémentaires */}
                <div className="mt-8 p-6 rounded-xl" style={{ background: 'linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 168, 85, 247), 0.1), rgba(var(--color-accent-rgb, 236, 72, 153), 0.1))', border: '1px solid rgba(var(--color-primary-rgb, 168, 85, 247), 0.2)' }}>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span>✨</span>
                    Personnalisation avancée
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Votre thème est automatiquement sauvegardé et synchronisé sur tous vos appareils
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                      <div>
                        <p className="font-semibold text-white">Synchronisation automatique</p>
                        <p className="text-gray-400">Vos préférences sont sauvegardées instantanément</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      <div>
                        <p className="font-semibold text-white">Preview en temps réel</p>
                        <p className="text-gray-400">Voyez les changements immédiatement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
                      <div>
                        <p className="font-semibold text-white">12 thèmes uniques</p>
                        <p className="text-gray-400">Chaque thème avec sa propre ambiance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                      <div>
                        <p className="font-semibold text-white">Optimisé pour la lecture</p>
                        <p className="text-gray-400">Contrastes et couleurs étudiés</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="text-[var(--color-primary)]" size={28} />
                  Notifications
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-black/50 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-semibold">Notifications par email</div>
                      <div className="text-sm text-gray-400">Recevoir des emails pour les nouveautés</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={(e) => setEmailNotifs(e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-black/50 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-semibold">Notifications push</div>
                      <div className="text-sm text-gray-400">Notifications sur votre appareil</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushNotifs}
                      onChange={(e) => setPushNotifs(e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg transition disabled:opacity-50 text-white"
                  style={{ background: 'var(--gradient-button)' }}
                >
                  <Save size={20} />
                  {loading ? 'Enregistrement...' : saved ? 'Enregistré' : 'Enregistrer'}
                </button>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="text-[var(--color-primary)]" size={28} />
                  Compte
                </h2>

                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <h3 className="font-bold mb-2">Zone dangereuse</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Les actions ci-dessous sont irréversibles
                  </p>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
                  >
                    <LogOut size={20} />
                    Se déconnecter
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
