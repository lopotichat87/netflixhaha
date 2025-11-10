-- Ajouter la colonne is_favorite à la table favorites existante
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_favorites_is_favorite ON favorites(is_favorite) WHERE is_favorite = true;
