
-- 1. Ensure bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- 2. Drop the specific restrictive policies identified during inspection
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 3. Create the most permissive policies possible for the avatars bucket
-- These allow anyone (anon) to perform operations on the 'avatars' bucket

-- SELECT (Read)
CREATE POLICY "avatars_select_policy" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- INSERT (Upload)
CREATE POLICY "avatars_insert_policy" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' );

-- UPDATE
CREATE POLICY "avatars_update_policy" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'avatars' );

-- DELETE
CREATE POLICY "avatars_delete_policy" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'avatars' );
