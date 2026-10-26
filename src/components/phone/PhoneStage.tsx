"use client";

import { Suspense, use, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { BackgroundChoice } from "@/components/backgrounds/names";
import { BACKGROUNDS } from "@/components/backgrounds/registry";
import TwinsHero from "@/components/twins/TwinsHero";
import PhoneMockup from "./PhoneMockup";
import { RESTORE_STYLE_ID, readPhoneOn, readScroll, saveScroll, subscribePhoneOn, writePhoneOn } from "./remember";
import type { PhoneState } from "./types";

type ChosenProps = { choice: Promise<BackgroundChoice>; state: PhoneState };

/** Résout le choix d'arrière-plan (issu de l'URL) puis affiche la variante correspondante. */
function ChosenBackground({ choice, state }: ChosenProps) {
  const name = use(choice);
  if (name === "none") return null;
  const Background = BACKGROUNDS[name];
  return <Background state={state} />;
}

type Props = {
  background: Promise<BackgroundChoice>;
  /** Le reste du site (accroche, projets…) : rendu seulement une fois le téléphone allumé. */
  children: ReactNode;
};

/**
 * Scène d'accueil : à l'arrivée, seul le téléphone est visible, centré. Une fois allumé, les jumeaux
 * prennent la place de gauche, le téléphone glisse vers la droite, et le reste du site apparaît en dessous.
 */
export default function PhoneStage({ background, children }: Props) {
  // Téléphone déjà allumé lors d'une visite précédente ? (faux côté serveur et pendant l'hydratation)
  const remembered = useSyncExternalStore(subscribePhoneOn, readPhoneOn, () => false);
  // État choisi par le visiteur pendant cette visite ; tant qu'il n'a rien fait, on suit la mémoire
  const [chosen, setChosen] = useState<PhoneState | null>(null);
  const state: PhoneState = chosen ?? (remembered ? "on" : "locked");
  // Rallumé depuis la mémoire : on arrive directement sur le site, sans animation de mise en place
  const restored = chosen === null && remembered;
  const setState = (next: PhoneState) => {
    setChosen(next);
    if (next === "on") writePhoneOn(true);
    if (next === "locked") writePhoneOn(false);
  };
  const reduce = useReducedMotion() ?? false;
  const anchorRef = useRef<HTMLDivElement>(null);
  const shifted = state !== "locked";
  const on = state === "on";

  // Mémorise la position de défilement en quittant la page (actualisation comprise)
  useEffect(() => {
    window.addEventListener("pagehide", saveScroll);
    return () => window.removeEventListener("pagehide", saveScroll);
  }, []);

  // Rallumé depuis la mémoire : la scène réapparaît, et on revient là où l'on était dans la page
  useEffect(() => {
    if (!restored) return;
    document.getElementById(RESTORE_STYLE_ID)?.remove();
    const top = readScroll();
    if (!top) return;
    // Le reste du site vient d'être rendu : on attend sa mise en page avant de défiler
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
    });
    return () => cancelAnimationFrame(raf);
  }, [restored]);

  // Sécurité : la feuille de masquage ne doit jamais rester si le téléphone est éteint
  useEffect(() => {
    if (state === "locked") document.getElementById(RESTORE_STYLE_ID)?.remove();
  }, [state]);

  // Publie le décalage du téléphone par rapport au centre de la scène (utilisé par l'arrière-plan « faisceaux »)
  useEffect(() => {
    const anchor = anchorRef.current;
    const stage = anchor?.closest<HTMLElement>("[data-stage]");
    if (!anchor || !stage) return;
    const publish = () => {
      // offsetLeft / offsetTop ignorent la transformation en cours : c'est la position d'arrivée
      const dx = anchor.offsetLeft + anchor.offsetWidth / 2 - stage.clientWidth / 2;
      const dy = anchor.offsetTop + anchor.offsetHeight / 2 - stage.clientHeight / 2;
      stage.style.setProperty("--phone-dx", `${Math.round(dx)}px`);
      stage.style.setProperty("--phone-dy", `${Math.round(dy)}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [shifted]);

  return (
    <>
      <section
        id="accueil"
        data-stage
        className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16 sm:px-8 lg:py-12"
      >
        {/* Seul l'arrière-plan attend l'URL : le téléphone fait partie de la coquille statique */}
        <Suspense fallback={null}>
          <ChosenBackground choice={background} state={state} />
        </Suspense>

        <div className="flex w-full max-w-[1320px] flex-col items-center justify-center lg:flex-row">
          {/* Les jumeaux : repliés tant que le téléphone est éteint, c'est leur arrivée qui pousse le téléphone à droite */}
          <div
            inert={!on}
            className={
              shifted
                ? "mb-8 w-full flex-none lg:mb-0 lg:mr-10 lg:w-auto lg:min-w-0 lg:flex-1"
                : "h-0 w-0 flex-none overflow-hidden"
            }
          >
            <TwinsHero visible={on} />
          </div>

          {/* `layout` : quand les jumeaux prennent leur place, le téléphone glisse jusqu'à sa nouvelle position.
              La marge droite réserve l'espace des cartes flottantes. */}
          <motion.div
            ref={anchorRef}
            data-phone-anchor
            layout={reduce || restored ? false : "position"}
            transition={{ layout: { type: "spring", stiffness: 70, damping: 16 } }}
            className={shifted ? "lg:mr-[230px]" : undefined}
          >
            <PhoneMockup state={state} onStateChange={setState} />
          </motion.div>
        </div>

        {/* Fondu vers le fond du reste du site, pour une jonction sans raccord */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-[linear-gradient(to_bottom,transparent,#05070c)]"
        />

        {/* Invitation à défiler, une fois le site dévoilé */}
        <motion.a
          href="#projets"
          aria-label="Découvrir la suite"
          initial={false}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: on ? 2.2 : 0 }}
          inert={!on}
          className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-[12px] tracking-wide text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Découvrir
          <ChevronDown size={18} aria-hidden className="animate-bounce motion-reduce:animate-none" />
        </motion.a>
      </section>

      {/* Le reste du site n'existe qu'une fois le téléphone allumé */}
      {on && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative isolate overflow-hidden bg-[#05070c]"
        >
          {/* Un seul fond pour toutes les sections : trame de points et halos répartis sur la hauteur */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(190,255,220,0.16)_1px,transparent_1.4px)] [background-size:30px_30px] opacity-25 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_90%,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,#000_10%)] bg-[radial-gradient(55%_18%_at_50%_4%,rgba(34,197,94,0.14),transparent_70%),radial-gradient(45%_14%_at_92%_22%,rgba(129,140,248,0.09),transparent_70%),radial-gradient(45%_14%_at_6%_46%,rgba(45,212,191,0.1),transparent_70%),radial-gradient(45%_12%_at_90%_64%,rgba(34,197,94,0.08),transparent_70%),radial-gradient(55%_16%_at_15%_92%,rgba(34,197,94,0.12),transparent_70%)]"
          />
          {children}
        </motion.div>
      )}
    </>
  );
}
