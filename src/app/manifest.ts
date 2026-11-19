import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** /manifest.webmanifest : nom, couleurs et icônes utilisés quand on ajoute le site à l'écran d'accueil (Android). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Développeurs web à Madagascar`,
    short_name: SITE.name,
    description: "Sites vitrines, boutiques en ligne, applications web et mobile, serveurs : conçus et développés par Marco et Loïc.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#06080f",
    theme_color: "#06080f",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
