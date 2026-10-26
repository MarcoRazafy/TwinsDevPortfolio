import {
  siCloudflare,
  siCss,
  siDebian,
  siDjango,
  siDocker,
  siFigma,
  siGit,
  siGithub,
  siGithubactions,
  siHtml5,
  siJavascript,
  siKalilinux,
  siLaravel,
  siMongodb,
  siMysql,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPython,
  siRaspberrypi,
  siReact,
  siTailwindcss,
  siTypescript,
  siUbuntu,
  type SimpleIcon,
} from "simple-icons";

export type Tech = {
  icon: SimpleIcon;
  /** Site officiel. */
  href: string;
  /** Couleur forcée : pour les logos noirs (Next.js…), invisibles sur fond sombre. */
  tint?: string;
  /** Nom affiché, quand celui de l'icône ne convient pas (ex. OpenJDK → Java). */
  label?: string;
};

/**
 * Technologies citées sur le site (icônes autour des jumeaux, étiquettes des projets).
 * Pour en ajouter une : importer son icône depuis `simple-icons` (noms `si…`, liste sur simpleicons.org).
 */
export const TECH = {
  // Front-end
  html: { icon: siHtml5, href: "https://developer.mozilla.org/fr/docs/Web/HTML" },
  css: { icon: siCss, href: "https://developer.mozilla.org/fr/docs/Web/CSS" },
  javascript: { icon: siJavascript, href: "https://developer.mozilla.org/fr/docs/Web/JavaScript" },
  typescript: { icon: siTypescript, href: "https://www.typescriptlang.org" },
  react: { icon: siReact, href: "https://react.dev" },
  nextjs: { icon: siNextdotjs, href: "https://nextjs.org", tint: "#f8fafc" },
  tailwind: { icon: siTailwindcss, href: "https://tailwindcss.com" },
  figma: { icon: siFigma, href: "https://www.figma.com" },
  uiux: { icon: siFigma, href: "https://www.figma.com", label: "UI/UX" },
  // Back-end
  nodejs: { icon: siNodedotjs, href: "https://nodejs.org" },
  python: { icon: siPython, href: "https://www.python.org" },
  django: { icon: siDjango, href: "https://www.djangoproject.com", tint: "#44b78b" },
  php: { icon: siPhp, href: "https://www.php.net" },
  laravel: { icon: siLaravel, href: "https://laravel.com", label: "Laravel 12" },
  java: { icon: siOpenjdk, href: "https://dev.java", tint: "#f8fafc", label: "Java" },
  // Bases de données
  postgresql: { icon: siPostgresql, href: "https://www.postgresql.org" },
  mysql: { icon: siMysql, href: "https://www.mysql.com", tint: "#6aa6d8" },
  mongodb: { icon: siMongodb, href: "https://www.mongodb.com" },
  // Outils, DevOps, automatisation
  git: { icon: siGit, href: "https://git-scm.com" },
  github: { icon: siGithub, href: "https://github.com", tint: "#f8fafc" },
  docker: { icon: siDocker, href: "https://www.docker.com" },
  cicd: { icon: siGithubactions, href: "https://github.com/features/actions", label: "CI/CD" },
  cloudflare: { icon: siCloudflare, href: "https://www.cloudflare.com" },
  n8n: { icon: siN8n, href: "https://n8n.io" },
  // Systèmes
  debian: { icon: siDebian, href: "https://www.debian.org", tint: "#d70a53" },
  ubuntu: { icon: siUbuntu, href: "https://ubuntu.com" },
  raspberrypi: { icon: siRaspberrypi, href: "https://www.raspberrypi.com", tint: "#c51a4a" },
  kali: { icon: siKalilinux, href: "https://www.kali.org", tint: "#7fb3d5" },
} satisfies Record<string, Tech>;

export type TechKey = keyof typeof TECH;

/** Couleur d'affichage d'une techno (celle de la marque, sauf logo noir). */
export const techColor = (key: TechKey) => {
  const tech: Tech = TECH[key];
  return tech.tint ?? `#${tech.icon.hex}`;
};

/** Nom affiché d'une techno. */
export const techLabel = (key: TechKey) => {
  const tech: Tech = TECH[key];
  return tech.label ?? tech.icon.title;
};
