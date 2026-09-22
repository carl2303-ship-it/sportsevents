'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ExternalLink,
  Newspaper,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-shared'
import { ImageUploadField } from '@/components/admin/ImageUploadField'

const inputCls =
  'w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50'

type AdminPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  category: BlogCategory
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  author_name: string
  updated_at?: string
}

type FormState = {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category: BlogCategory
  meta_title: string
  meta_description: string
  author_name: string
  published: boolean
}

function emptyForm(): FormState {
  return {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category: 'Guides',
    meta_title: '',
    meta_description: '',
    author_name: 'SportsEvents Editorial',
    published: false,
  }
}

function postToForm(p: AdminPost): FormState {
  return {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || '',
    content: p.content || '',
    cover_image: p.cover_image || '',
    category: p.category,
    meta_title: p.meta_title || '',
    meta_description: p.meta_description || '',
    author_name: p.author_name || 'SportsEvents Team',
    published: Boolean(p.published_at),
  }
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

export function BlogAdminPanel() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/blog')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar posts')
        setLoading(false)
        return
      }
      setPosts(data.posts || [])
    } catch {
      setError('Erro de rede ao carregar o blog.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setOkMsg(null)
    setError(null)
  }

  function startEdit(p: AdminPost) {
    setEditingId(p.id)
    setForm(postToForm(p))
    setOkMsg(null)
    setError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setOkMsg(null)

    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
    }

    try {
      const res = await fetch(
        editingId ? `/api/admin/blog/${editingId}` : '/api/admin/blog',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao guardar')
        setSaving(false)
        return
      }
      setOkMsg(editingId ? 'Artigo atualizado.' : 'Artigo criado.')
      setEditingId(data.post.id)
      setForm(postToForm(data.post))
      await load()
    } catch {
      setError('Erro de rede ao guardar.')
    }
    setSaving(false)
  }

  async function onDelete(id: string) {
    if (!confirm('Apagar este artigo? Esta ação não se desfaz.')) return
    setError(null)
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao apagar')
      return
    }
    if (editingId === id) startCreate()
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            Gestão do Blog (SEO)
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 max-w-xl">
            Artigos em inglês para tráfego orgânico. Conteúdo HTML simples
            (&lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;a&gt;). Rascunhos não
            aparecem no site até publicares.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5"
        >
          <Plus className="w-3.5 h-3.5" /> Novo artigo
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      {okMsg && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 inline-flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> {okMsg}
        </p>
      )}

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 max-h-[70vh] overflow-y-auto space-y-1">
          {loading && (
            <p className="text-[11px] text-slate-500 px-2 py-3">A carregar…</p>
          )}
          {!loading && posts.length === 0 && (
            <p className="text-[11px] text-slate-500 px-2 py-3">
              Ainda sem artigos. Cria o primeiro.
            </p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border px-3 py-2.5 ${
                editingId === p.id
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : 'border-transparent hover:bg-slate-800/50'
              }`}
            >
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="w-full text-left"
              >
                <div className="text-xs font-semibold text-white line-clamp-2">
                  {p.title}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500">
                  <span>{p.category}</span>
                  <span
                    className={
                      p.published_at ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {p.published_at ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </button>
              <div className="mt-2 flex gap-2">
                {p.published_at && (
                  <Link
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                  >
                    Ver <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:underline"
                >
                  <Trash2 className="w-3 h-3" /> Apagar
                </button>
              </div>
            </div>
          ))}
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Título *
              </span>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((f) => ({
                    ...f,
                    title,
                    slug:
                      !editingId && (!f.slug || f.slug === slugify(f.title))
                        ? slugify(title)
                        : f.slug,
                  }))
                }}
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Slug (URL)
              </span>
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
                }
                placeholder="padel-camps-in-spain"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Categoria
              </span>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as BlogCategory,
                  }))
                }
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Autor
              </span>
              <input
                className={inputCls}
                value={form.author_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author_name: e.target.value }))
                }
              />
            </label>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="Imagem de capa"
                value={form.cover_image}
                onChange={(url) => {
                  setForm((f) => ({ ...f, cover_image: url }))
                  if (url) setOkMsg('Imagem de capa carregada.')
                }}
                kind="blog"
                slug={form.slug || 'draft'}
                allowUrlFallback
              />
            </div>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Excerpt (card / listagem)
              </span>
              <textarea
                className={`${inputCls} min-h-[64px]`}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Meta title (SEO)
              </span>
              <input
                className={inputCls}
                value={form.meta_title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_title: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Meta description (SEO)
              </span>
              <input
                className={inputCls}
                value={form.meta_description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_description: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Conteúdo (HTML)
              </span>
              <textarea
                className={`${inputCls} min-h-[280px] font-mono text-[11px] leading-relaxed`}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="<p>Intro…</p>\n<h2>Heading</h2>\n<ul><li>…</li></ul>"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((f) => ({ ...f, published: e.target.checked }))
              }
              className="rounded border-slate-600"
            />
            Publicado no site (/blog)
          </label>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs px-4 py-2.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar artigo'}
          </button>
        </form>
      </div>
    </div>
  )
}
