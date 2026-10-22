import TechHologram from "./TechHologram";

/** Section « Nos technologies » : en-tête, puis le cylindre holographique (pleine largeur) où tournent les technos. */
export default function TechSection() {
  return (
    <section
      id="technologies"
      aria-labelledby="technologies-titre"
      className="relative scroll-mt-24 py-24 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-8">
        <div className="mx-auto mb-10 flex max-w-[680px] flex-col items-center gap-4 text-center lg:mb-12">
          <p className="font-mono text-[13px] tracking-wide text-accent-strong">/technologies</p>
          <h2
            id="technologies-titre"
            className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
          >
            Nos <span className="text-glow">technologies</span>
          </h2>
          <p className="max-w-[36em] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">
            Les outils avec lesquels on conçoit, développe, automatise et déploie vos projets, de l&apos;interface
            jusqu&apos;au serveur.
          </p>
        </div>
      </div>

      {/* Le panneau holographique occupe toute la largeur de l'écran */}
      <TechHologram />
    </section>
  );
}
