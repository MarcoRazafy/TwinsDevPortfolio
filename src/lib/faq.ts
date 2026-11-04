export type Faq = { question: string; answer: string };

/* Questions fréquentes affichées sur le site, dans cet ordre : à valider avec votre façon de travailler. */
export const FAQ: Faq[] = [
  {
    question: "Pourquoi vous ?",
    answer:
      "Parce qu'on est une équipe qui prend votre projet au sérieux. On vous livre toujours un rendu qui va au-delà de ce que vous imaginiez, et on est là pour vous surprendre. On s'occupe de tout, du design jusqu'à la mise en ligne, avec un seul interlocuteur qui connaît votre projet par cœur. On reste disponibles et réactifs à chaque étape, et on ne s'arrête pas tant que le résultat ne vous plaît pas vraiment.",
  },
  {
    question: "Avec quels clients travaillez-vous ?",
    answer:
      "Avec tout le monde, partout dans le monde : entrepreneurs, commerces, hôtels et restaurants, associations, start-up ou particuliers. Tout se fait à distance, quel que soit votre pays : il suffit d'une connexion et d'une idée de projet.",
  },
  {
    question: "Comment peut-on vous faire confiance ?",
    answer:
      "Nos réalisations sont en ligne : vous pouvez les voir autour du globe dans la section Projets et les visiter. Avant de commencer, vous recevez un plan clair avec les étapes, les délais et le devis. Pendant le projet, on vous montre l'avancement à chaque étape. À la livraison, on vous remet tous les accès.",
  },
  {
    question: "Comment échange-t-on pendant le projet ?",
    answer:
      "Sur WhatsApp, pour des échanges simples et rapides au quotidien : questions, validations, captures d'écran. Bientôt, vous pourrez aussi suivre votre projet depuis notre application de suivi : l'avancement, les étapes validées et les prochaines livraisons, au même endroit.",
  },
  {
    question: "Comment être sûr que le projet sera livré ?",
    answer:
      "Vous ne prenez aucun risque : on livre d'abord. Le projet est mis en ligne, on vous remet toutes les clés (accès, codes, hébergement), et c'est seulement ensuite que vous payez. Vous ne réglez donc rien avant d'avoir votre projet entre les mains.",
  },
];

/* Réponses connues de l'assistant du téléphone, sans être affichées dans la FAQ du site. */
export const ASSISTANT_FAQ: Faq[] = [
  {
    question: "Combien coûte un projet ?",
    answer:
      "Chaque projet est chiffré sur devis après un premier échange. Le prix dépend du nombre de pages, des fonctionnalités (paiement, réservation, espace membre…) et du délai souhaité.",
  },
  {
    question: "En combien de temps mon projet sera-t-il prêt ?",
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
      "Oui. Les échanges se font sur WhatsApp ou en visio, et vous suivez l'avancement du projet sur une adresse de test accessible à tout moment.",
  },
];
