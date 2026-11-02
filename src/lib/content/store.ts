import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { PROJECT_CATEGORIES, PROJECTS, type Category, type Project } from "@/lib/projects";
import { TEAM, type Twin } from "@/lib/team";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

/** Contenu modifiable depuis l'administration : projets (et leurs catégories), profils et avis. */
export type Content = { projects: Project[]; categories: Category[]; team: Twin[]; testimonials: Testimonial[] };

/** Étiquette de cache du contenu : à invalider (updateTag) après chaque modification. */
export const CONTENT_TAG = "content";

/** Fichier de contenu, dans data/ (ignoré par git, comme les demandes de contact). */
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "content.json");

/** Lit le fichier ; tant qu'il n'existe pas, le contenu de départ vient de src/lib/projects.ts et team.ts. */
async function readContent(): Promise<Content> {
  try {
    const data = JSON.parse(await readFile(FILE, "utf8")) as Partial<Content>;
    if (Array.isArray(data.projects) && Array.isArray(data.team)) {
      // Fichiers créés avant l'ajout des avis ou des catégories : on complète avec le contenu de départ
      return {
        ...data,
        categories: Array.isArray(data.categories) ? data.categories : PROJECT_CATEGORIES,
        testimonials: Array.isArray(data.testimonials) ? data.testimonials : TESTIMONIALS,
      } as Content;
    }
    console.error("[content] data/content.json invalide : contenu de départ utilisé");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("[content] lecture impossible", error);
  }
  return { projects: PROJECTS, categories: PROJECT_CATEGORIES, team: TEAM, testimonials: TESTIMONIALS };
}

/** Contenu du site, mis en cache jusqu'à la prochaine modification. */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return readContent();
}

export async function getProjects() {
  return (await getContent()).projects;
}

export async function getTeam() {
  return (await getContent()).team;
}

export async function getTestimonials() {
  return (await getContent()).testimonials;
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Modifie le contenu : relit le fichier, applique `mutate`, puis écrit de façon atomique
 * (fichier temporaire puis renommage). Les modifications passent une par une.
 */
export function updateContent(mutate: (content: Content) => void): Promise<Content> {
  const run = queue.then(async () => {
    const content = structuredClone(await readContent());
    mutate(content);
    await mkdir(DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(content, null, 2), "utf8");
    await rename(tmp, FILE);
    return content;
  });
  queue = run.catch(() => undefined);
  return run;
}
