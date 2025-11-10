-- Configuration du Storage Supabase pour les images de profil

-- IMPORTANT : Ce script ne fonctionne pas en SQL directement
-- Vous devez configurer le Storage via l'interface Supabase Dashboard

-- ÉTAPES À SUIVRE DANS SUPABASE DASHBOARD :

-- 1. Aller dans Storage > Buckets
-- 2. Cliquer "New bucket"
-- 3. Nom : profiles
-- 4. Public bucket : OUI (cocher)
-- 5. Créer le bucket

-- 6. Cliquer sur le bucket "profiles" > Policies
-- 7. Cliquer "New Policy" et créer 4 policies :

-- POLICY 1 : Public Access (SELECT)
-- Name: Public Access
-- Allowed operation: SELECT
-- Policy definition: true

-- POLICY 2 : Users can upload (INSERT)  
-- Name: Authenticated users can upload
-- Allowed operation: INSERT
-- Policy definition: (auth.role() = 'authenticated')

-- POLICY 3 : Users can update (UPDATE)
-- Name: Authenticated users can update
-- Allowed operation: UPDATE
-- Policy definition: (auth.role() = 'authenticated')

-- POLICY 4 : Users can delete (DELETE)
-- Name: Authenticated users can delete
-- Allowed operation: DELETE  
-- Policy definition: (auth.role() = 'authenticated')

-- OU utilisez l'interface pour créer simplement avec les templates proposés
