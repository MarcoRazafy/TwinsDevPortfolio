"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { ChevronUp, Power } from "lucide-react";

const KNOB = 56; // px — cible tactile ≥ 44 px
const PAD = 4; // px — marge interne de la piste
const TRACK_HEIGHT = 208; // px
const THRESHOLD = 0.8; // 80 % de la course = validé
const HOP_EVERY = 4200; // ms entre deux petits sauts d'invitation
const HOP_FIRST = 1600; // ms avant le premier saut

type Props = {
  label?: string;
  onComplete: () => void;
};

/** Bouton à glisser vers le haut pour allumer. Drag souris/tactile + clavier. */
export default function SlideToPowerOn({ label = "Glisser vers le haut pour allumer", onComplete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxY, setMaxY] = useState(0);
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);
  // Dès la première interaction, les invitations (saut, halo) s'arrêtent
  const [touched, setTouched] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const reduceMotion = useReducedMotion();
  const y = useMotionValue(0); // 0 = en bas, -maxY = en haut

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setMaxY(Math.max(0, el.clientHeight - KNOB - PAD * 2));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const progress = useTransform(y, [0, -Math.max(maxY, 1)], [0, 1]);
  const fillHeight = useTransform(y, (v) => -v + KNOB);
  const knobBg = useTransform(progress, [0, 1], ["#ffffff", "#22c55e"]);
  const knobColor = useTransform(progress, [0, 1], ["#06080f", "#052e16"]);
  const glowOpacity = useTransform(progress, [0, 1], [0, 0.9]);
  // Les indices s'effacent dès que le bouton monte
  const hintOpacity = useTransform(progress, [0, 0.35], [1, 0]);

  // Petit saut vers le haut, à intervalles réguliers, tant que personne n'a touché au bouton
  useEffect(() => {
    if (touched || done || reduceMotion || !maxY) return;
    let hop: ReturnType<typeof animate> | undefined;
    const run = () => {
      hop = animate(y, [0, -28, 0], { duration: 1.1, times: [0, 0.32, 1], ease: ["easeOut", [0.34, 1.56, 0.64, 1]] });
    };
    const first = setTimeout(run, HOP_FIRST);
    const every = setInterval(run, HOP_EVERY);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      hop?.stop();
    };
  }, [touched, done, reduceMotion, maxY, y]);

  useMotionValueEvent(progress, "change", (p) => {
    const next = Math.round(p * 100);
    setPercent((prev) => (prev === next ? prev : next));
  });

  const complete = useCallback(() => {
    if (done) return;
    setDone(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(12);
    animate(
      y,
      -maxY,
      reduceMotion ? { duration: 0.05 } : { type: "spring", stiffness: 520, damping: 42 },
    ).then(() => onComplete());
  }, [done, maxY, onComplete, reduceMotion, y]);

  const reset = useCallback(() => {
    animate(y, 0, reduceMotion ? { duration: 0.05 } : { type: "spring", stiffness: 420, damping: 34 });
  }, [reduceMotion, y]);

  const handleDragEnd = () => {
    if (done) return;
    if (-y.get() >= maxY * THRESHOLD) complete();
    else reset();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (done) return;
    const step = maxY / 8;
    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight": {
        e.preventDefault();
        const next = Math.max(-maxY, y.get() - step);
        animate(y, next, { duration: 0.12 });
        if (-next >= maxY * THRESHOLD) complete();
        break;
      }
      case "ArrowDown":
      case "ArrowLeft":
        e.preventDefault();
        animate(y, Math.min(0, y.get() + step), { duration: 0.12 });
        break;
      case "Home":
        e.preventDefault();
        reset();
        break;
      case "End":
      case "Enter":
      case " ":
        e.preventDefault();
        complete();
        break;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={trackRef}
        className="relative flex w-16 touch-none select-none flex-col justify-end rounded-full bg-white/10 p-1 ring-1 ring-inset ring-white/15"
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Remplissage vert qui monte avec le bouton */}
        <motion.div
          aria-hidden
          className="absolute inset-x-1 bottom-1 rounded-full bg-accent/35"
          style={{ height: fillHeight }}
        />

        {/* Chevrons : indiquent le sens du geste, s'effacent quand le bouton monte */}
        <motion.div
          aria-hidden
          className="chevron-rise pointer-events-none absolute inset-x-0 top-7 flex flex-col items-center text-white"
          style={{ opacity: hintOpacity }}
        >
          <ChevronUp size={20} strokeWidth={2.6} className="-mb-2" />
          <ChevronUp size={20} strokeWidth={2.6} className="-mb-2" />
          <ChevronUp size={20} strokeWidth={2.6} />
        </motion.div>

        {/* Bouton glissant (role slider vertical) */}
        <motion.button
          type="button"
          role="slider"
          aria-label={label}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={done ? "Téléphone en cours d'allumage" : `${percent} %`}
          aria-disabled={done || undefined}
          drag={done ? false : "y"}
          dragConstraints={{ top: -maxY, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          onKeyDown={handleKeyDown}
          onPointerDown={() => setTouched(true)}
          onFocus={(e) => {
            if (!e.currentTarget.matches(":focus-visible")) return;
            setTouched(true);
            setKeyboard(true);
          }}
          onBlur={() => setKeyboard(false)}
          whileTap={done ? undefined : { scale: 0.96 }}
          style={{ y, width: KNOB, height: KNOB, backgroundColor: knobBg, color: knobColor }}
          className="relative z-10 flex cursor-grab items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.45)] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {/* Halo qui pulse : « touchez-moi » */}
          {!touched && !done && (
            <span aria-hidden className="knob-halo pointer-events-none absolute inset-0 rounded-full border-2 border-white/60" />
          )}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-accent blur-md"
            style={{ opacity: glowOpacity }}
          />
          <Power size={26} strokeWidth={2.5} aria-hidden className="relative" />
        </motion.button>
      </div>

      {/* Consigne visible (le slider porte déjà la consigne pour les lecteurs d'écran) */}
      <motion.p
        aria-hidden
        className="flex min-h-[2.6rem] flex-col items-center text-center leading-tight"
        style={{ opacity: done ? 0 : hintOpacity }}
      >
        {keyboard ? (
          <>
            <span className="text-shimmer text-[15px] font-semibold tracking-tight">Appuyez sur ↑ ou Entrée</span>
            <span className="mt-1 text-[12px] text-white/40">pour allumer</span>
          </>
        ) : (
          <>
            <span className="text-shimmer text-[15px] font-semibold tracking-tight">Glissez vers le haut</span>
            <span className="mt-1 text-[12px] text-white/40">pour allumer</span>
          </>
        )}
      </motion.p>
    </div>
  );
}
