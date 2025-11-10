-- Forcer les permissions du bucket profiles - SOLUTION COMPLETE

-- 1. Supprimer TOUTES les policies existantes qui bloquent
DELETE FROM storage.objects WHERE bucket_id = 'profiles';

DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 2. Créer UNE SEULE policy qui permet TOUT pour les utilisateurs connectés
CREATE POLICY "Allow all authenticated operations"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- 3. S'assurer que le bucket est public
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 5242880
WHERE id = 'profiles';
