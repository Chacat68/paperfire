import type { GameState } from '../../data/types';
import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  INK,
  drawHighlightAura,
  drawInkWashBlot,
  drawRedSeal,
  drawVerticalCalligraphy,
  inkLine,
  inkPoly,
  inkRect
} from './textures';

export type StreetSpotKey = 'grocery' | 'clinic' | 'tailor' | 'alley';

export interface StreetDrawOpts {
  state: GameState;
  seconds: number;
  slow: boolean;
  patterns: ComicPatterns;
  highlightedSpot: StreetSpotKey | null;
}

/**
 * 黑白水墨 · 民国线描「老镇街景」外景
 * 走出纸扎铺后呈现在眼前：青石板老街、马头墙远山、镇集杂货、林氏诊所、柳记裁缝铺与老槐街口。
 */
export function drawStreetBackdrop(ctx: CanvasRenderingContext2D, opts: StreetDrawOpts) {
  const { state, seconds, slow, patterns, highlightedSpot } = opts;
  const sway = slow ? 0 : Math.sin(seconds * 1.6);

  // 1. 宣纸薄雾晴空 (Aged Xuan-paper morning sky)
  const skyGrad = ctx.createLinearGradient(0, -60, 0, 440);
  skyGrad.addColorStop(0, '#c8bfa9');
  skyGrad.addColorStop(0.55, '#dfd6c2');
  skyGrad.addColorStop(1, '#ede5d2');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-160, -80, 1920, 560);

  // Pale morning sun & drifting ink mist clouds
  ctx.save();
  ctx.fillStyle = 'rgba(255, 250, 236, 0.72)';
  ctx.beginPath();
  ctx.arc(1240, 125, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(182, 42, 32, 0.25)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  drawInkWashBlot(ctx, 290, 118, 180, 36, 0.14, '38, 36, 32');
  drawInkWashBlot(ctx, 840, 96, 220, 40, 0.12, '38, 36, 32');
  drawInkWashBlot(ctx, 1340, 152, 170, 32, 0.14, '38, 36, 32');

  // 2. 淡墨远山与远处马头墙剪影 (Layered ink mountains & distant gables)
  inkPoly(
    ctx,
    [
      [-160, 340],
      [60, 210],
      [280, 265],
      [540, 182],
      [810, 248],
      [1120, 190],
      [1420, 245],
      [1760, 200],
      [1760, 420],
      [-160, 420]
    ],
    'rgba(58, 56, 50, 0.34)',
    0
  );
  inkPoly(
    ctx,
    [
      [-160, 370],
      [150, 278],
      [420, 320],
      [690, 268],
      [1010, 315],
      [1310, 258],
      [1760, 310],
      [1760, 450],
      [-160, 450]
    ],
    'rgba(38, 36, 33, 0.42)',
    0
  );

  // Distant horse-head gable roof silhouettes (民国灰瓦马头墙)
  for (const [gx, gy, gw] of [
    [130, 262, 160],
    [520, 252, 140],
    [940, 258, 150],
    [1390, 270, 170]
  ]) {
    inkPoly(
      ctx,
      [
        [gx, gy + 120],
        [gx, gy + 24],
        [gx + 22, gy + 24],
        [gx + 22, gy + 10],
        [gx + gw * 0.5, gy - 8],
        [gx + gw - 22, gy + 10],
        [gx + gw - 22, gy + 24],
        [gx + gw, gy + 24],
        [gx + gw, gy + 120]
      ],
      '#9d9582',
      1.6,
      'rgba(22, 20, 18, 0.55)',
      patterns.woodcutH
    );
  }

  // 3. 青石板老街路面 (Perspective cobblestone street)
  const roadGrad = ctx.createLinearGradient(0, 495, 0, 820);
  roadGrad.addColorStop(0, '#9c9484');
  roadGrad.addColorStop(0.45, '#767063');
  roadGrad.addColorStop(1, '#3b3832');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(-160, 495, 1920, 405);
  inkLine(ctx, -160, 495, 1760, 495, 2.6, INK);
  inkLine(ctx, -160, 506, 1760, 506, 1.4, 'rgba(24, 20, 18, 0.5)');

  // Perspective flagstone grid lines
  for (let row = 0; row < 6; row++) {
    const ry = 524 + row * (26 + row * 7);
    inkLine(ctx, -160, ry, 1760, ry, 1.3, 'rgba(18, 16, 14, 0.45)');
  }
  for (let col = -4; col <= 14; col++) {
    const xTop = 100 + col * 110;
    const xBot = (xTop - 800) * 1.65 + 800;
    inkLine(ctx, xTop, 506, xBot, 840, 1.2, 'rgba(18, 16, 14, 0.32)');
  }

  // 4. 三处老镇街面店铺 + 右侧老槐街口（收束在 1280x800 安全可视区内，绝不裁边）
  drawGroceryShop(ctx, 372, 495, highlightedSpot === 'grocery', sway, patterns);
  drawClinicShop(ctx, 745, 495, highlightedSpot === 'clinic', sway, patterns);
  drawTailorShop(ctx, 1102, 495, highlightedSpot === 'tailor', sway, state.informedDays.includes(state.day), patterns);
  drawOldLocustCorner(ctx, 1362, 495, highlightedSpot === 'alley', state.rumor && state.day === 4, sway, patterns);

  // Subtle street drifting paper ash & sunlit shafts
  ctx.save();
  const shaft = ctx.createLinearGradient(1180, 80, 820, 620);
  shaft.addColorStop(0, 'rgba(255, 248, 228, 0.16)');
  shaft.addColorStop(1, 'rgba(255, 248, 228, 0)');
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(1060, 0);
  ctx.lineTo(1380, 0);
  ctx.lineTo(1080, 620);
  ctx.lineTo(640, 620);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 左侧店铺：镇集杂货（堆满宣纸捆与竹篾） */
function drawGroceryShop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  highlighted: boolean,
  sway: number,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(cx, groundY);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -145, 195, 170, 0.72, true);
  }

  // Shop facade
  inkRect(ctx, -162, -268, 324, 268, '#d4cab5', 2.4, patterns.woodcutH);
  // Dark interior opening
  inkRect(ctx, -118, -196, 236, 196, '#23201d', 2.2);
  // Gray tiled overhanging roof eaves
  inkPoly(ctx, [[-194, -244], [-156, -310], [156, -310], [194, -244]], '#2f2d2a', 2.6, INK, patterns.hatchDense);
  for (let rx = -150; rx <= 150; rx += 26) {
    inkLine(ctx, rx, -308, rx * 1.16, -244, 1.3, 'rgba(235, 228, 212, 0.22)');
  }
  // Wooden display stall + stacked Xuan paper rolls & bamboo strips
  inkRect(ctx, -138, -76, 276, 76, '#584f44', 2.2, patterns.woodcutV);
  inkRect(ctx, -144, -84, 288, 12, '#7c7060', 2.0);
  // Paper bundles on stall
  for (const [bx, by, bw, bh] of [
    [-108, -118, 66, 34],
    [-98, -144, 52, 26],
    [16, -124, 72, 40],
    [28, -150, 56, 26]
  ]) {
    inkRect(ctx, bx, by, bw, bh, '#f2ead8', 2.0, patterns.hatchLight);
    inkLine(ctx, bx + bw * 0.5, by, bx + bw * 0.5, by + bh, 2.2, CINNABAR);
  }
  // Bamboo poles leaning on right post
  for (let i = 0; i < 4; i++) {
    inkLine(ctx, 114 + i * 7, -190, 126 + i * 6, -4, 3.0, '#78725a');
    inkLine(ctx, 114 + i * 7, -190, 126 + i * 6, -4, 1.1, INK);
  }
  // Shop plaque
  inkRect(ctx, -92, -264, 184, 38, '#1e1c1a', 2.2);
  ctx.fillStyle = '#f3ebd8';
  ctx.font = '700 22px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('镇 集 杂 货', 0, -244);
  drawRedSeal(ctx, -74, -245, 12, '货');

  // Swaying cloth banner on left eaves
  const bX = -168 + sway * 5;
  inkLine(ctx, -168, -244, bX, -154, 1.5, INK);
  inkPoly(ctx, [[-184, -234], [-152, -234], [-152 + sway * 5, -158], [-184 + sway * 5, -158]], '#dfd4bc', 1.8);
  drawVerticalCalligraphy(ctx, '纸料竹篾', -168 + sway * 2.5, -220, 16, 13, '#221c18');

  ctx.restore();
}

/** 中左店铺：林氏诊所（素白门帘、悬壶药幌、林医生剪影） */
function drawClinicShop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  highlighted: boolean,
  sway: number,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(cx, groundY);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -148, 175, 172, 0.72, true);
  }

  // Clean plastered white Republican clinic facade
  inkRect(ctx, -144, -276, 288, 276, '#e8e0cf', 2.4, patterns.hatchLight);
  inkPoly(ctx, [[-170, -252], [-136, -314], [136, -314], [170, -252]], '#323436', 2.6, INK, patterns.woodcutH);

  // Arched clinic doorway + crisp white door curtain (素白门帘)
  inkRect(ctx, -74, -196, 148, 196, '#232628', 2.2);
  // Subtle silhouette of Doctor Lin inside doorway
  ctx.fillStyle = '#ddd6c5';
  ctx.beginPath();
  ctx.arc(8, -138, 15, 0, Math.PI * 2);
  ctx.fill();
  inkPoly(ctx, [[-14, -120], [30, -120], [36, -24], [-20, -24]], '#dad3c2', 1.8);
  // White split curtain blowing gently
  inkPoly(ctx, [[-72, -194], [-10, -194], [-14 + sway * 4, -84], [-72 + sway * 2, -88]], '#f5efe1', 1.9);
  inkPoly(ctx, [[10, -194], [72, -194], [72 + sway * 2, -88], [16 + sway * 4, -84]], '#f5efe1', 1.9);

  // Horizontal sign + cinnabar medical cross emblem
  inkRect(ctx, -96, -268, 192, 40, '#f4ede0', 2.2);
  inkRect(ctx, -84, -256, 16, 16, CINNABAR, 1.4);
  inkLine(ctx, -76, -253, -76, -243, 2.4, '#fff8eb');
  inkLine(ctx, -81, -248, -71, -248, 2.4, '#fff8eb');
  ctx.fillStyle = '#1d1a18';
  ctx.font = '700 22px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('林 氏 诊 所', 12, -247);

  // Side lattice window with apothecary jars
  inkRect(ctx, 84, -172, 48, 86, '#393b3d', 2.0);
  inkLine(ctx, 108, -172, 108, -86, 1.4, '#e6decb');
  inkLine(ctx, 84, -129, 132, -129, 1.4, '#e6decb');

  ctx.restore();
}

/** 中右店铺：柳记裁缝铺（朱砂布招 + 柳裁缝线描立绘） */
function drawTailorShop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  highlighted: boolean,
  sway: number,
  informed: boolean,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(cx, groundY);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -148, 185, 176, 0.78, true);
  }

  // Timber & dark brick facade
  inkRect(ctx, -150, -274, 300, 274, '#ccc1ab', 2.4, patterns.woodcutV);
  inkPoly(ctx, [[-178, -250], [-142, -314], [142, -314], [178, -250]], '#262523', 2.6, INK, patterns.hatchDense);
  inkRect(ctx, -98, -202, 196, 202, '#1d1c1b', 2.2);

  // Wooden sign plaque
  inkRect(ctx, -98, -266, 196, 38, '#1b1918', 2.2);
  ctx.fillStyle = '#f4ecdc';
  ctx.font = '700 22px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('柳 记 裁 缝', 0, -246);
  drawRedSeal(ctx, 78, -247, 12, '柳');

  // Piercing cinnabar tailor banner swaying on right eaves (一点朱砂布招)
  inkPoly(
    ctx,
    [
      [118, -238],
      [152, -238],
      [154 + sway * 6, -124],
      [135 + sway * 6, -108],
      [116 + sway * 6, -124]
    ],
    CINNABAR,
    2.2,
    INK,
    patterns.woodcutV
  );
  drawVerticalCalligraphy(ctx, '裁衣问忌', 135 + sway * 3, -216, 22, 16, '#fff2dc', INK);

  // 柳裁缝线描立绘站在铺门口 (Master Liu Tailor standing at threshold)
  ctx.save();
  ctx.translate(-8, -6);
  // Draped indigo-ink Republican qipao / changshan coat
  inkPoly(ctx, [[-16, -172], [16, -172], [38, -148], [44, 0], [-44, 0], [-38, -148]], '#2d3034', 2.4, INK, patterns.woodcutV);
  inkPoly(ctx, [[-12, -174], [12, -174], [14, -162], [-14, -162]], '#f2ead8', 1.8);
  inkLine(ctx, -8, -162, 20, -138, 2.0, CINNABAR);
  inkLine(ctx, 20, -138, 22, -14, 1.8, CINNABAR);
  // Right hand holding bamboo tailor ruler + crimson thread
  inkLine(ctx, 24, -104, 58, -134, 3.2, '#d8c59a');
  inkLine(ctx, 24, -104, 58, -134, 1.1, INK);
  inkLine(ctx, 36, -116, 48 + sway * 4, -68, 1.8, CINNABAR);
  // Head & neat low bun with silver hairpin
  ctx.fillStyle = '#efe7d4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, -198, 18, 23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#151414';
  ctx.beginPath();
  ctx.arc(0, -212, 18, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(16, -206, 8, 0, Math.PI * 2);
  ctx.fill();
  inkLine(ctx, 8, -212, 28, -202, 2.0, '#e8dfc9');
  // Calm sharp eyes
  inkLine(ctx, -11, -201, -4, -201, 1.8, INK);
  inkLine(ctx, 4, -201, 11, -201, 1.8, INK);
  inkLine(ctx, -4, -187, 4, -187, 1.5, CINNABAR);
  ctx.restore();

  if (informed) {
    drawRedSeal(ctx, -118, -180, 18, '明');
  }

  ctx.restore();
}

/** 最右侧街口：老槐树与石牌坊角 */
function drawOldLocustCorner(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  highlighted: boolean,
  showAjie: boolean,
  sway: number,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(cx, groundY);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -140, 120, 160, 0.72, true);
  }

  // Gnarled sumi-ink old locust tree trunk & canopy
  inkPoly(
    ctx,
    [[-24, 0], [-18, -170], [-64, -255], [-40, -264], [0, -195], [56, -270], [74, -255], [22, -164], [28, 0]],
    '#2a2825',
    2.4,
    INK,
    patterns.woodcutV
  );
  drawInkWashBlot(ctx, -20 + sway * 3, -290, 125, 68, 0.74, '24, 23, 21');
  drawInkWashBlot(ctx, 56 + sway * 4, -268, 105, 58, 0.68, '28, 27, 25');

  // Red wish ribbon tied on branch
  inkLine(ctx, -38, -215, -42 + sway * 6, -168, 3.0, CINNABAR);

  if (showAjie) {
    // Ajie silhouette holding phone at lane corner
    inkPoly(ctx, [[-18, -134], [18, -134], [24, 0], [-24, 0]], '#3f4446', 2.2);
    ctx.fillStyle = '#ece3d0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -154, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    inkRect(ctx, 22, -110, 14, 22, '#141516', 1.6);
  }

  ctx.restore();
}
