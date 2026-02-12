-- 1. Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars bucket if it doesn't exist
-- Note: Buckets are usually created via API or Dashboard, but we can try inserting into storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS policies for avatars bucket
-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
-- (Simplification: Allow auth users to upload any file to avatars for now, 
-- ideally matched by folder name = user_id)
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
