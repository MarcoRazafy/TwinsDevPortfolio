import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Zones privées : espace d'administration et API (le reste, images comprises, est indexable). */
const PRIVE = ["/admin", "/api/"];

/**
 * Robots des IA de recherche, cités nommément pour qu'ils sachent qu'ils sont les bienvenus : un robot non listé
 * suit déjà la règle « * », mais beaucoup de sites les bloquent, alors on l'écrit noir sur blanc.
 * OAI-SearchBot et ChatGPT-User (ChatGPT), ClaudeBot et Claude-SearchBot (Claude), PerplexityBot (Perplexity),
 * Google-Extended (Gemini et les réponses d'IA de Google), puis les autres assistants.
 */
const IA = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "cohere-ai",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
];

/** /robots.txt : ouvert aux moteurs classiques et aux IA de recherche, sauf les zones privées. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVE },
      { userAgent: ["Googlebot", "Bingbot"], allow: "/", disallow: PRIVE },
      { userAgent: IA, allow: "/", disallow: PRIVE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
