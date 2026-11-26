import type { GameState } from '../../data/types';
import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  CINNABAR_DARK,
  INK,
  drawHighlightAura,
  drawInkWashBlot,
  drawRedSeal,
  drawVerticalCalligraphy,
  inkLine,
  inkPoly,
  inkRect
} from './textures';

export type StreetSpotKey =
  | 'grocery'
  | 'clinic'
  | 'tailor'
  | 'teahouse'
  | 'bookstore'
  | 'shrine'
  | 'alley';

export interface StreetDrawOpts {
  state: GameState;
  seconds: number;
  slow: boolean;
  patterns: ComicPatterns;
  highlightedSpot: StreetSpotKey | null;
}

const STREET_CACHE_OFFSET_X = -180;
const STREET_CACHE_OFFSET_Y = -80;
const STREET_CACHE_W = 3220;
const STREET_CACHE_H = 980;
const GROUND_Y = 516;

const streetStaticCacheMap = new WeakMap<ComicPatterns, HTMLCanvasElement>();

/** Draws a semicircular or segmental Qilou arcade arch opening with molded voussoirs & keystone */
function drawArcadeArch(
  ctx: CanvasRenderingContext2D,
  leftX: number,
  rightX: number,
  topY: number,
  springY: number,
  groundY: number,
  wallFill: string,
  trimColor: string,
  patterns: ComicPatterns
) {
  const cx = (leftX + rightX) * 0.5;
  const rx = (rightX - leftX) * 0.5;
  const archH = Math.max(24, springY - topY);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(leftX, topY);
  ctx.lineTo(rightX, topY);
  ctx.lineTo(rightX, springY);
  ctx.ellipse(cx, springY, rx, archH, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = wallFill;
  ctx.fill();
  if (patterns.woodcutH) {
    ctx.fillStyle = patterns.woodcutH;
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, springY, rx, archH, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, springY, rx - 7, Math.max(12, archH - 7), 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, springY, rx + 7, archH + 6, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.strokeStyle = 'rgba(22, 18, 16, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  inkPoly(
    ctx,
    [
      [cx - 11, topY - 4],
      [cx + 11, topY - 4],
      [cx + 8, topY + 14],
      [cx - 8, topY + 14]
    ],
    trimColor,
    1.8
  );

  const soffitGrad = ctx.createLinearGradient(0, topY, 0, springY + 34);
  soffitGrad.addColorStop(0, 'rgba(10, 9, 8, 0.72)');
  soffitGrad.addColorStop(1, 'rgba(10, 9, 8, 0)');
  ctx.beginPath();
  ctx.ellipse(cx, springY, rx - 1, archH - 1, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(rightX - 1, Math.min(groundY, springY + 34));
  ctx.lineTo(leftX + 1, Math.min(groundY, springY + 34));
  ctx.closePath();
  ctx.fillStyle = soffitGrad;
  ctx.fill();
  ctx.restore();
}

/** Draws a classic Republican Qilou arcade colonnade pillar with molded base, fluting & capital */
function drawQilouPillar(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  groundY: number,
  w: number,
  bodyColor: string,
  stoneColor: string,
  patterns: ComicPatterns
) {
  const h = groundY - topY;
  ctx.save();
  ctx.fillStyle = 'rgba(12, 10, 9, 0.34)';
  ctx.fillRect(x - 6, topY + 8, 8, h - 8);
  ctx.restore();

  inkRect(ctx, x, topY, w, h, bodyColor, 2.3, patterns.woodcutV);
  inkRect(ctx, x + 6, topY + 26, w - 12, h - 62, 'rgba(255, 248, 232, 0.16)', 1.2);
  inkLine(ctx, x + w * 0.5, topY + 32, x + w * 0.5, groundY - 42, 1.1, 'rgba(20, 18, 16, 0.42)');
  inkRect(ctx, x - 5, topY, w + 10, 11, stoneColor, 2.0);
  inkRect(ctx, x - 2, topY + 11, w + 4, 8, bodyColor, 1.6);
  inkRect(ctx, x - 4, groundY - 26, w + 8, 26, stoneColor, 2.2, patterns.hatchLight);
  inkLine(ctx, x - 4, groundY - 18, x + w + 4, groundY - 18, 1.3, INK);
}

/** Draws a traditional Lingnan wooden shuttered window (骑楼二层百叶木窗) */
function drawLouverWindow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frameColor: string,
  shutterColor: string
) {
  inkRect(ctx, x - 5, y - 8, w + 10, 8, '#cfc5b0', 1.7);
  inkRect(ctx, x, y, w, h, '#221f1c', 2.0);
  inkRect(ctx, x + 3, y + 3, w - 6, 18, '#5a625e', 1.4);
  inkLine(ctx, x + w * 0.5, y + 3, x + w * 0.5, y + 21, 1.2, '#e2d7c0');
  const half = (w - 8) * 0.5;
  inkRect(ctx, x + 3, y + 23, half, h - 26, shutterColor, 1.5);
  inkRect(ctx, x + 5 + half, y + 23, half, h - 26, shutterColor, 1.5);
  for (let ly = y + 29; ly < y + h - 6; ly += 6) {
    inkLine(ctx, x + 6, ly, x + 1 + half, ly, 1.0, 'rgba(18, 16, 14, 0.55)');
    inkLine(ctx, x + 8 + half, ly, x + w - 6, ly, 1.0, 'rgba(18, 16, 14, 0.55)');
  }
  ctx.save();
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 2.0;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
  inkRect(ctx, x - 4, y + h, w + 8, 6, '#b7ac96', 1.6);
}

/** Draws a Lingnan Manchu stained-glass lattice window (满洲窗) */
function drawManchuWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  inkRect(ctx, x - 6, y - 9, w + 12, 9, '#d8cfbd', 1.7);
  inkRect(ctx, x, y, w, h, '#202426', 2.2);
  const cols = 3;
  const rows = 4;
  const cw = (w - 8) / cols;
  const rh = (h - 8) / rows;
  const palette = [
    ['#8d372c', '#d5b36d', '#8d372c'],
    ['#4f6d67', '#ebe0c5', '#4f6d67'],
    ['#d5b36d', '#4f6d67', '#d5b36d'],
    ['#3c4e4d', '#8d372c', '#3c4e4d']
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      inkRect(ctx, x + 4 + c * cw, y + 4 + r * rh, cw, rh, palette[r][c], 1.3);
    }
  }
  const mx = x + w * 0.5;
  const my = y + h * 0.42;
  inkPoly(
    ctx,
    [
      [mx, my - 11],
      [mx + 11, my],
      [mx, my + 11],
      [mx - 11, my]
    ],
    'rgba(248, 236, 206, 0.65)',
    1.3
  );
  inkRect(ctx, x - 4, y + h, w + 8, 6, '#c4ba9f', 1.6);
}

/** Draws a carved stone/baluster, iron, or timber balcony railing */
function drawBalconyRailing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  style: 'stone' | 'iron' | 'wood'
) {
  if (style === 'stone') {
    inkRect(ctx, x, y, w, 6, '#dfd6c2', 1.7);
    inkRect(ctx, x, y + h - 6, w, 6, '#c7bca5', 1.7);
    const count = Math.max(4, Math.floor(w / 18));
    const step = w / count;
    for (let i = 0; i <= count; i++) {
      const bx = x + i * step;
      if (i === 0 || i === count) {
        inkRect(ctx, bx - 4, y, 8, h, '#d5cbb6', 1.6);
      } else {
        inkPoly(
          ctx,
          [
            [bx - 3, y + 6],
            [bx + 3, y + 6],
            [bx + 5, y + h * 0.55],
            [bx + 3, y + h - 6],
            [bx - 3, y + h - 6],
            [bx - 5, y + h * 0.55]
          ],
          '#dfd6c3',
          1.3
        );
      }
    }
  } else if (style === 'iron') {
    inkLine(ctx, x, y + 2, x + w, y + 2, 2.4, '#1b1d1f');
    inkLine(ctx, x, y + h - 2, x + w, y + h - 2, 2.4, '#1b1d1f');
    for (let bx = x; bx <= x + w; bx += 14) {
      inkLine(ctx, bx, y + 2, bx, y + h - 2, 1.4, '#24272a');
    }
    ctx.save();
    ctx.strokeStyle = '#24272a';
    ctx.lineWidth = 1.3;
    for (let bx = x + 14; bx < x + w - 10; bx += 28) {
      ctx.beginPath();
      ctx.arc(bx, y + h * 0.5, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    inkRect(ctx, x, y, w, 5, '#4c3e32', 1.6);
    inkRect(ctx, x, y + h - 5, w, 5, '#4c3e32', 1.6);
    for (let bx = x + 10; bx < x + w - 6; bx += 18) {
      inkLine(ctx, bx, y + 5, bx, y + h - 5, 2.0, '#3a2e24');
      inkLine(ctx, bx - 5, y + h * 0.5, bx + 5, y + h * 0.5, 1.3, '#6b5542');
    }
  }
}

/** Draws the entire panoramic 2-block Republican Qilou Ancient Street onto the offscreen cache */
function drawStreetStaticBase(ctx: CanvasRenderingContext2D, patterns: ComicPatterns) {
  // 1. 宣纸薄雾晴空 (Panoramic Xuan-paper morning sky across x=-180..3040)
  const skyGrad = ctx.createLinearGradient(0, -60, 0, 440);
  skyGrad.addColorStop(0, '#c4baa4');
  skyGrad.addColorStop(0.5, '#dcd3be');
  skyGrad.addColorStop(1, '#eee5d1');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-180, -80, 3220, 580);

  // Pale morning sun on Front & Back skyline horizon
  ctx.save();
  ctx.fillStyle = 'rgba(255, 250, 236, 0.78)';
  ctx.beginPath();
  ctx.arc(1385, 108, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(182, 42, 32, 0.28)';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  for (const [mx, my, rx, ry] of [
    [250, 82, 200, 34],
    [790, 70, 240, 36],
    [1340, 128, 190, 30],
    [1940, 76, 230, 34],
    [2540, 118, 210, 32]
  ]) {
    drawInkWashBlot(ctx, mx, my, rx, ry, 0.12, '38, 36, 32');
  }

  // 2. 淡墨远山与远景屋脊 (Panoramic ink mountains & distant roofs)
  inkPoly(
    ctx,
    [
      [-180, 320],
      [120, 178],
      [420, 242],
      [740, 162],
      [1080, 226],
      [1420, 168],
      [1780, 232],
      [2160, 164],
      [2520, 220],
      [2840, 172],
      [3040, 210],
      [3040, 430],
      [-180, 430]
    ],
    'rgba(58, 56, 50, 0.26)',
    0
  );
  inkPoly(
    ctx,
    [
      [-180, 355],
      [220, 248],
      [560, 294],
      [900, 242],
      [1260, 290],
      [1640, 238],
      [2020, 286],
      [2420, 234],
      [2780, 282],
      [3040, 254],
      [3040, 460],
      [-180, 460]
    ],
    'rgba(38, 36, 33, 0.32)',
    0
  );

  // Distant recessed rooftops beyond the Old Locust Archway on the far right (深巷透视灰瓦)
  for (const [gx, gy, gw, gh] of [
    [2410, 260, 118, 255],
    [2544, 244, 138, 270],
    [2675, 224, 185, 292]
  ]) {
    inkRect(ctx, gx, gy + 26, gw, gh, '#a9a08d', 1.6, patterns.woodcutH);
    inkPoly(
      ctx,
      [
        [gx - 8, gy + 30],
        [gx + 16, gy],
        [gx + gw - 16, gy],
        [gx + gw + 8, gy + 30]
      ],
      '#3c3a36',
      1.8,
      INK,
      patterns.hatchLight
    );
  }

  // Far wooden telegraph poles & catenary wires crossing the entire old street
  for (const poleX of [1258, 2574]) {
    inkLine(ctx, poleX, 74, poleX + 6, 514, 5.2, '#3b342c');
    inkLine(ctx, poleX - 22, 98, poleX + 24, 98, 2.8, '#2c2721');
    inkLine(ctx, poleX - 18, 114, poleX + 20, 114, 2.2, '#2c2721');
  }
  ctx.save();
  ctx.strokeStyle = 'rgba(24, 22, 20, 0.38)';
  ctx.lineWidth = 1.2;
  for (const dy of [98, 114]) {
    ctx.beginPath();
    ctx.moveTo(-180, dy - 14);
    ctx.quadraticCurveTo(540, dy + 42, 1258, dy);
    ctx.quadraticCurveTo(1916, dy + 44, 2574, dy);
    ctx.quadraticCurveTo(2810, dy + 22, 3040, dy - 8);
    ctx.stroke();
  }
  ctx.restore();

  // 3. 连片二层民国骑楼底廊阴影与廊道地砖 (Continuous Qilou Arcade Corridor x=-180..2354)
  const corridorGrad = ctx.createLinearGradient(0, 324, 0, GROUND_Y);
  corridorGrad.addColorStop(0, '#161412');
  corridorGrad.addColorStop(0.55, '#25211e');
  corridorGrad.addColorStop(1, '#3b352e');
  ctx.fillStyle = corridorGrad;
  ctx.fillRect(-180, 322, 2534, GROUND_Y - 322);

  const walkGrad = ctx.createLinearGradient(0, GROUND_Y - 26, 0, GROUND_Y);
  walkGrad.addColorStop(0, '#4f483e');
  walkGrad.addColorStop(1, '#7a7162');
  ctx.fillStyle = walkGrad;
  ctx.fillRect(-180, GROUND_Y - 26, 2534, 26);
  inkLine(ctx, -180, GROUND_Y - 26, 2354, GROUND_Y - 26, 1.5, 'rgba(16, 14, 12, 0.65)');
  for (let wx = -140; wx <= 2330; wx += 48) {
    inkLine(ctx, wx, GROUND_Y - 26, wx - 14, GROUND_Y, 1.0, 'rgba(16, 14, 12, 0.35)');
  }

  // ===== 4. 左侧画外衔接骑楼：永兴当铺半幅 (x=-180..198) =====
  inkRect(ctx, -180, 152, 378, 172, '#c8beaa', 2.2, patterns.woodcutH);
  inkRect(ctx, -180, 134, 378, 18, '#b5aa94', 2.0);
  inkPoly(ctx, [[-180, 134], [-180, 114], [190, 114], [202, 134]], '#32302d', 2.2, INK, patterns.hatchDense);
  drawLouverWindow(ctx, -40, 178, 56, 86, '#2b241d', '#5d5345');
  drawLouverWindow(ctx, 72, 178, 56, 86, '#2b241d', '#5d5345');
  drawBalconyRailing(ctx, -64, 250, 214, 34, 'stone');
  inkRect(ctx, -30, 354, 150, GROUND_Y - 354, '#2b251f', 1.8, patterns.woodcutV);
  drawArcadeArch(ctx, -20, 168, 324, 386, GROUND_Y, '#c8beaa', '#dfd6c2', patterns);
  inkRect(ctx, -4, 288, 134, 30, '#221e1a', 2.0);
  ctx.fillStyle = '#e7dcc5';
  ctx.font = '700 18px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('永 兴 当 铺', 63, 304);

  // ===== 5. 前街骑楼一：镇集杂货 (cx = 377, x: 198..556) =====
  inkRect(ctx, 198, 148, 358, 176, '#d6ccb6', 2.4, patterns.woodcutH);
  inkPoly(
    ctx,
    [
      [198, 148],
      [198, 126],
      [252, 126],
      [272, 108],
      [320, 108],
      [340, 88],
      [414, 88],
      [434, 108],
      [482, 108],
      [502, 126],
      [556, 126],
      [556, 148]
    ],
    '#cfc3ab',
    2.4,
    INK,
    patterns.hatchLight
  );
  ctx.save();
  ctx.fillStyle = '#e6dcc7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(377, 114, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawRedSeal(ctx, 377, 114, 14, '集');
  inkLine(ctx, 204, 142, 550, 142, 1.5, 'rgba(20, 18, 16, 0.55)');
  drawLouverWindow(ctx, 244, 174, 62, 92, '#2a221b', '#6c5c49');
  drawLouverWindow(ctx, 346, 174, 62, 92, '#2a221b', '#6c5c49');
  drawLouverWindow(ctx, 448, 174, 62, 92, '#2a221b', '#6c5c49');
  drawBalconyRailing(ctx, 224, 244, 306, 36, 'stone');
  inkRect(ctx, 232, 346, 286, GROUND_Y - 346, '#211d19', 2.0);
  for (let tx = 248; tx <= 504; tx += 36) {
    inkLine(ctx, tx, 348, tx, GROUND_Y - 76, 1.1, 'rgba(130, 112, 88, 0.25)');
  }
  inkRect(ctx, 242, GROUND_Y - 78, 266, 78, '#584e42', 2.2, patterns.woodcutV);
  inkRect(ctx, 236, GROUND_Y - 86, 278, 12, '#7d705e', 2.0);
  for (const [bx, by, bw, bh] of [
    [256, GROUND_Y - 122, 68, 36],
    [266, GROUND_Y - 148, 52, 26],
    [348, GROUND_Y - 118, 54, 32],
    [412, GROUND_Y - 126, 68, 40],
    [424, GROUND_Y - 152, 50, 26]
  ]) {
    inkRect(ctx, bx, by, bw, bh, '#f2ead8', 1.9, patterns.hatchLight);
    inkLine(ctx, bx + bw * 0.5, by, bx + bw * 0.5, by + bh, 2.2, CINNABAR);
  }
  for (let i = 0; i < 4; i++) {
    inkLine(ctx, 488 + i * 6, GROUND_Y - 180, 498 + i * 5, GROUND_Y - 6, 2.8, '#7b745a');
    inkLine(ctx, 488 + i * 6, GROUND_Y - 180, 498 + i * 5, GROUND_Y - 6, 1.0, INK);
  }
  drawArcadeArch(ctx, 212, 542, 324, 392, GROUND_Y, '#d6ccb6', '#ebe2ce', patterns);
  inkRect(ctx, 198, 280, 358, 44, '#c7bc9f', 2.0, patterns.woodcutH);
  inkRect(ctx, 278, 285, 198, 34, '#1c1a18', 2.2);
  ctx.fillStyle = '#f4ecd8';
  ctx.font = '700 21px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('镇 集 杂 货', 382, 303);
  drawRedSeal(ctx, 298, 302, 13, '货');

  // ===== 6. 前街骑楼二：林氏诊所 (cx = 741, x: 556..926) =====
  inkRect(ctx, 556, 140, 370, 184, '#e7dfd0', 2.4, patterns.hatchLight);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(556, 140);
  ctx.lineTo(556, 118);
  ctx.lineTo(662, 118);
  ctx.quadraticCurveTo(741, 66, 820, 118);
  ctx.lineTo(926, 118);
  ctx.lineTo(926, 140);
  ctx.closePath();
  ctx.fillStyle = '#dfd6c4';
  ctx.fill();
  if (patterns.woodcutH) {
    ctx.fillStyle = patterns.woodcutH;
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.restore();
  inkRect(ctx, 566, 104, 14, 14, '#cfc6b3', 1.8);
  inkRect(ctx, 902, 104, 14, 14, '#cfc6b3', 1.8);
  ctx.save();
  ctx.fillStyle = '#f4ede0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(741, 114, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  inkLine(ctx, 741, 104, 741, 124, 4.0, CINNABAR);
  inkLine(ctx, 731, 114, 751, 114, 4.0, CINNABAR);
  for (let dx = 564; dx < 920; dx += 14) {
    inkRect(ctx, dx, 142, 7, 6, '#cfc5b2', 1.0);
  }
  drawManchuWindow(ctx, 694, 164, 94, 102);
  drawLouverWindow(ctx, 594, 174, 58, 92, '#282d30', '#54615e');
  drawLouverWindow(ctx, 830, 174, 58, 92, '#282d30', '#54615e');
  drawBalconyRailing(ctx, 584, 244, 314, 34, 'iron');
  inkRect(ctx, 592, 346, 298, GROUND_Y - 346, '#232729', 2.0);
  inkRect(ctx, 604, 384, 62, 112, '#4a4035', 1.6);
  for (let row = 0; row < 5; row++) {
    inkLine(ctx, 604, 404 + row * 19, 666, 404 + row * 19, 1.0, 'rgba(20, 18, 16, 0.55)');
  }
  for (let col = 1; col < 3; col++) {
    inkLine(ctx, 604 + col * 21, 384, 604 + col * 21, 496, 1.0, 'rgba(20, 18, 16, 0.55)');
  }
  inkRect(ctx, 682, 368, 124, GROUND_Y - 368, '#1a1e20', 2.0);
  ctx.fillStyle = '#ddd6c5';
  ctx.beginPath();
  ctx.arc(746, GROUND_Y - 126, 14, 0, Math.PI * 2);
  ctx.fill();
  inkPoly(
    ctx,
    [
      [726, GROUND_Y - 110],
      [766, GROUND_Y - 110],
      [772, GROUND_Y - 22],
      [720, GROUND_Y - 22]
    ],
    '#dad3c2',
    1.7
  );
  inkRect(ctx, 822, 388, 54, 86, '#394042', 1.8);
  inkLine(ctx, 849, 388, 849, 474, 1.3, '#e6decb');
  inkLine(ctx, 822, 431, 876, 431, 1.3, '#e6decb');
  drawArcadeArch(ctx, 572, 910, 324, 392, GROUND_Y, '#e7dfd0', '#f4ede0', patterns);
  inkRect(ctx, 556, 280, 370, 44, '#dad1be', 2.0, patterns.hatchLight);
  inkRect(ctx, 646, 285, 194, 34, '#f5eee0', 2.2);
  inkRect(ctx, 656, 294, 16, 16, CINNABAR, 1.4);
  inkLine(ctx, 664, 297, 664, 307, 2.4, '#fff8eb');
  inkLine(ctx, 659, 302, 669, 302, 2.4, '#fff8eb');
  ctx.fillStyle = '#1d1a18';
  ctx.font = '700 21px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('林 氏 诊 所', 754, 303);

  // ===== 7. 前街骑楼三：柳记裁缝 (cx = 1095, x: 926..1264) =====
  inkRect(ctx, 926, 146, 338, 178, '#c5bba7', 2.4, patterns.woodcutV);
  inkPoly(ctx, [[918, 146], [938, 108], [1252, 108], [1274, 146]], '#2a2927', 2.5, INK, patterns.hatchDense);
  for (let rx = 944; rx <= 1244; rx += 22) {
    inkLine(ctx, rx, 110, rx, 146, 1.2, 'rgba(232, 224, 208, 0.22)');
  }
  inkLine(ctx, 932, 108, 1258, 108, 3.2, '#161514');
  inkPoly(ctx, [[936, 108], [924, 96], [944, 102]], '#2c2927', 1.8);
  inkPoly(ctx, [[1254, 108], [1266, 96], [1246, 102]], '#2c2927', 1.8);
  drawLouverWindow(ctx, 966, 174, 62, 92, '#221c17', '#4a3d31');
  drawLouverWindow(ctx, 1064, 174, 62, 92, '#221c17', '#4a3d31');
  drawLouverWindow(ctx, 1162, 174, 62, 92, '#221c17', '#4a3d31');
  drawBalconyRailing(ctx, 950, 244, 290, 34, 'wood');
  inkRect(ctx, 960, 346, 272, GROUND_Y - 346, '#1c1b1a', 2.0);
  for (let i = 0; i < 4; i++) {
    inkRect(ctx, 974, 412 + i * 22, 64, 18, i % 2 === 0 ? '#3a464e' : '#7b2a24', 1.5);
    inkLine(ctx, 978, 421 + i * 22, 1034, 421 + i * 22, 1.0, 'rgba(244, 232, 204, 0.35)');
  }
  drawArcadeArch(ctx, 942, 1248, 324, 392, GROUND_Y, '#c5bba7', '#e0d6c2', patterns);
  inkRect(ctx, 926, 280, 338, 44, '#b8ae99', 2.0, patterns.woodcutH);
  inkRect(ctx, 1002, 285, 190, 34, '#1b1918', 2.2);
  ctx.fillStyle = '#f4ecdc';
  ctx.font = '700 21px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('柳 记 裁 缝', 1094, 303);
  drawRedSeal(ctx, 1172, 302, 13, '柳');

  // ===== 8. 深街骑楼四：德昌茶楼 (cx = 1448, x: 1264..1632, 重檐木楼品茶雅座) =====
  inkRect(ctx, 1264, 142, 368, 182, '#d5c7ad', 2.4, patterns.woodcutH);
  // Double-eave upturned Lingnan teahouse pavilion roof
  inkPoly(ctx, [[1256, 144], [1282, 104], [1614, 104], [1640, 144]], '#302b26', 2.5, INK, patterns.hatchDense);
  inkPoly(ctx, [[1326, 104], [1352, 74], [1544, 74], [1570, 104]], '#272420', 2.4, INK, patterns.woodcutH);
  inkLine(ctx, 1344, 74, 1552, 74, 3.0, '#161412');
  for (let rx = 1286; rx <= 1608; rx += 22) {
    inkLine(ctx, rx, 106, rx, 144, 1.1, 'rgba(240, 226, 198, 0.22)');
  }
  // Wide glowing 2nd-floor teahouse gallery (二楼雅座暖光花窗与茶客剪影)
  inkRect(ctx, 1304, 166, 288, 96, '#5c4b37', 2.2);
  const teaGlow = ctx.createLinearGradient(0, 166, 0, 262);
  teaGlow.addColorStop(0, '#c89e5a');
  teaGlow.addColorStop(1, '#7c5d36');
  ctx.fillStyle = teaGlow;
  ctx.fillRect(1310, 172, 276, 84);
  // Seated tea-guest ink silhouettes inside 2nd-floor window
  ctx.fillStyle = 'rgba(26, 22, 18, 0.72)';
  ctx.beginPath();
  ctx.arc(1386, 208, 11, 0, Math.PI * 2);
  ctx.arc(1498, 206, 11, 0, Math.PI * 2);
  ctx.fill();
  inkPoly(ctx, [[1368, 222], [1402, 222], [1408, 256], [1362, 256]], 'rgba(26, 22, 18, 0.72)', 0);
  inkPoly(ctx, [[1480, 220], [1514, 220], [1520, 256], [1474, 256]], 'rgba(26, 22, 18, 0.72)', 0);
  // Lattice mullions across teahouse gallery
  for (let wx = 1310; wx <= 1586; wx += 46) {
    inkLine(ctx, wx, 172, wx, 256, 1.6, '#2a2118');
  }
  inkLine(ctx, 1310, 200, 1586, 200, 1.4, '#2a2118');
  drawBalconyRailing(ctx, 1292, 244, 312, 34, 'wood');
  // Ground corridor under Teahouse arch: tea counter, big brass teapot, bamboo stools & canisters
  inkRect(ctx, 1304, 346, 288, GROUND_Y - 346, '#231e19', 2.0);
  // Tea canisters on back shelf
  for (let i = 0; i < 4; i++) {
    inkRect(ctx, 1326 + i * 32, 396, 22, 30, i % 2 === 0 ? '#6e5038' : '#3a4a48', 1.4);
  }
  // Wooden tea counter + big brass kettle
  inkRect(ctx, 1320, GROUND_Y - 72, 136, 72, '#5a4430', 2.0, patterns.woodcutV);
  inkRect(ctx, 1314, GROUND_Y - 80, 148, 10, '#7d6247', 1.8);
  // Celadon/brass teapot on counter
  ctx.save();
  ctx.fillStyle = '#c89d56';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(1386, GROUND_Y - 94, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  inkLine(ctx, 1403, GROUND_Y - 96, 1418, GROUND_Y - 108, 2.8, '#c89d56');
  // Small round tea table + two stools on right side of alcove
  inkRect(ctx, 1492, GROUND_Y - 58, 74, 10, '#73583f', 1.8);
  inkLine(ctx, 1506, GROUND_Y - 48, 1506, GROUND_Y - 4, 3.0, '#4d3a29');
  inkLine(ctx, 1552, GROUND_Y - 48, 1552, GROUND_Y - 4, 3.0, '#4d3a29');
  inkRect(ctx, 1476, GROUND_Y - 36, 22, 32, '#584432', 1.5);
  inkRect(ctx, 1560, GROUND_Y - 36, 22, 32, '#584432', 1.5);
  drawArcadeArch(ctx, 1280, 1616, 324, 392, GROUND_Y, '#d5c7ad', '#eadfc7', patterns);
  inkRect(ctx, 1264, 280, 368, 44, '#c4b496', 2.0, patterns.woodcutH);
  inkRect(ctx, 1348, 285, 200, 34, '#241a14', 2.2);
  ctx.fillStyle = '#f4dfad';
  ctx.font = '700 21px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('德 昌 茶 楼', 1446, 303);
  drawRedSeal(ctx, 1368, 302, 13, '茶');

  // ===== 9. 深街骑楼五：墨香书肆 (cx = 1816, x: 1632..2000, 青砖拱券古旧书局) =====
  inkRect(ctx, 1632, 144, 368, 180, '#cbc4b4', 2.4, patterns.hatchLight);
  // Classical Republican scroll-pediment (卷轴书局山花女儿墙)
  inkPoly(
    ctx,
    [
      [1632, 144],
      [1632, 118],
      [1728, 118],
      [1756, 86],
      [1876, 86],
      [1904, 118],
      [2000, 118],
      [2000, 144]
    ],
    '#c0b8a6',
    2.4,
    INK,
    patterns.woodcutH
  );
  inkRect(ctx, 1762, 100, 108, 26, '#262420', 1.8);
  ctx.fillStyle = '#ece2cc';
  ctx.font = '700 15px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('古 籍 縣 志', 1816, 114);
  // 2nd floor bookshop tall arched windows with visible book rows inside
  for (const bx of [1676, 1784, 1892]) {
    inkRect(ctx, bx, 168, 64, 96, '#232426', 2.0);
    // Warm book-shelf bands glimpsed inside
    for (let row = 0; row < 4; row++) {
      inkRect(ctx, bx + 6, 182 + row * 19, 52, 12, row % 2 === 0 ? '#6e5640' : '#4a5458', 1.0);
    }
    inkLine(ctx, bx + 32, 168, bx + 32, 264, 1.5, '#d8ceb9');
    inkLine(ctx, bx, 214, bx + 64, 214, 1.5, '#d8ceb9');
  }
  drawBalconyRailing(ctx, 1662, 244, 308, 34, 'stone');
  // Ground corridor under Bookshop arch: tall shelves, slanted thread-bound bookstall, old scholar silhouette
  inkRect(ctx, 1672, 346, 288, GROUND_Y - 346, '#1f1e1c', 2.0);
  // Back wall bookshelves
  inkRect(ctx, 1686, 368, 112, 134, '#3d3126', 1.8);
  for (let row = 0; row < 5; row++) {
    const sy = 388 + row * 22;
    inkLine(ctx, 1686, sy, 1798, sy, 1.6, '#201a15');
    for (let col = 0; col < 7; col++) {
      inkRect(ctx, 1692 + col * 14, sy - 16, 10, 15, (row + col) % 3 === 0 ? '#3a4b56' : '#c7b896', 0.8);
    }
  }
  // Old scholar silhouette browsing by the stall
  ctx.fillStyle = '#ddd4c0';
  ctx.beginPath();
  ctx.arc(1874, GROUND_Y - 122, 13, 0, Math.PI * 2);
  ctx.fill();
  inkPoly(
    ctx,
    [
      [1854, GROUND_Y - 108],
      [1894, GROUND_Y - 108],
      [1900, GROUND_Y - 18],
      [1848, GROUND_Y - 18]
    ],
    '#3c4045',
    1.8
  );
  // Slanted foreground bookstall piled with thread-bound books
  inkRect(ctx, 1712, GROUND_Y - 64, 218, 64, '#594a3b', 2.0, patterns.woodcutV);
  for (const [tx, ty, col] of [
    [1728, GROUND_Y - 82, '#3a4f5c'],
    [1768, GROUND_Y - 86, '#dfd3b8'],
    [1808, GROUND_Y - 80, '#7e2c24'],
    [1860, GROUND_Y - 84, '#3a4f5c']
  ] as Array<[number, number, string]>) {
    inkRect(ctx, tx, ty, 32, 18, col, 1.5);
    inkLine(ctx, tx + 6, ty, tx + 6, ty + 18, 1.2, '#f2ead6');
  }
  drawArcadeArch(ctx, 1648, 1984, 324, 392, GROUND_Y, '#cbc4b4', '#e5decb', patterns);
  inkRect(ctx, 1632, 280, 368, 44, '#bab2a0', 2.0, patterns.woodcutH);
  inkRect(ctx, 1718, 285, 196, 34, '#1b1d1f', 2.2);
  ctx.fillStyle = '#f2ead8';
  ctx.font = '700 21px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('墨 香 书 肆', 1812, 303);
  drawRedSeal(ctx, 1894, 302, 13, '墨');

  // ===== 10. 深街骑楼六：城隍香火堂 (cx = 2177, x: 2000..2354, 庙铺同街朱柱香火堂) =====
  inkRect(ctx, 2000, 148, 354, 176, '#c7b8a3', 2.4, patterns.woodcutV);
  // Curved crimson-accented Lingnan temple roof with ridge crest (歇山翘角庙顶)
  inkPoly(
    ctx,
    [
      [1986, 152],
      [2022, 98],
      [2332, 98],
      [2368, 152]
    ],
    '#292524',
    2.6,
    INK,
    patterns.hatchDense
  );
  inkLine(ctx, 2010, 98, 2344, 98, 3.6, CINNABAR_DARK);
  inkPoly(ctx, [[2020, 98], [2004, 80], [2032, 90]], '#342725', 1.8);
  inkPoly(ctx, [[2334, 98], [2350, 80], [2322, 90]], '#342725', 1.8);
  // Central golden-cinnabar temple ridge jewel
  ctx.save();
  ctx.fillStyle = '#d59a4a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(2177, 89, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // Upper ornate carved lattice screen with warm candle glow behind
  inkRect(ctx, 2044, 170, 266, 94, '#5a221d', 2.2);
  const shrineGlow = ctx.createRadialGradient(2177, 217, 12, 2177, 217, 128);
  shrineGlow.addColorStop(0, 'rgba(244, 188, 96, 0.56)');
  shrineGlow.addColorStop(1, 'rgba(64, 24, 20, 0.25)');
  ctx.fillStyle = shrineGlow;
  ctx.fillRect(2050, 176, 254, 82);
  for (let gx = 2050; gx <= 2304; gx += 32) {
    inkLine(ctx, gx, 176, gx, 258, 1.8, '#2b1412');
  }
  inkLine(ctx, 2050, 217, 2304, 217, 1.8, '#2b1412');
  drawBalconyRailing(ctx, 2036, 244, 282, 34, 'wood');
  // Ground corridor under Shrine arch: recessed altar, vermilion inner pillars & bronze incense burner
  inkRect(ctx, 2038, 346, 278, GROUND_Y - 346, '#1c1514', 2.0);
  // Inner shrine altar & tablet silhouette
  inkRect(ctx, 2124, 386, 106, 98, '#381e1a', 1.8);
  inkRect(ctx, 2160, 404, 34, 58, '#8a2b20', 1.6);
  drawVerticalCalligraphy(ctx, '城隍', 2177, 422, 22, 13, '#f4dba4');
  // Vermilion inner temple posts
  inkRect(ctx, 2064, 352, 16, GROUND_Y - 352, '#7d241c', 1.8);
  inkRect(ctx, 2274, 352, 16, GROUND_Y - 352, '#7d241c', 1.8);
  // Heavy three-legged bronze incense burner (三足铁香炉) right in front of the altar
  inkPoly(
    ctx,
    [
      [2146, GROUND_Y - 56],
      [2208, GROUND_Y - 56],
      [2202, GROUND_Y - 22],
      [2152, GROUND_Y - 22]
    ],
    '#433c36',
    2.2,
    INK,
    patterns.hatchLight
  );
  inkLine(ctx, 2158, GROUND_Y - 22, 2154, GROUND_Y - 4, 3.4, '#2b2723');
  inkLine(ctx, 2177, GROUND_Y - 22, 2177, GROUND_Y - 4, 3.4, '#2b2723');
  inkLine(ctx, 2196, GROUND_Y - 22, 2200, GROUND_Y - 4, 3.4, '#2b2723');
  // Three glowing incense sticks in burner
  for (const ix of [2168, 2177, 2186]) {
    inkLine(ctx, ix, GROUND_Y - 56, ix, GROUND_Y - 78, 1.8, '#8c6d4a');
    ctx.fillStyle = '#ff6347';
    ctx.beginPath();
    ctx.arc(ix, GROUND_Y - 79, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  drawArcadeArch(ctx, 2016, 2338, 324, 392, GROUND_Y, '#c7b8a3', '#e2d2ba', patterns);
  inkRect(ctx, 2000, 280, 354, 44, '#a64134', 2.0, patterns.woodcutH);
  inkRect(ctx, 2068, 285, 218, 34, '#1b1412', 2.2);
  ctx.fillStyle = '#f7df9e';
  ctx.font = '700 20px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('城 隍 香 火 堂', 2172, 303);
  drawRedSeal(ctx, 2266, 302, 13, '佑');

  // ===== 11. 七根连续骑楼大柱与竖招柱牌 (7 Rhythmic Colonnade Pillars) =====
  const pillarSpecs: Array<[number, string, string, string?, string?]> = [
    [168, '#d4cab4', '#aba08b', '宣纸竹篾', '#231e19'],
    [536, '#dfd7c6', '#b5ac99', '净药止煞', '#f3ece0'],
    [906, '#d6cebc', '#aba392', '裁衣问忌', '#231e19'],
    [1240, '#c8bea9', '#9f9683', '清茶叙旧', '#2c1e16'],
    [1610, '#d2c9b6', '#a89f8c', '古籍县志', '#1f2326'],
    [1978, '#cbbca8', '#9f917f', '香火佑安', '#7a221a'],
    [2328, '#c0b29e', '#968978']
  ];
  for (const [px, bodyCol, stoneCol, signText, signBg] of pillarSpecs) {
    drawQilouPillar(ctx, px, 322, GROUND_Y, 34, bodyCol, stoneCol, patterns);
    if (signText && signBg) {
      inkRect(ctx, px + 6, 356, 22, 108, signBg, 1.8);
      drawVerticalCalligraphy(
        ctx,
        signText,
        px + 17,
        374,
        22,
        13,
        signBg === '#f3ece0' ? CINNABAR_DARK : '#f3e5c4'
      );
    }
  }

  // ===== 12. 深街尽头：老槐巷青石牌坊与土地小龛 (cx = 2468) =====
  inkRect(ctx, 2362, 354, 620, GROUND_Y - 354, '#bcb39f', 2.0, patterns.woodcutH);
  inkRect(ctx, 2394, 314, 18, GROUND_Y - 314, '#8d8677', 2.2, patterns.hatchLight);
  inkRect(ctx, 2528, 314, 18, GROUND_Y - 314, '#8d8677', 2.2, patterns.hatchLight);
  const alleyGrad = ctx.createLinearGradient(2412, 340, 2528, GROUND_Y);
  alleyGrad.addColorStop(0, '#5a564d');
  alleyGrad.addColorStop(0.55, '#3b3832');
  alleyGrad.addColorStop(1, '#262420');
  ctx.fillStyle = alleyGrad;
  ctx.fillRect(2412, 344, 116, GROUND_Y - 344);
  inkRect(ctx, 2386, 310, 168, 28, '#aba392', 2.2);
  inkPoly(
    ctx,
    [
      [2374, 312],
      [2400, 290],
      [2540, 290],
      [2566, 312]
    ],
    '#2f2d2a',
    2.4,
    INK,
    patterns.hatchDense
  );
  inkRect(ctx, 2434, 314, 72, 22, '#221f1c', 1.6);
  ctx.fillStyle = '#efe5cf';
  ctx.font = '700 14px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('老 槐 巷', 2470, 326);
  // Tiny stone shrine niche beside archway root
  inkRect(ctx, 2366, GROUND_Y - 46, 26, 46, '#8f8778', 1.8);
  inkRect(ctx, 2372, GROUND_Y - 34, 14, 24, '#241e1a', 1.4);
  inkLine(ctx, 2379, GROUND_Y - 14, 2379, GROUND_Y - 22, 1.5, CINNABAR);

  // ===== 13. 全景青石板老街路面、路沿台阶、柱影与雨洼微光 =====
  inkRect(ctx, -180, GROUND_Y, 3220, 14, '#a69d8b', 2.2, patterns.hatchLight);
  inkLine(ctx, -180, GROUND_Y + 14, 3040, GROUND_Y + 14, 2.4, INK);

  const roadGrad = ctx.createLinearGradient(0, GROUND_Y + 14, 0, 860);
  roadGrad.addColorStop(0, '#9a9181');
  roadGrad.addColorStop(0.4, '#736c5f');
  roadGrad.addColorStop(1, '#37342e');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(-180, GROUND_Y + 14, 3220, 370);

  const rowYs = [530, 554, 584, 620, 664, 718, 782];
  for (let r = 0; r < rowYs.length - 1; r++) {
    const y0 = rowYs[r];
    const y1 = rowYs[r + 1];
    inkLine(ctx, -180, y1, 3040, y1, 1.35, 'rgba(18, 16, 14, 0.44)');
    const offset = r % 2 === 0 ? 0 : 62;
    for (let c = -3; c <= 26; c++) {
      const topX = 60 + c * 116 + offset;
      const botX = topX - 18;
      inkLine(ctx, topX, y0, botX, y1, 1.1, 'rgba(18, 16, 14, 0.34)');
    }
  }

  ctx.save();
  ctx.fillStyle = 'rgba(20, 18, 16, 0.17)';
  for (const [px] of pillarSpecs) {
    ctx.beginPath();
    ctx.moveTo(px, GROUND_Y + 14);
    ctx.lineTo(px + 34, GROUND_Y + 14);
    ctx.lineTo(px - 68, GROUND_Y + 108);
    ctx.lineTo(px - 106, GROUND_Y + 108);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(222, 214, 194, 0.16)';
  ctx.beginPath();
  ctx.ellipse(640, 578, 96, 12, -0.02, 0, Math.PI * 2);
  ctx.ellipse(1065, 608, 74, 10, 0.03, 0, Math.PI * 2);
  ctx.ellipse(1740, 584, 88, 11, -0.02, 0, Math.PI * 2);
  ctx.ellipse(2260, 604, 78, 10, 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function getStreetStaticCanvas(patterns: ComicPatterns): HTMLCanvasElement | null {
  const existing = streetStaticCacheMap.get(patterns);
  if (existing) return existing;
  if (typeof document === 'undefined') return null;
  const off = document.createElement('canvas');
  off.width = STREET_CACHE_W;
  off.height = STREET_CACHE_H;
  const octx = off.getContext('2d');
  if (!octx) return null;
  octx.translate(-STREET_CACHE_OFFSET_X, -STREET_CACHE_OFFSET_Y);
  drawStreetStaticBase(octx, patterns);
  streetStaticCacheMap.set(patterns, off);
  return off;
}

/** Draws a hanging Qilou corridor lantern swaying gently beneath each arch */
function drawCorridorLantern(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  sway: number,
  tint: 'warm' | 'crimson'
) {
  ctx.save();
  ctx.translate(x, topY);
  ctx.rotate(sway * 0.045);

  inkLine(ctx, 0, 0, 0, 22, 1.6, INK);
  const glow = ctx.createRadialGradient(0, 34, 4, 0, 34, 48);
  glow.addColorStop(0, tint === 'crimson' ? 'rgba(218, 58, 44, 0.36)' : 'rgba(244, 206, 134, 0.32)');
  glow.addColorStop(1, 'rgba(244, 206, 134, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 34, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = tint === 'crimson' ? CINNABAR : '#e9c88a';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(0, 34, 11, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  inkRect(ctx, -6, 19, 12, 4, '#241e19', 1.2);
  inkRect(ctx, -5, 47, 10, 4, '#241e19', 1.2);
  inkLine(ctx, 0, 51, sway * 2, 64, 1.8, CINNABAR);
  ctx.restore();
}

/**
 * 黑白水墨 · 民国线描「双段连片岭南骑楼长街」外景
 * 前街市集：镇集杂货、林氏诊所、柳记裁缝铺；
 * 深街旧坊：德昌茶楼、墨香书肆、城隍香火堂、老槐巷青石牌坊。
 */
export function drawStreetBackdrop(ctx: CanvasRenderingContext2D, opts: StreetDrawOpts) {
  const { state, seconds, slow, patterns, highlightedSpot } = opts;
  const sway = slow ? 0 : Math.sin(seconds * 1.55);
  const swayAlt = slow ? 0 : Math.sin(seconds * 1.2 + 1.3);

  // 1. 离屏缓存一次性绘制全部 6 座连片骑楼与老槐巷石牌坊
  const cached = getStreetStaticCanvas(patterns);
  if (cached) {
    ctx.drawImage(cached, STREET_CACHE_OFFSET_X, STREET_CACHE_OFFSET_Y);
  } else {
    drawStreetStaticBase(ctx, patterns);
  }

  // 2. 高亮光晕（悬停对应建筑或任务卡片时点亮）
  const auraMap: Record<StreetSpotKey, [number, number, number, number]> = {
    grocery: [377, 368, 178, 168],
    clinic: [741, 368, 178, 168],
    tailor: [1095, 368, 168, 168],
    teahouse: [1448, 368, 178, 168],
    bookstore: [1816, 368, 178, 168],
    shrine: [2177, 368, 172, 168],
    alley: [2468, 385, 112, 155]
  };
  if (highlightedSpot && auraMap[highlightedSpot]) {
    const [ax, ay, rx, ry] = auraMap[highlightedSpot];
    drawHighlightAura(ctx, ax, ay, rx, ry, 0.74, true);
  }

  // 3. 六座骑楼廊下悬灯
  drawCorridorLantern(ctx, 377, 326, sway, 'warm');
  drawCorridorLantern(ctx, 741, 326, swayAlt, 'warm');
  drawCorridorLantern(ctx, 1095, 326, sway, 'crimson');
  drawCorridorLantern(ctx, 1448, 326, swayAlt, 'warm');
  drawCorridorLantern(ctx, 1816, 326, sway, 'warm');
  drawCorridorLantern(ctx, 2116, 326, sway, 'crimson');
  drawCorridorLantern(ctx, 2238, 326, swayAlt, 'crimson');

  // 3A. 镇集杂货：廊下旧布幌子
  ctx.save();
  inkLine(ctx, 206, 344, 244, 344, 2.0, INK);
  inkPoly(
    ctx,
    [
      [212, 346],
      [242, 346],
      [242 + sway * 5, 424],
      [212 + sway * 5, 424]
    ],
    '#e4dac3',
    1.8
  );
  drawVerticalCalligraphy(ctx, '纸料杂货', 227 + sway * 2.5, 362, 16, 12, '#221c18');
  ctx.restore();

  // 3B. 林氏诊所：随风轻摆素白分叉门帘
  ctx.save();
  inkPoly(
    ctx,
    [
      [684, 370],
      [740, 370],
      [736 + sway * 4.5, 456],
      [684 + sway * 2.2, 452]
    ],
    '#f5efe1',
    1.8
  );
  inkPoly(
    ctx,
    [
      [748, 370],
      [804, 370],
      [804 + sway * 2.2, 452],
      [754 + sway * 4.5, 456]
    ],
    '#f5efe1',
    1.8
  );
  ctx.restore();

  // 3C. 柳记裁缝：二楼晾晒绸布、朱砂长布招与柳裁缝等身立绘
  inkLine(ctx, 956, 232, 1028, 232, 2.0, INK);
  inkPoly(
    ctx,
    [
      [964, 234],
      [992, 234],
      [992 + swayAlt * 4, 276],
      [964 + swayAlt * 4, 276]
    ],
    '#344650',
    1.6
  );
  inkPoly(
    ctx,
    [
      [996, 234],
      [1020, 234],
      [1020 + sway * 4, 272],
      [996 + sway * 4, 272]
    ],
    '#9a2820',
    1.6
  );

  inkLine(ctx, 1202, 338, 1252, 338, 2.2, INK);
  inkPoly(
    ctx,
    [
      [1212, 340],
      [1246, 340],
      [1248 + sway * 6, 444],
      [1229 + sway * 6, 458],
      [1210 + sway * 6, 444]
    ],
    CINNABAR,
    2.1,
    INK,
    patterns.woodcutV
  );
  drawVerticalCalligraphy(ctx, '柳记裁缝', 1229 + sway * 3, 358, 21, 15, '#fff2dc', INK);
  drawMasterLiuAtArcade(ctx, 1134, GROUND_Y - 4, sway, state.informedDays.includes(state.day), patterns);

  // 3D. 德昌茶楼：茶幌飘动 + 茶壶袅袅热气
  inkLine(ctx, 1564, 340, 1608, 340, 2.0, INK);
  inkPoly(
    ctx,
    [
      [1570, 342],
      [1602, 342],
      [1604 + swayAlt * 5, 428],
      [1586 + swayAlt * 5, 440],
      [1568 + swayAlt * 5, 428]
    ],
    '#d9b56c',
    1.9
  );
  drawVerticalCalligraphy(ctx, '清茶听风', 1586 + swayAlt * 2.5, 358, 18, 13, '#221810');
  // Rising tea steam curls
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 236, 216, 0.42)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 2; i++) {
    const sx = 1412 + i * 7;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y - 110);
    ctx.quadraticCurveTo(sx + sway * 6, GROUND_Y - 128, sx - swayAlt * 5, GROUND_Y - 146);
    ctx.stroke();
  }
  ctx.restore();

  // 3E. 城隍香火堂：袅袅香烟与祈福红绸微摆
  ctx.save();
  ctx.strokeStyle = 'rgba(240, 232, 214, 0.44)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 3; i++) {
    const sx = 2168 + i * 9;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y - 82);
    ctx.bezierCurveTo(
      sx - 6 + sway * 5,
      GROUND_Y - 106,
      sx + 8 + swayAlt * 5,
      GROUND_Y - 130,
      sx + sway * 4,
      GROUND_Y - 156
    );
    ctx.stroke();
  }
  // Swaying prayer ribbons tied near right shrine post
  for (let i = 0; i < 3; i++) {
    const rx = 2292 + i * 9;
    inkLine(ctx, rx, 408, rx + sway * (4 + i), 446 + (i % 2) * 8, 2.6, CINNABAR);
  }
  ctx.restore();

  // 3F. 深街尽头老槐树与阿杰身影
  drawOldLocustTree(ctx, 2502, GROUND_Y, state.rumor && state.day === 4, sway, patterns);

  // 4. 全景斜阳丁达尔光束与飘零槐叶
  ctx.save();
  for (const x0 of [1160, 2240]) {
    const shaft = ctx.createLinearGradient(x0 + 160, 60, x0 - 420, 660);
    shaft.addColorStop(0, 'rgba(255, 248, 228, 0.16)');
    shaft.addColorStop(0.55, 'rgba(255, 246, 220, 0.07)');
    shaft.addColorStop(1, 'rgba(255, 248, 228, 0)');
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 + 320, 0);
    ctx.lineTo(x0 - 100, 650);
    ctx.lineTo(x0 - 580, 650);
    ctx.closePath();
    ctx.fill();
  }

  if (!slow) {
    ctx.fillStyle = 'rgba(42, 38, 32, 0.42)';
    for (let i = 0; i < 9; i++) {
      const t = (seconds * 0.16 + i * 0.13) % 1;
      const baseX = i < 4 ? 1320 : 2500;
      const lx = baseX - t * 480 + Math.sin(seconds * 2.1 + i) * 18;
      const ly = 230 + t * 350;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4.5, 2.0, seconds + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawMasterLiuAtArcade(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  sway: number,
  informed: boolean,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(x, groundY);
  ctx.scale(0.76, 0.76);

  inkPoly(
    ctx,
    [
      [-15, -162],
      [15, -162],
      [35, -138],
      [40, 0],
      [-40, 0],
      [-35, -138]
    ],
    '#2d3034',
    2.3,
    INK,
    patterns.woodcutV
  );
  inkPoly(ctx, [[-11, -164], [11, -164], [13, -152], [-13, -152]], '#f2ead8', 1.8);
  inkLine(ctx, -8, -152, 18, -130, 1.9, CINNABAR);
  inkLine(ctx, 18, -130, 20, -14, 1.7, CINNABAR);

  inkLine(ctx, 22, -98, 54, -126, 3.0, '#d8c59a');
  inkLine(ctx, 22, -98, 54, -126, 1.1, INK);
  inkLine(ctx, 34, -108, 44 + sway * 4, -64, 1.8, CINNABAR);

  ctx.fillStyle = '#efe7d4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.ellipse(0, -186, 17, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#151414';
  ctx.beginPath();
  ctx.arc(0, -199, 17, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15, -194, 7.5, 0, Math.PI * 2);
  ctx.fill();
  inkLine(ctx, 8, -200, 26, -190, 1.9, '#e8dfc9');

  inkLine(ctx, -10, -188, -4, -188, 1.7, INK);
  inkLine(ctx, 4, -188, 10, -188, 1.7, INK);
  inkLine(ctx, -4, -175, 4, -175, 1.5, CINNABAR);

  if (informed) {
    drawRedSeal(ctx, -96, -156, 18, '明');
  }
  ctx.restore();
}

function drawOldLocustTree(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  showAjie: boolean,
  sway: number,
  patterns: ComicPatterns
) {
  ctx.save();
  ctx.translate(cx, groundY);

  inkPoly(
    ctx,
    [
      [26, 0],
      [20, -168],
      [-58, -264],
      [-34, -276],
      [34, -192],
      [96, -272],
      [114, -254],
      [54, -160],
      [64, 0]
    ],
    '#2a2825',
    2.4,
    INK,
    patterns.woodcutV
  );

  drawInkWashBlot(ctx, -36 + sway * 3, -296, 134, 64, 0.72, '24, 23, 21');
  drawInkWashBlot(ctx, 56 + sway * 4, -280, 120, 62, 0.68, '28, 27, 25');
  drawInkWashBlot(ctx, 18 + sway * 2.5, -330, 95, 46, 0.56, '36, 35, 31');

  inkLine(ctx, -42, -238, -46 + sway * 6, -192, 3.0, CINNABAR);
  inkLine(ctx, -18, -246, -21 + sway * 5, -206, 2.4, CINNABAR);

  if (showAjie) {
    ctx.save();
    ctx.translate(-34, -2);
    inkPoly(ctx, [[-17, -130], [17, -130], [23, 0], [-23, 0]], '#3f4446', 2.2);
    ctx.fillStyle = '#ece3d0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, -150, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    inkRect(ctx, 20, -106, 14, 22, '#141516', 1.6);
    ctx.restore();
  }

  ctx.restore();
}
