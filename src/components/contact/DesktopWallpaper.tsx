/** Fond d'écran du bureau : grandes vagues superposées aux couleurs du site, avec des ondulations claires en bas. */
export default function DesktopWallpaper() {
  const ripples = Array.from({ length: 9 }, (_, i) => 160 + i * 85);
  return (
    <svg aria-hidden viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="fond-ciel" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="0.45" stopColor="#0ea5a4" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="fond-vague-haute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="0.55" stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="fond-vague-milieu" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#064e3b" />
          <stop offset="0.6" stopColor="#065f46" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="fond-vague-basse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16a34a" />
          <stop offset="0.5" stopColor="#4ade80" />
          <stop offset="1" stopColor="#bef264" />
        </linearGradient>
        <radialGradient id="fond-lueur" cx="0.3" cy="0.95" r="0.6">
          <stop offset="0" stopColor="#ecfccb" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ecfccb" stopOpacity="0" />
        </radialGradient>
        <clipPath id="fond-coupe-basse">
          <path d="M0 640C330 540 690 600 1000 770C1200 880 1410 880 1600 800V1000H0Z" />
        </clipPath>
      </defs>

      <rect width="1600" height="1000" fill="url(#fond-ciel)" />
      <path d="M0 0H1600V470C1330 620 1080 360 820 290C580 225 270 430 0 360Z" fill="url(#fond-vague-haute)" opacity="0.9" />
      <path d="M0 400C310 300 620 270 920 430C1160 560 1370 540 1600 430V1000H0Z" fill="url(#fond-vague-milieu)" />
      <path d="M0 640C330 540 690 600 1000 770C1200 880 1410 880 1600 800V1000H0Z" fill="url(#fond-vague-basse)" />
      <g clipPath="url(#fond-coupe-basse)" fill="none" stroke="#f7fee7" strokeOpacity="0.16" strokeWidth="2">
        {ripples.map((rx) => (
          <ellipse key={rx} cx="430" cy="1010" rx={rx} ry={rx * 0.42} />
        ))}
      </g>
      <rect width="1600" height="1000" fill="url(#fond-lueur)" />
    </svg>
  );
}
