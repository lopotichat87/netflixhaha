'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-lg p-8 max-w-md w-full relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-2">
                Confirmer la déconnexion
              </h2>

              {/* Message */}
              <p className="text-gray-400 text-center mb-6">
                Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
                >
                  Se déconnecter
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
