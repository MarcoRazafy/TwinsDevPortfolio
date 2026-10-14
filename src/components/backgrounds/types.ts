import type { PhoneState } from "@/components/phone/types";

export type { PhoneState };

/** Contrat commun à tous les arrière-plans : ils réagissent à l'état du téléphone. */
export type BackgroundProps = { state: PhoneState };
