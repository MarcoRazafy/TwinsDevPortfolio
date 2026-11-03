import "server-only";
import { Pool, type PoolClient } from "pg";

/**
 * Connexion PostgreSQL (DATABASE_URL dans .env.local, ex. postgres://user:mot-de-passe@localhost:5432/twinsdev).
 * Sans DATABASE_URL, le site garde ses fichiers dans data/ (contenu, images, demandes de contact).
 *
 * Tables :
 *   content           le contenu modifiable depuis l'administration, en un seul document JSON
 *   media             les images envoyées depuis l'administration (servies par /media/[file])
 *   contact_requests  les demandes du formulaire de contact
 */

export const hasDb = () => Boolean(process.env.DATABASE_URL);

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS content (
    id          text PRIMARY KEY,
    data        jsonb NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS media (
    name        text PRIMARY KEY,
    type        text NOT NULL,
    data        bytea NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS contact_requests (
    id          bigserial PRIMARY KEY,
    created_at  timestamptz NOT NULL DEFAULT now(),
    name        text NOT NULL,
    company     text NOT NULL DEFAULT '',
    phone       text NOT NULL DEFAULT '',
    email       text NOT NULL,
    type        text NOT NULL DEFAULT '',
    message     text NOT NULL,
    mailed      boolean NOT NULL DEFAULT false
  );
`;

/* Un seul pool par processus, conservé entre les rechargements à chaud du serveur de développement. */
const globalDb = globalThis as unknown as { __twinsdevPool?: Pool; __twinsdevSchema?: Promise<void> };

function pool() {
  if (!globalDb.__twinsdevPool) {
    globalDb.__twinsdevPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30_000 });
    globalDb.__twinsdevPool.on("error", (error) => console.error("[db] connexion perdue", error.message));
  }
  return globalDb.__twinsdevPool;
}

/** Crée les tables au premier accès (sans effet si elles existent déjà). */
function ready() {
  globalDb.__twinsdevSchema ??= pool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((error) => {
      globalDb.__twinsdevSchema = undefined; // nouvel essai au prochain accès
      throw error;
    });
  return globalDb.__twinsdevSchema;
}

export async function query<T extends Record<string, unknown>>(text: string, values?: unknown[]) {
  await ready();
  return (await pool().query<T>(text, values)).rows;
}

/** Exécute `run` dans une transaction (validée si tout passe, annulée sinon). */
export async function transaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  await ready();
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
