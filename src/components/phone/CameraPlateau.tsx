import { HALF_DEPTH, PLATEAU_RISE } from "./geometry";

/** Objectif : bague orange en relief, cerclage noir, verre sombre à anneaux concentriques et reflets. */
function Lens({ className }: { className: string }) {
  return (
    <div aria-hidden className={`absolute aspect-square ${className}`}>
      {/* Bague orange usinée */}
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,#6e9e82_0deg,#2f5f44_60deg,#1b3f2b_140deg,#3a6b4e_210deg,#6e9e82_290deg,#6e9e82_360deg)] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
      {/* Cerclage noir */}
      <div className="absolute inset-[14%] rounded-full bg-[#0a0806] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_0_0_1px_rgba(0,0,0,0.7)]" />
      {/* Verre : lentilles concentriques */}
      <div className="absolute inset-[22%] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_50%,#30343f_0%,#15181f_22%,#20232c_24%,#0c0e13_40%,#1b1e26_42%,#07080c_60%,#13151c_62%,#04050a_100%)]">
        {/* Reflet principal */}
        <span className="absolute left-[10%] top-[8%] h-[36%] w-[46%] -rotate-[28deg] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.6),rgba(255,255,255,0)_70%)]" />
        {/* Teinte bleu-violet */}
        <span className="absolute bottom-[8%] right-[8%] h-[44%] w-[44%] rounded-full bg-[radial-gradient(circle,rgba(128,118,255,0.4),transparent_70%)]" />
        {/* Point spéculaire */}
        <span className="absolute left-[26%] top-[22%] h-[9%] w-[9%] rounded-full bg-white/90" />
      </div>
    </div>
  );
}

const SHAPE = "absolute inset-x-[6%] top-[4%] h-[26.5%] rounded-[1.7rem]";
const RIM_LAYERS = [1.5, 3, 4.5];

/** Plateau caméra en relief au dos : trois objectifs en triangle, flash, micro, LiDAR. */
export default function CameraPlateau() {
  return (
    <>
      {/* Rebord du plateau (épaisseur) */}
      {RIM_LAYERS.map((z) => (
        <div
          key={z}
          aria-hidden
          className={`${SHAPE} bg-[#163525]`}
          style={{ transform: `rotateY(180deg) translateZ(${HALF_DEPTH + z}px)` }}
        />
      ))}
      {/* Face du plateau */}
      <div
        className={`${SHAPE} bg-[linear-gradient(160deg,#2d5d41_0%,#214a33_55%,#183a27_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(0,0,0,0.12)] [backface-visibility:hidden]`}
        style={{ transform: `rotateY(180deg) translateZ(${HALF_DEPTH + PLATEAU_RISE}px)` }}
      >
        {/* Deux objectifs à gauche, le troisième à droite au centre */}
        <Lens className="left-[7%] top-[9%] w-[26%]" />
        <Lens className="bottom-[9%] left-[7%] w-[26%]" />
        <Lens className="left-[36%] top-1/2 w-[26%] -translate-y-1/2" />
        {/* Flash */}
        <span aria-hidden className="absolute right-[8%] top-[13%] aspect-square w-[9%] rounded-full bg-[radial-gradient(circle_at_45%_40%,#ffffff_0%,#f6e9d2_40%,#cfc4b4_75%,#8a7f70_100%)] shadow-[inset_0_0_0_2px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.4)]" />
        {/* Micro */}
        <span aria-hidden className="absolute right-[11.5%] top-1/2 aspect-square w-[3%] -translate-y-1/2 rounded-full bg-[#1a1208] shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]" />
        {/* LiDAR */}
        <span aria-hidden className="absolute bottom-[13%] right-[8%] aspect-square w-[9%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#2d2a2e_0%,#121014_60%,#000_100%)] shadow-[inset_0_0_0_2px_#1d3a2a,0_0_0_1px_rgba(255,255,255,0.25),0_1px_3px_rgba(0,0,0,0.4)]" />
      </div>
    </>
  );
}
