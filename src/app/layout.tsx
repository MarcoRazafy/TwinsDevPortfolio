import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Lato, Sora } from "next/font/google";
import { RESTORE_SCRIPT } from "@/components/phone/remember";
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

export const metadata: Metadata = {
  title: "TwinsDev — Marco & Loïc, développeurs web",
  description:
    "Une équipe de développeurs web qui conçoit et développe des sites vitrines, des boutiques en ligne et des applications web sur mesure.",
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
