-- HUB / checkout SE: RLS boost.orders + boost.order_items
-- Corrige 401 "new row violates row-level security policy for table orders"
-- no checkout da loja (INSERT+SELECT anon em schema boost).
--
-- Correr no SQL Editor do projecto SportsEvents (tprbpeacicadsbmvxcqk).
-- Idempotente.

BEGIN;

-- Garantir RLS ligado (já deve estar)
ALTER TABLE boost.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost.order_items ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas com o mesmo nome (recriar limpas)
DROP POLICY IF EXISTS boost_orders_public_insert ON boost.orders;
DROP POLICY IF EXISTS boost_orders_public_select ON boost.orders;
DROP POLICY IF EXISTS boost_orders_anon_insert ON boost.orders;
DROP POLICY IF EXISTS boost_orders_anon_select ON boost.orders;
DROP POLICY IF EXISTS boost_order_items_public_insert ON boost.order_items;
DROP POLICY IF EXISTS boost_order_items_public_select ON boost.order_items;
DROP POLICY IF EXISTS boost_order_items_anon_insert ON boost.order_items;
DROP POLICY IF EXISTS boost_order_items_anon_select ON boost.order_items;

-- INSERT + SELECT para anon/authenticated (checkout browser legado / tools)
-- O store passa a criar pedidos via /api/store/create-order (service_role),
-- mas estas policies espelham Boost e desbloqueiam qualquer cliente anon.

CREATE POLICY boost_orders_anon_insert
  ON boost.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY boost_orders_anon_select
  ON boost.orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY boost_order_items_anon_insert
  ON boost.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY boost_order_items_anon_select
  ON boost.order_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grants PostgREST (por se schema ter perdido permissões)
GRANT USAGE ON SCHEMA boost TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON boost.orders TO anon, authenticated;
GRANT ALL ON boost.orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON boost.order_items TO anon, authenticated;
GRANT ALL ON boost.order_items TO service_role;

-- Verificação
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'boost'
  AND tablename IN ('orders', 'order_items')
ORDER BY tablename, policyname;

COMMIT;
