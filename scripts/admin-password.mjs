// Génère la configuration de l'administration à coller dans .env.local (ou dans les variables du serveur).
// Usage : npm run admin:password -- "votre mot de passe"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Mot de passe manquant ou trop court (10 caractères minimum).\nUsage : npm run admin:password -- "votre mot de passe"');
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64);

console.log("# À ajouter dans .env.local (ne jamais commiter ces valeurs) :");
console.log("ADMIN_USERNAME=admin");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
