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
const GRAPH = 'https://graph.facebook.com/v19.0'

for (const id of ['1759948076137717', '1759949732804218']) {
  const r = await fetch(
    `${GRAPH}/${id}?access_token=${encodeURIComponent(token)}`,
    { method: 'DELETE' }
  )
  console.log('delete', id, await r.json())
}
