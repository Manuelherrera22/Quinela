
-- 1. Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 2. Clean up ALL existing policies for storage.objects related to the avatars bucket
-- This avoids conflicts during development/testing
DO $$
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP;
END $$;

-- 3. Create ultra-permissive policies for everyone (anon and authenticated)
-- Since we manage auth manually, Supabase sees all requests as 'anon'

-- Allow anyone to read
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Allow anyone to insert
CREATE POLICY "Public Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' );

-- Allow anyone to update
CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'avatars' );

-- Allow anyone to delete (optional, but good for management)
CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'avatars' );
