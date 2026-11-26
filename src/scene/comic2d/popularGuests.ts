import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  INK,
  drawComicSfx,
  drawInkWashBlot,
  drawRedSeal,
  inkLine,
  inkPoly,
  inkRect
} from './textures';

/**
 * 1. 十二生肖面具官 · 「人羊」
 * 修长玄墨立领长风衣 + 骨白双角山羊面具 + 额心金「羊」印 + 朱红眼缝 + 黄铜怀表 + 浮空「谎/真/命」三血牌
 */
export function drawZodiacGoatGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.15) * 2.4;
  const watchSwing = slow ? 0 : Math.sin(seconds * 2.5) * 0.24;
  ctx.save();
  ctx.translate(sway * 0.3, breath * 0.55);

  // Dark sumi + subtle crimson aura
  drawInkWashBlot(ctx, 0, -158, 134, 186, 0.54, '10, 11, 13');
  drawInkWashBlot(ctx, 0, -214, 96, 86, 0.26, '178, 32, 26');

  // Tailored long black trench coat (立领长风衣)
  const coatGrad = ctx.createLinearGradient(-56, -196, 56, 0);
  coatGrad.addColorStop(0, '#232629');
  coatGrad.addColorStop(0.55, '#141618');
  coatGrad.addColorStop(1, '#090a0b');
  inkPoly(
    ctx,
    [[-24, -194], [24, -194], [54, -170], [46, -98], [62, 0], [-62, 0], [-46, -98], [-54, -170]],
    coatGrad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // Crisp coat lapels & crimson inner tie
  inkPoly(ctx, [[-22, -194], [0, -154], [22, -194], [14, -196], [0, -168], [-14, -196]], '#e6dfd0', 1.8);
  inkPoly(ctx, [[-4, -184], [4, -184], [6, -142], [0, -132], [-6, -142]], CINNABAR, 1.6);
  // Wide sharp dark lapels
  inkPoly(ctx, [[-24, -194], [-40, -162], [-18, -144], [0, -154]], '#2d3135', 2.0);
  inkPoly(ctx, [[24, -194], [40, -162], [18, -144], [0, -154]], '#2d3135', 2.0);
  // Double-breasted brass buttons
  for (const by of [-126, -104, -82]) {
    for (const bx of [-13, 13]) {
      ctx.fillStyle = '#d8b468';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // High structured collar
  inkPoly(ctx, [[-26, -194], [-34, -214], [-14, -206], [14, -206], [34, -214], [26, -194]], '#181a1c', 2.2);

  // Left arm dangling a swinging brass pocket watch (催命黄铜怀表)
  ctx.save();
  ctx.translate(-52, -156);
  inkPoly(ctx, [[0, 0], [-22, 34], [-10, 56], [8, 36]], '#1a1c1e', 2.2);
  // Black-gloved hand
  ctx.fillStyle = '#101112';
  ctx.strokeStyle = '#6c7278';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(-14, 52, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Swinging watch chain + brass watch
  ctx.translate(-14, 56);
  ctx.rotate(watchSwing);
  inkLine(ctx, 0, 0, 0, 34, 1.7, '#d8b468');
  ctx.fillStyle = '#cfa34e';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 44, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f4eddc';
  ctx.beginPath();
  ctx.arc(0, 44, 9.5, 0, Math.PI * 2);
  ctx.fill();
  inkLine(ctx, 0, 44, 0, 37, 1.5, INK);
  inkLine(ctx, 0, 44, 5.5, 42, 1.5, CINNABAR);
  ctx.restore();

  // Right arm holding floating crimson rule cards (谎 / 真 / 命)
  const lift = armRaised ? -14 : 0;
  ctx.save();
  ctx.translate(52, -156 + lift);
  inkPoly(ctx, [[0, 0], [22, 22], [14, 44], [-8, 30]], '#1a1c1e', 2.2);
  ctx.fillStyle = '#101112';
  ctx.strokeStyle = '#6c7278';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(16, 36, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const cards: Array<[number, number, number, string]> = [
    [6, -16, -0.26, '谎'],
    [24, -22, 0.04, '真'],
    [42, -12, 0.3, '命']
  ];
  cards.forEach(([cx, cy, rot, ch], i) => {
    const hover = slow ? 0 : Math.sin(seconds * 2.4 + i * 1.3) * 4;
    ctx.save();
    ctx.translate(cx, cy + hover);
    ctx.rotate(rot);
    inkRect(ctx, -11, -17, 22, 34, i === 0 ? CINNABAR : '#f5eee0', 1.9);
    ctx.fillStyle = i === 0 ? '#fdf6e6' : INK;
    ctx.font = '700 13px "Songti SC","STSong",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 1);
    ctx.restore();
  });
  ctx.restore();

  // Bone-white Goat Mask Head (骨白双角羊头面具)
  ctx.save();
  ctx.translate(0, -224);
  ctx.rotate(slow ? 0 : Math.sin(seconds * 0.9) * 0.03);

  // Curved spiral goat horns (双角)
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.fillStyle = '#d6cebe';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(side * 12, -24);
    ctx.bezierCurveTo(side * 30, -54, side * 56, -46, side * 48, -16);
    ctx.bezierCurveTo(side * 44, -28, side * 30, -34, side * 20, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Horn ridge marks
    inkLine(ctx, side * 24, -34, side * 28, -26, 1.3, INK);
    inkLine(ctx, side * 36, -38, side * 37, -30, 1.3, INK);
    ctx.restore();
  }

  // Sculpted bone-white goat mask face
  const maskGrad = ctx.createLinearGradient(-26, -24, 26, 28);
  maskGrad.addColorStop(0, '#f7f2e5');
  maskGrad.addColorStop(0.65, '#e2dac8');
  maskGrad.addColorStop(1, '#b8b09f');
  inkPoly(
    ctx,
    [
      [-21, -24],
      [21, -24],
      [28, -4],
      [18, 18],
      [7, 30],
      [-7, 30],
      [-18, 18],
      [-28, -4]
    ],
    maskGrad,
    2.5,
    INK,
    patterns.hatchLight
  );

  // Sharp triangular cheek contour lines
  inkLine(ctx, -20, -2, -8, 16, 1.3, 'rgba(18,16,15,0.45)');
  inkLine(ctx, 20, -2, 8, 16, 1.3, 'rgba(18,16,15,0.45)');

  // Crimson glowing slit eyes (朱红眼缝)
  for (const side of [-1, 1]) {
    inkPoly(
      ctx,
      [
        [side * 6, -4],
        [side * 19, -8],
        [side * 16, 0],
        [side * 7, 1]
      ],
      '#140e0e',
      1.6
    );
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.ellipse(side * 12.5, -3.5, 4.2, 1.6, side * -0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gold-rimmed cinnabar「羊」seal on forehead
  drawRedSeal(ctx, 0, -14, 13, '羊');

  // Subtle curved mask muzzle line
  inkLine(ctx, -6, 20, 0, 23, 1.6, INK);
  inkLine(ctx, 6, 20, 0, 23, 1.6, INK);
  ctx.restore();

  drawComicSfx(ctx, '咔哒…', -78, -228, 15, 0.72, 'crimson', -0.14);
  ctx.restore();
}

/**
 * 2. 4:44 诡异外卖员（黄泉急送骑手）
 * 黑湿反光雨衣 + 裂纹红纹头盔 + 惨白不眨眼圆瞳 + 渗血 #444 外卖箱 + 五星好评湿回执
 */
export function drawMidnightCourierGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.5) * 2.0;
  ctx.save();
  ctx.translate(sway * 0.3, breath * 0.6);

  drawInkWashBlot(ctx, 0, -154, 136, 180, 0.56, '10, 12, 15');

  // Wet dark raincoat poncho (黑湿反光雨衣 + 朱砂反光条)
  const coatGrad = ctx.createLinearGradient(-58, -196, 58, 0);
  coatGrad.addColorStop(0, '#2a2f34');
  coatGrad.addColorStop(0.5, '#15181b');
  coatGrad.addColorStop(1, '#0b0d0e');
  inkPoly(
    ctx,
    [[-24, -194], [24, -194], [58, -158], [64, -18], [-64, -18], [-58, -158]],
    coatGrad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // Cinnabar reflective stripes across raincoat chest & sleeves
  inkRect(ctx, -46, -124, 92, 9, CINNABAR, 1.8);
  inkLine(ctx, -46, -120, 46, -120, 2.0, '#f4dec0');
  inkRect(ctx, -56, -54, 112, 8, CINNABAR, 1.7);

  // Dripping rain streaks off coat hem
  ctx.save();
  ctx.strokeStyle = 'rgba(202, 214, 216, 0.45)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const dx = -44 + i * 22;
    const dropT = slow ? 0.4 : (seconds * 1.4 + i * 0.27) % 1;
    const dy = -18 + dropT * 24;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx, dy + 8);
    ctx.stroke();
  }
  ctx.restore();

  // Left hand holding steaming blood-stained #444 Delivery Box (渗血 #444 外卖箱)
  ctx.save();
  ctx.translate(-56, -98);
  inkRect(ctx, -30, -24, 58, 50, '#b5281e', 2.4, patterns.hatchLight);
  inkRect(ctx, -32, -30, 62, 10, '#191a1c', 2.2);
  // #444 bone-white tag
  inkRect(ctx, -20, -10, 38, 22, '#f5eee0', 1.8);
  ctx.fillStyle = INK;
  ctx.font = '700 13px "Songti SC","STSong",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('#444', -1, 2);
  // Dark crimson seepage dripping from lid
  inkPoly(ctx, [[-14, -20], [-10, -8], [-6, -20]], '#5e0f0c', 0);
  inkPoly(ctx, [[12, -20], [16, -2], [20, -20]], '#5e0f0c', 0);
  // Cold steam wisps rising from box
  for (let i = 0; i < 2; i++) {
    const t = slow ? 0.4 : (seconds * 0.6 + i * 0.5) % 1;
    ctx.save();
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.45;
    ctx.strokeStyle = '#d4dedb';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10 + i * 18, -32);
    ctx.quadraticCurveTo(-18 + i * 24, -46 - t * 18, -6 + i * 16, -58 - t * 28);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Right hand thrusting wet「五星好评」receipt forward
  const lift = armRaised ? -14 : 0;
  ctx.save();
  ctx.translate(52, -138 + lift);
  inkPoly(ctx, [[-6, -12], [24, 8], [16, 26], [-12, 14]], '#181b1e', 2.2);
  // Fluttering wet yellow receipt with crimson five-star stamp
  ctx.translate(22, 6);
  ctx.rotate(slow ? -0.1 : -0.1 + Math.sin(seconds * 3.1) * 0.08);
  inkRect(ctx, -14, -24, 34, 46, '#f1e6c9', 1.9);
  inkLine(ctx, -8, -14, 14, -14, 1.3, INK);
  inkLine(ctx, -8, -6, 12, -6, 1.3, INK);
  ctx.fillStyle = CINNABAR;
  ctx.font = '700 10px "Songti SC","STSong",serif';
  ctx.textAlign = 'center';
  ctx.fillText('★★★★★', 3, 8);
  ctx.fillText('好评', 3, 18);
  ctx.restore();

  // Cracked Courier Helmet with dark visor & eerie staring eyes (裂纹头盔)
  ctx.save();
  ctx.translate(0, -220);
  ctx.fillStyle = '#1b1d20';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, -2, 30, Math.PI * 0.85, Math.PI * 2.15);
  ctx.lineTo(24, 24);
  ctx.quadraticCurveTo(0, 32, -24, 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cinnabar helmet racing stripe
  inkPoly(ctx, [[-6, -32], [6, -32], [8, -10], [-8, -10]], CINNABAR, 1.7);

  // Dark cracked visor
  inkPoly(ctx, [[-24, -10], [24, -10], [20, 12], [-20, 12]], '#0c0d0e', 2.0);
  // Visor crack lines
  inkLine(ctx, 14, -10, 6, 2, 1.4, '#ebe4d4');
  inkLine(ctx, 6, 2, 12, 10, 1.2, '#ebe4d4');
  inkLine(ctx, 6, 2, -2, 5, 1.1, '#ebe4d4');

  // Two stark white staring pupils peering through dark visor
  for (const ex of [-9, 9]) {
    ctx.fillStyle = '#f5f0e1';
    ctx.beginPath();
    ctx.ellipse(ex, 0, 5.2, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090909';
    ctx.beginPath();
    ctx.arc(ex, 0, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawComicSfx(ctx, '叮咚…', 70, -226, 15, 0.74, 'crimson', 0.14);
  ctx.restore();
}

/**
 * 3. 笑面诡医 · 三号病房手术师
 * 朱砂血点旧白大褂 + 红线缝笑口罩 + 寒光手术刀 + 墨黑阴液吊瓶
 */
export function drawSmilingSurgeonGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.2) * 2.2;
  ctx.save();
  ctx.translate(sway * 0.3, breath * 0.6);

  drawInkWashBlot(ctx, 0, -156, 138, 182, 0.48, '12, 14, 15');

  // Stained off-white Republican doctor's coat (旧白大褂 + 朱砂斑点)
  const coatGrad = ctx.createLinearGradient(-54, -196, 54, 0);
  coatGrad.addColorStop(0, '#ebe5d6');
  coatGrad.addColorStop(0.65, '#d1cab8');
  coatGrad.addColorStop(1, '#9c9584');
  inkPoly(
    ctx,
    [[-22, -194], [22, -194], [52, -168], [46, -88], [58, 0], [-58, 0], [-46, -88], [-52, -168]],
    coatGrad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // Inner dark vest & collar
  inkPoly(ctx, [[-18, -194], [0, -148], [18, -194]], '#202224', 2.0);
  // Cinnabar ink splatters on doctor coat
  drawInkWashBlot(ctx, -22, -112, 26, 22, 0.52, '182, 34, 26');
  drawInkWashBlot(ctx, 18, -68, 22, 26, 0.44, '168, 28, 22');
  // Red cross ward badge on chest pocket
  inkRect(ctx, 14, -150, 22, 24, '#f6f0e0', 1.6);
  inkLine(ctx, 25, -145, 25, -133, 3.2, CINNABAR);
  inkLine(ctx, 19, -139, 31, -139, 3.2, CINNABAR);

  // Left hand holding IV pole/bag dripping black ink (黑墨输液袋)
  ctx.save();
  ctx.translate(-56, -148);
  inkPoly(ctx, [[4, 0], [-14, 32], [-4, 48], [14, 24]], '#dfd8c7', 2.1);
  // Hanging glass IV bottle
  const ivSwing = slow ? 0 : Math.sin(seconds * 2.1) * 0.14;
  ctx.translate(-14, 42);
  ctx.rotate(ivSwing);
  inkLine(ctx, 0, -28, 0, -4, 2.0, INK);
  inkRect(ctx, -13, -4, 26, 40, '#e8eceb', 2.0);
  // Black eerie liquid inside IV bottle
  inkRect(ctx, -11, 10, 22, 24, '#141718', 0);
  inkLine(ctx, 0, 36, 4, 62, 1.8, '#16191a');
  ctx.restore();

  // Right hand spinning glinting scalpel (手术刀)
  const lift = armRaised ? -16 : 0;
  ctx.save();
  ctx.translate(54, -146 + lift);
  inkPoly(ctx, [[-4, -6], [22, 12], [14, 30], [-10, 18]], '#dfd8c7', 2.1);
  // Pale surgical glove + glinting scalpel
  ctx.fillStyle = '#f3eee0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(18, 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.translate(22, 16);
  ctx.rotate(slow ? -0.4 : -0.4 + Math.sin(seconds * 3.4) * 0.16);
  inkLine(ctx, -14, 8, 12, -10, 3.2, '#4a4e52');
  inkPoly(ctx, [[10, -10], [28, -22], [22, -8]], '#f7fafc', 1.7);
  inkLine(ctx, 20, -17, 26, -19, 1.8, CINNABAR);
  ctx.restore();

  // Head with doctor cap, circular reflector mirror, and stitched-smile gauze mask
  ctx.save();
  ctx.translate(0, -222);
  // Chalk-pale face
  ctx.fillStyle = '#f2ece0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 23, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Slicked dark hair & doctor head-mirror band
  inkPoly(ctx, [[-24, -8], [-22, -26], [0, -32], [22, -26], [24, -8], [16, -18], [-16, -18]], '#161718', 2.0);
  inkLine(ctx, -24, -15, 24, -15, 3.0, '#2a2d30');
  // Metallic ENT forehead mirror
  ctx.fillStyle = '#eef4f5';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, -18, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(0, -18, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Narrow smiling crescent eyes (弯成月牙的眯笑眼)
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * 9, -4, 5.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  // Gauze surgical mask with oversized stitched crimson smile (缝线笑口口罩)
  inkPoly(ctx, [[-21, 2], [21, 2], [18, 23], [0, 28], [-18, 23]], '#f9f6ee', 2.1);
  // Giant upturned crimson smile stitched across the gauze
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, 9);
  ctx.quadraticCurveTo(0, 24, 16, 9);
  ctx.stroke();
  // Cross-stitches along the crimson smile
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  for (const sx of [-11, -5.5, 0, 5.5, 11]) {
    const sy = 11 + (1 - Math.abs(sx) / 16) * 6;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 3.5);
    ctx.lineTo(sx, sy + 3.5);
    ctx.stroke();
  }
  ctx.restore();

  drawComicSfx(ctx, '喀嚓…', 70, -220, 14, 0.72, 'crimson', 0.1);
  ctx.restore();
}

/**
 * 4. 四楼琴房 · 血红衣学姐
 * 民国蓝襟血红裙摆女学生装 + 及腰墨发遮半脸 + 染红《安魂曲》残谱 + 断弦琴弓 + 浮空水墨音符
 */
export function drawCrimsonSeniorGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.1) * 2.6;
  const hairWave = slow ? 0 : Math.sin(seconds * 1.7) * 4;
  ctx.save();
  ctx.translate(sway * 0.35, breath * 0.65);

  drawInkWashBlot(ctx, 0, -150, 134, 182, 0.48, '148, 26, 22');

  // Waist-length ink-black hair cascading behind shoulders
  inkPoly(
    ctx,
    [
      [-28, -234],
      [28, -234],
      [42 + hairWave * 0.4, -158],
      [34 + hairWave, -86],
      [-34 + hairWave * 0.8, -86],
      [-42 + hairWave * 0.4, -158]
    ],
    '#101112',
    2.2
  );

  // Republican girl-student pleated crimson skirt (血红百褶长裙)
  const skirtGrad = ctx.createLinearGradient(0, -116, 0, 0);
  skirtGrad.addColorStop(0, '#9c1e18');
  skirtGrad.addColorStop(0.6, '#6e1412');
  skirtGrad.addColorStop(1, '#2d0a0a');
  inkPoly(ctx, [[-34, -114], [34, -114], [58, 0], [-58, 0]], skirtGrad, 2.5, INK, patterns.woodcutV);
  for (const px of [-26, -13, 0, 13, 26]) {
    inkLine(ctx, px, -112, px * 1.6, -2, 1.3, 'rgba(12, 8, 8, 0.56)');
  }

  // Republican slanted-lapel student blouse (民国女校青蓝斜襟袄，下摆染红)
  const topGrad = ctx.createLinearGradient(0, -196, 0, -108);
  topGrad.addColorStop(0, '#4a6070');
  topGrad.addColorStop(0.68, '#364552');
  topGrad.addColorStop(1, '#7a1c19');
  inkPoly(
    ctx,
    [[-18, -194], [18, -194], [44, -172], [36, -110], [-36, -110], [-44, -172]],
    topGrad,
    2.4,
    INK,
    patterns.woodcutV
  );
  // Slanted collar & pale frog buttons
  inkLine(ctx, -12, -192, 22, -162, 2.2, '#ebe4d4');
  inkLine(ctx, 22, -162, 24, -112, 2.0, '#ebe4d4');
  for (const by of [-166, -150, -134]) {
    inkLine(ctx, 18, by, 26, by, 2.0, '#f4ecdc');
  }
  // White stand collar
  inkPoly(ctx, [[-14, -198], [14, -198], [17, -188], [-17, -188]], '#f2ecde', 2.0);

  // Arms holding crimson-stained sheet music & broken violin bow
  const lift = armRaised ? -10 : 0;
  // Left arm cradling stained score
  inkPoly(ctx, [[-40, -172], [-54, -124], [-22, -110], [-14, -132], [-30, -150]], '#3c4e5c', 2.2);
  ctx.save();
  ctx.translate(-26, -120 + lift * 0.4);
  ctx.rotate(-0.18);
  inkRect(ctx, -20, -24, 40, 48, '#f5eee0', 2.0);
  // Music staves + crimson stain
  for (let sy = -14; sy <= 14; sy += 7) {
    inkLine(ctx, -14, sy, 14, sy, 1.0, '#3a3836');
  }
  drawInkWashBlot(ctx, 8, 10, 18, 16, 0.56, '192, 34, 26');
  ctx.restore();

  // Right arm holding tilted violin bow with snapped crimson horsehair
  inkPoly(ctx, [[40, -172], [56, -132 + lift], [38, -120 + lift], [28, -150]], '#3c4e5c', 2.2);
  ctx.save();
  ctx.translate(48, -128 + lift);
  ctx.rotate(slow ? -0.45 : -0.45 + Math.sin(seconds * 1.9) * 0.08);
  inkLine(ctx, -12, 34, 24, -64, 3.0, '#3c251c');
  // Snapped dangling crimson bow string
  inkLine(ctx, 22, -60, 12, -16, 1.4, CINNABAR);
  inkLine(ctx, -8, 30, 8, -4, 1.2, CINNABAR);
  ctx.restore();

  // Porcelain-pale head with bangs veiling left eye
  ctx.save();
  ctx.translate(0, -222);
  ctx.fillStyle = '#f6f1e4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 21, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Long ink bangs veiling left half of face
  inkPoly(
    ctx,
    [[-22, -6], [-20, -26], [0, -30], [20, -25], [22, -6], [12, -16], [2, -12], [-4, 24], [-18, 20]],
    '#101112',
    1.8
  );
  // Single uncovered melancholy dark eye on right with faint crimson tear dot
  ctx.fillStyle = '#0e0d0d';
  ctx.beginPath();
  ctx.ellipse(9, -1, 4.2, 3.0, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(8, -2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.arc(10.5, 5.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Quiet crimson lips
  inkLine(ctx, -1, 12, 8, 12, 2.0, CINNABAR);
  ctx.restore();

  // Floating eerie musical notes around her
  const notes: Array<[number, number, number]> = [
    [-68, -204, 0],
    [64, -222, 1.8],
    [76, -172, 3.2]
  ];
  notes.forEach(([nx, ny, ph]) => {
    const fy = slow ? 0 : Math.sin(seconds * 2.1 + ph) * 6;
    ctx.save();
    ctx.translate(nx, ny + fy);
    ctx.fillStyle = ph === 1.8 ? CINNABAR : '#f2ead8';
    ctx.font = '700 18px serif';
    ctx.fillText('♪', 0, 0);
    ctx.restore();
  });

  ctx.restore();
}

/**
 * 5. 坐忘红中客 · 倒悬骰子戏子
 * 补丁水墨朱砂破道袍 + 歪扣麻将「红中」白骨面具 + 咧嘴森白狂笑 + 浮空三骨骰 + 破「骗」幡
 */
export function drawZuowangJesterGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 2.1) * 4.0;
  ctx.save();
  ctx.translate(sway * 0.4, breath * 0.7);

  drawInkWashBlot(ctx, 0, -154, 146, 186, 0.52, '168, 28, 22');

  // Tattered「骗」banner fluttering behind shoulder
  ctx.save();
  ctx.translate(-56, -182);
  ctx.rotate(slow ? -0.18 : -0.18 + Math.sin(seconds * 2.6) * 0.08);
  inkLine(ctx, 0, 120, 0, -68, 3.0, '#3a2d24');
  inkPoly(ctx, [[0, -64], [-34, -58], [-28, -22], [-38, -6], [-18, -12], [0, -8]], '#f0e6cf', 2.0);
  ctx.fillStyle = CINNABAR;
  ctx.font = '700 20px "Songti SC","STSong",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('骗', -17, -36);
  ctx.restore();

  // Patchwork ragged Daoist robe (补丁水墨朱砂破道袍)
  const robeGrad = ctx.createLinearGradient(-56, -196, 56, 0);
  robeGrad.addColorStop(0, '#2a2826');
  robeGrad.addColorStop(0.5, '#191716');
  robeGrad.addColorStop(1, '#0e0d0d');
  inkPoly(
    ctx,
    [[-22, -192], [22, -192], [56, -162], [44, -92], [66, 0], [-66, 0], [-44, -92], [-56, -162]],
    robeGrad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // Asymmetric cinnabar & bone patches stitched onto robe
  inkRect(ctx, -34, -152, 28, 24, CINNABAR, 1.9);
  inkRect(ctx, 12, -118, 26, 26, '#dfd5be', 1.8);
  inkRect(ctx, -28, -68, 32, 24, '#8d1f19', 1.9);
  // Rough hemp waist rope
  inkLine(ctx, -42, -96, 42, -92, 5.0, '#b49c70');
  inkLine(ctx, -42, -96, 42, -92, 1.6, INK);

  // Wide gesturing sleeves + hovering bone dice (浮空三颗白骨骰)
  const lift = armRaised ? -14 : 0;
  inkPoly(ctx, [[-48, -164], [-74, -126], [-50, -104], [-32, -138]], '#23201e', 2.2);
  inkPoly(ctx, [[48, -164], [76, -132 + lift], [52, -108 + lift], [34, -140]], '#99221b', 2.2);

  // Three levitating bone dice orbiting right palm
  const dicePos: Array<[number, number, number]> = [
    [54, -168 + lift, 0],
    [78, -150 + lift, 2.1],
    [66, -128 + lift, 4.2]
  ];
  dicePos.forEach(([dx, dy, ph], idx) => {
    const hover = slow ? 0 : Math.sin(seconds * 3.4 + ph) * 5;
    const rot = slow ? idx * 0.4 : seconds * 1.4 + ph;
    ctx.save();
    ctx.translate(dx, dy + hover);
    ctx.rotate(rot);
    inkRect(ctx, -8, -8, 16, 16, '#f6efe0', 1.7);
    ctx.fillStyle = idx === 0 ? CINNABAR : INK;
    ctx.beginPath();
    ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
    ctx.fill();
    if (idx > 0) {
      ctx.beginPath();
      ctx.arc(-4, -4, 1.5, 0, Math.PI * 2);
      ctx.arc(4, 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Head: Disheveled wild hair + Tilted Mahjong「红中」Mask + Manic Grin underneath!
  ctx.save();
  ctx.translate(0, -222);
  // Wild spiky ink hair
  inkPoly(
    ctx,
    [[-34, -12], [-28, -36], [-12, -28], [0, -40], [14, -28], [30, -34], [34, -10], [24, 10], [-24, 10]],
    '#141313',
    2.2
  );
  // Manic grinning jaw peeking below the tilted mahjong tile
  ctx.fillStyle = '#e8dfd0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.ellipse(2, 16, 16, 12, 0.08, 0, Math.PI);
  ctx.fill();
  ctx.stroke();
  // Grinning teeth line
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-10, 15);
  ctx.quadraticCurveTo(2, 24, 14, 15);
  ctx.quadraticCurveTo(2, 19, -10, 15);
  ctx.fill();
  ctx.stroke();

  // Iconic tilted white bone Mahjong「红中」Tile Mask (歪戴麻将红中面具!)
  ctx.save();
  ctx.rotate(slow ? -0.1 : -0.1 + Math.sin(seconds * 2.8) * 0.06);
  // Jade-green back bevel of mahjong tile
  inkRect(ctx, -23, -30, 46, 52, '#2d5a47', 2.2);
  // Crisp ivory front face of mahjong tile
  inkRect(ctx, -20, -27, 42, 48, '#fbf6ea', 2.4);
  // Bold piercing cinnabar「中」calligraphy!
  ctx.fillStyle = CINNABAR;
  ctx.font = '900 32px "Songti SC","STSong",serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('中', 1, -2);
  // Two tiny dark peepholes hidden in the upper corners
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-11, -15, 2.2, 0, Math.PI * 2);
  ctx.arc(13, -15, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  drawComicSfx(ctx, '哈哈!', 66, -232, 17, 0.78, 'crimson', 0.16);
  ctx.restore();
}

/**
 * 6. 镜廊双生 · 提线木偶师
 * 苍白黑礼服执线师 + 高举木质十字提线架 + 绷紧朱砂丝 + 臂弯歪头90度咧嘴小红纸木偶
 */
export function drawPuppetTwinsGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.15) * 2.2;
  const puppetTilt = slow ? 0.32 : 0.28 + Math.sin(seconds * 2.9) * 0.16;
  ctx.save();
  ctx.translate(sway * 0.3, breath * 0.55);

  drawInkWashBlot(ctx, 0, -154, 142, 184, 0.52, '12, 11, 13');

  // Tall slender monochrome tailcoat of the Puppeteer (修长黑礼服)
  const coatGrad = ctx.createLinearGradient(-48, -196, 48, 0);
  coatGrad.addColorStop(0, '#222427');
  coatGrad.addColorStop(0.6, '#131416');
  coatGrad.addColorStop(1, '#08090a');
  inkPoly(
    ctx,
    [[-18, -196], [18, -196], [44, -172], [36, -96], [52, 0], [-52, 0], [-36, -96], [-44, -172]],
    coatGrad,
    2.5,
    INK,
    patterns.woodcutV
  );
  // Crisp ivory ruffled cravat & crimson ribbon
  inkPoly(ctx, [[-12, -194], [12, -194], [8, -156], [0, -148], [-8, -156]], '#f2ecde', 1.8);
  inkPoly(ctx, [[-10, -184], [10, -184], [6, -178], [-6, -178]], CINNABAR, 1.5);

  // Puppeteer's pale solemn head (slightly shifted left so right side frames the suspended puppet)
  ctx.save();
  ctx.translate(-8, -224);
  ctx.fillStyle = '#efe9dc';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Neat parted dark hair
  inkPoly(ctx, [[-21, -8], [-18, -28], [0, -31], [19, -26], [21, -8], [10, -17], [-6, -19]], '#141516', 2.0);
  // Tired shadowed eyes with faint vertical puppet-joint lines at mouth corners
  for (const ex of [-7, 7]) {
    ctx.fillStyle = '#141313';
    ctx.beginPath();
    ctx.ellipse(ex, -2, 3.6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    inkLine(ctx, ex - 4, 2, ex + 4, 2, 1.0, 'rgba(20, 18, 18, 0.42)');
  }
  inkLine(ctx, -6, 12, 6, 12, 1.6, INK);
  inkLine(ctx, -6, 12, -6, 22, 1.1, 'rgba(18, 16, 16, 0.5)');
  inkLine(ctx, 6, 12, 6, 22, 1.1, 'rgba(18, 16, 16, 0.5)');
  ctx.restore();

  // Raised right arm holding Wooden Cross Control Bar (高举木十字提线架)
  const lift = armRaised ? -10 : 0;
  inkPoly(ctx, [[32, -172], [58, -196 + lift], [66, -182 + lift], [42, -154]], '#181a1c', 2.2);
  const barX = 62;
  const barY = -196 + lift;
  inkLine(ctx, barX - 24, barY - 8, barX + 26, barY + 6, 4.4, '#8b6840');
  inkLine(ctx, barX - 24, barY - 8, barX + 26, barY + 6, 1.5, INK);
  inkLine(ctx, barX - 10, barY + 12, barX + 12, barY - 14, 4.0, '#725332');
  inkLine(ctx, barX - 10, barY + 12, barX + 12, barY - 14, 1.4, INK);

  // Taut Cinnabar Marionette Strings leading down to the Crimson Twin Puppet!
  const px = 58;
  const py = -96;
  inkLine(ctx, barX, barY, px, py - 34, 1.4, CINNABAR);
  inkLine(ctx, barX - 20, barY - 6, px - 18, py - 8, 1.3, CINNABAR);
  inkLine(ctx, barX + 22, barY + 5, px + 18, py - 10, 1.3, CINNABAR);
  inkLine(ctx, barX - 6, barY + 8, px - 8, py + 24, 1.1, 'rgba(204, 46, 34, 0.72)');

  // Miniature Crimson-Robed Ventriloquist Paper Puppet (咧嘴歪头小红纸木偶!)
  ctx.save();
  ctx.translate(px, py);
  // Puppet crimson dress
  inkPoly(ctx, [[-11, -18], [11, -18], [20, 22], [-20, 22]], CINNABAR, 2.0);
  inkLine(ctx, -18, 22, 18, 22, 2.0, '#f4ecdc');
  // Stiff jointed puppet arms
  inkLine(ctx, -10, -14, -22, -4, 4.0, '#f5efe0');
  inkLine(ctx, -10, -14, -22, -4, 1.4, INK);
  inkLine(ctx, 10, -14, 22, -6, 4.0, '#f5efe0');
  inkLine(ctx, 10, -14, 22, -6, 1.4, INK);
  // Dangling little legs
  inkLine(ctx, -7, 22, -9, 36, 3.6, '#f5efe0');
  inkLine(ctx, 7, 22, 9, 36, 3.6, '#f5efe0');

  // Puppet head tilting sharply 90-ish degrees with glowing blush dots & uncanny grin
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(puppetTilt);
  ctx.fillStyle = '#fbf6ea';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Twin hair buns
  ctx.fillStyle = '#121111';
  ctx.beginPath();
  ctx.arc(-13, -10, 5.5, 0, Math.PI * 2);
  ctx.arc(13, -10, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Round staring pin-dot eyes + bright cinnabar blush dots
  ctx.fillStyle = '#0c0b0b';
  ctx.beginPath();
  ctx.arc(-5, -2, 2.4, 0, Math.PI * 2);
  ctx.arc(5, -2, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.arc(-8.5, 3, 2.5, 0, Math.PI * 2);
  ctx.arc(8.5, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Hinged wooden jaw grin
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-6, 5);
  ctx.quadraticCurveTo(0, 11, 6, 5);
  ctx.stroke();
  inkLine(ctx, -5, 5, -5, 13, 1.0, INK);
  inkLine(ctx, 5, 5, 5, 13, 1.0, INK);
  ctx.restore();
  ctx.restore();

  drawComicSfx(ctx, '咯咯…', 76, -158, 15, 0.78, 'crimson', 0.14);
  ctx.restore();
}
