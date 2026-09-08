import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id em falta' }, { status: 400 })
  }

  const stripe = await getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const bookingId = session.metadata?.booking_id
  if (!bookingId) {
    return NextResponse.json({ error: 'Reserva não encontrada na sessão' }, { status: 404 })
  }

  const supabase = await createClient()
  if (session.payment_status === 'paid') {
    await supabase
      .from('event_bookings')
      .update({
        status: 'PAID',
        paid_at: new Date().toISOString(),
        stripe_payment_intent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
      })
      .eq('id', bookingId)
  }

  const { data: booking } = await supabase
    .from('event_bookings')
    .select('*, events(title, slug, start_date, end_date, destinations(name))')
    .eq('id', bookingId)
    .single()

  return NextResponse.json({
    paymentStatus: session.payment_status,
    booking,
  })
}
