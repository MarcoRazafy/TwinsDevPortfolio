"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
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
const pillIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: (d: number) => ({ opacity: 1, x: 0, transition: { duration: 0.6, ease: EXPO_OUT, delay: d } }),
};
const panelIn: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EXPO_OUT } },
};
const sweepIn: Variants = {
  hidden: { x: "0%" },
  show: { x: "420%", transition: { duration: 1.8, ease: [0.45, 0, 0.2, 1], delay: 0.35 } },
};
/* Les tiroirs arrivent un à un depuis la droite, comme si on les rangeait */
const drawerIn: Variants = {
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
 * l'icône dans un creux et son voyant, le numéro dans une pastille ronde, puis ce qui est inclus en pastilles creusées.
 */
function ServiceCard({ service, index, reduce }: { service: Service; index: number; reduce: boolean }) {
  const Icon = service.icon;
  const base = 0.35 + (index % 3) * 0.1;
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

      {/* Ce qui est inclus : liste simple, petite coche ronde de la couleur du service */}
      <ul className="flex flex-col gap-2 px-3 pb-2 text-[14px] text-white/85">
        {service.includes.map((line, j) => (
          <motion.li key={line} variants={pillIn} custom={base + j * 0.08} className="flex gap-2.5">
            <span
              className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full"
              style={{ background: `${service.accent}26`, color: service.accent }}
            >
              <Check size={11} strokeWidth={3} aria-hidden />
            </span>
            {line}
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}

/**
 * Un tiroir : la façade (icône, titre, poignée) s'ouvre sur l'intérieur creusé qui contient le texte.
 * Ouverture en douceur par la hauteur de grille (0fr → 1fr) ; le contenu fermé est inerte (ni lu, ni focalisable).
 */
function SpecialtyDrawer({ item, index, open, onToggle }: { item: Specialty; index: number; open: boolean; onToggle: () => void }) {
  const Icon = item.icon;
  const id = `specialite-${index + 1}`;
  return (
    <motion.li
      variants={drawerIn}
      custom={index}
      style={{ "--accent-card": "#22c55e" } as CSSProperties}
      className={`group rounded-[22px] transition-shadow duration-300 ${SURFACE} ${open ? RAISED : RAISED_SM}`}
    >
      <h4>
        <button
          type="button"
          id={`${id}-facade`}
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-contenu`}
          className="flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] py-3 pl-3 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4 sm:pl-3.5"
        >
          <Chip className="h-9 w-9 rounded-xl">
            <Icon size={18} strokeWidth={2.2} aria-hidden className={`transition-transform duration-300 ${open ? "scale-110" : ""}`} />
          </Chip>
          <span
            className={`min-w-0 flex-1 font-[family-name:var(--font-display)] text-[1.02rem] font-semibold leading-snug transition-colors duration-300 ${
              open ? "text-white" : "text-white/80 group-hover:text-white"
            }`}
          >
            {item.title}
          </span>
          {/* Poignée du tiroir : en relief, la flèche se retourne à l'ouverture */}
          <span
            aria-hidden
            className={`grid h-8 w-12 shrink-0 place-items-center rounded-full transition-[color,box-shadow] duration-300 ${SURFACE} ${
              open ? `${INSET} text-accent-strong` : `${RAISED_SM} text-white/55 group-hover:text-white`
            }`}
          >
            <ChevronDown size={17} strokeWidth={2.4} className={`transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </h4>

      <div
        id={`${id}-contenu`}
        role="region"
        aria-labelledby={`${id}-facade`}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {/* Intérieur du tiroir, creusé */}
          <p
            className={`mx-3 mb-3 rounded-[16px] px-4 py-3.5 text-[14px] leading-relaxed text-muted transition-[opacity,translate] duration-500 ease-out ${INSET} ${
              open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            {item.text}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

/** Panneau « Nos spécialités » : titre et tiroirs au milieu (un seul tiroir ouvert à la fois). */
function SpecialtiesPanel({ reduce }: { reduce: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
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

      {/* Titre et tiroirs, au milieu du panneau */}
      <div className="mx-auto w-full max-w-[760px]">
        <Kicker index="02" className="justify-center">
          Nos spécialités
        </Kicker>
        <ul className="flex flex-col gap-3">
          {SPECIALTIES.map((s, i) => (
            <SpecialtyDrawer key={s.title} item={s} index={i} open={open === i} onToggle={() => setOpen((o) => (o === i ? null : i))} />
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
