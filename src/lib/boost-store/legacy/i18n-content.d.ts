export const DEFAULT_LANGUAGE: string
export function localizeField(
  row: Record<string, unknown>,
  field: string,
  lang?: string
): string
export function localizeCategory(
  category: Record<string, unknown>,
  lang?: string
): Record<string, unknown>
export function localizeProduct(
  product: Record<string, unknown>,
  lang?: string
): Record<string, unknown>
export function localizeProducts(
  products: Record<string, unknown>[],
  lang?: string
): Record<string, unknown>[]
export function localizeCategories(
  categories: Record<string, unknown>[],
  lang?: string
): Record<string, unknown>[]
