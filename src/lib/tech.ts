import {
  siDocker,
  siFigma,
  siGit,
  siHtml5,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from "simple-icons";

export type Tech = {
  icon: SimpleIcon;
  /** Site officiel. */
  href: string;
  /** Couleur forcée : pour les logos noirs (Next.js…), invisibles sur fond sombre. */
  tint?: string;
};

/**
 * Technologies citées sur le site (icônes autour des jumeaux, étiquettes des projets).
 * Pour en ajouter une : importer son icône depuis `simple-icons` (noms `si…`, liste sur simpleicons.org).
 */
export const TECH = {
  nextjs: { icon: siNextdotjs, href: "https://nextjs.org", tint: "#f8fafc" },
  react: { icon: siReact, href: "https://react.dev" },
  typescript: { icon: siTypescript, href: "https://www.typescriptlang.org" },
  javascript: { icon: siJavascript, href: "https://developer.mozilla.org/fr/docs/Web/JavaScript" },
  nodejs: { icon: siNodedotjs, href: "https://nodejs.org" },
  tailwind: { icon: siTailwindcss, href: "https://tailwindcss.com" },
  html: { icon: siHtml5, href: "https://developer.mozilla.org/fr/docs/Web/HTML" },
  python: { icon: siPython, href: "https://www.python.org" },
  postgresql: { icon: siPostgresql, href: "https://www.postgresql.org" },
  mongodb: { icon: siMongodb, href: "https://www.mongodb.com" },
  docker: { icon: siDocker, href: "https://www.docker.com" },
  git: { icon: siGit, href: "https://git-scm.com" },
  figma: { icon: siFigma, href: "https://www.figma.com" },
} satisfies Record<string, Tech>;

export type TechKey = keyof typeof TECH;

/** Couleur d'affichage d'une techno (celle de la marque, sauf logo noir). */
export const techColor = (key: TechKey) => {
  const tech: Tech = TECH[key];
  return tech.tint ?? `#${tech.icon.hex}`;
};
