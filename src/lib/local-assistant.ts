import "server-only";
import { FAQ } from "@/lib/faq";
import { PROJECT_CATEGORIES, type Project } from "@/lib/projects";
import { SERVICES, SPECIALTIES } from "@/lib/services";

/*
 * Assistant de secours, gratuit et sans service externe : répond à partir des contenus du site
 * (FAQ, services, projets) quand le modèle d'IA est indisponible (pas de clé, limite atteinte, panne).
 * Même ton que l'assistant IA : court, tutoiement, une question à la fois, invitation au contact.
 */

type Message = { role: "user" | "assistant"; content: string };

/** Minuscules, sans accents ni ponctuation superflue : « Qu'est-ce que ça coûte ? » → « qu est ce que ca coute ». */
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9@.+\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Mots exacts (pluriel accepté) ; un mot terminé par * est une racine : « cout* » → coût, coûte, coûts. */
const has = (text: string, words: string[]) =>
  words.some((w) =>
    w.endsWith("*") ? new RegExp(`(^|\\s)${w.slice(0, -1)}`).test(text) : new RegExp(`(^|\\s)${w}s?(\\s|$)`).test(text),
  );
const faq = (start: string) => FAQ.find((f) => normalize(f.question).startsWith(normalize(start)))?.answer ?? "";
const service = (slug: string) => SERVICES.find((s) => s.slug === slug);

const CONTACT = "Le plus simple : laisse-nous ton besoin dans le formulaire de contact en bas de page, on te répond rapidement.";

/** Réponse au dernier message du visiteur. */
export function localReply(messages: Message[], projects: Project[]): string {
  const last = messages.at(-1)?.content ?? "";
  const text = normalize(last);
  const firstTurn = messages.filter((m) => m.role === "user").length <= 1;

  // Coordonnées laissées dans le message
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/.test(text) || /(\+?\d[\d\s.]{7,}\d)/.test(last)) {
    // Le chat n'enregistre rien : on oriente vers le formulaire, qui, lui, transmet la demande
    return "Merci ! Pour qu'on puisse te recontacter, envoie ta demande avec ces coordonnées via le formulaire de contact en bas de page.";
  }

  if (has(text, ["merci", "super", "parfait", "top", "genial", "cool"])) {
    return "Avec plaisir ! Si tu veux avancer sur ton projet, le formulaire de contact en bas de page est là pour ça.";
  }

  if (has(text, ["prix", "cout*", "tarif*", "combien", "budget*", "devis", "cher", "chere"]) && !has(text, ["temps", "delai"])) {
    return `${faq("Combien coûte")} Tu as déjà une idée du type de projet ?`;
  }

  if (has(text, ["delai*", "temps", "quand", "rapide*", "vite", "urgen*", "semaine", "mois"])) {
    return `${faq("Combien de temps")} Pour quand aimerais-tu que ce soit prêt ?`;
  }

  if (has(text, ["maintenance", "apres", "mise a jour", "maj", "sauvegarde*", "support"])) {
    return `${faq("Et après")} Tu as déjà un site existant ?`;
  }

  if (has(text, ["modifier", "admin*", "moi meme", "gerer", "back office", "cms"])) {
    return faq("Est-ce que je pourrai");
  }

  if (has(text, ["distance", "visio", "ou etes", "ou vous", "madagascar", "antananarivo", "tana", "pays", "ville"])) {
    return faq("Vous travaillez");
  }

  if (has(text, ["realisation*", "portfolio", "exemple*", "reference*", "vos projets", "deja fait", "travaux"])) {
    const names = projects.slice(0, 3).map((p) => p.title.split(",")[0]);
    const cats = PROJECT_CATEGORIES.map((c) => c.label.toLowerCase()).join(", ");
    return `On a notamment réalisé ${names.join(", ")}. Tu peux tous les voir autour du globe dans la section Projets (${cats}). Ton projet ressemble à l'un d'eux ?`;
  }

  if (has(text, ["techno*", "stack", "langage*", "framework*", "react", "next*", "laravel", "php", "python", "node*", "wordpress"])) {
    return "On travaille surtout avec React, Next.js et Tailwind côté interface, et Node.js, Laravel, Python et PostgreSQL côté serveur, selon ce qui convient le mieux au projet. Tu as une contrainte technique particulière ?";
  }

  // Spécialités (plus précises que les services : testées d'abord)
  const specialties: [string, string[], string][] = [
    ["Paiement en ligne", ["stripe", "paiement*", "payer", "abonnement*", "facture*", "paypal"], "Tu veux encaisser en une fois, ou par abonnement ?"],
    ["API & intégrations", ["api", "webhook*", "integration*", "connecter", "synchronis*"], "Quels outils aimerais-tu relier entre eux ?"],
    ["Noms de domaine", ["domaine*", "dns", "nom de domaine"], "Tu as déjà un nom de domaine, ou il faut le choisir ?"],
    ["Automatisation", ["automatis*", "n8n", "workflow*", "bot*", "zapier", "repetiti*"], "Quelle tâche te prend le plus de temps aujourd'hui ?"],
    ["ERP & CRM", ["erp", "crm", "gestion client*", "stock*", "facturation"], "Tu utilises déjà un outil, ou on part de zéro ?"],
    ["SaaS", ["saas", "abonne*", "logiciel en ligne"], "Tu as déjà une idée précise de ton produit ?"],
    ["Accès à distance", ["distance", "a distance", "vpn", "teletravail", "bureau a distance"], "C'est pour accéder à un serveur, ou aux postes de ton équipe ?"],
  ];
  for (const [title, words, question] of specialties) {
    const s = SPECIALTIES.find((x) => x.title === title);
    if (s && has(text, words)) return `${s.title} : ${s.text} ${question}`;
  }

  // Services
  const services: [string, string[], string][] = [
    ["serveurs-vps", ["vps", "serveur*", "ssh", "linux", "debian", "ubuntu", "configur*"], "Tu as déjà un serveur, ou il faut le choisir ?"],
    ["hebergement", ["heberg*", "mettre en ligne", "mise en ligne", "en ligne"], "C'est pour un site existant, ou un nouveau projet ?"],
    ["cloud", ["cloud", "aws", "google cloud", "azure", "cdn", "stockage"], "Tu utilises déjà un fournisseur cloud ?"],
    ["plateformes", ["plateforme*", "espace membre*", "portail*", "marketplace", "place de marche"], "Qui va s'y connecter, tes clients ou ton équipe ?"],
    ["applications", ["application*", "appli*", "app", "mobile*", "android", "ios", "logiciel*", "dashboard*", "tableau de bord"], "Qui va l'utiliser, tes clients ou ton équipe ?"],
    ["sites-web", ["site*", "vitrine*", "web", "page*", "google", "referencement*", "refonte*", "boutique*", "e commerce", "ecommerce", "vendre", "vente*", "produit*"], "Tu as déjà un site, ou on part de zéro ?"],
  ];
  for (const [slug, words, question] of services) {
    const s = service(slug);
    if (s && has(text, words)) return `${s.title} : ${s.pitch} ${question}`;
  }

  if (has(text, ["contact*", "email*", "mail*", "joindre", "appeler", "telephone*", "rdv", "rendez vous", "parler"])) {
    return CONTACT;
  }

  if (firstTurn && has(text, ["bonjour", "salut", "hello", "hi", "hey", "coucou", "bonsoir", "yo", "slt", "bjr"])) {
    return "Salut ! Tu as un projet en tête : un site web, une plateforme, une application, un serveur à configurer ? Dis-m'en un peu plus.";
  }
  if (has(text, ["bonjour", "salut", "hello", "hi", "hey", "coucou", "bonsoir"])) {
    return "Re-salut ! Dis-moi ce que tu aimerais faire, et je te dis comment on peut t'aider.";
  }

  return `Je peux te parler de nos services, de nos tarifs, des délais ou de nos réalisations. ${CONTACT}`;
}
