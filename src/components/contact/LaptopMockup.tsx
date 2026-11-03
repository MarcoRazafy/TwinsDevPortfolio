import type { ReactNode } from "react";

/**
 * Ordinateur portable (modèle de présentation) : cadre d'écran avec encoche, puis socle avec son
 * creux d'ouverture. Le contenu de l'écran est passé en enfant.
 * Sur petit écran, le cadre et le socle disparaissent : seul l'écran reste, pleine largeur.
 */
export default function LaptopMockup({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1120px]">
      {/* Écran : cadre noir, liseré métallique, encoche caméra */}
      <div className="relative md:rounded-[26px] md:border md:border-white/15 md:bg-[#050607] md:p-[12px] md:pb-[14px] md:shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_50px_120px_-40px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div
          aria-hidden
          className="absolute left-1/2 top-[12px] z-30 hidden h-[18px] w-[110px] -translate-x-1/2 rounded-b-[10px] bg-[#050607] md:block"
        >
          <span className="absolute left-1/2 top-[6px] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-[#1b2430] ring-1 ring-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-[22px] md:rounded-[14px]">{children}</div>
      </div>

      {/* Socle : plateau légèrement plus large, creux central pour ouvrir l'écran */}
      <div aria-hidden className="relative -mx-[4%] hidden md:block">
        <div className="h-[16px] rounded-b-[18px] rounded-t-[3px] bg-[linear-gradient(180deg,#5b636b_0%,#2a2f34_45%,#16191c_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />
        <div className="absolute left-1/2 top-0 h-[6px] w-[15%] -translate-x-1/2 rounded-b-[8px] bg-[linear-gradient(180deg,#1a1d20,#2f353a)]" />
        <div className="mx-auto h-[10px] w-[92%] rounded-b-full bg-black/50 blur-[6px]" />
      </div>
    </div>
  );
}
