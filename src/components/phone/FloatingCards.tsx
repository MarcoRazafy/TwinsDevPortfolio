"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { MessageCircle, Play, Users } from "lucide-react";
import { HALF_DEPTH } from "./geometry";

type CardProps = {
  visible: boolean;
  reduce: boolean;
  /** Position et taille, en pourcentage de la boîte du téléphone. */
  className: string;
  /** Distance à laquelle la carte flotte devant l'écran (px). */
  depth: number;
  index: number;
  children: ReactNode;
};

/** Carte qui « sort » de l'écran : part du plan de la dalle et vient flotter devant, en vraie 3D. */
function Card({ visible, reduce, className, depth, index, children }: CardProps) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute hidden [backface-visibility:hidden] md:block ${className}`}
      initial={false}
      animate={
        visible
          ? { opacity: 1, z: HALF_DEPTH + depth, x: 0, scale: 1 }
          : { opacity: 0, z: HALF_DEPTH + 2, x: -36, scale: 0.72 }
      }
      transition={
        visible
          ? { type: "spring", stiffness: 150, damping: 18, delay: reduce ? 0 : 0.9 + index * 0.14 }
          : { duration: 0.2, ease: "easeIn" }
      }
    >
      {/* Léger flottement, propre à chaque carte. Animer la chaîne `transform` entière (et non `y`)
          laisse le navigateur faire tourner la boucle sur le compositeur, sans travail par image en JS. */}
      <motion.div
        animate={
          visible && !reduce
            ? { transform: ["translateY(0px)", "translateY(-7px)", "translateY(0px)"] }
            : { transform: "translateY(0px)" }
        }
        transition={
          visible && !reduce
            ? { duration: 5.2 + index * 0.9, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }
            : { duration: 0.2 }
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const SURFACE =
  "rounded-2xl border border-white/10 bg-[#1b2334] text-white shadow-[0_28px_50px_-14px_rgba(0,0,0,0.75)]";

/** Barres d'une onde sonore (hauteurs fixes, donc rendu identique serveur / client). */
const WAVE = [38, 62, 84, 56, 92, 70, 44, 78, 100, 64, 48, 82, 58, 36, 68, 88, 52, 40];

type Props = { visible: boolean };

/** Cartes de messagerie qui débordent du téléphone vers la droite, à différentes profondeurs. */
export default function FloatingCards({ visible }: Props) {
  const reduce = useReducedMotion() ?? false;

  return (
    <>
      {/* Notification */}
      <Card visible={visible} reduce={reduce} index={0} depth={70} className="left-[88%] top-[16.5%] w-[78%]">
        <div className={`${SURFACE} flex items-center gap-3 px-3.5 py-3`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0b1a14] ring-1 ring-white/15">
            <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} sizes="24px" className="h-auto w-[22px]" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-semibold">TwinsDev</span>
              <span className="text-[10px] text-white/70">maintenant</span>
            </span>
            <span className="block truncate text-[12px] text-white/65">Nouveau message</span>
          </span>
        </div>
      </Card>

      {/* Tuile violette : messages non lus */}
      <Card visible={visible} reduce={reduce} index={1} depth={125} className="left-[76%] top-[29%] w-[40%]">
        <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(145deg,#6366f1,#4338ca)] text-white shadow-[0_30px_54px_-14px_rgba(49,46,129,0.85)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300 text-[#1e1b4b]">
            <MessageCircle size={20} strokeWidth={2.4} />
          </span>
          <span className="text-[13px] font-bold leading-none">3 non lus</span>
          <span className="text-[10px] leading-none text-white/70">Messagerie</span>
        </div>
      </Card>

      {/* Tuile sombre : présence */}
      <Card visible={visible} reduce={reduce} index={2} depth={88} className="left-[122%] top-[31%] w-[36%]">
        <div className={`${SURFACE} flex aspect-square flex-col items-center justify-center gap-2`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/90">
            <Users size={17} strokeWidth={2.4} />
          </span>
          <span className="text-[12px] font-semibold leading-none">En ligne</span>
          <span className="text-[10px] leading-none text-white/55">2 personnes</span>
        </div>
      </Card>

      {/* Message vocal */}
      <Card visible={visible} reduce={reduce} index={3} depth={104} className="left-[84%] top-[51.5%] w-[80%]">
        <div className={`${SURFACE} px-3.5 py-3`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
              <Play size={17} strokeWidth={2.6} className="translate-x-px" />
            </span>
            <span className="flex h-8 flex-1 items-center gap-[3px]">
              {WAVE.map((h, i) => (
                <span
                  key={i}
                  className={`w-[3px] flex-1 rounded-full ${i < 7 ? "bg-emerald-300" : "bg-white/25"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/50">
            <span className="text-[12px] font-semibold text-white">Message vocal</span>
            <span className="tabular-nums">0:12 / 0:31</span>
          </div>
        </div>
      </Card>

      {/* « écrit… » */}
      <Card visible={visible} reduce={reduce} index={4} depth={62} className="left-[92%] top-[72%] w-[62%]">
        <div className={`${SURFACE} flex items-center gap-2.5 px-3.5 py-3`}>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/40" />
          </span>
          <span className="truncate text-[12px] text-white/70">TwinsDev écrit…</span>
        </div>
      </Card>
    </>
  );
}
