"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import { Check } from "lucide-react";
import { SERVICES, SPECIALTIES, STEPS, type Service, type Specialty } from "@/lib/services";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-10% 0px" } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/* ── Animations d'entrée (transform + opacity uniquement, jouées une fois) ── */
const cardIn: Variants = {
  hidden: { opacity: 0, y: 44, rotateX: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.95, ease: EXPO_OUT, delay: (i % 3) * 0.1 } }),
};
const chipIn: Variants = {
  hidden: { opacity: 0, scale: 0.4, rotate: -24 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 320, damping: 16, delay: 0.3 + (i % 3) * 0.1 },
  }),
};
const ruleIn: Variants = {
  hidden: { scaleX: 0 },
  show: (i: number) => ({ scaleX: 1, transition: { duration: 0.9, ease: EXPO_OUT, delay: 0.45 + (i % 3) * 0.1 } }),
};
const lineIn: Variants = {
  hidden: { opacity: 0, x: -14 },
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
const tileIn: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EXPO_OUT, delay: 0.25 + i * 0.07 } }),
};

/* ── Calques des cartes (dégradés seuls, sans filtre de flou ; la couleur vient de --accent-card) ── */
const BORDER: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.03) 62%, color-mix(in srgb, var(--accent-card) 65%, transparent))",
};
const BORDER_SPOT: CSSProperties = {
  background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), var(--accent-card), transparent 70%)",
};
const RISING_GLOW: CSSProperties = {
  background: "radial-gradient(85% 75% at 50% 108%, color-mix(in srgb, var(--accent-card) 32%, transparent), transparent 72%)",
};
const INNER_SPOT: CSSProperties = {
  background:
    "radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--accent-card) 14%, transparent), transparent 62%)",
};
const CHIP: CSSProperties = {
  background: "linear-gradient(145deg, color-mix(in srgb, var(--accent-card) 45%, white), var(--accent-card) 58%, color-mix(in srgb, var(--accent-card) 70%, #0f766e))",
};

/** Halo qui suit la souris : position gardée dans des variables CSS (aucun rendu React). */
function trackPointer(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/** Repère de partie : « 01 — Ce qu'on fait ». */
function Kicker({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="mb-7 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-white/55">
      <span className="text-accent-strong">{index}</span>
      <span aria-hidden className="h-px w-10 bg-gradient-to-r from-accent/70 to-transparent" />
      {children}
    </p>
  );
}

/** Carré numéroté en dégradé, avec un reflet qui le traverse au survol de la carte. */
function NumberChip({ value, className }: { value: string; className: string }) {
  return (
    <span
      aria-hidden
      style={CHIP}
      className={`relative grid shrink-0 place-items-center overflow-hidden font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] text-[#03140c] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_26px_-12px_var(--accent-card)] ${className}`}
    >
      {value}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent_25%,rgba(255,255,255,0.7)_50%,transparent_75%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
    </span>
  );
}

/** Carte d'un service : bordure dégradée, lueur qui monte du bas, carré numéroté et halo qui suit la souris. */
function ServiceCard({ service, index, reduce }: { service: Service; index: number; reduce: boolean }) {
  const Icon = service.icon;
  return (
    <motion.article
      variants={cardIn}
      custom={index}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={VIEWPORT}
      onPointerMove={trackPointer}
      style={{ "--accent-card": service.accent, transformPerspective: 900 } as CSSProperties}
      className="group relative isolate h-full rounded-[26px] p-px transition-[translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5"
    >
      {/* Bordure : dégradé fixe, puis un éclat de la couleur du service sous la souris */}
      <div aria-hidden className="absolute inset-0 -z-10 rounded-[26px]" style={BORDER} />
      <div aria-hidden className="absolute inset-0 -z-10 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={BORDER_SPOT} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-[25px] bg-[linear-gradient(180deg,#0b0f17,#070a10)] p-6 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100" style={RISING_GLOW} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={INNER_SPOT} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(65%_55%_at_100%_0%,#000,transparent)]"
        />

        <div className="relative flex items-start justify-between">
          <motion.span variants={chipIn} custom={index} className="inline-grid">
            <NumberChip value={pad(index + 1)} className="h-12 w-12 rounded-[14px] text-[15px]" />
          </motion.span>
          <span
            className="grid h-11 w-11 place-items-center rounded-full border transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-12 group-hover:scale-110"
            style={{
              color: service.accent,
              borderColor: `color-mix(in srgb, ${service.accent} 40%, transparent)`,
              background: `color-mix(in srgb, ${service.accent} 10%, transparent)`,
            }}
          >
            <Icon size={20} strokeWidth={2} aria-hidden />
          </span>
        </div>

        <h3 className="relative mt-7 font-[family-name:var(--font-display)] text-[1.3rem] font-semibold leading-tight tracking-[-0.015em] text-balance">
          {service.title}
        </h3>
        <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted">{service.pitch}</p>

        <motion.span
          aria-hidden
          variants={ruleIn}
          custom={index}
          className="relative my-5 block h-px origin-left bg-gradient-to-r from-white/20 via-white/[0.07] to-transparent"
        />

        <ul className="relative mt-auto flex flex-col gap-2.5 text-[14px] text-white/85">
          {service.includes.map((line, j) => (
            <motion.li key={line} variants={lineIn} custom={0.5 + (index % 3) * 0.1 + j * 0.08} className="flex items-center gap-2.5">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
                style={{ background: `color-mix(in srgb, ${service.accent} 16%, transparent)`, color: service.accent }}
              >
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              {line}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

/** Compteur qui défile de 00 jusqu'à la valeur quand il entre à l'écran (texte mis à jour sans rendu React). */
function CountUp({ to, reduce }: { to: number; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEWPORT);
  const value = useMotionValue(reduce ? to : 0);
  const text = useTransform(value, (v) => pad(Math.round(v)));
  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, reduce ? { duration: 0 } : { duration: 1.6, ease: EXPO_OUT, delay: 0.3 });
    return () => controls.stop();
  }, [inView, reduce, to, value]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

/** Tuile d'une spécialité : carré numéroté, icône, halo au survol. */
function SpecialtyTile({ item, index, wide }: { item: Specialty; index: number; wide: boolean }) {
  const Icon = item.icon;
  return (
    <motion.li
      variants={tileIn}
      custom={index}
      onPointerMove={trackPointer}
      style={{ "--accent-card": "#22c55e" } as CSSProperties}
      className={`group relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,#0b0f17,#080b11)] p-5 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-accent/45 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={INNER_SPOT} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={RISING_GLOW} />

      <div className="flex items-start gap-4">
        <NumberChip value={pad(index + 1)} className="h-10 w-10 rounded-xl text-[13px]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-[family-name:var(--font-display)] text-[1.02rem] font-semibold leading-snug">{item.title}</h4>
            <Icon
              size={18}
              strokeWidth={2}
              aria-hidden
              className="mt-0.5 shrink-0 text-accent-strong/60 transition-[color,rotate,scale] duration-300 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-accent-strong"
            />
          </div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{item.text}</p>
        </div>
      </div>
    </motion.li>
  );
}

/** Panneau « Nos spécialités » : grand compteur à gauche, tuiles numérotées à droite. */
function SpecialtiesPanel({ reduce }: { reduce: boolean }) {
  const count = SPECIALTIES.length;
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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.7fr)] lg:gap-12">
        <div className="flex flex-col">
          <Kicker index="02">Nos spécialités</Kicker>
          <p className="font-[family-name:var(--font-display)] text-[clamp(4.5rem,10vw,8rem)] font-bold leading-[0.85] tracking-[-0.06em]">
            <span aria-hidden className="text-glow">
              <CountUp to={count} reduce={reduce} />
            </span>
            <span className="sr-only">{count} spécialités</span>
          </p>
          <p className="mt-5 max-w-[24ch] text-[15px] leading-relaxed text-muted">
            Des savoir-faire précis, en complément de nos services.
          </p>
          <span aria-hidden className="mt-6 hidden h-px w-24 bg-gradient-to-r from-accent to-transparent lg:block" />
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {SPECIALTIES.map((s, i) => (
            <SpecialtyTile key={s.title} item={s} index={i} wide={i === count - 1 && count % 2 === 1} />
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
