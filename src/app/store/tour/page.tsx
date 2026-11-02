import type { Metadata } from 'next'
import { TourLandingClient } from '@/components/store/tour-landing-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:
    'PADEL ONE Tour | Plataforma de Gestão de Torneios para Organizadores',
  description:
    'Organiza torneios de padel profissionais sem precisar de um clube. Americanos, Grupos, Eliminatórias, Ligas. Inscrições online, pagamentos integrados e scheduling automático.',
}

export default function StoreTourLandingPage() {
  return <TourLandingClient />
}
