-- Vérifier si l'UPDATE a vraiment fonctionné
SELECT 
  media_id, 
  media_type, 
  title,
  is_favorite,
  created_at
FROM favorites 
WHERE media_id = 1197137 AND media_type = 'movie';

-- Si is_favorite est toujours false, forcer manuellement à true pour tester
UPDATE favorites
SET is_favorite = true
WHERE media_id = 1197137 AND media_type = 'movie';

-- Revérifier
SELECT 
  media_id, 
  media_type, 
  title,
  is_favorite,
  created_at
FROM favorites 
WHERE media_id = 1197137 AND media_type = 'movie';
