-- Corriger les policies RLS pour la table activities (version qui gère les policies existantes)

-- 1. Supprimer TOUTES les policies (y compris celles qui existent peut-être)
DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Anyone can view all activities" ON activities;
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
DROP POLICY IF EXISTS "System can insert activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
DROP POLICY IF EXISTS "Tout le monde peut voir les activités" ON activities;
DROP POLICY IF EXISTS "Allow all inserts for triggers" ON activities;
DROP POLICY IF EXISTS "Public read access" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

-- 2. Activer RLS sur la table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 3. Recréer les bonnes policies
CREATE POLICY "Allow all inserts for triggers"
  ON activities
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access"
  ON activities
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own activities"
  ON activities
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities
  FOR DELETE
  USING (auth.uid() = user_id);
