import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** /sitemap.xml : les pages publiques. Tout le portfolio tient sur l'accueil (les sections sont des ancres). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/confidentialite`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
