export type StageHub = 'ALG' | 'BCN' | 'MAR'
export type MealPlan = 'BB' | 'HB' | 'FB'
export type LessonLang = 'pt' | 'es' | 'en' | 'fr'
export type PlayLevel = 'INICIANTE' | 'INTERMEDIO' | 'AVANCADO' | 'MISTO'
export type GroupType = 'CLUBE' | 'CORPORATE' | 'PRIVADO'
export type HotelStars = '4' | '5'

export type StageBuilderConfig = {
  hub: StageHub
  groupType: GroupType
  month: string
  players: number
  companions: number
  nights: number
  trainingHours: number
  matchHours: number
  tournament: boolean
  airportTransfer: boolean
  mealPlan: MealPlan
  singleRooms: number
  hotelStars: HotelStars
  lessonLanguage: LessonLang
  playLevel: PlayLevel
  notes: string
  clientName: string
  clientEmail: string
  clientPhone: string
  companyOrClub: string
}

export const HUB_OPTIONS: {
  value: StageHub
  label: string
  flag: string
  blurb: string
}[] = [
  {
    value: 'ALG',
    label: 'Algarve',
    flag: '🇵🇹',
    blurb: 'Flagship Amendoeira · sol e hospitalidade portuguesa',
  },
  {
    value: 'BCN',
    label: 'Barcelona',
    flag: '🇪🇸',
    blurb: 'Urbano & corporate · energia cosmopolita',
  },
  {
    value: 'MAR',
    label: 'Marbella',
    flag: '🇪🇸',
    blurb: 'Costa del Sol · luxo e padel de elite',
  },
]

export const GROUP_TYPE_OPTIONS: { value: GroupType; label: string; blurb: string }[] =
  [
    { value: 'CLUBE', label: 'Clube / Academia', blurb: 'Viagem anual de sócios' },
    { value: 'CORPORATE', label: 'Corporate / Teambuilding', blurb: 'Empresa & networking' },
    { value: 'PRIVADO', label: 'Grupo privado', blurb: 'Amigos / fecho de época' },
  ]

export const MONTH_OPTIONS = [
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
]

export const MEAL_OPTIONS: { value: MealPlan; label: string; blurb: string }[] = [
  { value: 'BB', label: 'Pequeno-almoço', blurb: 'Bed & Breakfast' },
  { value: 'HB', label: 'Meia pensão', blurb: 'Pequeno-almoço + jantar' },
  { value: 'FB', label: 'Pensão completa', blurb: 'Todas as refeições' },
]

export const HOTEL_STAR_OPTIONS: {
  value: HotelStars
  label: string
  blurb: string
}[] = [
  {
    value: '4',
    label: 'Hotel 4★',
    blurb: 'Conforto premium · boa relação qualidade/preço',
  },
  {
    value: '5',
    label: 'Hotel 5★',
    blurb: 'Luxo e serviço VIP · resorts / Meliá premium',
  },
]

export const LANG_OPTIONS: { value: LessonLang; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
]

export const LEVEL_OPTIONS: { value: PlayLevel; label: string }[] = [
  { value: 'INICIANTE', label: 'Iniciante' },
  { value: 'INTERMEDIO', label: 'Intermédio' },
  { value: 'AVANCADO', label: 'Avançado' },
  { value: 'MISTO', label: 'Grupo misto' },
]

export const DEFAULT_STAGE_CONFIG: StageBuilderConfig = {
  hub: 'ALG',
  groupType: 'CLUBE',
  month: 'Maio',
  players: 12,
  companions: 0,
  nights: 4,
  trainingHours: 8,
  matchHours: 6,
  tournament: true,
  airportTransfer: true,
  mealPlan: 'HB',
  singleRooms: 2,
  hotelStars: '4',
  lessonLanguage: 'en',
  playLevel: 'MISTO',
  notes: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  companyOrClub: '',
}

export const BUILDER_STEPS = [
  { id: 'destino', label: 'Destino' },
  { id: 'grupo', label: 'Grupo' },
  { id: 'programa', label: 'Programa' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'contacto', label: 'Contacto' },
] as const
