# manage-saas-subscription (SportsEvents)

Cancel / reactivate SaaS Tour Stripe subscriptions.

- Project: `tprbpeacicadsbmvxcqk` (SportsEvents)
- Auth: **Tour (Padel1) JWT** validated manually → `verify_jwt = false`
- DB: `boost.organizations` via `_shared/boostStoreClient.ts`
- Cross-project: Stripe SE + `TOUR_SUPABASE_ANON_KEY` for Auth getUser

```powershell
npx supabase functions deploy manage-saas-subscription --project-ref tprbpeacicadsbmvxcqk --no-verify-jwt
```
