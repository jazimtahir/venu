-- Storage: create venue-images bucket (public) and RLS policies
-- Fixes "new row violates row-level security policy" on image upload and "Bucket not found" on public URLs.

-- Create bucket as public so /storage/v1/object/public/venue-images/... works
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies so migration is idempotent
DROP POLICY IF EXISTS "Public read venue-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload venue-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update venue-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete venue-images" ON storage.objects;

-- Public read: anyone can view venue images
CREATE POLICY "Public read venue-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-images');

-- Authenticated upload: vendors/admins upload via app (app checks venue ownership)
CREATE POLICY "Authenticated upload venue-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'venue-images');

-- Authenticated update/delete: for reordering, replacing, or deleting images
CREATE POLICY "Authenticated update venue-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'venue-images')
  WITH CHECK (bucket_id = 'venue-images');

CREATE POLICY "Authenticated delete venue-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'venue-images');
