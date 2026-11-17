"use client";

import { useEffect } from "react";

/**
 * Met en pause les animations en boucle (halos qui respirent, pastilles qui flottent, ondes…) des sections
 * qui ne sont pas à l'écran : le processeur ne calcule que ce qu'on voit. Elles reprennent en revenant.
 * Mesuré sur un processeur lent : le défilement passe de 13 à plus de 40 images par seconde.
 */
export default function PauseHorsEcran() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) e.target.toggleAttribute("data-pause", !e.isIntersecting);
      },
      // Un peu d'avance : l'animation a déjà repris quand la section apparaît
      { rootMargin: "200px 0px" },
    );
    document.querySelectorAll("main section, footer").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
