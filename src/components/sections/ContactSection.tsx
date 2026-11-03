"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BatteryFull,
  Calendar,
  CodeXml,
  FolderKanban,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  Wifi,
} from "lucide-react";
import DesktopWallpaper from "@/components/contact/DesktopWallpaper";
import LaptopMockup from "@/components/contact/LaptopMockup";
import { SITE } from "@/lib/site";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Section « Contact » : grand titre, puis un ordinateur portable qui affiche son bureau (fond d'écran, menu, dock). */
export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-10% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.8, ease: EXPO_OUT, delay },
  });

  const channels = [
    SITE.email && { label: SITE.email, href: `mailto:${SITE.email}`, icon: <Mail size={15} aria-hidden /> },
    SITE.linkedin && { label: "LinkedIn", href: SITE.linkedin, icon: <ArrowUpRight size={15} aria-hidden />, external: true },
    { label: "Écrire à l'assistant sur le téléphone", href: "#accueil", icon: <MessageCircle size={15} aria-hidden /> },
  ].filter(Boolean) as { label: string; href: string; icon: ReactNode; external?: boolean }[];

  return (
    <section id="contact" aria-labelledby="contact-titre" className="relative scroll-mt-24 px-4 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            path="/contact"
            id="contact-titre"
            title={
              <>
                Parlons de <span className="text-glow">votre projet</span>
              </>
            }
            lede="Une question, une idée ? On vous répond franchement, avec des questions précises et, si le projet nous correspond, un devis."
          />
          {/* Autres moyens de nous joindre */}
          <motion.ul {...reveal(0.05)} className="mb-12 flex flex-wrap gap-2 lg:mb-16 lg:justify-end">
            {SITE.location && (
              <li className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13.5px] text-white/70">
                <MapPin size={15} aria-hidden className="text-accent-strong" />
                {SITE.location}
              </li>
            )}
            {channels.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  {...(c.external && { target: "_blank", rel: "noopener noreferrer" })}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13.5px] text-white/75 transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-accent-strong">{c.icon}</span>
                  {c.label}
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div {...reveal(0.12)}>
          <LaptopMockup>
            {/* Bureau : fond d'écran, barre de menu, dock (écran au format 16:10) */}
            <div className="relative isolate flex aspect-[16/10] flex-col">
              <DesktopWallpaper />
              <MenuBar />
              <div className="flex-1" />
              <Dock />
            </div>
          </LaptopMockup>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Bureau ── */

/** Barre de menu du bureau : logo, menus (décoratifs), icônes d'état et horloge. */
function MenuBar() {
  const [now, setNow] = useState<Date | null>(null);
  // Horloge affichée côté navigateur seulement (l'heure du serveur ne correspond pas à celle du visiteur)
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  const time = now
    ? now.toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      aria-hidden
      className="relative z-20 hidden h-8 items-center justify-between bg-[#03140f]/45 px-4 text-[12.5px] text-white/90 backdrop-blur-xl sm:flex"
    >
      <div className="flex items-center gap-4">
        <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-[18px]" />
        <span className="font-semibold">TwinsDev</span>
        <span className="hidden gap-4 text-white/75 lg:flex">
          <span>Fichier</span>
          <span>Édition</span>
          <span>Affichage</span>
          <span>Fenêtre</span>
          <span>Aide</span>
        </span>
      </div>
      <div className="flex items-center gap-3.5 text-white/85">
        <Wifi size={14} />
        <BatteryFull size={16} />
        <Search size={13} />
        <span className="min-w-[9.5em] text-right tabular-nums">{time}</span>
      </div>
    </div>
  );
}

/** Dock du bureau (décoratif) : l'application Messages est ouverte. */
function Dock() {
  // Palette TwinsDev : verts d'accent, turquoise, et tuiles nuit à icône verte
  const NIGHT = "linear-gradient(150deg,#132a22,#06080f)";
  const apps = [
    { Icon: FolderKanban, bg: "linear-gradient(150deg,#2dd4bf,#0f766e)" },
    { Icon: Globe, bg: "linear-gradient(150deg,#34d399,#047857)" },
    { Icon: Mail, bg: "linear-gradient(150deg,#4ade80,#15803d)", open: true },
    { Icon: MessageCircle, bg: "linear-gradient(150deg,#86efac,#16a34a)" },
    { Icon: Calendar, bg: NIGHT, green: true },
    { Icon: CodeXml, bg: NIGHT, green: true },
    { Icon: Settings, bg: NIGHT, green: true },
  ];
  return (
    <div aria-hidden className="relative z-20 hidden justify-center pb-3 sm:flex">
      <div className="flex items-end gap-2 rounded-[20px] border border-emerald-200/20 bg-[#06080f]/35 px-2.5 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        {apps.map(({ Icon, bg, open, green }, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={`grid h-10 w-10 place-items-center rounded-[11px] shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)] transition-transform duration-200 hover:-translate-y-1.5 hover:scale-110 lg:h-11 lg:w-11 ${
                green ? "text-accent-strong ring-1 ring-inset ring-emerald-300/20" : "text-[#03140c]"
              }`}
              style={{ background: bg }}
            >
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className={`h-1 w-1 rounded-full ${open ? "bg-white/85" : "bg-transparent"}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
