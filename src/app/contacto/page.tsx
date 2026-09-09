'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

const inputCls =
  'w-full bg-navy/80 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-app-white/35 focus:outline-none focus:border-cyan/50'

export default function ContactoPage() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    const body = new URLSearchParams()
    formData.forEach((value, key) => {
      body.append(key, String(value))
    })

    try {
      const res = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) throw new Error('Falha no envio')
      setDone(true)
      form.reset()
    } catch {
      setError('Não foi possível enviar a mensagem. Tenta novamente ou escreve para info@sportsevents.app.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-navy text-app-white flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 md:px-10 py-10 md:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            Contactos
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-extrabold">
            Fala connosco
          </h1>
          <p className="mt-3 max-w-2xl text-app-white/65 text-sm md:text-base">
            Pedidos de orçamento, parcerias ou dúvidas — a equipa SportsEvents
            responde a partir de{' '}
            <a
              href="mailto:info@sportsevents.app"
              className="text-cyan hover:underline"
            >
              info@sportsevents.app
            </a>
            .
          </p>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
              {done ? (
                <div className="space-y-4 py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <h2 className="text-2xl font-black">Mensagem enviada</h2>
                  <p className="text-sm text-app-white/70">
                    Obrigado. Recebemos o teu contacto e respondemos em breve
                    para o email indicado.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDone(false)}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold hover:border-cyan/40 hover:text-cyan"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form
                  name="contacto"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={onSubmit}
                  className="space-y-4"
                >
                  <input type="hidden" name="form-name" value="contacto" />
                  <p className="hidden">
                    <label>
                      Não preencher:{' '}
                      <input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Nome *
                      </span>
                      <input
                        required
                        name="name"
                        className={inputCls}
                        placeholder="O teu nome"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Email *
                      </span>
                      <input
                        required
                        type="email"
                        name="email"
                        className={inputCls}
                        placeholder="email@empresa.com"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Telefone
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        className={inputCls}
                        placeholder="+351..."
                      />
                    </label>
                    <label className="block space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Assunto
                      </span>
                      <input
                        name="subject"
                        className={inputCls}
                        placeholder="Orçamento, parceria, dúvida..."
                      />
                    </label>
                    <label className="block space-y-1.5 sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Mensagem *
                      </span>
                      <textarea
                        required
                        name="message"
                        rows={5}
                        className={inputCls}
                        placeholder="Conta-nos o que precisas..."
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-navy hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? 'A enviar...' : 'Enviar mensagem'}
                  </button>
                </form>
              )}
            </div>

            <aside className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                      Email
                    </p>
                    <a
                      href="mailto:info@sportsevents.app"
                      className="text-sm text-white hover:text-cyan"
                    >
                      info@sportsevents.app
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                      Telefone
                    </p>
                    <p className="text-sm text-white">
                      POR{' '}
                      <a href="tel:+351969365059" className="hover:text-cyan">
                        +351 969 365 059
                      </a>
                    </p>
                    <p className="text-sm text-white">
                      ESP{' '}
                      <a href="tel:+34631699818" className="hover:text-cyan">
                        +34 631 699 818
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Algarve
                      </p>
                      <p className="text-sm text-app-white/75 leading-relaxed">
                        ADV Lote 1 Fração G
                        <br />
                        8200-112 Albufeira
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-app-white/45 font-bold">
                        Barcelona
                      </p>
                      <p className="text-sm text-app-white/75 leading-relaxed">
                        Calle Mallorca 535B
                        <br />
                        08026 Barcelona
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href="/construir"
                className="inline-flex rounded-full bg-cyan px-5 py-2.5 text-xs font-bold text-navy hover:brightness-110"
              >
                Preferes construir o estágio?
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
