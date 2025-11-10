-- Table pour stocker les acteurs favoris des utilisateurs
CREATE TABLE IF NOT EXISTS favorite_actors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL,
  actor_name TEXT NOT NULL,
  actor_profile_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, actor_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorite_actors_user_id ON favorite_actors(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_actors_actor_id ON favorite_actors(actor_id);

-- Enable RLS (Row Level Security)
ALTER TABLE favorite_actors ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir tous les acteurs favoris
CREATE POLICY "Users can view all favorite actors"
  ON favorite_actors FOR SELECT
  USING (true);

-- Politique: Les utilisateurs peuvent ajouter leurs propres acteurs favoris
CREATE POLICY "Users can insert their own favorite actors"
  ON favorite_actors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres acteurs favoris
CREATE POLICY "Users can delete their own favorite actors"
  ON favorite_actors FOR DELETE
  USING (auth.uid() = user_id);
