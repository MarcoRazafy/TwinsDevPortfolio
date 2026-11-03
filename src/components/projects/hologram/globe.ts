import { LAND_DOTS } from "./land-dots";

/**
 * Globe terrestre en hologramme, dessiné en Canvas 2D (aucune dépendance 3D) :
 * continents en points, face cachée visible par transparence, arcs de réseau entre grandes villes
 * avec impulsions lumineuses, nœuds qui pulsent, atmosphère, balayage et particules.
 */

const DEG = Math.PI / 180;
type Vec = [number, number, number];

const toVec = (lat: number, lon: number): Vec => [
  Math.cos(lat * DEG) * Math.sin(lon * DEG),
  Math.sin(lat * DEG),
  Math.cos(lat * DEG) * Math.cos(lon * DEG),
];

/* ── Données ── */

/** Antananarivo : le nœud « maison », mis en avant. */
const HUB = 0;
const CITIES: [number, number][] = [
  [-18.88, 47.51], // Antananarivo
  [48.86, 2.35], [51.5, -0.13], [40.42, -3.7], [45.5, -73.57], [40.71, -74.0], [34.05, -118.24],
  [19.43, -99.13], [4.71, -74.07], [-12.05, -77.04], [-23.55, -46.63], [-34.6, -58.38], [6.52, 3.38],
  [14.72, -17.47], [30.04, 31.24], [-1.29, 36.82], [-26.2, 28.05], [-33.92, 18.42], [-20.88, 55.45],
  [41.0, 28.98], [55.75, 37.62], [25.2, 55.27], [19.08, 72.88], [1.35, 103.82], [39.9, 116.4],
  [35.68, 139.69], [-33.87, 151.21], [-6.2, 106.85], [64.15, -21.94], [37.57, 126.98], [-31.95, 115.86],
  [21.3, -157.85], [61.22, -149.9],
];
/** Liaisons longues ajoutées aux voisins proches : depuis Madagascar et quelques grands axes. */
const EXTRA_LINKS: [number, number][] = [
  [HUB, 1], [HUB, 4], [HUB, 15], [HUB, 16], [HUB, 18], [HUB, 21], [HUB, 22], [HUB, 23], [HUB, 10],
  [1, 5], [2, 5], [6, 25], [26, 23], [10, 12], [21, 2], [24, 6], [31, 6], [32, 25],
];

const ARC_STEPS = 34;

type Arc = { pts: Float32Array; speed: number; offset: number; hub: boolean };

let cache: { land: Float32Array; lights: Uint8Array; cities: Vec[]; arcs: Arc[]; particles: Float32Array } | null = null;

function build() {
  if (cache) return cache;

  // Terres : paires Int16 (centièmes de degré) encodées en base64
  const bin = atob(LAND_DOTS);
  const n = bin.length / 4;
  const land = new Float32Array(n * 3);
  const lights = new Uint8Array(n);
  const int16 = (o: number) => {
    const v = bin.charCodeAt(o) | (bin.charCodeAt(o + 1) << 8);
    return v >= 0x8000 ? v - 0x10000 : v;
  };
  for (let i = 0; i < n; i++) {
    const [x, y, z] = toVec(int16(i * 4) / 100, int16(i * 4 + 2) / 100);
    land.set([x, y, z], i * 3);
    lights[i] = (Math.imul(i + 1, 2654435761) >>> 0) % 100 < 6 ? 1 : 0; // ~6 % de lumières de ville
  }

  const cities = CITIES.map(([la, lo]) => toVec(la, lo));
  const angle = (a: Vec, b: Vec) => Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

  // Chaque ville reliée à ses deux voisines les plus proches, plus les liaisons longues
  const links = new Set<string>();
  const add = (a: number, b: number) => a !== b && links.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  cities.forEach((c, i) => {
    cities
      .map((d, j) => [j, angle(c, d)] as const)
      .filter(([j]) => j !== i)
      .sort((p, q) => p[1] - q[1])
      .slice(0, 2)
      .forEach(([j]) => add(i, j));
  });
  EXTRA_LINKS.forEach(([a, b]) => add(a, b));

  const arcs: Arc[] = [...links].map((key, k) => {
    const [a, b] = key.split("-").map(Number);
    const A = cities[a], B = cities[b];
    const w = angle(A, B);
    const pts = new Float32Array((ARC_STEPS + 1) * 3);
    for (let s = 0; s <= ARC_STEPS; s++) {
      const t = s / ARC_STEPS;
      const ka = Math.sin((1 - t) * w) / Math.sin(w);
      const kb = Math.sin(t * w) / Math.sin(w);
      const h = 1 + w * 0.17 * Math.sin(Math.PI * t); // l'arc s'élève avec la distance
      pts.set([(ka * A[0] + kb * B[0]) * h, (ka * A[1] + kb * B[1]) * h, (ka * A[2] + kb * B[2]) * h], s * 3);
    }
    return { pts, speed: 0.55 + ((k * 37) % 10) / 14, offset: ((k * 53) % 100) / 100, hub: a === HUB || b === HUB };
  });

  // Particules : coquille autour du globe (x, y, z, phase)
  const P = 150;
  const particles = new Float32Array(P * 4);
  for (let i = 0; i < P; i++) {
    const r = (i * 0.618034) % 1;
    const u = ((i * 0.7548777) % 1) * 2 - 1;
    const th = ((i * 0.5698403) % 1) * Math.PI * 2;
    const rad = 1.18 + r * 1.05;
    const s = Math.sqrt(1 - u * u);
    particles.set([s * Math.cos(th) * rad, u * rad * 0.8, s * Math.sin(th) * rad, (i * 1.37) % (Math.PI * 2)], i * 4);
  }

  cache = { land, lights, cities, arcs, particles };
  return cache;
}

/* ── Sprites de lueur, préparés une fois par couleur ── */

const sprites = new Map<string, HTMLCanvasElement>();
function glow(color: string) {
  let s = sprites.get(color);
  if (s) return s;
  s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  sprites.set(color, s);
  return s;
}

/* ── Projection ── */

export type View = { cx: number; cy: number; r: number; spin: number; tilt: number };

/** Prépare la projection d'une vue (trigonométrie calculée une fois) : renvoie une fonction qui écrit
    dans `out` l'écran (x, y), la profondeur (z > 0 = face visible) et la distance au centre du disque. */
function projector(v: View) {
  const cs = Math.cos(v.spin), ss = Math.sin(v.spin), ct = Math.cos(v.tilt), st = Math.sin(v.tilt);
  return (x: number, y: number, z: number, out: Float32Array) => {
    const x1 = x * cs + z * ss;
    const z1 = -x * ss + z * cs;
    const y2 = y * ct - z1 * st;
    out[0] = v.cx + v.r * x1;
    out[1] = v.cy - v.r * y2;
    out[2] = y * st + z1 * ct;
    out[3] = x1 * x1 + y2 * y2; // > 1 : hors du disque, donc visible même derrière
  };
}

const LAND_RGB = "125, 211, 252";
const ARC_RGB = "56, 189, 248";
const HUB_COLOR = "rgba(74, 222, 128, 0.9)";

/** Dessine le globe. `time` en ms, `motion` à 0 fige les animations décoratives. */
export function drawGlobe(ctx: CanvasRenderingContext2D, v: View, time: number, motion = 1) {
  const { land, lights, cities, arcs, particles } = build();
  const { cx, cy, r } = v;
  const p = new Float32Array(4);
  const project = projector(v);

  // Atmosphère
  const atmo = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r * 1.55);
  atmo.addColorStop(0, "rgba(56, 189, 248, 0.32)");
  atmo.addColorStop(0.35, "rgba(37, 99, 235, 0.12)");
  atmo.addColorStop(1, "rgba(37, 99, 235, 0)");
  ctx.fillStyle = atmo;
  ctx.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2);

  // Corps de la sphère : sombre et translucide, éclairé en haut à gauche
  const body = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r);
  body.addColorStop(0, "rgba(30, 64, 175, 0.42)");
  body.addColorStop(0.55, "rgba(8, 22, 58, 0.62)");
  body.addColorStop(1, "rgba(2, 8, 23, 0.78)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Graticule discret (face visible)
  ctx.beginPath();
  for (let lat = -60; lat <= 60; lat += 30) {
    let open = false;
    for (let lon = 0; lon <= 360; lon += 6) {
      const [x, y, z] = toVec(lat, lon);
      project(x, y, z, p);
      if (p[2] > 0) { if (open) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); open = true; } else open = false;
    }
  }
  for (let lon = 0; lon < 360; lon += 30) {
    let open = false;
    for (let lat = -84; lat <= 84; lat += 6) {
      const [x, y, z] = toVec(lat, lon);
      project(x, y, z, p);
      if (p[2] > 0) { if (open) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); open = true; } else open = false;
    }
  }
  ctx.strokeStyle = `rgba(${LAND_RGB}, 0.07)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Continents : face cachée en filigrane, face visible par paliers de luminosité
  const dot = Math.max(1.1, r / 170);
  const BUCKETS = 6;
  const paths = Array.from({ length: BUCKETS + 1 }, () => new Path2D());
  const lightPath = new Path2D();
  for (let i = 0; i < land.length / 3; i++) {
    project(land[i * 3], land[i * 3 + 1], land[i * 3 + 2], p);
    if (p[2] <= 0) {
      paths[0].rect(p[0], p[1], dot * 0.8, dot * 0.8);
      continue;
    }
    const b = 1 + Math.min(BUCKETS - 1, Math.floor(p[2] * BUCKETS));
    paths[b].rect(p[0] - dot / 2, p[1] - dot / 2, dot, dot);
    if (lights[i] && p[2] > 0.15) lightPath.rect(p[0] - dot * 0.7, p[1] - dot * 0.7, dot * 1.4, dot * 1.4);
  }
  ctx.fillStyle = `rgba(${LAND_RGB}, 0.07)`;
  ctx.fill(paths[0]);
  for (let b = 1; b <= BUCKETS; b++) {
    ctx.fillStyle = `rgba(${LAND_RGB}, ${(0.22 + (b / BUCKETS) * 0.7).toFixed(2)})`;
    ctx.fill(paths[b]);
  }
  ctx.fillStyle = "rgba(254, 240, 186, 0.9)";
  ctx.fill(lightPath);

  // Arcs de réseau : avant franc, arrière en filigrane
  const front = new Path2D();
  const back = new Path2D();
  const pulses: [number, number, boolean][] = [];
  for (const arc of arcs) {
    let prevVisible: boolean | null = null;
    for (let s = 0; s <= ARC_STEPS; s++) {
      project(arc.pts[s * 3], arc.pts[s * 3 + 1], arc.pts[s * 3 + 2], p);
      const visible = p[2] > 0 || p[3] > 1;
      const path = visible ? front : back;
      if (s === 0 || visible !== prevVisible) path.moveTo(p[0], p[1]);
      else path.lineTo(p[0], p[1]);
      prevVisible = visible;
    }
    // Impulsion qui parcourt l'arc
    const t = motion ? (time * 0.00022 * arc.speed + arc.offset) % 1 : arc.offset;
    const s = Math.round(t * ARC_STEPS);
    project(arc.pts[s * 3], arc.pts[s * 3 + 1], arc.pts[s * 3 + 2], p);
    if (p[2] > 0 || p[3] > 1) pulses.push([p[0], p[1], arc.hub]);
  }
  ctx.lineWidth = Math.max(0.8, r / 260);
  ctx.strokeStyle = `rgba(${ARC_RGB}, 0.07)`;
  ctx.stroke(back);
  ctx.strokeStyle = `rgba(${ARC_RGB}, 0.38)`;
  ctx.stroke(front);

  const blue = glow("rgba(56, 189, 248, 0.85)");
  const green = glow(HUB_COLOR);
  const ps = Math.max(10, r / 16);
  for (const [x, y, hub] of pulses) ctx.drawImage(hub ? green : blue, x - ps / 2, y - ps / 2, ps, ps);

  // Nœuds (villes), Antananarivo en vert avec une onde
  cities.forEach((c, i) => {
    project(c[0], c[1], c[2], p);
    if (p[2] <= 0) return;
    const beat = motion ? 0.75 + 0.25 * Math.sin(time * 0.003 + i) : 1;
    const size = (i === HUB ? 2.4 : 1.4) * ps * beat * (0.5 + p[2] * 0.5);
    ctx.drawImage(i === HUB ? green : blue, p[0] - size / 2, p[1] - size / 2, size, size);
    if (i === HUB && motion) {
      const w = (time % 2400) / 2400;
      ctx.beginPath();
      ctx.arc(p[0], p[1], ps * 0.4 + w * ps * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(74, 222, 128, ${(1 - w) * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  // Balayage holographique : une bande de lumière qui descend sur la sphère
  if (motion) {
    const phase = (time % 5600) / 5600;
    const y = cy - r * 1.2 + phase * r * 2.4;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const band = ctx.createLinearGradient(0, y - r * 0.18, 0, y + r * 0.18);
    band.addColorStop(0, "rgba(125, 211, 252, 0)");
    band.addColorStop(0.5, "rgba(125, 211, 252, 0.12)");
    band.addColorStop(1, "rgba(125, 211, 252, 0)");
    ctx.fillStyle = band;
    ctx.fillRect(cx - r, y - r * 0.18, r * 2, r * 0.36);
    ctx.restore();
  }

  // Bord lumineux (effet de Fresnel)
  const rim = ctx.createRadialGradient(cx, cy, r * 0.78, cx, cy, r * 1.02);
  rim.addColorStop(0, "rgba(56, 189, 248, 0)");
  rim.addColorStop(0.85, "rgba(56, 189, 248, 0.16)");
  rim.addColorStop(1, "rgba(125, 211, 252, 0.5)");
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2);
  ctx.fillStyle = rim;
  ctx.fill();

  // Particules autour : tournent un peu moins vite que le globe (parallaxe)
  const projectFar = projector({ ...v, spin: v.spin * 0.6 });
  for (let i = 0; i < particles.length / 4; i++) {
    projectFar(particles[i * 4], particles[i * 4 + 1], particles[i * 4 + 2], p);
    const hidden = p[2] < 0 && p[3] < 1;
    const tw = motion ? 0.5 + 0.5 * Math.sin(time * 0.0016 + particles[i * 4 + 3]) : 0.7;
    const a = (hidden ? 0.15 : 0.35 + 0.65 * Math.max(0, p[2])) * tw;
    const size = ps * (0.35 + 0.5 * Math.max(0, p[2])) * (0.6 + tw * 0.6);
    ctx.globalAlpha = a;
    ctx.drawImage(blue, p[0] - size / 2, p[1] - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Anneau d'orbite (ellipse pointillée) : moitié arrière ou avant, selon `half`. */
export function drawOrbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, half: "back" | "front", alpha: number) {
  if (alpha <= 0.01 || rx <= 0 || ry <= 0) return;
  ctx.save();
  ctx.beginPath();
  if (half === "back") ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2);
  else ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
  ctx.setLineDash([2, 7]);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = `rgba(125, 211, 252, ${(half === "back" ? 0.16 : 0.42) * alpha})`;
  ctx.stroke();
  ctx.restore();
}

/** Faisceau projeté du globe vers une image en orbite. */
export function drawBeam(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, x: number, y: number, alpha: number) {
  if (alpha <= 0.01) return;
  const dx = x - cx, dy = y - cy;
  const d = Math.hypot(dx, dy) || 1;
  const sx = cx + (dx / d) * r * 0.96, sy = cy + (dy / d) * r * 0.96;
  const g = ctx.createLinearGradient(sx, sy, x, y);
  g.addColorStop(0, `rgba(125, 211, 252, ${0.5 * alpha})`);
  g.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = g;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();
}

/* ── Légendes ancrées sur le globe (repère hexagonal + tige vers l'étiquette) ── */

export type AnchorPoints = {
  /** Pied de la tige, sur la surface : écran + profondeur. */
  bx: number; by: number; bz: number;
  /** Bout de la tige, au-dessus de la surface : là où se pose l'étiquette. */
  tx: number; ty: number;
  /** 0 : caché derrière le globe, 1 : bien visible. */
  vis: number;
};

/** Position à l'écran d'une légende ancrée en (lat, lon), tige de hauteur `lift` (1 = surface). */
export function anchorPoints(v: View, lat: number, lon: number, lift: number): AnchorPoints {
  const project = projector(v);
  const [x, y, z] = toVec(lat, lon);
  const p = new Float32Array(4);
  project(x, y, z, p);
  const bx = p[0], by = p[1], bz = p[2];
  project(x * lift, y * lift, z * lift, p);
  // Le bout reste visible tant qu'il dépasse du disque, même si le pied est déjà derrière
  const vis = p[2] > 0 || p[3] > 1 ? Math.min(1, 0.55 + Math.max(bz, -0.4) * 1.4) : 0;
  return { bx, by, bz, tx: p[0], ty: p[1], vis: Math.max(0, vis) };
}

const ANCHOR_RGB = "52, 211, 153"; // émeraude (#34d399), dans la palette du site

/** Dessine le repère et la tige d'une légende. `active` : catégorie choisie ; `invite` : rien n'est encore choisi. */
export function drawAnchor(ctx: CanvasRenderingContext2D, a: AnchorPoints, r: number, time: number, motion: number, active: boolean, invite: boolean) {
  const behind = a.bz <= 0;
  const k = behind ? 0.3 : 0.45 + 0.55 * Math.min(1, a.bz * 1.6);
  const hex = Math.max(4, r / 34) * (active ? 1.35 : 1);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Tige : du pied vers l'étiquette
  const g = ctx.createLinearGradient(a.bx, a.by, a.tx, a.ty);
  g.addColorStop(0, `rgba(${ANCHOR_RGB}, ${0.95 * k})`);
  g.addColorStop(1, `rgba(${ANCHOR_RGB}, ${0.2 * k})`);
  ctx.strokeStyle = g;
  ctx.lineWidth = active ? 2 : 1.4;
  ctx.beginPath();
  ctx.moveTo(a.bx, a.by);
  ctx.lineTo(a.tx, a.ty);
  ctx.stroke();

  // Repère hexagonal au pied
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const t = (Math.PI / 3) * i + Math.PI / 6;
    const px = a.bx + Math.cos(t) * hex, py = a.by + Math.sin(t) * hex;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(${ANCHOR_RGB}, ${k})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(${ANCHOR_RGB}, ${(active ? 0.45 : 0.18) * k})`;
  ctx.fill();

  // Lueur au bout de la tige
  const tip = glow(`rgba(${ANCHOR_RGB}, 0.9)`);
  const ts = Math.max(10, r / 14) * (active ? 1.3 : 1);
  ctx.globalAlpha = k;
  ctx.drawImage(tip, a.tx - ts / 2, a.ty - ts / 2, ts, ts);
  ctx.globalAlpha = 1;

  // Onde autour du repère : en continu sur la catégorie choisie, en invitation sinon
  if (motion && (active || invite) && !behind) {
    const w = ((time + (invite ? a.bx * 7 : 0)) % 2200) / 2200;
    ctx.beginPath();
    ctx.arc(a.bx, a.by, hex + w * hex * 2.6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ANCHOR_RGB}, ${(1 - w) * (active ? 0.8 : 0.5) * k})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}
