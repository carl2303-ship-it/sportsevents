'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Building2,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import type { CardProfile } from '@/lib/cards'

export function DigitalCard({ profile }: { profile: CardProfile }) {
  const [photoOk, setPhotoOk] = useState(Boolean(profile.photoSrc))
  const initial = (profile.firstName || profile.fullName || '?')
    .charAt(0)
    .toUpperCase()

  return (
    <div className="min-h-[100svh] bg-navy text-app-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.12),_transparent_50%)]" />

      <main className="relative z-10 mx-auto flex min-h-[100svh] max-w-md flex-col justify-center px-5 py-10">
        <div className="animate-fade-up flex justify-center mb-8">
          <BrandLogo
            href="/"
            variant="full"
            className="h-14 w-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="animate-fade-up-delay rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-36 w-36 rounded-full overflow-hidden border-2 border-cyan/40 shadow-[0_0_0_6px_rgba(6,182,212,0.12)] bg-slate-900">
              {photoOk && profile.photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photoSrc}
                  alt={profile.fullName}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan/30 to-gold/20">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold text-white">
                    {initial}
                  </span>
                </div>
              )}
            </div>

            <h1 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight">
              {profile.fullName}
            </h1>
            {profile.title ? (
              <p className="mt-2 text-sm font-semibold text-cyan">{profile.title}</p>
            ) : null}
            {profile.hub ? (
              <p className="mt-1 text-xs text-app-white/50 uppercase tracking-wider">
                {profile.hub}
              </p>
            ) : null}
          </div>

          <div className="mt-6 space-y-2.5 text-sm">
            {profile.phone ? (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy/50 px-3.5 py-2.5 hover:border-cyan/40 transition"
              >
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>{profile.phoneDisplay || profile.phone}</span>
              </a>
            ) : null}
            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-navy/50 px-3.5 py-2.5 hover:border-cyan/40 transition"
              >
                <Mail className="w-4 h-4 text-cyan shrink-0" />
                <span>{profile.email}</span>
              </a>
            ) : null}
            {profile.addressLine || profile.city ? (
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy/50 px-3.5 py-2.5 text-app-white/70">
                <MapPin className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                <span>
                  {profile.addressLine}
                  {profile.addressLine && (profile.postalCode || profile.city) ? (
                    <br />
                  ) : null}
                  {[profile.postalCode, profile.city].filter(Boolean).join(' ')}
                </span>
              </div>
            ) : null}
          </div>

          <a
            href={profile.vcfHref}
            download={`${profile.slug}.vcf`}
            className="animate-cta-glow mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-navy hover:brightness-110 transition"
          >
            <Download className="w-4 h-4" />
            Transferir Contacto
          </a>

          {profile.brochures.length > 0 ? (
            <div className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.2em] text-app-white/40 font-bold mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Brochuras B2B
              </p>
              <div className="space-y-2">
                {profile.brochures.map((b, i) => {
                  const external =
                    b.href.startsWith('http://') || b.href.startsWith('https://')
                  const className =
                    'block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-cyan/35 transition'
                  const inner = (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-bold text-white">{b.label}</div>
                        {b.blurb ? (
                          <div className="text-[11px] text-app-white/50 mt-0.5">
                            {b.blurb}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                  return external ? (
                    <a
                      key={`${b.href}-${i}`}
                      href={b.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link key={`${b.href}-${i}`} href={b.href} className={className}>
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <p className="animate-fade-up-delay-2 mt-6 text-center text-[11px] text-app-white/35">
          sportsevents.app/{profile.slug}
        </p>
      </main>
    </div>
  )
}
