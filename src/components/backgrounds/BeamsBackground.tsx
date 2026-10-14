"use client";

import "./BeamsBackground.css";
import type { BackgroundProps } from "./types";

/**
 * Arrière-plan « faisceaux » : deux éventails de projecteurs qui pivotent lentement de part et
 * d'autre du téléphone, trame de points et ondes concentriques une fois l'appareil allumé.
 * Tout est en CSS (transform / opacity) ; l'intensité suit l'état via `data-state`.
 */
export default function BeamsBackground({ state }: BackgroundProps) {
  return (
    <div
      aria-hidden
      data-state={state}
      className="bgBeams-root pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="bgBeams-dots" />
      <div className="bgBeams-fan bgBeams-fanLeft" />
      <div className="bgBeams-fan bgBeams-fanRight" />
      <div className="bgBeams-rings">
        <span className="bgBeams-ring" />
        <span className="bgBeams-ring" />
        <span className="bgBeams-ring" />
      </div>
      <div className="bgBeams-floor" />
      <div className="bgBeams-shade" />
    </div>
  );
}
