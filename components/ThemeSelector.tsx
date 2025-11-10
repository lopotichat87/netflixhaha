'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Palette, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sauvegarder dans Supabase quand le thème change
  useEffect(() => {
    const saveTheme = async () => {
      if (!user) return;
      
      setSaving(true);
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme: currentTheme,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Error saving theme:', error);
      } finally {
        setSaving(false);
      }
    };

    const timeoutId = setTimeout(saveTheme, 500);
    return () => clearTimeout(timeoutId);
  }, [currentTheme, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="text-purple-400" size={24} />
            <h3 className="text-2xl font-bold">Thème d'affichage</h3>
          </div>
          <p className="text-sm text-gray-400">
            Personnalisez l'apparence de ReelVibe selon vos préférences
          </p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-green-400 text-sm font-semibold"
          >
            <Check size={16} />
            <span>Sauvegardé</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(availableThemes).map((theme) => (
          <motion.button
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden group ${
              currentTheme === theme.name
                ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                : 'border-white/10 hover:border-white/30 bg-black/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Gradient Preview */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: theme.gradients.hero }}
            />

            <div className="relative z-10">
              {/* Preview Colors */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg shadow-lg"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg shadow-lg"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-10 h-10 rounded-lg shadow-lg"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                
                {currentTheme === theme.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                )}
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-lg">{theme.displayName}</h4>
                  {currentTheme === theme.name && (
                    <Sparkles size={16} className="text-purple-400" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {getThemeDescription(theme.name)}
                </p>
              </div>

              {/* Gradient Preview Bar */}
              <div
                className="h-3 rounded-full shadow-inner"
                style={{ background: theme.gradients.button }}
              />

              {/* Sample Button Preview */}
              <div className="mt-3">
                <div
                  className="text-xs font-semibold text-center py-2 rounded-lg"
                  style={{ background: theme.gradients.button, color: '#fff' }}
                >
                  Exemple de bouton
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getThemeDescription(themeName: string): string {
  const descriptions: Record<string, string> = {
    reelvibe: 'Signature ReelVibe - Violet, Rose & Cyan électrique',
    netflix: 'Netflix Classique - Rouge iconique & élégant',
    ocean: 'Profondeur Océanique - Bleu apaisant & mystérieux',
    sunset: 'Crépuscule Tropical - Ambre, Rouge & Rose',
    emerald: 'Forêt Émeraude - Vert nature & ressourçant',
    royal: 'Majesté Royale - Violet impérial & luxueux',
  };
  return descriptions[themeName] || '';
}
