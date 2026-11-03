# Carlos — Fix checkout 401 RLS `boost.orders`

## Erro live

```
401
Error: new row violates row-level security policy for table "orders"
```

**Causa:** checkout fazia INSERT+SELECT em `boost.orders` com anon. Policies SE incompletas (falta SELECT / grants).

## Código (já no repo)

- `POST /api/store/create-order` — cria pedido com **service role** SE.
- Checkout deixa de inserir no browser.
- Netlify store precisa de `SUPABASE_SERVICE_ROLE_KEY` (SE) → redeploy.

## SQL (recomendado)

Ficheiro: `docs/migrations/20261103140000_boost_orders_rls_checkout.sql`  
Correr no SQL Editor SE `tprbpeacicadsbmvxcqk` (idempotente).

## Smoke

1. Redeploy Netlify.
2. Correr SQL (opcional mas recomendado).
3. Checkout `/store` → Stripe sem 401.
