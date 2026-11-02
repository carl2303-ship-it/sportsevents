'use client'

import { useState } from 'react'
import { useStoreCart } from '@/components/store/cart-context'
import type { BoostProduct } from '@/lib/boost-store/types'

export function AddToCartButton({
  product,
  label,
  addedLabel,
}: {
  product: BoostProduct
  label: string
  addedLabel: string
}) {
  const { addItem } = useStoreCart()
  const [flash, setFlash] = useState(false)
  const soldOut = !product.is_digital && product.stock === 0

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => {
        addItem({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image_url || undefined,
          type: product.is_digital ? 'digital' : 'physical',
          category: product.category?.slug || undefined,
        })
        setFlash(true)
        window.setTimeout(() => setFlash(false), 1600)
      }}
      className="inline-flex items-center justify-center rounded-xl bg-cyan px-6 py-3 text-sm font-bold text-navy transition hover:bg-cyan/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {flash ? addedLabel : label}
    </button>
  )
}
