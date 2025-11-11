'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listsHelpers, UserList } from '@/lib/lists';
import { Plus, Check, List as ListIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToListButtonProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
}

export default function AddToListButton({ mediaId, mediaType, title, posterPath }: AddToListButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [lists, setLists] = useState<UserList[]>([]);
  const [itemsInLists, setItemsInLists] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && showModal) {
      loadLists();
    }
  }, [user, showModal]);

  const loadLists = async () => {
    if (!user) {
      console.log('❌ No user, cannot load lists');
      return;
    }

    console.log('🔄 Loading lists for user:', user.id);
    try {
      setError(null);
      const userLists = await listsHelpers.getUserLists(user.id);
      console.log('📋 Lists loaded:', userLists.length, 'lists');
      setLists(userLists);

      // Vérifier dans quelles listes le média est déjà présent
      const inLists = new Set<string>();
      for (const list of userLists) {
        const items = await listsHelpers.getListItems(list.id);
        if (items.some(item => item.media_id === mediaId)) {
          inLists.add(list.id);
          console.log(`✅ Media ${mediaId} found in list "${list.name}"`);
        }
      }
      setItemsInLists(inLists);
    } catch (error: any) {
      console.error('❌ Error loading lists:', error);
      setError('Erreur lors du chargement des listes');
    }
  };

  const handleToggleList = async (listId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (itemsInLists.has(listId)) {
        // Retirer de la liste
        await listsHelpers.removeFromList(listId, mediaId);
        setItemsInLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });
        setSuccess('Retiré de la liste !');
      } else {
        // Ajouter à la liste
        await listsHelpers.addToList(listId, mediaId, mediaType, title, posterPath);
        setItemsInLists(prev => new Set(prev).add(listId));
        setSuccess('Ajouté à la liste !');
      }
      // Clear success message after 2s
      setTimeout(() => setSuccess(null), 2000);
    } catch (error: any) {
      console.error('Error toggling list:', error);
      if (error.message?.includes('media_title')) {
        setError('❌ Erreur: Les colonnes de la base de données sont manquantes. Exécutez la migration SQL dans Supabase.');
      } else {
        setError(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const newList = await listsHelpers.createList(user.id, newListName.trim());
      await listsHelpers.addToList(newList.id, mediaId, mediaType, title, posterPath);
      setNewListName('');
      setShowCreateForm(false);
      setSuccess(`Liste "${newList.name}" créée et film ajouté !`);
      setTimeout(() => setSuccess(null), 3000);
      await loadLists();
    } catch (error: any) {
      console.error('Error creating list:', error);
      if (error.message?.includes('media_title')) {
        setError('❌ Erreur: Les colonnes de la base de données sont manquantes. Exécutez la migration SQL dans Supabase.');
      } else {
        setError(`Erreur: ${error.message || 'Impossible de créer la liste'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
      >
        <ListIcon size={20} />
        <span>Ajouter à une liste</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-gray-800/50">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} className="text-gray-400" />
                </button>
                <h2 className="text-xl font-bold mb-1">Ajouter à une liste</h2>
                <p className="text-sm text-gray-400 truncate pr-8">{title}</p>
              </div>

              {/* Messages d'erreur et succès */}
              {(error || success) && (
                <div className="px-4 pt-2">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400"
                      >
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-400 flex items-center gap-2"
                      >
                        <Check size={16} />
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Lists */}
              <div className="flex-1 overflow-y-auto p-4">
                {lists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <ListIcon size={28} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Vous n'avez pas encore de liste
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Créez-en une pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {lists.map((list) => (
                      <motion.button
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-lg transition-all disabled:opacity-50 ${
                          itemsInLists.has(list.id)
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          itemsInLists.has(list.id) 
                            ? 'bg-purple-600 border-purple-600 scale-110' 
                            : 'border-gray-600'
                        }`}>
                          {itemsInLists.has(list.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <Check size={14} className="text-white" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm truncate">{list.name}</p>
                          {list.description && (
                            <p className="text-xs text-gray-500 truncate">{list.description}</p>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Create new list */}
                {!showCreateForm ? (
                  <motion.button
                    onClick={() => setShowCreateForm(true)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-3 flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-gray-700 hover:border-purple-600/50 hover:bg-purple-600/5 rounded-lg transition-all group"
                  >
                    <Plus size={18} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-purple-400 transition-colors">Créer une nouvelle liste</span>
                  </motion.button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreateList}
                    className="mt-3 space-y-2.5 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Nom de la liste..."
                      className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      autoFocus
                      maxLength={50}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewListName('');
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={!newListName.trim() || loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Création...' : 'Créer'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3.5 border-t border-gray-800/50 bg-[#1a1a1a]">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
