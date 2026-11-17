import { getContent } from "@/lib/content/store";
import { techLabel } from "@/lib/tech";
import ProjectsHologram from "./ProjectsHologram";

/**
 * Section « Projets » : le globe en hologramme, juste sous le slogan (« Nos projets — Notre objectif :
 * vous surprendre »), qui lui sert d'en-tête. Le titre reste présent pour les lecteurs d'écran.
 */
export default async function ProjectsSection() {
  const { projects, categories } = await getContent();
  const libelle = Object.fromEntries(categories.map((c) => [c.key, c.label]));

  return (
    <section id="projets" aria-labelledby="projets-titre" className="relative scroll-mt-24 px-4 pb-24 pt-2 sm:px-8 lg:pb-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <h2 id="projets-titre" className="sr-only">
          Nos projets
        </h2>
        <ProjectsHologram projects={projects} categories={categories} />

        {/* Même liste que le globe, en texte : le globe se lit à la souris, ni au lecteur d'écran ni par un moteur
            de recherche. Les détails complets restent dans la fiche qui s'ouvre au clic sur une image. */}
        <ul className="sr-only">
          {projects.map((p) => (
            <li key={p.slug}>
              <h3>{p.title}</h3>
              <p>{[p.kind, ...p.categories.map((c) => libelle[c] ?? c)].filter(Boolean).join(" · ")}</p>
              {p.problem && <p>{p.problem}</p>}
              {p.delivered.length > 0 && (
                <ul>
                  {p.delivered.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
              {p.stack.length > 0 && <p>Technologies : {p.stack.map(techLabel).join(", ")}.</p>}
              {p.links.site && <a href={p.links.site}>Voir le site de {p.title}</a>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
