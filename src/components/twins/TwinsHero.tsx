"use client";

import "./TwinsHero.css";
import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TECH, techColor, type TechKey } from "@/lib/tech";

const TWINS_SRC = "/twins/twins.webp";
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

type Chip = {
  tech: TechKey;
  /** Position (% de la figure). Les visages occupent le centre : on reste sur les bords et le haut. */
  pos: CSSProperties;
  /** Réglages du flottement : inclinaison, durée, décalage (voir TwinsHero.css). */
  float: CSSProperties;
};

/** Technos affichées autour des jumeaux (icônes et liens : voir src/lib/tech.ts). */
const CHIPS: Chip[] = [
  { tech: "nextjs", pos: { left: "3%", top: "6%" }, float: { "--tilt": "-4deg", "--dur": "6.5s", "--delay": "-1s" } as CSSProperties },
  { tech: "react", pos: { right: "4%", top: "0%" }, float: { "--tilt": "3deg", "--dur": "7.5s", "--delay": "-3s" } as CSSProperties },
  { tech: "typescript", pos: { left: "-2%", top: "38%" }, float: { "--tilt": "2deg", "--dur": "8s", "--delay": "-5s" } as CSSProperties },
  { tech: "nodejs", pos: { right: "-2%", top: "34%" }, float: { "--tilt": "-3deg", "--dur": "7s", "--delay": "-2s" } as CSSProperties },
  { tech: "tailwind", pos: { left: "34%", top: "-14%" }, float: { "--tilt": "1deg", "--dur": "9s", "--delay": "-4s" } as CSSProperties },
  { tech: "javascript", pos: { left: "56%", top: "-16%" }, float: { "--tilt": "-2deg", "--dur": "8.5s", "--delay": "-6s" } as CSSProperties },
  { tech: "python", pos: { left: "14%", top: "-6%" }, float: { "--tilt": "3deg", "--dur": "7.2s", "--delay": "-2.5s" } as CSSProperties },
  { tech: "postgresql", pos: { right: "16%", top: "-9%" }, float: { "--tilt": "-1deg", "--dur": "6.8s", "--delay": "-4.5s" } as CSSProperties },
  { tech: "html", pos: { left: "46%", top: "12%" }, float: { "--tilt": "2deg", "--dur": "7.8s", "--delay": "-1.5s" } as CSSProperties },
  { tech: "docker", pos: { left: "1%", top: "68%" }, float: { "--tilt": "-2deg", "--dur": "8.2s", "--delay": "-3.5s" } as CSSProperties },
  { tech: "mongodb", pos: { right: "0%", top: "66%" }, float: { "--tilt": "2deg", "--dur": "7.4s", "--delay": "-5.5s" } as CSSProperties },
  { tech: "git", pos: { left: "13%", top: "90%" }, float: { "--tilt": "3deg", "--dur": "6.9s", "--delay": "-0.5s" } as CSSProperties },
  { tech: "figma", pos: { right: "12%", top: "90%" }, float: { "--tilt": "-3deg", "--dur": "7.6s", "--delay": "-2.8s" } as CSSProperties },
];

/** Transition d'entrée d'une pastille : en cascade après la photo (immédiate en mouvement réduit). */
function entrance(visible: boolean, reduce: boolean, index: number) {
  if (!visible) return { duration: 0.2, ease: "easeIn" } as const;
  if (reduce) return { duration: 0, opacity: { duration: 0.4 } } as const;
  return { type: "spring", stiffness: 170, damping: 17, delay: 0.6 + index * 0.08 } as const;
}

/** Pastille cliquable : icône de la techno, lien vers son site officiel. */
function Badge({ chip, visible, small }: { chip: Chip; visible: boolean; small?: boolean }) {
  const { icon, href } = TECH[chip.tech];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={icon.title}
      aria-label={`${icon.title} (site officiel, nouvel onglet)`}
      tabIndex={visible ? 0 : -1}
      className={small ? "twinsHero-chip twinsHero-chipSmall" : "twinsHero-chip"}
      style={{ "--tint": techColor(chip.tech) } as CSSProperties}
    >
      <svg aria-hidden viewBox="0 0 24 24">
        <path d={icon.path} />
      </svg>
    </a>
  );
}

type Props = {
  /** Dévoile les jumeaux et lance les animations. */
  visible: boolean;
};

/**
 * Les jumeaux (photo détourée) devant une aurore de lumière, entourés des icônes de leurs technos :
 * à gauche du téléphone sur grand écran, au-dessus sur mobile.
 * Les boucles sont en CSS (TwinsHero.css), l'entrée en scène avec motion.
 */
export default function TwinsHero({ visible }: Props) {
  const reduce = useReducedMotion() ?? false;

  // Comme pour les cartes flottantes : les poses rendues ne dépendent jamais de `reduce` (inconnu du
  // serveur, donc source d'erreur d'hydratation) ; seules les transitions changent.
  return (
    <div aria-hidden={!visible} className="w-full min-w-0">
      <figure
        data-active={visible}
        className="twinsHero-root relative mx-auto w-full max-w-[400px] lg:max-w-[560px] xl:max-w-[640px]"
      >
        {/* Lumière et trame, derrière la photo */}
        <motion.div
          aria-hidden
          className="twinsHero-fx"
          initial={false}
          animate={visible ? { opacity: 1 } : { opacity: 0 }}
          transition={visible ? { duration: reduce ? 0.4 : 1.4, ease: EXPO_OUT } : { duration: 0.25 }}
        >
          <div className="twinsHero-dots" />
          <div className="twinsHero-veil twinsHero-veilA" />
          <div className="twinsHero-veil twinsHero-veilB" />
          <div className="twinsHero-veil twinsHero-veilC" />
          <div className="twinsHero-scan" />
        </motion.div>

        <motion.div
          className="twinsHero-photo relative"
          initial={false}
          animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 56, scale: 0.96 }}
          transition={
            visible
              ? reduce
                ? { duration: 0, opacity: { duration: 0.4 } }
                : { type: "spring", stiffness: 80, damping: 17, delay: 0.2 }
              : { duration: 0.22, ease: "easeIn" }
          }
        >
          <Image
            src={TWINS_SRC}
            alt="Les jumeaux de TwinsDev"
            width={1800}
            height={1099}
            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 560px, 400px"
            loading="eager"
            className="h-auto w-full"
          />
        </motion.div>

        {/* Icônes des technos, chacune liée au site officiel ; au survol, elle grossit.
            Grand écran : autour des jumeaux, en flottement. Mobile : en rangée sous la photo. */}
        <ul className="absolute inset-0 hidden list-none sm:block" aria-label="Technologies maîtrisées">
          {CHIPS.map((chip, index) => (
            <motion.li
              key={chip.tech}
              className="absolute"
              style={chip.pos}
              initial={false}
              animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.7 }}
              transition={entrance(visible, reduce, index)}
            >
              <span className="twinsHero-chipFloat block" style={chip.float}>
                <Badge chip={chip} visible={visible} />
              </span>
            </motion.li>
          ))}
        </ul>
        <ul
          className="-mt-3 flex list-none flex-wrap justify-center gap-2.5 px-2 sm:hidden"
          aria-label="Technologies maîtrisées"
        >
          {CHIPS.map((chip, index) => (
            <motion.li
              key={chip.tech}
              initial={false}
              animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.7 }}
              transition={entrance(visible, reduce, index)}
            >
              <Badge chip={chip} visible={visible} small />
            </motion.li>
          ))}
        </ul>
      </figure>
    </div>
  );
}
