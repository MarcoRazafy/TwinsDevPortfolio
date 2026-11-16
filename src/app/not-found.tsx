import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page introuvable — TwinsDev",
  description: "Cette page n'existe pas ou a été déplacée.",
  robots: { index: false, follow: true },
};

/** Page 404 : affichée pour toute adresse inconnue. */
export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-24">
      {/* Halo et trame, comme sur le reste du site */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[520px] w-[min(900px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.18),rgba(45,212,191,0.06)_55%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(190,255,220,0.14)_1px,transparent_1.4px)] [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(55%_60%_at_50%_50%,#000,transparent)]"
      />

      <div className="flex max-w-[620px] flex-col items-center text-center">
        <p className="mb-6 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-accent-strong">
          <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-accent/70" />
          Erreur 404
          <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-accent/70" />
        </p>

        <p aria-hidden className="font-[family-name:var(--font-display)] text-[clamp(5rem,18vw,10rem)] font-bold leading-[0.85] tracking-[-0.06em] text-glow">
          404
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-tight tracking-[-0.02em] text-balance">
          Cette page n&apos;existe pas
        </h1>
        <p className="mt-3 max-w-[46ch] text-[1.02rem] leading-relaxed text-muted">
          Le lien est peut-être incomplet, ou la page a été déplacée. Revenez à l&apos;accueil : nos projets, nos services et le
          formulaire de contact s&apos;y trouvent.
        </p>

        <Link
          href="/"
          className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-[#03140c] shadow-[0_10px_30px_-10px_rgba(34,197,94,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft size={17} aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
