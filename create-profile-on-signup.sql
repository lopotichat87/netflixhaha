-- Créer automatiquement un profil quand un utilisateur s'inscrit

-- 1. Fonction qui crée le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_username TEXT;
BEGIN
  -- Nettoyer le username : retirer espaces, caractères spéciaux, mettre en minuscules
  clean_username := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        '\s+', '_', 'g'
      ),
      '[^a-z0-9_]', '', 'g'
    )
  );
  
  -- Limiter à 20 caractères
  clean_username := SUBSTRING(clean_username FROM 1 FOR 20);
  
  INSERT INTO public.profiles (user_id, username, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    clean_username,
    clean_username,
    '🎬|bg-red-600',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Vérifier que la table profiles a les bonnes colonnes
-- Si des colonnes manquent, les ajouter :

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '🎬|bg-red-600';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Créer un index sur user_id pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 6. S'assurer que username est unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
