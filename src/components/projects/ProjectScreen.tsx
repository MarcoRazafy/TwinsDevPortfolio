"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage, Project } from "@/lib/projects";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** Écran incurvé : nombre de bandes verticales et angle total de la courbure. */
const SLICES = 18;
const ARC_DEG = 46;

type Props = {
  /** Projets de la catégorie affichée (dans l'ordre de l'orbite). */
  projects: Project[];
  /** Projet ouvert, ou `null` (écran fermé). */
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Écran virtuel holographique, affiché dans la page sous le globe : à l'ouverture d'un projet, un écran
 * incurvé se déploie, la photo du projet s'y affiche (puis sa galerie), avec une courte description dessous.
 */
export default function ProjectScreen({ projects, index, onClose, onIndexChange }: Props) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const project = index !== null ? projects[index] : null;
  const isOpen = project !== null;

  // À l'ouverture (pas en passant d'un projet à l'autre), on fait défiler la page jusqu'à l'écran
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [isOpen, reduce]);

  return (
    <AnimatePresence initial={false}>
      {project && index !== null && (
        <motion.section
          ref={ref}
          key="ecran"
          id="ecran-projet"
          aria-labelledby="ecran-projet-titre"
          className="w-full scroll-mt-24 overflow-hidden text-white"
          initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.35, ease: EXPO_OUT } }}
          transition={{ duration: 0.6, ease: EXPO_OUT }}
        >
          <ScreenContent
            key={project.slug}
            project={project}
            position={index}
            total={projects.length}
            onClose={onClose}
            onStep={(dir) => onIndexChange((index + dir + projects.length) % projects.length)}
          />
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function ScreenContent({
  project,
  position,
  total,
  onClose,
  onStep,
}: {
  project: Project;
  position: number;
  total: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  // À l'ouverture : la photo du projet ; en faisant défiler : les photos ajoutées au projet (sa galerie)
  const images: GalleryImage[] = [...(project.image ? [{ src: project.image, caption: "" }] : []), ...(project.gallery ?? [])];
  const [shown, setShown] = useState(0);
  const current = images[shown];

  // Inclinaison qui suit le pointeur (légère)
  const tiltX = useSpring(0, { stiffness: 120, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 });
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };

  const step = (dir: 1 | -1) => setShown((i) => (i + dir + images.length) % images.length);

  return (
    <div
      className="flex flex-col items-center gap-5 px-1 pb-4 pt-10 sm:gap-6"
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (images.length < 2) return;
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      {/* Bandeau HUD au-dessus de l'écran */}
      <div className="flex w-full max-w-[880px] items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-sky-200/70">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          Projet {String(position + 1).padStart(2, "0")}
          <span className="text-sky-200/30">/</span>
          {String(total).padStart(2, "0")}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'écran"
          className="grid h-10 w-10 place-items-center rounded-full border border-sky-300/25 bg-[#0b1426]/80 text-sky-50/85 transition-colors hover:border-sky-300/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      {/* L'écran incurvé */}
      <CurvedScreen
        image={current}
        title={project.title}
        tiltX={tiltX}
        tiltY={tiltY}
        reduce={reduce}
        imageKey={shown}
        onPrev={images.length > 1 ? () => step(-1) : undefined}
        onNext={images.length > 1 ? () => step(1) : undefined}
      />

      {/* Points + légende de l'image */}
      {images.length > 1 && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Images du projet">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Image ${i + 1} sur ${images.length}`}
              aria-current={i === shown || undefined}
              className="grid h-6 place-items-center px-0.5 focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === shown ? "w-6 bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]" : "w-1.5 bg-white/25"
                }`}
              />
            </button>
          ))}
        </div>
      )}
      {current?.caption && <p className="-mt-2 max-w-[640px] text-center text-[13.5px] italic text-sky-100/70">{current.caption}</p>}

      {/* Courte description */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EXPO_OUT, delay: reduce ? 0 : 0.55 }}
        className="relative w-full max-w-[760px] overflow-hidden rounded-[24px] border border-sky-300/15 bg-[linear-gradient(160deg,rgba(14,30,60,0.8),rgba(5,11,24,0.9))] p-5 shadow-[0_30px_80px_-30px_rgba(2,132,199,0.6)] sm:p-6"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
        {/* Seul le titre est obligatoire : secteur, description et points livrés n'apparaissent que s'ils sont remplis */}
        {project.kind && (
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: project.accent }}>
            {project.kind}
          </p>
        )}
        <h2 id="ecran-projet-titre" className="font-[family-name:var(--font-display)] text-[1.3rem] font-semibold leading-tight tracking-[-0.015em] sm:text-[1.5rem]">
          {project.title}
        </h2>
        {project.problem && <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{project.problem}</p>}
        {project.delivered.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.delivered.map((line) => (
              <li key={line} className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2.5 py-1 text-[12.5px] text-sky-50/90">
                {line}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sky-300/10 pt-4">
          <div className="flex items-center gap-1.5">
            <RoundButton label="Projet précédent" onClick={() => onStep(-1)}>
              <ChevronLeft size={17} aria-hidden />
            </RoundButton>
            <RoundButton label="Projet suivant" onClick={() => onStep(1)}>
              <ChevronRight size={17} aria-hidden />
            </RoundButton>
          </div>
          {project.links.site && (
            <a
              href={project.links.site}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-sky-300/10 px-4 text-[13.5px] font-semibold text-sky-200 ring-1 ring-inset ring-sky-300/30 transition-colors hover:bg-sky-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Voir le site
              <ArrowUpRight size={15} aria-hidden />
            </a>
          )}
        </div>
      </motion.section>
    </div>
  );
}

/**
 * Écran incurvé en 3D : l'image est découpée en bandes verticales posées sur un cylindre
 * (bords vers l'observateur), avec des bords néon, un reflet de verre et des lignes de balayage.
 */
function CurvedScreen({
  image,
  title,
  tiltX,
  tiltY,
  reduce,
  imageKey,
  onPrev,
  onNext,
}: {
  image: GalleryImage | undefined;
  title: string;
  tiltX: ReturnType<typeof useSpring>;
  tiltY: ReturnType<typeof useSpring>;
  reduce: boolean;
  imageKey: number;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [natural, setNatural] = useState<{ src: string; w: number; h: number } | null>(null);

  // Largeur de l'écran (suit la fenêtre)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dimensions réelles de l'image, pour l'afficher entière (sans la déformer)
  useEffect(() => {
    if (!image) return;
    const img = new window.Image();
    img.onload = () => setNatural({ src: image.src, w: img.naturalWidth, h: img.naturalHeight });
    img.src = image.src;
  }, [image]);

  const arc = (ARC_DEG * Math.PI) / 180;
  const radius = width / arc;
  const stepRad = arc / SLICES;
  const chord = 2 * radius * Math.sin(stepRad / 2);
  const W = chord * SLICES;
  const H = width * 0.625;
  const dims = natural && natural.src === image?.src ? natural : { w: 16, h: 10 };
  const scale = Math.min(W / dims.w, H / dims.h);
  const bw = dims.w * scale;
  const bh = dims.h * scale;
  const offX = (W - bw) / 2;
  const offY = (H - bh) / 2;
  const depth = radius * (1 - Math.cos(arc / 2)); // avancée des bords

  return (
    <div ref={boxRef} className="relative w-full max-w-[880px]" style={{ height: H + depth * 0.35 || "55vw" }}>
      <div className="absolute inset-0 [perspective:1700px]" role="img" aria-label={image?.caption || `Aperçu du projet ${title}`}>
        <motion.div
          className="absolute left-1/2 top-0 h-full [transform-style:preserve-3d]"
          style={{ rotateX: tiltX, rotateY: tiltY, width: 0 }}
          initial={reduce ? false : { scale: 0.72, rotateX: 22, y: 40 }}
          animate={{ scale: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.9, ease: EXPO_OUT }}
        >
          {width > 0 &&
            Array.from({ length: SLICES }, (_, i) => {
              const angle = ((SLICES - 1) / 2 - i) * (ARC_DEG / SLICES);
              const first = i === 0;
              const last = i === SLICES - 1;
              // Chevauchement entre bandes : évite les fines lignes aux jonctions (lissage des bords en 3D)
              const overlap = 2.5;
              const style: CSSProperties = {
                width: chord + overlap,
                height: H,
                marginLeft: -(chord + overlap) / 2,
                outline: "1px solid transparent",
                transform: `translateZ(${radius - depth * 0.5}px) rotateY(${angle}deg) translateZ(${-radius}px)`,
                backgroundColor: "rgba(6,16,32,0.88)",
                backgroundImage: image ? `url("${image.src}")` : undefined,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${bw}px ${bh}px`,
                backgroundPosition: `${offX - i * chord + overlap / 2}px ${offY}px`,
                borderTop: "1.5px solid rgba(125,211,252,0.65)",
                borderBottom: "1.5px solid rgba(52,211,153,0.55)",
                ...(first && { borderLeft: "3px solid rgba(125,211,252,0.95)", boxShadow: "-10px 0 28px -6px rgba(56,189,248,0.75)" }),
                ...(last && { borderRight: "3px solid rgba(52,211,153,0.95)", boxShadow: "10px 0 28px -6px rgba(52,211,153,0.7)" }),
              };
              return (
                <motion.div
                  key={`${imageKey}-${i}`}
                  className="absolute left-0 top-0 [backface-visibility:hidden]"
                  style={style}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0.35, 1] }}
                  transition={{ duration: 0.55, times: [0, 0.4, 0.6, 1], delay: 0.15 + i * 0.022 }}
                >
                  {/* Verre : reflet, teinte et lignes de balayage */}
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(186,230,253,0.16), transparent 32%, transparent 78%, rgba(56,189,248,0.12)), repeating-linear-gradient(to bottom, rgba(125,211,252,0.06) 0 1px, transparent 1px 3px)",
                    }}
                  />
                </motion.div>
              );
            })}
        </motion.div>
      </div>

      {/* Balayage lumineux à l'ouverture */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-[4%] h-14 bg-[linear-gradient(to_bottom,transparent,rgba(125,211,252,0.35),transparent)]"
          initial={{ top: "-8%", opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, ease: "easeInOut", delay: 0.4 }}
          key={`scan-${imageKey}`}
        />
      )}

      {/* Repères d'angle (HUD) */}
      {[
        "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
        "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
        "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
        "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
      ].map((pos) => (
        <span key={pos} aria-hidden className={`pointer-events-none absolute -m-3 h-5 w-5 border-sky-300/60 ${pos}`} />
      ))}

      {/* Flèches entre les images */}
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          aria-label="Image précédente"
          className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-sky-300/30 bg-[#06101f]/80 text-sky-50 backdrop-blur-sm transition-colors hover:border-sky-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:-left-5"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          aria-label="Image suivante"
          className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-sky-300/30 bg-[#06101f]/80 text-sky-50 backdrop-blur-sm transition-colors hover:border-sky-300/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:-right-5"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      )}
    </div>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-sky-300/20 bg-sky-300/[0.05] text-sky-100/85 transition-colors hover:border-sky-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      {children}
    </button>
  );
}
