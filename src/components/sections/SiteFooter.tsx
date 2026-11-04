import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { SECTIONS, SITE } from "@/lib/site";
import Year from "./Year";

/** Pastille de contact du pied de page (fond sombre, 44 px de haut). */
const CHIP =
  "inline-flex h-11 items-center rounded-full border border-white/10 bg-white/[0.03] text-[14.5px] font-medium tabular-nums tracking-wide text-white/85 transition-colors duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Pied de page : logo, liens vers les sections, moyens de nous joindre, mentions légales. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-4 pb-16 pt-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <a href="#accueil" className="flex min-h-11 items-center gap-2.5 font-[family-name:var(--font-display)] text-[17px] font-semibold">
            <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-7" />
            {SITE.name}
          </a>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="transition-colors hover:text-white">
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Nous joindre : LinkedIn et téléphones, en pastilles sombres de même hauteur, alignées sous le logo */}
        <ul aria-label="Nous joindre" className="flex flex-wrap items-center gap-2.5">
          {SITE.linkedin && (
            <li>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} sur LinkedIn (nouvel onglet)`}
                className={`group ${CHIP} px-4`}
              >
                {/* Logo en gris (mode sombre), en couleurs au survol */}
                <Image
                  src="/brand/linkedin-logo.webp"
                  alt=""
                  width={466}
                  height={118}
                  className="h-[18px] w-auto opacity-75 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </a>
            </li>
          )}
          {/* Téléphones : un appui lance l'appel (lien tel: au format international) */}
          {SITE.phones.map((p) => (
            <li key={p.tel}>
              <a href={`tel:${p.tel}`} aria-label={`Appeler le ${p.display}`} className={`group ${CHIP} gap-2.5 pl-1.5 pr-4`}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/15 text-accent-strong transition-colors duration-200 group-hover:bg-accent group-hover:text-[#03140c]">
                  <Phone size={15} strokeWidth={2.2} aria-hidden />
                </span>
                {p.display}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-[13px] text-muted">
          <Link href="/mentions-legales" className="transition-colors hover:text-white">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="transition-colors hover:text-white">
            Politique de confidentialité
          </Link>
          <span className="ml-auto">
            © <Year /> {SITE.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
