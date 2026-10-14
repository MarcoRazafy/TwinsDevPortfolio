"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { SERVICES, STEPS } from "@/lib/services";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Section « Services » : les offres en cartes, puis le déroulé d'un projet en quatre étapes. */
export default function ServicesSection() {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  return (
    <section
      id="services"
      aria-labelledby="services-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          path="/services"
          id="services-titre"
          title={
            <>
              Ce qu&apos;on peut faire <span className="text-glow">pour vous</span>
            </>
          }
          lede="Du site d'une page à l'application complète. Chaque projet est chiffré sur devis, après un premier échange."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.slug}
                {...reveal(i * 0.08)}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 transition-colors duration-300 hover:border-white/20"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
                  style={{ background: `radial-gradient(closest-side, ${service.accent}55, transparent)` }}
                />
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
                  style={{ color: service.accent }}
                >
                  <Icon size={21} strokeWidth={2} aria-hidden />
                </span>
                <div className="relative flex flex-col gap-2">
                  <p className="font-mono text-[11.5px] tracking-wide text-white/40">/{service.slug}</p>
                  <h3 className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold leading-tight tracking-[-0.01em]">
                    {service.title}
                  </h3>
                  <p className="text-[14.5px] leading-relaxed text-muted">{service.pitch}</p>
                </div>
                <ul className="relative flex flex-col gap-2 text-[14px] text-white/85">
                  {service.includes.map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Check size={11} strokeWidth={3} aria-hidden />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-auto border-t border-white/10 pt-4 font-mono text-[12.5px] text-accent-strong">
                  {service.pricing}
                </p>
              </motion.article>
            );
          })}
        </div>

        {/* Déroulé d'un projet */}
        <div className="mt-20 lg:mt-28">
          <motion.h3
            {...reveal(0)}
            className="mb-10 font-[family-name:var(--font-display)] text-[1.5rem] font-semibold tracking-[-0.015em]"
          >
            Comment se passe un projet
          </motion.h3>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                {...reveal(0.1 + i * 0.1)}
                className="relative flex flex-col gap-3 border-t-2 border-white/15 pt-5"
              >
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
