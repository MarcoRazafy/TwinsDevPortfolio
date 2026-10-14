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
import { Power } from "lucide-react";

const KNOB = 56; // px — cible tactile ≥ 44 px
const PAD = 4; // px — marge interne de la piste
const TRACK_HEIGHT = 208; // px
const THRESHOLD = 0.8; // 80 % de la course = validé

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
    <div
      ref={trackRef}
      className="relative flex w-16 touch-none select-none flex-col justify-end overflow-hidden rounded-full bg-white/10 p-1 ring-1 ring-inset ring-white/15"
      style={{ height: TRACK_HEIGHT }}
    >
      {/* Remplissage vert qui monte avec le bouton */}
      <motion.div
        aria-hidden
        className="absolute inset-x-1 bottom-1 rounded-full bg-accent/35"
        style={{ height: fillHeight }}
      />

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
        whileTap={done ? undefined : { scale: 0.96 }}
        style={{ y, width: KNOB, height: KNOB, backgroundColor: knobBg, color: knobColor }}
        className="relative z-10 flex cursor-grab items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.45)] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent blur-md"
          style={{ opacity: glowOpacity }}
        />
        <Power size={26} strokeWidth={2.5} aria-hidden className="relative" />
      </motion.button>
    </div>
  );
}
