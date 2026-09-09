import type {
  HotelStars,
  MealPlan,
  StageBuilderConfig,
  StageHub,
} from './types'

/** Base € / pessoa / noite em quarto duplo (BB), por hub + categoria. */
const HUB_BASE_NIGHT: Record<StageHub, Record<HotelStars, number>> = {
  ALG: { '4': 135, '5': 175 },
  BCN: { '4': 160, '5': 210 },
  MAR: { '4': 170, '5': 230 },
}

const MEAL_SUPPLEMENT_NIGHT: Record<MealPlan, number> = {
  BB: 0,
  HB: 35,
  FB: 55,
}

const TRAINING_HOUR = 28
const MATCH_HOUR = 18
const TOURNAMENT_FEE = 45
const TRANSFER_FEE = 55
const COMPANION_FACTOR = 0.65
const SINGLE_SUPPLEMENT_NIGHT = 48

export type StageEstimate = {
  /** Por jogador em quarto duplo */
  pricePerPlayerDouble: number
  /** Por jogador em quarto single */
  pricePerPlayerSingle: number
  pricePerCompanion: number
  playersInDouble: number
  playersInSingle: number
  grandTotal: number
  currency: 'EUR'
}

export function estimateStage(config: StageBuilderConfig): StageEstimate {
  const nights = Math.max(1, config.nights)
  const players = Math.max(1, config.players)
  const companions = Math.max(0, config.companions)
  const singleRooms = Math.max(0, Math.min(config.singleRooms, players))

  const baseNight = HUB_BASE_NIGHT[config.hub][config.hotelStars]
  const meal = MEAL_SUPPLEMENT_NIGHT[config.mealPlan]
  const program =
    config.trainingHours * TRAINING_HOUR +
    config.matchHours * MATCH_HOUR +
    (config.tournament ? TOURNAMENT_FEE : 0) +
    (config.airportTransfer ? TRANSFER_FEE : 0)

  const lodgingDouble = (baseNight + meal) * nights
  const lodgingSingle =
    (baseNight + meal + SINGLE_SUPPLEMENT_NIGHT) * nights

  const pricePerPlayerDouble = Math.round(lodgingDouble + program)
  const pricePerPlayerSingle = Math.round(lodgingSingle + program)

  const companionLodging =
    (baseNight * 0.9 + meal) * nights * COMPANION_FACTOR
  const pricePerCompanion = Math.round(
    companionLodging + (config.airportTransfer ? TRANSFER_FEE * 0.8 : 0)
  )

  const playersInSingle = singleRooms
  const playersInDouble = players - playersInSingle

  const grandTotal =
    playersInDouble * pricePerPlayerDouble +
    playersInSingle * pricePerPlayerSingle +
    companions * pricePerCompanion

  return {
    pricePerPlayerDouble,
    pricePerPlayerSingle,
    pricePerCompanion,
    playersInDouble,
    playersInSingle,
    grandTotal,
    currency: 'EUR',
  }
}

export function summarizeConfig(config: StageBuilderConfig): string {
  const hub =
    config.hub === 'ALG'
      ? 'Algarve'
      : config.hub === 'BCN'
        ? 'Barcelona'
        : 'Marbella'
  return [
    `Hub: ${hub}`,
    `Hotel: ${config.hotelStars}★`,
    `Tipo: ${config.groupType}`,
    `Mês: ${config.month}`,
    `Jogadores: ${config.players}`,
    `Acompanhantes: ${config.companions}`,
    `Noites: ${config.nights}`,
    `Quartos single: ${config.singleRooms}`,
    `Treino: ${config.trainingHours}h`,
    `Jogos: ${config.matchHours}h`,
    `Torneio: ${config.tournament ? 'Sim' : 'Não'}`,
    `Transfer: ${config.airportTransfer ? 'Sim' : 'Não'}`,
    `Pensão: ${config.mealPlan}`,
    `Língua aulas: ${config.lessonLanguage}`,
    `Nível: ${config.playLevel}`,
    config.notes ? `Notas: ${config.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}
