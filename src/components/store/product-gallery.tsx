'use client'

import Image from 'next/image'
import { useState } from 'react'

export function ProductGallery({
  images,
  alt,
}: {
  images: string[]
  alt: string
}) {
  const list = images.length > 0 ? images : []
  const [active, setActive] = useState(0)
  const current = list[active] || list[0]

  if (!current) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan/25 via-navy to-gold/15" />
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black/30">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      {list.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {list.slice(0, 8).map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                index === active
                  ? 'border-cyan'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <Image
                src={url}
                alt={`${alt} ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
