/* Module sans directive : utilisable côté serveur (page) comme côté client (registre). */

const BACKGROUND_NAMES = ["dispersion", "beams"] as const;

export type BackgroundName = (typeof BACKGROUND_NAMES)[number];

/** "none" désactive l'arrière-plan (utile pour comparer). */
export type BackgroundChoice = BackgroundName | "none";

const DEFAULT_BACKGROUND: BackgroundName = "dispersion";

/** Lit le paramètre d'URL `?bg=` ; toute valeur inconnue retombe sur l'arrière-plan par défaut. */
export function parseBackground(value: string | string[] | undefined): BackgroundChoice {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === "none") return "none";
  return (BACKGROUND_NAMES as readonly string[]).includes(v ?? "") ? (v as BackgroundName) : DEFAULT_BACKGROUND;
}
