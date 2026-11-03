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
      className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-2 sm:top-4 sm:px-4"
    >
      {/* Sur mobile, liens plus serrés : les cinq sections tiennent sur la largeur, sans défilement caché */}
      <div className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-[#0a0f1a]/95 p-1 pl-2.5 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] [scrollbar-width:none] sm:gap-1 sm:p-1.5 sm:pl-3">
        <a href="#accueil" aria-label="Haut de page" className="mr-0.5 flex min-h-9 shrink-0 items-center sm:mr-1">
          <Image src="/brand/twinsdev-mark-v2.webp" alt="" width={480} height={244} className="h-auto w-5 sm:w-6" />
        </a>
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex min-h-9 shrink-0 items-center rounded-full px-2 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-[13.5px]"
          >
            {s.label}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
