import type { GameState } from '../../data/types';
import type { EerieEventController, EerieSnapshot } from './eerieEvents';
import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  CINNABAR_DARK,
  INK,
  drawComicSfx,
  drawHighlightAura,
  drawInkWashBlot,
  drawRedSeal,
  drawVerticalCalligraphy,
  dryBrushLine,
  inkLine,
  inkPoly,
  inkRect,
  lerpColor
} from './textures';

export interface EnvDrawState {
  state: GameState;
  darkness: number; // 0 = day (Xuan paper), 1 = night (Sumi ink)
  night: boolean;
  third: boolean; // D3 night
  atSite: boolean;
  steps: string[];
  opening: number; // 0 = closed/sealed, 1 = ajar
  seconds: number;
  slow: boolean;
  patterns: ComicPatterns;
  highlightedKey: string | null;
  eerie: EerieSnapshot;
  eerieCtrl: EerieEventController;
}

const SHOP_CACHE_OFFSET_X = -140;
const SHOP_CACHE_OFFSET_Y = -80;
const SHOP_CACHE_W = 1880;
const SHOP_CACHE_H = 980;

interface ShopStaticCacheEntry {
  key: string;
  canvas: HTMLCanvasElement;
}

const shopStaticCacheMap = new WeakMap<ComicPatterns, ShopStaticCacheEntry>();

function drawShopStaticArchitecture(
  ctx: CanvasRenderingContext2D,
  darkness: number,
  patterns: ComicPatterns,
  stockCount: number,
  tallCabinet: boolean
) {
  // 1. 宣纸水墨斑驳老墙 (Aged Xuan-paper ivory by day -> deep wet sumi-ink by night)
  const wallTop = lerpColor('#b9b09b', '#121416', darkness);
  const wallMid = lerpColor('#d5ccb8', '#1f2326', darkness);
  const wallBot = lerpColor('#a39a87', '#0f1214', darkness);
  const wallGrad = ctx.createLinearGradient(0, 0, 0, 560);
  wallGrad.addColorStop(0, wallTop);
  wallGrad.addColorStop(0.5, wallMid);
  wallGrad.addColorStop(1, wallBot);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(-140, -80, 1880, 680);

  // Subtle horizontal Republican engraving lines across the plaster wall
  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.24 + darkness * 0.16;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(-140, -80, 1880, 540);
    ctx.restore();
  }

  // Organic wet-on-wet sumi ink wash clouds & damp plaster stains (破墨晕染)
  const blotAlpha = 0.14 + darkness * 0.22;
  drawInkWashBlot(ctx, 250, 210, 118, 62, blotAlpha);
  drawInkWashBlot(ctx, 585, 172, 86, 44, blotAlpha);
  drawInkWashBlot(ctx, 1038, 244, 104, 68, blotAlpha);
  drawInkWashBlot(ctx, 1468, 218, 128, 86, blotAlpha);

  if (patterns.halftoneDark) {
    ctx.save();
    ctx.globalAlpha = 0.22 + darkness * 0.2;
    ctx.fillStyle = patterns.halftoneDark;
    ctx.fillRect(-140, -80, 1880, 215);
    ctx.restore();
  }

  // Dry-brush weathered plaster cracks (飞白墙皮裂纹)
  dryBrushLine(ctx, 318, 166, 304, 202, 1.8, INK, 0.45);
  dryBrushLine(ctx, 304, 202, 314, 236, 1.3, INK, 0.35);
  dryBrushLine(ctx, 986, 152, 1002, 190, 1.9, INK, 0.45);
  dryBrushLine(ctx, 1002, 190, 991, 232, 1.4, INK, 0.35);
  dryBrushLine(ctx, 991, 232, 1008, 260, 1.1, INK, 0.28);

  // Lower monochrome timber wainscot paneling (深墨木护墙板)
  const wainscot = lerpColor('#35332f', '#141719', darkness);
  inkRect(ctx, -140, 448, 1880, 115, wainscot, 2.2, patterns.woodcutV);
  inkRect(ctx, -140, 440, 1880, 14, lerpColor('#524e47', '#24282b', darkness), 2.1);

  // 2. 透视线描木地板 (Perspective Woodcut Floorboards)
  const floorTop = lerpColor('#47433c', '#16191b', darkness);
  const floorBot = lerpColor('#262420', '#0c0e0f', darkness);
  const floorGrad = ctx.createLinearGradient(0, 520, 0, 760);
  floorGrad.addColorStop(0, floorTop);
  floorGrad.addColorStop(1, floorBot);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(-140, 520, 1880, 380);
  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(-140, 520, 1880, 220);
    ctx.restore();
  }
  for (let i = -4; i <= 14; i++) {
    const xTop = 100 + i * 115;
    const xBot = (xTop - 800) * 1.48 + 800;
    inkLine(ctx, xTop, 520, xBot, 720, 1.6, 'rgba(12, 11, 11, 0.62)');
  }
  for (const fy of [548, 580, 616]) {
    inkLine(ctx, -140, fy, 1740, fy, 1.2, 'rgba(12, 11, 11, 0.38)');
  }

  // 4. 承重木柱、石柱础与屋顶檩梁 (Sumi-ink carved pillars & rafters)
  const woodBeam = lerpColor('#242220', '#0e1012', darkness);
  const woodPillar = lerpColor('#32302c', '#16191b', darkness);
  for (const px of [58, 332, 574, 1094, 1492]) {
    inkRect(ctx, px - 15, 104, 30, 424, woodPillar, 2.3, patterns.woodcutV);
    // Fine ivory edge highlight on pillar (线描留白边)
    inkLine(ctx, px - 12, 118, px - 12, 500, 1.0, 'rgba(236, 230, 216, 0.16)');
    inkPoly(
      ctx,
      [
        [px - 22, 526],
        [px + 22, 526],
        [px + 18, 504],
        [px - 18, 504]
      ],
      lerpColor('#8c887d', '#3e4244', darkness),
      2.0
    );
    inkPoly(
      ctx,
      [
        [px - 36, 114],
        [px + 36, 114],
        [px + 24, 134],
        [px - 24, 134]
      ],
      lerpColor('#45423c', '#1f2326', darkness),
      2.0
    );
  }

  // Ceiling rafters + aged yellow beam charms + cobwebs
  inkRect(ctx, -140, -60, 1880, 142, lerpColor('#1b1a18', '#0a0b0c', darkness), 0, patterns.hatchDense);
  inkRect(ctx, -140, 82, 1880, 34, woodBeam, 2.6);
  for (const rx of [160, 440, 760, 1080, 1380]) {
    inkPoly(
      ctx,
      [
        [rx - 14, -40],
        [rx + 14, -40],
        [rx + 22, 82],
        [rx - 22, 82]
      ],
      lerpColor('#262422', '#0e1113', darkness),
      2.2
    );
  }

  // Aged yellow talismans tucked under crossbeam (梁间旧朱砂符)
  for (const bx of [390, 1138]) {
    inkRect(ctx, bx, 112, 18, 36, lerpColor('#dfd0a4', '#6d6959', darkness), 1.5);
    inkLine(ctx, bx + 9, 118, bx + 9, 142, 1.6, lerpColor(CINNABAR, '#8a231c', darkness));
  }

  // Delicate ink cobwebs in dark corners
  ctx.save();
  ctx.strokeStyle = 'rgba(224, 220, 210, 0.16)';
  ctx.lineWidth = 0.9;
  for (const cx of [347, 1079]) {
    const dir = cx < 600 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx, 116);
    ctx.lineTo(cx + dir * 48, 116);
    ctx.moveTo(cx, 116);
    ctx.lineTo(cx + dir * 34, 152);
    ctx.moveTo(cx, 116);
    ctx.lineTo(cx, 166);
    ctx.moveTo(cx + dir * 24, 116);
    ctx.quadraticCurveTo(cx + dir * 16, 134, cx, 142);
    ctx.stroke();
  }
  ctx.restore();

  // 5. 「纸马纸扎」焦墨金字横匾 & 朱砂点睛对联
  inkRect(ctx, 646, 118, 268, 54, lerpColor('#1d1b1a', '#131415', darkness), 2.6);
  ctx.strokeStyle = lerpColor('#ded4be', '#8f8b80', darkness);
  ctx.lineWidth = 1.4;
  ctx.strokeRect(652, 124, 256, 42);
  ctx.save();
  ctx.font = '700 30px "Songti SC","STSong","Noto Serif CJK SC",SimSun,serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  ctx.fillText('纸  马  纸  扎', 782, 147);
  ctx.fillStyle = lerpColor('#f5eedc', '#e0dacb', darkness);
  ctx.fillText('纸  马  纸  扎', 780, 145);
  ctx.restore();
  drawRedSeal(ctx, 672, 145, 16, '老');

  // Cinnabar vertical couplets — piercing red accent against monochrome ink walls!
  const coupletFill = lerpColor('#8f2018', '#521513', darkness);
  const coupletInk = lerpColor('#f6eedc', '#e1d7c4', darkness);
  inkRect(ctx, 556, 212, 36, 188, coupletFill, 2.2);
  drawVerticalCalligraphy(ctx, '老号纸活', 574, 240, 44, 22, coupletInk, INK);

  inkRect(ctx, 1076, 212, 36, 188, coupletFill, 2.2);
  drawVerticalCalligraphy(ctx, '诸事平安', 1094, 240, 44, 22, coupletInk, INK);

  // 6. 左侧百子纸柜 (Monochrome cabinet with pale paper rolls + occasional red wedding paper!)
  drawPaperCabinet(ctx, darkness, patterns, stockCount, tallCabinet);
}

function getShopStaticCanvas(
  darkness: number,
  patterns: ComicPatterns,
  stockCount: number,
  tallCabinet: boolean
): HTMLCanvasElement | null {
  // 昼夜渐变过渡帧（0.005 < darkness < 0.995）直绘避免频繁重建离屏画布；稳态昼/夜全程复用离屏缓存
  if (darkness > 0.005 && darkness < 0.995) return null;
  if (typeof document === 'undefined') return null;

  const snappedDarkness = darkness >= 0.995 ? 1 : 0;
  const key = `${snappedDarkness}|${stockCount}|${tallCabinet ? 1 : 0}`;
  const cached = shopStaticCacheMap.get(patterns);
  if (cached && cached.key === key) return cached.canvas;

  const off = cached?.canvas ?? document.createElement('canvas');
  if (off.width !== SHOP_CACHE_W || off.height !== SHOP_CACHE_H) {
    off.width = SHOP_CACHE_W;
    off.height = SHOP_CACHE_H;
  }
  const octx = off.getContext('2d');
  if (!octx) return null;
  octx.setTransform(1, 0, 0, 1, 0, 0);
  octx.clearRect(0, 0, SHOP_CACHE_W, SHOP_CACHE_H);
  octx.translate(-SHOP_CACHE_OFFSET_X, -SHOP_CACHE_OFFSET_Y);
  drawShopStaticArchitecture(octx, snappedDarkness, patterns, stockCount, tallCabinet);
  shopStaticCacheMap.set(patterns, { key, canvas: off });
  return off;
}

/**
 * Layer 0 & 1: Monochrome Xuan-Paper & Sumi-Ink Backdrop, Stepped Lattice Windows,
 * Republican Engraving Timber Beams, Plaque, Cinnabar Couplets, Baizi Paper Cabinet & Wooden Door
 */
export function drawShopBackdrop(ctx: CanvasRenderingContext2D, env: EnvDrawState) {
  const { state, darkness, night, third, atSite, steps, opening, patterns, highlightedKey } = env;
  const stockCount = Math.min(12, Math.max(0, state.s * 2));
  const tallCabinet = state.upgrades.includes('tall_cabinet');

  // 1/2/4/5/6. 稳态昼/夜复用离屏建筑缓存，一次 drawImage 贴完墙面、地板、柱梁、匾额对联与百子纸柜
  const cachedBase = getShopStaticCanvas(darkness, patterns, stockCount, tallCabinet);
  if (cachedBase) {
    ctx.drawImage(cachedBase, SHOP_CACHE_OFFSET_X, SHOP_CACHE_OFFSET_Y);
  } else {
    drawShopStaticArchitecture(ctx, darkness, patterns, stockCount, tallCabinet);
  }

  // 3. 左右步步锦木格窗 (Xuan-paper daylight / Bone-white full moon + Dynamic Window Phenomena!)
  drawLatticeWindow(ctx, 362, 212, 182, 206, env, false);
  drawLatticeWindow(ctx, 608, 198, 344, 232, env, true);

  // Slanted silver-white window light beam (斜照宣纸白光 / 惨白月光)
  ctx.save();
  const beamRGB = night ? '224, 232, 226' : '252, 246, 230';
  const beamGrad = ctx.createLinearGradient(780, 210, 620, 610);
  beamGrad.addColorStop(0, `rgba(${beamRGB}, ${night ? 0.14 : 0.24})`);
  beamGrad.addColorStop(0.7, `rgba(${beamRGB}, ${night ? 0.07 : 0.11})`);
  beamGrad.addColorStop(1, `rgba(${beamRGB}, 0)`);
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(615, 205);
  ctx.lineTo(945, 205);
  ctx.lineTo(840, 610);
  ctx.lineTo(440, 610);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawHangingGarlands(ctx, env);

  // 7. 右侧老木门、铜环、告示、镇门符、门缝眼与叩门涟漪
  drawShopDoor(ctx, env, highlightedKey === 'door', opening, steps, atSite, third, night, state);
}

function drawLatticeWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  env: EnvDrawState,
  isMain: boolean
) {
  const { state, darkness, night, seconds, slow, patterns, eerie, eerieCtrl } = env;
  const highThreat = state.phase === 'site' && state.threat >= 3;

  ctx.save();
  // Monochrome ink sky: aged Xuan bone-white by day, deep sumi ink by night
  const skyTop = lerpColor('#d5cdb8', highThreat ? '#1a1113' : '#101417', darkness);
  const skyBot = lerpColor('#eee8d6', highThreat ? '#32181a' : '#283033', darkness);
  const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Horizontal woodblock sky lines (民国版画天空横纹)
  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(x, y, w, h * 0.65);
    ctx.restore();
  }

  // Stark pale-bone full moon at night (crimson-rimmed during high threat!)
  if (isMain && darkness > 0.25) {
    const mx = x + w * 0.72;
    const my = y + h * 0.32;
    const mr = 39;
    ctx.save();
    ctx.globalAlpha = Math.min(1, darkness * 1.15);
    const moonGlow = ctx.createRadialGradient(mx, my, mr * 0.45, mx, my, mr * 2.5);
    moonGlow.addColorStop(0, highThreat ? 'rgba(216, 56, 44, 0.38)' : 'rgba(232, 236, 228, 0.34)');
    moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(mx, my, mr * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = highThreat ? '#f2d6c8' : '#f2efe4';
    ctx.strokeStyle = highThreat ? CINNABAR : '#9ba39e';
    ctx.lineWidth = highThreat ? 3 : 1.4;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ink-wash clouds drifting across the moon
    const drift = slow ? 0 : Math.sin(seconds * 0.22) * 18;
    ctx.fillStyle = 'rgba(14, 16, 18, 0.6)';
    ctx.beginPath();
    ctx.ellipse(mx - 22 + drift, my + 16, 50, 9.5, -0.05, 0, Math.PI * 2);
    ctx.ellipse(mx + 26 - drift * 0.6, my - 18, 38, 7.5, 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Distant ink-wash tiled roofs & village gables (水墨远景青瓦飞檐)
  const roofColor = lerpColor('#3f3d38', '#0c0e10', darkness);
  inkPoly(
    ctx,
    [
      [x - 10, y + h + 4],
      [x - 10, y + h - 42],
      [x + w * 0.35, y + h - 68],
      [x + w * 0.42, y + h - 54],
      [x + w * 0.72, y + h - 74],
      [x + w + 10, y + h - 48],
      [x + w + 10, y + h + 4]
    ],
    roofColor,
    1.8
  );

  // Dry-brush gnarled willow branch & swaying ink strands outside window
  const sway = slow ? 0 : Math.sin(seconds * 0.9) * 6 + eerie.windGust * 22;
  ctx.strokeStyle = lerpColor('#232220', '#090b0c', darkness);
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 36);
  ctx.quadraticCurveTo(x + w * 0.24, y + 18, x + w * 0.44, y + 54);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const bx = x + 28 + i * 32;
    const by = y + 30 + (i % 2) * 14;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 4 + sway * 0.6, by + 48, bx + sway, by + 96);
    ctx.stroke();
  }

  // Dynamic Eerie Micro-Events on Main Window: Passing Shadow Silhouette & Ink Palm Print!
  if (isMain) {
    eerieCtrl.drawWindowPhenomena(ctx, x, y, w, h, eerie, night);
  }

  // Persistent ominous shadow outside when Yin >= 10 or watchedTonight
  if (isMain && night && (state.h >= 10 || state.watchedTonight)) {
    ctx.save();
    ctx.globalAlpha = 0.26 + (slow ? 0 : Math.sin(seconds * 1.3) * 0.08);
    ctx.fillStyle = '#08090a';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.26, y + h * 0.56, 21, 27, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.26, y + h * 0.92, 44, 54, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (patterns.halftoneDark) {
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = patterns.halftoneDark;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();

  // Traditional stepped lattice mullions (步步锦墨线窗棂)
  const frameColor = lerpColor('#242220', '#121517', darkness);
  const cols = isMain ? 6 : 3;
  for (let i = 1; i < cols; i++) {
    const gx = x + (w / cols) * i;
    inkRect(ctx, gx - 2.6, y + 6, 5.2, h - 12, frameColor, 1.2);
  }
  for (const frac of [0.28, 0.62]) {
    inkRect(ctx, x + 6, y + h * frac - 2.6, w - 12, 5.2, frameColor, 1.2);
  }
  for (const [cx, cy] of [
    [x + 12, y + 12],
    [x + w - 34, y + 12],
    [x + 12, y + h - 34],
    [x + w - 34, y + h - 34]
  ]) {
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 2.6;
    ctx.strokeRect(cx, cy, 22, 22);
  }

  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 11;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(x - 5.5, y - 5.5, w + 11, h + 11);
  ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);

  inkRect(ctx, x - 14, y + h + 4, w + 28, 13, lerpColor('#3f3c37', '#1d2124', darkness), 2.1);
  ctx.restore();
}

function drawHangingGarlands(ctx: CanvasRenderingContext2D, env: EnvDrawState) {
  const { seconds, slow, darkness, eerie } = env;
  const items = [
    { x: 292, y: 112, len: 86, pale: true },
    { x: 604, y: 112, len: 74, pale: false },
    { x: 960, y: 112, len: 78, pale: true },
    { x: 1456, y: 112, len: 88, pale: false }
  ];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const sway = slow ? 0 : Math.sin(seconds * 0.95 + i * 1.7) * 0.055 + eerie.windGust * 0.24;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(sway);
    inkLine(ctx, 0, 0, 0, it.len, 1.4, lerpColor('#6f6a5f', '#4a5052', darkness));
    for (let k = 0; k < 3; k++) {
      const cy = 22 + k * 24;
      const fill = it.pale
        ? lerpColor('#ede6d4', '#b8beb8', darkness)
        : lerpColor('#d5cab2', '#8f9692', darkness);
      inkPoly(ctx, [[0, cy - 9], [10, cy], [0, cy + 9], [-10, cy]], fill, 1.6);
    }
    inkPoly(
      ctx,
      [[-3.5, it.len], [3.5, it.len], [6, it.len + 22], [-6, it.len + 22]],
      lerpColor(CINNABAR, '#6d1c18', darkness),
      1.5
    );
    ctx.restore();
  }
}

function drawPaperCabinet(
  ctx: CanvasRenderingContext2D,
  darkness: number,
  patterns: ComicPatterns,
  stockCount: number,
  tallCabinet: boolean
) {
  const x = 92;
  const y = 248;
  const w = 224;
  const h = 282;

  const cabBack = lerpColor('#1d1c1a', '#0c0e10', darkness);
  const cabWood = lerpColor('#3f3c36', '#1e2225', darkness);
  inkRect(ctx, x, y, w, h, cabBack, 2.6, patterns.hatchDense);

  const shelfYs = [y, y + 72, y + 148, y + 220, y + h - 10];
  for (const sy of shelfYs) {
    inkRect(ctx, x - 6, sy, w + 12, 11, cabWood, 2.1);
  }
  inkRect(ctx, x, y, 10, h, cabWood, 2.0);
  inkRect(ctx, x + w / 2 - 5, y, 10, h, cabWood, 2.0);
  inkRect(ctx, x + w - 10, y, 10, h, cabWood, 2.0);

  // Stock paper rolls: mostly Xuan bone-white / aged parchment + single cinnabar accent roll!
  const rollColors = [
    lerpColor('#ede5d3', '#b8bdb7', darkness),
    lerpColor('#d8cfb9', '#949b97', darkness),
    lerpColor('#a8281e', '#6d1c18', darkness), // One vivid cinnabar red wedding paper pack
    lerpColor('#c6beac', '#7d8582', darkness)
  ];

  let drawn = 0;
  for (let row = 0; row < 3; row++) {
    const sy = shelfYs[row + 1] - 2;
    for (let slot = 0; slot < 4; slot++) {
      if (drawn >= stockCount) break;
      const sx = x + 16 + (slot >= 2 ? w / 2 - 4 : 0) + (slot % 2) * 44;
      const col = rollColors[(row * 3 + slot) % rollColors.length];
      inkRect(ctx, sx, sy - 34, 36, 34, col, 1.8);
      inkLine(ctx, sx, sy - 22, sx + 36, sy - 22, 1.0, 'rgba(16,15,15,0.45)');
      inkLine(ctx, sx, sy - 11, sx + 36, sy - 11, 1.0, 'rgba(16,15,15,0.45)');
      inkLine(ctx, sx + 18, sy - 34, sx + 18, sy, 1.8, '#2b2824');
      drawn++;
    }
  }

  // Miniature white paper funeral house on cabinet top (白纸小楼 + 朱砂屋顶)
  const houseX = x + 36;
  const houseY = y - 62;
  inkRect(ctx, houseX, houseY + 20, 62, 42, lerpColor('#efe8d6', '#afb6b2', darkness), 2.0);
  inkPoly(
    ctx,
    [
      [houseX - 10, houseY + 22],
      [houseX + 31, houseY - 4],
      [houseX + 72, houseY + 22]
    ],
    lerpColor('#8f221a', '#531816', darkness),
    2.2
  );
  inkRect(ctx, houseX + 22, houseY + 34, 18, 28, '#191817', 1.7);

  // P2 #10 铺面升级视觉：扩建百子珍料纸柜（加高珍料层 + 朱砂画卷）
  if (tallCabinet) {
    inkRect(ctx, x - 4, y - 82, w + 8, 12, cabWood, 2.1);
    for (let i = 0; i < 4; i++) {
      const rx = x + 18 + i * 50;
      inkRect(ctx, rx, y - 104, 34, 22, i % 2 === 0 ? CINNABAR : '#ece3ce', 1.8);
      inkLine(ctx, rx + 17, y - 104, rx + 17, y - 82, 1.5, INK);
    }
  }

  // Paste jar
  inkPoly(
    ctx,
    [
      [x + 150, y - 24],
      [x + 190, y - 24],
      [x + 184, y],
      [x + 156, y]
    ],
    lerpColor('#68645c', '#33383b', darkness),
    2.0
  );
  inkLine(ctx, x + 170, y - 24, x + 184, y - 48, 2.8, '#d4cab6');
}

function drawShopDoor(
  ctx: CanvasRenderingContext2D,
  env: EnvDrawState,
  highlighted: boolean,
  opening: number,
  steps: string[],
  atSite: boolean,
  third: boolean,
  night: boolean,
  state: GameState
) {
  const { darkness, seconds, slow, patterns, eerie, eerieCtrl } = env;
  const dx = 1166;
  const dy = 186;
  const dw = 266;
  const dh = 342;

  ctx.save();

  if (highlighted) {
    drawHighlightAura(ctx, dx + dw / 2, dy + dh / 2, 160, 195, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  const alleyGrad = ctx.createLinearGradient(dx, dy, dx, dy + dh);
  alleyGrad.addColorStop(0, night ? '#060809' : '#b8b09d');
  alleyGrad.addColorStop(1, night ? '#111619' : '#7b7466');
  inkRect(ctx, dx, dy, dw, dh, alleyGrad, 2.3);

  const jambColor = lerpColor('#262421', '#111416', darkness);
  const thresholdColor = lerpColor('#1c1a18', '#0c0e10', darkness);

  const crackW = Math.round(opening * 34);
  const leftLeafW = dw / 2 - crackW * 0.4;
  const rightLeafX = dx + dw / 2 + crackW * 0.6;
  const rightLeafW = dw / 2 - crackW * 0.6;

  const doorWood = lerpColor('#46423b', '#1b1f22', darkness);
  const doorWoodAlt = lerpColor('#3b3832', '#161a1c', darkness);

  inkRect(ctx, dx + 6, dy + 8, leftLeafW - 6, dh - 14, doorWood, 2.3, patterns.woodcutV);
  for (let i = 1; i < 4; i++) {
    inkLine(
      ctx,
      dx + 6 + ((leftLeafW - 6) / 4) * i,
      dy + 8,
      dx + 6 + ((leftLeafW - 6) / 4) * i,
      dy + dh - 6,
      1.3,
      'rgba(12,11,11,0.58)'
    );
  }
  inkRect(ctx, rightLeafX, dy + 8, rightLeafW - 6, dh - 14, doorWoodAlt, 2.3, patterns.woodcutV);
  for (let i = 1; i < 4; i++) {
    inkLine(
      ctx,
      rightLeafX + ((rightLeafW - 6) / 4) * i,
      dy + 8,
      rightLeafX + ((rightLeafW - 6) / 4) * i,
      dy + dh - 6,
      1.3,
      'rgba(12,11,11,0.58)'
    );
  }

  for (const by of [dy + 42, dy + 172, dy + dh - 36]) {
    inkRect(ctx, dx + 8, by, leftLeafW - 10, 12, jambColor, 1.9);
    inkRect(ctx, rightLeafX + 2, by, rightLeafW - 10, 12, jambColor, 1.9);
  }

  // Oxidized brass / pale ink-ring knockers
  const brass = lerpColor('#d1c4a2', '#8e8a7d', darkness);
  for (const kx of [dx + leftLeafW - 28, rightLeafX + 28]) {
    ctx.fillStyle = lerpColor('#383530', '#242729', darkness);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(kx, dy + 158, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = brass;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(kx, dy + 174, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(kx, dy + 174, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dynamic Eerie Micro-Event: Unseen Door Knock Ripples! (无形叩门涟漪)
  eerieCtrl.drawDoorKnockOverlay(ctx, dx + dw * 0.5, dy + 168, eerie);

  // D4 Watched Door: Peeking eye inside pitch-black door slit
  const showPeekingEyes =
    night &&
    state.day === 4 &&
    state.watchedTonight &&
    !steps.includes('ward_door') &&
    !steps.includes('done') &&
    crackW > 12;

  if (showPeekingEyes) {
    const cx = dx + leftLeafW + crackW * 0.5;
    const cy = dy + 148;
    ctx.save();
    ctx.fillStyle = '#f4f6f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.min(11, crackW * 0.42), 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#090808';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 0.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawComicSfx(ctx, '叩、叩…', dx + dw + 14, dy + 88, 18, 0.78, 'crimson', 0.08);
  } else if (night && opening > 0.5 && atSite) {
    drawComicSfx(ctx, '吱呀…', dx + dw + 12, dy + 76, 17, 0.48, 'bone', 0.06);
  }

  inkRect(ctx, dx - 12, dy - 16, dw + 24, 24, jambColor, 2.5);
  inkRect(ctx, dx - 10, dy, 16, dh, jambColor, 2.3);
  inkRect(ctx, dx + dw - 6, dy, 16, dh, jambColor, 2.3);
  inkRect(ctx, dx - 14, dy + dh - 8, dw + 28, 16, thresholdColor, 2.3);

  // P2 #10 铺面升级视觉：门梁镇魂铜铃 (Swinging Bronze Spirit-Bell under lintel!)
  if (state.upgrades.includes('copper_bell')) {
    const bellSway = slow ? 0 : Math.sin(seconds * 1.8) * 0.08 + eerie.windGust * 0.25;
    ctx.save();
    ctx.translate(dx + dw * 0.5, dy + 8);
    ctx.rotate(bellSway);
    inkLine(ctx, 0, 0, 0, 14, 2, CINNABAR);
    inkPoly(ctx, [[-11, 14], [11, 14], [16, 36], [-16, 36]], '#d5c18a', 2.2);
    inkLine(ctx, -12, 26, 12, 26, 1.4, INK);
    inkPoly(ctx, [[-4, 36], [4, 36], [7, 56], [-7, 56]], CINNABAR, 1.6);
    ctx.restore();
  }

  // P2 #10 铺面升级视觉：玄铁镇门闩 (Heavy Forged Iron Bolt + Cinnabar Ward Studs!)
  if (state.upgrades.includes('iron_bolt')) {
    inkRect(ctx, dx + 26, dy + 224, dw - 52, 16, '#1a1c1e', 2.4);
    for (const sx of [dx + 44, dx + dw * 0.5, dx + dw - 44]) {
      ctx.fillStyle = CINNABAR;
      ctx.beginPath();
      ctx.arc(sx, dy + 232, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // D4 Night: Creeping wet sumi-ink puddle under threshold
  if (night && state.day === 4 && !steps.includes('done')) {
    drawInkWashBlot(ctx, dx + dw * 0.44, dy + dh + 22, 152, 26, 0.85, '8, 12, 14');
    ctx.save();
    ctx.strokeStyle = 'rgba(210, 222, 218, 0.38)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(dx + dw * 0.44, dy + dh + 22, 108, 14, -0.05, 0.2, Math.PI - 0.3);
    ctx.stroke();
    ctx.restore();
  }

  // 镇门纸 / 封门朱砂符
  const showDoorSeal = (third || state.day === 4) && (steps.includes('done') || steps.includes('ward_door'));
  if (showDoorSeal) {
    ctx.save();
    ctx.translate(dx + dw * 0.5, dy + 168);
    ctx.rotate(-0.42);
    inkRect(ctx, -20, -64, 40, 128, '#ead799', 2.2);
    ctx.strokeStyle = CINNABAR;
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -56, 28, 112);
    drawVerticalCalligraphy(ctx, '镇门敕令', 0, -34, 24, 17, CINNABAR);
    drawRedSeal(ctx, 0, 44, 18, '封');
    ctx.restore();
  }

  // 抽查告示
  if (state.audit) {
    ctx.save();
    ctx.translate(dx - 2, dy + 110);
    ctx.rotate(0.05);
    inkRect(ctx, -24, -36, 48, 72, '#f2ecdc', 2.0);
    drawVerticalCalligraphy(ctx, '抽查', 4, -14, 24, 16, INK);
    drawRedSeal(ctx, -9, 18, 16, '查');
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Layer 2.5: Three Hanging Silk Lanterns (一点朱砂红灯笼 — swaying with cold drafts & dimming!)
 */
export function drawHangingLanterns(ctx: CanvasRenderingContext2D, env: EnvDrawState) {
  const { third, steps, darkness, seconds, slow, highlightedKey, eerie } = env;
  const positions = [
    { x: 468, y: 212, cordLen: 104, scale: 0.92 },
    { x: 780, y: 234, cordLen: 126, scale: 1.0 },
    { x: 1012, y: 216, cordLen: 108, scale: 0.94 }
  ];

  positions.forEach((p, idx) => {
    const isThirdLamp = idx === 2;
    const off = third && isThirdLamp;
    const secured = off && steps.includes('lamp');
    const dimFactor = 1 - eerie.lanternDim;
    const breath = slow ? 0 : Math.sin(seconds * 1.15 + idx * 1.9) * 0.08;
    const sway =
      slow
        ? 0
        : Math.sin(seconds * 0.85 + idx * 1.6) * (off && !secured ? 0.055 : 0.024) + eerie.windGust * 0.14;

    ctx.save();
    ctx.translate(p.x, p.y - p.cordLen);
    ctx.rotate(sway);

    inkLine(ctx, 0, 0, 0, p.cordLen - 38 * p.scale, 2.0, INK);

    ctx.translate(0, p.cordLen);
    ctx.scale(p.scale, p.scale);

    if (isThirdLamp && highlightedKey === 'lamp') {
      drawHighlightAura(ctx, 0, 0, 74, 86, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
    }

    if (!off) {
      const glowR = (128 + darkness * 44 + breath * 14) * (0.76 + dimFactor * 0.24);
      const g = ctx.createRadialGradient(0, 0, 12, 0, 0, glowR);
      g.addColorStop(0, `rgba(255, 206, 148, ${(0.34 + darkness * 0.22 + breath * 0.08) * dimFactor})`);
      g.addColorStop(0.45, `rgba(204, 46, 34, ${(0.22 + darkness * 0.16) * dimFactor})`);
      g.addColorStop(1, 'rgba(204, 46, 34, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();
    } else if (!secured) {
      drawInkWashBlot(ctx, 0, 0, 86, 86, 0.58, '7, 8, 9');
    }

    const bodyGrad = ctx.createRadialGradient(0, -4, 4, 0, 0, 44);
    if (off) {
      bodyGrad.addColorStop(0, secured ? '#45433f' : '#3a2928');
      bodyGrad.addColorStop(0.7, secured ? '#262625' : '#1f191a');
      bodyGrad.addColorStop(1, '#100f10');
    } else {
      bodyGrad.addColorStop(0, dimFactor < 0.65 ? '#e4a472' : '#ffe8be');
      bodyGrad.addColorStop(0.45, '#d64532');
      bodyGrad.addColorStop(0.85, '#9b2019');
      bodyGrad.addColorStop(1, '#581210');
    }

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = off ? 'rgba(14, 12, 12, 0.78)' : 'rgba(66, 14, 12, 0.68)';
    ctx.lineWidth = 1.5;
    for (const rx of [-22, 0, 22]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.abs(rx) || 0.1, 33, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    inkRect(ctx, -18, -39, 36, 9, '#191716', 2.0);
    inkRect(ctx, -15, 31, 30, 8, '#191716', 2.0);

    if (!off) {
      ctx.fillStyle = 'rgba(54, 12, 10, 0.66)';
      ctx.font = '700 18px "Songti SC","STSong",serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idx === 0 ? '纸' : idx === 1 ? '火' : '安', 0, 1);
    }

    if (secured) {
      ctx.save();
      ctx.rotate(-0.22);
      inkRect(ctx, -46, -8, 92, 16, '#f4ecdc', 2.0);
      inkLine(ctx, -38, 0, 38, 0, 1.4, CINNABAR);
      drawRedSeal(ctx, 0, 0, 13, '定');
      ctx.restore();
    } else if (off) {
      drawComicSfx(ctx, '滋…', 56, -26, 17, 0.68, 'crimson', 0.12);
    }

    const tasselSway = -sway * 1.4;
    ctx.save();
    ctx.translate(0, 39);
    ctx.rotate(tasselSway);
    inkLine(ctx, 0, 0, 0, 12, 2.2, off ? '#3a2d2c' : CINNABAR);
    inkPoly(ctx, [[-4, 12], [4, 12], [8, 42], [-8, 42]], off ? '#2d2222' : CINNABAR, 1.9);
    ctx.restore();

    ctx.restore();
  });
}

/**
 * Layer 3: Foreground Sumi-Ink Timber Counter & Interactive Props
 */
export function drawCounterAndProps(ctx: CanvasRenderingContext2D, env: EnvDrawState) {
  const { state, darkness, night, steps, seconds, slow, patterns, highlightedKey, eerie, eerieCtrl } = env;

  const topFill = lerpColor('#545048', '#202427', darkness);
  const topEdge = lerpColor('#746f64', '#31373b', darkness);
  const frontFill = lerpColor('#282623', '#111416', darkness);

  inkPoly(
    ctx,
    [
      [-140, 520],
      [1740, 520],
      [1780, 616],
      [-180, 616]
    ],
    topFill,
    2.6,
    INK,
    patterns.woodcutH
  );
  // Crisp highlight along back edge of counter
  inkLine(ctx, -120, 522, 1720, 522, 1.4, 'rgba(240, 236, 224, 0.22)');
  for (const ty of [544, 570, 595]) {
    inkLine(ctx, -120, ty, 1720, ty, 1.1, 'rgba(12, 11, 11, 0.36)');
  }
  inkRect(ctx, -180, 612, 1960, 18, topEdge, 2.5);
  inkRect(ctx, -180, 630, 1960, 320, frontFill, 2.6, patterns.hatchDense);
  for (let px = 80; px < 1600; px += 220) {
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.65)';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(px, 646, 188, 140);
  }

  // 2. 青铜香炉与随阴风折弯的水墨青烟
  drawIncenseBurner(ctx, 332, 548, env);

  // 3. 线装账本 + 渗墨微事件 — Hotspot 'book'
  drawLedgerProp(ctx, 518, 562, night, highlightedKey === 'book', seconds, slow);
  eerieCtrl.drawLedgerBleedOverlay(ctx, 518, 562, eerie);

  // 4. D2 夜里手机与纸牌 — Hotspots 'phone' & 'plaque'
  if (night && state.day === 2) {
    drawPhoneProp(ctx, 694, 560, steps.includes('quiet'), highlightedKey === 'phone', seconds, slow);
    drawPlaqueProp(ctx, 796, 562, steps.includes('identified'), highlightedKey === 'plaque', seconds, slow);
  }

  // 5. 库存纸料堆与朱砂符箓 — Hotspot 'paper'
  drawPaperAndTalismansProp(ctx, 908, 562, state, darkness, highlightedKey === 'paper', seconds, slow);

  // 6. 老剪刀与朱砂砚台 (一点朱砂砚台)
  drawCraftTools(ctx, 1086, 566, darkness);
}

function drawIncenseBurner(ctx: CanvasRenderingContext2D, x: number, y: number, env: EnvDrawState) {
  const { state, darkness, seconds, slow, eerie } = env;
  const upgraded = state.upgrades.includes('jade_censer');
  ctx.save();
  ctx.translate(x, y);

  // Ink-wash smoke ribbons bending sharply during cold drafts (阴风吹折青烟!)
  const gustShift = eerie.windGust * 92;
  const puffCount = upgraded ? 4 : 3;
  for (let i = 0; i < puffCount; i++) {
    const t = slow ? 0.3 + i * 0.2 : (seconds * 0.24 + i * (1 / puffCount)) % 1;
    const alpha = Math.sin(t * Math.PI) * (0.44 + darkness * 0.24);
    const drift = Math.sin(t * 5.2 + i * 2.1) * 16 + gustShift * t;
    const sy = -42 - t * (upgraded ? 245 : 215);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = darkness > 0.4 ? '#d2dbd6' : '#32302d';
    ctx.lineWidth = (upgraded ? 4.4 : 3.5) + t * 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(drift * 0.3, sy + 42);
    ctx.bezierCurveTo(drift - 18, sy + 20, drift + 22, sy - 6, drift * 0.85 + gustShift * 0.25, sy - 28);
    ctx.stroke();
    ctx.restore();
  }

  drawInkWashBlot(ctx, 0, 14, upgraded ? 52 : 44, 12, 0.52, '10, 10, 11');

  inkRect(ctx, -22, 0, 8, 15, '#2b2926', 1.9);
  inkRect(ctx, 14, 0, 8, 15, '#2b2926', 1.9);
  inkRect(ctx, -4, 3, 8, 13, '#1f1e1c', 1.9);

  const bronze = upgraded ? lerpColor('#4d6359', '#2b3d37', darkness) : lerpColor('#545149', '#2f3334', darkness);
  const wScale = upgraded ? 1.18 : 1;
  inkPoly(
    ctx,
    [[-30 * wScale, -18], [30 * wScale, -18], [34 * wScale, -4], [24 * wScale, 6], [-24 * wScale, 6], [-34 * wScale, -4]],
    bronze,
    2.3
  );
  if (upgraded) {
    inkLine(ctx, -28 * wScale, -9, 28 * wScale, -9, 2.2, '#e3d5ac');
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(-32, -14, 8, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(32, -14, 8, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.fillStyle = '#9c988e';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, -18, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Three incense sticks with glowing cinnabar ember tips (香头三点红)
  const emberPulse = slow ? 0.7 : 0.55 + 0.45 * Math.sin(seconds * 2.2);
  for (const [ix, topX, topY] of [
    [-8, -11, -50],
    [0, 0, -54],
    [8, 10, -49]
  ]) {
    inkLine(ctx, ix, -18, topX, topY, 2.2, '#6e685c');
    ctx.fillStyle = `rgba(236, ${Math.round(54 + emberPulse * 38)}, 36, 0.96)`;
    ctx.beginPath();
    ctx.arc(topX, topY, 2.7 + emberPulse * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawLedgerProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  night: boolean,
  highlighted: boolean,
  seconds: number,
  slow: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -2, 86, 48, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  drawInkWashBlot(ctx, 4, 14, 72, 18, 0.52, '10, 10, 11');

  const coverColor = night ? '#15191d' : '#262422';
  const pageLeft = night ? '#272c2f' : '#f1ead8';
  const pageRight = night ? '#212628' : '#e6dec9';

  inkPoly(ctx, [[-64, -18], [64, -18], [76, 18], [-76, 18]], coverColor, 2.4);
  inkPoly(ctx, [[-58, -15], [-2, -13], [-2, 14], [-68, 14]], pageLeft, 1.8);
  inkPoly(ctx, [[2, -13], [58, -15], [68, 14], [2, 14]], pageRight, 1.8);
  inkLine(ctx, 0, -15, 0, 16, 2.2, INK);

  const textCol = night ? '#d5d2c6' : '#1a1918';
  for (let i = 0; i < 4; i++) {
    const lx = -50 + i * 12;
    inkLine(ctx, lx, -10, lx - 3, 9, 1.2, textCol);
    const rx = 14 + i * 12;
    inkLine(ctx, rx, -10, rx + 3, 9, 1.2, i === 1 ? CINNABAR : textCol);
  }
  drawRedSeal(ctx, 44, 2, 11, night ? '阴' : '阳');

  ctx.restore();
}

function drawPhoneProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  quiet: boolean,
  highlighted: boolean,
  seconds: number,
  slow: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -2, 52, 36, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  inkPoly(ctx, [[-20, -14], [18, -16], [24, 12], [-14, 14]], '#161718', 2.2);
  const screenCol = quiet ? '#212325' : '#e6dfd0';
  inkPoly(ctx, [[-15, -10], [14, -12], [19, 8], [-10, 10]], screenCol, 1.5);

  if (!quiet) {
    const g = ctx.createRadialGradient(2, -1, 4, 2, -1, 46);
    g.addColorStop(0, 'rgba(218, 52, 42, 0.34)');
    g.addColorStop(1, 'rgba(218, 52, 42, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(2, -1, 46, 0, Math.PI * 2);
    ctx.fill();

    const blink = slow ? 1 : 0.5 + 0.5 * Math.sin(seconds * 4.5);
    ctx.fillStyle = `rgba(210, 32, 24, ${blink})`;
    ctx.beginPath();
    ctx.arc(-6, -4, 3.2, 0, Math.PI * 2);
    ctx.fill();
    inkLine(ctx, -1, 0, 12, -1, 1.6, INK);
  }

  ctx.restore();
}

function drawPlaqueProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  identified: boolean,
  highlighted: boolean,
  seconds: number,
  slow: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -8, 56, 48, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  inkPoly(ctx, [[-18, -32], [18, -32], [22, 12], [-22, 12]], '#f2ecdc', 2.2);
  ctx.strokeStyle = identified ? '#3a4a44' : CINNABAR;
  ctx.lineWidth = 1.9;
  ctx.strokeRect(-13, -26, 26, 32);
  drawVerticalCalligraphy(ctx, '纸牌', 0, -16, 15, 12, INK);

  ctx.restore();
}

function drawPaperAndTalismansProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: GameState,
  darkness: number,
  highlighted: boolean,
  seconds: number,
  slow: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  if (highlighted) {
    drawHighlightAura(ctx, 8, -8, 92, 54, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  const layers = Math.min(7, Math.max(0, state.s));
  const paperTop = lerpColor('#f4eedf', '#cdd2cc', darkness * 0.6);
  const paperSide = lerpColor('#ccc4b1', '#888f8c', darkness * 0.6);

  if (layers > 0) {
    const stackH = 6 + layers * 4.5;
    drawInkWashBlot(ctx, -10, 14, 60, 14, 0.48, '10, 10, 11');

    inkPoly(
      ctx,
      [
        [-58, 12 - stackH],
        [36, 12 - stackH],
        [44, 16],
        [-50, 16]
      ],
      paperSide,
      2.0
    );
    for (let i = 1; i < layers; i++) {
      const ly = 14 - i * 4.2;
      inkLine(ctx, -53, ly, 40, ly, 0.9, 'rgba(16,15,15,0.48)');
    }
    inkPoly(
      ctx,
      [
        [-52, -16 - stackH * 0.55],
        [32, -16 - stackH * 0.55],
        [38, 10 - stackH * 0.55],
        [-58, 10 - stackH * 0.55]
      ],
      paperTop,
      2.2
    );
    inkLine(ctx, -10, -16 - stackH * 0.55, -10, 15, 2.4, '#2d2a26');
  }

  const hasTalisman = state.items.talisman > 0 || state.day >= 2;
  const hasStrip = state.items.strip > 0;

  if (hasTalisman) {
    ctx.save();
    ctx.translate(58, -2);
    ctx.rotate(0.18);
    inkRect(ctx, -15, -24, 30, 48, '#ecd894', 2.0);
    drawVerticalCalligraphy(ctx, '安神', 0, -9, 16, 12, CINNABAR);
    drawRedSeal(ctx, 0, 15, 10, '符');
    ctx.restore();
  }
  if (hasStrip) {
    ctx.save();
    ctx.translate(36, 8);
    ctx.rotate(-0.35);
    inkRect(ctx, -28, -5, 56, 11, '#f6f1e4', 1.7);
    inkLine(ctx, -22, 0, 22, 0, 1.4, CINNABAR);
    ctx.restore();
  }
  // 护身替纸人缩微纸偶摆在柜台边 (System-redeemed ward doll!)
  if (state.items.wardDoll > 0) {
    ctx.save();
    ctx.translate(-80, -4);
    inkPoly(ctx, [[-10, -24], [10, -24], [16, 14], [-16, 14]], '#f5efe0', 1.8);
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.fill();
    drawRedSeal(ctx, 0, 2, 10, '替');
    ctx.restore();
  }

  ctx.restore();
}

function drawCraftTools(ctx: CanvasRenderingContext2D, x: number, y: number, darkness: number) {
  ctx.save();
  ctx.translate(x, y);

  // Sumi-ink stone with vivid cinnabar pool (朱砂砚)
  ctx.fillStyle = lerpColor('#262422', '#141719', darkness);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(0, 2, 24, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.ellipse(-2, 1, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  inkLine(ctx, -26, 10, 32, -8, 4.0, '#3a3732');
  inkLine(ctx, -26, 10, 32, -8, 1.3, INK);
  inkPoly(ctx, [[30, -8], [44, -12], [33, -4]], CINNABAR, 1.4);

  inkLine(ctx, 56, -12, 96, 8, 2.6, '#484a4c');
  inkLine(ctx, 64, 12, 92, -10, 2.6, '#35383a');
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(54, -14, 6, 0, Math.PI * 2);
  ctx.arc(62, 14, 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export { CINNABAR_DARK };
