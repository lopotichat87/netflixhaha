'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { listsHelpers, UserList, ListItem } from '@/lib/lists';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, Trash2, Edit2, Calendar, Film, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard from '@/components/MovieCard';

export const dynamic = 'force-dynamic';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const { user } = useAuth();
  
  const [list, setList] = useState<UserList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadListData();
  }, [listId, user]);

  const loadListData = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Charger les infos de la liste
      const { data: listData, error: listError } = await supabase
        .from('user_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;
      
      setList(listData);
      setEditName(listData.name);
      setEditDescription(listData.description || '');
      
      // Vérifier si l'utilisateur est le propriétaire
      if (user) {
        setIsOwner(user.id === listData.user_id);
      }

      // Charger les items de la liste
      const itemsData = await listsHelpers.getListItems(listId);
      
      // Enrichir chaque item avec les données TMDB
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const enrichedItems = await Promise.all(
        itemsData.map(async (item) => {
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
            console.error(`Error fetching TMDB data for ${item.media_id}:`, error);
            return item;
          }
        })
      );
      
      setItems(enrichedItems);

    } catch (error) {
      console.error('Error loading list:', error);
      router.push('/my-lists');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateList = async () => {
    if (!editName.trim() || !list) return;

    try {
      await listsHelpers.updateList(list.id, editName, editDescription);
      setList({ ...list, name: editName, description: editDescription });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating list:', error);
      alert('Erreur lors de la mise à jour de la liste');
    }
  };

  const handleDeleteList = async () => {
    if (!list) return;
    if (!confirm(`Supprimer la liste "${list.name}" ? Cette action est irréversible.`)) return;

    try {
      await listsHelpers.deleteList(list.id);
      router.push('/my-lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Erreur lors de la suppression de la liste');
    }
  };

  const handleRemoveItem = async (mediaId: number) => {
    if (!list) return;
    if (!confirm('Retirer cet élément de la liste ?')) return;

    try {
      await listsHelpers.removeFromList(list.id, mediaId);
      setItems(items.filter(item => item.media_id !== mediaId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Erreur lors de la suppression de l\'élément');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Liste introuvable</h1>
            <Link href="/my-lists">
              <button className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                Retour aux listes
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/my-lists"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux listes
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-gray-400 text-lg">{list.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Créée le {new Date(list.created_at).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <span>•</span>
                <span>{items.length} {items.length > 1 ? 'éléments' : 'élément'}</span>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Modifier
                </button>
                <button
                  onClick={handleDeleteList}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des éléments */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="relative"
              >
                {/* Bouton supprimer (seulement pour le propriétaire) */}
                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(item.media_id);
                    }}
                    className="absolute -top-2 -right-2 z-50 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                
                <MovieCard 
                  media={{
                    id: item.media_id,
                    title: item.media_title,
                    name: item.media_title,
                    poster_path: item.media_poster_path,
                    media_type: item.media_type,
                    vote_average: (item as any).vote_average || 0,
                    release_date: (item as any).release_date || '',
                    first_air_date: (item as any).release_date || '',
                    overview: '',
                    backdrop_path: '',
                    vote_count: 0,
                    popularity: 0,
                    genre_ids: [],
                    original_language: '',
                    adult: false
                  }}
                  size="large"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border-2 border-dashed border-gray-700">
            <Film size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-semibold text-gray-400 mb-2">Liste vide</p>
            <p className="text-sm text-gray-600">
              {isOwner 
                ? 'Commencez à ajouter des films et séries à votre liste' 
                : 'Cette liste ne contient aucun élément pour le moment'}
            </p>
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-800"
          >
            <h2 className="text-2xl font-bold mb-4">Modifier la liste</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de la liste</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Films à voir"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optionnelle)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Décrivez votre liste..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateList}
                disabled={!editName.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-semibold"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
