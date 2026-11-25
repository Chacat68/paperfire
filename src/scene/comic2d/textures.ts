export interface ComicPatterns {
  paperTile: HTMLCanvasElement;
  halftoneDark: CanvasPattern | null;
  halftoneRed: CanvasPattern | null;
  hatchLight: CanvasPattern | null;
  hatchDense: CanvasPattern | null;
  woodcutH: CanvasPattern | null;
  woodcutV: CanvasPattern | null;
}

function makeSeededRand(seedInit: number) {
  let seed = seedInit >>> 0;
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/**
 * Generates cached offscreen Chinese ink-wash & Republican-era fine-line engraving patterns:
 * - Aged Xuan paper fiber & foxing speckles
 * - Republican-era lianhuanhua horizontal & vertical fine woodcut hatching
 * - Dense horror cross-hatching & subtle cinnabar halftone
 */
export function createComicPatterns(ctx: CanvasRenderingContext2D): ComicPatterns {
  const rand = makeSeededRand(7331);

  // 1. 宣纸纤维、泛黄虫蛀斑与水墨飞点 (256x256 tileable)
  const paperTile = document.createElement('canvas');
  paperTile.width = 256;
  paperTile.height = 256;
  const pctx = paperTile.getContext('2d')!;
  pctx.clearRect(0, 0, 256, 256);

  // Long delicate mulberry / xuan paper fibers
  for (let i = 0; i < 520; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const len = 6 + rand() * 18;
    const ang = rand() * Math.PI * 2;
    pctx.strokeStyle = rand() > 0.45 ? 'rgba(248, 240, 224, 0.055)' : 'rgba(14, 12, 11, 0.065)';
    pctx.lineWidth = 0.65;
    pctx.beginPath();
    pctx.moveTo(x, y);
    pctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    pctx.stroke();
  }
  // Subtle organic ink mist blotches & aged foxing dots
  for (let i = 0; i < 210; i++) {
    const x = rand() * 256;
    const y = rand() * 256;
    const r = 0.4 + rand() * 1.3;
    pctx.fillStyle = rand() > 0.18 ? 'rgba(14, 12, 11, 0.085)' : 'rgba(168, 36, 28, 0.055)';
    pctx.beginPath();
    pctx.arc(x, y, r, 0, Math.PI * 2);
    pctx.fill();
  }

  // 2. 漫画暗墨网点
  const htDark = document.createElement('canvas');
  htDark.width = 9;
  htDark.height = 9;
  const htd = htDark.getContext('2d')!;
  htd.fillStyle = 'rgba(10, 10, 11, 0.24)';
  htd.beginPath();
  htd.arc(2.2, 2.2, 1.15, 0, Math.PI * 2);
  htd.arc(6.7, 6.7, 1.15, 0, Math.PI * 2);
  htd.fill();

  // 3. 朱砂点彩网点
  const htRed = document.createElement('canvas');
  htRed.width = 11;
  htRed.height = 11;
  const htr = htRed.getContext('2d')!;
  htr.fillStyle = 'rgba(176, 32, 24, 0.22)';
  htr.beginPath();
  htr.arc(2.8, 2.8, 1.35, 0, Math.PI * 2);
  htr.arc(8.3, 8.3, 1.35, 0, Math.PI * 2);
  htr.fill();

  // 4. 民国线描稀疏斜排线
  const hatchL = document.createElement('canvas');
  hatchL.width = 14;
  hatchL.height = 14;
  const hlc = hatchL.getContext('2d')!;
  hlc.strokeStyle = 'rgba(14, 12, 11, 0.26)';
  hlc.lineWidth = 0.9;
  hlc.beginPath();
  hlc.moveTo(-2, 16);
  hlc.lineTo(16, -2);
  hlc.moveTo(-9, 9);
  hlc.lineTo(9, -9);
  hlc.moveTo(5, 23);
  hlc.lineTo(23, 5);
  hlc.stroke();

  // 5. 恐怖密交叉排线 (Dense horror engraving shadow)
  const hatchD = document.createElement('canvas');
  hatchD.width = 10;
  hatchD.height = 10;
  const hdc = hatchD.getContext('2d')!;
  hdc.strokeStyle = 'rgba(8, 8, 9, 0.44)';
  hdc.lineWidth = 0.95;
  hdc.beginPath();
  hdc.moveTo(-2, 12);
  hdc.lineTo(12, -2);
  hdc.moveTo(-5, 5);
  hdc.lineTo(5, -5);
  hdc.moveTo(5, 15);
  hdc.lineTo(15, 5);
  hdc.moveTo(-2, 2);
  hdc.lineTo(8, 12);
  hdc.stroke();

  // 6. 民国木刻细密横线 (Horizontal fine engraving lines for walls, skies & woodgrain)
  const wcH = document.createElement('canvas');
  wcH.width = 32;
  wcH.height = 8;
  const wch = wcH.getContext('2d')!;
  wch.strokeStyle = 'rgba(14, 12, 11, 0.2)';
  wch.lineWidth = 0.85;
  wch.beginPath();
  wch.moveTo(0, 2);
  wch.lineTo(25, 2);
  wch.moveTo(6, 6);
  wch.lineTo(32, 6);
  wch.stroke();

  // 7. 民国连环画竖向阴翳排线 (Vertical fine shadow lines for pillars, folds & brow gloom)
  const wcV = document.createElement('canvas');
  wcV.width = 7;
  wcV.height = 28;
  const wcv = wcV.getContext('2d')!;
  wcv.strokeStyle = 'rgba(12, 11, 11, 0.34)';
  wcv.lineWidth = 0.9;
  wcv.beginPath();
  wcv.moveTo(2, 0);
  wcv.lineTo(2, 22);
  wcv.moveTo(5.5, 6);
  wcv.lineTo(5.5, 28);
  wcv.stroke();

  return {
    paperTile,
    halftoneDark: ctx.createPattern(htDark, 'repeat'),
    halftoneRed: ctx.createPattern(htRed, 'repeat'),
    hatchLight: ctx.createPattern(hatchL, 'repeat'),
    hatchDense: ctx.createPattern(hatchD, 'repeat'),
    woodcutH: ctx.createPattern(wcH, 'repeat'),
    woodcutV: ctx.createPattern(wcV, 'repeat')
  };
}

export const INK = '#111010';
export const INK_SOFT = '#232220';
export const CINNABAR = '#b6281e';
export const CINNABAR_DARK = '#6f1814';
export const CINNABAR_BRIGHT = '#da3a2c';

/** Color lerp between two hex colors (0..1) */
export function lerpColor(hexA: string, hexB: string, t: number): string {
  const k = Math.max(0, Math.min(1, t));
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  const r = Math.round(ar + (br - ar) * k);
  const g = Math.round(ag + (bg - ag) * k);
  const bl = Math.round(ab + (bb - ab) * k);
  return `rgb(${r},${g},${bl})`;
}

/** Hand-inked brush line with slight organic midpoint bow */
export function inkLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 2.0,
  color = INK,
  bow = 0
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  if (bow !== 0) {
    const mx = (x1 + x2) * 0.5;
    const my = (y1 + y2) * 0.5;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    ctx.quadraticCurveTo(mx - (dy / len) * bow, my + (dx / len) * bow, x2, y2);
  } else {
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  ctx.restore();
}

/** Expressive Chinese dry-brush stroke (飞白枯笔) using layered offset micro-strokes */
export function dryBrushLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width = 3.2,
  color = INK,
  alpha = 0.85
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Split bristle trace (飞白边丝)
  ctx.globalAlpha = alpha * 0.42;
  ctx.lineWidth = Math.max(0.8, width * 0.35);
  ctx.beginPath();
  ctx.moveTo(x1 + 1.2, y1 - 1.1);
  ctx.lineTo(x2 - 0.8, y2 + 1.2);
  ctx.stroke();
  ctx.restore();
}

/** Soft organic wet sumi ink-wash cloud / stain (水墨破墨晕染) */
export function drawInkWashBlot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha: number,
  tint = '14, 15, 16'
) {
  ctx.save();
  const r = Math.max(rx, ry);
  const g = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
  g.addColorStop(0, `rgba(${tint}, ${alpha})`);
  g.addColorStop(0.55, `rgba(${tint}, ${alpha * 0.52})`);
  g.addColorStop(0.82, `rgba(${tint}, ${alpha * 0.18})`);
  g.addColorStop(1, `rgba(${tint}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Filled and fine-line ink-outlined rectangle with optional woodcut hatching */
export function inkRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | CanvasGradient,
  strokeWidth = 2.0,
  hatch?: CanvasPattern | null
) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  if (hatch) {
    ctx.fillStyle = hatch;
    ctx.fillRect(x, y, w, h);
  }
  if (strokeWidth > 0) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
}

/** Filled & ink-outlined polygon */
export function inkPoly(
  ctx: CanvasRenderingContext2D,
  pts: Array<[number, number]>,
  fill: string | CanvasGradient | null,
  strokeWidth = 2.1,
  strokeColor = INK,
  hatch?: CanvasPattern | null
) {
  if (!pts.length) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (hatch) {
    ctx.fillStyle = hatch;
    ctx.fill();
  }
  if (strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

/** Vertical brush calligraphy text (for couplets, plaques, talismans) */
export function drawVerticalCalligraphy(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  topY: number,
  stepY: number,
  fontSize: number,
  color: string,
  shadowColor?: string
) {
  ctx.save();
  ctx.font = `700 ${fontSize}px "Songti SC","STSong","Noto Serif CJK SC",SimSun,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const y = topY + i * stepY;
    if (shadowColor) {
      ctx.fillStyle = shadowColor;
      ctx.fillText(ch, cx + 1.4, y + 1.4);
    }
    ctx.fillStyle = color;
    ctx.fillText(ch, cx, y);
  }
  ctx.restore();
}

/** Traditional cinnabar seal stamp */
export function drawRedSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  char: string
) {
  ctx.save();
  ctx.fillStyle = '#a8221a';
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.strokeStyle = '#df6852';
  ctx.lineWidth = 1.1;
  ctx.strokeRect(x - size / 2 + 1.5, y - size / 2 + 1.5, size - 3, size - 3);
  ctx.fillStyle = '#f6ecd8';
  ctx.font = `700 ${Math.round(size * 0.64)}px "Songti SC","STSong",SimSun,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, x, y + 1);
  ctx.restore();
}

/** Comic atmospheric vertical onomatopoeia (中式线描诡漫拟声词) */
export function drawComicSfx(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  alpha: number,
  tint: 'bone' | 'crimson' | 'jade' = 'bone',
  tilt = -0.08
) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.font = `900 ${size}px "Songti SC","STSong","Noto Serif CJK SC",serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fill = tint === 'crimson' ? '#d43326' : tint === 'jade' ? '#d4ded8' : '#efe7d6';
  const step = size * 1.04;
  for (let i = 0; i < text.length; i++) {
    const cy = i * step;
    const jitterX = (i % 2 === 0 ? -1 : 1) * 2.1;
    ctx.lineWidth = Math.max(3, size * 0.16);
    ctx.strokeStyle = '#0f0e0e';
    ctx.lineJoin = 'round';
    ctx.strokeText(text[i], jitterX, cy);
    ctx.fillStyle = fill;
    ctx.fillText(text[i], jitterX, cy);
  }
  ctx.restore();
}

/** Draws a glowing cinnabar/ink highlight halo around an interactive object */
export function drawHighlightAura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  pulse: number,
  isCrimson = true
) {
  ctx.save();
  const col = isCrimson ? 'rgba(206, 46, 36,' : 'rgba(226, 186, 114,';
  const grad = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.15, cx, cy, Math.max(rx, ry));
  grad.addColorStop(0, `${col} ${0.24 + pulse * 0.12})`);
  grad.addColorStop(0.65, `${col} ${0.11 + pulse * 0.07})`);
  grad.addColorStop(1, `${col} 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = isCrimson
    ? `rgba(232, 78, 62, ${0.72 + pulse * 0.22})`
    : `rgba(244, 212, 152, ${0.72 + pulse * 0.22})`;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.84, ry * 0.84, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Republican-era illustrated-book key-fret corner ornament (民国连环画回纹角框) */
export function drawRepublicanFrameCorners(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const m = 10;
  const s = 22;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const corners: Array<[number, number, number, number]> = [
    [m, m, 1, 1],
    [w - m, m, -1, 1],
    [m, h - m, 1, -1],
    [w - m, h - m, -1, -1]
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * s);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * s, y);
    ctx.moveTo(x + dx * 6, y + dy * (s - 6));
    ctx.lineTo(x + dx * 6, y + dy * 6);
    ctx.lineTo(x + dx * (s - 6), y + dy * 6);
    ctx.stroke();
  }
  ctx.restore();
}
