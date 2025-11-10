-- Corriger les policies RLS pour la table activities
-- Le problème : les triggers créent des activités automatiquement et les policies RLS les bloquent

-- 1. Supprimer TOUTES les anciennes policies
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Anyone can view all activities" ON activities;
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "System can insert activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
DROP POLICY IF EXISTS "Tout le monde peut voir les activités" ON activities;

-- 2. Activer RLS sur la table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 3. CRITICAL: Policy qui permet aux TRIGGERS d'insérer (pas de vérification user_id)
-- Les triggers s'exécutent avec les droits du system, pas de l'utilisateur
CREATE POLICY "Allow all inserts for triggers"
  ON activities
  FOR INSERT
  WITH CHECK (true);

-- 4. Policy : Tout le monde peut voir toutes les activités (pour le fil d'activité public)
CREATE POLICY "Public read access"
  ON activities
  FOR SELECT
  USING (true);

-- 5. Policy : Les utilisateurs peuvent mettre à jour leurs propres activités
CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Policy : Les utilisateurs peuvent supprimer leurs propres activités
CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Vérifier que la table existe et a la bonne structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activities') THEN
    CREATE TABLE activities (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL,
      media_id INTEGER,
      media_type VARCHAR(20),
      media_title TEXT,
      media_poster TEXT,
      rating INTEGER,
      review TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Index
    CREATE INDEX idx_activities_user_id ON activities(user_id);
    CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
  END IF;
END $$;
