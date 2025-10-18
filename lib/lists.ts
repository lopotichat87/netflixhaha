import { supabase } from './supabase';

// ============================================
// LISTES PERSONNALISÉES
// ============================================

export interface UserList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  added_at: string;
}

async function getUserLists(userId: string): Promise<UserList[]> {
  const { data, error } = await supabase
    .from('user_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function createList(userId: string, name: string, description?: string): Promise<UserList> {
  const { data, error } = await supabase
    .from('user_lists')
    .insert({
      user_id: userId,
      name,
      description: description || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateList(listId: string, name: string, description?: string): Promise<void> {
  const { error } = await supabase
    .from('user_lists')
    .update({
      name,
      description: description || null,
    })
    .eq('id', listId);

  if (error) throw error;
}

async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase
    .from('user_lists')
    .delete()
    .eq('id', listId);

  if (error) throw error;
}

async function getListItems(listId: string): Promise<ListItem[]> {
  const { data, error } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('added_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addToList(
  listId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv',
  title: string,
  posterPath: string
): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      media_id: mediaId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
    });

  if (error) throw error;
}

async function removeFromList(listId: string, mediaId: number): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('media_id', mediaId);

  if (error) throw error;
}

export const listsHelpers = {
  getUserLists,
  createList,
  updateList,
  deleteList,
  getListItems,
  addToList,
  removeFromList,
};
