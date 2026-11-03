import Image from "next/image";
import Link from "next/link";
import { SECTIONS, SITE } from "@/lib/site";
import Year from "./Year";

/** Pied de page : logo, liens vers les sections, mentions légales. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-4 pb-16 pt-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <a href="#accueil" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[17px] font-semibold">
              <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-7" />
              {SITE.name}
            </a>
            {SITE.linkedin && (
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE.name} sur LinkedIn (nouvel onglet)`}
                title="LinkedIn"
                className="flex min-h-11 items-center rounded-lg px-1 opacity-85 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image src="/brand/linkedin.webp" alt="" width={466} height={118} className="h-6 w-auto" />
              </a>
            )}
          </div>
          <nav aria-label="Pied de page" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="transition-colors hover:text-white">
                {s.label}
              </a>
            ))}
          </nav>
        </div>
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
