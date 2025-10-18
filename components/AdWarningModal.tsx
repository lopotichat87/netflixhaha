'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

interface AdWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function AdWarningModal({ isOpen, onClose, onContinue }: AdWarningModalProps) {
  const [adOpened, setAdOpened] = useState(false);

  const handleOpenAd = () => {
    // Ouvrir une fenêtre publicitaire (exemple)
    window.open('https://www.google.com/search?q=publicite', '_blank');
    setAdOpened(true);
  };

  const handleContinue = () => {
    if (adOpened) {
      onContinue();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl z-50 p-8 border border-yellow-600/30"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <AlertTriangle size={40} className="text-yellow-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-4">
              🚦 Juste une petite étape avant de lancer la vidéo...
            </h2>

            {/* Message */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Pour continuer, clique simplement sur le bouton ci-dessous. Une fenêtre publicitaire va s'ouvrir : 
                <strong className="text-white"> tu peux la fermer dès qu'elle apparaît</strong>. 
                Ce petit geste nous aide à garder Movix gratuit et sans coupure pour tout le monde ! Merci 🙏
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={24} />
                ⚠️ Ce qu'il NE FAUT SURTOUT PAS FAIRE
              </h3>
              <ul className="space-y-2 text-red-200">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>NE CLIQUE PAS n'importe où sur la page de pub</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>NE SCANNE AUCUN QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">❌</span>
                  <span>NE TÉLÉCHARGE RIEN</span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              {!adOpened ? (
                <button
                  onClick={handleOpenAd}
                  className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2"
                >
                  <ExternalLink size={24} />
                  Voir une publicité
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold text-lg transition animate-pulse"
                >
                  ✅ Continuer vers la vidéo
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
              >
                Annuler
              </button>
            </div>

            {/* Info */}
            <p className="text-center text-sm text-gray-500 mt-4">
              💡 Cette étape permet de maintenir le service gratuit
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
