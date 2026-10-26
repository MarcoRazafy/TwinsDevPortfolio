This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Espace d'administration

L'admin sert à ajouter / modifier / supprimer les projets et à modifier les profils de la section « À propos ».

- **Accès** : sur le site, téléphone allumé, bouton retour (‹) en haut du chat → écran de connexion. Accès direct : `/admin/login`.
- **Configuration** (dans `.env.local`, jamais commité) :
  ```bash
  npm run admin:password -- "un mot de passe solide"
  ```
  La commande affiche `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (empreinte scrypt, le mot de passe n'est jamais stocké en clair) et `ADMIN_SESSION_SECRET` à coller dans `.env.local`, puis redémarrer le serveur.
- **Données** : `data/content.json` (projets et profils) et `data/uploads/` (images envoyées, servies par `/media/…`). Le dossier `data/` est ignoré par git : tant qu'il n'existe pas, le contenu vient de `src/lib/projects.ts` et `src/lib/team.ts`. Sur le serveur de production, ce dossier doit être persistant et sauvegardé.
- **Hébergement** : le stockage sur disque convient à un serveur (VPS, Raspberry Pi, Docker avec volume). Il ne fonctionne pas sur un hébergement serverless au disque en lecture seule (ex. Vercel).
- **Sécurité** : session par cookie signé `httpOnly`, 8 h ; blocage de 10 min après 5 échecs de connexion ; chaque action revérifie la session.

## Assistant du téléphone (chat)

- **Sans clé d'IA, ou si le fournisseur refuse** (limite atteinte, panne) : un assistant local, gratuit, répond à partir des contenus du site (FAQ, services, projets) et oriente vers le formulaire de contact. Aucune erreur n'est montrée au visiteur. Code : `src/lib/local-assistant.ts`.
- **Avec une IA** : n'importe quel fournisseur compatible « chat completions » (format OpenAI). Dans `.env.local`, renseigner les trois variables ensemble :
  ```bash
  AI_BASE_URL=https://api.groq.com/openai/v1   # adresse de l'API, version comprise
  AI_MODEL=nom-du-modele                       # nom exact du modèle chez ce fournisseur
  AI_API_KEY=la-cle
  ```
  Fournisseurs avec une offre gratuite (conditions et noms de modèles à vérifier dans leur console au moment de l'inscription) :

  | Fournisseur | `AI_BASE_URL` |
  |---|---|
  | Groq | `https://api.groq.com/openai/v1` |
  | Google Gemini (AI Studio) | `https://generativelanguage.googleapis.com/v1beta/openai` |
  | OpenRouter (modèles suffixés `:free`) | `https://openrouter.ai/api/v1` |
  | Mistral (par défaut, sans `AI_*`) | `https://api.mistral.ai/v1` via `MISTRAL_API_KEY` |

  Les variables sont relues à chaque message : pas besoin de redémarrer. Le serveur journalise `[api/chat] assistant local utilisé : …` quand l'IA est contournée, avec la raison.
