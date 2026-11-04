import "server-only";
import { ASSISTANT_PROMPT } from "@/lib/assistant-prompt";
import type { Content } from "@/lib/content/store";
import { ASSISTANT_FAQ, FAQ } from "@/lib/faq";
import { SERVICES, SPECIALTIES, STEPS } from "@/lib/services";
import { SITE } from "@/lib/site";
import { techLabel, type TechKey } from "@/lib/tech";

/*
 * Consignes du modèle, complétées à chaque conversation par les données du portfolio (projets,
 * catégories, compétences, services, FAQ). Le contenu vient de la base : une modification faite
 * dans l'administration est connue de l'assistant dès la conversation suivante.
 */

const techs = (keys: TechKey[]) => keys.map(techLabel).join(", ");

/** Fonctionnalités souvent demandées, repérées dans la description des projets (texte sans accents). */
const FEATURES = [
  { name: "Paiement en ligne", words: /paiement|payer|stripe|paypal|carte bancaire|abonnement|checkout/ },
  { name: "Réservation", words: /reserv/ },
  { name: "WhatsApp", words: /whatsapp/ },
  { name: "Boutique en ligne / catalogue", words: /boutique|e-commerce|catalogue|panier/ },
  { name: "Espace membre ou administration", words: /espace membre|connexion|compte|administration|back-office/ },
  { name: "Intelligence artificielle / assistant", words: /\bia\b|intelligence artificielle|assistant|chatbot|bot\b/ },
  { name: "Automatisation", words: /automatis|workflow|n8n/ },
];
const unique = <T,>(items: T[]) => [...new Set(items)];

/** Compétences de toute l'équipe, regroupées par thème, sans les attribuer à l'un ou à l'autre. */
export function teamSkills(content: Pick<Content, "team">) {
  const groups = new Map<string, TechKey[]>();
  for (const member of content.team) {
    for (const g of member.skills ?? []) groups.set(g.label, unique([...(groups.get(g.label) ?? []), ...g.items]));
  }
  const stack = unique(content.team.flatMap((m) => m.stack));
  const savoirFaire = unique(content.team.flatMap((m) => m.does));
  return { groups, stack, savoirFaire };
}

export function buildAssistantPrompt(content: Content): string {
  const label = (key: string) => content.categories.find((c) => c.key === key)?.label ?? key;
  const real = content.projects.filter((p) => !p.example);
  const { groups, stack, savoirFaire } = teamSkills(content);

  const projects = real.map((p) => {
    const parts = [`- ${p.title} [${p.categories.map(label).join(", ")}]`];
    if (p.kind) parts.push(`${p.kind}.`);
    if (p.problem) parts.push(p.problem);
    if (p.delivered.length) parts.push(`Livré : ${p.delivered.join(" ; ")}.`);
    if (!p.kind && !p.problem && !p.delivered.length) parts.push("(description non renseignée : n'en déduis aucune fonctionnalité)");
    if (p.stack.length) parts.push(`Technologies : ${techs(p.stack)}.`);
    if (p.links.site) parts.push(`Site : ${p.links.site}`);
    return parts.join(" ");
  });

  // Fonctionnalités courantes → projets dont la description les mentionne vraiment (calculé, pas deviné)
  const describe = (p: (typeof real)[number]) =>
    `${p.title} ${p.kind} ${p.problem} ${p.delivered.join(" ")}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const features = FEATURES.map(({ name, words }) => {
    const names = real.filter((p) => words.test(describe(p))).map((p) => p.title.split(",")[0]);
    return `- ${name} : ${names.length ? names.join(", ") : "aucun projet ne le montre encore (appuie-toi sur les services et spécialités)"}`;
  });

  const perCategory = content.categories
    .map((c) => `${c.label} : ${real.filter((p) => p.categories.includes(c.key)).length}`)
    .join(", ");

  return `${ASSISTANT_PROMPT}

Utilisation des données :
- Les données ci-dessous décrivent le portfolio tel qu'il est aujourd'hui : c'est ta seule source. Si une information n'y figure pas, dis-le simplement et propose d'en parler avec l'équipe.
- Quand on te demande si TwinsDev peut faire quelque chose (par exemple une application avec paiement), vérifie les services, les spécialités et les compétences : si c'est le cas, réponds oui en t'appuyant dessus.
- Ne cite un projet en exemple que si sa description ci-dessous mentionne vraiment la fonctionnalité demandée. N'attribue jamais à un projet une fonctionnalité qui n'est pas écrite dans sa description ; si aucun projet ne la montre, ne cite aucun projet.
- Tu peux citer des noms de projets ou de technologies séparés par des virgules (toujours sans liste à puces), et dépasser 3 phrases si on te demande un détail précis.
- Texte brut uniquement : jamais d'astérisques, de gras, de titres ni de Markdown.

=== PROJETS (exactement ${real.length} projets ; par catégorie : ${perCategory}) ===
Quand on te demande le nombre de projets, donne ce chiffre exact : ${real.length}.
${projects.join("\n")}

=== FONCTIONNALITÉS DÉJÀ RÉALISÉES (projets qui les montrent) ===
${features.join("\n")}

=== ÉQUIPE ===
Marco et Loïc, qui portent chaque projet ensemble.
Téléphone (appel ou WhatsApp) : ${SITE.phones.map((p) => p.display).join(" ou ")}, aussi affichés en bas du site.
Savoir-faire : ${savoirFaire.join(" ; ")}.
Compétences : ${[...groups].map(([g, items]) => `${g} : ${techs(items)}`).join(" | ")}.
Technologies principales : ${techs(stack)}.

=== SERVICES ===
${SERVICES.map((s) => `- ${s.title} : ${s.pitch} Comprend : ${s.includes.join(", ")}. Tarif : ${s.pricing}.`).join("\n")}

=== SPÉCIALITÉS ===
${SPECIALTIES.map((s) => `- ${s.title} : ${s.text}`).join("\n")}

=== DÉROULÉ D'UN PROJET ===
${STEPS.map((s, i) => `${i + 1}. ${s.title} : ${s.text}`).join("\n")}

=== QUESTIONS FRÉQUENTES ===
${[...FAQ, ...ASSISTANT_FAQ].map((f) => `Q : ${f.question}\nR : ${f.answer}`).join("\n")}`;
}
