'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface PinPromptProps {
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  username: string;
  avatar: string;
  color: string;
}

export default function PinPrompt({ onSubmit, onCancel, username, avatar, color }: PinPromptProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (index === 3 && value) {
      const fullPin = newPin.join('');
      handleSubmit(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (fullPin: string) => {
    if (fullPin.length === 4) {
      onSubmit(fullPin);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4"
      >
        {/* Avatar */}
        <div className="text-center mb-6">
          <div className={`w-24 h-24 ${color} rounded-full flex items-center justify-center text-5xl mx-auto mb-4`}>
            {avatar}
          </div>
          <h2 className="text-2xl font-bold mb-2">{username}</h2>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Lock size={16} />
            Ce profil est protégé par un code PIN
          </p>
        </div>

        {/* PIN Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-3 mb-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-14 text-center text-2xl font-bold bg-gray-800 border-2 rounded-lg focus:outline-none focus:border-white transition ${
                  error ? 'border-red-600 animate-shake' : 'border-gray-700'
                }`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              Code PIN incorrect
            </motion.p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded font-semibold transition"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              const fullPin = pin.join('');
              if (fullPin.length === 4) {
                handleSubmit(fullPin);
              }
            }}
            disabled={pin.join('').length !== 4}
            className="flex-1 px-4 py-3 bg-white text-black rounded font-semibold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          >
            Valider
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
