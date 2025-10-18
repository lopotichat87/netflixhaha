'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listsHelpers, UserList } from '@/lib/lists';
import { Plus, Check, List as ListIcon } from 'lucide-react';
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

  useEffect(() => {
    if (user && showModal) {
      loadLists();
    }
  }, [user, showModal]);

  const loadLists = async () => {
    if (!user) return;

    try {
      const userLists = await listsHelpers.getUserLists(user.id);
      setLists(userLists);

      // Vérifier dans quelles listes le média est déjà présent
      const inLists = new Set<string>();
      for (const list of userLists) {
        const items = await listsHelpers.getListItems(list.id);
        if (items.some(item => item.media_id === mediaId)) {
          inLists.add(list.id);
        }
      }
      setItemsInLists(inLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleToggleList = async (listId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      if (itemsInLists.has(listId)) {
        // Retirer de la liste
        await listsHelpers.removeFromList(listId, mediaId);
        setItemsInLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listId);
          return newSet;
        });
      } else {
        // Ajouter à la liste
        await listsHelpers.addToList(listId, mediaId, mediaType, title, posterPath);
        setItemsInLists(prev => new Set(prev).add(listId));
      }
    } catch (error) {
      console.error('Error toggling list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newListName.trim()) return;

    setLoading(true);
    try {
      const newList = await listsHelpers.createList(user.id, newListName.trim());
      await listsHelpers.addToList(newList.id, mediaId, mediaType, title, posterPath);
      setNewListName('');
      setShowCreateForm(false);
      await loadLists();
    } catch (error) {
      console.error('Error creating list:', error);
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold">Ajouter à une liste</h2>
                <p className="text-sm text-gray-400 mt-1">{title}</p>
              </div>

              {/* Lists */}
              <div className="flex-1 overflow-y-auto p-6">
                {lists.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Vous n'avez pas encore de liste
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded transition disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            itemsInLists.has(list.id) ? 'bg-red-600 border-red-600' : 'border-gray-600'
                          }`}>
                            {itemsInLists.has(list.id) && <Check size={14} />}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">{list.name}</p>
                            {list.description && (
                              <p className="text-xs text-gray-400">{list.description}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Create new list */}
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded transition"
                  >
                    <Plus size={20} />
                    <span>Créer une nouvelle liste</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateList} className="mt-4 space-y-3">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Nom de la liste"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-white"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewListName('');
                        }}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={!newListName.trim() || loading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                      >
                        Créer
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition"
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
