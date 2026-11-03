# HUB-27 — Importar blog Boost → Blog SportsEvents

## O que faz

1. Lê `boost.blog_posts` (já copiado no SE).
2. Reescreve links `boostpadel.store` + Storage legado → `sportsevents.app` / SE Storage.
3. UPSERT em `public.posts` (blog público `/blog`) e publica (`published_at`).
4. Limpa captions/slogans em `social_posts` com URLs Boost.

SQL: [`migrations/20261103123000_boost_blog_to_se_posts.sql`](./migrations/20261103123000_boost_blog_to_se_posts.sql)

## Passos (Carlos)

1. Abrir **Supabase → projecto SportsEvents** `tprbpeacicadsbmvxcqk` → **SQL Editor**.
2. Colar o conteúdo completo do ficheiro SQL acima.
3. **Run**.
4. Confirmar no resultado:
   - `boost.blog_posts` count = 4 (ou o N actual)
   - lista de `public.posts` com os artigos importados e `live = true`
5. Smoke: [sportsevents.app/blog](https://sportsevents.app/blog) + abrir cada slug novo; verificar que não há `boostpadel.store` no HTML.
6. Hub: [admin.sportsevents.app/conteudo](https://admin.sportsevents.app/conteudo) — **Blog Boost** já não aparece; `/conteudo/blog-boost` redirecciona para Blog SE.

## Notas

- Idempotente: podes re-correr o SQL.
- Se um slug SE já existir (não Boost), o import usa `{slug}-boost`.
- Não apaga `boost.blog_posts` (arquivo).
- Hub cleanup já em `admin` main (HUB-27).
