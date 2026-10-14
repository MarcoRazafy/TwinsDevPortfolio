"use client";

import { useRef, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Code2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { TECH, techColor } from "@/lib/tech";

const MAX_TILT = 7; // degrés
const SPRING = { stiffness: 170, damping: 22, mass: 0.6 };

type Props = { project: Project; index: number };

/** Carte de projet : verre teinté, s'incline vers le curseur, reflet qui le suit. */
export default function ProjectCard({ project, index }: Props) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);

  // Position du pointeur normalisée : -1 (gauche/haut) → 1 (droite/bas)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const rotateX = useSpring(useTransform(py, [-1, 1], [MAX_TILT, -MAX_TILT]), SPRING);
  const sheenX = useTransform(px, [-1, 1], [10, 90]);
  const sheenY = useTransform(py, [-1, 1], [0, 100]);
  const sheen = useMotionTemplate`radial-gradient(520px circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.09), transparent 45%)`;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <motion.article
      ref={ref}
      style={{ rotateX, rotateY, "--accent-card": project.accent } as React.CSSProperties}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 2) * 0.12 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_45%,rgba(255,255,255,0.03))] shadow-[0_40px_80px_-36px_rgba(0,0,0,0.9)] [transform-style:preserve-3d] will-change-transform"
    >
      {/* Lueur de la teinte du projet, en haut à gauche, plus franche au survol */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(closest-side, ${project.accent}55, transparent)` }}
      />
      {/* Reflet qui suit le pointeur */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-10" style={{ backgroundImage: sheen }} />

      {/* Aperçu : capture si fournie, sinon une fenêtre stylisée aux couleurs du projet */}
      <div className="relative m-2.5 aspect-[16/10] overflow-hidden rounded-[18px] border border-white/10 bg-[#070b14]">
        {project.image ? (
          <Image
            src={project.image}
            alt={`Aperçu du projet ${project.title}`}
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <Placeholder project={project} />
        )}
        {project.example && (
          <span className="absolute right-3 top-3 z-10 rounded-full border border-dashed border-amber-300/60 bg-black/50 px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-amber-200 backdrop-blur-sm">
            projet exemple
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-4 px-6 pb-6 pt-3">
        <p className="font-mono text-[11.5px] uppercase tracking-[0.12em]" style={{ color: project.accent }}>
          {project.kind}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-[1.35rem] font-semibold leading-tight tracking-[-0.015em] text-balance">
          {project.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-muted">{project.problem}</p>
        <ul className="flex flex-col gap-1.5 text-[14.5px] text-white/85">
          {project.delivered.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <ul className="flex flex-wrap gap-1.5" aria-label="Technologies utilisées">
            {project.stack.map((key) => {
              const { icon } = TECH[key];
              return (
                <li
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-2 pr-2.5 text-[12px] text-white/75"
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ fill: techColor(key) }}>
                    <path d={icon.path} />
                  </svg>
                  {icon.title}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-1">
            {project.links.site && (
              <a
                href={project.links.site}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold text-accent-strong transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Voir le site
                <ArrowUpRight size={15} aria-hidden />
              </a>
            )}
            {project.links.code && (
              <a
                href={project.links.code}
                aria-label="Voir le code"
                title="Voir le code"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Code2 size={17} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/** Fenêtre de navigateur stylisée : fond dégradé à la teinte du projet, trame, monogramme. */
function Placeholder({ project }: { project: Project }) {
  const initials = project.title
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 90% at 20% 0%, ${project.accent}66, transparent 70%), radial-gradient(60% 70% at 100% 100%, ${project.accent}33, transparent 70%), linear-gradient(160deg, #0d1424, #070b14)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1px,transparent_1.4px)] [background-size:22px_22px] opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_40%,#000,transparent)]" />
      {/* Barre de navigateur */}
      <div className="absolute inset-x-0 top-0 flex h-8 items-center gap-1.5 border-b border-white/10 bg-black/30 px-3">
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="ml-2 rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/50">
          {project.slug}.twinsdev.app
        </span>
      </div>
      <span
        className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-display)] text-[clamp(4rem,9vw,6.5rem)] font-bold leading-none tracking-tight transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ color: `${project.accent}`, opacity: 0.55, textShadow: `0 0 60px ${project.accent}80` }}
      >
        {initials}
      </span>
    </div>
  );
}
