import { getContent } from "@/lib/content/store";
import ProjectsHologram from "./ProjectsHologram";

/** Section « Projets » : en-tête, puis le globe en hologramme autour duquel tournent les réalisations. */
export default async function ProjectsSection() {
  const { projects, categories } = await getContent();
  return (
    <section
      id="projets"
      aria-labelledby="projets-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mx-auto mb-10 flex max-w-[680px] flex-col items-center gap-4 text-center">
          <h2
            id="projets-titre"
            className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
          >
            Ce qu&apos;on a <span className="text-glow">construit</span>
          </h2>
          <p className="max-w-[36em] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">
            Chaque projet part d&apos;un besoin concret. Choisissez un type : nos réalisations se projettent autour du globe.
          </p>
        </div>

        <ProjectsHologram projects={projects} categories={categories} />
      </div>
    </section>
  );
}
