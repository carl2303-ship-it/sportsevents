# HUB-27 — Importar blog Boost → Blog SportsEvents

**SQL já está em `sportsevents` `main`** (`6d1dcb9`).

## Ficheiro exacto (colar no SQL Editor)

1. Abre este ficheiro raw e copia **tudo**:  
   https://raw.githubusercontent.com/carl2303-ship-it/sportsevents/main/docs/migrations/20261103123000_boost_blog_to_se_posts.sql  
2. Supabase → projecto **SportsEvents** `tprbpeacicadsbmvxcqk` → **SQL Editor** → New query → colar → **Run**.

Ou no repo: `docs/migrations/20261103123000_boost_blog_to_se_posts.sql` (cópia em `supabase/migrations/` igual).

## O que o SQL faz

1. Lê `boost.blog_posts` (já no SE).
2. Reescreve `boostpadel.store` + Storage legado → `sportsevents.app` / SE Storage.
3. UPSERT em `public.posts` e publica (`published_at` se `published=true`).
4. Limpa captions/slogans em `social_posts` com URLs Boost.

Idempotente — podes re-correr.

## Confirmar após Run

No resultado do SQL:
- count `boost.blog_posts` (esperado ~4)
- lista `public.posts` com `live = true` nos importados

Smoke:
- https://sportsevents.app/blog
- Abrir cada slug novo — HTML **sem** `boostpadel.store`
- https://admin.sportsevents.app/conteudo — **sem** Blog Boost (já em admin main)

## Hub (já feito)

| Repo | SHA | O quê |
|------|-----|--------|
| `admin` | `a3a7426`…`280f5c6` | Remove Blog Boost; redirects → blog-se |
| `admin` | `38bc3f4` | Newsletter Boost → Newsletter SE |

## Store SQL commit

| Repo | SHA | O quê |
|------|-----|--------|
| `sportsevents` | `6d1dcb9` | SQL + runbook HUB-27 |

## Notas

- Colisão de slug SE existente → `{slug}-boost`.
- Não apaga `boost.blog_posts`.
- Sem `SE_SERVICE_ROLE_KEY` no agente — **só Carlos** (ou secret) pode executar no SE.
