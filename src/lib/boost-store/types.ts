export type BoostCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
  active?: boolean
  display_order?: number | null
}

export type BoostBrand = {
  id: string
  name: string
  slug: string
  active?: boolean
}

export type BoostProduct = {
  id: string
  name: string
  description?: string | null
  short_description?: string | null
  price: number
  compare_at_price?: number | null
  stock: number
  image_url?: string | null
  active?: boolean
  is_featured?: boolean | null
  is_digital?: boolean | null
  learn_more_url?: string | null
  funnel_slug?: string | null
  category_id?: string | null
  brand_id?: string | null
  category?: BoostCategory | null
  brand?: BoostBrand | null
  translations?: Record<string, unknown> | null
}

export type StoreCartItem = {
  id: string
  name: string
  price: number
  image?: string
  type: 'physical' | 'digital'
  quantity: number
  category?: string
}
