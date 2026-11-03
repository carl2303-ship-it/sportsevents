# Carlos — Fix links produto/loja no blog SE

## Problema

Artigos Boost em `/blog` têm links de loja/produto incorrectos:

| Quebrado / residual | Correcto |
|---------------------|----------|
| `…/store/product.html?id=<uuid>` | `https://sportsevents.app/store/<uuid>` |
| `…/store/store` | `https://sportsevents.app/store` |
| `boostpadel.store/…` | `https://sportsevents.app/store/…` |
| CTA “Loaded / Nrgy Gel 45” → bare `/store` | product UUID path (abaixo) |

## SQL (colar no SQL Editor SE) — MCP bloqueado neste agente

Correr **este** (inclui HUB-27b + named CTAs), idempotente:

https://raw.githubusercontent.com/carl2303-ship-it/sportsevents/main/docs/migrations/20261103160000_fix_blog_named_store_product_ctas.sql

Fallback (só product.html /store/store):

https://raw.githubusercontent.com/carl2303-ship-it/sportsevents/main/docs/migrations/20261103152000_fix_blog_store_product_links.sql

Projecto: **SportsEvents** `tprbpeacicadsbmvxcqk` → SQL Editor → Run.

Actualiza `public.posts`, `boost.blog_posts` e captions `social_posts`.

### Product paths usados

| CTA no artigo | Destino |
|---------------|---------|
| Zero Drink / Electrolites (hidratação) | `/store/8bfcc6bb-…` · `/store/090b3439-…` |
| Loaded 4Endurance Pro | `/store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3` |
| Nrgy Gel 45 da Nduranz | `/store/85f1171b-cad6-4740-8d52-53140e55eded` (BOX 16) |

Immuno não está no catálogo SE → mantém loja ou link 4endurance.pt já no HTML.

## PowerShell smoke (após Run + redeploy se preciso)

```powershell
$slugs = @(
  'hidrata-o-o-papel-da-gua-e-dos-eletr-litos-no-corpo',
  'os-melhores-suplementos-para-refor-ar-o-sistema-imunit-rio',
  'os-g-is-energ-ticos-previnem-as-c-ibras-musculares-durante-o-exerc-cio'
)
foreach ($s in $slugs) {
  $html = (Invoke-WebRequest "https://sportsevents.app/blog/$s").Content
  if ($html -match 'product\.html|boostpadel\.store|/store/store') { "BROKEN $s" } else { "OK $s" }
}
Invoke-WebRequest "https://sportsevents.app/store/6fcd365a-8026-4fb1-bfe0-15b95cb671e3" | Select-Object StatusCode
Invoke-WebRequest "https://sportsevents.app/store/85f1171b-cad6-4740-8d52-53140e55eded" | Select-Object StatusCode
```

## Smoke manual

1. https://sportsevents.app/blog/hidrata-o-o-papel-da-gua-e-dos-eletr-litos-no-corpo — produtos `/store/<uuid>`, 200
2. https://sportsevents.app/blog/os-melhores-suplementos-para-refor-ar-o-sistema-imunit-rio — Loaded → product UUID; sem `/store/store`
3. https://sportsevents.app/blog/os-g-is-energ-ticos-previnem-as-c-ibras-musculares-durante-o-exerc-cio — Nrgy Gel → BOX UUID
