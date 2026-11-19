import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* Date de dernière modification de chaque page (AAAA-MM-JJ) : à mettre à jour quand son contenu change.
   C'est la seule information du sitemap que Google utilise vraiment (il ignore changeFrequency et priority). */
const MAJ = { accueil: "2026-11-19", confidentialite: "2026-10-14" };

/** /sitemap.xml : les pages publiques. Tout le portfolio tient sur l'accueil (les sections sont des ancres). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, lastModified: MAJ.accueil, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/confidentialite`, lastModified: MAJ.confidentialite, changeFrequency: "yearly", priority: 0.3 },
  ];
}
