'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Calculator, Lock, Trophy } from 'lucide-react'

export default function StaffLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Email ou password incorretos.'
          : signInError.message
      )
      return
    }

    router.replace(nextPath.startsWith('/admin') ? nextPath : '/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-cyan to-gold p-2 rounded-xl text-slate-950">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight font-[family-name:var(--font-display)]">
                SportsEvents<span className="text-cyan-400">.app</span>
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Staff Access</p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black font-[family-name:var(--font-display)]">
                  Login Staff
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acesso restrito ao backoffice Enterprise ERP
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@sportsevents.app"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {error && (
                <p className="text-xs font-medium px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                {loading ? 'A autenticar...' : 'Entrar no Backoffice'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 flex items-start gap-2">
              <Calculator className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Contas Staff são criadas no Supabase Auth pelo administrador. Não existe
                registo público — apenas utilizadores autorizados.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
