import { getContent } from "@/lib/content/store";
import ProjectsHologram from "./ProjectsHologram";

/**
 * Section « Projets » : le globe en hologramme, juste sous le slogan (« Nos projets — Notre objectif :
 * vous surprendre »), qui lui sert d'en-tête. Le titre reste présent pour les lecteurs d'écran.
 */
export default async function ProjectsSection() {
  const { projects, categories } = await getContent();
  return (
    <section id="projets" aria-labelledby="projets-titre" className="relative scroll-mt-24 px-4 pb-24 pt-2 sm:px-8 lg:pb-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <h2 id="projets-titre" className="sr-only">
          Nos projets
        </h2>
        <ProjectsHologram projects={projects} categories={categories} />
      </div>
    </section>
  );
}
