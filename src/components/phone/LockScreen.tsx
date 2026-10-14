"use client";

import { motion } from "motion/react";
import SlideToPowerOn from "./SlideToPowerOn";

type Props = { onUnlock: () => void };

/** Écran éteint : fond noir, seul le bouton à glisser vers le haut est visible. */
export default function LockScreen({ onUnlock }: Props) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.4 }}
    >
      <SlideToPowerOn onComplete={onUnlock} />
    </motion.div>
  );
}
