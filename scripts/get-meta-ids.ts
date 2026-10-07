/**
 * Extrai META_PAGE_ID, INSTAGRAM_BUSINESS_ACCOUNT_ID e Page Access Token
 * via OAuth Facebook Login (App Token NÃO lista páginas — precisa de User Login).
 *
 * Pré-requisitos no .env.local:
 *   META_APP_ID=...
 *   META_APP_SECRET=...
 *
 * Na app Meta → Facebook Login → Settings → Valid OAuth Redirect URIs:
 *   http://localhost:3457/callback
 *
 * Uso:
 *   npx tsx scripts/get-meta-ids.ts
 *
 * Opcional (salta o browser se já tiveres um User token curto/longo):
 *   META_USER_ACCESS_TOKEN=<user_token> npx tsx scripts/get-meta-ids.ts
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { exec } from 'child_process'
import { randomBytes } from 'crypto'

const GRAPH = 'https://graph.facebook.com/v19.0'
const FB_DIALOG = 'https://www.facebook.com/v19.0/dialog/oauth'
const PORT = Number(process.env.META_OAUTH_PORT || 3457)
const REDIRECT_URI = `http://localhost:${PORT}/callback`

const SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'business_management',
].join(',')

type IgAccount = {
  id: string
  username?: string
  name?: string
}

type PageRow = {
  id: string
  name: string
  access_token: string
  instagram_business_account?: IgAccount
}

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i < 1) continue
    const key = trimmed.slice(0, i).trim()
    let val = trimmed.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

function openBrowser(url: string) {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`
  exec(cmd, (err) => {
    if (err) {
      console.log('\nAbre manualmente este URL no browser:\n', url, '\n')
    }
  })
}

async function graphGet<T>(
  path: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const qs = new URLSearchParams({ ...params, access_token: accessToken })
  const res = await fetch(`${GRAPH}/${path}?${qs}`)
  const data = (await res.json()) as T & {
    error?: { message?: string; code?: number; type?: string }
  }
  if (data.error?.message) {
    throw new Error(
      `Graph ${path}: ${data.error.message} (code=${data.error.code ?? '?'})`
    )
  }
  return data
}

async function exchangeCodeForUserToken(
  code: string,
  appId: string,
  appSecret: string
): Promise<string> {
  const qs = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: REDIRECT_URI,
    code,
  })
  const res = await fetch(`${GRAPH}/oauth/access_token?${qs}`)
  const data = (await res.json()) as {
    access_token?: string
    error?: { message?: string }
  }
  if (!data.access_token) {
    throw new Error(
      data.error?.message || 'Falha ao trocar code por User Access Token'
    )
  }
  return data.access_token
}

/** Tenta obter long-lived user token (~60 dias). */
async function extendUserToken(
  shortToken: string,
  appId: string,
  appSecret: string
): Promise<string> {
  try {
    const qs = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    })
    const res = await fetch(`${GRAPH}/oauth/access_token?${qs}`)
    const data = (await res.json()) as {
      access_token?: string
      error?: { message?: string }
    }
    return data.access_token || shortToken
  } catch {
    return shortToken
  }
}

async function listPages(userToken: string): Promise<PageRow[]> {
  const pages: PageRow[] = []
  let url: string | null =
    `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&limit=100&access_token=${encodeURIComponent(userToken)}`

  while (url) {
    const res = await fetch(url)
    const data = (await res.json()) as {
      data?: PageRow[]
      paging?: { next?: string }
      error?: { message?: string; code?: number }
    }
    if (data.error?.message) {
      throw new Error(
        `me/accounts: ${data.error.message} (code=${data.error.code ?? '?'})`
      )
    }
    for (const p of data.data || []) {
      if (p.id && p.access_token) pages.push(p)
    }
    url = data.paging?.next || null
  }
  return pages
}

function printPages(pages: PageRow[]) {
  if (!pages.length) {
    console.log(`
Nenhuma Página encontrada em /me/accounts.

Verifica:
  1. Entraste com a conta Facebook que é ADMIN da Página Sports Events
  2. A Página está ligada a um Instagram Business/Creator
  3. As permissões pedidas foram aceites no popup
`)
    return
  }

  console.log('\n════════════════════════════════════════════════════════')
  console.log(`  Páginas Facebook encontradas: ${pages.length}`)
  console.log('════════════════════════════════════════════════════════\n')

  for (const page of pages) {
    const ig = page.instagram_business_account
    const highlight =
      /sports\s*events/i.test(page.name || '') ||
      /sportsevents/i.test(ig?.username || '')

    if (highlight) {
      console.log('>>> SPORTS EVENTS (match por nome/username) <<<\n')
    }

    console.log(`Página:          ${page.name}`)
    console.log(`FACEBOOK_PAGE_ID / META_PAGE_ID:`)
    console.log(`                 ${page.id}`)
    console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID:`)
    console.log(
      `                 ${ig?.id || '(sem Instagram Business ligado a esta Página)'}`
    )
    if (ig?.username) {
      console.log(`Instagram @:     ${ig.username}`)
    }
    console.log(`Page Access Token (colar em META_PAGE_ACCESS_TOKEN):`)
    console.log(`                 ${page.access_token}`)
    console.log('')
    console.log('--- Bloco pronto para .env.local ---')
    console.log(`META_PAGE_ID=${page.id}`)
    if (ig?.id) {
      console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${ig.id}`)
    }
    console.log(`META_PAGE_ACCESS_TOKEN=${page.access_token}`)
    console.log('------------------------------------\n')
  }

  console.log('Depois de colar no .env.local, reinicia o next dev.\n')
}

async function runWithUserToken(
  userToken: string,
  appId: string,
  appSecret: string
) {
  const longLived = await extendUserToken(userToken, appId, appSecret)
  const me = await graphGet<{ id: string; name?: string }>('me', longLived, {
    fields: 'id,name',
  })
  console.log(`Autenticado como: ${me.name || me.id} (${me.id})`)

  const debug = await graphGet<{
    data?: { type?: string; is_valid?: boolean; scopes?: string[] }
  }>('debug_token', longLived, { input_token: longLived })
  const scopes = debug.data?.scopes || []
  console.log(`Token type: ${debug.data?.type || '?'} · valid=${debug.data?.is_valid}`)
  console.log(`Scopes: ${scopes.join(', ') || '(n/d)'}`)
  if (!scopes.includes('pages_manage_posts')) {
    console.log(
      '\n⚠ pages_manage_posts AUSENTE — aceita essa permissão no login e volta a correr.\n'
    )
  }

  const pages = await listPages(longLived)
  printPages(pages)
}

function startOauthServer(appId: string, appSecret: string): Promise<void> {
  const state = randomBytes(16).toString('hex')

  return new Promise((resolvePromise, reject) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const url = new URL(req.url || '/', `http://localhost:${PORT}`)

        if (url.pathname === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(
            `<html><body style="font-family:sans-serif;padding:2rem">
              <h1>Meta OAuth — SportsEvents</h1>
              <p>A redirecionar para o Facebook…</p>
              <script>location.href=${JSON.stringify(
                `${FB_DIALOG}?${new URLSearchParams({
                  client_id: appId,
                  redirect_uri: REDIRECT_URI,
                  state,
                  scope: SCOPES,
                  response_type: 'code',
                })}`
              )}</script>
            </body></html>`
          )
          return
        }

        if (url.pathname !== '/callback') {
          res.writeHead(404)
          res.end('Not found')
          return
        }

        const err = url.searchParams.get('error_description') || url.searchParams.get('error')
        if (err) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end(`OAuth error: ${err}`)
          console.error('OAuth error:', err)
          server.close()
          reject(new Error(String(err)))
          return
        }

        const code = url.searchParams.get('code')
        const returnedState = url.searchParams.get('state')
        if (!code || returnedState !== state) {
          res.writeHead(400)
          res.end('Invalid state or missing code')
          server.close()
          reject(new Error('Invalid OAuth callback'))
          return
        }

        const shortToken = await exchangeCodeForUserToken(code, appId, appSecret)

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(
          `<html><body style="font-family:sans-serif;padding:2rem">
            <h1>Autenticação OK</h1>
            <p>Podes fechar esta janela e voltar ao terminal.</p>
          </body></html>`
        )

        server.close()
        await runWithUserToken(shortToken, appId, appSecret)
        resolvePromise()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        try {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
          res.end(msg)
        } catch {
          /* ignore */
        }
        server.close()
        reject(e)
      }
    })

    server.listen(PORT, () => {
      const authUrl = `${FB_DIALOG}?${new URLSearchParams({
        client_id: appId,
        redirect_uri: REDIRECT_URI,
        state,
        scope: SCOPES,
        response_type: 'code',
      })}`

      console.log(`
Servidor OAuth em http://localhost:${PORT}
Redirect URI (tem de estar na app Meta): ${REDIRECT_URI}

A abrir o Facebook Login…
`)
      openBrowser(authUrl)
      console.log('Se o browser não abrir, usa este URL:\n')
      console.log(authUrl)
      console.log('')
    })

    server.on('error', reject)
  })
}

async function main() {
  loadEnvLocal()

  const appId = process.env.META_APP_ID?.trim()
  const appSecret = process.env.META_APP_SECRET?.trim()

  if (!appId || !appSecret) {
    console.error(`
Faltam META_APP_ID e/ou META_APP_SECRET no .env.local.

Adiciona:
  META_APP_ID=...
  META_APP_SECRET=...

(App Dashboard → Settings → Basic)
`)
    process.exit(1)
  }

  // App token — só para sanity check da app (NÃO lista páginas)
  const appToken = `${appId}|${appSecret}`
  try {
    const appInfo = await graphGet<{ id?: string; name?: string }>(
      'app',
      appToken,
      { fields: 'id,name' }
    )
    console.log(`App Meta OK: ${appInfo.name || '?'} (${appInfo.id || appId})`)
  } catch (e) {
    console.error(
      'App Token inválido — confirma META_APP_ID / META_APP_SECRET:',
      e instanceof Error ? e.message : e
    )
    process.exit(1)
  }

  const existingUser = process.env.META_USER_ACCESS_TOKEN?.trim()
  if (existingUser) {
    console.log('A usar META_USER_ACCESS_TOKEN do ambiente (sem browser)…')
    await runWithUserToken(existingUser, appId, appSecret)
    return
  }

  await startOauthServer(appId, appSecret)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
