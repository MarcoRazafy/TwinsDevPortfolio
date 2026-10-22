import { parseBackground } from "@/components/backgrounds/names";
import AboutSection from "@/components/about/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import FaqSection from "@/components/sections/FaqSection";
import ServicesSection from "@/components/sections/ServicesSection";
import SiteFooter from "@/components/sections/SiteFooter";
import SiteNav from "@/components/sections/SiteNav";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PhoneStage from "@/components/phone/PhoneStage";
import ProjectsSection from "@/components/projects/ProjectsSection";
import TechSection from "@/components/tech/TechSection";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function Home({ searchParams }: Props) {
  // ?bg=dispersion | beams | none : choisit l'arrière-plan affiché.
  // La promesse est résolue derrière un <Suspense> dans PhoneStage : la page reste prérendue.
  const background = searchParams.then(({ bg }) => parseBackground(bg));

  return (
    <main className="flex flex-1 flex-col">
      {/* À l'arrivée : le téléphone seul. Les sections passées en enfants n'apparaissent qu'une fois allumé. */}
      <PhoneStage background={background}>
        <SiteNav />
        <ProjectsSection />
        <ServicesSection />
        <AboutSection />
        <TechSection />
        <TestimonialsSection />
        <FaqSection />
        <ContactSection />
        <SiteFooter />
      </PhoneStage>
    </main>
  );
}
