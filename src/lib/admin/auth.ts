import "server-only";
import { createHmac, scrypt, timingSafeEqual, type BinaryLike } from "node:crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";

/*
 * Authentification de l'administration.
 * Configuration (variables d'environnement, jamais préfixées NEXT_PUBLIC_) :
 *   ADMIN_USERNAME        nom d'utilisateur
 *   ADMIN_PASSWORD_HASH   empreinte scrypt du mot de passe : `npm run admin:password -- "mot de passe"`
 *   ADMIN_SESSION_SECRET  clé de signature des sessions (32 caractères minimum), générée par la même commande
 */

const COOKIE = "twinsdev_admin";
const SESSION_SECONDS = 8 * 60 * 60; // 8 h
const MAX_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000; // blocage de 10 min après 5 échecs

function config() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!username || !passwordHash || !secret || secret.length < 32) return null;
  return { username, passwordHash, secret };
}

/** L'administration est-elle configurée (variables d'environnement présentes) ? */
export const isAdminConfigured = () => config() !== null;

const scryptAsync = (password: BinaryLike, salt: BinaryLike, keylen: number) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, keylen, (err, key) => (err ? reject(err) : resolve(key))));

/** Comparaison en temps constant de deux chaînes (via leur HMAC, pour ne rien révéler de leur longueur). */
function sameText(a: string, b: string, secret: string) {
  const h = (s: string) => createHmac("sha256", secret).update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

async function verifyPassword(password: string, stored: string) {
  const [algo, salt, key] = stored.split(":");
  if (algo !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Vérifie un couple identifiant / mot de passe. */
export async function checkCredentials(username: string, password: string) {
  const c = config();
  if (!c) return false;
  // On calcule toujours le hash, même si l'identifiant est faux : même durée dans les deux cas
  const passwordOk = await verifyPassword(password, c.passwordHash);
  return sameText(username, c.username, c.secret) && passwordOk;
}

/* ── Session : cookie signé (HMAC), httpOnly ── */

const signature = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("base64url");

/** Ouvre une session (à appeler depuis une Server Action). */
export async function createSession(username: string) {
  const c = config();
  if (!c) throw new Error("Administration non configurée");
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${signature(payload, c.secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

/** Ferme la session (à appeler depuis une Server Action). */
export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Administrateur connecté, ou `null`. À vérifier dans chaque page et chaque action d'administration. */
export async function getAdmin(): Promise<{ username: string } | null> {
  const c = config();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!c || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  // La vérification d'expiration dépend de l'heure : rendu à la requête uniquement (cacheComponents)
  await connection();
  const expected = Buffer.from(signature(payload, c.secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u: string; exp: number };
    if (typeof exp !== "number" || exp < Date.now() || u !== c.username) return null;
    return { username: u };
  } catch {
    return null;
  }
}

/* ── Limitation des tentatives (mémoire du serveur, par adresse IP) ── */

/** Échecs comptés sur une fenêtre glissante ; au 5e, blocage jusqu'à `lockedUntil`. */
const failures = new Map<string, { count: number; windowEnd: number; lockedUntil: number }>();

export async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

/** Minutes restantes avant de pouvoir réessayer, ou 0. */
export function lockedMinutes(key: string) {
  const f = failures.get(key);
  if (!f || f.lockedUntil < Date.now()) return 0;
  return Math.ceil((f.lockedUntil - Date.now()) / 60000);
}

export function recordFailure(key: string) {
  const now = Date.now();
  const f = failures.get(key);
  const count = f && f.windowEnd > now ? f.count + 1 : 1;
  failures.set(key, { count, windowEnd: now + LOCK_MS, lockedUntil: count >= MAX_FAILURES ? now + LOCK_MS : 0 });
}

export function clearFailures(key: string) {
  failures.delete(key);
}
