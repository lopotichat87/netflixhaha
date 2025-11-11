-- ======================================
-- SCRIPT DE VÉRIFICATION DES ACTIVITÉS
-- Pour tous les utilisateurs
-- ======================================

-- 1. Liste de tous les utilisateurs avec leurs stats
SELECT 
  p.username,
  p.user_id,
  p.is_private,
  COALESCE(r.ratings_count, 0) as ratings_count,
  COALESCE(f.favorites_count, 0) as favorites_count,
  COALESCE(w.watched_count, 0) as watched_count,
  p.created_at
FROM profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as ratings_count 
  FROM ratings 
  GROUP BY user_id
) r ON p.user_id = r.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as favorites_count 
  FROM favorites 
  GROUP BY user_id
) f ON p.user_id = f.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as watched_count 
  FROM ratings 
  WHERE is_watched = true 
  GROUP BY user_id
) w ON p.user_id = w.user_id
ORDER BY p.created_at DESC;

-- 2. Activités récentes de TOUS les utilisateurs
SELECT 
  p.username,
  r.media_title,
  r.rating,
  r.review,
  r.is_watched,
  r.created_at
FROM ratings r
JOIN profiles p ON r.user_id = p.user_id
ORDER BY r.created_at DESC
LIMIT 20;

-- 3. Favoris récents de TOUS les utilisateurs
SELECT 
  p.username,
  f.media_id,
  f.media_type,
  f.created_at
FROM favorites f
JOIN profiles p ON f.user_id = p.user_id
ORDER BY f.created_at DESC
LIMIT 20;

-- 4. Utilisateurs SANS aucune activité
SELECT 
  username,
  user_id,
  created_at
FROM profiles p
WHERE NOT EXISTS (SELECT 1 FROM ratings WHERE user_id = p.user_id)
  AND NOT EXISTS (SELECT 1 FROM favorites WHERE user_id = p.user_id)
ORDER BY created_at DESC;

-- 5. Statistiques globales de la plateforme
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM ratings) as total_ratings,
  (SELECT COUNT(*) FROM favorites) as total_favorites,
  (SELECT COUNT(*) FROM ratings WHERE is_watched = true) as total_watched,
  (SELECT COUNT(*) FROM ratings WHERE review IS NOT NULL AND review != '') as total_reviews;
