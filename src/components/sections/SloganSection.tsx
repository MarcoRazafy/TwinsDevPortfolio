"use client";

import { motion, useReducedMotion } from "motion/react";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Éclats lumineux autour du slogan (position en %, taille en px, délai en s). */
const SPARKS = [
  { x: 12, y: 22, s: 18, d: 1.1 },
  { x: 86, y: 18, s: 14, d: 1.3 },
  { x: 78, y: 70, s: 22, d: 1.5 },
  { x: 20, y: 74, s: 12, d: 1.25 },
  { x: 50, y: 10, s: 10, d: 1.6 },
  { x: 93, y: 48, s: 10, d: 1.4 },
];

/** Étoile à quatre branches. */
function Spark({ size }: { size: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
      <path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.4 11.4 6.3 12 0Z" fill="#86efac" />
    </svg>
  );
}

/**
 * Bande « promesse » : le slogan en très grand, révélé mot par mot, « vous surprendre » en dégradé
 * balayé par un reflet et souligné d'un trait qui se dessine. Animations jouées une seule fois.
 */
export default function SloganSection() {
  const reduce = useReducedMotion() ?? false;
  const inView = { once: true, margin: "-20% 0px" } as const;
  const lead = ["Notre", "objectif :"];

  return (
    <section
      id="promesse"
      aria-labelledby="promesse-titre"
      className="relative isolate flex min-h-[78vh] items-center overflow-hidden px-4 py-28 sm:px-8 lg:py-36"
    >
      {/* Halo et trame */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[min(1100px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.22),rgba(45,212,191,0.08)_55%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(190,255,220,0.16)_1px,transparent_1.4px)] [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(55%_60%_at_50%_50%,#000,transparent)]"
      />

      {/* Éclats lumineux */}
      {SPARKS.map((sp, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
          initial={reduce ? false : { opacity: 0, scale: 0, rotate: -45 }}
          whileInView={{ opacity: 0.85, scale: 1, rotate: 0 }}
          viewport={inView}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: reduce ? 0 : sp.d }}
        >
          <Spark size={sp.s} />
        </motion.span>
      ))}

      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center text-center">
        <motion.p
          className="mb-8 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.2em] text-accent-strong"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 0.7, ease: EXPO_OUT }}
        >
          <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-accent/70" />
          Notre promesse
          <span aria-hidden className="h-px w-8 bg-gradient-to-l from-transparent to-accent/70" />
        </motion.p>

        <h2
          id="promesse-titre"
          className="font-[family-name:var(--font-display)] text-[clamp(2.7rem,8vw,6.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]"
        >
          {/* « Notre objectif : », mot par mot */}
          <span className="block text-white/90">
            {lead.map((word, i) => (
              <span key={word} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "105%", opacity: 0 }}
                  whileInView={{ y: "0%", opacity: 1 }}
                  viewport={inView}
                  transition={{ duration: 0.9, ease: EXPO_OUT, delay: i * 0.12 }}
                >
                  {word}
                </motion.span>
                {i < lead.length - 1 && " "}
              </span>
            ))}
          </span>

          {/* « vous surprendre. » : dégradé balayé par un reflet, puis souligné */}
          <span className="relative mt-1 inline-block">
            <motion.span
              className="relative inline-block bg-[linear-gradient(100deg,#86efac_0%,#4ade80_30%,#ffffff_45%,#2dd4bf_60%,#4ade80_100%)] bg-[length:250%_100%] bg-clip-text pb-[0.1em] text-transparent"
              initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(10px)", backgroundPosition: "100% 50%" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", backgroundPosition: "0% 50%" }}
              viewport={inView}
              transition={{
                duration: 0.9,
                ease: EXPO_OUT,
                delay: 0.3,
                backgroundPosition: { duration: 2.2, ease: "easeInOut", delay: 0.6 },
              }}
            >
              vous surprendre.
            </motion.span>
            <svg
              aria-hidden
              viewBox="0 0 600 40"
              preserveAspectRatio="none"
              className="pointer-events-none absolute -bottom-[0.12em] left-[2%] h-[0.32em] w-[96%] overflow-visible"
            >
              <defs>
                <linearGradient id="promesse-trait" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#4ade80" />
                  <stop offset="1" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
              <motion.path
                d="M6 26C110 10 260 6 380 14c80 5 150 12 214 4"
                fill="none"
                stroke="url(#promesse-trait)"
                strokeWidth="9"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={inView}
                transition={{ duration: 1.1, ease: EXPO_OUT, delay: 1 }}
              />
            </svg>
          </span>
        </h2>
      </div>
    </section>
  );
}
