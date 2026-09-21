'use client'

import { FormEvent, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/blog-shared'

type BlogFiltersProps = {
  category: BlogCategory | null
  q: string
  allLabel: string
  searchPlaceholder: string
  searchLabel: string
}

export function BlogFilters({
  category,
  q,
  allLabel,
  searchPlaceholder,
  searchLabel,
}: BlogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname() || '/blog'
  const [query, setQuery] = useState(q)

  function push(nextCategory: string | null, nextQ: string) {
    const params = new URLSearchParams()
    if (nextCategory) params.set('category', nextCategory)
    if (nextQ.trim()) params.set('q', nextQ.trim())
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    push(category, query)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => push(null, query)}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
            !category
              ? 'border-cyan bg-cyan text-navy'
              : 'border-white/15 text-app-white/65 hover:border-cyan/40 hover:text-app-white'
          }`}
        >
          {allLabel}
        </button>
        {BLOG_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => push(c, query)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
              category === c
                ? 'border-cyan bg-cyan text-navy'
                : 'border-white/15 text-app-white/65 hover:border-cyan/40 hover:text-app-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="relative max-w-md">
        <label htmlFor="blog-search" className="sr-only">
          {searchLabel}
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-white/35" />
        <input
          id="blog-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-white/15 bg-navy/80 py-2.5 pl-10 pr-3 text-sm text-app-white placeholder:text-app-white/35 focus:border-cyan/50 focus:outline-none"
        />
      </form>
    </div>
  )
}
