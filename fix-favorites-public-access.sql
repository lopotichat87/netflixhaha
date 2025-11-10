-- Corriger les policies de la table favorites pour permettre l'accès public aux profils

-- 1. Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can view all favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;

-- 2. Activer RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 3. Policy : TOUT LE MONDE peut voir TOUS les favoris (pour profils publics)
CREATE POLICY "Public read access to all favorites"
  ON favorites
  FOR SELECT
  USING (true);

-- 4. Policy : Les utilisateurs peuvent ajouter leurs propres favoris
CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Policy : Les utilisateurs peuvent modifier leurs propres favoris
CREATE POLICY "Users can update own favorites"
  ON favorites
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Policy : Les utilisateurs peuvent supprimer leurs propres favoris
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);
