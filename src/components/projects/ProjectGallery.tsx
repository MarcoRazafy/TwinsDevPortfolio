"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project;
  /** Prévient le parent quand la grande vue s'ouvre ou se ferme (pour mettre la rotation en pause). */
  onViewerChange?: (open: boolean) => void;
};

/**
 * Galerie d'un projet : bande d'images qu'on fait défiler (aimantée), chacune avec sa description.
 * Un clic ouvre la grande vue (<dialog> natif : Échap pour fermer, flèches pour naviguer).
 */
export default function ProjectGallery({ project, onViewerChange }: Props) {
  const images = project.gallery ?? [];
  const reduce = useReducedMotion() ?? false;
  const stripRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // Ouvre / ferme la boîte de dialogue native en suivant l'état
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  const updateEdges = () => {
    const el = stripRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  // Flèches de défilement justes dès l'affichage et après chaque redimensionnement
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!images.length) return null;

  const scroll = (dir: -1 | 1) =>
    stripRef.current?.scrollBy({ left: dir * stripRef.current.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  const show = (i: number | null) => {
    setOpen(i);
    onViewerChange?.(i !== null);
  };
  const step = (dir: -1 | 1) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length));
  const current = open !== null ? images[open] : null;

  return (
    <div className="flex flex-col gap-2.5 pt-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky-200/60">
          Galerie · {images.length} image{images.length > 1 ? "s" : ""}
        </p>
        {images.length > 1 && (
          <div className="flex gap-1">
            <StripButton label="Images précédentes" disabled={edges.start} onClick={() => scroll(-1)}>
              <ChevronLeft size={16} aria-hidden />
            </StripButton>
            <StripButton label="Images suivantes" disabled={edges.end} onClick={() => scroll(1)}>
              <ChevronRight size={16} aria-hidden />
            </StripButton>
          </div>
        )}
      </div>

      <ul
        ref={stripRef}
        onScroll={updateEdges}
        aria-label={`Galerie du projet ${project.title}`}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-2 [scrollbar-color:rgba(125,211,252,0.3)_transparent] [scrollbar-width:thin]"
      >
        {images.map((g, i) => (
          <li key={g.src} className="w-[min(78%,260px)] shrink-0 snap-start">
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={`Agrandir l'image ${i + 1}${g.caption ? ` : ${g.caption}` : ""}`}
              className="group relative block aspect-[16/10] w-full overflow-hidden rounded-xl border border-sky-300/15 bg-[#050b18] transition-colors hover:border-sky-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <Image src={g.src} alt="" fill sizes="260px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand size={13} aria-hidden />
              </span>
            </button>
            {g.caption && <p className="mt-2 line-clamp-3 text-[12.5px] leading-snug text-sky-50/75">{g.caption}</p>}
          </li>
        ))}
      </ul>

      {/* Grande vue */}
      <dialog
        ref={dialogRef}
        onClose={() => show(null)}
        onClick={(e) => e.target === e.currentTarget && show(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        aria-label={current ? `Image ${open! + 1} sur ${images.length}` : undefined}
        className="m-auto w-[min(1100px,94vw)] max-w-none overflow-visible bg-transparent p-0 text-white backdrop:bg-[#02050c]/85 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="flex flex-col gap-3">
            <div className="relative aspect-[16/10] max-h-[74vh] w-full overflow-hidden rounded-2xl border border-sky-300/20 bg-[#050b18] shadow-[0_40px_120px_-30px_rgba(14,165,233,0.5)]">
              <Image src={current.src} alt={current.caption || `Image ${open! + 1} du projet ${project.title}`} fill sizes="94vw" className="object-contain" />
            </div>
            <figcaption className="flex items-start justify-between gap-4 px-1">
              <p className="text-[14.5px] leading-relaxed text-sky-50/85">{current.caption}</p>
              <span className="shrink-0 font-mono text-[12px] text-sky-200/60">
                {open! + 1} / {images.length}
              </span>
            </figcaption>
          </figure>
        )}
        <div className="absolute -top-12 right-0 flex gap-1.5 sm:-right-2">
          {images.length > 1 && (
            <>
              <StripButton label="Image précédente" onClick={() => step(-1)}>
                <ChevronLeft size={18} aria-hidden />
              </StripButton>
              <StripButton label="Image suivante" onClick={() => step(1)}>
                <ChevronRight size={18} aria-hidden />
              </StripButton>
            </>
          )}
          <StripButton label="Fermer" onClick={() => show(null)}>
            <X size={18} aria-hidden />
          </StripButton>
        </div>
      </dialog>
    </div>
  );
}

function StripButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-sky-300/20 bg-[#0b1426]/80 text-sky-50/85 transition-colors hover:border-sky-300/50 hover:text-white disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      {children}
    </button>
  );
}
