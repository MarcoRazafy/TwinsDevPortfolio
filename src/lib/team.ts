import type { TechKey } from "./tech";

export type Twin = {
  slug: string;
  name: string;
  /** Rôle en une ligne, ex. « Développeur front-end & designer ». */
  role: string;
  /** Phrase d'accroche, affichée sous le nom. */
  tagline: string;
  /** Parcours, 2 à 3 paragraphes courts. */
  bio: string[];
  /** Ce qu'il fait concrètement sur un projet, 3 points. */
  does: string[];
  /** Spécialités (clés de src/lib/tech.ts). Les 3 premières flottent aussi autour du portrait. */
  stack: TechKey[];
  links: { linkedin?: string; github?: string; email?: string };
  /** Portrait détouré (chemin public) et ses dimensions. */
  image: { src: string; width: number; height: number };
  /** Teinte du halo derrière le portrait. */
  accent: string;
  /** Textes d'exemple, affichés avec une étiquette « à personnaliser » : à retirer une fois les vrais textes en place. */
  example?: boolean;
};

/* Les deux profils de la section « À propos ». Les textes sont des exemples : remplace-les par vos vrais
   rôles, parcours et liens, puis retire `example: true`. */
export const TEAM: Twin[] = [
  {
    slug: "marco",
    name: "Marco",
    role: "Développeur front-end & designer",
    tagline: "Il dessine les interfaces et les fait vivre à l'écran.",
    bio: [
      "Marco s'occupe de tout ce que vous voyez : la maquette, l'interface, les animations. Son objectif : un site clair, rapide, agréable à utiliser, sur ordinateur comme sur téléphone.",
      "Ingénieur IT de formation, il a commencé à coder avec son frère, et n'a jamais arrêté. Il aime les détails qui font la différence : une transition fluide, un bouton bien placé, une page qui s'affiche instantanément.",
    ],
    does: ["Maquettes et identité visuelle", "Interfaces web et mobiles", "Animations et performance"],
    stack: ["react", "nextjs", "tailwind", "typescript", "figma"],
    links: { linkedin: "#apropos", github: "#apropos" },
    image: { src: "/team/marco.webp", width: 1100, height: 1134 },
    accent: "#22c55e",
    example: true,
  },
  {
    slug: "loic",
    name: "Loïc",
    role: "Développeur back-end & infrastructure",
    tagline: "Il construit ce qui tourne derrière : données, serveurs, sécurité.",
    bio: [
      "Loïc s'occupe de tout ce qui ne se voit pas mais qui fait fonctionner le site : la base de données, les paiements, les comptes utilisateurs, la mise en ligne et la sécurité.",
      "Ingénieur IT lui aussi, il veille à ce que chaque projet soit solide et facile à faire évoluer. Quand votre activité grandit, votre site suit sans tout refaire.",
    ],
    does: ["Bases de données et API", "Paiement, comptes, espace admin", "Hébergement, sauvegardes, sécurité"],
    stack: ["nodejs", "postgresql", "python", "docker", "git"],
    links: { linkedin: "#apropos", github: "#apropos" },
    image: { src: "/team/loic.webp", width: 1100, height: 1088 },
    accent: "#2dd4bf",
    example: true,
  },
];
