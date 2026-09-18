'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Redireciona para a tab Estágios (sub-tab Pacotes). */
export default function PacotesRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin')
  }, [router])
  return (
    <div className="min-h-screen bg-navy text-app-white flex items-center justify-center text-sm text-app-white/60">
      A abrir Estágios & Eventos…
    </div>
  )
}
