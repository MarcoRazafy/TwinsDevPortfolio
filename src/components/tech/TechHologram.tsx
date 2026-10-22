"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { TECH, TECH_ROWS, techColor, techLabel } from "@/lib/tech";
import CircuitBoard from "./CircuitBoard";

const SPEEDS = [0.24, -0.19, 0.21]; // rad/s par rangée, sens alternés
const ROW_Y = [0.31, 0.53, 0.75]; // hauteur de chaque rangée (fraction de la scène)
const TOTAL = TECH_ROWS.reduce((n, row) => n + row.keys.length, 0);

/**
 * Cylindre holographique : entre deux anneaux de lumière, devant un circuit imprimé, les technologies
 * tournent en trois rangées. Celles de derrière s'estompent ; le nom ne s'affiche que devant.
 * Survoler une rangée l'arrête ; un bouton met tout en pause.
 */
export default function TechHologram() {
  const reduce = useReducedMotion() ?? false;
  const [choice, setChoice] = useState<boolean | null>(null); // `null` : suit la préférence système
  const autoplay = choice ?? !reduce;

  const stageRef = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[][]>(TECH_ROWS.map(() => []));
  const rowHover = useRef(TECH_ROWS.map(() => false));
  const live = useRef({ autoplay: true });

  useEffect(() => {
    live.current = { autoplay };
  }, [autoplay]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    let last = 0;
    let visible = true;
    const angles = TECH_ROWS.map((_, r) => r * 0.35);
    const size = { w: 0, h: 0, rx: 0, tilt: 0 };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" });
    io.observe(stage);
    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      // Écran large : on laisse une marge à gauche pour les légendes des rangées
      const rx = w < 640 ? w * 0.38 : w < 1024 ? w * 0.36 : Math.min(w * 0.31, 380);
      Object.assign(size, { w, h, rx, tilt: h * 0.022 });
      stage.style.setProperty("--rx", `${rx}px`);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(ts - last, 50) : 0;
      last = ts;
      if (!visible) return;
      const { w, h, rx, tilt } = size;
      TECH_ROWS.forEach((row, r) => {
        if (live.current.autoplay && !rowHover.current[r]) angles[r] += (SPEEDS[r] * dt) / 1000;
        const n = row.keys.length;
        row.keys.forEach((_, i) => {
          const el = items.current[r][i];
          if (!el) return;
          const theta = angles[r] + (i * Math.PI * 2) / n;
          const z = Math.cos(theta); // 1 : devant, -1 : derrière
          const near = (z + 1) / 2;
          const x = w / 2 + rx * Math.sin(theta);
          const y = h * ROW_Y[r] + z * tilt; // vu un peu d'en haut : l'avant descend légèrement
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.52 + 0.48 * near).toFixed(3)})`;
          el.style.opacity = (0.14 + 0.86 * near ** 1.6).toFixed(3);
          el.style.zIndex = String(Math.round(near * 100));
          el.style.setProperty("--front", Math.min(1, Math.max(0, (z - 0.45) / 0.45)).toFixed(3));
        });
      });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      ref={stageRef}
      className="relative h-[clamp(470px,50vw,600px)] w-full overflow-hidden border-y border-sky-300/15 bg-[radial-gradient(120%_80%_at_50%_50%,#0a1a33_0%,#050b18_60%,#03060e_100%)] shadow-[0_40px_120px_-50px_rgba(14,165,233,0.55)]"
    >
      <CircuitBoard />

      {/* Rideau de lumière entre les deux anneaux, aux dimensions du cylindre */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[13%] bottom-[13%] sm:top-[11%] sm:bottom-[11%] w-[calc(var(--rx,380px)*2+56px)] -translate-x-1/2 bg-[linear-gradient(to_top,rgba(56,189,248,0.2),rgba(56,189,248,0.04)_55%,rgba(56,189,248,0.12))] [mask-image:radial-gradient(70%_100%_at_50%_50%,#000_45%,transparent)]"
      />
      {/* Bords du cylindre */}
      {["left", "right"].map((s) => (
        <div
          key={s}
          aria-hidden
          className="pointer-events-none absolute top-[14%] bottom-[14%] sm:top-[12%] sm:bottom-[12%] w-px bg-gradient-to-b from-sky-300/60 via-sky-300/10 to-sky-300/60"
          style={{ left: s === "left" ? "calc(50% - var(--rx, 380px) - 28px)" : "calc(50% + var(--rx, 380px) + 28px)" }}
        />
      ))}

      {/* Anneau du haut (double) */}
      <div aria-hidden className="holo-ring left-1/2 top-[13%] sm:top-[11%] h-[calc((var(--rx,380px)*2+56px)*0.11)] w-[calc(var(--rx,380px)*2+56px)] -translate-x-1/2 -translate-y-1/2" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[13%] sm:top-[11%] h-[calc((var(--rx,380px)*2+20px)*0.085)] w-[calc(var(--rx,380px)*2+20px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-sky-300/30" />

      {/* Anneau du bas : plus large, avec sa lueur de socle */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[87%] sm:top-[89%] h-24 w-[calc(var(--rx,380px)*2+160px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(56,189,248,0.45),transparent)] blur-md" />
      <div aria-hidden className="holo-ring left-1/2 top-[87%] sm:top-[89%] h-[calc((var(--rx,380px)*2+70px)*0.13)] w-[calc(var(--rx,380px)*2+70px)] -translate-x-1/2 -translate-y-1/2" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[87%] sm:top-[89%] h-[calc((var(--rx,380px)*2+20px)*0.1)] w-[calc(var(--rx,380px)*2+20px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-sky-300/35" />

      {/* Légendes des rangées, côté gauche (écrans larges) */}
      {TECH_ROWS.map((row, r) => (
        <p
          key={row.label}
          aria-hidden
          className="pointer-events-none absolute left-[max(1.25rem,calc((100%-1180px)/2+1.25rem))] z-[105] hidden max-w-[132px] -translate-y-1/2 flex-col gap-1 rounded-lg border border-sky-300/15 bg-[#050b18]/85 px-3 py-2 font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] text-sky-200/70 lg:flex"
          style={{ top: `${ROW_Y[r] * 100}%` }}
        >
          <span className="flex items-center gap-2 text-sky-300">
            {String(r + 1).padStart(2, "0")}
            <span className="h-px w-4 bg-sky-300/50" />
          </span>
          {row.label}
        </p>
      ))}

      {/* Indicateur et pause, en haut à droite */}
      <div className="absolute right-3 top-3 z-[120] sm:right-[max(1rem,calc((100%-1180px)/2+1rem))] sm:top-4 flex items-center gap-3">
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-sky-200/60 sm:inline">
          <span className="text-sky-300">{TOTAL}</span> technologies
        </span>
        <button
          type="button"
          onClick={() => setChoice(!autoplay)}
          aria-label={autoplay ? "Mettre en pause la rotation des technologies" : "Lancer la rotation des technologies"}
          title={autoplay ? "Pause" : "Lecture"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-300/[0.06] text-sky-100/80 transition-colors hover:border-sky-300/50 hover:bg-sky-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          {autoplay ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden className="translate-x-[1px]" />}
        </button>
      </div>

      {/* Rangées de technologies (positions mises à jour à chaque image) */}
      {TECH_ROWS.map((row, r) => (
        <ul
          key={row.label}
          aria-label={row.label}
          className="pointer-events-none absolute inset-0"
        >
          {row.keys.map((key, i) => {
            const color = techColor(key);
            return (
              <li
                key={key}
                ref={(el) => {
                  items.current[r][i] = el;
                }}
                style={{ opacity: 0, "--tint": color } as CSSProperties}
                className="group pointer-events-auto absolute left-0 top-0 flex flex-col items-center will-change-transform"
                onPointerEnter={() => (rowHover.current[r] = true)}
                onPointerLeave={() => (rowHover.current[r] = false)}
              >
                <span className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-sky-300/25 bg-[#06101f]/85 shadow-[0_0_26px_-8px_var(--tint),inset_0_0_18px_-8px_rgba(56,189,248,0.6)] transition-[transform,border-color,box-shadow] duration-300 group-hover:scale-110 group-hover:border-sky-200/70 group-hover:shadow-[0_0_34px_-4px_var(--tint),inset_0_0_18px_-6px_rgba(56,189,248,0.8)] sm:h-16 sm:w-16">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-[46%] w-[46%] drop-shadow-[0_0_6px_var(--tint)]" style={{ fill: color }}>
                    <path d={TECH[key].icon.path} />
                  </svg>
                </span>
                <span
                  className="mt-2 whitespace-nowrap font-mono text-[10.5px] tracking-wide text-sky-50/90 transition-opacity group-hover:!opacity-100 sm:text-[11.5px]"
                  style={{ opacity: "var(--front, 0)" }}
                >
                  {techLabel(key)}
                </span>
              </li>
            );
          })}
        </ul>
      ))}

      {/* Lignes de balayage sur l'ensemble */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[110] bg-[repeating-linear-gradient(to_bottom,rgba(125,211,252,0.04)_0_1px,transparent_1px_4px)]"
      />
    </motion.div>
  );
}
