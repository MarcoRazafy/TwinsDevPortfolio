/* Coordonnées et liens du site. À compléter : tant que `email` est vide, la section Contact n'affiche que le formulaire. */
export const SITE = {
  name: "TwinsDev",
  email: "",
  linkedin: "https://www.linkedin.com/in/twins-dev-a9a745445/",
  github: "",
  /** Ville / zone d'intervention, affichée dans le contact (facultatif). */
  location: "",
  /** Téléphones, affichés dans le pied de page : `display` tel qu'écrit à Madagascar, `tel` au format international (lien d'appel). */
  phones: [
    { display: "034 38 517 75", tel: "+261343851775" },
    { display: "038 52 290 61", tel: "+261385229061" },
  ],
};

/** Sections de la page, dans l'ordre : sert au menu et au pied de page. */
export const SECTIONS = [
  { id: "projets", label: "Projets" },
  { id: "services", label: "Services" },
  { id: "apropos", label: "À propos" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;
