-- ============================================
-- MIGRATION COMPLÈTE LETTERBOXD
-- Supprime les anciennes tables et crée le nouveau schéma
-- ============================================

-- Supprimer les anciennes tables
DROP TABLE IF EXISTS user_history CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_lists CASCADE;
DROP TABLE IF EXISTS list_items CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;

-- ============================================
-- TABLE: user_profiles
-- Profils publics des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: ratings
-- Notes et critiques des utilisateurs
-- ============================================
CREATE TABLE ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255) NOT NULL,
  media_poster TEXT,
  
  -- Note sur 5 étoiles (0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  
  -- Critique/Review
  review TEXT,
  
  -- Métadonnées
  watched_date DATE,
  is_rewatch BOOLEAN DEFAULT FALSE,
  is_liked BOOLEAN DEFAULT FALSE,
  is_watched BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut noter qu'une fois par média
  UNIQUE(user_id, media_id, media_type)
);

-- Index pour performances
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_media ON ratings(media_id, media_type);
CREATE INDEX idx_ratings_date ON ratings(watched_date DESC);
CREATE INDEX idx_ratings_liked ON ratings(is_liked) WHERE is_liked = true;
CREATE INDEX idx_ratings_watched ON ratings(is_watched) WHERE is_watched = true;

-- ============================================
-- TABLE: user_lists
-- Listes personnalisées (Watchlist, Favorites, Custom)
-- ============================================
CREATE TABLE user_lists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  is_ranked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON user_lists(user_id);

-- ============================================
-- TABLE: list_items
-- Items dans les listes
-- ============================================
CREATE TABLE list_items (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES user_lists(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255) NOT NULL,
  media_poster TEXT,
  rank_order INTEGER,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un média ne peut être qu'une fois dans une liste
  UNIQUE(list_id, media_id, media_type)
);

CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_media ON list_items(media_id, media_type);

-- ============================================
-- TABLE: user_follows
-- Système de suivi entre utilisateurs
-- ============================================
CREATE TABLE user_follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut suivre qu'une fois
  UNIQUE(follower_id, following_id),
  
  -- On ne peut pas se suivre soi-même
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_follows_following ON user_follows(following_id);

-- ============================================
-- TABLE: activities
-- Feed d'activités pour le social
-- ============================================
CREATE TABLE activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('rating', 'review', 'list', 'like', 'watch')),
  media_id INTEGER,
  media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv')),
  rating_id BIGINT REFERENCES ratings(id) ON DELETE CASCADE,
  list_id BIGINT REFERENCES user_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(created_at DESC);

-- ============================================
-- FONCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON user_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer une activité automatiquement
CREATE OR REPLACE FUNCTION create_activity_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, media_id, media_type, rating_id)
  VALUES (NEW.user_id, 'rating', NEW.media_id, NEW.media_type, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_activity_after_rating
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_on_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies pour user_profiles
CREATE POLICY "Profils publics visibles par tous"
  ON user_profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent modifier leur profil"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent créer leur profil"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies pour ratings
CREATE POLICY "Tout le monde peut voir les ratings publics"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Utilisateurs peuvent créer leurs ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour user_lists
CREATE POLICY "Listes publiques visibles par tous"
  ON user_lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs listes"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs listes"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs listes"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour list_items
CREATE POLICY "Items de listes publiques visibles"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = list_items.list_id
      AND (user_lists.is_public = true OR user_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "Propriétaires peuvent gérer items"
  ON list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = list_items.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

-- Policies pour user_follows
CREATE POLICY "Tout le monde peut voir les follows"
  ON user_follows FOR SELECT
  USING (true);

CREATE POLICY "Utilisateurs peuvent suivre"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Utilisateurs peuvent unfollow"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Policies pour activities
CREATE POLICY "Tout le monde peut voir les activités"
  ON activities FOR SELECT
  USING (true);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE is_watched = true) as total_watched,
  COUNT(*) FILTER (WHERE is_liked = true) as total_liked,
  COUNT(*) FILTER (WHERE rating IS NOT NULL) as total_rated,
  COUNT(*) FILTER (WHERE review IS NOT NULL AND review != '') as total_reviews,
  AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating,
  COUNT(*) FILTER (WHERE media_type = 'movie' AND is_watched = true) as movies_watched,
  COUNT(*) FILTER (WHERE media_type = 'tv' AND is_watched = true) as series_watched
FROM ratings
GROUP BY user_id;

-- Vue pour les ratings récents avec infos utilisateur
CREATE OR REPLACE VIEW recent_ratings AS
SELECT 
  r.*,
  up.username,
  up.display_name,
  up.avatar_url
FROM ratings r
LEFT JOIN user_profiles up ON r.user_id = up.id
WHERE r.rating IS NOT NULL OR r.review IS NOT NULL
ORDER BY r.created_at DESC;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Créer des profils pour les utilisateurs existants
INSERT INTO user_profiles (id, username, display_name, is_public)
SELECT 
  id,
  COALESCE(email, 'user_' || id::text),
  COALESCE(email, 'User'),
  true
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
