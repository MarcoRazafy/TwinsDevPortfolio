import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = { title: string; updated: string; children: ReactNode };

/** Gabarit des pages légales : titre, date de mise à jour, texte en colonne lisible. */
export default function LegalPage({ title, updated, children }: Props) {
  return (
    <main className="flex flex-1 flex-col px-4 py-16 sm:px-8 lg:py-24">
      <article className="mx-auto w-full max-w-[720px]">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden /> Retour au site
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.025em]">
          {title}
        </h1>
        <p className="mt-3 font-mono text-[13px] text-muted">Mis à jour le {updated}</p>
        <div className="mt-10 flex flex-col gap-4 text-[15.5px] leading-relaxed text-white/85 [&_h2]:mt-6 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-[1.25rem] [&_h2]:font-semibold [&_h2]:text-white [&_strong]:font-semibold [&_strong]:text-white">
          {children}
        </div>
      </article>
    </main>
  );
}
