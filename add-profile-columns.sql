-- Ajouter les colonnes manquantes à la table profiles

-- 1. Ajouter banner_url si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Ajouter updated_at si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. S'assurer que bio existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 4. Commenter les colonnes pour documentation
COMMENT ON COLUMN profiles.banner_url IS 'URL de la bannière du profil (peut être vide)';
COMMENT ON COLUMN profiles.bio IS 'Biographie de l''utilisateur (200 caractères max)';
COMMENT ON COLUMN profiles.updated_at IS 'Date de dernière mise à jour du profil';

-- 5. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
