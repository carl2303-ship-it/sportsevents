# stripe-checkout (SportsEvents)

Source of truth for the Stripe Edge Function.

- Project: `tprbpeacicadsbmvxcqk` (SportsEvents)
- Stripe account: SportsEvents (`acct_1UGyfc4pTyJz1twL`) — not Boost
- DB schema for store tables: `boost` (via `_shared/boostStoreClient.ts`)
- `supabase/config.toml`: `[functions.stripe-checkout] verify_jwt = false`

## Deploy (PowerShell, from sportsevents clone)

```powershell
cd C:\caminho\para\sportsevents
git pull origin main
npx supabase login
npx supabase functions deploy stripe-checkout --project-ref tprbpeacicadsbmvxcqk --no-verify-jwt
```

Do **not** deploy this from the boostpadel repo.
