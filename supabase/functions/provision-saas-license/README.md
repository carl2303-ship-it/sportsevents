# provision-saas-license (SportsEvents)

Hub staff: create/update SaaS licenses + provision Tour organizer login.

- Project: `tprbpeacicadsbmvxcqk` (SportsEvents)
- Auth: **SE Auth JWT** (hub staff) — gateway `verify_jwt` default ON
- DB: `boost.organizations` via `_shared/boostStoreClient.ts`
- Cross-project: Padel1 via `TOUR_SUPABASE_URL` + `TOUR_SUPABASE_SERVICE_ROLE_KEY`

```powershell
npx supabase functions deploy provision-saas-license --project-ref tprbpeacicadsbmvxcqk
```
