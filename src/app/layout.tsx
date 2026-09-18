import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { InstallPrompt } from "@/components/install-prompt";
import { getDictionary } from "@/i18n/dictionaries";
import { getLocale } from "@/i18n/get-locale";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
      icon: [{ url: "/brand/icon.png", type: "image/png" }],
      apple: [{ url: "/brand/icon.png", type: "image/png" }],
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
    <html
      lang={locale}
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
