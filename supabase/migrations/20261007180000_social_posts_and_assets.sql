-- Social-only posts (IG/FB) + photo library by hub

DO $$ BEGIN
  CREATE TYPE public.social_hub AS ENUM (
    'Algarve',
    'Marbella',
    'Barcelona',
    'General'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.social_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub public.social_hub NOT NULL DEFAULT 'General',
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  storage_path text,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_assets_hub_idx
  ON public.social_assets (hub, created_at DESC);

ALTER TABLE public.social_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_assets_staff_all ON public.social_assets;
CREATE POLICY social_assets_staff_all
  ON public.social_assets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );

CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slogan text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  hub public.social_hub NOT NULL DEFAULT 'General',
  image_url text NOT NULL,
  asset_id uuid REFERENCES public.social_assets (id) ON DELETE SET NULL,
  instagram_published boolean NOT NULL DEFAULT false,
  facebook_published boolean NOT NULL DEFAULT false,
  instagram_media_id text,
  facebook_post_id text,
  errors jsonb,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS social_posts_created_idx
  ON public.social_posts (created_at DESC);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_posts_staff_all ON public.social_posts;
CREATE POLICY social_posts_staff_all
  ON public.social_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );
