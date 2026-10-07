import { readFileSync } from 'fs'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue
  const i = line.indexOf('=')
  if (i < 1) continue
  const k = line.slice(0, i)
  let v = line.slice(i + 1).trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1)
  }
  if (!process.env[k]) process.env[k] = v
}

const token = process.env.META_PAGE_ACCESS_TOKEN?.trim()
const pageId = process.env.META_PAGE_ID?.trim()
const GRAPH = 'https://graph.facebook.com/v19.0'

if (!token) {
  console.log('NO_TOKEN')
  process.exit(1)
}

const debug = await fetch(
  `${GRAPH}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`
)
const dj = await debug.json()
const d = dj.data || {}
const scopes = d.scopes || []
console.log(
  JSON.stringify(
    {
      valid: d.is_valid,
      type: d.type,
      has_pages_manage_posts: scopes.includes('pages_manage_posts'),
      has_pages_read_engagement: scopes.includes('pages_read_engagement'),
      scopes,
      pageId,
      error: dj.error?.message || null,
    },
    null,
    2
  )
)
