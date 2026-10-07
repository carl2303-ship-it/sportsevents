import { readFileSync, writeFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue
  const i = line.indexOf('=')
  if (i < 1) continue
  let v = line.slice(i + 1).trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1)
  }
  const k = line.slice(0, i)
  if (!process.env[k]) process.env[k] = v
}

const userToken = process.env.META_PAGE_ACCESS_TOKEN?.trim()
const pageId = process.env.META_PAGE_ID?.trim()
const GRAPH = 'https://graph.facebook.com/v19.0'

if (!userToken || !pageId) {
  console.error('Missing token or page id')
  process.exit(1)
}

const accountsRes = await fetch(
  `${GRAPH}/me/accounts?fields=id,name,access_token,tasks&access_token=${encodeURIComponent(userToken)}`
)
const accounts = await accountsRes.json()
if (accounts.error) {
  console.error('me/accounts', accounts.error)
  process.exit(1)
}

const pages = accounts.data || []
console.log(
  'pages',
  pages.map((p) => ({ id: p.id, name: p.name, tasks: p.tasks }))
)

const page = pages.find((p) => String(p.id) === String(pageId))

if (!page?.access_token) {
  console.error(
    'Sports Events page not in me/accounts. Available:',
    pages.map((p) => `${p.id} ${p.name}`)
  )
  console.error(
    'Login to Graph API Explorer as the Facebook admin of Sports Events (page id ' +
      pageId +
      '), then re-run.'
  )
  process.exit(1)
}

console.log('using_page', page.id, page.name)

const img =
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80'
const body = new URLSearchParams({
  url: img,
  caption: `Sportsevents FB test ${Date.now()}`,
  published: 'true',
  access_token: page.access_token,
})
const photo = await fetch(`${GRAPH}/${page.id}/photos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body,
})
const ph = await photo.json()
if (ph.error) {
  console.error('photos_fail', ph.error)
  process.exit(1)
}
console.log('photos_ok', ph.id, ph.post_id)

// Update .env.local with PAGE token
const raw = readFileSync('.env.local', 'utf8')
const next = raw.replace(
  /^META_PAGE_ACCESS_TOKEN=.*$/m,
  `META_PAGE_ACCESS_TOKEN=${page.access_token}`
)
if (next === raw) {
  console.error('Could not replace META_PAGE_ACCESS_TOKEN in .env.local')
  process.exit(1)
}
writeFileSync('.env.local', next, 'utf8')
console.log('UPDATED_.env.local_with_PAGE_token len=', page.access_token.length)

// Verify scopes on new page token
const debug = await fetch(
  `${GRAPH}/debug_token?input_token=${encodeURIComponent(page.access_token)}&access_token=${encodeURIComponent(page.access_token)}`
)
const dj = await debug.json()
console.log('new_token', {
  type: dj.data?.type,
  valid: dj.data?.is_valid,
  has_manage: (dj.data?.scopes || []).includes('pages_manage_posts'),
  scopes: dj.data?.scopes,
})
