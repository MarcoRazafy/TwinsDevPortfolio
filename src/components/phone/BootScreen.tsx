"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

type Props = { onDone: () => void };

const BOOT_VIDEO = "/brand/twinsdev-boot.mp4";
const BOOT_POSTER = "/brand/twinsdev-boot-poster.webp";
const REDUCED_HOLD_MS = 900;

/** Démarrage : animation du logo TwinsDev (vidéo 5 s sur fond noir), puis passage à l'accueil. */
export default function BootScreen({ onDone }: Props) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);

  const finish = useEffectEvent(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  });

  useEffect(() => {
    // Mouvement réduit : logo fixe (première image de la vidéo), courte pause
    if (reduceMotion) {
      const t = window.setTimeout(() => finish(), REDUCED_HOLD_MS);
      return () => window.clearTimeout(t);
    }
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => finish();
    video.addEventListener("ended", onEnd);
    video.addEventListener("error", onEnd);
    video.muted = true;
    // Lecture automatique refusée par le navigateur : on n'attend pas la vidéo
    video.play().catch(onEnd);
    return () => {
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("error", onEnd);
    };
  }, [reduceMotion]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      aria-label="Démarrage du téléphone"
    >
      {reduceMotion ? (
        <Image
          src={BOOT_POSTER}
          alt=""
          width={640}
          height={640}
          preload
          className="aspect-square w-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={BOOT_VIDEO}
          poster={BOOT_POSTER}
          width={960}
          height={960}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden
          className="pointer-events-none aspect-square w-full object-contain"
        />
      )}
    </motion.div>
  );
}
