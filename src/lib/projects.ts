import type { TechKey } from "./tech";

export type ProjectCategory = "application" | "site" | "plateforme" | "serveur";

/** Filtres affichés au-dessus du globe, dans cet ordre. */
export const PROJECT_CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: "application", label: "Application" },
  { key: "site", label: "Site" },
  { key: "plateforme", label: "Plateforme" },
  { key: "serveur", label: "Serveur" },
];

export type GalleryImage = { src: string; caption: string };

/** Limites de la galerie d'un projet. */
export const GALLERY_MAX = 8;
export const GALLERY_NEW_PER_SAVE = 4; // nouvelles images par enregistrement (taille de l'envoi)

export type Project = {
  /** Identifiant court, sert de clé et de nom de fichier pour la capture (public/projects/<slug>.webp). */
  slug: string;
  /** Filtres sous lesquels le projet apparaît autour du globe (un projet peut en avoir plusieurs). */
  categories: ProjectCategory[];
  /** Secteur du client et type de projet, ex. « Restauration · site vitrine ». */
  kind: string;
  title: string;
  /** Le problème du client, en une phrase. */
  problem: string;
  /** Ce qui a été livré, 3 points maximum. */
  delivered: string[];
  stack: TechKey[];
  links: { site?: string; code?: string };
  /** Teinte dominante de la carte (lueur, aperçu sans capture). */
  accent: string;
  /** Capture d'écran (chemin public). Sans capture, un aperçu stylisé est dessiné. */
  image?: string;
  /** Images supplémentaires (captures, détails), chacune avec sa description : galerie sous le globe. */
  gallery?: GalleryImage[];
  /** Projet fictif, affiché avec une étiquette « exemple » : à retirer une fois remplacé par un vrai projet. */
  example?: boolean;
};

/* Projets affichés dans la section « Projets », dans l'ordre du carrousel. Les visuels (public/projects/<slug>.webp)
   sont des mises en scène des captures du site. À compléter : `stack` (technos utilisées) et `links` (URL publiques). */
export const PROJECTS: Project[] = [
  {
    slug: "la-canopee",
    categories: ["site"],
    kind: "Restauration · site vitrine",
    title: "La Canopée, restaurant & rooftop",
    problem: "Restaurant, bar et rooftop au 9e étage du Delta Hotel by Marriott Antananarivo, avec vue panoramique sur la ville.",
    delivered: ["Carte, chef, événements et galerie", "Réservation de table, aussi via WhatsApp", "Demandes de privatisation"],
    stack: [],
    links: {},
    accent: "#e2ad62",
    image: "/projects/la-canopee.webp",
  },
  {
    slug: "paon-dor",
    categories: ["site"],
    kind: "Hôtellerie · site vitrine",
    title: "Paon d'Or, hôtel à Ivato",
    problem: "Un refuge où séjour, gastronomie, bien-être et loisirs se rencontrent, à environ 4 km de l'aéroport d'Ivato.",
    delivered: ["Hébergement, restaurant, bien-être et expériences", "Pages événements", "Réservation en ligne"],
    stack: [],
    links: {},
    accent: "#e6bd62",
    image: "/projects/paon-dor.webp",
  },
  {
    slug: "uditec",
    categories: ["site", "plateforme"],
    kind: "Distribution high-tech · site institutionnel",
    title: "UDITEC Madagascar, distributeur de grandes marques",
    problem: "Un distributeur d'électroménager, de téléphonie, d'informatique et d'équipements pour la maison, partout à Madagascar.",
    delivered: ["Vérification de garantie par numéro de série", "Annuaire des revendeurs", "Espace pro : catalogue B2B et devis"],
    stack: [],
    links: {},
    accent: "#fb923c",
    image: "/projects/uditec.webp",
  },
  {
    slug: "ia-malagasy",
    categories: ["application"],
    kind: "Intelligence artificielle · application web",
    title: "IA Malagasy, un assistant qui parle malgache",
    problem: "Discuter, apprendre, écrire et créer en malgache, en respectant les différences entre régions et cultures.",
    delivered: ["Conversation en malgache, modèle Mistral au choix", "Saisie vocale et pièces jointes", "Génération d'images et historique des échanges"],
    stack: [],
    links: {},
    accent: "#ec8b70",
    image: "/projects/ia-malagasy.webp",
  },
  {
    slug: "naba-automobile",
    categories: ["site", "plateforme"],
    kind: "Pièces auto · catalogue en ligne",
    title: "Naba Automobile, pièces auto et camions",
    problem: "Un spécialiste des pièces pour automobiles et camions de marques chinoises, à Antananarivo.",
    delivered: ["Recherche de pièce compatible par véhicule", "Demande de pièce sans référence", "Catalogue, arrivages et conseils"],
    stack: [],
    links: {},
    accent: "#ef4444",
    image: "/projects/naba-automobile.webp",
  },
  {
    slug: "panorama",
    categories: ["site"],
    kind: "Hôtellerie · site et réservation",
    title: "Hôtel Panorama, Antananarivo",
    problem: "Chambres, piscine extérieure, restaurant Le Cassava et salles de réception, au cœur d'Antananarivo.",
    delivered: ["Recherche de chambre par dates et voyageurs", "Réservation de table et devis événement", "Contact WhatsApp en un clic"],
    stack: [],
    links: {},
    accent: "#ddb95e",
    image: "/projects/panorama.webp",
  },
  {
    slug: "orchid",
    categories: ["site"],
    kind: "Hôtellerie · site vitrine",
    title: "Orchid, hôtel à Ivato",
    problem: "Chambres et suites, restaurant, week-ends et réunions : chaque offre présentée avec ses détails.",
    delivered: ["Chambres et suites présentées en carrousel", "Demande de détails et tarifs personnalisés", "Réservation et appel direct"],
    stack: [],
    links: {},
    accent: "#de9a44",
    image: "/projects/orchid.webp",
  },
  {
    slug: "jiroof",
    categories: ["site"],
    kind: "Produits naturels · site vitrine",
    title: "Ji'ROOF, vanille, girofle et huiles essentielles",
    problem: "Une sélection de produits naturels de grande qualité, venus directement des meilleurs producteurs.",
    delivered: ["Catalogue par catégories de produits", "Site en anglais, pour l'international", "Pages produits détaillées"],
    stack: [],
    links: {},
    accent: "#ddb04c",
    image: "/projects/jiroof.webp",
  },
  {
    slug: "ebene",
    categories: ["site"],
    kind: "Mobilier sur mesure · site vitrine",
    title: "Ébène, mobilier fabriqué sur mesure",
    problem: "Quelques informations suffisent au client pour recevoir une première estimation personnalisée de son projet.",
    delivered: ["Formulaire de projet guidé en 3 étapes", "Choix du type de meuble", "Contact direct par téléphone et e-mail"],
    stack: [],
    links: {},
    accent: "#c9ad82",
    image: "/projects/ebene.webp",
  },
  {
    slug: "raspberry-library",
    categories: ["serveur", "application"],
    kind: "Auto-hébergement · application web",
    title: "Raspberry Library, une vidéothèque maison",
    problem: "Une vidéothèque auto-hébergée sur un Raspberry Pi, pour regrouper et retrouver ses vidéos.",
    delivered: ["Recherche, tri et filtres par genre", "Espace d'administration", "Hébergée sur un Raspberry Pi"],
    stack: ["raspberrypi"],
    links: {},
    accent: "#f43f7f",
    image: "/projects/raspberry-library.webp",
  },
];
