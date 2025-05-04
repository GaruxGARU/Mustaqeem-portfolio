-- Create the profile_avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'profile_avatars',
  'profile_avatars',
  true -- Allow public access to the bucket
);

-- Set up policies for the profile_avatars bucket
-- Allow public read access to all files in the bucket
CREATE POLICY "Public Access Profile Avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile_avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated Users can upload avatars" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile_avatars');

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile_avatars' AND owner = auth.uid()::text);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile_avatars' AND owner = auth.uid()::text);