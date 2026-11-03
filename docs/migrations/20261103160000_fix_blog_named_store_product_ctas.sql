-- HUB-27c: Remap named product CTAs that still point at bare /store
-- after host rewrite (boostpadel.store → sportsevents.app/store).
--
-- Live leftovers (2026-11-03 smoke):
--   gels post: "Nrgy Gel 45 da Nduranz" → https://sportsevents.app/store  (should be product)
--   suplementos: "Loaded 4Endurance Pro" → https://sportsevents.app/store
--
-- Also re-runs product.html / boostpadel /store/store rewrites (idempotent).
-- Project: SportsEvents tprbpeacicadsbmvxcqk. SQL Editor → Run.

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

  -- product.html?id=UUID
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

  -- Duplo /store/store
  out := replace(out, 'https://sportsevents.app/store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://www.sportsevents.app/store/store.html', 'https://sportsevents.app/store');
  out := replace(out, 'https://sportsevents.app/store/store/', 'https://sportsevents.app/store/');
  out := replace(out, 'https://sportsevents.app/store/store"', 'https://sportsevents.app/store"');
  out := replace(out, 'https://sportsevents.app/store/store''', 'https://sportsevents.app/store''');
  out := replace(out, 'https://sportsevents.app/store/store ', 'https://sportsevents.app/store ');
  out := regexp_replace(out, 'https://(?:www\.)?sportsevents\.app/store/store(?=[/"''?\s<#]|$)', 'https://sportsevents.app/store', 'gi');
  out := regexp_replace(out, '(["''(=])/store/store(?=[/"''?\s<#]|$)', '\1/store', 'gi');

  -- Named product CTAs still on bare /store (anchor text → SE product UUID)
  -- Loaded
  out := regexp_replace(
    out,
    'href="https://(?:www\.)?sportsevents\.app/store"([^>]*>[[:space:]]*<strong>Loaded 4Endurance Pro</strong>)',
    'href="https://sportsevents.app/store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3"\1',
    'gi'
  );
  out := regexp_replace(
    out,
    'href="/store"([^>]*>[[:space:]]*<strong>Loaded 4Endurance Pro</strong>)',
    'href="https://sportsevents.app/store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3"\1',
    'gi'
  );
  out := regexp_replace(
    out,
    'href="https://(?:www\.)?sportsevents\.app/store"([^>]*>[[:space:]]*Loaded[[:space:]]*<)',
    'href="https://sportsevents.app/store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3"\1',
    'gi'
  );

  -- Nrgy Gel 45 (Nduranz / 4Endurance) → BOX 16 Orange (canonical gel SKU on SE)
  out := regexp_replace(
    out,
    'href="https://(?:www\.)?sportsevents\.app/store"([^>]*>[[:space:]]*<strong>Nrgy Gel 45 da Nduranz</strong>)',
    'href="https://sportsevents.app/store/85f1171b-cad6-4740-8d52-53140e55eded"\1',
    'gi'
  );
  out := regexp_replace(
    out,
    'href="/store"([^>]*>[[:space:]]*<strong>Nrgy Gel 45 da Nduranz</strong>)',
    'href="https://sportsevents.app/store/85f1171b-cad6-4740-8d52-53140e55eded"\1',
    'gi'
  );
  out := regexp_replace(
    out,
    'href="https://(?:www\.)?sportsevents\.app/store"([^>]*>[[:space:]]*<strong>Nrgy Gel 45</strong>)',
    'href="https://sportsevents.app/store/85f1171b-cad6-4740-8d52-53140e55eded"\1',
    'gi'
  );

  -- Zero Drink / Electrolites already correct on hidratação; keep absolute form for relative leftovers
  out := regexp_replace(
    out,
    'href="/store/(8bfcc6bb-62a4-4ff2-a13c-9d949dc8797c|090b3439-76c1-4985-b8a1-04ff45b22276)"',
    'href="https://sportsevents.app/store/\1"',
    'gi'
  );

  RETURN out;
END;
$$;

UPDATE public.posts
SET
  content = public._hub27_rewrite_boost_urls(content),
  cover_image = nullif(public._hub27_rewrite_boost_urls(coalesce(cover_image, '')), ''),
  excerpt = public._hub27_rewrite_boost_urls(excerpt),
  updated_at = now()
WHERE coalesce(content, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|sportsevents\.app/store"|href="/store"'
   OR coalesce(cover_image, '') ~* 'product\.html\?id=|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(excerpt, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store';

UPDATE boost.blog_posts
SET
  content = public._hub27_rewrite_boost_urls(content),
  image_url = nullif(public._hub27_rewrite_boost_urls(coalesce(image_url, '')), ''),
  excerpt = public._hub27_rewrite_boost_urls(coalesce(excerpt, '')),
  updated_at = now()
WHERE coalesce(content, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg|sportsevents\.app/store"|href="/store"'
   OR coalesce(image_url, '') ~* 'product\.html\?id=|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(excerpt, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store';

UPDATE public.social_posts
SET
  caption = public._hub27_rewrite_boost_urls(caption),
  slogan = public._hub27_rewrite_boost_urls(slogan)
WHERE coalesce(caption, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg'
   OR coalesce(slogan, '') ~* 'product\.html\?id=|/store/store|boostpadel\.store|gmpyjnufuvsoewbtirsg';

SELECT 'posts_with_broken_product_html' AS check, count(*)::int AS n
FROM public.posts WHERE content ILIKE '%product.html?id=%'
UNION ALL
SELECT 'posts_with_store_store', count(*)::int
FROM public.posts WHERE content ~* 'sportsevents\.app/store/store|/store/store["''?\s<#]'
UNION ALL
SELECT 'posts_with_boostpadel', count(*)::int
FROM public.posts WHERE content ILIKE '%boostpadel.store%'
UNION ALL
SELECT 'posts_with_loaded_product', count(*)::int
FROM public.posts WHERE content ILIKE '%store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3%'
UNION ALL
SELECT 'posts_with_nrgy_gel_box', count(*)::int
FROM public.posts WHERE content ILIKE '%store/85f1171b-cad6-4740-8d52-53140e55eded%';

SELECT slug, title
FROM public.posts
WHERE content ~* 'product\.html\?id=|/store/store|boostpadel\.store'
ORDER BY updated_at DESC
LIMIT 20;

COMMIT;
