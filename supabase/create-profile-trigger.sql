-- Fonction pour créer automatiquement un profil lors de la confirmation d'email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si le profil n'existe pas déjà
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    INSERT INTO public.profiles (user_id, username, display_name, avatar_url, bio, is_private, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
      '🎬|bg-red-600',
      'Nouveau membre de la communauté ReelVibe 🎬',
      false,
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après la création d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Permissions RLS pour la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Politique pour permettre à tout le monde de lire les profils publics
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_private = false OR auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre l'insertion lors de l'inscription
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
