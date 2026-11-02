"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import LockScreen from "./LockScreen";
import BootScreen from "./BootScreen";
import ChatScreen from "./ChatScreen";
import { useRouter } from "next/navigation";
import { hasAdminSession } from "@/app/admin/actions";
import AdminLoginScreen from "./AdminLoginScreen";
import FloatingCards from "./FloatingCards";
import PhoneBack from "./PhoneBack";
import PhoneSides from "./PhoneSides";
import CameraPlateau from "./CameraPlateau";
import { HALF_DEPTH } from "./geometry";
import type { PhoneState } from "./types";

const MAX_TILT = 14; // degrés
const SPRING = { stiffness: 170, damping: 22, mass: 0.6 };
const DRAG_SENSITIVITY = 0.55; // degrés par pixel

type DragState = { id: number; lastX: number; lastT: number; velocity: number };

type Props = {
  state: PhoneState;
  onStateChange: (next: PhoneState) => void;
};

export default function PhoneMockup({ state, onStateChange }: Props) {
  const [isBack, setIsBack] = useState(false);
  // Écran de connexion admin, ouvert par le bouton retour du chat (par-dessus la conversation, qui reste en mémoire)
  const [adminOpen, setAdminOpen] = useState(false);
  // Conversation commencée : les cartes décoratives s'écartent pour ne plus masquer les messages
  const [chatStarted, setChatStarted] = useState(false);
  const router = useRouter();
  const checkingSession = useRef(false);

  /** Bouton retour du chat : session admin déjà ouverte → tableau de bord ; sinon → écran de connexion. */
  const openAdmin = async () => {
    if (checkingSession.current) return;
    checkingSession.current = true;
    try {
      if (await hasAdminSession()) {
        router.push("/admin");
        return;
      }
    } catch {
      // Serveur injoignable : on affiche simplement l'écran de connexion
    } finally {
      checkingSession.current = false;
    }
    setAdminOpen(true);
  };
  const reduceMotion = useReducedMotion();

  // Position du pointeur normalisée : -1 (gauche/haut) → 1 (droite/bas)
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Inclinaison 3D amortie par ressort
  const tiltY = useSpring(useTransform(px, [-1, 1], [-MAX_TILT, MAX_TILT]), SPRING);
  const rotateX = useSpring(useTransform(py, [-1, 1], [MAX_TILT * 0.7, -MAX_TILT * 0.7]), SPRING);
  const shiftX = useSpring(useTransform(px, [-1, 1], [-10, 10]), SPRING);
  const shiftY = useSpring(useTransform(py, [-1, 1], [-6, 6]), SPRING);

  // Rotation libre à 360° (glisser sur le cadre)
  const spin = useMotionValue(0);
  const rotateY = useTransform(() => tiltY.get() + spin.get());
  const spinAnim = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<DragState | null>(null);

  useMotionValueEvent(spin, "change", (v) => {
    const n = ((v % 360) + 360) % 360;
    const back = n > 90 && n < 270;
    setIsBack((prev) => (prev === back ? prev : back));
  });

  // Reflet sur l'écran et halo en parallaxe inverse
  const sheenX = useTransform(px, [-1, 1], [15, 85]);
  const sheenY = useTransform(py, [-1, 1], [10, 90]);
  const sheen = useMotionTemplate`radial-gradient(60% 45% at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.14), transparent 70%)`;
  const glowX = useSpring(useTransform(px, [-1, 1], [24, -24]), SPRING);
  const glowY = useSpring(useTransform(py, [-1, 1], [16, -16]), SPRING);

  /* Termine la rotation : projette l'élan puis se pose sur la face la plus proche */
  const settle = (velocity: number) => {
    const projected = spin.get() + velocity * 0.3;
    const target = Math.round(projected / 180) * 180;
    spinAnim.current = animate(spin, target, {
      type: "spring",
      stiffness: 110,
      damping: 18,
      velocity,
      restDelta: 0.1,
    });
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // L'écran garde ses propres gestes (bouton d'allumage)
    if ((e.target as HTMLElement).closest("[data-screen]")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    spinAnim.current?.stop();
    drag.current = { id: e.pointerId, lastX: e.clientX, lastT: performance.now(), velocity: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointeur déjà relâché : on suit quand même les mouvements
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      const deg = (e.clientX - d.lastX) * DRAG_SENSITIVITY;
      spin.set(spin.get() + deg);
      d.velocity = d.velocity * 0.7 + ((deg / dt) * 1000) * 0.3; // deg/s lissé
      d.lastX = e.clientX;
      d.lastT = now;
      return;
    }
    if (reduceMotion || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    px.set(Math.max(-1, Math.min(1, nx)));
    py.set(Math.max(-1, Math.min(1, ny)));
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    settle(d.velocity);
  };

  const resetTilt = () => {
    if (drag.current) return;
    px.set(0);
    py.set(0);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Halo derrière l'appareil : s'intensifie une fois allumé, bouge en parallaxe */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl"
        style={{ x: glowX, y: glowY }}
        animate={{ opacity: state === "on" ? 0.9 : 0.35, scale: state === "on" ? 1.05 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Zone de survol élargie + perspective 3D. Glisser ici (hors écran) fait tourner le téléphone */}
      <div
        className="-m-8 cursor-grab select-none p-8 [touch-action:pan-y] active:cursor-grabbing"
        style={{ perspective: 1200 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={resetTilt}
      >
        <motion.div
          className="relative w-[clamp(250px,78vw,320px)] [transform-style:preserve-3d]"
          style={{ aspectRatio: "9 / 19.5", rotateX, rotateY, x: shiftX, y: shiftY }}
        >
          {/* ── Face avant : châssis aluminium vert foncé, tranches plates ── */}
          <div
            inert={isBack}
            className="absolute inset-0 rounded-[3.3rem] bg-[linear-gradient(160deg,#4a7a5c_0%,#2b5a3f_30%,#1e4530_65%,#11301f_100%)] p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.35)] [backface-visibility:hidden]"
            style={{ transform: `translateZ(${HALF_DEPTH}px)` }}
          >
            {/* Bordure noire uniforme autour de la dalle */}
            <div className="relative h-full w-full rounded-[3.05rem] bg-black p-[7px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              {/* Écran */}
              <div
                data-screen
                className="relative h-full w-full cursor-default overflow-hidden rounded-[2.6rem] bg-black"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-30 rounded-[2.6rem] ring-1 ring-inset ring-white/[0.06]"
                />
                {/* Reflet qui suit le pointeur */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-20 rounded-[2.6rem] mix-blend-screen"
                  style={{ backgroundImage: sheen }}
                />
                {/* Dynamic Island */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-[10px] z-30 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black"
                />
                {/* Barre d'accueil */}
                <div
                  aria-hidden
                  className="absolute bottom-2 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/70"
                />

                <AnimatePresence mode="wait" initial={false}>
                  {state === "locked" && (
                    <LockScreen key="lock" onUnlock={() => onStateChange("booting")} />
                  )}
                  {state === "booting" && (
                    <BootScreen key="boot" onDone={() => onStateChange("on")} />
                  )}
                  {state === "on" && (
                    <ChatScreen
                      key="chat"
                      onPowerOff={() => {
                        setAdminOpen(false);
                        setChatStarted(false);
                        onStateChange("locked");
                      }}
                      onBack={openAdmin}
                      onConversationStart={() => setChatStarted(true)}
                    />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {state === "on" && adminOpen && <AdminLoginScreen key="admin" onClose={() => setAdminOpen(false)} />}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Cartes de messagerie qui sortent de l'écran une fois allumé ── */}
          <FloatingCards visible={state === "on" && !adminOpen && !chatStarted} />

          {/* ── Volume : tranches, coins, boutons ── */}
          <PhoneSides />

          {/* ── Face arrière ── */}
          <div
            aria-hidden={!isBack}
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: `rotateY(180deg) translateZ(${HALF_DEPTH}px)` }}
          >
            <PhoneBack />
          </div>
          <CameraPlateau />
        </motion.div>
      </div>
    </div>
  );
}
