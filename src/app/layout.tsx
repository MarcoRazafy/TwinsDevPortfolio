import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { RESTORE_SCRIPT } from "@/components/phone/remember";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    "Deux jumeaux ingénieurs qui conçoivent et développent des sites vitrines, des boutiques en ligne et des applications web sur mesure.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06080f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <head>
        {/* Avant le premier affichage : masque la scène si le téléphone était allumé (voir phone/remember.ts) */}
        <script dangerouslySetInnerHTML={{ __html: RESTORE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
