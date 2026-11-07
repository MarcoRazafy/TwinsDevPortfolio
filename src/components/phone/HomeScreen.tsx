"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Power } from "lucide-react";
import { useClock } from "@/hooks/useClock";
import { GREETING } from "@/lib/assistant-prompt";
import { TECH, techColor, type TechKey } from "@/lib/tech";
import StatusBar from "./StatusBar";

/** Applications de l'écran d'accueil : une icône de langage par section du site (même style que les pastilles de l'accueil). */
const SECTION_APPS: { tech: TechKey; name: string; href: string }[] = [
  { tech: "react", name: "Projets", href: "#projets" },
  { tech: "linux", name: "Services", href: "#services" },
  { tech: "laravel", name: "À propos", href: "#apropos" },
  { tech: "github", name: "Avis", href: "#avis" },
  { tech: "python", name: "FAQ", href: "#faq" },
  { tech: "nodejs", name: "Contact", href: "#contact" },
];

/** Pastille ronde des icônes (fond sombre, liseré clair, halo de la couleur de la techno). */
const chip = (tint: string): CSSProperties => ({
  background: "rgba(15, 23, 42, 0.66)",
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(255,255,255,0.1), 0 0 18px -2px color-mix(in srgb, ${tint} 45%, transparent), 0 14px 30px -16px rgba(0,0,0,0.9)`,
});

type Props = {
  onOpenChat: () => void;
  onOpenAdmin: () => void;
  onPowerOff: () => void;
};

/**
 * Écran d'accueil du téléphone : l'heure, puis une grille d'applications rondes aux couleurs des langages
 * (liens vers leur site officiel), l'accès administrateur et, en dernier, TwinsChat qui ouvre la discussion.
 */
export default function HomeScreen({ onOpenChat, onOpenAdmin, onPowerOff }: Props) {
  const reduce = useReducedMotion() ?? false;
  const clock = useClock();
  const appear = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { delay: reduce ? 0 : 0.12 + i * 0.035, type: "spring" as const, stiffness: 380, damping: 26 },
  });

  return (
    <motion.div
      className="absolute inset-0 flex flex-col text-white"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(110%_60%_at_50%_0%,rgba(34,197,94,0.20),transparent_60%),linear-gradient(180deg,#0c1422_0%,#070a12_100%)]"
      />
      <StatusBar time={clock?.time ?? null} className="relative" />

      {/* Heure et date, bouton d'extinction (en haut) */}
      <div className="relative mt-5 flex items-start justify-between px-6">
        <div className="leading-none">
          <p className="font-[family-name:var(--font-display)] text-[40px] font-semibold tabular-nums tracking-[-0.03em]">
            {clock?.time ?? "--:--"}
          </p>
          <p className="mt-1.5 text-[12.5px] capitalize text-white/60">{clock?.date ?? " "}</p>
        </div>
        <button
          type="button"
          onClick={onPowerOff}
          aria-label="Éteindre le téléphone"
          className="mt-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-red-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <Power size={18} strokeWidth={2.2} aria-hidden />
        </button>
      </div>

      {/* Grille d'applications, sous l'heure : une par section du site, puis Admin et l'Assistant */}
      <ul aria-label="Applications" className="relative mt-7 grid grid-cols-4 gap-x-2 gap-y-4 px-4">
        {SECTION_APPS.map((app, i) => (
          <motion.li key={app.href} {...appear(i)} className="flex justify-center">
            <AppLink href={app.href} label={`Aller à la section ${app.name}`} name={app.name}>
              <TechIcon tech={app.tech} />
            </AppLink>
          </motion.li>
        ))}

        <motion.li {...appear(SECTION_APPS.length)} className="flex justify-center">
          <AppButton onClick={onOpenAdmin} label="Espace administrateur" name="Admin">
            <TechIcon tech="kali" />
          </AppButton>
        </motion.li>

        {/* Assistant (Mistral) : dernière application, ouvre la discussion */}
        <motion.li {...appear(SECTION_APPS.length + 1)} className="flex justify-center">
          <AppButton onClick={onOpenChat} label={`Ouvrir l'assistant, ${GREETING.length} messages non lus`} name="Assistant">
            <span className="relative grid">
              {!reduce && <span aria-hidden className="absolute inset-0 animate-ping rounded-full ring-2 ring-[#fa520f]/40 [animation-duration:2.4s]" />}
              <TechIcon tech="mistral" />
              <span
                aria-hidden
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-[#03140c] ring-2 ring-[#070a12]"
              >
                {GREETING.length}
              </span>
            </span>
          </AppButton>
        </motion.li>
      </ul>

    </motion.div>
  );
}

const APP_CLASS =
  "group flex w-full flex-col items-center gap-1.5 rounded-2xl py-1 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95";
const NAME_CLASS = "max-w-full truncate px-0.5 text-[10.5px] font-medium text-white/85";

/** Icône ronde d'une application : logo de la techno, teinté de sa couleur. */
function TechIcon({ tech }: { tech: TechKey }) {
  const tint = techColor(tech);
  return (
    <span className="grid h-[52px] w-[52px] place-items-center rounded-full" style={chip(tint)}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" style={{ fill: tint }}>
        <path d={TECH[tech].icon.path} />
      </svg>
    </span>
  );
}

/** Lien vers une section de la page (même onglet). */
function AppLink({ href, label, name, children }: { href: string; label: string; name: string; children: ReactNode }) {
  return (
    <a href={href} aria-label={label} title={name} className={APP_CLASS}>
      <span className="transition-transform duration-200 group-hover:scale-110">{children}</span>
      <span aria-hidden className={NAME_CLASS}>
        {name}
      </span>
    </a>
  );
}

function AppButton({ onClick, label, name, children }: { onClick: () => void; label: string; name: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={name} className={`${APP_CLASS} cursor-pointer`}>
      <span className="transition-transform duration-200 group-hover:scale-110">{children}</span>
      <span aria-hidden className={NAME_CLASS}>
        {name}
      </span>
    </button>
  );
}
