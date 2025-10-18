-- Schéma de base de données pour Netflix Clone

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  profile_pin TEXT,
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des favoris (Ma Liste)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- Table de l'historique de visionnage
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  progress INTEGER DEFAULT 0,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- Table des sessions d'activité (tracking temps sur l'app)
CREATE TABLE IF NOT EXISTS activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_id ON activity_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_start ON activity_sessions(session_start);

-- Table des Watch Parties
CREATE TABLE IF NOT EXISTS watch_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  room_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages de chat (Watch Party)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES watch_parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON watch_history(last_watched DESC);
CREATE INDEX IF NOT EXISTS idx_watch_parties_room_code ON watch_parties(room_code);
CREATE INDEX IF NOT EXISTS idx_chat_messages_party_id ON chat_messages(party_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour watch_history
CREATE POLICY "Users can view their own history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour watch_parties
CREATE POLICY "Anyone can view active watch parties"
  ON watch_parties FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can create watch parties"
  ON watch_parties FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their watch parties"
  ON watch_parties FOR UPDATE
  USING (auth.uid() = host_id);

-- Policies pour chat_messages
CREATE POLICY "Anyone can view messages in active parties"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties
      WHERE watch_parties.id = chat_messages.party_id
      AND watch_parties.is_active = TRUE
    )
  );

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table des listes personnalisées
CREATE TABLE IF NOT EXISTS user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des items dans les listes
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, media_id)
);

-- Table pour les statistiques de visionnage
CREATE TABLE IF NOT EXISTS viewing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  genre_ids INTEGER[],
  watch_duration INTEGER DEFAULT 0, -- en minutes
  completed BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour la synchronisation Watch Party
CREATE TABLE IF NOT EXISTS party_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES watch_parties(id) ON DELETE CASCADE NOT NULL UNIQUE,
  playback_time FLOAT DEFAULT 0,
  is_playing BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_viewing_stats_user_id ON viewing_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_stats_watched_at ON viewing_stats(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_party_sync_party_id ON party_sync(party_id);

-- RLS pour user_lists
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_sync ENABLE ROW LEVEL SECURITY;

-- Policies pour user_lists
CREATE POLICY "Users can view their own lists"
  ON user_lists FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own lists"
  ON user_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON user_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON user_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Policies pour list_items
CREATE POLICY "Users can view items in their lists"
  ON list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = list_items.list_id
      AND (user_lists.user_id = auth.uid() OR user_lists.is_public = TRUE)
    )
  );

CREATE POLICY "Users can add items to their lists"
  ON list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = list_items.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their lists"
  ON list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_lists
      WHERE user_lists.id = list_items.list_id
      AND user_lists.user_id = auth.uid()
    )
  );

-- Policies pour viewing_stats
CREATE POLICY "Users can view their own stats"
  ON viewing_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON viewing_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour party_sync
CREATE POLICY "Anyone can view party sync"
  ON party_sync FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties
      WHERE watch_parties.id = party_sync.party_id
      AND watch_parties.is_active = TRUE
    )
  );

CREATE POLICY "Anyone can update party sync"
  ON party_sync FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM watch_parties
      WHERE watch_parties.id = party_sync.party_id
      AND watch_parties.is_active = TRUE
    )
  );

CREATE POLICY "Anyone can insert party sync"
  ON party_sync FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM watch_parties
      WHERE watch_parties.id = party_sync.party_id
      AND watch_parties.is_active = TRUE
    )
  );

-- Trigger pour user_lists
CREATE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON user_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
