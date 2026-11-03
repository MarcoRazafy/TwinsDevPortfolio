import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { hasDb, query, transaction } from "@/lib/db";
import { PROJECT_CATEGORIES, PROJECTS, type Category, type Project } from "@/lib/projects";
import { TEAM, type Twin } from "@/lib/team";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

/** Contenu modifiable depuis l'administration : projets (et leurs catégories), profils et avis. */
export type Content = { projects: Project[]; categories: Category[]; team: Twin[]; testimonials: Testimonial[] };

/** Étiquette de cache du contenu : à invalider (updateTag) après chaque modification. */
export const CONTENT_TAG = "content";

/** Sans base de données : fichier de contenu dans data/ (ignoré par git, comme les demandes de contact). */
const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "content.json");
/** Avec base de données : une ligne de la table `content`. */
const ROW = "site";

const DEFAULT_CONTENT: Content = { projects: PROJECTS, categories: PROJECT_CATEGORIES, team: TEAM, testimonials: TESTIMONIALS };

/** Contenu lu (fichier ou base) ; ce qui a été créé avant l'ajout des avis ou des catégories est complété. */
function normalize(data: Partial<Content> | null | undefined): Content | null {
  if (!data || !Array.isArray(data.projects) || !Array.isArray(data.team)) return null;
  return {
    ...data,
    categories: Array.isArray(data.categories) ? data.categories : PROJECT_CATEGORIES,
    testimonials: Array.isArray(data.testimonials) ? data.testimonials : TESTIMONIALS,
  } as Content;
}

/** Lit le fichier ; tant qu'il n'existe pas, le contenu de départ vient de src/lib/projects.ts et team.ts. */
async function readFileContent(): Promise<Content> {
  try {
    const content = normalize(JSON.parse(await readFile(FILE, "utf8")) as Partial<Content>);
    if (content) return content;
    console.error("[content] data/content.json invalide : contenu de départ utilisé");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") console.error("[content] lecture impossible", error);
  }
  return DEFAULT_CONTENT;
}

/**
 * Lit le contenu : dans la base si DATABASE_URL est défini, sinon dans le fichier.
 * Au premier accès, une base vide reprend le contenu du fichier (ou celui de départ).
 */
async function readContent(): Promise<Content> {
  if (!hasDb()) return readFileContent();
  const rows = await query<{ data: Partial<Content> }>("SELECT data FROM content WHERE id = $1", [ROW]);
  const stored = normalize(rows[0]?.data);
  if (stored) return stored;
  const initial = await readFileContent();
  await query("INSERT INTO content (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [ROW, JSON.stringify(initial)]);
  return initial;
}

/** Contenu du site, mis en cache jusqu'à la prochaine modification. */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return readContent();
}

export async function getTeam() {
  return (await getContent()).team;
}

export async function getTestimonials() {
  return (await getContent()).testimonials;
}

let queue: Promise<unknown> = Promise.resolve();

/**
 * Modifie le contenu : relit la version enregistrée, applique `mutate`, puis l'écrit.
 * Base de données : dans une transaction, ligne verrouillée (SELECT … FOR UPDATE).
 * Fichier : écriture atomique (fichier temporaire puis renommage). Les modifications passent une par une.
 */
export function updateContent(mutate: (content: Content) => void): Promise<Content> {
  const run = queue.then(async () => {
    if (hasDb()) {
      await readContent(); // crée la ligne au premier accès
      return transaction(async (client) => {
        const { rows } = await client.query<{ data: Partial<Content> }>("SELECT data FROM content WHERE id = $1 FOR UPDATE", [ROW]);
        const content = structuredClone(normalize(rows[0]?.data) ?? DEFAULT_CONTENT);
        mutate(content);
        await client.query("UPDATE content SET data = $2, updated_at = now() WHERE id = $1", [ROW, JSON.stringify(content)]);
        return content;
      });
    }
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
