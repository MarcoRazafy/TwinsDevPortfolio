import { FAQ } from "@/lib/faq";
import { SERVICES, SPECIALTIES } from "@/lib/services";
import { SITE } from "@/lib/site";

/**
 * Données structurées (Schema.org, JSON-LD) de la page d'accueil.
 * Elles disent en langage machine qui nous sommes, ce qu'on fait et ce qu'on répond aux questions courantes :
 * c'est ce que lisent Google (extraits enrichis) et les IA de recherche pour citer un site.
 */
export default function StructuredData() {
  const id = `${SITE.url}/#organisation`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      // Qui nous sommes
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": id,
        name: SITE.name,
        alternateName: "Twins Dev",
        url: SITE.url,
        logo: `${SITE.url}/brand/twinsdev-logo-v2.webp`,
        image: `${SITE.url}/brand/twinsdev-logo-v2.webp`,
        description:
          "Équipe de développeurs web : sites vitrines, boutiques en ligne, plateformes et applications web et mobiles sur mesure, configuration de serveurs VPS, hébergement et gestion cloud.",
        slogan: "Notre objectif : vous surprendre.",
        founder: [
          { "@type": "Person", name: "Marco", jobTitle: "Développeur front-end & designer" },
          { "@type": "Person", name: "Loïc", jobTitle: "Développeur fullstack · Workflow & DevOps" },
        ],
        address: { "@type": "PostalAddress", addressCountry: "MG" },
        areaServed: { "@type": "Place", name: "Monde entier" },
        availableLanguage: ["fr", "en"],
        telephone: SITE.phones.map((p) => p.tel),
        sameAs: [SITE.linkedin].filter(Boolean),
        priceRange: "Sur devis",
        // Le catalogue de services, lisible par une IA qui cherche « qui fait des boutiques en ligne »
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: SERVICES.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.pitch, serviceType: s.title },
          })),
        },
        knowsAbout: SPECIALTIES.map((s) => s.title),
      },
      // Le site lui-même
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#site`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "fr-FR",
        publisher: { "@id": id },
      },
      // Les questions fréquentes : c'est la forme que les IA reprennent le plus volontiers
      {
        "@type": "FAQPage",
        "@id": `${SITE.url}/#faq`,
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
