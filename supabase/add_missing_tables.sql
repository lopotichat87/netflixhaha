-- ============================================
-- REELVIBE - TABLES MANQUANTES
-- À ajouter à votre base de données existante
-- ============================================

-- ============================================
-- TABLE 1: USER_PREFERENCES (Thèmes et préférences)
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
-- TABLE 2: FRIENDSHIPS (Système d'amis)
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
-- TABLE 3: FRIEND_RECOMMENDATIONS (Recommandations entre amis)
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
-- TABLE 4: TASTE_COMPATIBILITY (Compatibilité de goûts)
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
-- TABLE 5: COLLABORATIVE_LISTS (Listes collaboratives)
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
-- TABLE 6: LIST_MEMBERS (Membres des listes collaboratives)
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
-- TABLE 7: LIST_SUGGESTIONS (Suggestions de films avec votes)
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
-- TABLE 8: MOVIE_EMOTIONS (Émotions par film)
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
-- TABLE 9: USER_MOOD_HISTORY (Historique d'humeur)
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
-- TABLE 10: RELEASE_EVENTS (Calendrier de sorties)
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
-- TABLE 11: USER_CALENDAR_EVENTS (Événements personnels)
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
-- TABLE 12: SHARED_EVENTS (Événements partagés)
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
-- TABLE 13: NOTIFICATION_PREFERENCES (Préférences de notifications)
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
-- ACTIVER ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mood_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES RLS
-- ============================================

-- USER_PREFERENCES
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- FRIENDSHIPS
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can manage own friendships" ON friendships FOR ALL USING (auth.uid() = user_id);

-- FRIEND_RECOMMENDATIONS
CREATE POLICY "Users can view own recommendations" ON friend_recommendations FOR SELECT USING (auth.uid() = to_user_id);
CREATE POLICY "Users can create recommendations" ON friend_recommendations FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- COLLABORATIVE_LISTS
CREATE POLICY "Users can view lists they're member of" ON collaborative_lists FOR SELECT USING (
  creator_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM list_members WHERE list_id = id AND user_id = auth.uid())
);
CREATE POLICY "Creators can manage their lists" ON collaborative_lists FOR ALL USING (creator_id = auth.uid());

-- LIST_MEMBERS
CREATE POLICY "Members can view list members" ON list_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM list_members lm WHERE lm.list_id = list_id AND lm.user_id = auth.uid())
);

-- LIST_SUGGESTIONS
CREATE POLICY "Members can view suggestions" ON list_suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM list_members WHERE list_id = list_suggestions.list_id AND user_id = auth.uid())
);
CREATE POLICY "Members can create suggestions" ON list_suggestions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM list_members WHERE list_id = list_suggestions.list_id AND user_id = auth.uid())
);

-- MOVIE_EMOTIONS
CREATE POLICY "Everyone can view emotions" ON movie_emotions FOR SELECT USING (true);

-- USER_MOOD_HISTORY
CREATE POLICY "Users can manage own mood history" ON user_mood_history FOR ALL USING (auth.uid() = user_id);

-- RELEASE_EVENTS
CREATE POLICY "Everyone can view release events" ON release_events FOR SELECT USING (true);

-- USER_CALENDAR_EVENTS
CREATE POLICY "Users can manage own calendar" ON user_calendar_events FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATION_PREFERENCES
CREATE POLICY "Users can manage own notifications" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour updated_at sur friendships
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur collaborative_lists
CREATE TRIGGER update_collaborative_lists_updated_at BEFORE UPDATE ON collaborative_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ 13 nouvelles tables ajoutées avec succès!';
  RAISE NOTICE '📊 user_preferences, friendships, friend_recommendations';
  RAISE NOTICE '🎭 collaborative_lists, list_members, list_suggestions';
  RAISE NOTICE '😊 movie_emotions, user_mood_history';
  RAISE NOTICE '📅 release_events, user_calendar_events, shared_events';
  RAISE NOTICE '🔔 notification_preferences';
  RAISE NOTICE '🔒 RLS activé sur toutes les nouvelles tables';
END $$;
