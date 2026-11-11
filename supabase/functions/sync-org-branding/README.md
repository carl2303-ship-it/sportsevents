# sync-org-branding (SportsEvents)

Sync organizer brand colors into `boost.organizations`.

- Project: `tprbpeacicadsbmvxcqk` (SportsEvents)
- Auth: **Tour (Padel1) JWT** validated manually → `verify_jwt = false`
- DB: `boost.organizations` via `_shared/boostStoreClient.ts`

```powershell
npx supabase functions deploy sync-org-branding --project-ref tprbpeacicadsbmvxcqk --no-verify-jwt
```
