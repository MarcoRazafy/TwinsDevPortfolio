import { getTeam } from "@/lib/content/store";
import TeamSwitcher from "./TeamSwitcher";

/** Section « À propos » : un sélecteur Marco / Loïc, un seul profil affiché à la fois (on peut glisser la photo). */
export default async function AboutSection() {
  const team = await getTeam();
  return (
    <section
      id="apropos"
      aria-labelledby="apropos-titre"
      className="relative scroll-mt-24 overflow-x-clip px-4 py-24 sm:px-8 lg:py-32"
    >

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 lg:gap-10">
        <div className="flex max-w-[680px] flex-col gap-4">
          <h2
            id="apropos-titre"
            className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
          >
            L&apos;équipe derrière <span className="text-glow">vos projets</span>
          </h2>
        </div>

        <TeamSwitcher team={team} />
      </div>
    </section>
  );
}
