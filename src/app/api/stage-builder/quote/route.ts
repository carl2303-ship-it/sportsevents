import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  estimateStage,
  summarizeConfig,
} from '@/lib/stage-builder/estimate'
import type { StageBuilderConfig } from '@/lib/stage-builder/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { config: StageBuilderConfig }
    const config = body.config
    if (!config?.clientName?.trim() || !config?.clientEmail?.trim()) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios.' },
        { status: 400 }
      )
    }
    if (!config.hub || !config.players || !config.nights) {
      return NextResponse.json(
        { error: 'Configuração incompleta.' },
        { status: 400 }
      )
    }

    const estimate = estimateStage(config)
    const supabase = await createClient()

    const { data: destinations } = await supabase
      .from('destinations')
      .select('id, code')
    const dest =
      destinations?.find((d) => d.code === config.hub) ||
      destinations?.find(
        (d) =>
          (config.hub === 'ALG' && d.code === 'ALGARVE') ||
          (config.hub === 'MAR' && d.code === 'MRB')
      )

    const { data: sports } = await supabase
      .from('sports')
      .select('id, name')
    const padel = sports?.find((s) =>
      String(s.name).toLowerCase().includes('padel')
    )

    const year = new Date().getFullYear()
    const monthIndex = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ].indexOf(config.month)
    const estimatedDate =
      monthIndex >= 0
        ? `${year}-${String(monthIndex + 1).padStart(2, '0')}-15`
        : null

    const assignedTo = config.hub === 'ALG' ? 'PAI' : 'FILHO'

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        client_name: config.clientName.trim(),
        client_email: config.clientEmail.trim().toLowerCase(),
        client_phone: config.clientPhone || null,
        company_or_club: config.companyOrClub || null,
        language: config.lessonLanguage,
        sport_id: padel?.id || null,
        destination_id: dest?.id || null,
        group_size: Number(config.players) + Number(config.companions || 0),
        estimated_date: estimatedDate,
        estimated_revenue: estimate.grandTotal,
        estimated_price_per_person: estimate.pricePerPlayerDouble,
        probability: 40,
        assigned_to: assignedTo,
        status: 'NOVO',
        source: 'stage_builder',
        builder_config: config,
        notes: `Pedido via Construtor de Estágio\n\n${summarizeConfig(config)}\n\nEstimativa: ${estimate.pricePerPlayerDouble} €/jogador (duplo) · ${estimate.pricePerPlayerSingle} €/jogador (single) · Total grupo ${estimate.grandTotal} €`,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      estimate,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao enviar pedido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
