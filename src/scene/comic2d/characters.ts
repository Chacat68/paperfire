import type { ComicPatterns } from './textures';
import {
  CINNABAR,
  CINNABAR_DARK,
  INK,
  drawComicSfx,
  drawHighlightAura,
  drawInkWashBlot,
  inkLine,
  inkPoly,
  inkRect,
  lerpColor
} from './textures';

export interface PaperDollDrawOpts {
  x: number;
  y: number;
  posture: number; // 0 = eerily standing/sitting stiffly up, 1 = properly seated
  threat: number;
  seconds: number;
  slow: boolean;
  darkness: number;
  highlighted: boolean;
  dollTwitch: number; // 0..1 eerie head-tilt & narrow-eye jerk from eerieEvents
  cursorLookX: number; // -1..1 subtle pupil tracking toward mouse cursor
  cursorLookY: number; // -1..1
  patterns: ComicPatterns;
}

/**
 * 黑白水墨 · 民国线描 · 朱砂点睛「纸人」
 * Stark chalk-white Xuan paper face, fine parallel engraving shadows,
 * piercing cinnabar cheeks/lips/robe, and unblinking ink pupils that track the cursor & twitch!
 */
export function drawComicPaperDoll(ctx: CanvasRenderingContext2D, opts: PaperDollDrawOpts) {
  const {
    x,
    y,
    posture,
    threat,
    seconds,
    slow,
    highlighted,
    dollTwitch,
    cursorLookX,
    cursorLookY,
    patterns
  } = opts;
  const tense = threat >= 3 && posture < 0.85;
  const creepSway = slow ? 0 : Math.sin(seconds * 1.1) * (1.6 - posture * 1.2);
  const standLift = (1 - posture) * 36;

  ctx.save();
  ctx.translate(x, y);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -108 - standLift * 0.5, 94, 150, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  // Sumi ink-wash gloom + subtle cinnabar miasma behind unseated paper doll
  if (posture < 0.92) {
    const auraAlpha = (1 - posture) * (tense ? 0.72 : 0.45);
    drawInkWashBlot(ctx, 0, -106, 136, 158, auraAlpha, '8, 9, 10');
    drawInkWashBlot(ctx, 0, -104, 92, 110, tense ? auraAlpha * 0.44 : auraAlpha * 0.18, '158, 26, 20');

    // Rising sumi ink wisps behind shoulders
    ctx.save();
    ctx.globalAlpha = auraAlpha * 0.5;
    ctx.strokeStyle = '#09090a';
    ctx.lineWidth = 2.6;
    for (const side of [-1, 1]) {
      const wave = slow ? 0 : Math.sin(seconds * 1.7 + side) * 8;
      ctx.beginPath();
      ctx.moveTo(side * 34, -70);
      ctx.bezierCurveTo(side * 66 + wave, -120, side * 40 - wave, -178, side * 56, -228);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Contact ink shadow under bamboo stool
  drawInkWashBlot(ctx, 0, 12, 78, 18, 0.72, '8, 8, 9');

  // 1. 线描老竹凳 (Monochrome ink bamboo stool with horizontal woodcut shading)
  inkPoly(ctx, [[-48, -46], [48, -46], [56, -34], [-56, -34]], '#57534a', 2.2, INK, patterns.woodcutH);
  inkLine(ctx, -40, -34, -49, 12, 6, '#3e3b35');
  inkLine(ctx, -40, -34, -49, 12, 1.8, INK);
  inkLine(ctx, 40, -34, 49, 12, 6, '#3e3b35');
  inkLine(ctx, 40, -34, 49, 12, 1.8, INK);
  inkLine(ctx, -44, -10, 44, -10, 4.2, '#3d3a34');
  inkLine(ctx, -44, -10, 44, -10, 1.6, INK);

  // 2. 惨白纸腿与白底黑布鞋
  const legDrop = posture * 18;
  for (const side of [-1, 1]) {
    const lx = side * 16;
    inkPoly(
      ctx,
      [
        [lx - 7, -58 - standLift * 0.72],
        [lx + 7, -58 - standLift * 0.72],
        [lx + 6, -6 - standLift * 0.4 + legDrop * 0.3],
        [lx - 6, -6 - standLift * 0.4 + legDrop * 0.3]
      ],
      '#e7e1d4',
      2.0,
      INK,
      patterns.woodcutV
    );
    const sy = -4 - standLift * 0.4 + legDrop * 0.3;
    inkPoly(
      ctx,
      [
        [lx - 8, sy - 4],
        [lx + 8, sy - 4],
        [lx + 11 * side + 5, sy + 11],
        [lx - 11, sy + 11]
      ],
      '#121111',
      2.0
    );
    inkLine(ctx, lx - 10, sy + 11, lx + 11 * side + 5, sy + 11, 2.5, '#f2ece0');
  }

  // 3. 朱砂点睛纸袍 (Stark Cinnabar Robe + Crisp Sumi Ink Folds + Bone-White Collar)
  ctx.save();
  ctx.translate(creepSway * 0.45, -standLift);

  const robeGrad = ctx.createLinearGradient(-48, -162, 48, -42);
  robeGrad.addColorStop(0, CINNABAR);
  robeGrad.addColorStop(0.58, '#8d1e18');
  robeGrad.addColorStop(1, '#44100f');

  inkPoly(
    ctx,
    [
      [-18, -158],
      [18, -158],
      [38, -142],
      [34, -104],
      [48, -42],
      [-48, -42],
      [-34, -104],
      [-38, -142]
    ],
    robeGrad,
    2.5,
    INK,
    patterns.woodcutV
  );

  // Fine origami creases & internal bamboo cross-splints
  inkLine(ctx, -18, -150, -30, -46, 1.3, 'rgba(14,10,10,0.65)');
  inkLine(ctx, 18, -150, 30, -46, 1.3, 'rgba(14,10,10,0.65)');
  inkLine(ctx, 0, -146, 0, -44, 1.0, 'rgba(14,10,10,0.4)');

  // Pale bone-gold medallion motif on chest
  ctx.strokeStyle = 'rgba(238, 224, 192, 0.62)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, -124, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -124, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Dark sumi-ink lower hem trim
  inkPoly(ctx, [[-47, -54], [47, -54], [49, -42], [-49, -42]], '#1e2223', 2.0);
  inkLine(ctx, -47, -54, 47, -54, 1.6, '#e8dfc9');

  // Right-overlapping pale-ivory lapel trim
  ctx.strokeStyle = '#efe5cf';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-12, -156);
  ctx.lineTo(15, -124);
  ctx.lineTo(22, -54);
  ctx.stroke();
  inkLine(ctx, -12, -156, 15, -124, 1.1, INK);

  // Stark white paper stand collar
  inkPoly(ctx, [[-14, -164], [14, -164], [19, -152], [-19, -152]], '#f4eee0', 2.1);
  inkLine(ctx, 0, -164, 0, -152, 1.3, INK);

  // Waist sash & fluttering double ribbons
  inkRect(ctx, -35, -104, 70, 11, '#c82b20', 2.1);
  inkPoly(ctx, [[-12, -93], [-3, -93], [-8, -54], [-18, -57]], '#c82b20', 1.9);
  inkPoly(ctx, [[3, -93], [12, -93], [18, -56], [8, -53]], '#c82b20', 1.9);

  // 4. 宽袖与细长纸手
  for (const side of [-1, 1]) {
    const raise = (1 - posture) * 11;
    inkPoly(
      ctx,
      [
        [side * 28, -152],
        [side * 54, -132 - raise * 0.3],
        [side * 62, -74 - raise],
        [side * 34, -70 - raise],
        [side * 30, -116]
      ],
      '#8d1f19',
      2.4,
      INK,
      patterns.woodcutV
    );
    inkLine(ctx, side * 40, -132, side * 48, -76 - raise, 1.3, 'rgba(14,10,10,0.62)');
    inkLine(ctx, side * 34, -72 - raise, side * 61, -76 - raise, 4.2, '#1d2021');
    inkLine(ctx, side * 34, -72 - raise, side * 61, -76 - raise, 1.4, '#e9e1cf');
    // Stiff porcelain-white paper hands
    inkPoly(
      ctx,
      [
        [side * 42, -72 - raise],
        [side * 55, -72 - raise],
        [side * 53, -49 - raise],
        [side * 45, -47 - raise],
        [side * 41, -56 - raise]
      ],
      '#f5f0e3',
      1.9
    );
    inkLine(ctx, side * 46, -62 - raise, side * 46, -49 - raise, 1.0, INK);
    inkLine(ctx, side * 50, -63 - raise, side * 50, -50 - raise, 1.0, INK);
  }

  // 5. 纸人头颅：宣纸惨白尖颌脸 + 民国竖向排线阴翳 + 随鼠标与微事件转动的针尖黑瞳
  const twitchAngle = (1 - posture) * dollTwitch * -0.17;
  const headTilt = (1 - posture) * (tense ? -0.15 : -0.07) + twitchAngle + creepSway * 0.014;
  ctx.save();
  ctx.translate(0, -188);
  ctx.rotate(headTilt);

  // Paper neck with crisp chin shadow
  inkRect(ctx, -7, 12, 14, 22, '#e6dfd0', 2.0);
  ctx.fillStyle = 'rgba(14, 13, 13, 0.5)';
  ctx.fillRect(-6, 13, 12, 8);

  // Chalk-white refined oval paper face
  ctx.save();
  ctx.fillStyle = '#f6f1e4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.bezierCurveTo(25, -36, 26, -6, 20, 12);
  ctx.bezierCurveTo(14, 25, 6, 30, 0, 31);
  ctx.bezierCurveTo(-6, 30, -14, 25, -20, 12);
  ctx.bezierCurveTo(-26, -6, -25, -36, 0, -36);
  ctx.closePath();
  ctx.fill();

  // Republican-era fine vertical engraving brow shadow
  ctx.save();
  ctx.clip();
  const faceShade = ctx.createLinearGradient(0, -38, 0, 14);
  faceShade.addColorStop(0, 'rgba(11, 12, 13, 0.68)');
  faceShade.addColorStop(0.45, 'rgba(11, 12, 13, 0.24)');
  faceShade.addColorStop(1, 'rgba(11, 12, 13, 0)');
  ctx.fillStyle = faceShade;
  ctx.fillRect(-30, -40, 60, 56);
  if (patterns.woodcutV) {
    ctx.globalAlpha = tense || dollTwitch > 0.2 ? 0.72 : 0.45;
    ctx.fillStyle = patterns.woodcutV;
    ctx.fillRect(-30, -40, 60, 28);
  }
  ctx.restore();
  ctx.stroke();
  ctx.restore();

  // Gaze tracks cursor subtly + drifts eerily toward viewer!
  const gazeX = (1 - posture) * ((tense ? -4.2 : -2.8) + cursorLookX * 2.1);
  const gazeY = posture * 2.2 - (1 - posture) * 0.8 + (1 - posture) * cursorLookY * 1.4;

  // Piercing cinnabar circular cheek blush (纸人圆腮红)
  ctx.fillStyle = 'rgba(204, 34, 26, 0.84)';
  ctx.beginPath();
  ctx.arc(-13.5, 4, 6.2, 0, Math.PI * 2);
  ctx.arc(13.5, 4, 6.2, 0, Math.PI * 2);
  ctx.fill();

  // Willow-leaf ink eyebrows
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(-18, -13);
  ctx.quadraticCurveTo(-10, -21, -3, -14);
  ctx.moveTo(3, -14);
  ctx.quadraticCurveTo(10, -21, 18, -13);
  ctx.stroke();

  // Sharp phoenix-slit eyes (narrowing into chilling smile-slits during dollTwitch!)
  const eyeNarrow = posture > 0.75 || dollTwitch > 0.35;
  for (const side of [-1, 1]) {
    const ex = side * 10.5;
    ctx.save();
    ctx.fillStyle = '#fcf9f0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - 7.5, -7);
    ctx.quadraticCurveTo(ex, eyeNarrow ? -7.2 : -11.5, ex + 7.5, -8.5);
    ctx.quadraticCurveTo(ex, eyeNarrow ? -5.4 : -4.2, ex - 7.5, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (posture < 0.85) {
      ctx.fillStyle = '#090707';
      ctx.beginPath();
      ctx.arc(ex + gazeX * 0.5, -7.8 + gazeY * 0.3, tense || dollTwitch > 0.3 ? 2.3 : 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex + gazeX * 0.5 - 0.7, -8.4 + gazeY * 0.3, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Fine ink nose shadow
  inkLine(ctx, 0, -5, -1.5, 5, 1.15, 'rgba(16,14,13,0.58)');
  inkLine(ctx, -1.5, 5, 2, 6, 1.05, 'rgba(16,14,13,0.5)');

  // Brushed crimson cherry-petal mouth (twitches subtly upward during dollTwitch!)
  ctx.fillStyle = '#bf221a';
  ctx.beginPath();
  ctx.moveTo(-6.5, 15.5);
  ctx.quadraticCurveTo(-2, 12.5, 0, 14.2);
  ctx.quadraticCurveTo(2, 12.5, 6.5, 15.5);
  ctx.quadraticCurveTo(0, posture > 0.7 ? 16.5 : 19.6 + dollTwitch * 2.2, -6.5, 15.5);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.95;
  ctx.stroke();

  // Jet-black hair & traditional skullcap with pale ivory brim & stark crimson finial
  inkPoly(ctx, [[-24, -18], [-22, 4], [-18, -8]], '#121111', 1.5);
  inkPoly(ctx, [[24, -18], [22, 4], [18, -8]], '#121111', 1.5);

  ctx.fillStyle = '#121111';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, -18, 25, Math.PI * 1.04, Math.PI * 1.96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#e7ddc6';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-24, -19);
  ctx.quadraticCurveTo(0, -11, 24, -19);
  ctx.stroke();

  ctx.fillStyle = '#cf291f';
  ctx.beginPath();
  ctx.arc(0, -46, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.stroke();

  ctx.restore(); // head
  ctx.restore(); // body

  if (posture < 0.45) {
    const isTwitching = dollTwitch > 0.25;
    const sfxText = isTwitching ? '咯哒…' : '咔…';
    const sfxAlpha = isTwitching ? 0.88 : 0.45 + (slow ? 0.14 : Math.sin(seconds * 2.1) * 0.2);
    drawComicSfx(ctx, sfxText, -74, -220 - standLift, isTwitching ? 22 : 19, sfxAlpha, tense || isTwitching ? 'crimson' : 'bone', -0.14);
  }

  ctx.restore();
}

export interface PaperHorseDrawOpts {
  x: number;
  y: number;
  skewed: boolean;
  seconds: number;
  slow: boolean;
  darkness: number;
  highlighted: boolean;
  horseGlance: number; // 0..1 eerie pupil side-glance event
  cursorLookX: number; // -1..1
  patterns: ComicPatterns;
}

/**
 * 黑白水墨 · 民国线描 · 朱砂鞍「白纸马」
 * Crisp white Xuan paper + delicate bamboo skeleton linework + piercing cinnabar saddle & bridle.
 * Periodically turns its ink pupil sideways to stare directly at the player!
 */
export function drawComicPaperHorse(ctx: CanvasRenderingContext2D, opts: PaperHorseDrawOpts) {
  const { x, y, skewed, seconds, slow, darkness, highlighted, horseGlance, cursorLookX, patterns } = opts;
  const rustle = slow ? 0 : Math.sin(seconds * 1.6) * 0.011;
  const shudder = horseGlance > 0.2 && horseGlance < 0.85 && !slow ? Math.sin(seconds * 28) * 0.008 : 0;
  const tilt = (skewed ? -0.11 : 0) + rustle + shudder;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);

  if (highlighted) {
    drawHighlightAura(ctx, 0, -82, 114, 100, slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 3.5), true);
  }

  drawInkWashBlot(ctx, 2, 12, 86, 17, 0.58, '10, 10, 11');

  // Dark sumi-ink carved wooden base stand
  inkPoly(ctx, [[-70, 2], [70, 2], [78, 15], [-78, 15]], lerpColor('#44403a', '#1d1f20', darkness), 2.2, INK, patterns.woodcutH);

  const paperTone = lerpColor('#f5efe0', '#d8dbd5', darkness * 0.65);
  const paperShade = lerpColor('#ccc5b4', '#8e9693', darkness * 0.65);

  // Far legs with vertical woodcut shading
  inkPoly(ctx, [[-44, -56], [-31, -56], [-40, 4], [-50, 4]], paperShade, 2.0, INK, patterns.woodcutV);
  inkPoly(ctx, [[26, -56], [39, -56], [48, 4], [37, 4]], paperShade, 2.0, INK, patterns.woodcutV);

  // Layered paper-cut tail
  const tailWave = slow ? 0 : Math.sin(seconds * 2.1) * 5.5;
  inkPoly(
    ctx,
    [
      [56, -100],
      [82 + tailWave * 0.4, -90],
      [90 + tailWave, -40],
      [78 + tailWave * 0.8, -50],
      [70 + tailWave * 0.6, -34],
      [62 + tailWave * 0.4, -52],
      [56, -74]
    ],
    paperTone,
    2.0
  );
  inkLine(ctx, 64, -86, 78 + tailWave * 0.75, -46, 1.2, 'rgba(17,16,16,0.52)');

  // Faceted Xuan-paper torso
  inkPoly(
    ctx,
    [
      [-56, -102],
      [54, -104],
      [66, -76],
      [52, -50],
      [-48, -48],
      [-62, -74]
    ],
    paperTone,
    2.5,
    INK,
    patterns.hatchLight
  );
  inkPoly(ctx, [[-56, -68], [56, -70], [50, -50], [-48, -48]], 'rgba(16, 15, 15, 0.16)', 0);

  // Delicate internal bamboo skeleton cross-ribs
  inkLine(ctx, -48, -96, 48, -54, 1.0, 'rgba(40, 36, 32, 0.34)');
  inkLine(ctx, -44, -54, 50, -98, 1.0, 'rgba(40, 36, 32, 0.34)');

  // Stark Cinnabar funeral saddlecloth (一点朱砂鞍鞯)
  inkPoly(ctx, [[-26, -105], [26, -105], [30, -64], [0, -52], [-30, -64]], CINNABAR, 2.3);
  inkLine(ctx, -23, -68, 0, -58, 2.1, '#f0e6d0');
  inkLine(ctx, 0, -58, 23, -68, 2.1, '#f0e6d0');
  ctx.fillStyle = '#f0e6d0';
  ctx.beginPath();
  ctx.arc(0, -83, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Near legs
  inkPoly(ctx, [[-50, -56], [-36, -56], [-28, 6], [-40, 6]], paperTone, 2.2);
  inkPoly(ctx, [[18, -56], [32, -56], [24, 6], [12, 6]], paperTone, 2.2);
  inkRect(ctx, -41, -1, 13, 7, '#151414', 1.7);
  inkRect(ctx, 11, -1, 13, 7, '#151414', 1.7);

  // Arched paper neck & jagged paper-cut mane
  inkPoly(
    ctx,
    [
      [-58, -86],
      [-34, -104],
      [-54, -162],
      [-76, -158],
      [-74, -104]
    ],
    paperTone,
    2.4
  );
  inkPoly(
    ctx,
    [
      [-36, -105],
      [-24, -120],
      [-38, -128],
      [-28, -142],
      [-42, -150],
      [-36, -168],
      [-54, -162]
    ],
    paperShade,
    1.9
  );
  // Angular head & ears
  inkPoly(
    ctx,
    [
      [-54, -164],
      [-47, -186],
      [-60, -172],
      [-70, -188],
      [-75, -164],
      [-110, -142],
      [-103, -124],
      [-70, -132]
    ],
    paperTone,
    2.4
  );
  inkLine(ctx, -100, -135, -94, -132, 1.7, INK);
  // Cinnabar bridle & chest tassel
  inkLine(ctx, -100, -134, -70, -152, 2.5, CINNABAR);
  inkLine(ctx, -96, -128, -42, -98, 2.1, CINNABAR);
  inkPoly(ctx, [[-64, -98], [-58, -98], [-55, -80], [-67, -80]], CINNABAR, 1.5);

  // Uncanny painted ink eye — slides sideways during horseGlance or cursor tracking!
  ctx.fillStyle = '#fffdf7';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(-76, -150, 7.0, 4.6, -0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const pupilShiftX = horseGlance * 3.4 + cursorLookX * 1.2;
  const pupilShiftY = horseGlance * 0.9;
  ctx.fillStyle = '#0a0909';
  ctx.beginPath();
  ctx.arc(-77 + pupilShiftX, -150 + pupilShiftY, 2.6 + horseGlance * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.arc(-70.5, -149, 1.4, 0, Math.PI * 2);
  ctx.fill();

  if (horseGlance > 0.3) {
    drawComicSfx(ctx, '咯…', -120, -198, 17, horseGlance * 0.82, 'crimson', -0.1);
  } else if (skewed) {
    drawComicSfx(ctx, '沙…', -112, -194, 18, 0.68, 'bone', 0.08);
  }

  ctx.restore();
}

export type GuestVariant =
  | 'day_villager'
  | 'chen_auntie'
  | 'doctor_lin'
  | 'night_auntie'
  | 'paper_boy'
  | 'wu_day'
  | 'wu_night'
  | 'masked_wu'
  | 'ajie_day'
  | 'ajie_night'
  | 'umbrella'
  | 'old_accountant'
  | 'paper_bride'
  | 'mirror_guest'
  | 'temple_deity'
  | 'opera_ghost';

export interface GuestDrawOpts {
  variant: GuestVariant;
  x: number;
  y: number;
  scale?: number;
  alpha?: number;
  talking?: boolean;
  armRaised: boolean;
  seconds: number;
  slow: boolean;
  darkness: number;
  threat: number;
  patterns: ComicPatterns;
}

/**
 * 黑白水墨 · 民国连环画线描来客
 * Monochrome ink-wash robes with crisp white rim-highlights, fine iron-wire drapery lines (铁线描),
 * vertical engraving face shadows, and Republican-era round wire-rim spectacles on Wu / Old Accountant!
 */
export function drawComicGuest(ctx: CanvasRenderingContext2D, opts: GuestDrawOpts) {
  const {
    variant,
    x,
    y,
    scale = 1,
    alpha = 1,
    talking = false,
    armRaised,
    seconds,
    slow,
    darkness,
    threat,
    patterns
  } = opts;
  const breath = slow ? 0 : Math.sin(seconds * (talking ? 2.4 : 1.35)) * (talking ? 2.8 : 2.0);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Sumi ink-wash silhouette halo behind nocturnal guests
  if (darkness > 0.3) {
    drawInkWashBlot(ctx, 0, -156, 152, 184, 0.52 * darkness, '7, 8, 9');
  }

  const isPaperBoy = variant === 'paper_boy';
  const isWu = variant === 'wu_day' || variant === 'wu_night' || variant === 'masked_wu';
  const isMaskedWu = variant === 'masked_wu';
  const isAjie = variant === 'ajie_day' || variant === 'ajie_night';
  const isAccountant = variant === 'old_accountant';
  const isUmbrella = variant === 'umbrella';
  const isPaperBride = variant === 'paper_bride';
  const isMirrorGuest = variant === 'mirror_guest';
  const isTempleDeity = variant === 'temple_deity';
  const isOperaGhost = variant === 'opera_ghost';
  const isAuntie = variant === 'chen_auntie' || variant === 'night_auntie';
  const isNightAuntie = variant === 'night_auntie';
  const isDoctor = variant === 'doctor_lin';

  // D6 顶格 · 无轿纸新娘 (Stark Cinnabar Bridal Veil & Crimson Wedding Robe!)
  if (isPaperBride) {
    drawPaperBrideGuest(ctx, breath, armRaised, seconds, slow, patterns);
    ctx.restore();
    return;
  }

  // D10 庙会顶格 · 百戏游神 (Tall Antique Paper-Mask Temple Deity + Twin Cinnabar Banners!)
  if (isTempleDeity) {
    drawTempleDeityGuest(ctx, breath, seconds, slow, patterns);
    ctx.restore();
    return;
  }

  // D13 顶格 · 空椅听戏诡 (Opera Painted-Face Silhouette + Flowing White Water Sleeves!)
  if (isOperaGhost) {
    drawOperaGhostGuest(ctx, breath, seconds, slow, patterns);
    ctx.restore();
    return;
  }

  // D4 Cross-Alley Dripping Black Oil-Paper Umbrella
  if (isUmbrella) {
    const dripPhase = slow ? 0.3 : (seconds * 0.9) % 1;
    ctx.save();
    ctx.translate(16, -262 + breath * 0.5);
    ctx.rotate(-0.08);
    inkLine(ctx, -4, 0, -20, 178, 4.4, '#2a2826');
    inkLine(ctx, -4, 0, -20, 178, 1.6, INK);
    const umbGrad = ctx.createLinearGradient(0, -52, 0, 22);
    umbGrad.addColorStop(0, '#0a0b0c');
    umbGrad.addColorStop(0.68, '#232628');
    umbGrad.addColorStop(1, '#08090a');
    inkPoly(
      ctx,
      [
        [-118, 18],
        [-78, -22],
        [-30, -44],
        [0, -52],
        [30, -44],
        [78, -22],
        [118, 18],
        [72, 9],
        [28, 14],
        [-28, 14],
        [-72, 9]
      ],
      umbGrad,
      2.6,
      INK,
      patterns.hatchDense
    );
    // Crisp white moonlight rim highlight on umbrella edge (留白高光)
    ctx.strokeStyle = 'rgba(232, 232, 224, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-114, 16);
    ctx.lineTo(-76, -22);
    ctx.lineTo(0, -52);
    ctx.lineTo(76, -22);
    ctx.stroke();

    for (const rx of [-72, -30, 30, 72]) {
      inkLine(ctx, 0, -48, rx, 12, 1.2, 'rgba(210, 214, 210, 0.25)');
    }
    ctx.fillStyle = 'rgba(220, 226, 222, 0.78)';
    for (let i = 0; i < 4; i++) {
      const dx = -88 + i * 58;
      const dy = 20 + ((dripPhase + i * 0.27) % 1) * 145;
      ctx.beginPath();
      ctx.ellipse(dx, dy, 1.8, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Monochrome Sumi Ink & Xuan-Paper Coat Tones (黑白灰水墨衣着)
  const coatColor = isUmbrella
    ? '#131517'
    : isDoctor
      ? '#dcd6c6'
      : isNightAuntie
        ? '#24292c'
        : isAuntie
          ? '#4b4d52'
          : isAccountant || isMirrorGuest
            ? '#212325'
            : variant === 'wu_day'
              ? '#4d4d48'
              : variant === 'wu_night' || isMaskedWu
                ? '#222426'
                : isAjie
                  ? '#474c4e'
                  : isPaperBoy
                    ? '#4b453d'
                    : '#534f47';

  const coatShadow = isUmbrella
    ? '#0a0b0c'
    : isDoctor
      ? '#b3ac9c'
      : isNightAuntie
        ? '#121518'
        : isAuntie
          ? '#2e3136'
          : isAccountant || isMirrorGuest
            ? '#121415'
            : variant === 'wu_day'
              ? '#31312e'
              : variant === 'wu_night' || isMaskedWu
                ? '#131416'
                : isAjie
                  ? '#2d3133'
                  : isPaperBoy
                    ? '#2f2b27'
                    : '#35322d';

  const skinColor = isUmbrella
    ? '#16181a'
    : isNightAuntie
      ? '#efeae0'
      : isAccountant || isPaperBoy || isMirrorGuest || isMaskedWu
        ? '#e6e0d2'
        : lerpColor('#ebe3d0', '#c4c7bf', darkness * 0.58);

  const shoulderW = isPaperBoy ? 38 : isAuntie ? 44 : isUmbrella || isAccountant ? 48 : 54;
  const waistW = shoulderW * 0.72;
  const bodyH = isPaperBoy ? 162 : isAuntie ? 182 : 196;

  ctx.save();
  ctx.translate(0, breath * 0.6);

  // 1. Left Arm
  inkPoly(
    ctx,
    [
      [-shoulderW + 4, -bodyH + 14],
      [-shoulderW - 14, -bodyH + 44],
      [-shoulderW - 16, -bodyH + 114],
      [-waistW - 4, -bodyH + 114],
      [-waistW - 2, -bodyH + 56]
    ],
    coatShadow,
    2.4,
    INK,
    patterns.woodcutV
  );
  inkLine(ctx, -shoulderW - 4, -bodyH + 56, -waistW - 4, -bodyH + 80, 1.4, 'rgba(12,12,12,0.7)');
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(-shoulderW - 6, -bodyH + 122, 8.5, 10, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Anatomical Torso & Draped Coat (铁线描轮廓 + 留白高光肩线)
  const torsoGrad = ctx.createLinearGradient(-shoulderW, -bodyH, shoulderW, 0);
  torsoGrad.addColorStop(0, coatShadow);
  torsoGrad.addColorStop(0.42, coatColor);
  torsoGrad.addColorStop(1, coatShadow);

  inkPoly(
    ctx,
    [
      [-15, -bodyH - 4],
      [15, -bodyH - 4],
      [shoulderW - 4, -bodyH + 12],
      [shoulderW + 4, -bodyH + 34],
      [waistW + 6, -bodyH + 102],
      [shoulderW * 0.88, 0],
      [-shoulderW * 0.88, 0],
      [-waistW - 6, -bodyH + 102],
      [-shoulderW - 4, -bodyH + 34],
      [-shoulderW + 4, -bodyH + 12]
    ],
    torsoGrad,
    2.5,
    INK,
    patterns.woodcutV
  );

  // Crisp Xuan-paper rim highlight along upper shoulders (夜里月光勾边，绝不糊成黑团)
  ctx.save();
  ctx.strokeStyle = darkness > 0.4 ? 'rgba(235, 232, 222, 0.34)' : 'rgba(250, 246, 236, 0.24)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-shoulderW + 4, -bodyH + 13);
  ctx.lineTo(-15, -bodyH - 3);
  ctx.moveTo(15, -bodyH - 3);
  ctx.lineTo(shoulderW - 4, -bodyH + 13);
  ctx.stroke();
  ctx.restore();

  // Expressive Republican fine-line drapery creases
  inkLine(ctx, -shoulderW * 0.65, -bodyH + 36, -waistW * 0.6, -bodyH + 92, 1.5, 'rgba(12,11,11,0.72)');
  inkLine(ctx, shoulderW * 0.62, -bodyH + 38, waistW * 0.55, -bodyH + 88, 1.5, 'rgba(12,11,11,0.72)');
  inkLine(ctx, -waistW * 0.45, -bodyH + 110, -waistW * 0.72, -16, 1.3, 'rgba(12,11,11,0.6)');
  inkLine(ctx, waistW * 0.4, -bodyH + 115, waistW * 0.68, -14, 1.3, 'rgba(12,11,11,0.6)');

  // Character-specific clothing details
  if (isWu) {
    // Classic Zhongshan / cadre jacket collar + crisp white shirt V
    inkPoly(ctx, [[-14, -bodyH - 2], [14, -bodyH - 2], [0, -bodyH + 32]], '#ece6d8', 1.9);
    inkPoly(ctx, [[-16, -bodyH], [-4, -bodyH + 32], [-24, -bodyH + 38]], coatShadow, 1.9);
    inkPoly(ctx, [[16, -bodyH], [4, -bodyH + 32], [24, -bodyH + 38]], coatShadow, 1.9);
    inkLine(ctx, 0, -bodyH + 32, 0, -4, 2.0, INK);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#141414';
      ctx.beginPath();
      ctx.arc(5, -bodyH + 54 + i * 28, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (variant === 'wu_day') {
      inkRect(ctx, -34, -bodyH + 56, 20, 18, coatShadow, 1.7);
      inkRect(ctx, 14, -bodyH + 56, 20, 18, coatShadow, 1.7);
    }
  } else if (isAjie) {
    // Hooded jacket with crisp pale drawstrings
    inkPoly(
      ctx,
      [[-24, -bodyH - 6], [24, -bodyH - 6], [34, -bodyH + 18], [16, -bodyH + 26], [-16, -bodyH + 26], [-34, -bodyH + 18]],
      '#282c2e',
      2.2
    );
    inkLine(ctx, 0, -bodyH + 24, 0, -4, 1.8, INK);
    inkLine(ctx, -9, -bodyH + 22, -11, -bodyH + 64, 1.9, '#ebe5d6');
    inkLine(ctx, 9, -bodyH + 22, 12, -bodyH + 62, 1.9, '#ebe5d6');
    inkPoly(ctx, [[-26, -bodyH + 114], [26, -bodyH + 114], [32, -bodyH + 150], [-32, -bodyH + 150]], 'rgba(14,15,16,0.34)', 1.7);
  } else if (isAccountant || isMirrorGuest) {
    // Antique Republican changshan (民国长衫) with white stand collar & frog buttons
    inkPoly(ctx, [[-14, -bodyH - 4], [14, -bodyH - 4], [16, -bodyH + 8], [-16, -bodyH + 8]], '#efe8d8', 1.9);
    inkLine(ctx, -10, -bodyH + 8, 24, -bodyH + 38, 2.1, '#cfc8b8');
    inkLine(ctx, 24, -bodyH + 38, 24, -4, 1.9, '#cfc8b8');
    for (let i = 0; i < 4; i++) {
      inkLine(ctx, 14, -bodyH + 48 + i * 24, 30, -bodyH + 48 + i * 24, 2.0, '#e5decb');
    }
  } else if (isAuntie) {
    // Republican-era folk woman side-buttoned cloth blouse (民国斜襟布褂)
    inkPoly(ctx, [[-13, -bodyH - 4], [13, -bodyH - 4], [15, -bodyH + 8], [-15, -bodyH + 8]], '#efe8d8', 1.8);
    inkLine(ctx, -10, -bodyH + 8, 22, -bodyH + 34, 2.0, isNightAuntie ? CINNABAR : '#dcd4c0');
    inkLine(ctx, 22, -bodyH + 34, 24, -8, 1.8, isNightAuntie ? CINNABAR : '#dcd4c0');
    for (let i = 0; i < 3; i++) {
      inkLine(ctx, 14, -bodyH + 44 + i * 24, 28, -bodyH + 44 + i * 24, 1.8, '#eae2d0');
    }
  } else if (isDoctor) {
    // Neat pale clinic coat / scholar lapel with dark tie/collar
    inkPoly(ctx, [[-14, -bodyH - 2], [14, -bodyH - 2], [0, -bodyH + 36]], '#2c2f32', 1.8);
    inkPoly(ctx, [[-16, -bodyH], [-3, -bodyH + 36], [-26, -bodyH + 42]], '#f2ece0', 1.9);
    inkPoly(ctx, [[16, -bodyH], [3, -bodyH + 36], [26, -bodyH + 42]], '#f2ece0', 1.9);
    inkLine(ctx, 0, -bodyH + 36, 0, -4, 1.9, INK);
    inkRect(ctx, -34, -bodyH + 64, 18, 20, '#cbc4b3', 1.5);
  } else if (isPaperBoy) {
    // Folk vest with cinnabar red piping (一点朱砂滚边)
    inkPoly(ctx, [[-14, -bodyH - 4], [14, -bodyH - 4], [14, -bodyH + 8], [-14, -bodyH + 8]], '#f2ece0', 1.9);
    inkLine(ctx, -16, -bodyH + 6, -18, -10, 2.4, CINNABAR);
    inkLine(ctx, 16, -bodyH + 6, 18, -10, 2.4, CINNABAR);
    inkLine(ctx, 0, -bodyH + 8, 0, -10, 1.9, INK);
  } else {
    // Everyday Republican-style cloth jacket with pale collar trim
    inkPoly(ctx, [[-15, -bodyH - 4], [15, -bodyH - 4], [24, -bodyH + 20], [0, -bodyH + 32], [-24, -bodyH + 20]], '#3f3d38', 2.0);
    inkLine(ctx, -15, -bodyH - 4, 0, -bodyH + 30, 1.4, '#e5decb');
    inkLine(ctx, 15, -bodyH - 4, 0, -bodyH + 30, 1.4, '#e5decb');
    inkLine(ctx, 0, -bodyH + 32, 0, -4, 2.0, INK);
  }

  // 3. Right Arm & Signature Prop
  const talkGesture = talking && !slow ? -10 - Math.abs(Math.sin(seconds * 3.1)) * 12 : 0;
  const rightArmLift = (armRaised ? -48 : 0) + talkGesture;
  inkPoly(
    ctx,
    [
      [shoulderW - 4, -bodyH + 14],
      [shoulderW + 16, -bodyH + 46],
      [shoulderW + 10, -bodyH + 110 + rightArmLift],
      [shoulderW - 14, -bodyH + 106 + rightArmLift],
      [waistW + 2, -bodyH + 54]
    ],
    coatColor,
    2.4,
    INK,
    patterns.woodcutV
  );
  inkLine(ctx, shoulderW + 6, -bodyH + 56, waistW + 4, -bodyH + 82 + rightArmLift * 0.4, 1.4, 'rgba(12,11,11,0.65)');

  const handX = shoulderW - 2;
  const handY = -bodyH + 112 + rightArmLift;
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.ellipse(handX, handY, 9, 10, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isWu && !armRaised) {
    // Signature empty red cigarette pack (朱砂烟盒)
    inkRect(ctx, handX - 10, handY - 14, 18, 24, CINNABAR, 1.9);
    inkRect(ctx, handX - 10, handY - 14, 18, 7, '#f2ead9', 1.5);
  } else if (variant === 'ajie_day') {
    inkRect(ctx, handX - 10, handY - 26, 20, 34, '#141516', 1.9);
    inkRect(ctx, handX - 7, handY - 22, 14, 24, '#e3e8e2', 1);
  } else if (isAuntie) {
    // Woven folk bamboo basket (竹篮) — eerie night version holds a faint red paper charm inside
    inkPoly(
      ctx,
      [
        [handX - 20, handY + 4],
        [handX + 20, handY + 4],
        [handX + 15, handY + 34],
        [handX - 15, handY + 34]
      ],
      isNightAuntie ? '#2d2722' : '#7a6852',
      2.0,
      INK,
      patterns.hatchLight
    );
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(handX, handY + 4, 14, Math.PI, 0);
    ctx.stroke();
    if (isNightAuntie) {
      inkRect(ctx, handX - 6, handY - 6, 12, 12, CINNABAR, 1.4);
    }
  } else if (isDoctor) {
    // Small leather satchel / folio book
    inkRect(ctx, handX - 16, handY + 2, 32, 24, '#36322e', 2.0);
    inkLine(ctx, handX - 16, handY + 10, handX + 16, handY + 10, 1.6, '#d9d0be');
  } else if (isPaperBoy) {
    inkPoly(
      ctx,
      [
        [handX - 18, handY + 2],
        [handX + 14, handY - 18],
        [handX + 12, handY + 14]
      ],
      '#ead288',
      1.9
    );
    inkLine(ctx, handX - 4, handY - 4, handX + 6, handY + 3, 1.6, CINNABAR);
  } else if (isMirrorGuest) {
    // Misty antique bronze mirror held against chest (铜镜照影诡 / 断线诡 / 收灰诡)
    ctx.fillStyle = '#333638';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(handX - 10, handY - 12, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#dde3dc';
    ctx.beginPath();
    ctx.arc(handX - 10, handY - 12, 16, 0, Math.PI * 2);
    ctx.fill();
    inkLine(ctx, handX - 18, handY - 18, handX - 2, handY - 4, 2.2, '#ffffff');
    inkLine(ctx, handX - 10, handY + 10, handX - 10, handY + 26, 4, '#2a2826');
  } else if (isAccountant) {
    inkPoly(
      ctx,
      [
        [handX - 24, handY - 18],
        [handX + 20, handY - 22],
        [handX + 22, handY + 24],
        [handX - 22, handY + 28]
      ],
      '#e9e0ca',
      1.9
    );
    for (let i = 0; i < 4; i++) {
      inkLine(ctx, handX - 14 + i * 9, handY - 14, handX - 14 + i * 9, handY + 18, 1.1, INK);
    }
  }

  // 4. Republican Fine-Line Head, Sculpted Jaw, Engraving Brow Shadow & Round Spectacles
  const headY = -bodyH - 36;
  ctx.save();
  ctx.translate(0, headY);
  const headRock = slow ? 0 : Math.sin(seconds * 0.9) * 0.022;
  ctx.rotate(headRock);

  inkRect(ctx, -9, 18, 18, 20, skinColor, 2.0);
  ctx.fillStyle = 'rgba(12, 11, 11, 0.48)';
  ctx.fillRect(-8, 18, 16, 8);

  for (const side of [-1, 1]) {
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.ellipse(side * 23, 2, 4.5, 8.5, side * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const fw = isPaperBoy ? 21 : 24;
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -34);
  ctx.bezierCurveTo(fw + 2, -34, fw + 1, -6, fw - 3, 12);
  ctx.bezierCurveTo(fw - 8, 23, 7, 30, 0, 31);
  ctx.bezierCurveTo(-7, 30, -(fw - 8), 23, -(fw - 3), 12);
  ctx.bezierCurveTo(-(fw + 1), -6, -(fw + 2), -34, 0, -34);
  ctx.closePath();
  ctx.fill();

  // Vertical Republican engraving shadow across brow & right cheek
  ctx.save();
  ctx.clip();
  const shadowDepth = isUmbrella ? 70 : isAccountant || variant === 'wu_night' ? 42 : darkness > 0.5 ? 34 : 22;
  const fGrad = ctx.createLinearGradient(0, -36, 0, -36 + shadowDepth);
  fGrad.addColorStop(0, 'rgba(9, 10, 11, 0.92)');
  fGrad.addColorStop(0.7, 'rgba(9, 10, 11, 0.56)');
  fGrad.addColorStop(1, 'rgba(9, 10, 11, 0)');
  ctx.fillStyle = fGrad;
  ctx.fillRect(-32, -38, 64, shadowDepth + 12);
  if (patterns.woodcutV) {
    ctx.globalAlpha = darkness > 0.35 || isUmbrella || isAccountant ? 0.78 : 0.38;
    ctx.fillStyle = patterns.woodcutV;
    ctx.fillRect(-32, -38, 64, shadowDepth + 6);
  }
  ctx.fillStyle = 'rgba(14, 13, 13, 0.18)';
  ctx.fillRect(9, -36, 22, 70);
  ctx.restore();
  ctx.stroke();

  // Hair / Republican hat
  if (isAccountant) {
    inkPoly(ctx, [[-50, -14], [50, -14], [32, -25], [-32, -25]], '#111213', 2.2);
    inkPoly(ctx, [[-24, -25], [24, -25], [18, -48], [-18, -48]], '#1e2022', 2.2);
    inkLine(ctx, -23, -27, 23, -27, 2.2, '#e3dac7');
  } else if (isAuntie) {
    // Neat folk bun hair with hairpin (发髻与木簪)
    ctx.fillStyle = '#141313';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -39, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    inkLine(ctx, -20, -40, 20, -37, 2.2, isNightAuntie ? CINNABAR : '#d8ccb4');
    inkPoly(
      ctx,
      [
        [-25, 2],
        [-26, -22],
        [-14, -36],
        [14, -36],
        [26, -22],
        [25, 2],
        [18, -14],
        [0, -20],
        [-18, -14]
      ],
      '#141313',
      2.2
    );
  } else if (isAjie) {
    inkPoly(
      ctx,
      [
        [-27, 0],
        [-27, -28],
        [-12, -40],
        [8, -41],
        [26, -30],
        [27, -2],
        [20, -14],
        [14, -4],
        [7, -16],
        [-1, -5],
        [-9, -17],
        [-17, -6],
        [-22, -16]
      ],
      '#121111',
      2.2
    );
  } else if (!isUmbrella) {
    inkPoly(
      ctx,
      [
        [-25, -4],
        [-26, -24],
        [-14, -37],
        [6, -38],
        [24, -28],
        [25, -6],
        [18, -18],
        [4, -19],
        [-8, -15],
        [-19, -18]
      ],
      '#141313',
      2.2
    );
  }

  // Facial features
  if (!isUmbrella) {
    inkLine(ctx, 1, -4, -1, 7, 1.25, 'rgba(14,13,13,0.68)');
    inkLine(ctx, -2, 8, 2, 8, 1.15, 'rgba(14,13,13,0.6)');

    if (isAjie) {
      for (const side of [-1, 1]) {
        const ex = side * 9.5;
        inkLine(ctx, ex - 5, 3, ex + 5, 3, 1.0, 'rgba(16,15,15,0.72)');
        ctx.fillStyle = '#f8f4ea';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(ex - 6, -3);
        ctx.quadraticCurveTo(ex, -8, ex + 6, -3);
        ctx.quadraticCurveTo(ex, 1, ex - 6, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0a0909';
        ctx.beginPath();
        ctx.arc(ex + (variant === 'ajie_night' ? 1.4 : 0), -3.2, 1.65, 0, Math.PI * 2);
        ctx.fill();
      }
      inkLine(ctx, -16, -9, -4, -13, 1.9, INK);
      inkLine(ctx, 4, -13, 16, -9, 1.9, INK);
      if (variant === 'ajie_night' || threat >= 2) {
        ctx.fillStyle = '#eef1ec';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(19, -10);
        ctx.quadraticCurveTo(24, -2, 19, 1);
        ctx.quadraticCurveTo(14, -2, 19, -10);
        ctx.fill();
        ctx.stroke();
      }
      inkPoly(ctx, [[-6, 15], [6, 14.5], [4, 18], [-4, 18]], '#1e1918', 1.3);
    } else if (isWu) {
      inkLine(ctx, -17, -10, -4, -7.5, 2.3, INK);
      inkLine(ctx, 4, -7.5, 17, -10, 2.3, INK);
      // Authentic Republican-era round wire-rim spectacles with white eerie glint!
      for (const ex of [-10, 10]) {
        ctx.fillStyle =
          variant === 'wu_night' || isMaskedWu ? 'rgba(235, 236, 228, 0.78)' : 'rgba(240, 236, 226, 0.28)';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.arc(ex, -3, 6.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        inkLine(ctx, ex - 3.5, -6, ex + 2.5, -1, 1.5, '#ffffff');
      }
      inkLine(ctx, -3, -3, 3, -3, 1.6, INK);
      inkLine(ctx, -12, 7, -15, 16, 1.15, 'rgba(14,13,13,0.58)');
      inkLine(ctx, 12, 7, 15, 16, 1.15, 'rgba(14,13,13,0.58)');
      inkLine(ctx, -7, 15.5, 7, 15.5, 1.9, INK);
      // D2 借面夜客：右颊半掀起的惨白纸面具裂痕与朱砂印记!
      if (isMaskedWu) {
        inkPoly(ctx, [[10, -24], [25, -18], [26, 16], [12, 24], [15, 0]], '#f6f0e2', 1.8);
        inkLine(ctx, 13, -18, 14, 18, 1.5, CINNABAR);
      }
    } else if (isAccountant) {
      // Eerie solid-white glinting Republican round spectacles under hat gloom
      for (const ex of [-10, 10]) {
        ctx.fillStyle = '#ecebe2';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(ex, -3, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        inkLine(ctx, ex - 3, -6, ex + 2, -1, 1.3, 'rgba(16,16,16,0.35)');
      }
      inkLine(ctx, -3.5, -3, 3.5, -3, 1.6, INK);
      inkLine(ctx, -6, 16, 6, 16, 1.5, INK);
    } else if (isDoctor) {
      inkLine(ctx, -16, -10, -4, -9, 1.9, INK);
      inkLine(ctx, 4, -9, 16, -10, 1.9, INK);
      for (const ex of [-9.5, 9.5]) {
        ctx.fillStyle = 'rgba(246, 242, 232, 0.34)';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ex, -3, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0c0b0b';
        ctx.beginPath();
        ctx.arc(ex, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      inkLine(ctx, -3.2, -3, 3.2, -3, 1.5, INK);
      inkLine(ctx, -6, 15, 6, 15, 1.6, INK);
    } else if (isNightAuntie) {
      // Uncanny paper-pale unblinking stare & overly wide stiff smile
      inkLine(ctx, -16, -12, -4, -10, 1.7, INK);
      inkLine(ctx, 4, -10, 16, -12, 1.7, INK);
      for (const ex of [-9.5, 9.5]) {
        ctx.fillStyle = '#fcf9f0';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(ex, -3.5, 5.8, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#090808';
        ctx.beginPath();
        ctx.arc(ex, -3.5, 1.55, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#9d201a';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-11, 13.5);
      ctx.quadraticCurveTo(0, 21.5, 11, 13.5);
      ctx.stroke();
    } else {
      inkLine(ctx, -15, -10, -4, -9, 1.8, INK);
      inkLine(ctx, 4, -9, 15, -10, 1.8, INK);
      for (const ex of [-9.5, 9.5]) {
        ctx.fillStyle = '#f8f4ea';
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(ex, -3.5, 4.6, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#0c0b0b';
        ctx.beginPath();
        ctx.arc(ex, -3.5, 1.85, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isPaperBoy) {
        ctx.fillStyle = 'rgba(196, 36, 28, 0.52)';
        ctx.beginPath();
        ctx.arc(-13, 4, 4.5, 0, Math.PI * 2);
        ctx.arc(13, 4, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      inkLine(ctx, -6, 15, 6, 15, 1.6, INK, isPaperBoy ? -2.2 : 0.6);
    }
  } else if (threat >= 2) {
    ctx.fillStyle = 'rgba(232, 238, 232, 0.58)';
    ctx.beginPath();
    ctx.arc(-8, -3, 1.9, 0, Math.PI * 2);
    ctx.arc(8, -3, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // head
  ctx.restore(); // torso
  ctx.restore();
}

export { CINNABAR_DARK };

/** D6 顶格诡异 · 无轿纸新娘 (Crimson Bridal Veil & Stark Paper Hands) */
function drawPaperBrideGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  armRaised: boolean,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sway = slow ? 0 : Math.sin(seconds * 1.1) * 3;
  ctx.save();
  ctx.translate(sway * 0.4, breath * 0.6);

  drawInkWashBlot(ctx, 0, -145, 130, 175, 0.56, '145, 24, 20');

  // Crimson silk bridal robe with dark ink folds
  const grad = ctx.createLinearGradient(-52, -195, 52, 0);
  grad.addColorStop(0, '#a6221b');
  grad.addColorStop(0.5, '#7c1714');
  grad.addColorStop(1, '#360b0c');
  inkPoly(
    ctx,
    [[-18, -196], [18, -196], [52, -162], [58, 0], [-58, 0], [-52, -162]],
    grad,
    2.6,
    INK,
    patterns.woodcutV
  );
  // Gold embroidered cloud-shoulder collar (云肩)
  inkPoly(ctx, [[-44, -172], [0, -140], [44, -172], [20, -194], [-20, -194]], '#d8c292', 2.0);
  inkLine(ctx, -30, -168, 0, -148, 1.6, CINNABAR);
  inkLine(ctx, 30, -168, 0, -148, 1.6, CINNABAR);

  // Extended pale paper hands holding red wedding silk knot
  const hy = armRaised ? -112 : -92;
  inkPoly(ctx, [[-26, hy - 8], [-12, hy - 8], [-10, hy + 14], [-24, hy + 14]], '#f6f0e2', 1.9);
  inkPoly(ctx, [[12, hy - 8], [26, hy - 8], [24, hy + 14], [10, hy + 14]], '#f6f0e2', 1.9);
  inkLine(ctx, -18, hy + 4, 18, hy + 4, 3.2, CINNABAR);
  inkLine(ctx, 0, hy + 4, 0, hy + 46, 2.4, CINNABAR);

  // Phoenix bridal crown silhouette under draping crimson veil (红盖头)
  const veilSway = slow ? 0 : Math.sin(seconds * 1.6) * 4;
  inkPoly(
    ctx,
    [[-22, -258], [22, -258], [32, -238], [-32, -238]],
    '#221c1a',
    2.2
  );
  inkPoly(
    ctx,
    [
      [-32, -242],
      [32, -242],
      [40 + veilSway, -172],
      [0 + veilSway * 0.6, -158],
      [-40 + veilSway, -172]
    ],
    '#c6261d',
    2.6,
    INK,
    patterns.hatchLight
  );
  // Gold tassel trim at bottom of veil
  inkLine(ctx, -38 + veilSway, -172, 0 + veilSway * 0.6, -158, 2.6, '#efe0b4');
  inkLine(ctx, 0 + veilSway * 0.6, -158, 38 + veilSway, -172, 2.6, '#efe0b4');

  drawComicSfx(ctx, '唢…', -78, -235, 19, 0.66, 'crimson', -0.12);
  ctx.restore();
}

/** D10 庙会顶格 · 百戏游神 (Tall Paper-Mask Deity with Twin Cinnabar Procession Banners) */
function drawTempleDeityGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const wave = slow ? 0 : Math.sin(seconds * 1.4) * 5;
  ctx.save();
  ctx.translate(0, breath * 0.5);

  // Twin crimson procession banners rising behind shoulders (游神双朱砂靠旗)
  for (const side of [-1, 1]) {
    inkLine(ctx, side * 34, -180, side * 86, -290, 3.2, '#241c18');
    inkPoly(
      ctx,
      [
        [side * 86, -290],
        [side * 124 + wave, -264],
        [side * 102 + wave * 0.5, -214],
        [side * 64, -242]
      ],
      CINNABAR,
      2.2,
      INK,
      patterns.woodcutV
    );
  }

  // Towering dark ceremonial robe with bold white bone trim
  inkPoly(ctx, [[-26, -222], [26, -222], [68, -186], [74, 0], [-74, 0], [-68, -186]], '#1a1c1e', 2.8, INK, patterns.hatchDense);
  inkPoly(ctx, [[-40, -216], [0, -148], [40, -216]], '#ece5d4', 2.2);
  inkPoly(ctx, [[-28, -212], [0, -162], [28, -212]], CINNABAR, 1.8);

  // Tall antique ceremonial paper mask head (高冠古纸面)
  inkRect(ctx, -22, -310, 44, 34, '#181819', 2.4);
  inkLine(ctx, -20, -290, 20, -290, 2.6, '#ece2c6');
  inkPoly(
    ctx,
    [[-28, -276], [28, -276], [24, -224], [0, -214], [-24, -224]],
    '#f4ede0',
    2.6,
    INK,
    patterns.woodcutV
  );
  // Painted red deity forehead flame & piercing ink eyes
  inkPoly(ctx, [[0, -270], [8, -256], [0, -248], [-8, -256]], CINNABAR, 1.4);
  inkLine(ctx, -18, -248, -5, -244, 2.8, INK);
  inkLine(ctx, 5, -244, 18, -248, 2.8, INK);
  ctx.fillStyle = CINNABAR;
  ctx.beginPath();
  ctx.arc(-11, -240, 2.8, 0, Math.PI * 2);
  ctx.arc(11, -240, 2.8, 0, Math.PI * 2);
  ctx.fill();

  drawComicSfx(ctx, '咚…', -92, -255, 22, 0.72, 'crimson', -0.08);
  ctx.restore();
}

/** D13 顶格 · 空椅听戏诡 (Opera Painted-Face Silhouette + Flowing Water Sleeves) */
function drawOperaGhostGuest(
  ctx: CanvasRenderingContext2D,
  breath: number,
  seconds: number,
  slow: boolean,
  patterns: ComicPatterns
) {
  const sleeveWave = slow ? 0 : Math.sin(seconds * 1.5) * 9;
  ctx.save();
  ctx.translate(0, breath * 0.5);

  // Empty antique grandmaster chair silhouette behind ghost (空太师椅)
  inkRect(ctx, -64, -170, 128, 170, 'rgba(20, 18, 18, 0.72)', 2.4, patterns.woodcutV);
  inkRect(ctx, -74, -180, 148, 16, '#262321', 2.2);

  // Flowing white silk water sleeves (水袖长摆)
  inkPoly(
    ctx,
    [[-48, -164], [-96 + sleeveWave, -110], [-86 - sleeveWave * 0.5, -26], [-52, -48]],
    '#ece6d8',
    2.0
  );
  inkPoly(
    ctx,
    [[48, -164], [96 - sleeveWave, -110], [86 + sleeveWave * 0.5, -26], [52, -48]],
    '#ece6d8',
    2.0
  );

  // Opera brocade robe
  inkPoly(ctx, [[-20, -188], [20, -188], [50, -158], [52, 0], [-52, 0], [-50, -158]], '#252729', 2.5, INK, patterns.woodcutV);
  inkLine(ctx, -20, -184, 24, -40, 2.4, CINNABAR);

  // Stark chalk-white painted opera face & twin pheasant-feather antennae (翎子)
  inkLine(ctx, -10, -252, -54 + sleeveWave * 0.4, -306, 2.0, INK);
  inkLine(ctx, 10, -252, 54 - sleeveWave * 0.4, -306, 2.0, INK);
  ctx.fillStyle = '#f6f1e4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -220, 23, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Cinnabar opera eye-wing markings
  inkPoly(ctx, [[-18, -228], [-6, -222], [-18, -218]], CINNABAR, 1.2);
  inkPoly(ctx, [[18, -228], [6, -222], [18, -218]], CINNABAR, 1.2);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-10, -222, 2.2, 0, Math.PI * 2);
  ctx.arc(10, -222, 2.2, 0, Math.PI * 2);
  ctx.fill();
  inkLine(ctx, -7, -202, 7, -202, 2.2, CINNABAR);

  drawComicSfx(ctx, '咿呀…', 78, -254, 19, 0.68, 'crimson', 0.1);
  ctx.restore();
}
