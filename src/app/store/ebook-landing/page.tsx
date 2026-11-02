import type { Metadata } from 'next'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'
import {
  EbookLandingClient,
  type EbookLandingCopy,
} from '@/components/store/ebook-landing-client'
import { getLocale } from '@/i18n/get-locale'
import type { Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

const COPY: Record<Locale, EbookLandingCopy> = {
  pt: {
    ebookLabel: 'Ebook Gratuito',
    heroTitle: 'O Guia Completo de Equipamento de Padel',
    heroSubtitleHtml:
      'Descubra <span>o que realmente faz diferença</span> no teu equipamento e como escolher as melhores raquetes, protetores, sapatilhas e acessórios para elevar o teu jogo.',
    benefits: [
      {
        title: 'Tipos de Raquetes:',
        text: 'Aprende qual é a ideal para o teu estilo de jogo',
      },
      {
        title: 'Protetores Essenciais:',
        text: 'Protege a tua raquete e prolonga a sua vida útil',
      },
      {
        title: 'Sapatilhas Certas:',
        text: 'Evita lesões e melhora a tua performance',
      },
      {
        title: 'Acessórios que Fazem a Diferença:',
        text: 'Overgrips, bolsas, e muito mais',
      },
      {
        title: 'Dicas de Manutenção:',
        text: 'Mantém o teu equipamento em condições perfeitas',
      },
    ],
    bonusLabel: 'Bónus Exclusivo:',
    bonusText: 'Acesso a descontos especiais na SportsEvents Store',
    formTitle: 'Download Gratuito',
    formSubtitle: 'Recebe o ebook imediatamente no teu navegador',
    nameLabel: 'Nome Completo *',
    namePlaceholder: 'João Silva',
    emailLabel: 'Email *',
    emailPlaceholder: 'joao@exemplo.com',
    phoneLabel: 'Telemóvel (opcional)',
    phonePlaceholder: '+351 912 345 678',
    newsletterText:
      'Quero receber dicas exclusivas de padel e ofertas especiais da SportsEvents',
    submitButton: 'Descarregar Ebook Grátis',
    processing: 'A processar…',
    gdprText:
      'Ao descarregar, concordas em receber emails da SportsEvents. Podes cancelar a subscrição a qualquer momento.',
    successTitle: 'Ebook Enviado!',
    successText:
      'O Ebook chegou numa nova tab do teu navegador — podes descarregá-lo à vontade.',
    visitStoreButton: 'Visitar a Loja',
    trustedBy: 'Trusted by',
    players: '+ de 5.000 jogadores',
    premiumProducts: 'Produtos Premium',
    freeShipping: 'Envio Grátis +100€',
    icons: [
      {
        title: 'Melhora a Tua Performance',
        text: 'Descobre como o equipamento certo pode transformar o teu jogo',
      },
      {
        title: 'Conselhos de Especialistas',
        text: 'Informação validada por jogadores profissionais',
      },
      {
        title: 'Poupa Dinheiro',
        text: 'Evita compras erradas e investe no que realmente importa',
      },
    ],
    errorGeneric: 'Erro ao processar o pedido. Por favor, tenta novamente.',
  },
  en: {
    ebookLabel: 'Free Ebook',
    heroTitle: 'The Complete Padel Equipment Guide',
    heroSubtitleHtml:
      'Discover <span>what really makes a difference</span> in your equipment and how to choose the best rackets, protectors, shoes and accessories to elevate your game.',
    benefits: [
      { title: 'Racket Types:', text: 'Learn which is ideal for your playing style' },
      {
        title: 'Essential Protectors:',
        text: 'Protect your racket and extend its lifespan',
      },
      { title: 'Right Shoes:', text: 'Avoid injuries and improve your performance' },
      {
        title: 'Accessories That Make a Difference:',
        text: 'Overgrips, bags, and much more',
      },
      {
        title: 'Maintenance Tips:',
        text: 'Keep your equipment in perfect condition',
      },
    ],
    bonusLabel: 'Exclusive Bonus:',
    bonusText: 'Access to special discounts at the SportsEvents Store',
    formTitle: 'Free Download',
    formSubtitle: 'Receive the ebook immediately in your browser',
    nameLabel: 'Full Name *',
    namePlaceholder: 'John Smith',
    emailLabel: 'Email *',
    emailPlaceholder: 'john@example.com',
    phoneLabel: 'Phone (optional)',
    phonePlaceholder: '+44 7700 900000',
    newsletterText:
      'I want to receive exclusive padel tips and special offers from SportsEvents',
    submitButton: 'Download Free Ebook',
    processing: 'Processing…',
    gdprText:
      'By downloading, you agree to receive emails from SportsEvents. You can unsubscribe at any time.',
    successTitle: 'Ebook Sent!',
    successText:
      'The ebook opened in a new browser tab — feel free to download it.',
    visitStoreButton: 'Visit the Store',
    trustedBy: 'Trusted by',
    players: '+ 5,000 players',
    premiumProducts: 'Premium Products',
    freeShipping: 'Free Shipping +€100',
    icons: [
      {
        title: 'Improve Your Performance',
        text: 'Discover how the right equipment can transform your game',
      },
      {
        title: 'Expert Advice',
        text: 'Information validated by professional players',
      },
      {
        title: 'Save Money',
        text: 'Avoid wrong purchases and invest in what really matters',
      },
    ],
    errorGeneric: 'Something went wrong. Please try again.',
  },
  es: {
    ebookLabel: 'Ebook Gratuito',
    heroTitle: 'La Guía Completa de Equipamiento de Pádel',
    heroSubtitleHtml:
      'Descubre <span>lo que realmente marca la diferencia</span> en tu equipamiento y cómo elegir las mejores palas, protectores, zapatillas y accesorios para elevar tu juego.',
    benefits: [
      {
        title: 'Tipos de Palas:',
        text: 'Aprende cuál es la ideal para tu estilo de juego',
      },
      {
        title: 'Protectores Esenciales:',
        text: 'Protege tu pala y prolonga su vida útil',
      },
      {
        title: 'Zapatillas Correctas:',
        text: 'Evita lesiones y mejora tu rendimiento',
      },
      {
        title: 'Accesorios que Marcan la Diferencia:',
        text: 'Overgrips, bolsas, y mucho más',
      },
      {
        title: 'Consejos de Mantenimiento:',
        text: 'Mantén tu equipamiento en perfectas condiciones',
      },
    ],
    bonusLabel: 'Bonus Exclusivo:',
    bonusText: 'Acceso a descuentos especiales en SportsEvents Store',
    formTitle: 'Descarga Gratuita',
    formSubtitle: 'Recibe el ebook inmediatamente en tu navegador',
    nameLabel: 'Nombre Completo *',
    namePlaceholder: 'Juan García',
    emailLabel: 'Email *',
    emailPlaceholder: 'juan@ejemplo.com',
    phoneLabel: 'Teléfono (opcional)',
    phonePlaceholder: '+34 612 345 678',
    newsletterText:
      'Quiero recibir consejos exclusivos de pádel y ofertas especiales de SportsEvents',
    submitButton: 'Descargar Ebook Gratis',
    processing: 'Procesando…',
    gdprText:
      'Al descargar, aceptas recibir emails de SportsEvents. Puedes cancelar la suscripción en cualquier momento.',
    successTitle: '¡Ebook Enviado!',
    successText:
      'El ebook se abrió en una nueva pestaña — puedes descargarlo cuando quieras.',
    visitStoreButton: 'Visitar la Tienda',
    trustedBy: 'Trusted by',
    players: '+ de 5.000 jugadores',
    premiumProducts: 'Productos Premium',
    freeShipping: 'Envío Gratis +100€',
    icons: [
      {
        title: 'Mejora Tu Rendimiento',
        text: 'Descubre cómo el equipamiento correcto puede transformar tu juego',
      },
      {
        title: 'Consejos de Expertos',
        text: 'Información validada por jugadores profesionales',
      },
      {
        title: 'Ahorra Dinero',
        text: 'Evita compras equivocadas e invierte en lo que importa',
      },
    ],
    errorGeneric: 'Error al procesar. Inténtalo de nuevo.',
  },
  fr: {
    ebookLabel: 'Ebook Gratuit',
    heroTitle: 'Le Guide Complet de l’Équipement de Padel',
    heroSubtitleHtml:
      'Découvrez <span>ce qui fait vraiment la différence</span> dans votre équipement et comment choisir les meilleures raquettes, protecteurs, chaussures et accessoires.',
    benefits: [
      {
        title: 'Types de Raquettes:',
        text: 'Apprenez laquelle convient à votre style de jeu',
      },
      {
        title: 'Protecteurs Essentiels:',
        text: 'Protégez votre raquette et prolongez sa durée de vie',
      },
      {
        title: 'Bonnes Chaussures:',
        text: 'Évitez les blessures et améliorez vos performances',
      },
      {
        title: 'Accessoires qui Font la Différence:',
        text: 'Overgrips, sacs, et bien plus',
      },
      {
        title: 'Conseils d’Entretien:',
        text: 'Gardez votre équipement en parfait état',
      },
    ],
    bonusLabel: 'Bonus Exclusif:',
    bonusText: 'Accès à des réductions spéciales sur SportsEvents Store',
    formTitle: 'Téléchargement Gratuit',
    formSubtitle: 'Recevez l’ebook immédiatement dans votre navigateur',
    nameLabel: 'Nom Complet *',
    namePlaceholder: 'Jean Dupont',
    emailLabel: 'Email *',
    emailPlaceholder: 'jean@exemple.com',
    phoneLabel: 'Téléphone (optionnel)',
    phonePlaceholder: '+33 6 12 34 56 78',
    newsletterText:
      'Je souhaite recevoir des conseils exclusifs de padel et des offres SportsEvents',
    submitButton: 'Télécharger l’Ebook Gratuit',
    processing: 'Traitement…',
    gdprText:
      'En téléchargeant, vous acceptez de recevoir des emails de SportsEvents. Désabonnement possible à tout moment.',
    successTitle: 'Ebook Envoyé!',
    successText:
      'L’ebook s’est ouvert dans un nouvel onglet — téléchargez-le librement.',
    visitStoreButton: 'Visiter la Boutique',
    trustedBy: 'Trusted by',
    players: '+ de 5 000 joueurs',
    premiumProducts: 'Produits Premium',
    freeShipping: 'Livraison Gratuite +100€',
    icons: [
      {
        title: 'Améliorez Vos Performances',
        text: 'Découvrez comment le bon équipement transforme votre jeu',
      },
      {
        title: 'Conseils d’Experts',
        text: 'Informations validées par des joueurs professionnels',
      },
      {
        title: 'Économisez',
        text: 'Évitez les mauvais achats et investissez utilement',
      },
    ],
    errorGeneric: 'Erreur. Veuillez réessayer.',
  },
  de: {
    ebookLabel: 'Kostenloses Ebook',
    heroTitle: 'Der komplette Padel-Ausrüstungsguide',
    heroSubtitleHtml:
      'Entdecke <span>was wirklich den Unterschied macht</span> bei deiner Ausrüstung und wie du die besten Schläger, Protektoren, Schuhe und Accessoires wählst.',
    benefits: [
      {
        title: 'Schlägertypen:',
        text: 'Lerne, welcher zu deinem Spielstil passt',
      },
      {
        title: 'Essenzielle Protektoren:',
        text: 'Schütze deinen Schläger und verlängere seine Lebensdauer',
      },
      {
        title: 'Richtige Schuhe:',
        text: 'Vermeide Verletzungen und verbessere deine Leistung',
      },
      {
        title: 'Accessoires mit Wirkung:',
        text: 'Overgrips, Taschen und vieles mehr',
      },
      {
        title: 'Pflegetipps:',
        text: 'Halte deine Ausrüstung in perfektem Zustand',
      },
    ],
    bonusLabel: 'Exklusiver Bonus:',
    bonusText: 'Zugang zu Sonderangeboten im SportsEvents Store',
    formTitle: 'Kostenloser Download',
    formSubtitle: 'Erhalte das Ebook sofort in deinem Browser',
    nameLabel: 'Vollständiger Name *',
    namePlaceholder: 'Max Mustermann',
    emailLabel: 'Email *',
    emailPlaceholder: 'max@beispiel.com',
    phoneLabel: 'Telefon (optional)',
    phonePlaceholder: '+49 170 1234567',
    newsletterText:
      'Ich möchte exklusive Padel-Tipps und Angebote von SportsEvents erhalten',
    submitButton: 'Kostenloses Ebook herunterladen',
    processing: 'Wird verarbeitet…',
    gdprText:
      'Mit dem Download stimmst du E-Mails von SportsEvents zu. Abmeldung jederzeit möglich.',
    successTitle: 'Ebook gesendet!',
    successText:
      'Das Ebook wurde in einem neuen Tab geöffnet — lade es gerne herunter.',
    visitStoreButton: 'Zum Store',
    trustedBy: 'Trusted by',
    players: '+ 5.000 Spieler',
    premiumProducts: 'Premium-Produkte',
    freeShipping: 'Gratisversand ab 100€',
    icons: [
      {
        title: 'Leistung steigern',
        text: 'Entdecke, wie die richtige Ausrüstung dein Spiel verändert',
      },
      {
        title: 'Expertenrat',
        text: 'Von Profispielern validierte Informationen',
      },
      {
        title: 'Geld sparen',
        text: 'Vermeide Fehlkäufe und investiere richtig',
      },
    ],
    errorGeneric: 'Fehler. Bitte erneut versuchen.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const titles: Record<Locale, string> = {
    pt: 'Guia Completo de Equipamento de Padel — Ebook Gratuito | SportsEvents',
    en: 'Complete Padel Equipment Guide — Free Ebook | SportsEvents',
    es: 'Guía Completa de Equipamiento de Pádel — Ebook Gratuito | SportsEvents',
    fr: 'Guide Complet de l’Équipement de Padel — Ebook Gratuit | SportsEvents',
    de: 'Kompletter Padel-Ausrüstungsguide — Kostenloses Ebook | SportsEvents',
  }
  return {
    title: titles[locale] || titles.en,
    description:
      'Download gratuito do guia completo de equipamento de padel — raquetes, protetores, sapatilhas e acessórios.',
  }
}

export default async function EbookLandingPage() {
  const locale = await getLocale()
  const copy = COPY[locale] || COPY.en

  return (
    <div className="min-h-screen bg-navy text-app-white">
      <SiteHeader />
      <main>
        <EbookLandingClient locale={locale} copy={copy} />
      </main>
      <SiteFooter />
    </div>
  )
}
