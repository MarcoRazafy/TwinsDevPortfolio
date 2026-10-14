import type { LucideIcon } from "lucide-react";
import { Globe, ShoppingBag, Smartphone, Wrench } from "lucide-react";

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

/* Services proposés. Adapte les textes et, si tu as des prix de départ, indique-les : ça rassure et ça filtre. */
export const SERVICES: Service[] = [
  {
    slug: "vitrine",
    icon: Globe,
    title: "Site vitrine",
    pitch: "Présenter votre activité, être trouvé sur Google, recevoir des demandes de contact.",
    includes: ["Design sur mesure", "Adapté au mobile", "Référencement de base"],
    pricing: "Sur devis",
    accent: "#22c55e",
  },
  {
    slug: "boutique",
    icon: ShoppingBag,
    title: "Boutique en ligne",
    pitch: "Vendre vos produits en ligne, encaisser les paiements et suivre vos commandes.",
    includes: ["Catalogue et panier", "Paiement sécurisé", "Gestion des stocks"],
    pricing: "Sur devis",
    accent: "#818cf8",
  },
  {
    slug: "application",
    icon: Smartphone,
    title: "Application web ou mobile",
    pitch: "Un outil sur mesure pour votre équipe ou vos clients : réservations, gestion, espace membre.",
    includes: ["Comptes et rôles", "Base de données", "Tableaux de bord"],
    pricing: "Sur devis",
    accent: "#2dd4bf",
  },
  {
    slug: "maintenance",
    icon: Wrench,
    title: "Maintenance et évolution",
    pitch: "Votre site reste à jour, sécurisé et rapide, et évolue avec votre activité.",
    includes: ["Mises à jour de sécurité", "Sauvegardes", "Nouvelles fonctionnalités"],
    pricing: "Forfait mensuel",
    accent: "#f2c14e",
  },
];

export type Step = { title: string; text: string };

/* Déroulé d'un projet, dans l'ordre. */
export const STEPS: Step[] = [
  { title: "Premier échange", text: "Vous nous expliquez votre besoin, on pose les bonnes questions et on vous envoie un devis." },
  { title: "Maquette", text: "On dessine les pages principales. Vous validez avant qu'on écrive la moindre ligne de code." },
  { title: "Développement", text: "On construit le site et on vous le montre au fur et à mesure, sur une adresse de test." },
  { title: "Mise en ligne", text: "On publie, on vérifie que tout fonctionne et on vous apprend à gérer votre contenu." },
];
