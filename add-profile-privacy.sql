-- Ajouter la colonne is_private à la table profiles

-- 1. Ajouter la colonne is_private (false par défaut = profil public)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- 2. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN profiles.is_private IS 'Si true, le profil est privé et visible uniquement par le propriétaire';

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_is_private ON profiles(is_private);

-- 4. Mettre à jour tous les profils existants à public par défaut
UPDATE profiles 
SET is_private = false 
WHERE is_private IS NULL;
