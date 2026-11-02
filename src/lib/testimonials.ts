export type Testimonial = {
  /** Identifiant stable (clé de liste et de modification). */
  id: string;
  /** Nom de l'entreprise ou de l'organisation. */
  company: string;
  /** Logo de l'entreprise (chemin public ou /media/…). Sans logo, un monogramme est dessiné. */
  logo?: string;
  /** Site de l'entreprise (facultatif). */
  website?: string;
  /** L'avis, en quelques phrases. */
  quote: string;
  /** Nom du responsable qui donne l'avis. */
  author: string;
  /** Son poste ou son service dans l'entreprise, ex. « Directrice marketing ». */
  role: string;
  /** Avis fictif, affiché avec une étiquette « exemple ». */
  example?: boolean;
};

export const TESTIMONIAL_MAX = 12;

/* Avis de départ (exemples), remplacés depuis l'administration. N'affiche que de vrais avis, avec l'accord
   du client. Liste vide = section masquée. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "exemple-restaurant",
    company: "Restaurant (exemple)",
    quote:
      "Ils ont tout de suite compris ce qu'on voulait. Le site était en ligne avant l'ouverture de la saison, et on reçoit maintenant nos réservations directement.",
    author: "Prénom N.",
    role: "Gérant·e",
    example: true,
  },
  {
    id: "exemple-association",
    company: "Association (exemple)",
    quote:
      "Des échanges clairs à chaque étape, et une vraie disponibilité après la mise en ligne. On continue à faire évoluer l'application avec eux.",
    author: "Prénom N.",
    role: "Responsable",
    example: true,
  },
];

/** Initiales d'une entreprise ou d'une personne (monogramme quand il n'y a pas de logo). */
export function initials(name: string) {
  return (
    name
      .replace(/\(.*?\)/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}
