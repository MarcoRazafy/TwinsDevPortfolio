import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasDb, query } from "@/lib/db";

/** Images envoyées depuis l'administration : table `media` (base de données) ou data/uploads, servies par /media/[file]. */
const DIR = path.join(process.cwd(), "data", "uploads");
export const MEDIA_PREFIX = "/media/";
const MAX_UPLOAD = 5 * 1024 * 1024; // 5 Mo
const NAME = /^[a-z0-9-]{1,80}\.(webp|png|jpg)$/;

const MEDIA_TYPES: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" };

/** Type réel du fichier, d'après ses premiers octets (on ne se fie ni au nom ni au type annoncé). */
function sniff(bytes: Uint8Array): "webp" | "png" | "jpg" | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

/** Enregistre une image envoyée ; renvoie son adresse publique (/media/…) ou une erreur lisible. */
export async function saveUpload(file: File, prefix: string): Promise<{ src: string } | { error: string }> {
  if (file.size > MAX_UPLOAD) return { error: "Image trop lourde (5 Mo maximum)." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniff(bytes);
  if (!ext) return { error: "Format d'image non reconnu : utilisez WebP, PNG ou JPEG." };
  const safe = prefix.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 60) || "image";
  const name = `${safe}-${randomBytes(5).toString("hex")}.${ext}`;
  if (hasDb()) {
    // Base de données : l'image est sauvegardée avec le reste du contenu
    await query("INSERT INTO media (name, type, data) VALUES ($1, $2, $3)", [name, MEDIA_TYPES[ext], Buffer.from(bytes)]);
  } else {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, name), bytes);
  }
  return { src: MEDIA_PREFIX + name };
}

/**
 * Lit une image envoyée ; `null` si le nom est invalide ou l'image absente.
 * Avec une base de données, on cherche d'abord dans la table `media`, puis dans data/uploads
 * (images envoyées avant la base, tant qu'elles n'ont pas été importées).
 */
export async function readUpload(name: string): Promise<{ data: Buffer; type: string } | null> {
  if (!NAME.test(name)) return null;
  if (hasDb()) {
    const rows = await query<{ data: Buffer; type: string }>("SELECT data, type FROM media WHERE name = $1", [name]);
    if (rows[0]) return rows[0];
  }
  try {
    const data = await readFile(path.join(DIR, name));
    return { data, type: MEDIA_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}

/** Supprime une image envoyée qui n'est plus utilisée (sans effet sur les images du dossier public). */
export async function deleteUpload(src: string | undefined) {
  if (!src?.startsWith(MEDIA_PREFIX)) return;
  const name = src.slice(MEDIA_PREFIX.length);
  if (!NAME.test(name)) return;
  if (hasDb()) await query("DELETE FROM media WHERE name = $1", [name]).catch((e) => console.error("[media] suppression impossible", e));
  await unlink(path.join(DIR, name)).catch(() => undefined);
}
