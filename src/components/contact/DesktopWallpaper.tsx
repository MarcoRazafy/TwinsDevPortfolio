/**
 * Fond d'écran du bureau, aux couleurs de TwinsDev : fond nuit (#06080f), vagues vert émeraude et
 * turquoise, vague basse dans le vert d'accent (#22c55e → #4ade80) avec des ondulations claires.
 */
export default function DesktopWallpaper() {
  const ripples = Array.from({ length: 9 }, (_, i) => 160 + i * 85);
  return (
    <svg aria-hidden viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="fond-nuit" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#06080f" />
          <stop offset="0.6" stopColor="#061512" />
          <stop offset="1" stopColor="#052018" />
        </linearGradient>
        <linearGradient id="fond-vague-haute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14b8a6" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#2dd4bf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22c55e" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="fond-vague-milieu" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#052e1f" />
          <stop offset="0.6" stopColor="#064e3b" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="fond-vague-basse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#15803d" />
          <stop offset="0.55" stopColor="#22c55e" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <radialGradient id="fond-lueur" cx="0.3" cy="0.95" r="0.6">
          <stop offset="0" stopColor="#86efac" stopOpacity="0.35" />
          <stop offset="1" stopColor="#86efac" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fond-halo" cx="0.75" cy="0.15" r="0.5">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
        <pattern id="fond-trame" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="#bbf7d0" fillOpacity="0.12" />
        </pattern>
        <clipPath id="fond-coupe-basse">
          <path d="M0 640C330 540 690 600 1000 770C1200 880 1410 880 1600 800V1000H0Z" />
        </clipPath>
      </defs>

      <rect width="1600" height="1000" fill="url(#fond-nuit)" />
      <rect width="1600" height="560" fill="url(#fond-trame)" />
      <rect width="1600" height="1000" fill="url(#fond-halo)" />
      <path d="M0 0H1600V470C1330 620 1080 360 820 290C580 225 270 430 0 360Z" fill="url(#fond-vague-haute)" />
      <path d="M0 400C310 300 620 270 920 430C1160 560 1370 540 1600 430V1000H0Z" fill="url(#fond-vague-milieu)" />
      <path d="M0 640C330 540 690 600 1000 770C1200 880 1410 880 1600 800V1000H0Z" fill="url(#fond-vague-basse)" />
      <g clipPath="url(#fond-coupe-basse)" fill="none" stroke="#f0fdf4" strokeOpacity="0.16" strokeWidth="2">
        {ripples.map((rx) => (
          <ellipse key={rx} cx="430" cy="1010" rx={rx} ry={rx * 0.42} />
        ))}
      </g>
      <rect width="1600" height="1000" fill="url(#fond-lueur)" />
    </svg>
  );
}
