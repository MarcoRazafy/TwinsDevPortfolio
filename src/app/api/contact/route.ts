import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { hasDb, query } from "@/lib/db";
import { isMailConfigured, sendContactMail } from "@/lib/mailer";

/**
 * Demandes reçues, en plus de l'e-mail : table `contact_requests` (base de données),
 * sinon une ligne JSON par demande dans data/contacts.jsonl (dossier ignoré par git).
 */
const FILE = path.join(process.cwd(), "data", "contacts.jsonl");
const MAX = { name: 120, company: 120, phone: 30, email: 200, type: 60, message: 4000 };
const PHONE = /^[+0-9 ().-]{6,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Anti-abus : 5 demandes par adresse IP toutes les 15 minutes (mémoire du serveur). */
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > LIMIT;
}

type Body = { name?: unknown; company?: unknown; phone?: unknown; email?: unknown; type?: unknown; message?: unknown; website?: unknown };

/** POST /api/contact — { name, company?, phone?, email, type, message } → { ok: true } ou { error }. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ error: "Demande invalide" }, { status: 400 });

  // Champ piège : rempli par les robots, jamais par un humain
  if (typeof body.website === "string" && body.website.trim()) return Response.json({ ok: true });

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(body.name, MAX.name);
  const company = str(body.company, MAX.company);
  const phone = str(body.phone, MAX.phone);
  const email = str(body.email, MAX.email);
  const type = str(body.type, MAX.type);
  const message = str(body.message, MAX.message);

  if (!name) return Response.json({ error: "Indiquez votre nom." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "Indiquez une adresse e-mail valide." }, { status: 400 });
  if (phone && !PHONE.test(phone)) return Response.json({ error: "Numéro de téléphone invalide : chiffres, espaces et + uniquement." }, { status: 400 });
  if (message.length < 10) return Response.json({ error: "Décrivez votre projet en quelques mots." }, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (tooMany(ip)) {
    return Response.json({ error: "Trop de messages envoyés d'affilée : réessayez dans quelques minutes." }, { status: 429 });
  }

  // 1. E-mail à l'équipe (si le SMTP est configuré)
  let mailed = false;
  if (isMailConfigured()) {
    try {
      await sendContactMail({ name, company, phone, email, type, message });
      mailed = true;
    } catch (error) {
      console.error("[api/contact] envoi de l'e-mail impossible", error);
    }
  } else {
    console.warn("[api/contact] SMTP non configuré (SMTP_HOST, SMTP_USER, SMTP_PASS) : demande seulement enregistrée");
  }

  // 2. Copie dans la base (ou data/contacts.jsonl) : rien n'est perdu si l'e-mail échoue
  let saved = false;
  try {
    if (hasDb()) {
      await query(
        "INSERT INTO contact_requests (name, company, phone, email, type, message, mailed) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [name, company, phone, email, type, message, mailed],
      );
    } else {
      await mkdir(path.dirname(FILE), { recursive: true });
      await appendFile(FILE, JSON.stringify({ at: new Date().toISOString(), name, company, phone, email, type, message, mailed }) + "\n", "utf8");
    }
    saved = true;
  } catch (error) {
    console.error("[api/contact] écriture impossible", error);
  }

  if (!mailed && !saved) {
    return Response.json({ error: "Impossible d'envoyer la demande, réessayez dans un instant." }, { status: 500 });
  }
  console.log(`[contact] nouvelle demande de ${name} <${email}> (${type})${mailed ? " — e-mail envoyé" : ""}`);
  return Response.json({ ok: true });
}
