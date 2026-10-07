import { readFileSync, writeFileSync } from 'fs'

const path = '.env.local'
const raw = readFileSync(path, 'utf8')

for (const line of raw.split(/\r?\n/)) {
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
if (!token) {
  console.error('META_PAGE_ACCESS_TOKEN vazio')
  process.exit(1)
}

const GRAPH = 'https://graph.facebook.com/v19.0'
const me = await fetch(
  `${GRAPH}/me?fields=id,name&access_token=${encodeURIComponent(token)}`
)
const mj = await me.json()
if (!mj.id) {
  console.error(mj.error?.message || mj)
  process.exit(1)
}

console.log('page', mj.name, mj.id)
console.log('antes META_PAGE_ID=', JSON.stringify(process.env.META_PAGE_ID || ''))

let next = raw
if (/^META_PAGE_ID=/m.test(next)) {
  next = next.replace(/^META_PAGE_ID=.*$/m, `META_PAGE_ID=${mj.id}`)
} else {
  next = `${next.trimEnd()}\nMETA_PAGE_ID=${mj.id}\n`
}
writeFileSync(path, next, 'utf8')
console.log('UPDATED META_PAGE_ID=' + mj.id)
