-- Default Connect split config on catalog packages.
-- Checkout: total = preço pacote × pax; hotel/transfer = % do total; resto = plataforma.

ALTER TABLE public.hub_packages
  ADD COLUMN IF NOT EXISTS hotel_partner_id uuid
    REFERENCES public.partners (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS transfer_partner_id uuid
    REFERENCES public.partners (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS split_hotel_percent numeric(5,2)
    NOT NULL DEFAULT 0
    CHECK (split_hotel_percent >= 0 AND split_hotel_percent <= 100),
  ADD COLUMN IF NOT EXISTS split_transfer_percent numeric(5,2)
    NOT NULL DEFAULT 0
    CHECK (split_transfer_percent >= 0 AND split_transfer_percent <= 100);

DO $$ BEGIN
  ALTER TABLE public.hub_packages
    ADD CONSTRAINT hub_packages_split_percent_sum_chk
    CHECK (split_hotel_percent + split_transfer_percent <= 100);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.hub_packages.hotel_partner_id IS
  'Parceiro HOTEL Connect (recebe split_hotel_percent do total)';
COMMENT ON COLUMN public.hub_packages.transfer_partner_id IS
  'Parceiro TRANSPORTES Connect (recebe split_transfer_percent do total)';
COMMENT ON COLUMN public.hub_packages.split_hotel_percent IS
  'Percentagem do total do checkout transferida ao hotel';
COMMENT ON COLUMN public.hub_packages.split_transfer_percent IS
  'Percentagem do total transferida ao parceiro de transfers; resto fica na plataforma';

CREATE INDEX IF NOT EXISTS hub_packages_hotel_partner_idx
  ON public.hub_packages (hotel_partner_id);
CREATE INDEX IF NOT EXISTS hub_packages_transfer_partner_idx
  ON public.hub_packages (transfer_partner_id);
