-- Blog posts for SEO / organic traffic (English content primary)

DO $$ BEGIN
  CREATE TYPE public.post_category AS ENUM (
    'Destinations',
    'Guides',
    'Coaching',
    'Case Studies'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text,
  category public.post_category NOT NULL DEFAULT 'Guides',
  meta_title text,
  meta_description text,
  published_at timestamptz,
  author_name text NOT NULL DEFAULT 'SportsEvents Team',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_published_at_idx
  ON public.posts (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS posts_category_idx
  ON public.posts (category);
CREATE INDEX IF NOT EXISTS posts_slug_idx
  ON public.posts (slug);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_public_read ON public.posts;
CREATE POLICY posts_public_read
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());

DROP POLICY IF EXISTS posts_staff_all ON public.posts;
CREATE POLICY posts_staff_all
  ON public.posts
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

-- Seed SEO cornerstone articles (idempotent by slug)
INSERT INTO public.posts (
  title, slug, excerpt, content, cover_image, category,
  meta_title, meta_description, published_at, author_name
) VALUES
(
  'Padel Camps in Spain: The Complete Guide for Clubs & Academies',
  'padel-camps-in-spain',
  'How to choose the right padel camp in Spain — destinations, coaching ratios, local competition and what clubs should demand from a organiser.',
  $md$
<p>Spain is the epicentre of European padel. From the Costa del Sol to Barcelona, clubs and academies travel south every season for high-performance <strong>padel camps in Spain</strong> that combine coaching, competition and hospitality.</p>
<p>This guide is written for coaches, club managers and group organisers who want more than a hotel with courts — you want measurable player development and a trip that sells itself to members.</p>
<h2>Why Spain for padel training camps?</h2>
<ul>
<li><strong>Density of clubs</strong> — you can play locals every afternoon, not only your own squad.</li>
<li><strong>Climate</strong> — outdoor courts and reliable weather for most of the year.</li>
<li><strong>Infrastructure</strong> — resorts and academies used to hosting international groups.</li>
</ul>
<h2>What a serious padel camp should include</h2>
<p>Look for a clear daily formula: morning technical sessions (ideally 1:4 coach ratio), afternoon matches against levelled local players, and evenings that keep the group together without chaos.</p>
<p>SportsEvents.app builds Iberian camps around that immersion model in <a href="/destinos/marbella">Marbella</a>, <a href="/destinos/barcelona">Barcelona</a> and the Portuguese Algarve.</p>
<h2>Ready to plan your club trip?</h2>
<p>Tell us your dates, group size and level — we will send a free proposal tailored to your academy.</p>
$md$,
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&q=80',
  'Guides',
  'Padel Camps in Spain — Complete Guide for Clubs | SportsEvents',
  'Plan padel camps in Spain for your club: coaching, local matches, hotels and transfers. Free proposal for academies and corporate groups.',
  now() - interval '14 days',
  'SportsEvents Editorial'
),
(
  'Padel Holidays in the Algarve: Sun, Courts and Local Competition',
  'padel-holidays-algarve',
  'Why the Algarve is one of the best destinations for padel holidays — 300+ days of sunshine, Portuguese hospitality and strong club networks.',
  $md$
<p>If you are searching for <strong>padel holidays Algarve</strong>, you are looking for more than a beach break. The Portuguese south coast combines outdoor courts, premium resorts and a welcoming padel community.</p>
<h2>Why coaches love Algarve camps</h2>
<p>Groups fly into Faro, transfer to Albufeira or nearby hubs, and start training within hours. Mornings focus on technique; afternoons put players in real matches against Portuguese clubs.</p>
<h2>Who these holidays are for</h2>
<ul>
<li>Club member trips and end-of-season rewards</li>
<li>Corporate teambuilding with a sport edge</li>
<li>Private groups of friends who want competition + recovery</li>
</ul>
<p>Explore our <a href="/destinos/algarve">Algarve hub</a> or <a href="/construir">build your camp</a> online.</p>
$md$,
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1600&q=80',
  'Destinations',
  'Padel Holidays Algarve — Training Camps in Portugal | SportsEvents',
  'Discover padel holidays in the Algarve: sunshine, coaching, local matches and resorts. Ideal for clubs and private groups.',
  now() - interval '10 days',
  'SportsEvents Editorial'
),
(
  'Padel Training for Clubs: How to Design a High-Impact Stage',
  'padel-training-for-clubs',
  'A practical framework for padel training for clubs — objectives, coach ratios, match programming and how to measure ROI for your members.',
  $md$
<p><strong>Padel training for clubs</strong> only works when the programme has a clear goal: raise levels, bond the community, or both. Vague “holiday with courts” packages rarely deliver either.</p>
<h2>Set outcomes before you book flights</h2>
<ol>
<li>Define player levels and max group size per court.</li>
<li>Book enough coach hours (we recommend intensive morning blocks).</li>
<li>Schedule local opposition — not only internal rotation.</li>
</ol>
<h2>Immersion beats isolation</h2>
<p>The SportsEvents formula pairs evolution in the morning with competition against Iberian locals in the afternoon. That is how members come home talking about the trip for months.</p>
<p><a href="/contacto">Request a free proposal</a> for your academy dates.</p>
$md$,
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1600&q=80',
  'Coaching',
  'Padel Training for Clubs — Design a High-Impact Stage | SportsEvents',
  'Design padel training for clubs with clear goals, coach ratios and local matches. Build a stage that members remember.',
  now() - interval '7 days',
  'SportsEvents Coaching Desk'
),
(
  'Case Study: Running a Club Padel Stage on the Costa del Sol',
  'case-study-club-padel-stage-costa-del-sol',
  'How a European club ran a successful padel stage in Marbella — logistics, coaching plan and member feedback.',
  $md$
<p>This <strong>case study</strong> summarises a typical SportsEvents club stage on the Costa del Sol: arrival transfers, four training mornings, local match afternoons and a closing mini-tournament.</p>
<h2>Results clubs usually report</h2>
<ul>
<li>Higher member retention after the trip</li>
<li>Clear technical progress on serve and transitions</li>
<li>Stronger social cohesion inside the academy</li>
</ul>
<p>Want a similar itinerary? Start with our <a href="/destinos/marbella">Marbella hub</a> packages or talk to the team.</p>
$md$,
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1600&q=80',
  'Case Studies',
  'Case Study: Club Padel Stage Costa del Sol | SportsEvents',
  'See how a club padel stage in Marbella was organised — coaching, matches and logistics. Request your own proposal.',
  now() - interval '3 days',
  'SportsEvents Operations'
)
ON CONFLICT (slug) DO NOTHING;
