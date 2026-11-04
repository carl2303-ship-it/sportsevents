# TryHolo blog — integração SportsEvents

## Decisão de coexistência (HUB-47)

| Canal | Rota | Origem | Admin |
|-------|------|--------|-------|
| **Blog editorial (manual)** | `/blog` + `/blog/[slug]` | CMS SE (`posts` / painel Blog SEO) | Intactos — sem alterações de fluxo |
| **Blog AI (TryHolo)** | `/blog/auto` | Embed TryHolo (publish key do Carlos) | Publicação no painel TryHolo |

**Porquê `/blog/auto` e não substituir `/blog`:** o índice e os artigos nativos já existem, têm SEO próprio (canonical, Open Graph, JSON-LD) e alimentam o admin. O embed TryHolo vive numa rota irmã (segmento estático preferente sobre `[slug]`), com nav **Blog AI** (header, footer, drawer mobile) e links cruzados entre as duas páginas.

## Snippet (publish key — não inventar outro)

```html
<div id="holo-blog"></div>
<script src="https://prod-api-holo-ai.fly.dev/public/seo/embed/d0a94a17-d7da-4a6b-a2c2-b33bd5906bf4.js" defer></script>
```

No App Router: `src/components/blog/holo-blog-embed.tsx` via `next/script` (`strategy="afterInteractive"` ≈ `defer`).

## SEO (importante)

O embed carrega a lista e os posts **dentro da mesma página** (`/blog/auto`). Os motores de busca podem **não** indexar cada artigo TryHolo como URL própria em `sportsevents.app` — ao contrário dos posts manuais em `/blog/[slug]`. Se TryHolo usar iframe, o sinal SEO por post fica ainda mais fraco. Usar Blog AI para distribuição/automação; conteúdo crítico de SEO no blog editorial nativo.

## CSP (nota para Carlos)

Hoje o site **não** define `Content-Security-Policy` restritiva em `next.config` / Netlify headers. Se no futuro se activar CSP, permitir:

- `script-src` (e tipicamente `connect-src`): `https://prod-api-holo-ai.fly.dev`
- Eventuais assets/iframes que o script injecte (rever Network no DevTools após smoke)

Sem esses allows, o embed fica em branco.

## Smoke-test (Carlos)

1. https://sportsevents.app/blog — lista manual + link “Blog AI”
2. https://sportsevents.app/blog/auto — lista TryHolo; clicar num post; “All articles”
3. Nav desktop / mobile / footer → **Blog AI**
4. `/pt/blog/auto` (e outros locales) — chrome + embed

Admin Blog SEO e rotas `/blog/[slug]` devem continuar iguais.
