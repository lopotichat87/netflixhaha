-- Ajouter la colonne is_liked à la table ratings pour permettre de liker indépendamment de la note

-- 1. Ajouter la colonne is_liked si elle n'existe pas
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT false;

-- 2. Créer un index pour améliorer les performances des requêtes sur les likes
CREATE INDEX IF NOT EXISTS idx_ratings_is_liked ON ratings(user_id, is_liked) WHERE is_liked = true;

-- 3. Mettre à jour les valeurs existantes (optionnel - garder les likes existants)
-- Pas de modification nécessaire, les valeurs existantes restent telles quelles

-- Note : Les utilisateurs peuvent maintenant liker un film même sans le noter
-- Le système permettra is_liked = true avec rating = null
