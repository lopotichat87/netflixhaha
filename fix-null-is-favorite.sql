-- Mettre à jour tous les NULL en false
UPDATE favorites 
SET is_favorite = false 
WHERE is_favorite IS NULL;

-- Ajouter une contrainte NOT NULL pour éviter les NULL à l'avenir
ALTER TABLE favorites 
ALTER COLUMN is_favorite SET DEFAULT false,
ALTER COLUMN is_favorite SET NOT NULL;
