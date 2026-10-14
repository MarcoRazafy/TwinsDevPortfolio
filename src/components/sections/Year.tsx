"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const year = () => new Date().getFullYear();

/** Année courante, calculée dans le navigateur (le prérendu n'a pas le droit de lire l'horloge). */
export default function Year() {
  return <>{useSyncExternalStore(subscribe, year, () => 2026)}</>;
}
