import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Mentions légales — ${SITE.name}` };

/* Modèle à compléter : les champs entre crochets sont obligatoires selon le pays (France : loi pour la confiance
   dans l'économie numérique). Adapte le texte à votre situation (auto-entrepreneurs, société…). */
export default function MentionsLegales() {
  return (
    <LegalPage title="Mentions légales" updated="14 octobre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site {SITE.name} est édité par [Nom et prénom, ou raison sociale], [statut : auto-entrepreneur, SAS…],
        [adresse], [numéro SIRET / registre du commerce], [e-mail de contact].
      </p>
      <h2>Directeur de la publication</h2>
      <p>[Nom et prénom].</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par [nom de l&apos;hébergeur], [adresse], [site web ou téléphone].</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus de ce site (textes, images, logo, code) sont la propriété de {SITE.name}, sauf mention contraire.
        Toute reproduction sans autorisation est interdite.
      </p>
      <h2>Contact</h2>
      <p>Pour toute question : [e-mail].</p>
    </LegalPage>
  );
}
