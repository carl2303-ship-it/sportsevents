-- Demografia e país do cliente nas reservas de estágios (para analytics admin)
ALTER TABLE public.event_bookings
  ADD COLUMN IF NOT EXISTS customer_country text,
  ADD COLUMN IF NOT EXISTS age_band text,
  ADD COLUMN IF NOT EXISTS gender_mix text;

COMMENT ON COLUMN public.event_bookings.customer_country IS
  'Código ISO do país do grupo/cliente (ex. PT, FR, GB)';
COMMENT ON COLUMN public.event_bookings.age_band IS
  'Faixa etária predominante: U18, 18-25, 26-35, 36-45, 46-55, 55+';
COMMENT ON COLUMN public.event_bookings.gender_mix IS
  'Composição: MALE, FEMALE, MIXED, OTHER';
