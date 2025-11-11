-- Créer la table follows pour gérer les abonnements entre utilisateurs
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(follower_id, following_id),
  
  -- Un utilisateur ne peut pas se suivre lui-même
  CHECK (follower_id != following_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at);

-- RLS (Row Level Security)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policy : Tout le monde peut voir qui suit qui
CREATE POLICY "Les follows sont publics"
  ON follows FOR SELECT
  USING (true);

-- Policy : Un utilisateur peut créer un follow seulement s'il est le follower
CREATE POLICY "Un utilisateur peut suivre d'autres utilisateurs"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Policy : Un utilisateur peut supprimer seulement ses propres follows
CREATE POLICY "Un utilisateur peut unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Commentaires
COMMENT ON TABLE follows IS 'Table pour gérer les relations de suivi entre utilisateurs';
COMMENT ON COLUMN follows.follower_id IS 'ID de l utilisateur qui suit';
COMMENT ON COLUMN follows.following_id IS 'ID de l utilisateur suivi';
