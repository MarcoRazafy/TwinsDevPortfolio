"use client";

import type { CSSProperties, PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { SERVICES, SPECIALTIES, STEPS } from "@/lib/services";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Halo qui suit le pointeur : on publie sa position dans la carte (variables CSS, sans re-rendu). */
const followPointer = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/** Repère de partie : « 01 — Ce qu'on fait ». */
function Kicker({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-6 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">
      <span className="text-accent-strong">{index}</span>
      <span aria-hidden className="h-px w-8 bg-gradient-to-r from-accent/60 to-transparent" />
      {children}
    </p>
  );
}

/** Section « Services » : ce qu'on fait (cartes), nos spécialités (panneau), puis le déroulé d'un projet. */
export default function ServicesSection() {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.slug}
                {...reveal((i % 3) * 0.08)}
                onPointerMove={followPointer}
                style={{ "--accent-card": service.accent } as CSSProperties}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.055),rgba(255,255,255,0.012))] p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-7"
              >
                {/* Halo qui suit le pointeur */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--accent-card) 11%, transparent), transparent 45%)" }}
                />
                {/* Liseré lumineux qui suit le pointeur */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] group-hover:opacity-100"
                  style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), var(--accent-card), transparent 60%)" }}
                />
                {/* Lueur d'angle, permanente */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-35 blur-3xl"
                  style={{ background: `radial-gradient(closest-side, ${service.accent}66, transparent)` }}
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl text-[#05070c] shadow-[0_8px_26px_-8px_var(--accent-card)] ring-1 ring-inset ring-white/25 transition-transform duration-300 group-hover:scale-105"
                    style={{ background: service.accent }}
                  >
                    <Icon size={22} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span aria-hidden className="font-mono text-[12px] text-white/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="relative flex flex-col gap-2">
                  <h3 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold leading-tight tracking-[-0.01em] text-balance">
                    {service.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-muted">{service.pitch}</p>
                </div>

                <ul className="relative flex flex-col gap-2 text-[14px] text-white/85">
                  {service.includes.map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span
                        className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full"
                        style={{ background: `${service.accent}26`, color: service.accent }}
                      >
                        <Check size={11} strokeWidth={3} aria-hidden />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>

        {/* ── 02 · Nos spécialités ── */}
        <div className="mt-20 lg:mt-28">
          <Kicker index="02">Nos spécialités</Kicker>
          <motion.div
            {...reveal(0)}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(150deg,rgba(34,197,94,0.08),rgba(255,255,255,0.015)_45%,rgba(45,212,191,0.06))] p-6 sm:p-8 lg:p-10"
          >
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-[80px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-teal-400/10 blur-[80px]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(190,255,220,0.14)_1px,transparent_1.4px)] [background-size:24px_24px] opacity-40 [mask-image:radial-gradient(60%_80%_at_20%_20%,#000,transparent)]" />

            <div className="relative">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SPECIALTIES.map((s, i) => {
                  const Icon = s.icon;
                  // Dernière carte seule sur sa ligne : elle prend toute la largeur (2 colonnes, puis 3)
                  const last = i === SPECIALTIES.length - 1;
                  const span = [
                    last && SPECIALTIES.length % 2 === 1 ? "sm:col-span-2" : "",
                    last && SPECIALTIES.length % 3 === 1 ? "lg:col-span-3" : "lg:col-span-1",
                  ].join(" ");
                  return (
                    <motion.li
                      key={s.title}
                      {...reveal(0.05 + i * 0.05)}
                      className={`group/sp flex items-start gap-4 rounded-2xl border border-white/10 bg-[#05070c]/55 p-4 backdrop-blur-sm transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[#05070c]/75 ${span}`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,#4ade80,#22c55e)] text-[#05070c] shadow-[0_6px_18px_-8px_rgba(34,197,94,0.8)] ring-1 ring-inset ring-white/25 transition-shadow duration-300 group-hover/sp:shadow-[0_0_24px_-4px_rgba(34,197,94,0.9)]">
                        <Icon size={19} strokeWidth={2.2} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-[family-name:var(--font-display)] text-[1rem] font-semibold">{s.title}</span>
                        <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">{s.text}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* ── 03 · Déroulé d'un projet ── */}
        <div className="mt-20 lg:mt-28">
          <Kicker index="03">Comment se passe un projet</Kicker>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li key={step.title} {...reveal(0.1 + i * 0.1)} className="relative flex flex-col gap-3 border-t-2 border-white/15 pt-5">
                <span
                  aria-hidden
                  className="absolute -top-[7px] left-0 h-3 w-3 rounded-full bg-accent shadow-[0_0_0_5px_#05070c,0_0_18px_rgba(34,197,94,0.8)]"
                />
                <span className="font-mono text-[12.5px] text-accent">{String(i + 1).padStart(2, "0")}</span>
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
