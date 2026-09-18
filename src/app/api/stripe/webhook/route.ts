import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/admin'
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe'
import {
  executeSplitTransfers,
  summarizeTransferStatus,
  type PendingTransfer,
} from '@/lib/stripe/split-payment'

export const runtime = 'nodejs'

async function markEventBookingPaid(
  bookingId: string,
  paymentIntentId: string | null
) {
  const service = createServiceClient()
  if (!service) return
  await service
    .from('event_bookings')
    .update({
      status: 'PAID',
      paid_at: new Date().toISOString(),
      stripe_payment_intent: paymentIntentId,
    })
    .eq('id', bookingId)
    .neq('status', 'PAID')
}

async function handlePackageSplitCheckout(
  session: Stripe.Checkout.Session
) {
  const service = createServiceClient()
  if (!service) {
    console.error('[stripe-webhook] SUPABASE_SERVICE_ROLE_KEY em falta')
    return
  }

  const bookingId = session.metadata?.package_booking_id
  if (!bookingId) {
    console.error('[stripe-webhook] package_booking_id em falta na session')
    return
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null

  const { data: booking, error } = await service
    .from('package_bookings')
    .select(
      'id, status, hotel_partner_id, transfer_partner_id, hotel_amount_cents, transfer_amount_cents, currency, stripe_transfer_group'
    )
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !booking) {
    console.error('[stripe-webhook] package_booking não encontrado', error)
    return
  }

  if (booking.status === 'paid' || booking.status === 'partial_transfer') {
    return
  }

  if (!paymentIntentId) {
    console.error('[stripe-webhook] payment_intent em falta')
    return
  }

  await service
    .from('package_bookings')
    .update({
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  const partnerIds = [
    booking.hotel_partner_id,
    booking.transfer_partner_id,
  ].filter(Boolean) as string[]

  const { data: partners } =
    partnerIds.length > 0
      ? await service
          .from('partners')
          .select('id, stripe_account_id')
          .in('id', partnerIds)
      : { data: [] as { id: string; stripe_account_id: string | null }[] }

  const byId = new Map(
    (partners || []).map((p) => [p.id as string, p.stripe_account_id as string | null])
  )

  const pending: PendingTransfer[] = []

  if (booking.hotel_amount_cents > 0 && booking.hotel_partner_id) {
    const acct = byId.get(booking.hotel_partner_id)
    if (acct) {
      pending.push({
        role: 'hotel',
        partnerId: booking.hotel_partner_id,
        stripeAccountId: acct,
        amountCents: booking.hotel_amount_cents,
      })
    } else {
      console.error(
        '[stripe-webhook] hotel sem stripe_account_id — transfer skipped',
        bookingId
      )
    }
  }

  if (booking.transfer_amount_cents > 0 && booking.transfer_partner_id) {
    const acct = byId.get(booking.transfer_partner_id)
    if (acct) {
      pending.push({
        role: 'transfer',
        partnerId: booking.transfer_partner_id,
        stripeAccountId: acct,
        amountCents: booking.transfer_amount_cents,
      })
    } else {
      console.error(
        '[stripe-webhook] transfer partner sem stripe_account_id',
        bookingId
      )
    }
  }

  const transferGroup =
    booking.stripe_transfer_group || `pkg_${bookingId}`

  let outcomes: Awaited<ReturnType<typeof executeSplitTransfers>> = []
  try {
    outcomes = await executeSplitTransfers({
      packageBookingId: bookingId,
      paymentIntentId,
      transferGroup,
      currency: booking.currency || 'eur',
      transfers: pending,
    })
  } catch (err) {
    console.error('[stripe-webhook] executeSplitTransfers', err)
  }

  const status = summarizeTransferStatus(outcomes)
  await service
    .from('package_bookings')
    .update({
      status,
      transfer_results: outcomes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
}

export async function POST(request: Request) {
  const stripe = await getStripe()
  const webhookSecret = await getStripeWebhookSecret()

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook não configurado.' },
      { status: 503 }
    )
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura em falta.' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Assinatura inválida'
    console.error('[stripe-webhook] signature', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== 'paid') break

        if (session.metadata?.kind === 'package_split') {
          await handlePackageSplitCheckout(session)
        } else if (session.metadata?.booking_id) {
          const pi =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null
          await markEventBookingPaid(session.metadata.booking_id, pi)
        }
        break
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.package_booking_id
        // Idempotent fallback if checkout.session.completed was missed:
        // only log — primary path is checkout.session.completed (has charge).
        if (bookingId) {
          console.info(
            '[stripe-webhook] payment_intent.succeeded',
            bookingId,
            pi.id
          )
        }
        break
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        const service = createServiceClient()
        if (!service || !account.id) break
        const status =
          account.charges_enabled && account.payouts_enabled
            ? 'active'
            : account.requirements?.disabled_reason
              ? 'restricted'
              : 'pending_onboarding'
        await service
          .from('partners')
          .update({ stripe_connect_status: status })
          .eq('stripe_account_id', account.id)
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
