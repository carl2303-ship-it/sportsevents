export const DEFAULT_LANGUAGE = 'pt';

import { shortDescriptionI18n } from './product-short-i18n.js';
import { productTranslationsById } from './product-translations.js';

/** Lang must be passed explicitly from Next locale. */
function getCurrentLanguage() {
  return DEFAULT_LANGUAGE;
}

/**
 * Resolve a localized field from a row with optional `translations` JSONB.
 * Fallback order: JSONB → by-id catalog → short-description map → phrase heuristics → PT.
 */
export function localizeField(row, field, lang = getCurrentLanguage()) {
  if (!row) return '';

  if (lang && lang !== DEFAULT_LANGUAGE && row.translations) {
    const localized = row.translations[lang]?.[field];
    if (localized != null && localized !== '') {
      return localized;
    }
  }

  if (lang && lang !== DEFAULT_LANGUAGE && row.id && productTranslationsById?.[row.id]?.[lang]?.[field]) {
    const fromCatalog = productTranslationsById[row.id][lang][field];
    if (fromCatalog != null && fromCatalog !== '') {
      return fromCatalog;
    }
  }

  const base = row[field] ?? '';
  if (!base || lang === DEFAULT_LANGUAGE) return base;

  if (field === 'short_description') {
    const mapped = shortDescriptionI18n[String(base).trim()]?.[lang];
    if (mapped) return mapped;
  }

  if (field === 'name' || field === 'short_description' || field === 'description' || field === 'title' || field === 'excerpt') {
    return applyPhraseMap(String(base), lang);
  }

  return base;
}

/** Common PT → locale phrase swaps for catalog labels when JSONB is empty */
const PHRASE_MAPS = {
  en: [
    [/Descrição do Produto/gi, 'Product Description'],
    [/O Escudo de Carbono Definitivo para a Sua Raquete/gi, 'The Ultimate Carbon Shield for Your Racket'],
    [/O Escudo de Carbono Definitivo para a Tua Raquete/gi, 'The Ultimate Carbon Shield for Your Racket'],
    [/Investiu numa raquete de alta performance\?/gi, 'Invested in a high-performance racket?'],
    [/Proteja esse investimento/gi, 'Protect that investment'],
    [/Envia um email para/gi, 'Send an email to'],
    [/com o teu logo e o teu texto/gi, 'with your logo and your text'],
    [/PACK 3 Unidades/gi, 'PACK of 3 Units'],
    [/Reparamos a tua Raquete/gi, 'We repair your racket'],
    [/Todas as Marcas e Modelos/gi, 'All Brands and Models'],
    [/Contacta-nos/gi, 'Contact us'],
    [/Orçamento Gratuitamente/gi, 'a free quote'],
    [/hidratos de carbono/gi, 'carbohydrates'],
    [/eletrólitos/gi, 'electrolytes'],
    [/exercício intenso/gi, 'intense exercise'],
    [/atletas de endurance/gi, 'endurance athletes'],
    [/alto desempenho/gi, 'high performance'],
    [/aderência/gi, 'grip'],
    [/raquete de padel/gi, 'padel racket'],
    [/O Guia Completo de Equipamento do Padel/gi, 'The Complete Padel Equipment Guide'],
    [/O SISTEMA TÁTICO DEFINITIVO/gi, 'THE DEFINITIVE TACTICAL SYSTEM'],
    [/O Sistema de Confiança para o Padel/gi, 'The Confidence System for Padel'],
    [/Aplicação de Gestão de Torneios de Padel/gi, 'Padel Tournament Management App'],
    [/Fitness Bandas elásticas com saco de armazenamento/gi, 'Fitness Resistance Bands with storage bag'],
    [/Cinta de proteção para joelhos,?\s*Ajustável/gi, 'Adjustable Knee Support Brace'],
    [/Fita de Fixação para Cotovelo/gi, 'Elbow Support Tape'],
    [/Reparação Raquete Padel Carbono/gi, 'Carbon Padel Racket Repair'],
    [/Protetor Boost Padel Carbono 3K/gi, 'Boost Padel Carbon 3K Protector'],
    [/PERSONALIZADO/gi, 'CUSTOM'],
    [/Sabor Chocolate-Caramelo/gi, 'Chocolate-Caramel Flavor'],
    [/Sabor Choco-Canela/gi, 'Choco-Cinnamon Flavor'],
    [/Sabor Nougat Baunilha-Nozes/gi, 'Vanilla-Nut Nougat Flavor'],
    [/Sabor Maçã/gi, 'Apple Flavor'],
    [/Sabor Limão/gi, 'Lemon Flavor'],
    [/Sabor Laranja/gi, 'Orange Flavor'],
    [/Sabor Morango/gi, 'Strawberry Flavor'],
    [/Box de (\d+) Barras/gi, 'Box of $1 Bars'],
    [/Box (\d+) Barras/gi, 'Box of $1 Bars'],
    [/BOX (\d+) unidades/gi, 'BOX of $1 units'],
    [/Barra/gi, 'Bar'],
    [/Barras/gi, 'Bars'],
    [/Ebook/gi, 'Ebook'],
    [/Video Ebook/gi, 'Video Ebook'],
    [/PACK (\d+)/gi, 'PACK $1'],
    [/Carbono/gi, 'Carbon']
  ],
  es: [
    [/Descrição do Produto/gi, 'Descripción del Producto'],
    [/O Escudo de Carbono Definitivo para a Sua Raquete/gi, 'El Escudo de Carbono Definitivo para Tu Pala'],
    [/O Escudo de Carbono Definitivo para a Tua Raquete/gi, 'El Escudo de Carbono Definitivo para Tu Pala'],
    [/Investiu numa raquete de alta performance\?/gi, '¿Invertiste en una pala de alto rendimiento?'],
    [/Proteja esse investimento/gi, 'Protege esa inversión'],
    [/Envia um email para/gi, 'Envía un email a'],
    [/com o teu logo e o teu texto/gi, 'con tu logo y tu texto'],
    [/PACK 3 Unidades/gi, 'PACK 3 Unidades'],
    [/Reparamos a tua Raquete/gi, 'Reparamos tu pala'],
    [/Todas as Marcas e Modelos/gi, 'Todas las Marcas y Modelos'],
    [/Contacta-nos/gi, 'Contáctanos'],
    [/Orçamento Gratuitamente/gi, 'presupuesto gratis'],
    [/hidratos de carbono/gi, 'hidratos de carbono'],
    [/eletrólitos/gi, 'electrolitos'],
    [/exercício intenso/gi, 'ejercicio intenso'],
    [/atletas de endurance/gi, 'atletas de endurance'],
    [/alto desempenho/gi, 'alto rendimiento'],
    [/aderência/gi, 'agarre'],
    [/raquete de padel/gi, 'pala de pádel'],
    [/O Guia Completo de Equipamento do Padel/gi, 'La Guía Completa de Equipamiento de Pádel'],
    [/O SISTEMA TÁTICO DEFINITIVO/gi, 'EL SISTEMA TÁCTICO DEFINITIVO'],
    [/O Sistema de Confiança para o Padel/gi, 'El Sistema de Confianza para el Pádel'],
    [/Aplicação de Gestão de Torneios de Padel/gi, 'App de Gestión de Torneos de Pádel'],
    [/Fitness Bandas elásticas com saco de armazenamento/gi, 'Bandas elásticas fitness con bolsa de almacenamiento'],
    [/Cinta de proteção para joelhos,?\s*Ajustável/gi, 'Cinta de protección para rodillas, Ajustable'],
    [/Fita de Fixação para Cotovelo/gi, 'Cinta de Fijación para Codo'],
    [/Reparação Raquete Padel Carbono/gi, 'Reparación Pala Pádel Carbono'],
    [/Protetor Boost Padel Carbono 3K/gi, 'Protector Boost Padel Carbono 3K'],
    [/PERSONALIZADO/gi, 'PERSONALIZADO'],
    [/Sabor Chocolate-Caramelo/gi, 'Sabor Chocolate-Caramelo'],
    [/Sabor Choco-Canela/gi, 'Sabor Choco-Canela'],
    [/Sabor Nougat Baunilha-Nozes/gi, 'Sabor Nougat Vainilla-Nueces'],
    [/Sabor Maçã/gi, 'Sabor Manzana'],
    [/Sabor Limão/gi, 'Sabor Limón'],
    [/Sabor Laranja/gi, 'Sabor Naranja'],
    [/Sabor Morango/gi, 'Sabor Fresa'],
    [/Box de (\d+) Barras/gi, 'Caja de $1 Barras'],
    [/Box (\d+) Barras/gi, 'Caja de $1 Barras'],
    [/BOX (\d+) unidades/gi, 'BOX $1 unidades'],
    [/joelhos/gi, 'rodillas'],
    [/Cotovelo/gi, 'Codo'],
    [/Raquete/gi, 'Pala']
  ],
  it: [
    [/Descrição do Produto/gi, 'Descrizione del Prodotto'],
    [/O Escudo de Carbono Definitivo para a Sua Raquete/gi, 'Lo Scudo in Carbonio Definitivo per la Tua Racchetta'],
    [/O Escudo de Carbono Definitivo para a Tua Raquete/gi, 'Lo Scudo in Carbonio Definitivo per la Tua Racchetta'],
    [/Investiu numa raquete de alta performance\?/gi, 'Hai investito in una racchetta ad alte prestazioni?'],
    [/Proteja esse investimento/gi, 'Proteggi quell’investimento'],
    [/Envia um email para/gi, 'Invia un’email a'],
    [/com o teu logo e o teu texto/gi, 'con il tuo logo e il tuo testo'],
    [/PACK 3 Unidades/gi, 'PACK 3 Unità'],
    [/Reparamos a tua Raquete/gi, 'Ripariamo la tua racchetta'],
    [/Todas as Marcas e Modelos/gi, 'Tutte le Marche e Modelli'],
    [/Contacta-nos/gi, 'Contattaci'],
    [/Orçamento Gratuitamente/gi, 'preventivo gratuito'],
    [/hidratos de carbono/gi, 'carboidrati'],
    [/eletrólitos/gi, 'elettroliti'],
    [/exercício intenso/gi, 'esercizio intenso'],
    [/atletas de endurance/gi, 'atleti di endurance'],
    [/alto desempenho/gi, 'alte prestazioni'],
    [/aderência/gi, 'grip'],
    [/raquete de padel/gi, 'racchetta da padel'],
    [/O Guia Completo de Equipamento do Padel/gi, 'La Guida Completa all\'Equipaggiamento Padel'],
    [/O SISTEMA TÁTICO DEFINITIVO/gi, 'IL SISTEMA TATTICO DEFINITIVO'],
    [/O Sistema de Confiança para o Padel/gi, 'Il Sistema di Fiducia per il Padel'],
    [/Aplicação de Gestão de Torneios de Padel/gi, 'App di Gestione Tornei di Padel'],
    [/Fitness Bandas elásticas com saco de armazenamento/gi, 'Bande elastiche fitness con sacchetto di riposo'],
    [/Cinta de proteção para joelhos,?\s*Ajustável/gi, 'Fascia di protezione per ginocchia, Regolabile'],
    [/Fita de Fixação para Cotovelo/gi, 'Nastro di Fissaggio per Gomito'],
    [/Reparação Raquete Padel Carbono/gi, 'Riparazione Racchetta Padel Carbonio'],
    [/Protetor Boost Padel Carbono 3K/gi, 'Protezione Boost Padel Carbonio 3K'],
    [/PERSONALIZADO/gi, 'PERSONALIZZATO'],
    [/Sabor Chocolate-Caramelo/gi, 'Gusto Cioccolato-Caramello'],
    [/Sabor Choco-Canela/gi, 'Gusto Choco-Cannella'],
    [/Sabor Nougat Baunilha-Nozes/gi, 'Gusto Nougat Vaniglia-Noci'],
    [/Sabor Maçã/gi, 'Gusto Mela'],
    [/Sabor Limão/gi, 'Gusto Limone'],
    [/Sabor Laranja/gi, 'Gusto Arancia'],
    [/Sabor Morango/gi, 'Gusto Fragola'],
    [/Box de (\d+) Barras/gi, 'Confezione da $1 Barrette'],
    [/Box (\d+) Barras/gi, 'Confezione da $1 Barrette'],
    [/BOX (\d+) unidades/gi, 'BOX $1 unità'],
    [/Barra/gi, 'Barretta'],
    [/Barras/gi, 'Barrette']
  ],
  fr: [
    [/Descrição do Produto/gi, 'Description du Produit'],
    [/O Escudo de Carbono Definitivo para a Sua Raquete/gi, 'Le Bouclier Carbone Ultime pour Votre Raquette'],
    [/O Escudo de Carbono Definitivo para a Tua Raquete/gi, 'Le Bouclier Carbone Ultime pour Votre Raquette'],
    [/Investiu numa raquete de alta performance\?/gi, 'Vous avez investi dans une raquette haute performance?'],
    [/Proteja esse investimento/gi, 'Protégez cet investissement'],
    [/Envia um email para/gi, 'Envoyez un email à'],
    [/com o teu logo e o teu texto/gi, 'avec votre logo et votre texte'],
    [/PACK 3 Unidades/gi, 'PACK 3 Unités'],
    [/Reparamos a tua Raquete/gi, 'Nous réparons votre raquette'],
    [/Todas as Marcas e Modelos/gi, 'Toutes Marques et Modèles'],
    [/Contacta-nos/gi, 'Contactez-nous'],
    [/Orçamento Gratuitamente/gi, 'devis gratuit'],
    [/hidratos de carbono/gi, 'glucides'],
    [/eletrólitos/gi, 'électrolytes'],
    [/exercício intenso/gi, 'exercice intense'],
    [/atletas de endurance/gi, 'athlètes d’endurance'],
    [/alto desempenho/gi, 'haute performance'],
    [/aderência/gi, 'adhérence'],
    [/raquete de padel/gi, 'raquette de padel'],
    [/O Guia Completo de Equipamento do Padel/gi, 'Le Guide Complet de l\'Équipement Padel'],
    [/O SISTEMA TÁTICO DEFINITIVO/gi, 'LE SYSTÈME TACTIQUE DÉFINITIF'],
    [/O Sistema de Confiança para o Padel/gi, 'Le Système de Confiance pour le Padel'],
    [/Aplicação de Gestão de Torneios de Padel/gi, 'Application de Gestion de Tournois de Padel'],
    [/Fitness Bandas elásticas com saco de armazenamento/gi, 'Bandes élastiques fitness avec sac de rangement'],
    [/Cinta de proteção para joelhos,?\s*Ajustável/gi, 'Bande de protection pour genoux, Ajustable'],
    [/Fita de Fixação para Cotovelo/gi, 'Bande de Fixation pour Coude'],
    [/Reparação Raquete Padel Carbono/gi, 'Réparation Raquette Padel Carbone'],
    [/Protetor Boost Padel Carbono 3K/gi, 'Protection Boost Padel Carbone 3K'],
    [/PERSONALIZADO/gi, 'PERSONNALISÉ'],
    [/Sabor Chocolate-Caramelo/gi, 'Saveur Chocolat-Caramel'],
    [/Sabor Choco-Canela/gi, 'Saveur Choco-Cannelle'],
    [/Sabor Nougat Baunilha-Nozes/gi, 'Saveur Nougat Vanille-Noix'],
    [/Sabor Maçã/gi, 'Saveur Pomme'],
    [/Sabor Limão/gi, 'Saveur Citron'],
    [/Sabor Laranja/gi, 'Saveur Orange'],
    [/Sabor Morango/gi, 'Saveur Fraise'],
    [/Box de (\d+) Barras/gi, 'Boîte de $1 Barres'],
    [/Box (\d+) Barras/gi, 'Boîte de $1 Barres'],
    [/BOX (\d+) unidades/gi, 'BOX $1 unités'],
    [/Barra/gi, 'Barre'],
    [/Barras/gi, 'Barres'],
    [/Carbono/gi, 'Carbone']
  ]
};

function applyPhraseMap(text, lang) {
  const rules = PHRASE_MAPS[lang];
  if (!rules) return text;
  let out = text;
  for (const [pattern, replacement] of rules) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

const CATEGORY_I18N = {
  '4on': {
    pt: { name: 'Produtos 4ON', short: '4ON', description: 'Produtos 4ON para performance' },
    en: { name: '4ON Products', short: '4ON', description: '4ON products for performance' },
    es: { name: 'Productos 4ON', short: '4ON', description: 'Productos 4ON para rendimiento' },
    it: { name: 'Prodotti 4ON', short: '4ON', description: 'Prodotti 4ON per la performance' },
    fr: { name: 'Produits 4ON', short: '4ON', description: 'Produits 4ON pour la performance' }
  },
  vestuario: {
    pt: { name: 'Vestuário Portugal', short: 'Vestuário', description: 'Vestuário desportivo Made in Portugal' },
    en: { name: 'Portugal Apparel', short: 'Apparel', description: 'Sportswear Made in Portugal' },
    es: { name: 'Ropa Portugal', short: 'Ropa', description: 'Ropa deportiva Made in Portugal' },
    it: { name: 'Abbigliamento Portogallo', short: 'Abbigliamento', description: 'Abbigliamento sportivo Made in Portugal' },
    fr: { name: 'Vêtements Portugal', short: 'Vêtements', description: 'Vêtements de sport Made in Portugal' }
  },
  protetor: {
    pt: { name: 'Protetores Boost Padel 3K', short: 'Protetores', description: 'Protetores de raquete de Padel em carbono 3K' },
    en: { name: 'Boost Padel 3K Protectors', short: 'Protectors', description: 'Carbon 3K padel racket protectors' },
    es: { name: 'Protectores Boost Padel 3K', short: 'Protectores', description: 'Protectores de pala de pádel en carbono 3K' },
    it: { name: 'Protezioni Boost Padel 3K', short: 'Protezioni', description: 'Protezioni racchetta padel in carbonio 3K' },
    fr: { name: 'Protections Boost Padel 3K', short: 'Protections', description: 'Protections de raquette padel en carbone 3K' }
  },
  digital: {
    pt: { name: 'Produtos Digitais', short: 'Digital', description: 'Ebooks e conteúdo digital' },
    en: { name: 'Digital Products', short: 'Digital', description: 'Ebooks and digital content' },
    es: { name: 'Productos Digitales', short: 'Digital', description: 'Ebooks y contenido digital' },
    it: { name: 'Prodotti Digitali', short: 'Digitale', description: 'Ebook e contenuti digitali' },
    fr: { name: 'Produits Numériques', short: 'Digital', description: 'E-books et contenu numérique' }
  },
  estagio: {
    pt: { name: 'Estágios', short: 'Estágios', description: 'Estágios de padel no Algarve' },
    en: { name: 'Stages', short: 'Stages', description: 'Padel stages in the Algarve' },
    es: { name: 'Stages', short: 'Stages', description: 'Stages de pádel en el Algarve' },
    it: { name: 'Stage', short: 'Stage', description: 'Stage di padel in Algarve' },
    fr: { name: 'Stages', short: 'Stages', description: 'Stages de padel en Algarve' }
  },
  bolas: {
    pt: { name: 'Bolas', short: 'Bolas', description: 'Bolas de padel' },
    en: { name: 'Balls', short: 'Balls', description: 'Padel balls' },
    es: { name: 'Pelotas', short: 'Pelotas', description: 'Pelotas de pádel' },
    it: { name: 'Palline', short: 'Palline', description: 'Palline da padel' },
    fr: { name: 'Balles', short: 'Balles', description: 'Balles de padel' }
  },
  overgrips: {
    pt: { name: 'Overgrips', short: 'Overgrips', description: 'Overgrips para raquetes' },
    en: { name: 'Overgrips', short: 'Overgrips', description: 'Overgrips for rackets' },
    es: { name: 'Overgrips', short: 'Overgrips', description: 'Overgrips para palas' },
    it: { name: 'Overgrips', short: 'Overgrips', description: 'Overgrips per racchette' },
    fr: { name: 'Overgrips', short: 'Overgrips', description: 'Overgrips pour raquettes' }
  },
  ortopedia: {
    pt: { name: 'Ortopedia', short: 'Ortopedia', description: 'Suportes e proteção' },
    en: { name: 'Orthopedics', short: 'Orthopedics', description: 'Supports and protection' },
    es: { name: 'Ortopedia', short: 'Ortopedia', description: 'Soportes y protección' },
    it: { name: 'Ortopedia', short: 'Ortopedia', description: 'Supporti e protezione' },
    fr: { name: 'Orthopédie', short: 'Orthopédie', description: 'Supports et protection' }
  },
  nutricao: {
    pt: { name: 'Nutrição', short: 'Nutrição', description: 'Suplementos e nutrição desportiva' },
    en: { name: 'Nutrition', short: 'Nutrition', description: 'Supplements and sports nutrition' },
    es: { name: 'Nutrición', short: 'Nutrición', description: 'Suplementos y nutrición deportiva' },
    it: { name: 'Nutrizione', short: 'Nutrizione', description: 'Integratori e nutrizione sportiva' },
    fr: { name: 'Nutrition', short: 'Nutrition', description: 'Compléments et nutrition sportive' }
  },
  'reparacao-raquetes': {
    pt: { name: 'Reparação Raquetes', short: 'Reparação', description: 'Reparação de raquetes de padel' },
    en: { name: 'Racket Repair', short: 'Repair', description: 'Padel racket repair' },
    es: { name: 'Reparación de Palas', short: 'Reparación', description: 'Reparación de palas de pádel' },
    it: { name: 'Riparazione Racchette', short: 'Riparazione', description: 'Riparazione racchette da padel' },
    fr: { name: 'Réparation Raquettes', short: 'Réparation', description: 'Réparation de raquettes de padel' }
  }
};

export function localizeCategory(category, lang = getCurrentLanguage()) {
  if (!category) return category;
  const slug = category.slug;
  const pack = slug && CATEGORY_I18N[slug]?.[lang];
  if (!pack) {
    return {
      ...category,
      name: applyPhraseMap(category.name || '', lang),
      shortName: category.name,
      description: category.description ? applyPhraseMap(category.description, lang) : category.description
    };
  }
  return {
    ...category,
    name: pack.name,
    shortName: pack.short,
    description: pack.description
  };
}

export function localizeProduct(product, lang = getCurrentLanguage()) {
  if (!product) return product;
  const localized = {
    ...product,
    name: localizeField(product, 'name', lang),
    short_description: localizeField(product, 'short_description', lang),
    description: localizeField(product, 'description', lang)
  };
  if (product.category) {
    localized.category = localizeCategory(product.category, lang);
  }
  return localized;
}

export function localizeBlogPost(post, lang = getCurrentLanguage()) {
  if (!post) return post;
  return {
    ...post,
    title: localizeField(post, 'title', lang),
    excerpt: localizeField(post, 'excerpt', lang),
    content: localizeField(post, 'content', lang)
  };
}

export function localizeProducts(products, lang = getCurrentLanguage()) {
  return (products || []).map(p => localizeProduct(p, lang));
}

export function localizeBlogPosts(posts, lang = getCurrentLanguage()) {
  return (posts || []).map(p => localizeBlogPost(p, lang));
}

export function localizeCategories(categories, lang = getCurrentLanguage()) {
  return (categories || []).map(c => localizeCategory(c, lang));
}
