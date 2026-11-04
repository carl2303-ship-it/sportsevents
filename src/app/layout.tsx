import type { Metadata } from "next";
import Script from "next/script";
import { InstallPrompt } from "@/components/install-prompt";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/get-locale";
import { LocaleProvider } from "@/i18n/use-locale";
/* Self-hosted fonts — avoid next/font/google (Netlify CI egress breaks Google Fonts fetch). */
import "@fontsource/syne/latin-600.css";
import "@fontsource/syne/latin-700.css";
import "@fontsource/syne/latin-800.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale).meta;
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportsevents.app"
    ),
    title: t.siteTitle,
    description: t.siteDescription,
    applicationName: "SportsEvents.app",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "SportsEvents",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      // Cache-bust: Netlify Durable can keep prior favicon/icon bytes for a long time.
      icon: [
        {
          url: "/favicon.ico?v=20261104",
          type: "image/x-icon",
          sizes: "any",
        },
        {
          url: "/brand/icon-192.png?v=20261104",
          type: "image/png",
          sizes: "192x192",
        },
        {
          url: "/brand/icon-512.png?v=20261104",
          type: "image/png",
          sizes: "512x512",
        },
        {
          url: "/brand/icon.png?v=20261104",
          type: "image/png",
          sizes: "512x512",
        },
      ],
      apple: [
        {
          url: "/brand/apple-touch-icon.png?v=20261104",
          type: "image/png",
          sizes: "180x180",
        },
      ],
      shortcut: "/brand/icon-192.png?v=20261104",
    },
    openGraph: {
      title: t.siteTitle,
      description: t.siteDescription,
      images: [{ url: "/brand/logo.png" }],
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Script
          id="consent-defaults"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
        />
        <LocaleProvider locale={locale}>
          <ConsentProvider>
            {children}
            <InstallPrompt />
          </ConsentProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

/** Evita HTML estático com locale errado (cookie / prerender). */
export const dynamic = 'force-dynamic'
