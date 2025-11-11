'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listsHelpers, UserList, ListItem } from '@/lib/lists';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Plus, Trash2, Edit2, Folder } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MyListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  useEffect(() => {
    loadLists();
  }, [user]);

  useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList.id);
    }
  }, [selectedList]);

  const loadLists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await listsHelpers.getUserLists(user.id);
      setLists(data);
      if (data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadListItems = async (listId: string) => {
    try {
      const items = await listsHelpers.getListItems(listId);
      
      // Enrichir avec les données TMDB
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/${item.media_type}/${item.media_id}?api_key=${API_KEY}&language=fr-FR`
            );
            const tmdbData = await response.json();
            return {
              ...item,
              vote_average: tmdbData.vote_average || 0,
              release_date: tmdbData.release_date || tmdbData.first_air_date || '',
            };
          } catch (error) {
            return item;
          }
        })
      );
      
      setListItems(enrichedItems);
    } catch (error) {
      console.error('Error loading list items:', error);
    }
  };

  const createList = async () => {
    if (!user || !newListName.trim()) return;

    try {
      const newList = await listsHelpers.createList(user.id, newListName, newListDescription);
      setLists([newList, ...lists]);
      setSelectedList(newList);
      setShowCreateModal(false);
      setNewListName('');
      setNewListDescription('');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Supprimer cette liste ?')) return;

    try {
      await listsHelpers.deleteList(listId);
      const updatedLists = lists.filter(l => l.id !== listId);
      setLists(updatedLists);
      if (selectedList?.id === listId) {
        setSelectedList(updatedLists[0] || null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 px-4 md:px-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Connectez-vous</h1>
          <p className="text-gray-400 mb-8">Vous devez être connecté pour voir vos listes</p>
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-24 px-4 md:px-16 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Folder size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Mes Listes</h1>
              <p className="text-gray-400">{lists.length} liste(s)</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
          >
            <Plus size={20} />
            Nouvelle liste
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar - Liste des listes */}
          <div className="md:col-span-1 space-y-2">
            {lists.map((list) => (
              <div
                key={list.id}
                className={`group w-full flex items-center justify-between p-4 rounded-lg transition cursor-pointer ${
                  selectedList?.id === list.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => setSelectedList(list)}
              >
                <div className="flex items-center gap-3">
                  <Folder size={20} />
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{list.name}</h3>
                    {list.description && (
                      <p className="text-xs opacity-70 line-clamp-1">{list.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                  aria-label="Supprimer la liste"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {lists.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Aucune liste</p>
                <p className="text-xs mt-2">Créez votre première liste !</p>
              </div>
            )}
          </div>

          {/* Content - Items de la liste */}
          <div className="md:col-span-3">
            {selectedList ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedList.name}</h2>
                  {selectedList.description && (
                    <p className="text-gray-400">{selectedList.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{listItems.length} élément(s)</p>
                </div>

                {listItems.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {listItems.map((item) => (
                      <MovieCard
                        key={item.id}
                        media={{
                          id: item.media_id,
                          media_type: item.media_type,
                          title: item.media_type === 'movie' ? item.media_title : undefined,
                          name: item.media_type === 'tv' ? item.media_title : undefined,
                          poster_path: item.media_poster_path,
                          backdrop_path: null,
                          vote_average: (item as any).vote_average || 0,
                          vote_count: 0,
                          popularity: 0,
                          genre_ids: [],
                          overview: '',
                          release_date: (item as any).release_date || '',
                          first_air_date: (item as any).release_date || '',
                          adult: false,
                          original_language: 'fr',
                        }}
                        size="large"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p>Cette liste est vide</p>
                    <p className="text-sm mt-2">Ajoutez des films ou séries depuis leurs pages</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p>Sélectionnez ou créez une liste</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nouvelle liste</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de la liste</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Ex: Films d'action"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Description de la liste..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-white resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createList}
                  disabled={!newListName.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition shadow-lg"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewListName('');
                    setNewListDescription('');
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
