'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { supabase } = await import('@/lib/supabase');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du lien');
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

      {/* Forgot Password Form */}
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

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Email envoyé !</h1>
            <p className="text-gray-300 mb-6">
              Nous avons envoyé un lien de réinitialisation à <span className="text-white font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Vérifiez votre boîte de réception et vos spams. Le lien expire dans 1 heure.
            </p>
            <Link href="/auth/login">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-500/30">
                Retour à la connexion
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-400 mb-8">
              Pas de souci ! Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-3 focus:outline-none focus:border-purple-500 transition"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 py-3 rounded-lg font-semibold transition shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Envoi en cours...
                  </div>
                ) : 'Envoyer le lien de réinitialisation'}
              </button>

              <Link href="/auth/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition">
                <ArrowLeft size={16} />
                <span>Retour à la connexion</span>
              </Link>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
