/* Coordonnées et liens du site. À compléter : tant que `email` est vide, la section Contact n'affiche que le formulaire. */
export const SITE = {
  name: "TwinsDev",
  /** Adresse publique du site, sans barre finale : sert au sitemap, au robots.txt et aux liens de partage.
      Se règle à l'hébergement avec NEXT_PUBLIC_SITE_URL si le domaine change. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://twinsdev.ucan-mih.com").replace(/\/$/, ""),
  email: "twinsdev.next@gmail.com",
  linkedin: "https://www.linkedin.com/in/twinsdev/",
  github: "",
  /** Ville / zone d'intervention, affichée dans le contact (facultatif). */
  location: "Madagascar",
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
