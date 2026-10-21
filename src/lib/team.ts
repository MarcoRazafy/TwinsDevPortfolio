import type { TechKey } from "./tech";

export type SkillGroup = { label: string; items: TechKey[] };

export type Twin = {
  slug: string;
  name: string;
  /** Nom complet, affiché en petit sous le prénom. */
  fullName?: string;
  /** Formation, affichée à côté du nom complet. */
  studies?: string;
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
  /** Compétences rangées par catégorie : si présent, remplace la rangée `stack` sous le texte. */
  skills?: SkillGroup[];
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
    fullName: "Faneva Loïc RAZAFIMAMONJY",
    studies: "Intégration et développement",
    role: "Développeur fullstack · Workflow & DevOps",
    tagline: "Il automatise, connecte et sécurise ce qui tourne derrière.",
    bio: [
      "Loïc gère surtout le back-end, mais il sait aussi prendre en main le front-end. Sa spécialité : l'automatisation. Il conçoit les workflows qui font tourner une application ou une plateforme toute seule, et crée des bots pour assister vos utilisateurs.",
      "Côté infrastructure, il administre les serveurs, les déploie via SSH et sécurise les données. Il relie aussi vos outils entre eux grâce aux API, pour que chaque projet reste solide et facile à faire évoluer.",
    ],
    does: [
      "Automatisation de workflows et bots d'assistance",
      "Intégration d'API, back-end et front-end",
      "Serveurs, déploiement SSH et sécurité des données",
    ],
    stack: ["n8n", "laravel", "docker"],
    skills: [
      { label: "Front-end", items: ["html", "css", "javascript", "react", "nextjs", "tailwind", "uiux"] },
      { label: "Back-end & données", items: ["nodejs", "php", "laravel", "python", "django", "java", "postgresql", "mysql"] },
      { label: "DevOps & outils", items: ["git", "github", "docker", "cicd", "cloudflare", "n8n"] },
      { label: "Systèmes", items: ["debian", "ubuntu", "raspberrypi", "kali"] },
    ],
    links: { github: "https://github.com/" },
    image: { src: "/team/loic.webp", width: 1100, height: 1088 },
    accent: "#2dd4bf",
  },
];
