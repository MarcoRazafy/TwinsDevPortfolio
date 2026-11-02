import { getTestimonials } from "@/lib/content/store";
import SectionHead from "./SectionHead";
import TestimonialsShowcase from "./TestimonialsShowcase";

/** Section « Avis » (modifiable depuis l'administration) : masquée tant que la liste est vide. */
export default async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section id="avis" aria-labelledby="avis-titre" className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          path="/avis"
          id="avis-titre"
          title={
            <>
              Ils nous ont fait <span className="text-glow">confiance</span>
            </>
          }
          lede="Ce qu'en disent les entreprises qui nous ont confié leur projet."
        />
        <TestimonialsShowcase testimonials={testimonials} />
      </div>
    </section>
  );
}
