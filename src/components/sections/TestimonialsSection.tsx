"use client";

import { motion, useReducedMotion } from "motion/react";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Section « Avis » : masquée tant que la liste est vide. */
export default function TestimonialsSection() {
  const reduce = useReducedMotion() ?? false;
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section
      id="avis"
      aria-labelledby="avis-titre"
      className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHead
          path="/avis"
          id="avis-titre"
          title={
            <>
              Ils nous ont fait <span className="text-glow">confiance</span>
            </>
          }
        />
        <div className="grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.quote}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay: i * 0.1 }}
              className="relative flex flex-col gap-6 rounded-[22px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-7"
            >
              <Quote size={26} aria-hidden className="text-accent/70" />
              <blockquote className="font-[family-name:var(--font-display)] text-[1.12rem] font-medium leading-relaxed tracking-[-0.005em] text-white/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-auto flex flex-wrap items-end justify-between gap-3 text-[14px] text-muted">
                <span>
                  <span className="block font-semibold text-white">{t.author}</span>
                  {t.role}
                </span>
                {t.example && (
                  <span className="rounded-full border border-dashed border-amber-300/60 px-2.5 py-0.5 font-mono text-[10.5px] text-amber-200">
                    avis exemple
                  </span>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
