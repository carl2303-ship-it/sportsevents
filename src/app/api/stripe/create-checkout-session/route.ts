import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { getSiteUrl, getStripe } from '@/lib/stripe'
import { createCheckoutSessionSchema } from '@/lib/stripe/schemas'
import { computePackageSplit } from '@/lib/stripe/package-split'
import type { HubPackageRow } from '@/lib/hub-packages'

/**
 * Checkout Session: preço + split vêm do pacote (admin).
 * Separate Charges & Transfers no webhook.
 */
export async function POST(request: Request) {
  try {
    const stripe = await getStripe()
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe ainda não está configurado. Define STRIPE_SECRET_KEY ou Admin → Definições.',
        },
        { status: 503 }
      )
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
    }

    const parsed = createCheckoutSessionSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const body = parsed.data
    if (body.singleRooms > body.players) {
      return NextResponse.json(
        { error: 'singleRooms não pode exceder players.' },
        { status: 400 }
      )
    }

    const db = createServiceClient() || (await createClient())

    const { data: pkg, error: pkgErr } = await db
      .from('hub_packages')
      .select('*')
      .eq('id', body.hubPackageId)
      .eq('published', true)
      .maybeSingle()

    if (pkgErr || !pkg) {
      return NextResponse.json(
        { error: pkgErr?.message || 'Pacote não encontrado ou não publicado.' },
        { status: 404 }
      )
    }

    const row = pkg as HubPackageRow

    let split
    try {
      split = computePackageSplit({
        row,
        mealPlan: body.mealPlan,
        players: body.players,
        singleRooms: body.singleRooms,
      })
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Erro no cálculo do split' },
        { status: 400 }
      )
    }

    const { data: hotel, error: hotelErr } = await db
      .from('partners')
      .select('id, name, stripe_account_id, stripe_connect_status')
      .eq('id', split.hotelPartnerId)
      .maybeSingle()

    if (hotelErr || !hotel) {
      return NextResponse.json(
        { error: hotelErr?.message || 'Hotel do pacote não encontrado.' },
        { status: 404 }
      )
    }
    if (!hotel.stripe_account_id || hotel.stripe_connect_status !== 'active') {
      return NextResponse.json(
        {
          error:
            'O hotel do pacote ainda não está active no Stripe Connect.',
          partnerId: hotel.id,
          stripeConnectStatus: hotel.stripe_connect_status || 'not_connected',
        },
        { status: 409 }
      )
    }

    let transferPartner: {
      id: string
      name: string
      stripe_account_id: string | null
      stripe_connect_status: string | null
    } | null = null

    if (split.transferCents > 0 && split.transferPartnerId) {
      const { data: tp, error: tpErr } = await db
        .from('partners')
        .select('id, name, stripe_account_id, stripe_connect_status')
        .eq('id', split.transferPartnerId)
        .maybeSingle()

      if (tpErr || !tp) {
        return NextResponse.json(
          { error: tpErr?.message || 'Parceiro de transfer do pacote não encontrado.' },
          { status: 404 }
        )
      }
      if (!tp.stripe_account_id || tp.stripe_connect_status !== 'active') {
        return NextResponse.json(
          {
            error:
              'O parceiro de transfers do pacote ainda não está active no Stripe Connect.',
            partnerId: tp.id,
            stripeConnectStatus: tp.stripe_connect_status || 'not_connected',
          },
          { status: 409 }
        )
      }
      transferPartner = tp
    }

    const { data: booking, error: bookingError } = await db
      .from('package_bookings')
      .insert({
        hub_package_id: row.id,
        hotel_partner_id: hotel.id,
        transfer_partner_id: transferPartner?.id || null,
        customer_name: body.customerName,
        customer_email: body.customerEmail.toLowerCase(),
        customer_phone: body.customerPhone || null,
        currency: body.currency.toUpperCase(),
        padel_service_amount_cents: split.padelServiceCents,
        hotel_amount_cents: split.hotelCents,
        transfer_amount_cents: split.transferCents,
        total_amount_cents: split.totalCents,
        status: 'pending',
        metadata: {
          ...(body.metadata || {}),
          meal_plan: body.mealPlan,
          players: String(body.players),
          single_rooms: String(body.singleRooms),
          package_name: row.name,
        },
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        {
          error:
            bookingError?.message ||
            'Erro ao criar package_booking. Corre as migrations Stripe Connect.',
        },
        { status: 500 }
      )
    }

    const transferGroup = `pkg_${booking.id}`
    const siteUrl = await getSiteUrl()
    const successUrl =
      body.successUrl ||
      `${siteUrl}/eventos/sucesso?session_id={CHECKOUT_SESSION_ID}&kind=package`
    const cancelUrl = body.cancelUrl || `${siteUrl}/construir?cancelado=1`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: body.customerEmail.toLowerCase(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: body.currency,
            unit_amount: split.totalCents,
            product_data: {
              name: `${row.name} — ${body.players} pax`,
              description: [
                `${body.mealPlan.toUpperCase()} · ${split.playersInDouble}×duplo + ${split.playersInSingle}×single`,
                `Hotel ${hotel.name}: ${(split.hotelCents / 100).toFixed(2)} €`,
                split.transferCents > 0 && transferPartner
                  ? `Transfer ${transferPartner.name}: ${(split.transferCents / 100).toFixed(2)} €`
                  : null,
                `Plataforma: ${(split.padelServiceCents / 100).toFixed(2)} €`,
              ]
                .filter(Boolean)
                .join(' · '),
            },
          },
        },
      ],
      payment_intent_data: {
        transfer_group: transferGroup,
        metadata: {
          package_booking_id: booking.id,
          hub_package_id: row.id,
          hotel_partner_id: hotel.id,
          transfer_partner_id: transferPartner?.id || '',
        },
      },
      metadata: {
        package_booking_id: booking.id,
        kind: 'package_split',
        hub_package_id: row.id,
        hotel_partner_id: hotel.id,
        transfer_partner_id: transferPartner?.id || '',
        ...(body.metadata || {}),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    await db
      .from('package_bookings')
      .update({
        stripe_checkout_session_id: session.id,
        stripe_transfer_group: transferGroup,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      bookingId: booking.id,
      transferGroup,
      amounts: {
        currency: body.currency,
        totalCents: split.totalCents,
        padelServiceCents: split.padelServiceCents,
        hotelCents: split.hotelCents,
        transferCents: split.transferCents,
        hotelPercent: Number(row.split_hotel_percent || 0),
        transferPercent: Number(row.split_transfer_percent || 0),
        platformPercent:
          100 -
          Number(row.split_hotel_percent || 0) -
          Number(row.split_transfer_percent || 0),
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro no checkout Connect'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
