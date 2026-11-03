"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, MousePointerClick, Pause, Play } from "lucide-react";
import type { Category, Project, ProjectCategory } from "@/lib/projects";
import { categoryIcon } from "./category-icons";
import { anchorPoints, drawAnchor, drawBeam, drawGlobe, drawOrbit, type AnchorPoints } from "./hologram/globe";
import ProjectScreen from "./ProjectScreen";

/** Latitudes des légendes, dans l'ordre : alternées pour qu'elles ne s'alignent pas. */
const ANCHOR_LATS = [40, 14, 48, -25, 28, -8, 56, -40];
/** Point d'ancrage (latitude, longitude) de la légende n° i sur n : réparties tout autour du globe, pour qu'il y en ait toujours devant. */
const anchorOf = (i: number, n: number): [number, number] => [ANCHOR_LATS[i % ANCHOR_LATS.length], -100 + (i * 360) / Math.max(n, 1)];
const SPIN_MS = 1300; // rotation du globe vers la légende choisie

const GLOBE_SPEED = 0.07; // rad/s, rotation du globe
const ORBIT_SPEED = 0.15; // rad/s, rotation de l'anneau d'images
const TILT = 0.32; // rad, inclinaison du globe vers l'observateur
const ENTER_MS = 1000; // sortie d'une image hors du globe
const LEAVE_MS = 520; // retour d'une image dans le globe
const STAGGER = 90; // ms entre deux images qui sortent
const FOCUS_MS = 900; // rotation pour amener une image devant
const HOLD_MS = 6000; // pause après une action, avant de reprendre la rotation

type Orbiter = { key: string; project: Project };
type Timing = { enter: number; leave: number | null; slot: number; count: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Écart d'angle ramené dans ]-π, π]. */
const angleDiff = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type Props = { projects: Project[]; categories: Category[] };

/**
 * Section projets en hologramme : un globe terrestre qui tourne, et au choix d'une catégorie,
 * les visuels des projets sortent du globe et tournent autour en boucle. L'image passée devant
 * est détaillée sous le globe ; un clic sur une image (ou les flèches) l'amène devant.
 */
export default function ProjectsHologram({ projects, categories }: Props) {
  const reduce = useReducedMotion() ?? false;

  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const [orbiters, setOrbiters] = useState<Orbiter[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [currentKeys, setCurrentKeys] = useState<string[]>([]); // miroir de `current`, pour le rendu
  const [choice, setChoice] = useState<boolean | null>(null); // `null` : suit la préférence système
  const autoplay = choice ?? !reduce;

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardEls = useRef(new Map<string, HTMLElement>());
  const labelEls = useRef(new Map<ProjectCategory, HTMLElement>());
  const timing = useRef(new Map<string, Timing>());
  const current = useRef<string[]>([]); // clés en orbite (hors départs), dans l'ordre des emplacements
  const generation = useRef(0);
  const clock = useRef(0);
  const live = useRef({ autoplay: true, reduce: false, category: null as ProjectCategory | null });
  const orbit = useRef({ angle: Math.PI / 2, tween: null as null | { from: number; to: number; start: number }, holdUntil: 0 });
  const globe = useRef({ spin: 1.2, velocity: 0, tween: null as null | { from: number; to: number; start: number } });
  const drag = useRef<null | { id: number; x: number; spin: number; lastX: number }>(null);
  const hovered = useRef(false);
  // Panneau de détail survolé / utilisé, ou grande vue de la galerie ouverte : l'anneau s'arrête
  const panelHovered = useRef(false);
  const panelFocused = useRef(false);
  const viewerOpen = useRef(false);
  const labelHovered = useRef(false); // une légende survolée : le globe s'arrête pour qu'on puisse cliquer

  const counts = Object.fromEntries(
    categories.map(({ key }) => [key, projects.filter((p) => p.categories.includes(key)).length]),
  ) as Record<ProjectCategory, number>;
  // Légendes du globe : les catégories qui ont au moins un projet, avec leur point d'ancrage
  const legends = categories
    .filter((c) => counts[c.key] > 0)
    .map((c, i, all) => ({ ...c, anchor: anchorOf(i, all.length) }));
  const legendsRef = useRef(legends);

  useEffect(() => {
    live.current = { autoplay, reduce, category };
    legendsRef.current = legends;
  });

  const activeProject = orbiters.find((o) => o.key === activeKey)?.project ?? null;
  const currentList = orbiters.filter((o) => currentKeys.includes(o.key));
  const activeIndex = currentList.findIndex((o) => o.key === activeKey);
  // Écran virtuel : projet ouvert (index dans la catégorie affichée), ou `null`
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openProject = (key: string | null) => {
    const i = currentList.findIndex((o) => o.key === key);
    if (i < 0) return;
    viewerOpen.current = true;
    setOpenIndex(i);
  };
  const closeScreen = () => {
    viewerOpen.current = false;
    setOpenIndex(null);
  };
  /** Flèches de la barre : écran ouvert → change le projet affiché ; sinon → fait tourner l'anneau. */
  const stepBar = (dir: 1 | -1) => {
    if (openIndex === null) return step(dir);
    const i = (openIndex + dir + currentList.length) % currentList.length;
    setOpenIndex(i);
    focusSlot(i);
  };

  /* ── Choix d'une catégorie : les images actuelles rentrent dans le globe, les nouvelles en sortent ── */
  const select = (next: ProjectCategory) => {
    if (next === category) return;
    const now = clock.current;
    const leaving = current.current;
    leaving.forEach((k) => {
      const t = timing.current.get(k);
      if (t) t.leave = now;
    });

    const gen = ++generation.current;
    const list = projects.filter((p) => p.categories.includes(next));
    const entering = list.map((project) => ({ key: `${gen}:${project.slug}`, project }));
    const delay = leaving.length ? LEAVE_MS * 0.55 : 0;
    entering.forEach((o, i) => timing.current.set(o.key, { enter: now + delay + i * STAGGER, leave: null, slot: i, count: list.length }));
    current.current = entering.map((o) => o.key);

    // Le globe pivote pour amener la légende choisie devant, légèrement décalée sur la droite
    const g = globe.current;
    const target = -(legends.find((l) => l.key === next)?.anchor[1] ?? 0) * (Math.PI / 180) + 0.45;
    g.velocity = 0;
    g.tween = { from: g.spin, to: g.spin + angleDiff(target - g.spin), start: now };

    // La première image arrive devant, en fin de sortie (l'anneau tourne dans le sens des angles croissants)
    orbit.current.tween = null;
    orbit.current.angle = Math.PI / 2 - 0.15;
    orbit.current.holdUntil = 0;

    setCategory(next);
    viewerOpen.current = false;
    setOpenIndex(null);
    setCurrentKeys(current.current);
    setActiveKey(null);
    setOrbiters((prev) => [...prev.filter((o) => leaving.includes(o.key)), ...entering]);
    if (leaving.length) {
      const gone = new Set(leaving);
      setTimeout(() => {
        gone.forEach((k) => timing.current.delete(k));
        setOrbiters((prev) => prev.filter((o) => !gone.has(o.key)));
      }, LEAVE_MS + 60);
    }
  };

  /** Fait tourner l'anneau jusqu'à amener l'emplacement `slot` devant. */
  const focusSlot = (slot: number) => {
    const count = current.current.length;
    if (!count) return;
    const o = orbit.current;
    const target = Math.PI / 2 - (slot * Math.PI * 2) / count;
    const from = o.angle;
    o.tween = { from, to: from + angleDiff(target - from), start: clock.current };
    o.holdUntil = clock.current + FOCUS_MS + HOLD_MS;
  };
  const focusKey = (key: string) => {
    const slot = current.current.indexOf(key);
    if (slot >= 0) focusSlot(slot);
  };
  const step = (dir: 1 | -1) => {
    const count = current.current.length;
    if (!count) return;
    const slot = Math.max(0, current.current.indexOf(activeKey ?? ""));
    focusSlot((slot + dir + count) % count);
  };

  /* ── Boucle d'animation : globe + anneau, dans un seul requestAnimationFrame ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx) return;

    let raf = 0;
    let last = 0;
    let visible = true;
    let presence = 0;
    let frontKey: string | null = null;
    const size = { w: 0, h: 0, dpr: 1, r: 0, rx: 0, ry: 0 };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" });
    io.observe(stage);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Petit écran : globe plus grand, images plus petites, orbite plus haute (au-dessus / au-dessous du globe)
      const narrow = w < 640;
      const r = narrow ? Math.min(w * 0.27, h * 0.27) : Math.min(w * 0.21, h * 0.29);
      const cardW = narrow ? Math.max(92, w * 0.26) : Math.max(118, Math.min(w * 0.17, 230));
      // Jamais négatif : une scène encore masquée (largeur 0) ferait échouer ctx.ellipse()
      const rx = Math.max(0, narrow ? w / 2 - cardW * 0.38 : Math.max(r * 1.4, Math.min(r * 2.3, w / 2 - cardW * 0.42)));
      Object.assign(size, { w, h, dpr, r, rx, ry: r * (narrow ? 1.3 : 0.84) });
      stage.style.setProperty("--card-w", `${cardW}px`);
      stage.style.setProperty("--globe-d", `${r * 2}px`);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    type Placed = { key: string; x: number; y: number; depth: number; k: number };

    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(ts - last, 50) : 16;
      last = ts;
      clock.current = ts;
      // Hors écran, ou scène pas encore mesurée (section masquée) : rien à dessiner
      if (!visible || size.w < 40 || size.h < 40) return;

      const { autoplay: moving, reduce: still, category: chosen } = live.current;
      const { w, h, dpr, r, rx, ry } = size;
      const cx = w / 2;
      const cy = h / 2;

      // Globe : rotation vers une légende choisie, sinon rotation continue + élan après un glisser
      const g = globe.current;
      if (g.tween) {
        const t = still ? 1 : clamp01((ts - g.tween.start) / SPIN_MS);
        g.spin = g.tween.from + (g.tween.to - g.tween.from) * easeInOutCubic(t);
        if (t >= 1) g.tween = null;
      } else if (!drag.current) {
        g.spin += (moving && !labelHovered.current ? (GLOBE_SPEED * dt) / 1000 : 0) + g.velocity;
        g.velocity *= 0.94;
      }
      const view = { cx, cy, r, spin: g.spin, tilt: TILT };

      // Légendes : pied sur le globe, étiquette au bout de la tige, du côté extérieur
      const anchors: [ProjectCategory, AnchorPoints][] = [];
      for (const { key, anchor } of legendsRef.current) {
        const a = anchorPoints(view, anchor[0], anchor[1], r < 140 ? 1.3 : 1.36);
        anchors.push([key, a]);
        const el = labelEls.current.get(key);
        if (!el) continue;
        const lw = el.offsetWidth;
        const lh = el.offsetHeight;
        const right = a.tx >= a.bx;
        const x = Math.min(w - lw - 4, Math.max(4, right ? a.tx + 6 : a.tx - 6 - lw));
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(a.ty - lh / 2).toFixed(1)}px, 0)`;
        el.style.opacity = (0.3 + 0.7 * a.vis).toFixed(3);
        el.style.zIndex = a.vis > 0.5 ? "35" : "26";
      }

      // Anneau : rotation, ou animation vers une image choisie
      const o = orbit.current;
      if (o.tween) {
        const t = still ? 1 : clamp01((ts - o.tween.start) / FOCUS_MS);
        o.angle = o.tween.from + (o.tween.to - o.tween.from) * easeInOutCubic(t);
        if (t >= 1) o.tween = null;
      } else if (
        moving &&
        !hovered.current &&
        !panelHovered.current &&
        !panelFocused.current &&
        !viewerOpen.current &&
        ts > o.holdUntil
      ) {
        o.angle += (ORBIT_SPEED * dt) / 1000;
      }

      // Place chaque image : sortie du globe (k : 0 → 1), orbite, retour
      const placed: Placed[] = [];
      let maxK = 0;
      let bestDepth = -2;
      let best: string | null = null;
      for (const [key, t] of timing.current) {
        const el = cardEls.current.get(key);
        if (!el) continue;
        const enterT = still ? (ts >= t.enter ? 1 : 0) : clamp01((ts - t.enter) / ENTER_MS);
        const leaveT = t.leave === null ? 0 : still ? 1 : clamp01((ts - t.leave) / LEAVE_MS);
        const k = (enterT > 0 ? easeOutBack(enterT) : 0) * (1 - easeInCubic(leaveT));
        const theta = o.angle + (t.slot * Math.PI * 2) / t.count - (1 - enterT) * 1.1 + leaveT * 1.4;
        const x = cx + k * rx * Math.cos(theta);
        const y = cy + k * ry * Math.sin(theta);
        const depth = Math.sin(theta); // 1 : devant, -1 : derrière le globe
        const near = (depth + 1) / 2;
        const scale = (0.56 + 0.44 * near) * (0.2 + 0.8 * Math.min(k, 1));
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotateY(${(-Math.cos(theta) * 24).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = (clamp01(k * 1.4) * (0.32 + 0.68 * near)).toFixed(3);
        el.style.zIndex = depth > 0 ? "30" : "10";
        el.style.pointerEvents = k > 0.6 && t.leave === null ? "auto" : "none";
        placed.push({ key, x, y, depth, k: Math.min(k, 1) });
        if (t.leave === null) {
          maxK = Math.max(maxK, Math.min(k, 1));
          if (enterT >= 1 && depth > bestDepth) {
            bestDepth = depth;
            best = key;
          }
        }
      }
      presence += (maxK - presence) * 0.12;
      if (best !== frontKey) {
        frontKey = best;
        setActiveKey(best);
      }

      // Dessin : arrière de l'anneau, faisceaux arrière, globe, avant de l'anneau, faisceaux avant
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const motionOn = still ? 0 : 1;
      drawOrbit(ctx, cx, cy, rx, ry, "back", presence);
      for (const p of placed) if (p.depth <= 0) drawBeam(ctx, cx, cy, r, p.x, p.y, p.k * 0.35);
      for (const [key, a] of anchors) if (a.bz <= 0) drawAnchor(ctx, a, r, ts, motionOn, key === chosen, !chosen);
      drawGlobe(ctx, view, ts, motionOn);
      for (const [key, a] of anchors) if (a.bz > 0) drawAnchor(ctx, a, r, ts, motionOn, key === chosen, !chosen);
      drawOrbit(ctx, cx, cy, rx, ry, "front", presence);
      for (const p of placed) if (p.depth > 0) drawBeam(ctx, cx, cy, r, p.x, p.y, p.k * (0.3 + 0.5 * p.depth));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  /* ── Glisser le globe pour le faire tourner ── */
  const onGlobeDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, spin: globe.current.spin, lastX: e.clientX };
    globe.current.velocity = 0;
  };
  const onGlobeMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    globe.current.spin = d.spin + (e.clientX - d.x) * 0.006;
    globe.current.velocity = (e.clientX - d.lastX) * 0.006;
    d.lastX = e.clientX;
  };
  const onGlobeUp = () => {
    drag.current = null;
  };

  return (
    <div className="flex flex-col items-center">
      {/* ── Consigne : les catégories sont des légendes posées sur le globe ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={category ?? "aucune"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex min-h-6 items-center gap-2 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-emerald-200/85"
        >
          <MousePointerClick size={14} aria-hidden className="shrink-0" />
          {category ? (
            <span>
              {categories.find((c) => c.key === category)?.label} · {counts[category]} projet{counts[category] > 1 ? "s" : ""}
              <span className="hidden sm:inline"> — touchez une autre légende pour changer</span>
            </span>
          ) : (
            "Touchez une légende sur le globe"
          )}
        </motion.p>
      </AnimatePresence>

      {/* ── Scène : globe (canvas) + images en orbite ── */}
      <div
        ref={stageRef}
        className="relative mt-4 h-[clamp(440px,62vw,760px)] w-full [perspective:1400px]"
        onPointerLeave={() => (hovered.current = false)}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(37,99,235,0.22),rgba(14,165,233,0.06)_55%,transparent)]"
        />
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full" />

        {/* Zone de prise du globe */}
        <div
          aria-hidden
          onPointerDown={onGlobeDown}
          onPointerMove={onGlobeMove}
          onPointerUp={onGlobeUp}
          onPointerCancel={onGlobeUp}
          className="absolute left-1/2 top-1/2 z-[25] h-[var(--globe-d)] w-[var(--globe-d)] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-pan-y rounded-full active:cursor-grabbing"
        />

        {/* Légendes : une par catégorie, accrochées à un point du globe (position mise à jour à chaque image) */}
        <div role="group" aria-label="Type de projet">
          {legends.map(({ key, label, icon }) => {
            const Icon = categoryIcon(icon);
            const active = category === key;
            return (
              <button
                key={key}
                ref={(el) => {
                  if (el) labelEls.current.set(key, el);
                  else labelEls.current.delete(key);
                }}
                type="button"
                onClick={() => select(key)}
                onPointerEnter={() => (labelHovered.current = true)}
                onPointerLeave={() => (labelHovered.current = false)}
                onFocus={() => (labelHovered.current = true)}
                onBlur={() => (labelHovered.current = false)}
                aria-pressed={active}
                aria-label={`${label} : ${counts[key]} projet${counts[key] > 1 ? "s" : ""}`}
                disabled={counts[key] === 0}
                style={{ opacity: 0 }}
                className="group absolute left-0 top-0 rounded-md transition-[filter] will-change-transform hover:brightness-125 focus-visible:outline-none disabled:cursor-not-allowed"
              >
                <span
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] backdrop-blur-sm transition-[background-color,border-color,box-shadow,color] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-emerald-300 sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-[12px] ${
                    active
                      ? "border-emerald-300/80 bg-emerald-400/15 text-white shadow-[0_0_28px_-4px_rgba(52,211,153,0.85)]"
                      : "border-emerald-300/30 bg-[#0a0f1f]/70 text-emerald-50/90 shadow-[0_0_18px_-8px_rgba(52,211,153,0.7)]"
                  }`}
                >
                  {!category && <span aria-hidden className="holo-invite pointer-events-none absolute inset-0 rounded-md" />}
                  <Icon size={13} aria-hidden className="shrink-0 text-emerald-300" />
                  {label}
                  <span className="tabular-nums text-emerald-300">{String(counts[key]).padStart(2, "0")}</span>
                </span>
              </button>
            );
          })}
        </div>

        {orbiters.map(({ key, project }) => (
          <button
            key={key}
            ref={(el) => {
              if (el) cardEls.current.set(key, el);
              else cardEls.current.delete(key);
            }}
            type="button"
            onClick={() => {
              focusKey(key);
              openProject(key);
            }}
            onFocus={() => focusKey(key)}
            onPointerEnter={() => (hovered.current = true)}
            onPointerLeave={() => (hovered.current = false)}
            aria-label={`${project.title} : ouvrir l'écran du projet`}
            aria-controls="ecran-projet"
            aria-current={key === activeKey || undefined}
            tabIndex={currentKeys.includes(key) ? 0 : -1}
            style={{ opacity: 0 }}
            className="group absolute left-0 top-0 w-[var(--card-w)] rounded-2xl text-left will-change-transform focus-visible:outline-none"
          >
            <span
              className={`relative block aspect-[16/10] overflow-hidden rounded-xl border bg-[#050b18] transition-[border-color,box-shadow] duration-500 ${
                key === activeKey
                  ? "border-sky-300/70 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_0_40px_-6px_rgba(56,189,248,0.75)]"
                  : "border-sky-300/20 shadow-[0_18px_40px_-14px_rgba(2,132,199,0.6)]"
              } group-hover:border-sky-200/80 group-focus-visible:ring-2 group-focus-visible:ring-sky-300`}
            >
              {project.image && (
                <Image src={project.image} alt="" fill sizes="240px" draggable={false} className="object-cover" />
              )}
              {/* Lignes de balayage et reflet : l'image a l'air projetée */}
              <span aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(125,211,252,0.07)_0_1px,transparent_1px_3px)] mix-blend-screen" />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(125deg,rgba(186,230,253,0.22),transparent_38%,transparent_70%,rgba(56,189,248,0.18))]" />
            </span>
            <span className="mt-2 block truncate text-center font-mono text-[11px] tracking-wide text-sky-100/80">
              {project.title.split(",")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Barre compacte : projet placé devant, ouverture de l'écran, navigation ── */}
      <div
        className="relative z-40 -mt-4 w-full max-w-[780px] px-1 sm:-mt-8"
        onPointerEnter={() => (panelHovered.current = true)}
        onPointerLeave={() => (panelHovered.current = false)}
        onFocus={(e) => {
          // Focus clavier seulement : un clic de souris ne doit pas figer la rotation
          if ((e.target as HTMLElement).matches(":focus-visible")) panelFocused.current = true;
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) panelFocused.current = false;
        }}
      >
        <div className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-[22px] border border-sky-300/15 bg-[linear-gradient(160deg,rgba(14,30,60,0.75),rgba(5,11,24,0.85))] p-3 pl-4 shadow-[0_24px_60px_-30px_rgba(2,132,199,0.55)] backdrop-blur-md sm:flex-nowrap sm:p-3.5 sm:pl-5">
          <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeProject?.slug ?? "vide"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="min-w-0 flex-1"
            >
              {activeProject ? (
                <>
                  {activeProject.kind && (
                    <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.14em]" style={{ color: activeProject.accent }}>
                      {activeProject.kind}
                    </p>
                  )}
                  <p className="truncate font-[family-name:var(--font-display)] text-[1.02rem] font-semibold">{activeProject.title}</p>
                </>
              ) : (
                <p className="text-[14px] leading-snug text-muted">
                  {category
                    ? "Projection en cours…"
                    : "Choisissez une catégorie sur le globe, puis touchez un projet pour l'ouvrir."}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {category && (
            <div className="flex shrink-0 items-center gap-1.5">
              <IconButton label="Projet précédent" onClick={() => stepBar(-1)}>
                <ChevronLeft size={18} aria-hidden />
              </IconButton>
              <span aria-hidden className="px-1 font-mono text-[12px] tabular-nums tracking-wider text-sky-100/50">
                {String((openIndex ?? Math.max(activeIndex, 0)) + 1).padStart(2, "0")}
                <span className="text-sky-100/25">/</span>
                {String(currentList.length).padStart(2, "0")}
              </span>
              <IconButton label="Projet suivant" onClick={() => stepBar(1)}>
                <ChevronRight size={18} aria-hidden />
              </IconButton>
              <IconButton label={autoplay ? "Mettre en pause la rotation" : "Lancer la rotation"} onClick={() => setChoice(!autoplay)}>
                {autoplay ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden className="translate-x-[1px]" />}
              </IconButton>
              <button
                type="button"
                disabled={!activeProject && openIndex === null}
                onClick={() => (openIndex !== null ? closeScreen() : openProject(activeKey))}
                aria-expanded={openIndex !== null}
                aria-controls="ecran-projet"
                className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-sky-300/15 px-4 text-[13px] font-semibold text-sky-100 ring-1 ring-inset ring-sky-300/40 transition-colors hover:bg-sky-300/25 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {openIndex !== null ? <Minimize2 size={14} aria-hidden /> : <Maximize2 size={14} aria-hidden />}
                {openIndex !== null ? "Fermer" : "Ouvrir"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Écran virtuel du projet ouvert */}
      <ProjectScreen
        projects={currentList.map((o) => o.project)}
        index={openIndex}
        onIndexChange={(i) => {
          setOpenIndex(i);
          focusSlot(i);
        }}
        onClose={closeScreen}
      />
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/15 bg-sky-300/[0.05] text-sky-100/80 transition-colors hover:border-sky-300/50 hover:bg-sky-300/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
    >
      {children}
    </button>
  );
}
