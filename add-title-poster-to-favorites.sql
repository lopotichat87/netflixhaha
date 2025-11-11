-- Migration pour ajouter title et poster_path à la table favorites
-- Ces colonnes permettent d'éviter les appels API TMDB et accélérer le chargement

ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS poster_path TEXT;

-- Créer des index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_media ON favorites(media_id, media_type);

-- Commentaires pour documentation
COMMENT ON COLUMN favorites.title IS 'Titre du film/série pour éviter les appels TMDB';
COMMENT ON COLUMN favorites.poster_path IS 'Chemin du poster TMDB pour affichage rapide';
