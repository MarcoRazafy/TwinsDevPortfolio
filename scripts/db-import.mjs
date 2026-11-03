// Importe dans PostgreSQL les données gardées jusqu'ici dans data/ : contenu, images, demandes de contact.
// Usage : npm run db:import   (lit DATABASE_URL dans .env.local ; relançable sans créer de doublons)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL absent : ajoutez-le dans .env.local.");
  process.exit(1);
}

const DATA = path.join(process.cwd(), "data");
const TYPES = { webp: "image/webp", png: "image/png", jpg: "image/jpeg" };
const NAME = /^[a-z0-9-]{1,80}\.(webp|png|jpg)$/;

// Mêmes tables que src/lib/db.ts
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS content (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
  CREATE TABLE IF NOT EXISTS media (name text PRIMARY KEY, type text NOT NULL, data bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
  CREATE TABLE IF NOT EXISTS contact_requests (
    id bigserial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), name text NOT NULL,
    company text NOT NULL DEFAULT '', phone text NOT NULL DEFAULT '', email text NOT NULL,
    type text NOT NULL DEFAULT '', message text NOT NULL, mailed boolean NOT NULL DEFAULT false
  );
`;

const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query(SCHEMA);

// 1. Contenu (projets, catégories, profils, avis) : seulement si la base n'en a pas encore
try {
  const content = JSON.parse(await readFile(path.join(DATA, "content.json"), "utf8"));
  const r = await client.query("INSERT INTO content (id, data) VALUES ('site', $1) ON CONFLICT (id) DO NOTHING", [JSON.stringify(content)]);
  console.log(r.rowCount ? "• Contenu importé." : "• Contenu : déjà présent dans la base, inchangé.");
} catch (e) {
  console.log(e.code === "ENOENT" ? "• Contenu : pas de data/content.json." : `• Contenu : ${e.message}`);
}

// 2. Images envoyées depuis l'administration
let added = 0;
let total = 0;
try {
  for (const name of await readdir(path.join(DATA, "uploads"))) {
    if (!NAME.test(name)) continue;
    total++;
    const data = await readFile(path.join(DATA, "uploads", name));
    const r = await client.query("INSERT INTO media (name, type, data) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING", [
      name,
      TYPES[name.split(".").pop()],
      data,
    ]);
    added += r.rowCount;
  }
  console.log(`• Images : ${added} importée(s) sur ${total}.`);
} catch (e) {
  console.log(e.code === "ENOENT" ? "• Images : pas de data/uploads." : `• Images : ${e.message}`);
}

// 3. Demandes de contact : seulement si la table est vide (évite les doublons)
try {
  const { rows } = await client.query("SELECT count(*)::int AS n FROM contact_requests");
  if (rows[0].n > 0) {
    console.log(`• Demandes : la base en contient déjà ${rows[0].n}, rien d'importé.`);
  } else {
    const lines = (await readFile(path.join(DATA, "contacts.jsonl"), "utf8")).split("\n").filter(Boolean);
    for (const line of lines) {
      const c = JSON.parse(line);
      await client.query(
        "INSERT INTO contact_requests (created_at, name, company, phone, email, type, message, mailed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [c.at ?? new Date().toISOString(), c.name ?? "", c.company ?? "", c.phone ?? "", c.email ?? "", c.type ?? "", c.message ?? "", Boolean(c.mailed)],
      );
    }
    console.log(`• Demandes : ${lines.length} importée(s).`);
  }
} catch (e) {
  console.log(e.code === "ENOENT" ? "• Demandes : pas de data/contacts.jsonl." : `• Demandes : ${e.message}`);
}

await client.end();
