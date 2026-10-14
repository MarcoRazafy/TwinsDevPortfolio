export type Testimonial = {
  quote: string;
  author: string;
  /** Fonction et entreprise, ex. « Gérante, restaurant Le Jardin ». */
  role: string;
  /** Avis fictif, affiché avec une étiquette « exemple ». */
  example?: boolean;
};

/* Avis clients. N'affiche que de vrais avis, avec l'accord du client. Liste vide = section masquée. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Ils ont tout de suite compris ce qu'on voulait. Le site était en ligne avant l'ouverture de la saison, et on reçoit maintenant nos réservations directement.",
    author: "Prénom N.",
    role: "Gérant·e, restaurant",
    example: true,
  },
  {
    quote:
      "Des échanges clairs à chaque étape, et une vraie disponibilité après la mise en ligne. On continue à faire évoluer l'application avec eux.",
    author: "Prénom N.",
    role: "Responsable, association",
    example: true,
  },
];
