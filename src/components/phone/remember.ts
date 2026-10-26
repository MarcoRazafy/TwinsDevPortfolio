/*
 * Mémoire du téléphone allumé : une fois allumé, le site reste allumé aux visites suivantes
 * (actualisation comprise), jusqu'à ce que le visiteur éteigne le téléphone.
 * Stockage local du navigateur : simple confort, propre à chaque visiteur.
 */

export const PHONE_ON_KEY = "twinsdev:phone-on";
const SCROLL_KEY = "twinsdev:scroll";
/** Feuille de style temporaire qui masque la scène pendant le rallumage (évite le flash de l'écran éteint). */
export const RESTORE_STYLE_ID = "phone-restore";

/**
 * Script exécuté avant le premier affichage (dans <head>) : si le téléphone était allumé, masque la scène
 * jusqu'à ce que React la rallume. Filet de sécurité : elle réapparaît d'elle-même au bout de 2,5 s.
 */
export const RESTORE_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(PHONE_ON_KEY)})==="1"){var s=document.createElement("style");s.id=${JSON.stringify(RESTORE_STYLE_ID)};s.textContent="[data-stage]{opacity:0;animation:phone-restore-reveal .01s 2.5s forwards}@keyframes phone-restore-reveal{to{opacity:1}}";document.head.appendChild(s)}}catch(e){}`;

export function readPhoneOn() {
  try {
    return localStorage.getItem(PHONE_ON_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePhoneOn(on: boolean) {
  try {
    if (on) localStorage.setItem(PHONE_ON_KEY, "1");
    else localStorage.removeItem(PHONE_ON_KEY);
  } catch {
    /* stockage indisponible (navigation privée…) : le téléphone repartira éteint, sans gravité */
  }
}

/** Suit les changements faits dans un autre onglet. */
export function subscribePhoneOn(onChange: () => void) {
  const handler = (e: StorageEvent) => e.key === PHONE_ON_KEY && onChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function saveScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
  } catch {
    /* sans importance */
  }
}

export function readScroll() {
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY)) || 0;
  } catch {
    return 0;
  }
}
