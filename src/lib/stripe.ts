import Stripe from 'stripe'
import { getAppSetting } from '@/lib/app-settings'

export async function getStripe() {
  const key =
    process.env.STRIPE_SECRET_KEY ||
    (await getAppSetting('stripe_secret_key'))
  if (!key) return null
  return new Stripe(key, {
    apiVersion: '2026-08-26.dahlia',
  })
}

export async function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    (await getAppSetting('site_url')) ||
    'http://localhost:3000'
  )
}
