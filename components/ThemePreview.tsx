'use client';

import { Film, Heart, Star, Play } from 'lucide-react';

export default function ThemePreview() {
  return (
    <div className="space-y-4 p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
      <h3 className="text-xl font-bold mb-4">Aperçu du thème</h3>
      
      {/* Preview couleurs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-2">
          <div 
            className="h-16 rounded-lg shadow-lg" 
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <p className="text-xs text-center text-gray-400">Primaire</p>
        </div>
        <div className="space-y-2">
          <div 
            className="h-16 rounded-lg shadow-lg" 
            style={{ backgroundColor: 'var(--color-secondary)' }}
          />
          <p className="text-xs text-center text-gray-400">Secondaire</p>
        </div>
        <div className="space-y-2">
          <div 
            className="h-16 rounded-lg shadow-lg" 
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <p className="text-xs text-center text-gray-400">Accent</p>
        </div>
        <div className="space-y-2">
          <div 
            className="h-16 rounded-lg shadow-lg" 
            style={{ backgroundColor: 'var(--color-card-hover)' }}
          />
          <p className="text-xs text-center text-gray-400">Card</p>
        </div>
      </div>

      {/* Preview boutons */}
      <div className="space-y-3">
        <button 
          className="w-full py-2 px-4 rounded-lg font-semibold text-white shadow-lg hover:opacity-90 transition"
          style={{ background: 'var(--gradient-button)' }}
        >
          Bouton Gradient
        </button>
        
        <button 
          className="w-full py-2 px-4 rounded-lg font-semibold text-white shadow-md hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Bouton Primaire
        </button>
        
        <button className="w-full py-2 px-4 rounded-lg font-semibold btn-outline-theme">
          Bouton Outline
        </button>
      </div>

      {/* Preview icônes */}
      <div className="flex justify-around items-center pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            <Play size={20} className="text-white fill-white" />
          </div>
          <span className="text-xs text-gray-400">Lecture</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
            <Heart size={20} className="text-white" />
          </div>
          <span className="text-xs text-gray-400">Favoris</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
            <Star size={20} className="text-white fill-white" />
          </div>
          <span className="text-xs text-gray-400">Note</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-card-hover)]">
            <Film size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <span className="text-xs text-gray-400">Films</span>
        </div>
      </div>

      {/* Preview gradient hero */}
      <div 
        className="h-24 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <span className="text-white font-bold text-lg">Gradient Hero</span>
      </div>
    </div>
  );
}
