"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";
import SectionHead from "./SectionHead";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

/** Section « Contact » : grand titre et moyens de nous joindre. */
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
          {/* Moyens de nous joindre */}
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
      </div>
    </section>
  );
}
