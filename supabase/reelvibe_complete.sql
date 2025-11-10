-- ============================================
-- REELVIBE - BASE DE DONNÉES COMPLÈTE
-- Script de création de toutes les tables
-- ============================================

-- Supprimer les tables existantes (optionnel, pour réinitialisation)
-- DROP TABLE IF EXISTS activities CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS list_suggestions CASCADE;
-- DROP TABLE IF EXISTS list_members CASCADE;
-- DROP TABLE IF EXISTS collaborative_lists CASCADE;
-- DROP TABLE IF EXISTS friend_recommendations CASCADE;
-- DROP TABLE IF EXISTS taste_compatibility CASCADE;
-- DROP TABLE IF EXISTS friendships CASCADE;
-- DROP TABLE IF EXISTS user_calendar_events CASCADE;
-- DROP TABLE IF EXISTS shared_events CASCADE;
-- DROP TABLE IF EXISTS release_events CASCADE;
-- DROP TABLE IF EXISTS notification_preferences CASCADE;
-- DROP TABLE IF EXISTS movie_emotions CASCADE;
-- DROP TABLE IF EXISTS user_mood_history CASCADE;
-- DROP TABLE IF EXISTS list_items CASCADE;
-- DROP TABLE IF EXISTS user_lists CASCADE;
-- DROP TABLE IF EXISTS ratings CASCADE;
-- DROP TABLE IF EXISTS user_follows CASCADE;
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- TABLE 1: PROFILES (Profils utilisateurs)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  profile_pin VARCHAR(4),
  is_kids BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================
-- TABLE 2: USER_PREFERENCES (Préférences utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'reelvibe',
  banner_url TEXT,
  avatar_frame VARCHAR(50),
  custom_colors JSONB,
  language VARCHAR(10) DEFAULT 'fr',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE 3: RATINGS (Notes et critiques)
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255),
  media_poster TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review TEXT,
  watched_date DATE,
  is_rewatch BOOLEAN DEFAULT false,
  is_liked BOOLEAN DEFAULT false,
  is_watched BOOLEAN DEFAULT false,
  media_review_url TEXT,
  media_review_type VARCHAR(10) CHECK (media_review_type IN ('audio', 'video', NULL)),
  media_review_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id, media_type)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_media ON ratings(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_ratings_liked ON ratings(user_id, is_liked) WHERE is_liked = true;
CREATE INDEX IF NOT EXISTS idx_ratings_watched ON ratings(user_id, is_watched) WHERE is_watched = true;
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- ============================================
-- TABLE 4: USER_LISTS (Listes personnalisées)
-- ============================================
CREATE TABLE IF NOT EXISTS user_lists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lists_public ON user_lists(is_public) WHERE is_public = true;

-- ============================================
-- TABLE 5: LIST_ITEMS (Éléments des listes)
-- ============================================
CREATE TABLE IF NOT EXISTS list_items (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES user_lists(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255),
  media_poster TEXT,
  notes TEXT,
  position INTEGER,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_position ON list_items(list_id, position);

-- ============================================
-- TABLE 6: USER_FOLLOWS (Système de suivi)
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id BIGSERIAL PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- ============================================
-- TABLE 7: ACTIVITIES (Journal d'activités)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  media_id INTEGER,
  media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv', NULL)),
  media_title VARCHAR(255),
  media_poster TEXT,
  rating DECIMAL(2,1),
  review_excerpt TEXT,
  list_id BIGINT REFERENCES user_lists(id) ON DELETE CASCADE,
  list_name VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);

-- ============================================
-- TABLE 8: FRIENDSHIPS (Système d'amis)
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ============================================
-- TABLE 9: FRIEND_RECOMMENDATIONS (Recommandations entre amis)
-- ============================================
CREATE TABLE IF NOT EXISTS friend_recommendations (
  id BIGSERIAL PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255),
  media_poster TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friend_recs_to_user ON friend_recommendations(to_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_friend_recs_created_at ON friend_recommendations(created_at DESC);

-- ============================================
-- TABLE 10: TASTE_COMPATIBILITY (Compatibilité de goûts)
-- ============================================
CREATE TABLE IF NOT EXISTS taste_compatibility (
  user_a_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  common_likes INTEGER DEFAULT 0,
  common_ratings INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_taste_compatibility_score ON taste_compatibility(score DESC);

-- ============================================
-- TABLE 11: COLLABORATIVE_LISTS (Listes collaboratives)
-- ============================================
CREATE TABLE IF NOT EXISTS collaborative_lists (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  voting_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_lists_creator ON collaborative_lists(creator_id);
CREATE INDEX IF NOT EXISTS idx_collab_lists_active ON collaborative_lists(is_active) WHERE is_active = true;

-- ============================================
-- TABLE 12: LIST_MEMBERS (Membres des listes collaboratives)
-- ============================================
CREATE TABLE IF NOT EXISTS list_members (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES collaborative_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_list_members_list ON list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_user ON list_members(user_id);

-- ============================================
-- TABLE 13: LIST_SUGGESTIONS (Suggestions de films pour listes collaboratives)
-- ============================================
CREATE TABLE IF NOT EXISTS list_suggestions (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES collaborative_lists(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255),
  media_poster TEXT,
  suggested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  votes JSONB DEFAULT '{}',
  vote_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_list_suggestions_list ON list_suggestions(list_id);
CREATE INDEX IF NOT EXISTS idx_list_suggestions_status ON list_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_list_suggestions_votes ON list_suggestions(vote_count DESC);

-- ============================================
-- TABLE 14: CHAT_MESSAGES (Messages de chat temps réel)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  list_id BIGINT REFERENCES collaborative_lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'reaction', 'system')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_list ON chat_messages(list_id, created_at DESC);

-- ============================================
-- TABLE 15: MOVIE_EMOTIONS (Émotions associées aux films)
-- ============================================
CREATE TABLE IF NOT EXISTS movie_emotions (
  id BIGSERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  emotion_type VARCHAR(50) NOT NULL,
  intensity DECIMAL(3,2) CHECK (intensity >= 0 AND intensity <= 1),
  source VARCHAR(20) CHECK (source IN ('user_tags', 'review_analysis', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, media_type, emotion_type)
);

CREATE INDEX IF NOT EXISTS idx_movie_emotions_media ON movie_emotions(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_movie_emotions_type ON movie_emotions(emotion_type);
CREATE INDEX IF NOT EXISTS idx_movie_emotions_intensity ON movie_emotions(intensity DESC);

-- ============================================
-- TABLE 16: USER_MOOD_HISTORY (Historique d'humeur utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_mood_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  watched_media_id INTEGER,
  watched_media_type VARCHAR(10) CHECK (watched_media_type IN ('movie', 'tv', NULL)),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mood_history_user ON user_mood_history(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mood_history_mood ON user_mood_history(mood);

-- ============================================
-- TABLE 17: RELEASE_EVENTS (Événements de sortie de films)
-- ============================================
CREATE TABLE IF NOT EXISTS release_events (
  id BIGSERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_title VARCHAR(255),
  media_poster TEXT,
  release_date DATE NOT NULL,
  region VARCHAR(10) DEFAULT 'FR',
  type VARCHAR(20) DEFAULT 'theatrical' CHECK (type IN ('theatrical', 'streaming', 'dvd', 'tv')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, media_type, region, type)
);

CREATE INDEX IF NOT EXISTS idx_release_events_date ON release_events(release_date);
CREATE INDEX IF NOT EXISTS idx_release_events_media ON release_events(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_release_events_region ON release_events(region);

-- ============================================
-- TABLE 18: USER_CALENDAR_EVENTS (Événements calendrier utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_calendar_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id INTEGER,
  media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv', NULL)),
  event_type VARCHAR(50) NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON user_calendar_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON user_calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_reminder ON user_calendar_events(reminder_sent, event_date);

-- ============================================
-- TABLE 19: SHARED_EVENTS (Événements partagés)
-- ============================================
CREATE TABLE IF NOT EXISTS shared_events (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT REFERENCES user_calendar_events(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_users UUID[],
  location TEXT,
  status VARCHAR(20) DEFAULT 'tentative' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_events_event ON shared_events(event_id);
CREATE INDEX IF NOT EXISTS idx_shared_events_creator ON shared_events(created_by);

-- ============================================
-- TABLE 20: NOTIFICATION_PREFERENCES (Préférences de notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  notification_types JSONB DEFAULT '{"releases": true, "friends": true, "recommendations": true, "messages": true}'::jsonb,
  frequency VARCHAR(20) DEFAULT 'instant' CHECK (frequency IN ('instant', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FONCTIONS UTILES
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at BEFORE UPDATE ON user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborative_lists_updated_at BEFORE UPDATE ON collaborative_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer une activité automatiquement lors d'un rating
CREATE OR REPLACE FUNCTION create_rating_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (
    user_id,
    activity_type,
    media_id,
    media_type,
    media_title,
    media_poster,
    rating,
    review_excerpt
  ) VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.rating IS NOT NULL THEN 'rated'
      WHEN NEW.is_liked THEN 'liked'
      ELSE 'watched'
    END,
    NEW.media_id,
    NEW.media_type,
    NEW.media_title,
    NEW.media_poster,
    NEW.rating,
    LEFT(NEW.review, 200)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_activity_on_rating AFTER INSERT ON ratings
  FOR EACH ROW EXECUTE FUNCTION create_rating_activity();

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Statistiques utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  r.user_id,
  COUNT(*) FILTER (WHERE r.is_watched = true) as total_watched,
  COUNT(*) FILTER (WHERE r.rating IS NOT NULL) as total_rated,
  COUNT(*) FILTER (WHERE r.is_liked = true) as total_liked,
  AVG(r.rating) FILTER (WHERE r.rating IS NOT NULL) as avg_rating,
  COUNT(DISTINCT ul.id) as total_lists
FROM ratings r
LEFT JOIN user_lists ul ON ul.user_id = r.user_id
GROUP BY r.user_id;

-- Vue: Ratings récents
CREATE OR REPLACE VIEW recent_ratings AS
SELECT 
  r.*,
  p.username,
  p.avatar_url
FROM ratings r
JOIN profiles p ON p.user_id = r.user_id
WHERE r.rating IS NOT NULL
ORDER BY r.created_at DESC
LIMIT 100;

-- Vue: Activités feed
CREATE OR REPLACE VIEW activities_feed AS
SELECT 
  a.*,
  p.username,
  p.avatar_url
FROM activities a
JOIN profiles p ON p.user_id = a.user_id
ORDER BY a.created_at DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mood_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies pour PROFILES
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies pour RATINGS
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON ratings FOR DELETE USING (auth.uid() = user_id);

-- Policies pour USER_LISTS
CREATE POLICY "Public lists are viewable by everyone" ON user_lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own lists" ON user_lists FOR ALL USING (auth.uid() = user_id);

-- Policies pour ACTIVITIES
CREATE POLICY "Activities are viewable by everyone" ON activities FOR SELECT USING (true);
CREATE POLICY "System can insert activities" ON activities FOR INSERT WITH CHECK (true);

-- Policies pour FRIENDSHIPS
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- DONNÉES INITIALES (Optionnel)
-- ============================================

-- Émotions standard
INSERT INTO movie_emotions (media_id, media_type, emotion_type, intensity, source) VALUES
(0, 'movie', 'joy', 0.8, 'manual'),
(0, 'movie', 'sadness', 0.6, 'manual'),
(0, 'movie', 'excitement', 0.9, 'manual'),
(0, 'movie', 'fear', 0.7, 'manual'),
(0, 'movie', 'inspiration', 0.8, 'manual')
ON CONFLICT (media_id, media_type, emotion_type) DO NOTHING;

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Afficher un message de succès
DO $$
BEGIN
  RAISE NOTICE 'Base de données ReelVibe créée avec succès!';
  RAISE NOTICE 'Total: 20 tables + vues + fonctions + policies';
END $$;
