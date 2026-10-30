"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

type Props = { onDone: () => void };

const LOGO = { src: "/brand/twinsdev-logo.webp", width: 1000, height: 761 };
const REDUCED_HOLD_MS = 900;
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Phases de la séquence, comme les plans d'une vidéo, avec leur instant de départ (ms). */
type Phase = "dark" | "reveal" | "shine" | "out";
const TIMELINE: [Phase, number][] = [
  ["dark", 0], // noir, une lueur s'allume, un trait de lumière s'ouvre
  ["reveal", 450], // le logo se révèle : flou et proche, puis net
  ["shine", 1550], // un reflet balaie les lettres, le logo s'approche à peine
  ["out", 3150], // tout s'éteint
];
/** Fin de la séquence : passage à l'accueil. */
const DURATION_MS = 3600;

/** Démarrage : le logo lumineux TwinsDev mis en scène comme une vidéo, en quatre plans. */
export default function BootScreen({ onDone }: Props) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("dark");
  const doneRef = useRef(false);

  // Une seule sortie, quel que soit le chemin
  const finish = useEffectEvent(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  });

  useEffect(() => {
    const timers: number[] = [];
    if (reduceMotion) {
      // Mouvement réduit : logo fixe, courte pause
      timers.push(window.setTimeout(() => finish(), REDUCED_HOLD_MS));
    } else {
      for (const [next, at] of TIMELINE) {
        if (at > 0) timers.push(window.setTimeout(() => setPhase(next), at));
      }
      timers.push(window.setTimeout(() => finish(), DURATION_MS));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduceMotion]);

  const revealed = phase === "reveal" || phase === "shine";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      aria-label="Démarrage du téléphone"
    >
      {reduceMotion ? (
        <Image src={LOGO.src} alt="" width={LOGO.width} height={LOGO.height} preload className="w-[78%]" />
      ) : (
        <>
          {/* Lueur d'ambiance derrière le logo */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[90%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.22),rgba(200,200,200,0.06)_45%,transparent_72%)]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phase === "dark"
                ? { opacity: 0.5, scale: 0.9 }
                : phase === "out"
                  ? { opacity: 0, scale: 1.3 }
                  : { opacity: 1, scale: phase === "shine" ? 1.1 : 1 }
            }
            transition={{ duration: phase === "out" ? 0.45 : 1.2, ease: "easeInOut" }}
          />

          {/* Trait de lumière horizontal : s'ouvre au noir, puis s'élargit et disparaît quand le logo arrive */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-px w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.9)_50%,transparent)]"
            initial={{ opacity: 0, scaleX: 0, scaleY: 1 }}
            animate={phase === "dark" ? { opacity: 1, scaleX: 1, scaleY: 1 } : { opacity: 0, scaleX: 1.2, scaleY: 60 }}
            transition={{ duration: phase === "dark" ? 0.45 : 0.6, ease: EXPO_OUT }}
          />

          {/* Le logo : flou et proche, puis net ; s'approche à peine pendant le reflet ; s'éteint en s'éloignant */}
          <motion.div
            className="relative w-[78%]"
            initial={{ opacity: 0, scale: 1.18, filter: "blur(18px)" }}
            animate={
              phase === "dark"
                ? { opacity: 0, scale: 1.18, filter: "blur(18px)" }
                : phase === "reveal"
                  ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                  : phase === "shine"
                    ? { opacity: 1, scale: 1.03, filter: "blur(0px)" }
                    : { opacity: 0, scale: 1.12, filter: "blur(10px)" }
            }
            transition={
              phase === "reveal"
                ? { duration: 1.1, ease: EXPO_OUT }
                : phase === "shine"
                  ? { duration: 1.6, ease: "easeInOut" }
                  : { duration: 0.45, ease: "easeIn" }
            }
          >
            <Image src={LOGO.src} alt="" width={LOGO.width} height={LOGO.height} preload className="h-auto w-full" />

            {/* Reflet qui balaie les lettres : une bande claire masquée par la forme du logo */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_38%,rgba(255,255,255,0.95)_50%,transparent_62%)]"
              style={{
                WebkitMaskImage: `url(${LOGO.src})`,
                maskImage: `url(${LOGO.src})`,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
              initial={{ x: "-120%" }}
              animate={{ x: phase === "shine" || phase === "out" ? "120%" : "-120%" }}
              transition={{ duration: 1.1, ease: EXPO_OUT }}
            />
          </motion.div>

          {/* Grain très léger, pour la texture « film » */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-500 ${revealed ? "opacity-[0.07]" : "opacity-0"}`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </>
      )}
    </motion.div>
  );
}
