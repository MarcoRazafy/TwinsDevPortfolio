import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Building2,
  Cloud,
  CreditCard,
  Globe,
  Layers,
  MonitorSmartphone,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  Video,
  Webhook,
  Workflow,
} from "lucide-react";

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  /** À qui ça sert, en une phrase. */
  pitch: string;
  /** Ce qui est inclus, 3 points. */
  includes: string[];
  /** Mention tarifaire, ex. « Sur devis » ou « À partir de 900 € ». */
  pricing: string;
  accent: string;
};

/* Ce qu'on fait. Adapte les textes et, si tu as des prix de départ, indique-les : ça rassure et ça filtre. */
export const SERVICES: Service[] = [
  {
    slug: "sites-web",
    icon: Globe,
    title: "Sites web",
    pitch: "Site vitrine, boutique en ligne ou page de lancement : rapide, adapté au mobile et bien référencé.",
    includes: ["Design sur mesure", "Adapté au mobile", "Référencement (SEO)"],
    pricing: "Sur devis",
    accent: "#22c55e",
  },
  {
    slug: "plateformes",
    icon: Layers,
    title: "Plateformes",
    pitch: "Espaces membres, portails clients, places de marché : des outils en ligne où vos utilisateurs se connectent.",
    includes: ["Comptes et rôles", "Espace d'administration", "Tableaux de bord"],
    pricing: "Sur devis",
    accent: "#34d399",
  },
  {
    slug: "applications",
    icon: Smartphone,
    title: "Applications web & mobile",
    pitch: "Une application sur mesure pour votre équipe ou vos clients, dans le navigateur ou sur téléphone.",
    includes: ["Interface sur mesure", "Base de données et API", "Notifications"],
    pricing: "Sur devis",
    accent: "#2dd4bf",
  },
  {
    slug: "serveurs-vps",
    icon: Terminal,
    title: "Configuration de serveurs VPS",
    pitch: "Installation et configuration de votre serveur via SSH : sécurisé, optimisé, prêt pour la production.",
    includes: ["Accès SSH sécurisé", "Pare-feu et certificats SSL", "Déploiement de vos applications"],
    pricing: "Sur devis",
    accent: "#4ade80",
  },
  {
    slug: "hebergement",
    icon: Server,
    title: "Hébergement",
    pitch: "On met en ligne et on héberge votre site ou votre application, sauvegardés et surveillés.",
    includes: ["Mise en ligne", "Sauvegardes automatiques", "Surveillance et mises à jour"],
    pricing: "Forfait mensuel",
    accent: "#5eead4",
  },
  {
    slug: "cloud",
    icon: Cloud,
    title: "Gestion cloud",
    pitch: "Mise en place et gestion de vos services cloud : stockage, bases de données, performance, coûts maîtrisés.",
    includes: ["Architecture cloud", "CDN et performance", "Suivi des coûts"],
    pricing: "Sur devis",
    accent: "#38bdf8",
  },
];

export type Specialty = { icon: LucideIcon; title: string; text: string };

/* Nos spécialités : savoir-faire précis, en complément des services. */
export const SPECIALTIES: Specialty[] = [
  { icon: Webhook, title: "API & intégrations", text: "Relier vos outils entre eux : API REST, webhooks, services tiers." },
  { icon: CreditCard, title: "Paiement en ligne", text: "Stripe et autres solutions : paiements, abonnements, factures." },
  { icon: Workflow, title: "Automatisation", text: "Workflows n8n, bots et tâches répétitives qui tournent toutes seules." },
  { icon: Building2, title: "ERP & CRM", text: "Clients, ventes, stocks : outils sur mesure ou intégration de l'existant." },
  { icon: Boxes, title: "SaaS", text: "Concevoir et lancer votre logiciel en ligne, vendu par abonnement." },
  {
    icon: Search,
    title: "Indexation",
    text: "Votre site trouvable sur Google : structure, mots-clés, données enrichies et suivi des positions.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisation (application et serveur)",
    text: "HTTPS, pare-feu, accès limités, mots de passe chiffrés, sauvegardes et mises à jour suivies.",
  },
  {
    icon: MonitorSmartphone,
    title: "Responsive",
    text: "Le même site, net et agréable sur téléphone, tablette et ordinateur, sans rien perdre au passage.",
  },
  {
    icon: Video,
    title: "WebRTC",
    text: "Appels audio et vidéo, partage d'écran et messages en direct dans le navigateur, sans rien installer.",
  },
];

export type Step = { title: string; text: string };

/* Déroulé d'un projet, dans l'ordre. */
export const STEPS: Step[] = [
  { title: "Échange", text: "Vous nous donnez les détails de votre projet : vos objectifs, vos besoins et vos contraintes." },
  {
    title: "Analyse et plan",
    text: "On étudie votre demande et on choisit les bonnes solutions techniques. Vous recevez un plan clair, avec les étapes, les délais et le devis.",
  },
  { title: "Exécution", text: "On développe votre projet, étape par étape, en suivant le plan validé ensemble." },
  { title: "Reporting", text: "On vous montre le projet au fur et à mesure, pour que vous puissiez réagir et ajuster." },
  { title: "Livraison", text: "On met en ligne, on vérifie que tout fonctionne et on vous remet les accès." },
];
