/** Événement écouté par le téléphone (PhoneMockup) : il ouvre l'assistant TwinsChat. */
export const OPEN_ASSISTANT_EVENT = "twinsdev:ouvrir-assistant";

/**
 * Depuis n'importe où dans la page : fait défiler jusqu'au téléphone, y ouvre l'assistant
 * et place le curseur dans le champ de saisie (sans interrompre le défilement).
 */
export function openAssistant() {
  const phone = document.querySelector<HTMLElement>("[data-phone-anchor]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  phone?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));

  // Le champ reste désactivé tant que l'accueil s'écrit : on attend qu'il soit prêt (jusqu'à ~8 s),
  // et on n'y déplace le curseur que si le visiteur n'a pas cliqué ailleurs entre-temps.
  const from = document.activeElement;
  const focusInput = (tries: number) => {
    const active = document.activeElement;
    if (active !== from && active !== document.body) return;
    const input = phone?.querySelector<HTMLInputElement>("input");
    if (input && !input.disabled) input.focus({ preventScroll: true });
    else if (tries < 25) window.setTimeout(() => focusInput(tries + 1), 300);
  };
  window.setTimeout(() => focusInput(0), 600);
}
