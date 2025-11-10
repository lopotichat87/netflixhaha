-- Créer la table friendships pour le système de follow

-- 1. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut suivre qu'une seule fois un autre utilisateur
  UNIQUE(user_id, friend_id),
  
  -- Un utilisateur ne peut pas se suivre lui-même
  CHECK (user_id != friend_id)
);

-- 2. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- 3. Row Level Security (RLS)
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 4. Policy : Tout le monde peut voir toutes les relations (pour compter followers/following)
CREATE POLICY "Public read access to friendships"
  ON friendships
  FOR SELECT
  USING (true);

-- 5. Policy : Les utilisateurs peuvent créer leurs propres follows
CREATE POLICY "Users can insert own friendships"
  ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Policy : Les utilisateurs peuvent supprimer leurs propres follows
CREATE POLICY "Users can delete own friendships"
  ON friendships
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Policy : Les utilisateurs peuvent modifier leurs propres follows
CREATE POLICY "Users can update own friendships"
  ON friendships
  FOR UPDATE
  USING (auth.uid() = user_id);
