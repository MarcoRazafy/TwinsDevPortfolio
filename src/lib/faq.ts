export type Faq = { question: string; answer: string };

/* Questions fréquentes, dans l'ordre où les clients les posent le plus souvent : à valider avec votre façon de travailler. */
export const FAQ: Faq[] = [
  {
    question: "Combien coûte la création d'un site ?",
    answer:
      "Chaque projet est chiffré sur devis après un premier échange. Le prix dépend du nombre de pages, des fonctionnalités (paiement, réservation, espace membre…) et du délai souhaité.",
  },
  {
    question: "En combien de temps mon site sera-t-il en ligne ?",
    answer:
      "Ça dépend de la taille du projet. On vous donne un calendrier précis avec le devis, étape par étape, et vous suivez l'avancement au fur et à mesure.",
  },
  {
    question: "Je n'ai ni nom de domaine ni hébergement, c'est un problème ?",
    answer:
      "Pas du tout. On vous aide à choisir et à réserver votre nom de domaine, et on s'occupe de l'hébergement. Si vous en avez déjà un, on travaille avec.",
  },
  {
    question: "Mon site sera-t-il bien visible sur Google et sur mobile ?",
    answer:
      "Oui, on le construit pour : pages rapides, affichage adapté aux téléphones, titres et descriptions soignés pour les moteurs de recherche. Le classement dépend aussi de votre contenu et de la concurrence, mais votre site part sur de bonnes bases.",
  },
  {
    question: "Pourrai-je modifier mon site moi-même ?",
    answer:
      "Oui, si vous le souhaitez. On peut prévoir un espace d'administration pour changer vos textes, vos photos ou vos produits sans toucher au code, et on vous montre comment l'utiliser.",
  },
  {
    question: "J'ai déjà un site : pouvez-vous le refaire ou l'améliorer ?",
    answer:
      "Oui. On regarde d'abord ce qui fonctionne et ce qui bloque, puis on vous propose soit une modernisation de l'existant, soit une refonte complète, en gardant votre nom de domaine.",
  },
  {
    question: "Que se passe-t-il après la mise en ligne ?",
    answer:
      "On reste disponibles. Vous pouvez choisir un forfait de maintenance (mises à jour, sauvegardes, petites évolutions) ou nous contacter au cas par cas.",
  },
  {
    question: "Peut-on travailler ensemble à distance ?",
    answer:
      "Oui. Les échanges se font par visio, e-mail ou messagerie, et vous suivez l'avancement du projet sur une adresse de test accessible à tout moment.",
  },
];
