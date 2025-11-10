'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  userId: string;
  type: 'avatar' | 'banner';
  label: string;
  aspectRatio?: string;
}

export default function ImageUpload({
  currentImage,
  onImageChange,
  userId,
  type,
  label,
  aspectRatio = 'aspect-video'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const { supabase } = await import('@/lib/supabase');

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

      // Supprimer l'ancienne image si elle existe
      if (preview && preview.includes('supabase')) {
        const oldPath = preview.split('/profiles/')[1];
        if (oldPath) {
          await supabase.storage
            .from('profiles')
            .remove([oldPath]);
        }
      }

      // Upload la nouvelle image
      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(data.path);

      console.log('📤 Image uploadée avec succès!');
      console.log('🔗 URL publique:', publicUrl);
      
      setPreview(publicUrl);
      onImageChange(publicUrl);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      // Supprimer l'image du storage si c'est une image Supabase
      if (preview.includes('supabase')) {
        const path = preview.split('/profiles/')[1];
        if (path) {
          await supabase.storage
            .from('profiles')
            .remove([path]);
        }
      }

      setPreview('');
      onImageChange('');
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold flex items-center gap-2">
        <ImageIcon size={16} className="text-purple-400" />
        {label}
      </label>

      <div className="relative group">
        {/* Preview ou Zone de drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`${aspectRatio} relative bg-black/50 border-2 border-dashed border-white/20 rounded-xl overflow-hidden cursor-pointer hover:border-purple-500 transition group ${
            uploading ? 'pointer-events-none' : ''
          }`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <div className="text-center">
                  <Upload className="mx-auto mb-2" size={32} />
                  <p className="text-sm font-semibold">Changer l'image</p>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              {uploading ? (
                <>
                  <Loader className="animate-spin mb-2" size={32} />
                  <p className="text-sm">Upload en cours...</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2" size={32} />
                  <p className="text-sm font-semibold">Cliquez pour uploader</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF (max 5MB)</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bouton Supprimer */}
        <AnimatePresence>
          {preview && !uploading && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition shadow-lg z-10"
              type="button"
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Input File caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Ou URL manuelle */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Ou collez une URL d'image :</p>
        <input
          type="url"
          value={preview}
          onChange={(e) => {
            setPreview(e.target.value);
            onImageChange(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 text-sm bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition"
        />
      </div>
    </div>
  );
}
