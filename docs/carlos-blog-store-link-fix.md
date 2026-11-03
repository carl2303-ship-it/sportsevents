# Carlos — Fix links produto/loja no blog SE

## Problema

Artigos Boost em `/blog` têm links quebrados (404):

| Quebrado | Correcto |
|----------|----------|
| `…/store/product.html?id=<uuid>` | `https://sportsevents.app/store/<uuid>` |
| `…/store/store` | `https://sportsevents.app/store` |

Ex.: hidratação / suplementos — `product.html` 404; `/store/<uuid>` dá 200.

## SQL (colar no SQL Editor SE)

Raw:

https://raw.githubusercontent.com/carl2303-ship-it/sportsevents/main/docs/migrations/20261103152000_fix_blog_store_product_links.sql

Projecto: **SportsEvents** `tprbpeacicadsbmvxcqk` → SQL Editor → Run.

Actualiza `public.posts`, `boost.blog_posts` e captions `social_posts`. Idempotente.

## Smoke após Run

1. https://sportsevents.app/blog/hidrata-o-o-papel-da-gua-e-dos-eletr-litos-no-corpo  
   - links produto → `/store/<uuid>` (não `product.html`)
2. https://sportsevents.app/blog/os-melhores-suplementos-para-refor-ar-o-sistema-imunit-rio  
   - sem `/store/store`
3. Abrir um UUID no store → 200.
