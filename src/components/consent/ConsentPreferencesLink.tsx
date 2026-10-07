'use client'

import { useConsent } from '@/components/consent/consent-context'
import { useDictionary } from '@/i18n/use-locale'

export function ConsentPreferencesLink({
  className,
}: {
  className?: string
}) {
  const { t } = useDictionary()
  const { openPreferences } = useConsent()

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className}
    >
      {t.footer.cookies}
    </button>
  )
}
