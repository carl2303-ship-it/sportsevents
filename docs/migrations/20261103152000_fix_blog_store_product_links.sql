-- HUB-27b: Corrigir links de produto/loja quebrados nos artigos do blog SE
--
-- Problema live:
--   https://sportsevents.app/store/product.html?id=<uuid>  → 404
--   https://sportsevents.app/store/store                   → 404
-- (rewrite HUB-27 só trocou o host boostpadel → sportsevents.app/store,
--  sem mapear product.html?id= → /store/<uuid>)
--
-- Destino correcto: https://sportsevents.app/store/<uuid>
--
-- Correr no SQL Editor SportsEvents (tprbpeacicadsbmvxcqk). Idempotente.

BEGIN;

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

  -- Storage legado
  out := replace(out, 'https://gmpyjnufuvsoewbtirsg.supabase.co', 'https://tprbpeacicadsbmvxcqk.supabase.co');
  out := replace(out, 'http://gmpyjnufuvsoewbtirsg.supabase.co', 'https://tprbpeacicadsbmvxcqk.supabase.co');

  -- product.html?id=UUID  (Boost ou já mal-rewritten em /store/product.html)
  -- Ordem: URLs absolutas primeiro, depois path relativo.
  out := regexp_replace(
    out,
    'https://(?:www\.)?boostpadel\.store/product\.html\?id=([0-9a-fA-F-]{36})',
    'https://sportsevents.app/store/\1',
    'gi'
  );
  out := regexp_replace(
    out,
    'https://(?:www\.)?sportsevents\.app/store/product\.html\?id=([0-9a-fA-F-]{36})',
    'https://sportsevents.app/store/\1',
    'gi'
  );
  out := regexp_replace(
    out,
    '(["''(=])/store/product\.html\?id=([0-9a-fA-F-]{36})',
    '\1/store/\2',
    'gi'
  );
  out := regexp_replace(
    out,
    'product\.html\?id=([0-9a-fA-F-]{36})',
    'https://sportsevents.app/store/\1',
    'gi'
  );

  -- Landings conhecidas Boost
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
  out := replace(out, 'https://www.boostpadel.store/checkout.html', 'https://sportsevents.app/store/checkout');
  out := replace(out, 'https://boostpadel.store/checkout.html', 'https://sportsevents.app/store/checkout');

  -- Residual boostpadel host → /store/…
  out := replace(out, 'https://www.boostpadel.store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://boostpadel.store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://www.boostpadel.store', 'https://sportsevents.app/store');
  out := replace(out, 'https://boostpadel.store', 'https://sportsevents.app/store');

  -- Duplo /store/store (host rewrite + path store.html /store)
  out := replace(out, 'https://sportsevents.app/store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://www.sportsevents.app/store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://sportsevents.app/store/store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://sportsevents.app/store/store"', 'https://sportsevents.app/store"');
  out := replace(out, 'https://sportsevents.app/store/store''', 'https://sportsevents.app/store''');
  out := replace(out, 'https://sportsevents.app/store/store ', 'https://sportsevents.app/store ');
  out := regexp_replace(out, 'https://(?:www\.)?sportsevents\.app/store/store(?=[/"''?\s<#]|$)', 'https://sportsevents.app/store', 'gi');
  out := regexp_replace(out, '(["''(=])/store/store(?=[/"''?\s<#]|$)', '\1/store', 'gi');

  RETURN out;
END;
$$;

-- public.posts (blog SE)
UPDATE public.posts
SET
  content = public._hub27_rewrite_boost_urls(content),
  cover_image = nullif(public._hub27_rewrite_boost_urls(coalesce(cover_image, '')), ''),
  excerpt = public._hub27_rewrite_boost_urls(excerpt),
  updated_at = now()
WHERE coalesce(content, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store'
   OR coalesce(cover_image, '') ~* 'product\.html\?id=|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(excerpt, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store';

-- Arquivo boost.blog_posts (fonte)
UPDATE boost.blog_posts
SET
  content = public._hub27_rewrite_boost_urls(content),
  image_url = nullif(public._hub27_rewrite_boost_urls(coalesce(image_url, '')), ''),
  excerpt = public._hub27_rewrite_boost_urls(coalesce(excerpt, '')),
  updated_at = now()
WHERE coalesce(content, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(image_url, '') ~* 'product\.html\?id=|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(excerpt, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store';

-- Social captions
UPDATE public.social_posts
SET
  caption = public._hub27_rewrite_boost_urls(caption),
  slogan = public._hub27_rewrite_boost_urls(slogan)
WHERE coalesce(caption, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(slogan, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg';

-- Verificação: não deve restar product.html nem /store/store no blog
SELECT 'posts_with_broken_product_html' AS check, count(*)::int AS n
FROM public.posts
WHERE content ILIKE '%product.html?id=%'
UNION ALL
SELECT 'posts_with_store_store', count(*)::int
FROM public.posts
WHERE content ~* 'sportsevents\.app/store/store|/store/store["''?\s<#]'
UNION ALL
SELECT 'posts_with_boostpadel', count(*)::int
FROM public.posts
WHERE content ILIKE '%boostpadel.store%'
UNION ALL
SELECT 'sample_ok_product_links', count(*)::int
FROM public.posts
WHERE content ILIKE '%sportsevents.app/store/8bfcc6bb-62a4-4ff2-a13c-9d949dc8797c%'
   OR content ILIKE '%/store/8bfcc6bb-62a4-4ff2-a13c-9d949dc8797c%';

SELECT slug, title
FROM public.posts
WHERE content ~* 'product\.html\?id=|/store/store|boostpadel\.store'
ORDER BY updated_at DESC
LIMIT 20;

COMMIT;
