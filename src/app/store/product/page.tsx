'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { browserStorePath } from '@/lib/boost-store/store-host'

function ProductRedirectInner() {
  const router = useRouter()
  const search = useSearchParams()
  const id = search.get('id')

  useEffect(() => {
    if (id) {
      router.replace(browserStorePath(id))
    } else {
      router.replace(browserStorePath('/'))
    }
  }, [id, router])

  return (
    <p className="p-10 text-center text-sm text-app-white/50">
      A redireccionar…
    </p>
  )
}

/** Compat boostpadel product.html?id= → /store/[id] */
export default function StoreProductCompatPage() {
  return (
    <div className="min-h-screen bg-navy text-app-white">
      <Suspense fallback={<p className="p-10 text-center text-sm">…</p>}>
        <ProductRedirectInner />
      </Suspense>
    </div>
  )
}
