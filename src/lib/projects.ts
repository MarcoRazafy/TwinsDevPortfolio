import type { TechKey } from "./tech";

export type Project = {
  /** Identifiant court, sert de clé et de nom de fichier pour la capture (public/projects/<slug>.webp). */
  slug: string;
  /** Secteur du client et type de projet, ex. « Restauration · site vitrine ». */
  kind: string;
  title: string;
  /** Le problème du client, en une phrase. */
  problem: string;
  /** Ce qui a été livré, 3 points maximum. */
  delivered: string[];
  stack: TechKey[];
  links: { site?: string; code?: string };
  /** Teinte dominante de la carte (lueur, aperçu sans capture). */
  accent: string;
  /** Capture d'écran (chemin public). Sans capture, un aperçu stylisé est dessiné. */
  image?: string;
  /** Projet fictif, affiché avec une étiquette « exemple » : à retirer une fois remplacé par un vrai projet. */
  example?: boolean;
};

/* Projets affichés dans la section « Projets ». Les quatre ci-dessous sont des exemples : remplace-les
   par tes réalisations (titre, problème, livrables, technos, liens, et une capture dans public/projects). */
export const PROJECTS: Project[] = [
  {
    slug: "restaurant",
    kind: "Restauration · site vitrine",
    title: "Site d'un restaurant avec réservation",
    problem: "Toutes les réservations passaient par téléphone et la carte n'était visible nulle part en ligne.",
    delivered: ["Carte du jour modifiable par le gérant", "Réservation en ligne avec confirmation", "Référencement local"],
    stack: ["nextjs", "tailwind", "postgresql"],
    links: { site: "#projets" },
    accent: "#e0893f",
    example: true,
  },
  {
    slug: "boutique",
    kind: "Commerce · boutique en ligne",
    title: "Boutique en ligne pour une marque de vêtements",
    problem: "Une créatrice vendait uniquement sur les réseaux sociaux et gérait ses commandes à la main.",
    delivered: ["Catalogue, panier et paiement sécurisé", "Suivi des stocks et des commandes", "Pages produits rapides sur mobile"],
    stack: ["react", "nodejs", "mongodb"],
    links: { site: "#projets", code: "#projets" },
    accent: "#818cf8",
    example: true,
  },
  {
    slug: "dashboard",
    kind: "Entreprise · application web",
    title: "Tableau de bord de gestion",
    problem: "Une PME suivait son activité dans plusieurs fichiers Excel que personne ne tenait à jour.",
    delivered: ["Données centralisées, accès par rôle", "Graphiques mis à jour automatiquement", "Export des rapports en un clic"],
    stack: ["typescript", "python", "docker"],
    links: { site: "#projets" },
    accent: "#34d399",
    example: true,
  },
  {
    slug: "reservation",
    kind: "Association · application mobile",
    title: "Application de réservation de créneaux",
    problem: "Les membres d'un club réservaient leurs séances dans un groupe de messagerie, sans vue d'ensemble.",
    delivered: ["Réservation et annulation en deux gestes", "Rappels par notification", "Espace d'administration"],
    stack: ["react", "nodejs", "postgresql"],
    links: { site: "#projets", code: "#projets" },
    accent: "#2dd4bf",
    example: true,
  },
];
