"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { Twin } from "@/lib/team";
import { INSET, RAISED_SM, SURFACE } from "@/components/sections/neumorphism";
import { TwinDetails, TwinPortrait } from "./TwinProfile";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/* Pile de portraits : la personne choisie devant ; l'autre derrière, en haut à droite, plus petite et dans l'ombre */
const FRONT = { x: "0%", y: "0%", scale: 1, opacity: 1, filter: "brightness(1) saturate(1)" };
const BACK = { x: "24%", y: "-6%", scale: 0.78, opacity: 0.75, filter: "brightness(0.45) saturate(0.7)" };

/* Le texte sort du côté opposé au geste, le suivant arrive de l'autre côté */
const slide: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EXPO_OUT } },
  exit: (d: number) => ({ opacity: 0, x: d * -60, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }),
};
const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * « L'équipe derrière vos projets » : un sélecteur (Marco / Loïc), les deux portraits empilés (la personne choisie
 * devant) et le texte de la personne choisie. On change en cliquant sur un nom ou sur la photo de derrière,
 * avec les flèches du clavier, ou en faisant glisser les photos.
 */
export default function TeamSwitcher({ team }: { team: Twin[] }) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const count = team.length;

  const select = useCallback((j: number) => setState((p) => (p[0] === j ? p : [j, j > p[0] ? 1 : -1])), []);
  const step = useCallback((s: number) => setState(([i]) => [(i + s + count) % count, s]), [count]);

  // Onglets : les flèches gauche / droite passent d'un profil à l'autre (motif « tabs » de l'ARIA)
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + count) % count;
    setState([next, e.key === "ArrowRight" ? 1 : -1]);
    tabs.current[next]?.focus();
  };
  // Glisser les photos : la distance et l'élan du geste décident du sens
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power < -60) step(1);
    else if (power > 60) step(-1);
  };

  const twin = team[index];
  if (!twin) return null;

  return (
    <div className="flex flex-col gap-10 lg:gap-14">
      {/* ── Sélecteur ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="tablist" aria-label="Choisir un profil" onKeyDown={onKeyDown} className={`inline-flex gap-1 rounded-full p-1.5 ${SURFACE} ${INSET}`}>
          {team.map((t, j) => {
            const on = j === index;
            return (
              <button
                key={t.slug}
                ref={(el) => {
                  tabs.current[j] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${t.slug}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(j)}
                className="group relative flex h-12 cursor-pointer items-center gap-2.5 rounded-full pl-1.5 pr-5 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Pastille en relief qui glisse sous le nom choisi */}
                {on && (
                  <motion.span
                    layoutId={`${uid}-pill`}
                    aria-hidden
                    className={`absolute inset-0 rounded-full ${SURFACE} ${RAISED_SM}`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={`relative h-9 w-9 overflow-hidden rounded-full ring-1 ${on ? "ring-white/25" : "ring-white/10"}`}
                  style={{ background: `radial-gradient(circle at 50% 30%, ${t.accent}55, #0a0f13 72%)` }}
                >
                  <Image src={t.image.src} alt="" width={72} height={72} className="h-full w-full object-cover object-top" />
                </span>
                <span className={`relative transition-colors duration-300 ${on ? "text-white" : "text-white/45 group-hover:text-white/80"}`}>{t.name}</span>
                {on && <span aria-hidden className="relative h-1.5 w-1.5 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">Touchez un nom ou glissez la photo</p>
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-24">
        {/* ── Portraits empilés (on les fait glisser) ── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12% 0px" }}
          transition={reduce ? { duration: 0.3 } : { duration: 0.9, ease: EXPO_OUT }}
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          className="relative mx-auto w-full max-w-[420px] cursor-grab active:cursor-grabbing lg:max-w-[480px]"
        >
          <div className="relative aspect-square">
            {team.map((t, j) => {
              const front = j === index;
              return (
                <motion.div
                  key={t.slug}
                  aria-hidden={!front}
                  title={front ? undefined : `Voir ${t.name}`}
                  onClick={front ? undefined : () => select(j)}
                  className={`absolute inset-0 ${front ? "" : "cursor-pointer"}`}
                  style={{ zIndex: front ? 2 : 1, transformOrigin: "50% 60%" }}
                  initial={false}
                  animate={front ? FRONT : BACK}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20, mass: 0.9 }}
                >
                  <TwinPortrait twin={t} active={front} />
                </motion.div>
              );
            })}

            {/* Bouton posé sur la photo de derrière : fait passer cette personne devant */}
            {count > 1 && (
              <button
                type="button"
                onClick={() => step(1)}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={`Voir ${team[(index + 1) % count].name}`}
                title={`Voir ${team[(index + 1) % count].name}`}
                className="group absolute right-1 top-[44%] z-[3] grid h-12 w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-[#0c1116]/90 text-accent-strong shadow-[0_0_26px_-4px_rgba(34,197,94,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-accent/50 transition-[background-color,color,scale] duration-200 hover:scale-110 hover:bg-accent hover:text-[#03140c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 lg:-right-[6%]"
              >
                {!reduce && <span aria-hidden className="absolute inset-0 animate-ping rounded-full ring-2 ring-accent/40 [animation-duration:2.4s]" />}
                <ChevronRight size={22} strokeWidth={2.4} aria-hidden className="relative transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Texte de la personne choisie ── */}
        <div className="relative min-w-0">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={twin.slug}
              custom={dir}
              variants={reduce ? fade : slide}
              initial="enter"
              animate="center"
              exit="exit"
              role="tabpanel"
              id={`${uid}-panel`}
              aria-labelledby={`${uid}-tab-${twin.slug}`}
            >
              <TwinDetails twin={twin} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
