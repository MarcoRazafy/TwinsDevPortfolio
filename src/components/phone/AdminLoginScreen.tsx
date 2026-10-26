"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import LoginForm from "@/components/admin/LoginForm";
import StatusBar from "./StatusBar";

type Props = { onClose: () => void };

/** Écran du téléphone ouvert par le bouton retour du chat : connexion à l'espace d'administration. */
export default function AdminLoginScreen({ onClose }: Props) {
  const clock = useClock();
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.section
      aria-label="Connexion à l'espace d'administration"
      className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-[radial-gradient(120%_70%_at_50%_0%,#0f2a1d_0%,#050807_60%)] text-white [scrollbar-width:none]"
      initial={reduce ? { opacity: 0 } : { x: "-100%" }}
      animate={reduce ? { opacity: 1 } : { x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "-100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <StatusBar time={clock?.time ?? null} className="relative" />

      <header className="relative mt-3 flex items-center px-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 items-center gap-0.5 rounded-lg pr-2 text-[13px] font-medium text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={22} aria-hidden />
          Messages
        </button>
      </header>

      <div className="flex flex-1 flex-col justify-center px-5 pb-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="relative mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 ring-1 ring-accent/40 shadow-[0_0_40px_-6px_rgba(34,197,94,0.6)]">
            <ShieldCheck size={26} className="text-accent-strong" aria-hidden />
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-[1.25rem] font-semibold tracking-[-0.01em]">Espace admin</h2>
          <p className="mt-1 text-[12px] text-white/55">Réservé à l&apos;équipe TwinsDev</p>
        </div>
        <LoginForm compact autoFocus />
      </div>
    </motion.section>
  );
}
