/** Pistes de circuit imprimé (côté gauche) : reprises en miroir à droite. */
const TRACES = [
  "M0 118H120L150 148H300",
  "M0 138H110L140 168H300",
  "M40 200H180L210 230V298L240 328H322",
  "M0 262H90L120 292H200",
  "M60 336H160L190 366H300L320 386H470",
  "M150 58H262L292 88H322",
  "M20 392H124",
  "M0 60H70L96 34H220",
];
const PADS: [number, number][] = [
  [300, 148], [300, 168], [322, 328], [200, 292], [470, 386], [322, 88], [124, 392], [220, 34],
];
/** Durée et décalage de l'impulsion de chaque piste (s). */
const PULSE: [number, number][] = [
  [3.4, 0], [4.1, 1.2], [3.8, 0.6], [2.9, 2.1], [4.6, 0.3], [3.2, 1.7], [2.6, 0.9], [3.9, 2.6],
];

/**
 * Circuit imprimé façon interface holographique : cadre central à pans coupés, pistes qui partent
 * des deux bords, pastilles, puces, et une impulsion lumineuse qui parcourt chaque piste.
 */
export default function CircuitBoard() {
  const side = (
    <>
      {TRACES.map((d) => (
        <path key={d} d={d} className="stroke-sky-300/25" />
      ))}
      {TRACES.map((d, i) => (
        <path
          key={`p-${d}`}
          d={d}
          pathLength={200}
          className="trace-pulse stroke-sky-100"
          style={{ animationDuration: `${PULSE[i][0]}s`, animationDelay: `${-PULSE[i][1]}s` }}
        />
      ))}
      {PADS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} className="fill-[#06101f] stroke-sky-300/60" />
      ))}
      {/* Puce et ses broches */}
      <rect x={196} y={96} width={64} height={26} rx={3} className="fill-sky-400/10 stroke-sky-300/40" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${204 + i * 10} 96v-6M${204 + i * 10} 122v6`} className="stroke-sky-300/30" />
      ))}
      {/* Graduations */}
      <path d="M360 404h130" strokeDasharray="3 7" className="stroke-sky-300/35" />
      <path d="M30 168v60" strokeDasharray="2 6" className="stroke-sky-300/30" />
    </>
  );

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 440"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <pattern id="circuit-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" className="fill-sky-300/25" />
        </pattern>
        <linearGradient id="circuit-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(14 165 233)" stopOpacity="0.16" />
          <stop offset="1" stopColor="rgb(14 165 233)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Cadre central à pans coupés, tramé */}
      <path
        d="M330 70H610L630 90H870L880 80V330L860 350H560L540 370H340L320 350V90Z"
        fill="url(#circuit-frame)"
        className="stroke-sky-300/45"
      />
      <path d="M330 70H610L630 90H870L880 80V330L860 350H560L540 370H340L320 350V90Z" fill="url(#circuit-dots)" />
      <path d="M612 82H700M890 110V180M308 260V330" className="stroke-sky-200/60" strokeWidth={2.4} />

      {side}
      <g transform="rotate(180 600 220)">{side}</g>
    </svg>
  );
}
