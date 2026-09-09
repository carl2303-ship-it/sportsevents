import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sportsevents.app"
  ),
  title: "SportsEvents.app — Turismo e Estágios Desportivos Ibéricos",
  description:
    "A Plataforma Ibérica de Turismo e Estágios Desportivos. Experiências de alto rendimento em Padel em Portugal e Espanha.",
  icons: {
    icon: [{ url: "/brand/icon.png", type: "image/png" }],
    apple: [{ url: "/brand/icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "SportsEvents.app — Turismo e Estágios Desportivos Ibéricos",
    description:
      "Experiências de alto rendimento em Padel. Treino profissional, competição local e alojamento premium.",
    images: [{ url: "/brand/logo.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
