"use client";

import { useEffect, useState } from "react";

type Clock = { time: string; date: string } | null;

/** Heure et date locales (fr-FR), mises à jour chaque minute. `null` avant hydratation. */
export function useClock(): Clock {
  const [clock, setClock] = useState<Clock>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        date: now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
      });
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return clock;
}
