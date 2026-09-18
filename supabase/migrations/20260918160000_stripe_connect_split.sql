-- Stripe Connect Express + split payments (Separate Charges & Transfers)
-- Extends existing CRM `partners` and adds order/transfer tracking.

-- Connect status for payouts (independent from CRM status PROSPECAO/PARCEIRO/…)
DO $$ BEGIN
  CREATE TYPE public.stripe_connect_status AS ENUM (
    'not_connected',
    'pending_onboarding',
    'active',
    'restricted'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_status public.stripe_connect_status
    NOT NULL DEFAULT 'not_connected';

CREATE UNIQUE INDEX IF NOT EXISTS partners_stripe_account_id_uidx
  ON public.partners (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

COMMENT ON COLUMN public.partners.stripe_account_id IS
  'Stripe Connect Express account id (acct_…)';
COMMENT ON COLUMN public.partners.stripe_connect_status IS
  'Onboarding / payout readiness for Connect transfers';

-- Package / camp bookings with multi-party split
CREATE TABLE IF NOT EXISTS public.package_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_package_id uuid REFERENCES public.hub_packages (id) ON DELETE SET NULL,
  hotel_partner_id uuid REFERENCES public.partners (id) ON DELETE RESTRICT,
  transfer_partner_id uuid REFERENCES public.partners (id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  currency text NOT NULL DEFAULT 'EUR',
  padel_service_amount_cents integer NOT NULL CHECK (padel_service_amount_cents >= 0),
  hotel_amount_cents integer NOT NULL DEFAULT 0 CHECK (hotel_amount_cents >= 0),
  transfer_amount_cents integer NOT NULL DEFAULT 0 CHECK (transfer_amount_cents >= 0),
  total_amount_cents integer NOT NULL CHECK (total_amount_cents > 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'partial_transfer')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_transfer_group text,
  transfer_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT package_bookings_total_matches_parts CHECK (
    total_amount_cents =
      padel_service_amount_cents + hotel_amount_cents + transfer_amount_cents
  )
);

CREATE INDEX IF NOT EXISTS package_bookings_status_idx
  ON public.package_bookings (status);
CREATE INDEX IF NOT EXISTS package_bookings_session_idx
  ON public.package_bookings (stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS package_bookings_pi_idx
  ON public.package_bookings (stripe_payment_intent_id);

-- Per-partner transfer attempts (hotel / transfer)
CREATE TABLE IF NOT EXISTS public.payment_transfer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_booking_id uuid NOT NULL
    REFERENCES public.package_bookings (id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.partners (id) ON DELETE SET NULL,
  stripe_account_id text,
  role text NOT NULL CHECK (role IN ('hotel', 'transfer', 'other')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  stripe_transfer_id text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'skipped')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_transfer_logs_booking_idx
  ON public.payment_transfer_logs (package_booking_id);

ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transfer_logs ENABLE ROW LEVEL SECURITY;

-- Public insert/select not exposed; staff via authenticated policies if needed.
-- Service role bypasses RLS for webhooks / checkout APIs.

DROP POLICY IF EXISTS package_bookings_staff_select ON public.package_bookings;
CREATE POLICY package_bookings_staff_select
  ON public.package_bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );

DROP POLICY IF EXISTS payment_transfer_logs_staff_select ON public.payment_transfer_logs;
CREATE POLICY payment_transfer_logs_staff_select
  ON public.payment_transfer_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_members s
      WHERE s.user_id = auth.uid() AND s.active = true
    )
  );

-- Allow staff to update Connect fields on partners
DROP POLICY IF EXISTS partners_staff_update_stripe ON public.partners;
-- If a broad staff update policy already exists, this is a no-op safety net.
-- Staff updates typically go through existing authenticated policies.
