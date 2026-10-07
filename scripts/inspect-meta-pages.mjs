import { readFileSync } from 'fs'

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

const token = process.env.META_PAGE_ACCESS_TOKEN?.trim()
const pageId = process.env.META_PAGE_ID?.trim()
const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim()
const GRAPH = 'https://graph.facebook.com/v19.0'

console.log('configured_page_id', pageId)
console.log('configured_ig', igId)

const debug = await fetch(
  `${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`
)
const dj = await debug.json()
console.log('token', {
  type: dj.data?.type,
  scopes: dj.data?.scopes,
  profile_id: dj.data?.profile_id || dj.data?.user_id,
})

const page = await fetch(
  `${GRAPH}/${pageId}?fields=id,name&access_token=${encodeURIComponent(token)}`
)
console.log('lookup_configured_page', await page.json())

const me = await fetch(
  `${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(token)}`
)
console.log('me', await me.json())

const accounts = await fetch(
  `${GRAPH}/me/accounts?fields=id,name&access_token=${encodeURIComponent(token)}`
)
const aj = await accounts.json()
console.log(
  'accounts',
  (aj.data || []).map((p) => `${p.id} ${p.name}`),
  aj.error || ''
)

if (igId) {
  const ig = await fetch(
    `${GRAPH}/${igId}?fields=id,username,name&access_token=${encodeURIComponent(token)}`
  )
  console.log('ig_lookup', await ig.json())
}
