import { useSyncExternalStore } from "react";

/**
 * TwinsChat, notre messagerie : application web, appli Android (APK) et installateur Windows.
 * Les fichiers sont servis depuis public/telechargements (sources Windows : outils/twinschat-pc).
 */
export const TWINSCHAT_URL = "https://twinschat.ucan-mih.com/";

export const TWINSCHAT_FICHIERS = {
  android: { href: "/telechargements/TwinsChat.apk", fichier: "TwinsChat.apk", systeme: "Android" },
  windows: { href: "/telechargements/TwinsChat-Setup.exe", fichier: "TwinsChat-Setup.exe", systeme: "Windows" },
} as const;

/** « autre » : iPhone, Mac, Linux… aucun fichier à installer, on passe par l'application web. */
export type Plateforme = keyof typeof TWINSCHAT_FICHIERS | "autre";

function detecter(): Plateforme {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  return "autre";
}
const sansAbonnement = () => () => {};

/** Système du visiteur : « autre » au rendu serveur, le vrai dans le navigateur (sans écart d'hydratation). */
export function usePlateforme(): Plateforme {
  return useSyncExternalStore(sansAbonnement, detecter, () => "autre" as const);
}
