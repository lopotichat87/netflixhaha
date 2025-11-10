'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
    setTimeout(() => {
      setFormData({ email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/landing" className="inline-block mb-8">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              ReelVibe
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-3">Contact</h1>
          <p className="text-gray-400">Une question ? On vous écoute.</p>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Message envoyé</h3>
            <p className="text-gray-400 mb-6">Nous vous répondrons rapidement.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition placeholder:text-gray-500"
                placeholder="Votre email"
              />
            </div>

            <div>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition resize-none placeholder:text-gray-500"
                placeholder="Votre message..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black/20 border-t-black"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Envoyer
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="mt-12 text-center space-y-4">
          <div className="text-sm text-gray-400">
            <a href="mailto:contact@reelvibe.com" className="hover:text-white transition">
              contact@reelvibe.com
            </a>
          </div>
          
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white transition">
              À propos
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Conditions
            </Link>
          </div>

          <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
