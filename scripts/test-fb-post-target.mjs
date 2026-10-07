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

const token = process.env.META_PAGE_ACCESS_TOKEN.trim()
const pageId = process.env.META_PAGE_ID.trim()
const GRAPH = 'https://graph.facebook.com/v19.0'
const img =
  'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80'

async function tryPost(label, pid, tok) {
  const body = new URLSearchParams({
    url: img,
    caption: `probe ${label} ${Date.now()}`,
    published: 'true',
    access_token: tok,
  })
  const res = await fetch(`${GRAPH}/${pid}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const j = await res.json()
  console.log(
    label,
    j.error ? `FAIL ${j.error.code} ${j.error.message}` : `OK ${j.id}`
  )
}

await tryPost('to_SportsEvents_with_current_token', pageId, token)
await tryPost('to_BestOfCycling_with_current_token', '338116174193959', token)
