'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check, Upload, X } from 'lucide-react';

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

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Step 2: Profile
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [useUploadedImage, setUseUploadedImage] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculer la force du mot de passe
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 10) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Faible', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Moyen', color: 'text-yellow-500' };
    if (strength <= 4) return { text: 'Fort', color: 'text-green-500' };
    return { text: 'Très fort', color: 'text-emerald-500' };
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const handleNextStep = () => {
    if (step === 1 && email && password.length >= 6) {
      setStep(2);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authHelpers.signUp(email, password, username);
      
      if (result.user) {
        // Mettre à jour le profil avec avatar (par défaut : premier emoji)
        const { supabase } = await import('@/lib/supabase');
        
        // Attendre que le profil soit créé (max 5 secondes)
        let profileExists = false;
        let createdProfile = null;
        for (let i = 0; i < 10; i++) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, username')
            .eq('user_id', result.user.id)
            .single();
          
          if (profile) {
            profileExists = true;
            createdProfile = profile;
            console.log('✅ Profil créé avec username:', profile.username);
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!profileExists) {
          throw new Error('Le profil n\'a pas pu être créé. Veuillez contacter le support.');
        }
        
        // Par défaut, utiliser l'emoji sélectionné (ou le premier si aucun)
        let avatarUrl = `${selectedAvatar.emoji}|${selectedAvatar.color}`;
        
        // Si une image est uploadée, l'uploader vers Supabase Storage
        if (useUploadedImage && uploadedImage) {
          try {
            // Convertir data URL en blob
            const response = await fetch(uploadedImage);
            const blob = await response.blob();
            const fileName = `avatar_${result.user.id}_${Date.now()}.jpg`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('profiles')
              .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: true
              });
            
            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);
              avatarUrl = publicUrl;
            }
          } catch (err) {
            console.error('Error uploading image:', err);
          }
        }
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: avatarUrl,
          })
          .eq('user_id', result.user.id);
        
        if (updateError) {
          console.error('Error updating avatar:', updateError);
        }
        
        // Attendre un peu pour que l'auth context se mette à jour
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Rediriger vers home (le profil sera chargé automatiquement)
        console.log('🎉 Inscription réussie! Redirection vers home');
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/f272782d-cf96-4988-a675-6db2afd165e0/web/FR-fr-20241008-TRIFECTA-perspective_b28b640f-cee0-426b-ac3a-7c000d3b41b7_large.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
      </div>

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-black/90 backdrop-blur-sm p-12 rounded-2xl border border-purple-500/20"
      >
        <Link href="/landing" className="inline-block mb-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
            ReelVibe
          </div>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Rejoignez ReelVibe</h1>
        <p className="text-gray-400 mb-8">Étape {step} sur 2</p>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          // Step 1: Email & Password
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded px-10 py-3 focus:outline-none focus:border-white transition"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(calculatePasswordStrength(e.target.value));
                  }}
                  required
                  minLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-10 py-3 focus:outline-none focus:border-white transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Jauge de force du mot de passe */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  {/* Barre de progression */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength
                            ? getPasswordStrengthColor(passwordStrength)
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Label et critères */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${getPasswordStrengthLabel(passwordStrength).color}`}>
                      {getPasswordStrengthLabel(passwordStrength).text}
                    </span>
                    <div className="flex gap-1">
                      {password.length >= 6 && (
                        <span className="text-xs text-green-500">✓ 6+ caractères</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Conseils */}
                  {passwordStrength < 4 && (
                    <div className="text-xs text-gray-400 space-y-1">
                      <p className="font-semibold">Conseils pour un mot de passe plus fort :</p>
                      <ul className="space-y-0.5 pl-3">
                        {password.length < 10 && <li>• Utilisez au moins 10 caractères</li>}
                        {!/[A-Z]/.test(password) && <li>• Ajoutez des majuscules</li>}
                        {!/\d/.test(password) && <li>• Ajoutez des chiffres</li>}
                        {!/[^a-zA-Z0-9]/.test(password) && <li>• Ajoutez des caractères spéciaux (!@#$...)</li>}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <button
              onClick={handleNextStep}
              disabled={!email || password.length < 6}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-500/30"
            >
              Suivant
            </button>
          </div>
        ) : (
          // Step 2: Profile Setup
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  // Remplacer les espaces par des underscores et retirer les caractères spéciaux
                  const cleaned = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');
                  setUsername(cleaned);
                }}
                required
                minLength={3}
                maxLength={20}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-white transition"
                placeholder="johndoe"
              />
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Lettres, chiffres et underscores uniquement (3-20 car.)
                  </p>
                  {username.length >= 3 && username.length <= 20 && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Check size={12} />
                      Valide
                    </span>
                  )}
                </div>
                {username.length > 0 && (
                  <p className="text-xs text-gray-500">
                    📝 Prévisualisation : <span className="text-purple-400 font-mono">{username}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Photo de profil</label>
                <span className="text-xs text-gray-500">Avatar par défaut : {selectedAvatar.emoji}</span>
              </div>
              
              {/* Option : Emoji ou Upload */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setUseUploadedImage(false)}
                  className={`flex-1 py-2 rounded-lg border-2 transition ${
                    !useUploadedImage
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setUseUploadedImage(true)}
                  className={`flex-1 py-2 rounded-lg border-2 transition ${
                    useUploadedImage
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Upload size={16} className="inline mr-1" />
                  Uploader
                </button>
              </div>
              
              {!useUploadedImage ? (
                <div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
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
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                    <Check size={14} />
                    <span>Cet avatar emoji sera votre photo de profil par défaut</span>
                  </div>
                </div>
              ) : (
                <div>
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage}
                        alt="Avatar"
                        className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-0 right-1/2 translate-x-16 bg-red-600 rounded-full p-1 hover:bg-red-700 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition">
                        <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-400">Cliquez pour choisir une image</p>
                        <p className="text-xs text-gray-600 mt-1">JPG, PNG ou GIF (max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setError('L\'image est trop grande (max 5MB)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUploadedImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>


            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading || !username}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Inscription...
                  </div>
                ) : 'Créer mon compte'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-gray-400">
          <span>Déjà inscrit ? </span>
          <Link href="/auth/login" className="text-white hover:underline">
            Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
