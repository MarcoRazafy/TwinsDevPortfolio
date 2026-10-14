"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Calendar,
  Camera,
  Clock,
  Code2,
  Compass,
  Image,
  Mail,
  MessageCircle,
  Music,
  Phone,
  Power,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useClock } from "@/hooks/useClock";
import StatusBar from "./StatusBar";

type App = { name: string; Icon: LucideIcon; bg: string };

const APPS: App[] = [
  { name: "Messages", Icon: MessageCircle, bg: "bg-green-500" },
  { name: "Calendrier", Icon: Calendar, bg: "bg-red-500" },
  { name: "Photos", Icon: Image, bg: "bg-pink-500" },
  { name: "Appareil photo", Icon: Camera, bg: "bg-neutral-700" },
  { name: "Mail", Icon: Mail, bg: "bg-sky-500" },
  { name: "Horloge", Icon: Clock, bg: "bg-neutral-900" },
  { name: "Plans", Icon: Compass, bg: "bg-emerald-600" },
  { name: "Réglages", Icon: Settings, bg: "bg-neutral-500" },
];

const DOCK: App[] = [
  { name: "Téléphone", Icon: Phone, bg: "bg-green-500" },
  { name: "Code", Icon: Code2, bg: "bg-indigo-500" },
  { name: "Musique", Icon: Music, bg: "bg-rose-500" },
];

function AppIcon({ app, index, reduce }: { app: App; index: number; reduce: boolean }) {
  return (
    <motion.li
      className="flex flex-col items-center gap-1.5"
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.04, type: "spring", stiffness: 380, damping: 26 }}
    >
      <span
        className={`flex h-[54px] w-[54px] items-center justify-center rounded-[16px] ${app.bg} text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)]`}
      >
        <app.Icon size={26} strokeWidth={2} aria-hidden />
      </span>
      <span className="text-[11px] font-medium text-white/90">{app.name}</span>
    </motion.li>
  );
}

type Props = { onPowerOff: () => void };

export default function HomeScreen({ onPowerOff }: Props) {
  const clock = useClock();
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col text-white"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_0%,rgba(34,197,94,0.30),transparent_55%),linear-gradient(180deg,#04140b_0%,#06080f_100%)]"
      />

      <StatusBar time={clock?.time ?? null} className="relative" />

      <div className="relative mt-6 px-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-strong">Allumé</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Bonjour.</p>
      </div>

      <ul className="relative mt-8 grid grid-cols-4 gap-x-2 gap-y-5 px-5" aria-label="Applications">
        {APPS.map((app, i) => (
          <AppIcon key={app.name} app={app} index={i} reduce={reduce} />
        ))}
        {/* Éteindre : ramène à l'écran noir */}
        <motion.li
          className="flex flex-col items-center gap-1.5"
          initial={reduce ? false : { opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 + APPS.length * 0.04, type: "spring", stiffness: 380, damping: 26 }}
        >
          <button
            type="button"
            onClick={onPowerOff}
            aria-label="Éteindre le téléphone"
            className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-red-500 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-transform duration-150 group-active:scale-95">
              <Power size={26} strokeWidth={2} aria-hidden />
            </span>
            <span className="text-[11px] font-medium text-white/90">Éteindre</span>
          </button>
        </motion.li>
      </ul>

      <motion.ul
        className="relative mx-4 mb-8 mt-auto flex justify-around rounded-[26px] bg-white/10 px-2 py-3 ring-1 ring-inset ring-white/10 backdrop-blur-md"
        aria-label="Dock"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 26 }}
      >
        {DOCK.map((app) => (
          <li key={app.name} className="flex flex-col items-center">
            <span
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-[16px] ${app.bg} text-white`}
            >
              <app.Icon size={26} strokeWidth={2} aria-hidden />
            </span>
            <span className="sr-only">{app.name}</span>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
