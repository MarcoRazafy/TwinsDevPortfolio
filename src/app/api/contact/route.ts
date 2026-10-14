import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/** Demandes reçues : une ligne JSON par demande, dans data/contacts.jsonl (dossier ignoré par git). */
const FILE = path.join(process.cwd(), "data", "contacts.jsonl");
const MAX = { name: 120, email: 200, type: 60, message: 4000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Body = { name?: unknown; email?: unknown; type?: unknown; message?: unknown; website?: unknown };

/** POST /api/contact — { name, email, type, message } → { ok: true } ou { error }. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ error: "Demande invalide" }, { status: 400 });

  // Champ piège : rempli par les robots, jamais par un humain
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(body.name, MAX.name);
  const email = str(body.email, MAX.email);
  const type = str(body.type, MAX.type);
  const message = str(body.message, MAX.message);

  if (!name) return Response.json({ error: "Indiquez votre nom." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Indiquez une adresse e-mail valide." }, { status: 400 });
  if (message.length < 10) return Response.json({ error: "Décrivez votre projet en quelques mots." }, { status: 400 });

  const entry = { at: new Date().toISOString(), name, email, type, message };
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await appendFile(FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (error) {
    console.error("[api/contact] écriture impossible", error);
    return Response.json({ error: "Impossible d'enregistrer la demande, réessayez dans un instant." }, { status: 500 });
  }
  console.log(`[contact] nouvelle demande de ${name} <${email}> (${type})`);
  return Response.json({ ok: true });
}
