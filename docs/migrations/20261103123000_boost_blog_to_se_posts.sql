-- HUB-27: Importar boost.blog_posts → public.posts (blog SE)
-- + reescrever links boostpadel.store / Storage legado
-- + limpar captions social com boostpadel.store
--
-- Correr no SQL Editor do projecto SportsEvents (tprbpeacicadsbmvxcqk).
-- Idempotente: UPSERT por slug.

BEGIN;

-- 1) Helper: reescreve URLs Boost → SE dentro de HTML/texto
CREATE OR REPLACE FUNCTION public._hub27_rewrite_boost_urls(html text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  out text := coalesce(html, '');
BEGIN
  IF out = '' THEN
    RETURN '';
  END IF;
  out := replace(out, 'https://gmpyjnufuvsoewbtirsg.supabase.co', 'https://tprbpeacicadsbmvxcqk.supabase.co');
  out := replace(out, 'http://gmpyjnufuvsoewbtirsg.supabase.co', 'https://tprbpeacicadsbmvxcqk.supabase.co');
  out := replace(out, 'https://www.boostpadel.store/smartpadelstrategy.html', 'https://sportsevents.app/store/funnel?slug=smartpadelstrategy');
  out := replace(out, 'https://boostpadel.store/smartpadelstrategy.html', 'https://sportsevents.app/store/funnel?slug=smartpadelstrategy');
  out := replace(out, 'https://www.boostpadel.store/ebook-landing.html', 'https://sportsevents.app/store/ebook-landing');
  out := replace(out, 'https://boostpadel.store/ebook-landing.html', 'https://sportsevents.app/store/ebook-landing');
  out := replace(out, 'https://www.boostpadel.store/tour.html', 'https://sportsevents.app/store/tour');
  out := replace(out, 'https://boostpadel.store/tour.html', 'https://sportsevents.app/store/tour');
  out := replace(out, 'https://www.boostpadel.store/ebook-upsell.html', 'https://sportsevents.app/store/funnel/upsell?slug=smartpadelstrategy');
  out := replace(out, 'https://boostpadel.store/ebook-upsell.html', 'https://sportsevents.app/store/funnel/upsell?slug=smartpadelstrategy');
  out := replace(out, 'https://boostpadel.store/ebook-upsell-1.html', 'https://sportsevents.app/store/funnel/upsell?slug=smartpadelstrategy');
  out := replace(out, 'https://www.boostpadel.store/ebook-thank-you.html', 'https://sportsevents.app/store/funnel/thank-you?slug=smartpadelstrategy');
  out := replace(out, 'https://boostpadel.store/ebook-thank-you.html', 'https://sportsevents.app/store/funnel/thank-you?slug=smartpadelstrategy');
  out := replace(out, 'https://www.boostpadel.store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://boostpadel.store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://www.boostpadel.store/digital.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://boostpadel.store/digital.html', 'https://sportsevents.app/store');
  -- residual host → /store base
  out := replace(out, 'https://www.boostpadel.store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://boostpadel.store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://www.boostpadel.store', 'https://sportsevents.app/store');
  out := replace(out, 'https://boostpadel.store', 'https://sportsevents.app/store');
  RETURN out;
END;
$$;


-- 2) Mapear categoria Boost (texto livre) → enum SE
CREATE OR REPLACE FUNCTION public._hub27_map_blog_category(raw text)
RETURNS public.post_category
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(nullif(trim(raw), ''), 'geral'))
    WHEN 'destinations' THEN 'Destinations'::public.post_category
    WHEN 'destination' THEN 'Destinations'::public.post_category
    WHEN 'guides' THEN 'Guides'::public.post_category
    WHEN 'guide' THEN 'Guides'::public.post_category
    WHEN 'coaching' THEN 'Coaching'::public.post_category
    WHEN 'coach' THEN 'Coaching'::public.post_category
    WHEN 'case studies' THEN 'Case Studies'::public.post_category
    WHEN 'case_studies' THEN 'Case Studies'::public.post_category
    WHEN 'case-study' THEN 'Case Studies'::public.post_category
    ELSE 'Guides'::public.post_category
  END
$$;

-- 3) Import / upsert
WITH src AS (
  SELECT
    b.id AS boost_id,
    b.title,
    -- evitar colisão com artigos SE já existentes com o mesmo slug
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.posts p
        WHERE p.slug = b.slug
          AND coalesce(p.author_name, '') NOT ILIKE '%boost%'
          AND coalesce(p.author_name, '') NOT ILIKE '%padel iq%'
      ) THEN b.slug || '-boost'
      ELSE b.slug
    END AS slug,
    coalesce(nullif(trim(b.excerpt), ''), left(regexp_replace(coalesce(b.content, ''), '<[^>]+>', '', 'g'), 180)) AS excerpt,
    public._hub27_rewrite_boost_urls(coalesce(b.content, '')) AS content,
    nullif(public._hub27_rewrite_boost_urls(coalesce(b.image_url, '')), '') AS cover_image,
    public._hub27_map_blog_category(b.category) AS category,
    left(b.title, 70) AS meta_title,
    left(
      coalesce(nullif(trim(b.excerpt), ''), left(regexp_replace(coalesce(b.content, ''), '<[^>]+>', '', 'g'), 155)),
      160
    ) AS meta_description,
    CASE
      WHEN b.published IS TRUE THEN coalesce(b.updated_at, b.created_at, now())
      ELSE NULL
    END AS published_at,
    CASE
      WHEN coalesce(b.author, '') = '' OR b.author ILIKE 'boost%' THEN 'SportsEvents Editorial'
      ELSE b.author
    END AS author_name,
    b.created_at,
    b.updated_at
  FROM boost.blog_posts b
)
INSERT INTO public.posts (
  title,
  slug,
  excerpt,
  content,
  cover_image,
  category,
  meta_title,
  meta_description,
  published_at,
  author_name,
  created_at,
  updated_at
)
SELECT
  s.title,
  s.slug,
  s.excerpt,
  s.content,
  s.cover_image,
  s.category,
  s.meta_title,
  s.meta_description,
  s.published_at,
  s.author_name,
  coalesce(s.created_at, now()),
  coalesce(s.updated_at, now())
FROM src s
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = COALESCE(EXCLUDED.cover_image, public.posts.cover_image),
  category = EXCLUDED.category,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  published_at = EXCLUDED.published_at,
  author_name = EXCLUDED.author_name,
  updated_at = now();

-- 4) Limpar links Boost em captions / slogans sociais
UPDATE public.social_posts
SET
  caption = public._hub27_rewrite_boost_urls(caption),
  slogan = public._hub27_rewrite_boost_urls(slogan)
WHERE coalesce(caption, '') ILIKE '%boostpadel.store%'
   OR coalesce(slogan, '') ILIKE '%boostpadel.store%'
   OR coalesce(caption, '') ILIKE '%gmpyjnufuvsoewbtirsg%'
   OR coalesce(slogan, '') ILIKE '%gmpyjnufuvsoewbtirsg%';

-- 5) Verificação
SELECT
  'boost.blog_posts' AS src,
  count(*)::int AS n
FROM boost.blog_posts
UNION ALL
SELECT
  'public.posts imported (author SportsEvents Editorial or recent)',
  count(*)::int
FROM public.posts
WHERE content ILIKE '%sportsevents.app/store%'
   OR cover_image ILIKE '%tprbpeacicadsbmvxcqk%'
   OR slug LIKE '%-boost'
   OR author_name ILIKE '%Editorial%';

SELECT slug, title, published_at IS NOT NULL AS live, category
FROM public.posts
ORDER BY published_at DESC NULLS LAST
LIMIT 30;

-- Helpers podem ficar (úteis) ou dropar:
-- DROP FUNCTION public._hub27_rewrite_boost_urls(text);
-- DROP FUNCTION public._hub27_map_blog_category(text);

COMMIT;
