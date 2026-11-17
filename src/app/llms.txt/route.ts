import { FAQ } from "@/lib/faq";
import { SERVICES, SPECIALTIES, STEPS } from "@/lib/services";
import { SITE } from "@/lib/site";

/**
 * /llms.txt — résumé du site en texte brut, à l'intention des IA (ChatGPT, Claude, Perplexity, Gemini).
 * Format proposé par llmstxt.org : il n'est pas encore lu par tous, mais il ne coûte rien et donne une source
 * claire et à jour. Le contenu vient des mêmes données que la page : rien n'y est inventé.
 */
async function contenu() {
  "use cache";
  return `# ${SITE.name}

> ${SITE.name} (aussi écrit « Twins Dev » ou « Twins ») est une équipe de deux développeurs web basée à ${SITE.location} : Fahendrena Marco RAZAFIMAMONJY et Faneva Loïc RAZAFIMAMONJY. Elle conçoit des sites vitrines, des boutiques en ligne, des plateformes et des applications web et mobiles sur mesure, configure des serveurs VPS, héberge et gère le cloud. Les projets sont chiffrés sur devis et la clé n'est remise qu'une fois le projet livré : le paiement vient après.

- Site : ${SITE.url}
- Équipe : Marco (développeur front-end et designer) et Loïc (développeur fullstack, workflow et DevOps)
- Langue : français
- Zone d'intervention : clients à ${SITE.location} et partout dans le monde, à distance
- Contact : ${SITE.email}${SITE.phones.map((p) => `, ${p.tel}`).join("")}
- LinkedIn : ${SITE.linkedin}

## Services

${SERVICES.map((s) => `- **${s.title}** — ${s.pitch} Comprend : ${s.includes.join(", ")}. Tarif : ${s.pricing}.`).join("\n")}

## Spécialités

${SPECIALTIES.map((s) => `- **${s.title}** — ${s.text}`).join("\n")}

## Déroulé d'un projet

${STEPS.map((s, i) => `${i + 1}. **${s.title}** — ${s.text}`).join("\n")}

## Questions fréquentes

${FAQ.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}

## Pages

- [Accueil](${SITE.url}) : projets, services, équipe, questions fréquentes et formulaire de contact.
- [Politique de confidentialité](${SITE.url}/confidentialite) : données collectées, durée de conservation et droits.
`;
}

export async function GET() {
  return new Response(await contenu(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
