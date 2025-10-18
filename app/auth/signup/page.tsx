'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelpers } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';

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
  
  // Step 2: Profile
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [profilePin, setProfilePin] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [isKids, setIsKids] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Mettre à jour le profil avec avatar et PIN
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('profiles')
          .update({
            avatar_url: `${selectedAvatar.emoji}|${selectedAvatar.color}`,
            profile_pin: usePin ? profilePin : null,
            is_kids: isKids,
          })
          .eq('user_id', result.user.id);
        
        // Rediriger vers la page de connexion avec un message de confirmation
        router.push('/auth/login?message=confirm-email');
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
        className="relative z-10 w-full max-w-md bg-black/75 p-12 rounded-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Inscription</h1>
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
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
            </div>

            <button
              onClick={handleNextStep}
              disabled={!email || password.length < 6}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 py-3 rounded font-semibold transition"
            >
              Suivant
            </button>
          </div>
        ) : (
          // Step 2: Profile Setup
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Nom du profil</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 focus:outline-none focus:border-white transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Choisir un avatar</label>
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded font-semibold transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading || !username}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 py-3 rounded font-semibold transition"
              >
                {loading ? 'Inscription...' : 'Créer mon compte'}
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
