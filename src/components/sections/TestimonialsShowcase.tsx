"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { initials, type Testimonial } from "@/lib/testimonials";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const DURATION = 8; // s par avis en lecture automatique

/**
 * Avis clients : rangée de logos (onglets) + grande carte mise en avant. Lecture automatique façon
 * « stories » (une barre par avis), en pause au survol, au focus clavier, hors écran, ou via le bouton.
 */
export default function TestimonialsShowcase({ testimonials }: { testimonials: Testimonial[] }) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0); // relance la barre de progression
  const [choice, setChoice] = useState<boolean | null>(null); // `null` : suit la préférence système
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = testimonials.length;
  const autoplay = (choice ?? !reduce) && count > 1;
  const paused = !autoplay || hovered || focused || !onScreen;
  const t = testimonials[Math.min(active, count - 1)];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = (index: number) => {
    setActive(((index % count) + count) % count);
    setCycle((c) => c + 1);
  };

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-6"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false)}
    >
      {/* Rangée de logos : choisir un avis */}
      {count > 1 && (
        <div role="tablist" aria-label="Entreprises" className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {testimonials.map((item, i) => {
            const selected = i === active;
            return (
              <button
                key={item.id}
                role="tab"
                id={`avis-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="avis-panneau"
                onClick={() => go(i)}
                className={`group flex shrink-0 snap-start items-center gap-3 rounded-2xl border py-2 pl-2 pr-4 text-left transition-[border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? "border-accent/50 bg-accent/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <Logo item={item} size="sm" muted={!selected} />
                <span className={`max-w-[11rem] truncate text-[13.5px] font-medium transition-colors ${selected ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
                  {item.company}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Carte mise en avant */}
      <div
        id="avis-panneau"
        role={count > 1 ? "tabpanel" : undefined}
        aria-labelledby={count > 1 ? `avis-tab-${t.id}` : undefined}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_55%)] shadow-[0_40px_100px_-45px_rgba(34,197,94,0.45)]"
      >
        {/* Lueurs d'ambiance */}
        <div aria-hidden className="pointer-events-none absolute -left-52 -top-60 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(34,197,94,0.2),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-60 -right-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.1),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={t.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EXPO_OUT }}
            className="relative grid gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-0"
          >
            {/* Avis */}
            <div className="relative md:pr-10">
              <span
                aria-hidden
                className="pointer-events-none absolute -left-2 -top-10 select-none font-[family-name:var(--font-display)] text-[9rem] font-bold leading-none bg-[linear-gradient(160deg,rgba(74,222,128,0.55),rgba(45,212,191,0.05))] bg-clip-text text-transparent"
              >
                &ldquo;
              </span>
              <blockquote className="relative pt-10 font-[family-name:var(--font-display)] text-[clamp(1.15rem,2.1vw,1.55rem)] font-medium leading-[1.55] tracking-[-0.01em] text-white/90 text-pretty">
                {reduce ? t.quote : <Words text={t.quote} />}
              </blockquote>
              {t.example && (
                <span className="mt-5 inline-block rounded-full border border-dashed border-amber-300/60 px-2.5 py-0.5 font-mono text-[10.5px] text-amber-200">
                  avis exemple
                </span>
              )}
            </div>

            {/* Entreprise et responsable */}
            <figcaption className="flex flex-col justify-between gap-7 border-t border-white/10 pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <div className="flex flex-col gap-4">
                <Logo item={t} size="lg" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-[1.2rem] font-semibold tracking-[-0.01em]">{t.company}</p>
                  {t.website && (
                    <a
                      href={t.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[13px] text-accent-strong transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {t.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      <ArrowUpRight size={13} aria-hidden />
                    </a>
                  )}
                </div>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        {/* Progression et commandes */}
        {count > 1 && (
          <div className="relative flex items-center gap-4 border-t border-white/10 px-7 py-4 sm:px-10">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {testimonials.map((item, i) => (
                <span key={item.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  {i < active && <span className="absolute inset-0 bg-accent/60" />}
                  {i === active && (
                    <span
                      key={cycle}
                      className="testi-fill absolute inset-0 origin-left bg-accent"
                      style={{
                        animationDuration: `${DURATION}s`,
                        animationPlayState: paused ? "paused" : "running",
                        // Lecture automatique coupée : barre pleine, immobile
                        ...(autoplay ? {} : { animationName: "none" }),
                      }}
                      onAnimationEnd={() => go(active + 1)}
                    />
                  )}
                </span>
              ))}
            </div>
            <span aria-hidden className="font-mono text-[12px] tabular-nums text-white/45">
              {String(active + 1).padStart(2, "0")} <span className="text-white/20">/</span> {String(count).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <Control label="Avis précédent" onClick={() => go(active - 1)}>
                <ChevronLeft size={17} aria-hidden />
              </Control>
              <Control label="Avis suivant" onClick={() => go(active + 1)}>
                <ChevronRight size={17} aria-hidden />
              </Control>
              <Control label={autoplay ? "Mettre en pause le défilement des avis" : "Lancer le défilement des avis"} onClick={() => setChoice(!autoplay)}>
                {autoplay ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden className="translate-x-[1px]" />}
              </Control>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Apparition mot par mot (délai plafonné pour les longs avis). */
function Words({ text }: { text: string }) {
  const words = text.split(" ");
  const step = Math.min(0.035, 0.9 / words.length);
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${i}-${word}`}
          className="inline-block"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EXPO_OUT, delay: 0.1 + i * step }}
        >
          {word}
          {i < words.length - 1 && " "}
        </motion.span>
      ))}
    </>
  );
}

/** Logo de l'entreprise dans une tuile ; sans logo, un monogramme dégradé. */
function Logo({ item, size, muted = false }: { item: Testimonial; size: "sm" | "lg"; muted?: boolean }) {
  const box = size === "lg" ? "h-20 w-20 rounded-2xl" : "h-10 w-10 rounded-xl";
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-white/10 bg-white/[0.06] transition-[filter,opacity] duration-300 ${box} ${
        muted ? "opacity-60 grayscale" : ""
      } ${size === "lg" ? "shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)]" : ""}`}
    >
      {item.logo ? (
        <Image src={item.logo} alt={size === "lg" ? `Logo ${item.company}` : ""} fill sizes={size === "lg" ? "80px" : "40px"} className="object-contain p-[14%]" />
      ) : (
        <span
          aria-hidden
          className={`font-[family-name:var(--font-display)] bg-[linear-gradient(140deg,#86efac,#2dd4bf)] bg-clip-text font-semibold text-transparent ${
            size === "lg" ? "text-[1.6rem]" : "text-[0.95rem]"
          }`}
        >
          {initials(item.company)}
        </span>
      )}
    </span>
  );
}

function Control({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}
