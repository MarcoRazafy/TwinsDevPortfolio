import { getTeam } from "@/lib/content/store";
import TwinProfile from "./TwinProfile";

/** Section « À propos » : un bloc par jumeau, en alternance (portrait à gauche, puis à droite). */
export default async function AboutSection() {
  const team = await getTeam();
  return (
    <section
      id="apropos"
      aria-labelledby="apropos-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-20 lg:gap-32">
        <div className="flex max-w-[680px] flex-col gap-4">
          <p className="font-mono text-[13px] tracking-wide text-accent-strong">/a-propos</p>
          <h2
            id="apropos-titre"
            className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
          >
            Deux frères, <span className="text-glow">un seul binôme</span>
          </h2>
          <p className="max-w-[36em] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">
            Jumeaux et ingénieurs IT, on travaille à deux sur chaque projet : l&apos;un conçoit ce que vous voyez,
            l&apos;autre construit ce qui tourne derrière. Chaque ligne de code est relue par l&apos;autre avant
            d&apos;être livrée.
          </p>
        </div>

        {team.map((twin, index) => (
          <TwinProfile key={twin.slug} twin={twin} index={index} />
        ))}
      </div>
    </section>
  );
}
