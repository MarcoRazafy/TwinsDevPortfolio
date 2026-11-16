import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** /robots.txt : le site est ouvert aux moteurs, sauf l'espace d'administration et les API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
