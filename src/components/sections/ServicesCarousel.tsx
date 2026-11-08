"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { SERVICES } from "@/lib/services";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const N = SERVICES.length;
const pad = (n: number) => String(n).padStart(2, "0");

/** Titre en deux temps : le début en blanc, le dernier mot en dégradé. */
function splitTitle(title: string): [string, string] {
  const i = title.lastIndexOf(" ");
  return i < 0 ? ["", title] : [title.slice(0, i), title.slice(i + 1)];
}

/* ── Changement de service : le texte sort du côté opposé au geste, le nouveau monte ligne par ligne ── */
const textIn: Variants = {
  enter: { opacity: 1 },
  center: { opacity: 1, x: 0, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  exit: (d: number) => ({ opacity: 0, x: d * -28, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }),
};
const rise: Variants = {
  enter: { y: "110%" },
  center: { y: "0%", transition: { duration: 0.8, ease: EXPO_OUT } },
};
const fadeUp: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EXPO_OUT } },
};
const fadeOnly: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Coin de viseur (décor de l'image). */
const CORNERS = [
  "left-3 top-3 border-l border-t rounded-tl-md",
  "right-3 top-3 border-r border-t rounded-tr-md",
  "left-3 bottom-3 border-l border-b rounded-bl-md",
  "right-3 bottom-3 border-r border-b rounded-br-md",
];

function ArrowButton({ onClick, next = false }: { onClick: () => void; next?: boolean }) {
  const Icon = next ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={next ? "Service suivant" : "Service précédent"}
      className={`group inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[13px] font-medium text-white/80 transition-colors duration-200 hover:border-accent/50 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 ${
        next ? "flex-row-reverse" : ""
      }`}
    >
      <Icon size={17} aria-hidden className={`transition-transform duration-200 ${next ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`} />
      <span className="hidden sm:inline">{next ? "Suivant" : "Précédent"}</span>
    </button>
  );
}

/**
 * « Ce qu'on fait » en carrousel : une grande carte par service (photo sur un socle d'anneaux, grand titre),
 * qu'on fait glisser du doigt ou de la souris, ou qu'on change avec les flèches, la liste ou le clavier.
 */
export default function ServicesCarousel() {
  const reduce = useReducedMotion() ?? false;
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const go = useCallback((step: number) => setSlide(([i]) => [(i + step + N) % N, step]), []);
  const goTo = useCallback((j: number) => setSlide((prev) => (prev[0] === j ? prev : [j, j > prev[0] ? 1 : -1])), []);

  const service = SERVICES[index];
  const { accent } = service;
  const Icon = service.icon;
  const [lead, tail] = splitTitle(service.title);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };
  // Glisser : la distance et l'élan du geste décident du sens
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power < -60) go(1);
    else if (power > 60) go(-1);
  };

  return (
    <motion.div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Ce qu'on fait"
      onKeyDown={onKeyDown}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EXPO_OUT }}
      className="relative isolate overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,#0a1320_0%,#070a12_50%,#05070c_100%)]"
    >
      {/* Lueur de la couleur du service, en fondu d'un service à l'autre */}
      <AnimatePresence initial={false}>
        <motion.div
          key={service.slug}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          style={{
            background: `radial-gradient(50% 60% at 38% 55%, color-mix(in srgb, ${accent} 20%, transparent), transparent 70%), radial-gradient(35% 45% at 96% 0%, color-mix(in srgb, ${accent} 12%, transparent), transparent 70%)`,
          }}
        />
      </AnimatePresence>
      {/* Lignes de contour, en haut à gauche */}
      <svg aria-hidden viewBox="0 0 400 300" fill="none" className="pointer-events-none absolute -left-28 -top-20 -z-10 w-[520px] opacity-60">
        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
          <path key={k} d={`M0 ${50 + k * 16}C120 ${8 + k * 20} 230 ${150 + k * 9} 400 ${64 + k * 18}`} stroke="rgba(148,163,184,0.12)" />
        ))}
      </svg>
      {/* Grand numéro en filigrane */}
      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          aria-hidden
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: EXPO_OUT }}
          className="pointer-events-none absolute right-4 top-1 -z-10 font-[family-name:var(--font-display)] text-[6.5rem] font-bold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.09)] sm:text-[9rem] lg:right-8 lg:text-[12rem]"
        >
          {pad(index + 1)}
        </motion.span>
      </AnimatePresence>

      <div className="grid lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* ── Rail (ordinateur) : compteur et liste des services ── */}
        <nav aria-label="Choisir un service" className="hidden flex-col gap-10 border-r border-white/[0.06] px-7 py-9 lg:flex">
          <div className="flex items-start gap-3">
            <span className="rotate-180 font-mono text-[10.5px] uppercase tracking-[0.32em] text-white/40 [writing-mode:vertical-rl]">Service</span>
            <span aria-hidden className="h-20 w-px bg-gradient-to-b from-white/40 to-transparent" />
            <span className="font-mono text-[13px] leading-[1.7] tabular-nums text-white">
              {pad(index + 1)}
              <br />
              <span className="text-white/35">/ {pad(N)}</span>
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {SERVICES.map((s, j) => {
              const on = j === index;
              return (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(j)}
                    aria-current={on ? "true" : undefined}
                    className="group flex min-h-9 w-full cursor-pointer items-center gap-3 rounded-md text-left text-[13px] leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden
                      className={`h-px shrink-0 transition-[width,background-color] duration-500 ${on ? "w-6" : "w-2 bg-white/25 group-hover:w-4 group-hover:bg-white/50"}`}
                      style={on ? { background: accent } : undefined}
                    />
                    <span className={`transition-colors duration-300 ${on ? "text-white" : "text-white/45 group-hover:text-white/80"}`}>{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col">
          {/* ── Zone qu'on fait glisser : photo + texte ── */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.22}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            className="grid flex-1 cursor-grab items-center gap-7 px-5 pb-5 pt-6 active:cursor-grabbing sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10 lg:px-10 lg:pt-10"
          >
            {/* Photo sur son socle (cadre plus large que haut : les photos sont en paysage) */}
            <div className="relative mx-auto h-[300px] w-full max-w-[540px] sm:h-[380px] lg:h-[440px]">
              <div className="absolute inset-x-[4%] bottom-[13%] top-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#05070c] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
                {/* Toutes les photos restent chargées : le passage de l'une à l'autre est un simple fondu */}
                {SERVICES.map((s, j) => {
                  const on = j === index;
                  return (
                    <motion.div
                      key={s.slug}
                      aria-hidden
                      className="absolute inset-0"
                      initial={false}
                      animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.12 }}
                      transition={reduce ? { duration: 0.2 } : { duration: 0.9, ease: EXPO_OUT }}
                    >
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 500px, 92vw"
                        draggable={false}
                        className={`object-cover ${on ? "svc-drift" : ""}`}
                      />
                    </motion.div>
                  );
                })}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.2)_0%,transparent_30%,rgba(5,7,12,0.15)_62%,rgba(5,7,12,0.9)_100%)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_4px)]"
                />
                {/* Reflet qui balaie la photo à chaque changement */}
                {!reduce && (
                  <motion.div
                    key={index}
                    aria-hidden
                    initial={{ x: "-120%" }}
                    animate={{ x: "260%" }}
                    transition={{ duration: 1.2, ease: [0.45, 0, 0.2, 1] }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(187,247,208,0.2),transparent)]"
                  />
                )}
                {CORNERS.map((c) => (
                  <span key={c} aria-hidden className={`pointer-events-none absolute h-5 w-5 ${c}`} style={{ borderColor: accent }} />
                ))}
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#05070c]/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/85">
                  <Icon size={13} aria-hidden style={{ color: accent }} />
                  Service {pad(index + 1)}
                </span>
              </div>

              {/* Socle : anneaux concentriques vus en perspective, l'un tourne, une onde part à chaque changement */}
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-[87%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(76deg)]">
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div className="absolute inset-[12%] rounded-full border" style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)` }} />
                <div className="svc-spin absolute inset-[24%] rounded-full border border-dashed border-white/25">
                  <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
                </div>
                <div className="absolute inset-[34%] rounded-full" style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 45%, transparent), transparent)` }} />
                {!reduce && (
                  <motion.div
                    key={index}
                    className="absolute inset-[24%] rounded-full border-2"
                    style={{ borderColor: accent }}
                    initial={{ scale: 0.6, opacity: 0.9 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.2, ease: EXPO_OUT }}
                  />
                )}
              </div>
            </div>

            {/* Texte du service */}
            <div className="relative min-h-[300px] lg:min-h-0" aria-live="polite">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.div
                  key={service.slug}
                  custom={dir}
                  variants={reduce ? fadeOnly : textIn}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  role="group"
                  aria-roledescription="diapositive"
                  aria-label={`${index + 1} sur ${N} : ${service.title}`}
                >
                  <motion.p
                    variants={reduce ? undefined : fadeUp}
                    className="mb-5 flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.2em]"
                    style={{ color: accent }}
                  >
                    <Icon size={15} aria-hidden />
                    Service {pad(index + 1)}
                    <span className="text-white/30">/ {pad(N)}</span>
                  </motion.p>
                  <h3 className="font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.2vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.035em]">
                    {lead && (
                      <span className="block overflow-hidden pb-[0.04em]">
                        <motion.span variants={reduce ? undefined : rise} className="inline-block text-white">
                          {lead}
                        </motion.span>
                      </span>
                    )}
                    <span className="block overflow-hidden pb-[0.12em]">
                      <motion.span
                        variants={reduce ? undefined : rise}
                        className="inline-block bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(100deg, #ecfdf5 0%, ${accent} 45%, #2dd4bf 100%)` }}
                      >
                        {tail}
                      </motion.span>
                    </span>
                  </h3>
                  <motion.div variants={reduce ? undefined : fadeUp} className="mt-5 flex items-start gap-4">
                    <span aria-hidden className="mt-[0.75em] h-px w-10 shrink-0 bg-white/40" />
                    <p className="max-w-[36ch] text-[15px] leading-relaxed text-muted">{service.pitch}</p>
                  </motion.div>
                  <motion.ul variants={reduce ? undefined : fadeUp} className="mt-6 flex flex-wrap gap-2">
                    {service.includes.map((line) => (
                      <li
                        key={line}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/85"
                      >
                        <Check size={13} strokeWidth={3} aria-hidden style={{ color: accent }} />
                        {line}
                      </li>
                    ))}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Barre du bas : précédent, pastilles, suivant ── */}
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 sm:px-8 lg:px-10">
            <ArrowButton onClick={() => go(-1)} />
            <div className="flex min-w-0 flex-col items-center">
              <div className="flex items-center">
                {SERVICES.map((s, j) => {
                  const on = j === index;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => goTo(j)}
                      aria-label={`Afficher : ${s.title}`}
                      aria-current={on ? "true" : undefined}
                      className="group grid h-9 cursor-pointer place-items-center rounded-full px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-[width,background-color] duration-500 ${on ? "w-9" : "w-2.5 bg-white/20 group-hover:bg-white/45"}`}
                        style={on ? { background: accent } : undefined}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/35">Glissez pour changer</p>
            </div>
            <ArrowButton next onClick={() => go(1)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
