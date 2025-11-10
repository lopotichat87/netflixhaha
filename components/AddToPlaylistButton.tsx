'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, List, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AddToPlaylistButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  className?: string;
}

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  items_count?: number;
}

export default function AddToPlaylistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  className = '',
}: AddToPlaylistButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemInPlaylists, setItemInPlaylists] = useState<number[]>([]);

  useEffect(() => {
    if (showModal && user) {
      loadPlaylists();
      checkItemInPlaylists();
    }
  }, [showModal, user]);

  const loadPlaylists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*, list_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const checkItemInPlaylists = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('list_items')
        .select('list_id')
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);

      if (error) throw error;
      setItemInPlaylists(data?.map(item => item.list_id) || []);
    } catch (error) {
      console.error('Error checking playlists:', error);
    }
  };

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name: newPlaylistName.trim(),
          is_public: true,
          is_ranked: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Ajouter le média à la nouvelle playlist
      await addToPlaylist(data.id);
      setNewPlaylistName('');
      await loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Erreur lors de la création de la playlist');
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('list_items')
        .insert({
          list_id: playlistId,
          media_id: mediaId,
          media_type: mediaType,
          media_title: title,
          media_poster: posterPath,
        });

      if (error) throw error;
      setItemInPlaylists([...itemInPlaylists, playlistId]);
    } catch (error: any) {
      if (error.code === '23505') {
        // Déjà dans la playlist
        return;
      }
      console.error('Error adding to playlist:', error);
    }
  };

  const removeFromPlaylist = async (playlistId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', playlistId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);

      if (error) throw error;
      setItemInPlaylists(itemInPlaylists.filter(id => id !== playlistId));
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  };

  const togglePlaylist = async (playlistId: number) => {
    if (itemInPlaylists.includes(playlistId)) {
      await removeFromPlaylist(playlistId);
    } else {
      await addToPlaylist(playlistId);
    }
  };

  const handleClick = () => {
    if (!user) {
      alert('Connectez-vous pour créer des playlists');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white border border-white/20 ${className}`}
      >
        <List size={20} />
        <span>Playlist</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Ajouter à une playlist</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Créer nouvelle playlist */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Nouvelle playlist
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Nom de la playlist..."
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
                  />
                  <button
                    onClick={createPlaylist}
                    disabled={!newPlaylistName.trim() || loading}
                    className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Liste des playlists */}
              <div>
                <label className="block text-sm font-semibold mb-3">
                  Mes playlists
                </label>
                {playlists.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Aucune playlist. Créez-en une !
                  </p>
                ) : (
                  <div className="space-y-2">
                    {playlists.map((playlist) => {
                      const isInPlaylist = itemInPlaylists.includes(playlist.id);
                      return (
                        <button
                          key={playlist.id}
                          onClick={() => togglePlaylist(playlist.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                            isInPlaylist
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-800 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <List size={18} />
                            <div className="text-left">
                              <p className="font-semibold">{playlist.name}</p>
                              {playlist.description && (
                                <p className="text-xs text-gray-400 line-clamp-1">
                                  {playlist.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isInPlaylist ? (
                            <Check size={20} />
                          ) : (
                            <Plus size={20} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
