import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      eventId,
      customerName,
      customerEmail,
      customerPhone,
      participants,
      paymentType,
    } = body as {
      eventId: string
      customerName: string
      customerEmail: string
      customerPhone?: string
      participants: number
      paymentType: 'DEPOSIT' | 'FULL'
    }

    if (!eventId || !customerName || !customerEmail || !participants) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }
    if (paymentType !== 'DEPOSIT' && paymentType !== 'FULL') {
      return NextResponse.json({ error: 'Tipo de pagamento inválido.' }, { status: 400 })
    }

    const stripe = await getStripe()
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe ainda não está configurado. Vai a Definições no admin ou define STRIPE_SECRET_KEY.',
        },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('published', true)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
    }

    const pax = Math.max(1, Number(participants) || 1)
    const max = Number(event.max_participants || event.group_size || 99)
    if (pax > max) {
      return NextResponse.json(
        { error: `Máximo de ${max} participantes neste evento.` },
        { status: 400 }
      )
    }

    const sale = Number(event.sale_price_per_person || 0)
    const deposit = Number(event.deposit_amount || 0)
    const unitAmount =
      paymentType === 'FULL' ? sale : deposit > 0 ? deposit : Math.round(sale * 0.2)

    if (unitAmount <= 0) {
      return NextResponse.json(
        { error: 'Preço do evento inválido. Contacta a equipa SportsEvents.' },
        { status: 400 }
      )
    }

    const amount = unitAmount * pax
    const currency = (event.currency || 'EUR').toLowerCase()

    const { data: booking, error: bookingError } = await supabase
      .from('event_bookings')
      .insert({
        event_id: event.id,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        customer_phone: customerPhone || null,
        participants: pax,
        payment_type: paymentType,
        amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: bookingError?.message || 'Erro ao criar reserva.' },
        { status: 500 }
      )
    }

    const siteUrl = await getSiteUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail.trim().toLowerCase(),
      line_items: [
        {
          quantity: pax,
          price_data: {
            currency,
            unit_amount: Math.round(unitAmount * 100),
            product_data: {
              name: `${event.title} — ${paymentType === 'FULL' ? 'Pagamento completo' : 'Reserva / depósito'}`,
              description: event.short_description || undefined,
            },
          },
        },
      ],
      metadata: {
        booking_id: booking.id,
        event_id: event.id,
        payment_type: paymentType,
      },
      success_url: `${siteUrl}/eventos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/eventos/${event.slug || event.id}?cancelado=1`,
    })

    await supabase
      .from('event_bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id)

    return NextResponse.json({ url: session.url, bookingId: booking.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro no checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
