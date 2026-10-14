import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { BackgroundName } from "./names";
import type { BackgroundProps } from "./types";

/* Chargement à la demande : seul l'arrière-plan affiché est téléchargé par le navigateur. */
export const BACKGROUNDS: Record<BackgroundName, ComponentType<BackgroundProps>> = {
  dispersion: dynamic(() => import("./DispersionBackground")),
  beams: dynamic(() => import("./BeamsBackground")),
};
