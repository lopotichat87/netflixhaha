-- ======================================
-- OPTIMISATIONS DE PERFORMANCE
-- Pour supporter 300+ utilisateurs
-- ======================================

-- 1. INDEX SUR LA TABLE PROFILES
-- Recherche rapide par username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_private ON profiles(is_private);

-- 2. INDEX SUR LA TABLE RATINGS
-- Recherche par user_id (le plus important)
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_user_created ON ratings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_media ON ratings(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_ratings_is_watched ON ratings(is_watched) WHERE is_watched = true;
CREATE INDEX IF NOT EXISTS idx_ratings_has_review ON ratings(user_id) WHERE review IS NOT NULL AND review != '';

-- 3. INDEX SUR LA TABLE FAVORITES
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_media ON favorites(media_id, media_type);

-- 4. INDEX SUR LA TABLE FOLLOWS (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'follows') THEN
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
    CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);
  END IF;
END $$;

-- 5. INDEX SUR LA TABLE LISTS (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lists') THEN
    CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
    CREATE INDEX IF NOT EXISTS idx_lists_created_at ON lists(created_at DESC);
  END IF;
END $$;

-- 6. INDEX SUR LA TABLE LIST_ITEMS (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'list_items') THEN
    CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
    CREATE INDEX IF NOT EXISTS idx_list_items_media ON list_items(media_id, media_type);
  END IF;
END $$;

-- 7. VACUUM pour optimiser les tables
-- Note: VACUUM doit être exécuté manuellement si nécessaire
-- VACUUM ANALYZE profiles;
-- VACUUM ANALYZE ratings;
-- VACUUM ANALYZE favorites;

-- 8. STATISTIQUES
-- Vérifier que les index sont utilisés
SELECT 
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 9. Taille des tables
SELECT 
  relname as tablename,
  pg_size_pretty(pg_total_relation_size('public.'||relname)) AS size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||relname) DESC;
