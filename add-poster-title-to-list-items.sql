-- Migration pour ajouter les colonnes manquantes à la table list_items
-- Ces colonnes permettent de stocker les infos des médias pour affichage rapide

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE list_items 
ADD COLUMN IF NOT EXISTS media_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS media_poster_path TEXT;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_media ON list_items(media_id, media_type);

-- Commentaires pour documentation
COMMENT ON COLUMN list_items.media_title IS 'Titre du film/série pour affichage dans la liste';
COMMENT ON COLUMN list_items.media_poster_path IS 'Chemin du poster TMDB pour affichage rapide';
