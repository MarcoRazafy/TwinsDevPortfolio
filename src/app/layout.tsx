import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Lato, Sora } from "next/font/google";
import { RESTORE_SCRIPT } from "@/components/phone/remember";
import { SITE } from "@/lib/site";
import "./globals.css";

/* Police du texte (Lato n'existe qu'en graisses fixes : 500 et 600 prennent la plus proche) */
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

/* Police des titres */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const TITLE = "TwinsDev — Développeurs web à Madagascar";
const DESCRIPTION =
  "Marco et Loïc, développeurs web à Madagascar : sites vitrines, boutiques en ligne, applications web et mobile, serveurs VPS, hébergement et cloud. Sur devis.";

export const metadata: Metadata = {
  // Base des adresses : rend absolus le lien canonique et les images de partage
  metadataBase: new URL(SITE.url),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  // Aperçu lors d'un partage (WhatsApp, LinkedIn, Facebook…)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/brand/twinsdev-logo-v2.webp", alt: "TwinsDev" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/brand/twinsdev-logo-v2.webp"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06080f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${lato.variable} ${sora.variable} h-full antialiased`}>
      <head>
        {/* Avant le premier affichage : masque la scène si le téléphone était allumé (voir phone/remember.ts) */}
        <script dangerouslySetInnerHTML={{ __html: RESTORE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
