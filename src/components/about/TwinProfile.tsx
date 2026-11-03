"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Mail } from "lucide-react";
import { siGithub } from "simple-icons";

/** Logo LinkedIn (absent de simple-icons) : tracé 24×24, comme les autres logos. */
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
import type { Twin } from "@/lib/team";
import { TECH, techColor, techLabel, type TechKey } from "@/lib/tech";

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
/** Positions des trois pastilles qui flottent autour du portrait (% du cadre). */
const ORBIT: CSSProperties[] = [
  { left: "4%", top: "14%" },
  { right: "2%", top: "30%" },
  { left: "10%", bottom: "16%" },
];

type Props = { twin: Twin; index: number };

/** Un des deux profils : portrait détouré sur son halo, puis rôle, parcours, spécialités et liens. */
export default function TwinProfile({ twin, index }: Props) {
  const reduce = useReducedMotion() ?? false;
  const flipped = index % 2 === 1;

  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-12% 0px" },
    transition: reduce ? { duration: 0.3 } : { duration: 0.9, ease: EXPO_OUT, delay },
  });

  return (
    <article
      id={twin.slug}
      aria-labelledby={`${twin.slug}-nom`}
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
    >
      {/* ── Portrait ── */}
      <motion.div
        {...reveal(0)}
        className={`relative mx-auto w-full max-w-[420px] lg:max-w-[480px] ${flipped ? "lg:order-2" : ""}`}
      >
        <div className="relative aspect-square">
          {/* Halo et trame, derrière la photo */}
          <div
            aria-hidden
            className="aura-breathe absolute -inset-[12%] rounded-full"
            style={{
              background: `radial-gradient(closest-side, ${twin.accent}66 0%, ${twin.accent}26 45%, transparent 72%)`,
            }}
          />
          <div
            aria-hidden
            className="absolute -inset-[6%] rounded-full bg-[radial-gradient(rgba(190,255,220,0.25)_1px,transparent_1.4px)] [background-size:22px_22px] opacity-50 [mask-image:radial-gradient(closest-side,#000_40%,transparent)]"
          />
          {/* Anneau fin, décalé, comme un cadre posé */}
          <div aria-hidden className="absolute inset-[3%] rounded-full border border-white/10" />

          <Image
            src={twin.image.src}
            alt={`Portrait de ${twin.name}`}
            width={twin.image.width}
            height={twin.image.height}
            sizes="(min-width: 1024px) 480px, 90vw"
            className="relative z-[1] h-auto w-full [mask-image:linear-gradient(to_bottom,#000_72%,transparent_98%)]"
          />

          {/* Trois spécialités en pastilles, autour du portrait */}
          <ul className="absolute inset-0 z-[2] list-none" aria-label={`Spécialités de ${twin.name}`}>
            {twin.stack.slice(0, 3).map((key, i) => {
              const { icon, href } = TECH[key];
              return (
                <motion.li
                  key={key}
                  className="absolute"
                  style={ORBIT[i]}
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 170, damping: 16, delay: 0.5 + i * 0.12 }}
                >
                  <span className="twinsHero-chipFloat block" style={{ "--tilt": `${(i - 1) * 3}deg`, "--dur": `${6.5 + i}s`, "--delay": `${-i * 2}s` } as CSSProperties}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={techLabel(key)}
                      aria-label={`${techLabel(key)} (site officiel, nouvel onglet)`}
                      className="twinsHero-chip"
                      style={{ "--tint": techColor(key) } as CSSProperties}
                    >
                      <svg aria-hidden viewBox="0 0 24 24">
                        <path d={icon.path} />
                      </svg>
                    </a>
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.div>

      {/* ── Texte ── */}
      <div className={`flex min-w-0 flex-col gap-5 ${flipped ? "lg:order-1" : ""}`}>
        {twin.example && (
          <motion.p {...reveal(0.1)} className="flex items-center gap-3 font-mono text-[13px] tracking-wide">
            <span className="rounded-full border border-dashed border-amber-300/60 px-2.5 py-0.5 text-[10.5px] text-amber-200">
              texte à personnaliser
            </span>
          </motion.p>
        )}
        <motion.h3
          {...reveal(0.15)}
          id={`${twin.slug}-nom`}
          className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-none tracking-[-0.03em]"
        >
          {twin.name}
        </motion.h3>
        {(twin.fullName || twin.studies) && (
          <motion.p
            {...reveal(0.17)}
            className="-mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12.5px] tracking-wide text-white/50"
          >
            {twin.fullName && <span>{twin.fullName}</span>}
            {twin.fullName && twin.studies && <span aria-hidden className="hidden text-white/25 sm:inline">/</span>}
            {twin.studies && <span>Formation : {twin.studies}</span>}
          </motion.p>
        )}
        <motion.div {...reveal(0.2)} className="flex flex-col gap-1">
          <p className="text-[1.05rem] font-medium" style={{ color: twin.accent }}>
            {twin.role}
          </p>
          <p className="text-[1.05rem] text-white/85">{twin.tagline}</p>
        </motion.div>

        <motion.div {...reveal(0.25)} className="flex flex-col gap-3 text-[15.5px] leading-relaxed text-muted">
          {twin.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </motion.div>

        <motion.ul {...reveal(0.3)} className="grid gap-2 sm:grid-cols-3" aria-label={`Ce que fait ${twin.name}`}>
          {twin.does.map((line) => (
            <li
              key={line}
              className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[13.5px] leading-snug text-white/85"
            >
              {line}
            </li>
          ))}
        </motion.ul>

        {twin.skills && (
          <motion.dl {...reveal(0.35)} className="flex flex-col gap-3 pt-1">
            {twin.skills.map((group) => (
              <div key={group.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
                <dt className="font-mono text-[11.5px] uppercase tracking-wider text-white/45 sm:w-[130px] sm:shrink-0 sm:pt-[5px]">
                  {group.label}
                </dt>
                <dd>
                  <TechChips keys={group.items} label={group.label} />
                </dd>
              </div>
            ))}
          </motion.dl>
        )}

        <motion.div
          {...reveal(0.4)}
          className={`flex flex-wrap items-center gap-4 pt-1 ${twin.skills ? "justify-start" : "justify-between"}`}
        >
          {!twin.skills && <TechChips keys={twin.stack} label="Technologies" />}
          <div className="flex items-center gap-1">
            {twin.links.linkedin && <Social href={twin.links.linkedin} label="LinkedIn" icon={<Brand path={LINKEDIN_PATH} />} />}
            {twin.links.github && <Social href={twin.links.github} label="GitHub" icon={<Brand path={siGithub.path} />} />}
            {twin.links.email && <Social href={`mailto:${twin.links.email}`} label="E-mail" icon={<Mail size={17} aria-hidden />} />}
          </div>
        </motion.div>
      </div>
    </article>
  );
}

/** Rangée d'étiquettes de technos : logo à la couleur de la marque + nom. */
function TechChips({ keys, label }: { keys: TechKey[]; label: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {keys.map((key) => (
        <li
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-2 pr-2.5 text-[12px] text-white/75"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" style={{ fill: techColor(key) }}>
            <path d={TECH[key].icon.path} />
          </svg>
          {techLabel(key)}
        </li>
      ))}
    </ul>
  );
}

/** Logo de marque (simple-icons), en blanc, à la taille des icônes Lucide. */
function Brand({ path }: { path: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-[16px] w-[16px] fill-current">
      <path d={path} />
    </svg>
  );
}

function Social({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="group inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-[13px] font-semibold text-white/80 transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
      {label}
      <ArrowUpRight size={13} aria-hidden className="opacity-50 transition-opacity group-hover:opacity-100" />
    </a>
  );
}
