import { PROJECTS } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

/** Section « Projets » : en-tête, puis les réalisations en grille de cartes. */
export default function ProjectsSection() {
  return (
    <section
      id="projets"
      aria-labelledby="projets-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >

      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-12 flex max-w-[680px] flex-col gap-4 lg:mb-16">
          <p className="font-mono text-[13px] tracking-wide text-accent-strong">/projets</p>
          <h2
            id="projets-titre"
            className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.025em] text-balance"
          >
            Ce qu&apos;on a <span className="text-glow">construit</span>
          </h2>
          <p className="max-w-[36em] text-[1.05rem] leading-relaxed text-muted sm:text-[1.12rem]">
            Chaque projet part d&apos;un besoin concret. Voici ce qu&apos;on a livré, et avec quoi.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 [perspective:1400px]">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
