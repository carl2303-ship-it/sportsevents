-- Public bucket for blog cover images (admin upload)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-assets',
  'blog-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS blog_assets_public_read ON storage.objects;
CREATE POLICY blog_assets_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-assets');

DROP POLICY IF EXISTS blog_assets_staff_insert ON storage.objects;
CREATE POLICY blog_assets_staff_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-assets'
    AND EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );

DROP POLICY IF EXISTS blog_assets_staff_update ON storage.objects;
CREATE POLICY blog_assets_staff_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-assets'
    AND EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );

DROP POLICY IF EXISTS blog_assets_staff_delete ON storage.objects;
CREATE POLICY blog_assets_staff_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-assets'
    AND EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );
