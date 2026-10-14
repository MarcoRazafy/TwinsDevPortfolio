import type { Metadata } from "next";
import LegalPage from "@/components/sections/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: `Politique de confidentialité — ${SITE.name}` };

/* Modèle à compléter. Il décrit ce que le site fait réellement aujourd'hui : formulaire de contact et assistant
   (conversations envoyées à Mistral AI pour générer les réponses). À mettre à jour si ça change. */
export default function Confidentialite() {
  return (
    <LegalPage title="Politique de confidentialité" updated="14 octobre 2026">
      <h2>Quelles données sont collectées ?</h2>
      <p>
        <strong>Formulaire de contact :</strong> votre nom, votre adresse e-mail, le type de projet et votre message.
        Ils servent uniquement à vous répondre et à préparer un devis.
      </p>
      <p>
        <strong>Assistant du téléphone :</strong> les messages que vous écrivez sont transmis à Mistral AI (société
        française) pour générer les réponses. N&apos;y indiquez pas d&apos;informations sensibles. Nous ne conservons pas
        ces conversations.
      </p>
      <h2>Combien de temps ?</h2>
      <p>Les demandes de contact sont conservées [durée, ex. 12 mois] après le dernier échange, puis supprimées.</p>
      <h2>Qui y a accès ?</h2>
      <p>Uniquement {SITE.name} (Marco et Loïc). Aucune donnée n&apos;est vendue ni transmise à des fins publicitaires.</p>
      <h2>Cookies</h2>
      <p>Ce site n&apos;utilise pas de cookies de suivi ni d&apos;outil de mesure d&apos;audience.</p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l&apos;accès, la correction ou la suppression de vos données en écrivant à [e-mail]. Si vous
        êtes en Europe, vous pouvez aussi saisir l&apos;autorité de protection des données de votre pays (en France, la
        CNIL).
      </p>
    </LegalPage>
  );
}
