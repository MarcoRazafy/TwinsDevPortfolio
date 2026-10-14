import type { CSSProperties } from "react";
import { DEPTH, HALF_DEPTH, RADIUS } from "./geometry";

/* Coins : quart de cylindre approché par des facettes tangentes */
const SEGMENTS = 8; // facettes par coin
const STEP = 90 / SEGMENTS;
const RAD = Math.PI / 180;
const CHORD = 2 * RADIUS * Math.sin((STEP / 2) * RAD) + 0.4; // léger recouvrement
const APOTHEM = RADIUS * Math.cos((STEP / 2) * RAD);

/* Angles en coordonnées écran : 0° = droite, 90° = bas, 180° = gauche, 270° = haut */
const CORNERS = [
  { key: "tl", left: `${RADIUS}px`, top: `${RADIUS}px`, start: 180 },
  { key: "tr", left: `calc(100% - ${RADIUS}px)`, top: `${RADIUS}px`, start: 270 },
  { key: "br", left: `calc(100% - ${RADIUS}px)`, top: `calc(100% - ${RADIUS}px)`, start: 0 },
  { key: "bl", left: `${RADIUS}px`, top: `calc(100% - ${RADIUS}px)`, start: 90 },
];

/** Teinte d'une tranche selon l'orientation de sa normale (lumière en haut à droite). */
function edge(nx: number, ny: number): string {
  const light = 0.5 + 0.5 * (nx * 0.6 + ny * -0.8);
  const l = 17 + 14 * light;
  return `linear-gradient(180deg, hsl(150 38% ${l + 4}%) 0%, hsl(150 38% ${l}%) 50%, hsl(150 38% ${l - 4}%) 100%)`;
}

const PANEL: CSSProperties = { position: "absolute", backfaceVisibility: "hidden" };

/* Boutons en relief sur les tranches */
const BUTTON_DEPTH = 14;
const BUTTON_OUT = BUTTON_DEPTH / 2 + 1.5;
const BUTTON_STYLE: CSSProperties = {
  ...PANEL,
  width: BUTTON_DEPTH,
  borderRadius: 5,
  background: "linear-gradient(90deg,#163826 0%,#5b8f70 45%,#5b8f70 55%,#163826 100%)",
  boxShadow: "0 0 0 1px rgba(0,0,0,0.35)",
};
const LEFT_BUTTONS = [
  { top: "15.5%", height: 22 }, // bouton Action
  { top: "22%", height: 46 }, // volume +
  { top: "31%", height: 46 }, // volume −
];
const RIGHT_BUTTONS = [
  { top: "24%", height: 72 }, // bouton latéral
  { top: "61%", height: 40 }, // Commande de l'appareil photo
];

const DOTS = Array.from({ length: 5 }, (_, i) => i);

/** Volume du téléphone : tranches, coins, boutons, port USB-C. Faces intérieures masquées. */
export default function PhoneSides() {
  return (
    <>
      {/* Tranche gauche */}
      <div
        aria-hidden
        style={{ ...PANEL, left: 0, top: RADIUS, bottom: RADIUS, width: DEPTH, background: edge(-1, 0), transform: `translateX(${-HALF_DEPTH}px) rotateY(-90deg)` }}
      />
      {/* Tranche droite */}
      <div
        aria-hidden
        style={{ ...PANEL, right: 0, top: RADIUS, bottom: RADIUS, width: DEPTH, background: edge(1, 0), transform: `translateX(${HALF_DEPTH}px) rotateY(90deg)` }}
      />
      {/* Tranche haute */}
      <div
        aria-hidden
        style={{ ...PANEL, top: 0, left: RADIUS, right: RADIUS, height: DEPTH, background: edge(0, -1), transform: `translateY(${-HALF_DEPTH}px) rotateX(90deg)` }}
      />
      {/* Tranche basse : haut-parleur, port USB-C, micro */}
      <div
        aria-hidden
        className="flex items-center justify-center gap-5"
        style={{ ...PANEL, bottom: 0, left: RADIUS, right: RADIUS, height: DEPTH, background: edge(0, 1), transform: `translateY(${HALF_DEPTH}px) rotateX(-90deg)` }}
      >
        <span className="flex gap-[5px]">
          {DOTS.map((i) => <span key={i} className="h-[5px] w-[5px] rounded-full bg-[#1a1208]/80" />)}
        </span>
        <span className="h-[9px] w-[28px] rounded-full bg-[#1a1208] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
        <span className="flex gap-[5px]">
          {DOTS.map((i) => <span key={i} className="h-[5px] w-[5px] rounded-full bg-[#1a1208]/80" />)}
        </span>
      </div>

      {/* Coins arrondis : facettes tangentes */}
      {CORNERS.map((c) =>
        Array.from({ length: SEGMENTS }, (_, i) => {
          const mid = c.start + STEP * (i + 0.5);
          return (
            <div
              key={`${c.key}-${i}`}
              aria-hidden
              style={{
                ...PANEL,
                left: c.left,
                top: c.top,
                width: CHORD,
                height: DEPTH,
                marginLeft: -CHORD / 2,
                marginTop: -HALF_DEPTH,
                background: edge(Math.cos(mid * RAD), Math.sin(mid * RAD)),
                transform: `rotateZ(${mid - 90}deg) translateY(${APOTHEM}px) rotateX(-90deg)`,
              }}
            />
          );
        }),
      )}

      {/* Boutons gauche (Action, volume) */}
      {LEFT_BUTTONS.map((b) => (
        <div
          key={b.top}
          aria-hidden
          style={{ ...BUTTON_STYLE, left: 0, top: b.top, height: b.height, transform: `translateX(${-BUTTON_OUT}px) rotateY(-90deg)` }}
        />
      ))}
      {/* Boutons droite (latéral, Commande de l'appareil photo) */}
      {RIGHT_BUTTONS.map((b) => (
        <div
          key={b.top}
          aria-hidden
          style={{ ...BUTTON_STYLE, right: 0, top: b.top, height: b.height, transform: `translateX(${BUTTON_OUT}px) rotateY(90deg)` }}
        />
      ))}
    </>
  );
}
