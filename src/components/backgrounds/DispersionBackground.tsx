"use client";

import { useEffect, useRef } from "react";
import type { BackgroundProps, PhoneState } from "./types";

/* Arrière-plan « dispersion » : un nuage de petits carrés s'échappe du téléphone en passant du vert
   au violet, comme si l'interface se désintégrait en particules. Le flux part surtout vers la droite
   tant que le téléphone est centré, puis surtout vers la gauche (vers les jumeaux) quand il se décale.
   Rendu sur <canvas> 2D, sans flou ni mode de fusion. */

const COLORS = ["#a7f3d0", "#34d399", "#2dd4bf", "#38bdf8", "#818cf8", "#a78bfa"];
const LANES = 7;
const MAX_DPR = 1.5;
/** Niveaux d'opacité : les particules sont dessinées par lots (teinte × niveau), pas une à une. */
const LEVELS = 4;
const BINS = COLORS.length * LEVELS;
const HIDDEN = 255;
/** Part des particules actives selon l'état du téléphone. */
const TARGET: Record<PhoneState, number> = { locked: 0.14, booting: 0.5, on: 1 };

/** Générateur pseudo-aléatoire à graine : mêmes particules à chaque chargement. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Api = { setState: (next: PhoneState) => void };

export default function DispersionBackground({ state }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef<PhoneState>(state);
  const api = useRef<Api | null>(null);

  // Transmet l'état au moteur sans le relancer (déclaré avant l'effet principal : s'exécute en premier)
  useEffect(() => {
    latest.current = state;
    api.current?.setState(state);
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !root || !ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rand = mulberry32(20261007);
    const gauss = () => (rand() + rand() + rand() + rand() - 2) / 2; // ≈ normale, entre -1 et 1

    // ── Particules (tableaux typés : aucune allocation par image) ──
    const COUNT = 2400;
    const lane = new Uint8Array(COUNT);
    const side = new Int8Array(COUNT); // +1 vers la droite, -1 vers la gauche
    const sideRank = new Float32Array(COUNT); // part vers la gauche si inférieur à la part gauche courante
    const prog = new Float32Array(COUNT); // avancement 0 → 1 le long du trajet
    const speed = new Float32Array(COUNT); // avancement par seconde
    const spread = new Float32Array(COUNT); // écart vertical autour de la bande
    const startX = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    const alpha = new Float32Array(COUNT);
    const rank = new Float32Array(COUNT); // seuil d'activation selon l'intensité
    const tint = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      lane[i] = Math.floor(rand() * LANES);
      sideRank[i] = rand();
      side[i] = sideRank[i] < 0.2 ? -1 : 1;
      prog[i] = rand();
      speed[i] = 0.03 + rand() * rand() * 0.1;
      spread[i] = gauss();
      startX[i] = rand();
      size[i] = rand() < 0.7 ? 1.4 + rand() * 1.2 : 2.6 + rand() * 1.8;
      alpha[i] = 0.55 + rand() * 0.45;
      rank[i] = rand();
      tint[i] = rand() * 0.9 - 0.25;
    }
    // Bandes : chacune ondule à son rythme, ce qui dessine des filets plutôt qu'un brouillard uniforme
    const laneY = new Float32Array(LANES);
    const laneAmp = new Float32Array(LANES);
    const laneFreq = new Float32Array(LANES);
    const lanePhase = new Float32Array(LANES);
    const laneDrift = new Float32Array(LANES);
    for (let l = 0; l < LANES; l++) {
      laneY[l] = (l / (LANES - 1) - 0.5) * 2 + gauss() * 0.08;
      laneAmp[l] = 0.5 + rand() * 0.9;
      laneFreq[l] = 0.7 + rand() * 1.1;
      lanePhase[l] = rand() * Math.PI * 2;
      laneDrift[l] = (rand() - 0.5) * 0.5;
    }
    // Valeurs calculées à chaque image
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const ps = new Float32Array(COUNT);
    const bin = new Uint8Array(COUNT); // lot de dessin, ou HIDDEN
    const order = new Uint16Array(COUNT);
    const binCount = new Uint16Array(BINS);
    const cursor = new Uint16Array(BINS);

    let width = 0;
    let height = 0;
    let active = COUNT;
    let intensity = TARGET[latest.current];
    let target = intensity;
    let boost = 1; // accélération brève à l'allumage
    let leftShare = 0.2; // part du flux envoyée vers la gauche
    let leftTarget = 0.2;
    let anchor: HTMLElement | null = null; // bloc du téléphone, posé par PhoneStage
    let time = 0;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = root.clientWidth;
      height = root.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      active = width < 640 ? 800 : COUNT;
    };

    const draw = () => {
      // Position réelle du téléphone (il glisse à droite une fois allumé). À défaut : centré, aux
      // dimensions de PhoneMockup (clamp(250px, 78vw, 320px), ratio 9 / 19.5).
      let phoneW = Math.min(320, Math.max(250, width * 0.78));
      let phoneH = (phoneW * 19.5) / 9;
      let cx = width / 2;
      let cy = height / 2;
      if (!anchor?.isConnected) {
        anchor = root.parentElement?.querySelector<HTMLElement>("[data-phone-anchor]") ?? null;
      }
      if (anchor) {
        const box = anchor.getBoundingClientRect();
        const origin = root.getBoundingClientRect();
        if (box.width > 0 && box.height > 0) {
          phoneW = box.width;
          phoneH = box.height;
          cx = box.left - origin.left + box.width / 2;
          cy = box.top - origin.top + box.height / 2;
        }
      }
      const edge = phoneW / 2 - 14;
      const cap = Math.max(width * 0.42, 240);
      const reachR = Math.max(120, Math.min(width - (cx + edge) + 30, cap));
      const reachL = Math.max(120, Math.min(cx - edge + 30, cap));
      // Téléphone centré : 20 % du flux part à gauche ; téléphone à droite : jusqu'à 75 %
      leftTarget = Math.min(0.75, Math.max(0.2, 0.2 + (cx / Math.max(1, width) - 0.5) * 3));
      if (motionQuery.matches) {
        // Image fixe : pas de boucle pour rééquilibrer peu à peu, on répartit tout de suite
        leftShare = leftTarget;
        for (let i = 0; i < active; i++) side[i] = sideRank[i] < leftShare ? -1 : 1;
      }
      const leftAlpha = 0.55 + (leftShare - 0.2) * 0.6;

      binCount.fill(0);
      for (let i = 0; i < active; i++) {
        const gate = Math.min(1, Math.max(0, (intensity - rank[i]) * 8));
        if (gate <= 0) {
          bin[i] = HIDDEN;
          continue;
        }
        const p = prog[i];
        const l = lane[i];
        const right = side[i] > 0;
        const reach = right ? reachR : reachL;
        // Les particules s'attardent près du téléphone puis accélèrent : nuage dense à la source, filets au loin
        const far = p * Math.sqrt(p);
        px[i] = cx + side[i] * (edge + startX[i] * 26 + far * reach);
        py[i] =
          cy +
          laneY[l] * phoneH * 0.36 +
          spread[i] * (8 + 60 * p) +
          Math.sin(p * laneFreq[l] * 6.283 + lanePhase[l] + time * laneDrift[l]) * laneAmp[l] * p * phoneH * 0.14;
        ps[i] = size[i] * (1 - 0.55 * p);
        const fade = Math.min(1, p / 0.03) * (1 - p);
        const a = alpha[i] * fade * gate * (right ? 1 : leftAlpha);
        if (a < 0.04) {
          bin[i] = HIDDEN;
          continue;
        }
        const color = Math.min(
          COLORS.length - 1,
          Math.max(0, Math.floor((far * 0.9 + tint[i] * 0.25 + 0.05) * COLORS.length)),
        );
        const b = color * LEVELS + Math.min(LEVELS - 1, Math.floor(a * LEVELS));
        bin[i] = b;
        binCount[b]++;
      }

      // Tri par comptage : le style ne change que quelques dizaines de fois par image au lieu de milliers
      let offset = 0;
      for (let b = 0; b < BINS; b++) {
        cursor[b] = offset;
        offset += binCount[b];
      }
      for (let i = 0; i < active; i++) {
        const b = bin[i];
        if (b !== HIDDEN) order[cursor[b]++] = i;
      }

      ctx.clearRect(0, 0, width, height);
      let from = 0;
      for (let b = 0; b < BINS; b++) {
        const n = binCount[b];
        if (n === 0) continue;
        ctx.fillStyle = COLORS[Math.floor(b / LEVELS)];
        ctx.globalAlpha = ((b % LEVELS) + 0.7) / LEVELS;
        // fillRect (et non un tracé unique) : le moteur graphique regroupe ces rectangles de même style en un seul lot
        for (let k = from; k < from + n; k++) {
          const i = order[k];
          ctx.fillRect(px[i], py[i], ps[i], ps[i]);
        }
        from += n;
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      time += dt;
      intensity += (target - intensity) * (1 - Math.exp(-dt * 2.2));
      boost += (1 - boost) * (1 - Math.exp(-dt * 1.8));
      leftShare += (leftTarget - leftShare) * (1 - Math.exp(-dt * 1.5));
      const rate = dt * boost * (0.45 + 0.55 * intensity);
      for (let i = 0; i < active; i++) {
        prog[i] += speed[i] * rate;
        if (prog[i] >= 1) {
          // En repartant du téléphone, la particule choisit son côté : le flux se rééquilibre sans saut
          prog[i] -= 1;
          side[i] = sideRank[i] < leftShare ? -1 : 1;
        }
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    const stop = () => cancelAnimationFrame(frame);
    const start = () => {
      stop();
      if (motionQuery.matches) {
        // Mouvement réduit : une seule image fixe, à l'intensité de l'état courant
        intensity = target;
        draw();
        return;
      }
      if (document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    api.current = {
      setState(next) {
        if (next === "on" && target < 1) boost = 2.6;
        target = TARGET[next];
        if (motionQuery.matches) {
          intensity = target;
          draw();
        }
      },
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (motionQuery.matches) draw();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", start);
    motionQuery.addEventListener("change", start);
    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
      motionQuery.removeEventListener("change", start);
      api.current = null;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(155deg,#111a2b_0%,#090d18_46%,#05070c_100%)]"
    >
      {/* Lueur froide en haut à gauche, comme une source hors champ */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_20%_14%,rgba(64,110,180,0.26),transparent_70%)]" />
      {/* Halo coloré sous le nuage : plus présent à mesure que le téléphone s'allume */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(34%_42%_at_70%_50%,rgba(45,212,191,0.13),transparent_70%),radial-gradient(30%_40%_at_88%_52%,rgba(129,140,248,0.12),transparent_70%)] transition-opacity duration-1000 ease-out ${
          state === "on" ? "opacity-100" : state === "booting" ? "opacity-55" : "opacity-20"
        }`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_50%,rgba(2,3,8,0.7)_100%)]" />
    </div>
  );
}
