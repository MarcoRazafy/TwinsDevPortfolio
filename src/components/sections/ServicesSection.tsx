"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { SERVICES, SPECIALTIES, STEPS, type Service, type Specialty } from "@/lib/services";
import { INSET, RAISED, RAISED_SM, SURFACE } from "./neumorphism";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10% 0px" } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/* ── Animations d'entrée (transform + opacity uniquement, jouées une fois) ── */
const cardIn: Variants = {
  hidden: { opacity: 0, y: 44, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 16, delay: (i % 3) * 0.1 + Math.floor(i / 3) * 0.06 },
  }),
};
const panelIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EXPO_OUT } },
};
const sweepIn: Variants = {
  hidden: { x: "0%" },
  show: { x: "420%", transition: { duration: 1.8, ease: [0.45, 0, 0.2, 1], delay: 0.35 } },
};
/* Les spécialités arrivent une à une depuis la droite */
const rowIn: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: (i: number) => ({ opacity: 1, x: 0, transition: { duration: 0.7, ease: EXPO_OUT, delay: 0.25 + i * 0.07 } }),
};

/* ── Carré numéroté (la couleur vient de --accent-card) ── */
const CHIP: CSSProperties = {
  background: "linear-gradient(145deg, color-mix(in srgb, var(--accent-card) 45%, white), var(--accent-card) 58%, color-mix(in srgb, var(--accent-card) 70%, #0f766e))",
};

/** Repère de partie : « 01 — Ce qu'on fait ». */
function Kicker({ index, children, className = "" }: { index: string; children: ReactNode; className?: string }) {
  return (
    <p className={`mb-6 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white/45 ${className}`}>
      <span className="text-accent-strong">{index}</span>
      <span aria-hidden className="h-px w-8 bg-gradient-to-r from-accent/60 to-transparent" />
      {children}
    </p>
  );
}

/** Carré en dégradé (icône), avec un reflet qui le traverse au survol. */
function Chip({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      aria-hidden
      style={CHIP}
      className={`relative grid shrink-0 place-items-center overflow-hidden text-[#03140c] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_26px_-12px_var(--accent-card)] ${className}`}
    >
      {children}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent_25%,rgba(255,255,255,0.7)_50%,transparent_75%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
    </span>
  );
}

/**
 * Carte d'un service en relief doux (même matière que les widgets du contact) : un panneau en relief avec
 * l'icône dans un creux et son voyant, le numéro dans une pastille ronde, le titre et la description.
 */
function ServiceCard({ service, index, reduce }: { service: Service; index: number; reduce: boolean }) {
  const Icon = service.icon;
  return (
    <motion.article
      variants={cardIn}
      custom={index}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={VIEWPORT}
      style={{ "--accent-card": service.accent } as CSSProperties}
      className={`group flex flex-col gap-4 rounded-[34px] p-4 ${SURFACE} ${RAISED}`}
    >
      <div
        className={`flex flex-1 flex-col rounded-[26px] p-5 ${SURFACE} ${RAISED_SM} transition-transform duration-300 ease-out group-hover:-translate-y-0.5`}
      >
        <div className="flex items-start justify-between">
          {/* Icône dans un creux, éclairée de la couleur du service, avec un voyant allumé */}
          <span
            className={`relative grid h-14 w-14 place-items-center rounded-[18px] ${INSET}`}
            style={{ background: `radial-gradient(circle at 30% 25%, color-mix(in srgb, ${service.accent} 24%, transparent), transparent 65%), #0a0f13` }}
          >
            <Icon
              size={24}
              strokeWidth={2}
              aria-hidden
              style={{ color: service.accent }}
              className="drop-shadow-[0_0_8px_var(--accent-card)] transition-transform duration-300 ease-out group-hover:scale-110"
            />
            <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
          </span>
          {/* Numéro dans une pastille ronde en relief, qui s'éclaire au survol */}
          <span
            aria-hidden
            className={`grid h-10 w-10 place-items-center rounded-full font-mono text-[12px] text-white/60 transition-colors duration-300 group-hover:text-accent-strong ${SURFACE} ${RAISED_SM}`}
          >
            {pad(index + 1)}
          </span>
        </div>

        <h3 className="mt-5 font-[family-name:var(--font-display)] text-[1.3rem] font-bold leading-tight tracking-[-0.02em] text-balance">
          {service.title}
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{service.pitch}</p>
      </div>
    </motion.article>
  );
}

/** Une spécialité : ligne en relief avec l'icône dans le carré vert et le titre. */
function SpecialtyRow({ item, index }: { item: Specialty; index: number }) {
  const Icon = item.icon;
  return (
    <motion.li
      variants={rowIn}
      custom={index}
      style={{ "--accent-card": "#22c55e" } as CSSProperties}
      className={`group flex items-center gap-3.5 rounded-[22px] py-3 pl-3 pr-4 transition-transform duration-300 ease-out hover:-translate-y-0.5 sm:gap-4 sm:pl-3.5 ${SURFACE} ${RAISED_SM}`}
    >
      <Chip className="h-9 w-9 rounded-xl">
        <Icon size={18} strokeWidth={2.2} aria-hidden className="transition-transform duration-300 group-hover:scale-110" />
      </Chip>
      <h4 className="min-w-0 font-[family-name:var(--font-display)] text-[1.02rem] font-semibold leading-snug text-white/85 transition-colors duration-300 group-hover:text-white">
        {item.title}
      </h4>
    </motion.li>
  );
}

/** Panneau « Nos spécialités » : titre et liste des spécialités, au milieu. */
function SpecialtiesPanel({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      variants={panelIn}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={VIEWPORT}
      className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#070a10] p-6 sm:p-8 lg:p-12"
    >
      {/* Lueurs, trame et reflet qui balaie le panneau une seule fois */}
      <div aria-hidden className="pointer-events-none absolute -bottom-56 left-1/2 -z-10 h-[30rem] w-[min(60rem,140%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.22),rgba(45,212,191,0.07)_55%,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.12),transparent)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(55%_70%_at_15%_30%,#000,transparent)]" />
      {!reduce && (
        <motion.div
          aria-hidden
          variants={sweepIn}
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(134,239,172,0.09),transparent)]"
        />
      )}

      {/* Titre et spécialités, au milieu du panneau */}
      <div className="mx-auto w-full max-w-[760px]">
        <Kicker index="02" className="justify-center">
          Nos spécialités
        </Kicker>
        <ul className="flex flex-col gap-3">
          {SPECIALTIES.map((s, i) => (
            <SpecialtyRow key={s.title} item={s} index={i} />
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/** Section « Services » : ce qu'on fait (cartes), nos spécialités (panneau), puis le déroulé d'un projet. */
export default function ServicesSection() {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  return (
    <section id="services" aria-labelledby="services-titre" className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          id="services-titre"
          title={
            <>
              Ce qu&apos;on peut faire <span className="text-glow">pour vous</span>
            </>
          }
          lede="Du site web au serveur : on conçoit, on développe, on héberge et on maintient. Chaque projet est chiffré sur devis, après un premier échange."
        />

        {/* ── 01 · Ce qu'on fait ── */}
        <Kicker index="01">Ce qu&apos;on fait</Kicker>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} reduce={reduce} />
          ))}
        </div>

        {/* ── 02 · Nos spécialités ── */}
        <div className="mt-20 lg:mt-28">
          <SpecialtiesPanel reduce={reduce} />
        </div>

        {/* ── 03 · Déroulé d'un projet ── */}
        <div className="mt-20 lg:mt-28">
          <Kicker index="03">Comment se passe un projet</Kicker>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li key={step.title} {...reveal(0.1 + i * 0.1)} className="relative flex flex-col gap-3 border-t-2 border-white/15 pt-5">
                <span
                  aria-hidden
                  className="absolute -top-[7px] left-0 h-3 w-3 rounded-full bg-accent shadow-[0_0_0_5px_#05070c,0_0_18px_rgba(34,197,94,0.8)]"
                />
                <span className="font-mono text-[12.5px] text-accent">{pad(i + 1)}</span>
                <h4 className="font-[family-name:var(--font-display)] text-[1.08rem] font-semibold">{step.title}</h4>
                <p className="text-[14.5px] leading-relaxed text-muted">{step.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
