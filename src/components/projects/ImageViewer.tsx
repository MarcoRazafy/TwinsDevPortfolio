"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import type { GalleryImage } from "@/lib/projects";

const MAX_ZOOM = 5;
const TAP_ZOOM = 2.5; // zoom d'un double appui
const SWIPE = 60; // px : glissement horizontal qui change d'image (sans zoom)

type View = { s: number; x: number; y: number };
type Point = { x: number; y: number };

/**
 * Visionneuse plein écran : pincer (ou molette, ou − / +) pour zoomer, double appui pour zoomer sur un
 * point, glisser pour se déplacer dans l'image zoomée ; sans zoom, glisser à gauche ou à droite change
 * d'image. Échap ferme. Les transformations sont écrites directement sur l'image (aucun rendu React par geste).
 */
export default function ImageViewer({
  images,
  index,
  title,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const image = images[index];
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const view = useRef<View>({ s: 1, x: 0, y: 0 });
  const ratio = useRef(16 / 10); // largeur / hauteur de l'image, connue au chargement
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<null | { kind: "pinch"; d0: number; m0: Point; v0: View } | { kind: "pan"; p0: Point; v0: View }>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  const many = images.length > 1;

  /** Image suivante / précédente, zoom remis à 1. */
  const step = (dir: 1 | -1) => {
    view.current = { s: 1, x: 0, y: 0 };
    if (layerRef.current) layerRef.current.style.transform = "";
    setZoomed(false);
    onIndexChange((index + dir + images.length) % images.length);
  };

  /** Taille affichée de l'image à zoom 1 (contenue dans la scène). */
  const base = () => {
    const st = stageRef.current;
    if (!st) return { w: 0, h: 0, sw: 0, sh: 0 };
    const sw = st.clientWidth;
    const sh = st.clientHeight;
    const w = Math.min(sw, sh * ratio.current);
    return { w, h: w / ratio.current, sw, sh };
  };

  /** Applique le zoom en gardant l'image dans la scène. */
  const apply = (next: View) => {
    const s = Math.min(MAX_ZOOM, Math.max(1, next.s));
    const { w, h, sw, sh } = base();
    const mx = Math.max(0, (w * s - sw) / 2);
    const my = Math.max(0, (h * s - sh) / 2);
    view.current = { s, x: Math.min(mx, Math.max(-mx, next.x)), y: Math.min(my, Math.max(-my, next.y)) };
    if (layerRef.current) layerRef.current.style.transform = `translate3d(${view.current.x}px, ${view.current.y}px, 0) scale(${s})`;
    setZoomed(s > 1.01);
  };

  /** Zoom vers `s`, centré sur un point de l'écran (coordonnées relatives au centre de la scène). */
  const zoomAt = (s: number, at: Point) => {
    const v = view.current;
    const k = Math.min(MAX_ZOOM, Math.max(1, s)) / v.s;
    apply({ s: v.s * k, x: at.x - (at.x - v.x) * k, y: at.y - (at.y - v.y) * k });
  };

  const fromCenter = (clientX: number, clientY: number): Point => {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? { x: clientX - r.left - r.width / 2, y: clientY - r.top - r.height / 2 } : { x: 0, y: 0 };
  };

  // Ouverture : page figée, focus sur « Fermer », retour du focus à la fermeture ; molette = zoom
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    const stage = stageRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(view.current.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), fromCenter(e.clientX, e.clientY));
    };
    stage?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      html.style.overflow = overflow;
      stage?.removeEventListener("wheel", onWheel);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- installé une fois à l'ouverture
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = {
        kind: "pinch",
        d0: Math.hypot(a.x - b.x, a.y - b.y),
        m0: fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2),
        v0: { ...view.current },
      };
    } else if (pts.length === 1) {
      gesture.current = { kind: "pan", p0: { x: e.clientX, y: e.clientY }, v0: { ...view.current } };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.kind === "pinch") {
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const s = g.v0.s * (Math.hypot(a.x - b.x, a.y - b.y) / g.d0);
      const m = fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2);
      const k = Math.min(MAX_ZOOM, Math.max(1, s)) / g.v0.s;
      apply({ s: g.v0.s * k, x: m.x - (g.m0.x - g.v0.x) * k, y: m.y - (g.m0.y - g.v0.y) * k });
    } else if (view.current.s > 1.01) {
      apply({ ...view.current, x: g.v0.x + e.clientX - g.p0.x, y: g.v0.y + e.clientY - g.p0.y });
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g?.kind === "pan") {
      const dx = e.clientX - g.p0.x;
      const dy = e.clientY - g.p0.y;
      const moved = Math.hypot(dx, dy);
      // Sans zoom : glissement horizontal → image suivante / précédente
      if (g.v0.s <= 1.01 && many && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      // Double appui → zoom sur le point touché, ou retour à 1
      else if (moved < 10) {
        const now = performance.now();
        const t = lastTap.current;
        if (now - t.t < 300 && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 30) {
          if (view.current.s > 1.01) apply({ s: 1, x: 0, y: 0 });
          else zoomAt(TAP_ZOOM, fromCenter(e.clientX, e.clientY));
          lastTap.current = { t: 0, x: 0, y: 0 };
        } else lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
    }
    // Il reste un doigt après un pincement : on repart en déplacement depuis sa position
    const rest = [...pointers.current.values()][0];
    gesture.current = rest ? { kind: "pan", p0: rest, v0: { ...view.current } } : null;
  };

  if (!image) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} : image ${index + 1} sur ${images.length}, en plein écran`}
      className="fixed inset-0 z-[200] flex flex-col bg-[#02060d]"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        else if (e.key === "ArrowRight" && many) step(1);
        else if (e.key === "ArrowLeft" && many) step(-1);
        else if (e.key === "+" || e.key === "=") zoomAt(view.current.s * 1.4, { x: 0, y: 0 });
        else if (e.key === "-") zoomAt(view.current.s / 1.4, { x: 0, y: 0 });
      }}
    >
      {/* Barre du haut : position, zoom, fermer */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
        <p className="min-w-0 truncate font-mono text-[12px] tracking-[0.12em] text-sky-100/75" aria-live="polite">
          {many && `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")} · `}
          {image.caption || title}
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          <ViewerButton label="Dézoomer" onClick={() => zoomAt(view.current.s / 1.4, { x: 0, y: 0 })} disabled={!zoomed}>
            <Minus size={18} aria-hidden />
          </ViewerButton>
          <ViewerButton label="Zoomer" onClick={() => zoomAt(view.current.s * 1.4, { x: 0, y: 0 })}>
            <Plus size={18} aria-hidden />
          </ViewerButton>
          <ViewerButton label="Fermer le plein écran" onClick={onClose} buttonRef={closeRef}>
            <X size={19} aria-hidden />
          </ViewerButton>
        </div>
      </div>

      {/* Scène : gestes de zoom et de déplacement */}
      <div
        ref={stageRef}
        className={`relative min-h-0 flex-1 touch-none select-none overflow-hidden ${zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={layerRef} className="absolute inset-0 origin-center will-change-transform">
          <Image
            key={image.src}
            src={image.src}
            alt={image.caption || `Aperçu du projet ${title}`}
            fill
            sizes="100vw"
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              if (el.naturalWidth && el.naturalHeight) ratio.current = el.naturalWidth / el.naturalHeight;
            }}
            className="pointer-events-none object-contain"
          />
        </div>

        {many && (
          <>
            <ViewerButton label="Image précédente" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4">
              <ChevronLeft size={20} aria-hidden />
            </ViewerButton>
            <ViewerButton label="Image suivante" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4">
              <ChevronRight size={20} aria-hidden />
            </ViewerButton>
          </>
        )}
      </div>

      <p className="px-4 pb-4 pt-2 text-center text-[12.5px] text-sky-100/55">
        Pincez ou touchez deux fois pour zoomer{many ? " · glissez pour changer d'image" : ""}
      </p>
    </div>,
    document.body,
  );
}

function ViewerButton({
  label,
  onClick,
  disabled,
  className = "",
  buttonRef,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`z-10 grid h-11 w-11 place-items-center rounded-full border border-sky-300/30 bg-[#06101f]/85 text-sky-50 transition-colors hover:border-sky-300/70 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${className}`}
    >
      {children}
    </button>
  );
}
