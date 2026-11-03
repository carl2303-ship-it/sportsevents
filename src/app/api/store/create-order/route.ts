import { NextResponse } from 'next/server'
import { createBoostStoreServiceClient } from '@/lib/boost-store/server'

export const runtime = 'nodejs'

type OrderBody = {
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  customer_nif?: string | null
  shipping_address?: string
  postal_code?: string
  city?: string
  country?: string
  shipping_method?: string
  shipping_cost?: number
  payment_method?: string
  notes?: string | null
  items?: unknown
  subtotal?: number
  total?: number
  status?: string
  order_number?: string
}

/**
 * Cria pedido loja em `boost.orders` com service role (bypassa RLS).
 * O browser já não faz INSERT anon — evita 401 RLS no checkout SE.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderBody
    const client = createBoostStoreServiceClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Service role SE não configurada no Netlify (SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 503 }
      )
    }

    const name = String(body.customer_name || '').trim()
    const email = String(body.customer_email || '').trim()
    const phone = String(body.customer_phone || '').trim()
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nome, email e telefone são obrigatórios.' },
        { status: 400 }
      )
    }

    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio.' }, { status: 400 })
    }

    const orderNumber =
      String(body.order_number || '').trim() ||
      'SE-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 11).toUpperCase()

    const subtotal = Number(body.subtotal) || 0
    const shippingCost = Number(body.shipping_cost) || 0
    const total = Number(body.total) || subtotal + shippingCost

    const row = {
      order_number: orderNumber,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_nif: body.customer_nif ? String(body.customer_nif) : null,
      shipping_address: String(body.shipping_address || ''),
      postal_code: String(body.postal_code || ''),
      city: String(body.city || ''),
      country: String(body.country || 'PT'),
      address: String(body.shipping_address || ''),
      shipping_postal_code: String(body.postal_code || ''),
      shipping_city: String(body.city || ''),
      shipping_country: String(body.country || 'PT'),
      shipping_method: String(body.shipping_method || ''),
      shipping_cost: shippingCost,
      shipping: shippingCost,
      payment_method: String(body.payment_method || 'stripe'),
      notes: body.notes ? String(body.notes) : null,
      items,
      subtotal,
      total,
      status: String(body.status || 'pending'),
    }

    const { data: order, error } = await client
      .from('orders')
      .insert([row])
      .select('id, order_number, status, total, customer_email')
      .single()

    if (error) {
      console.error('[store/create-order]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (e) {
    console.error('[store/create-order]', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}
