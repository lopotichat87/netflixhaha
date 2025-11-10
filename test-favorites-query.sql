-- Test 1 : Voir TOUTES les données de la table favorites
SELECT 
  id,
  user_id,
  media_id, 
  media_type,
  title,
  is_favorite,
  created_at
FROM favorites
ORDER BY created_at DESC
LIMIT 10;

-- Test 2 : Compter les favoris par valeur
SELECT 
  is_favorite,
  COUNT(*) as count
FROM favorites
GROUP BY is_favorite;

-- Test 3 : Voir spécifiquement ceux avec is_favorite = true
SELECT 
  media_id,
  media_type,
  title,
  is_favorite,
  created_at
FROM favorites
WHERE is_favorite = true
ORDER BY created_at DESC;

-- Test 4 : Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;
