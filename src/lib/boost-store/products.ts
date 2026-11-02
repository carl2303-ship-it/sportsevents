import { createBoostStoreClient } from '@/lib/boost-store/client'
import type {
  BoostBrand,
  BoostCategory,
  BoostProduct,
} from '@/lib/boost-store/types'

const PRODUCT_SELECT = `
  *,
  category:categories(id, name, slug, description),
  brand:brands(id, name, slug)
`

export async function listActiveProducts(): Promise<BoostProduct[]> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[boost-store] products', error.message)
    return []
  }
  return (data as BoostProduct[]) || []
}

export async function getProductById(
  id: string
): Promise<BoostProduct | null> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('[boost-store] product', error.message)
    return null
  }
  return (data as BoostProduct) || null
}

export async function listActiveCategories(): Promise<BoostCategory[]> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('[boost-store] categories', error.message)
    return []
  }
  return (data as BoostCategory[]) || []
}

export async function listActiveBrands(): Promise<BoostBrand[]> {
  const supabase = createBoostStoreClient()
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('[boost-store] brands', error.message)
    return []
  }
  return (data as BoostBrand[]) || []
}

export function formatEuro(value: number, locale = 'pt-PT'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}
