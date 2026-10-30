"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { SECTIONS } from "@/lib/site";

/** Menu flottant en haut de page : apparaît avec le reste du site, une fois le téléphone allumé. */
export default function SiteNav() {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.nav
      aria-label="Sections du site"
      initial={reduce ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0a0f1a]/80 p-1.5 pl-3 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-md [scrollbar-width:none]">
        <a href="#accueil" aria-label="Haut de page" className="mr-1 flex shrink-0 items-center">
          <Image src="/brand/twinsdev-mark.webp" alt="" width={480} height={244} className="h-auto w-6" />
        </a>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 rounded-full px-3 py-1.5 text-[13.5px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {s.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
