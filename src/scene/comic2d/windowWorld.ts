import type { EnvDrawState } from './environment';
import { CINNABAR, INK, drawInkWashBlot, inkLine, inkPoly, lerpColor } from './textures';

type NightPasserKind =
  | 'lantern_walker'
  | 'umbrella_walker'
  | 'bride_walker'
  | 'opera_walker'
  | 'boatman_walker'
  | 'paper_horse'
  | 'scholar_walker'
  | 'zodiac_goat_walker'
  | 'zuowang_jester_walker'
  | 'courier_walker';

type DayPasserKind = 'basket_auntie' | 'pole_vendor' | 'parasol_walker';

const NIGHT_CAST: NightPasserKind[] = [
  'lantern_walker',
  'zodiac_goat_walker',
  'umbrella_walker',
  'zuowang_jester_walker',
  'opera_walker',
  'bride_walker',
  'courier_walker',
  'boatman_walker',
  'paper_horse',
  'scholar_walker'
];

const DAY_CAST: DayPasserKind[] = ['basket_auntie', 'pole_vendor', 'parasol_walker'];

const LANE_MIN_X = 290;
const LANE_MAX_X = 1020;

/**
 * Renders the unified streetscape, weather, opposite Qilou eaves, drifting mist/ash,
 * and distinct passing daytime/nighttime characters clipped inside each shop window.
 * Because both windows share world X coordinates (362..544 & 608..952), characters
 * seamlessly walk across the left window, behind the timber pillar, and into the main window!
 */
export function drawWindowOutdoorWorld(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  env: EnvDrawState,
  isMain: boolean
) {
  const { state, darkness, night, seconds, slow, eerie } = env;
  const highThreat = state.phase === 'site' && state.threat >= 3;
  const stormyNight = night && (state.h >= 8 || state.day === 4 || state.day === 7 || state.day === 10 || state.day === 13);

  // Occasional subtle distant lightning flash on stormy / high-threat nights
  let flash = 0;
  if (!slow && (stormyNight || highThreat)) {
    const cycle = (seconds + state.day * 3.7) % 17;
    if (cycle > 16.45 && cycle < 16.72) {
      flash = Math.sin(((cycle - 16.45) / 0.27) * Math.PI) * (highThreat ? 0.36 : 0.22);
    }
  }
  if (flash > 0.01) {
    ctx.save();
    ctx.fillStyle = `rgba(235, 240, 238, ${flash})`;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  // 1. Night stars twinkling softly in upper sky
  if (darkness > 0.35) {
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const sx = 372 + ((i * 73 + 29) % 566);
      const sy = 206 + ((i * 37 + 13) % 72);
      if (sx < x || sx > x + w || sy < y || sy > y + h * 0.55) continue;
      const tw = slow ? 0.55 : 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(seconds * (1.4 + (i % 4) * 0.45) + i * 2.1));
      ctx.fillStyle = `rgba(240, 236, 222, ${tw * darkness * 0.72})`;
      ctx.beginPath();
      ctx.arc(sx, sy, i % 3 === 0 ? 1.5 : 1.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Daytime distant drifting clouds & tiny ink swallows
  if (darkness < 0.65) {
    const dayAlpha = 1 - darkness * 1.4;
    if (dayAlpha > 0.05) {
      ctx.save();
      ctx.globalAlpha = dayAlpha;
      const cloudShift = slow ? 0 : (seconds * 7) % 680;
      drawInkWashBlot(ctx, 430 + ((cloudShift) % 620) - 90, 244, 72, 16, 0.16, '255, 250, 238');
      drawInkWashBlot(ctx, 760 - ((cloudShift * 0.6) % 520), 232, 86, 18, 0.14, '255, 250, 238');

      // 3 tiny ink swallows gliding across morning sky
      ctx.strokeStyle = 'rgba(34, 32, 28, 0.55)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const bx = 340 + ((seconds * (24 + i * 4) + i * 190) % 660);
        const by = 236 + i * 16 + (slow ? 0 : Math.sin(seconds * 3.8 + i * 2) * 4);
        const wing = slow ? 2 : Math.sin(seconds * 7.5 + i * 1.7) * 3.5;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by - wing);
        ctx.quadraticCurveTo(bx - 3, by - 4, bx, by);
        ctx.quadraticCurveTo(bx + 3, by - 4, bx + 7, by - wing);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // 3. Opposite Qilou street rooftops & glowing upstairs neighbor windows (对面老街骑楼与零星灯火)
  drawOppositeStreetFacade(ctx, y + h, darkness, night, seconds, slow, state.h, highThreat);

  // 4. Passing street characters in the unified world lane! (白昼街坊 / 夜晚各色诡客路过)
  const laneGroundY = y + h + 14;
  if (darkness >= 0.42) {
    drawNightPassersby(ctx, laneGroundY, seconds, slow, darkness, state.day, state.h, highThreat, flash);
  } else {
    drawDayPassersby(ctx, laneGroundY, seconds, slow, darkness, state.day);
  }

  // 5. Rolling ground-level ink mist / eerie fog right outside the panes at night
  if (darkness > 0.35) {
    const mistDrift = slow ? 0 : Math.sin(seconds * 0.42) * 38;
    const mistAlpha = (0.2 + (state.h >= 8 ? 0.12 : 0)) * darkness;
    const mistTint = highThreat ? '48, 16, 18' : '202, 214, 210';
    drawInkWashBlot(ctx, x + w * 0.25 + mistDrift, y + h - 14, w * 0.48, 34, mistAlpha, mistTint);
    drawInkWashBlot(ctx, x + w * 0.78 - mistDrift * 0.8, y + h - 8, w * 0.52, 30, mistAlpha * 0.9, mistTint);
  }

  // 6. Slanted night drizzle OR drifting glowing joss-paper ash & spirit fireflies
  if (night && !slow) {
    ctx.save();
    if (stormyNight) {
      // Fine slanted night rain outside window panes
      ctx.strokeStyle = highThreat ? 'rgba(224, 178, 172, 0.24)' : 'rgba(206, 220, 224, 0.22)';
      ctx.lineWidth = 1.0;
      const dropCount = isMain ? 24 : 12;
      for (let i = 0; i < dropCount; i++) {
        const rx = x + ((i * 47 + seconds * 68 + i * 13) % (w + 40)) - 20;
        const ry = y + ((i * 31 + seconds * 270) % (h + 30)) - 15;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 6 - eerie.windGust * 10, ry + 18);
        ctx.stroke();
      }
    }

    // Floating ghostly spirit motes / paper-fire embers drifting outside
    const moteCount = isMain ? 9 : 4;
    for (let i = 0; i < moteCount; i++) {
      const t = (seconds * (0.14 + (i % 3) * 0.04) + i * 0.23) % 1;
      const fx = x + ((i * 59 + seconds * (9 + (i % 3) * 5)) % w) + Math.sin(seconds * 1.9 + i) * 8;
      const fy = y + h - t * h;
      const glowPulse = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(seconds * 3.1 + i * 2.4));
      const isRed = highThreat ? i % 2 === 0 : i % 4 === 0;
      ctx.fillStyle = isRed
        ? `rgba(232, 76, 56, ${glowPulse * 0.65})`
        : `rgba(182, 224, 212, ${glowPulse * 0.55})`;
      ctx.beginPath();
      ctx.arc(fx, fy, isRed ? 2.1 : 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Opposite side of the street: dark Qilou gable silhouettes, swaying street lantern & dim lit windows */
function drawOppositeStreetFacade(
  ctx: CanvasRenderingContext2D,
  bottomY: number,
  darkness: number,
  night: boolean,
  seconds: number,
  slow: boolean,
  yin: number,
  highThreat: boolean
) {
  const bldgColor = lerpColor('#555149', '#0e1114', darkness);
  const roofColor = lerpColor('#32302c', '#07090b', darkness);

  // Far ridge of opposite Qilou roofs spanning continuously across x=340..980
  inkPoly(
    ctx,
    [
      [340, bottomY + 6],
      [340, bottomY - 68],
      [410, bottomY - 68],
      [430, bottomY - 88],
      [512, bottomY - 88],
      [532, bottomY - 68],
      [626, bottomY - 68],
      [648, bottomY - 94],
      [736, bottomY - 94],
      [758, bottomY - 72],
      [832, bottomY - 72],
      [854, bottomY - 90],
      [938, bottomY - 90],
      [964, bottomY - 64],
      [964, bottomY + 6]
    ],
    bldgColor,
    1.5,
    roofColor
  );

  // Faint upstairs windows glowing across the street at night
  if (darkness > 0.35) {
    const winFlicker = slow ? 0.65 : 0.55 + 0.16 * Math.sin(seconds * 2.4);
    const warmCol = highThreat
      ? `rgba(210, 74, 54, ${winFlicker * darkness * 0.55})`
      : yin >= 10
        ? `rgba(154, 198, 186, ${winFlicker * darkness * 0.42})`
        : `rgba(232, 182, 108, ${winFlicker * darkness * 0.48})`;

    for (const [wx, wy, ww, wh] of [
      [446, bottomY - 76, 16, 22],
      [476, bottomY - 76, 16, 22],
      [672, bottomY - 82, 18, 24],
      [702, bottomY - 82, 18, 24],
      [884, bottomY - 78, 16, 22]
    ]) {
      ctx.fillStyle = warmCol;
      ctx.fillRect(wx, wy, ww, wh);
      inkLine(ctx, wx + ww * 0.5, wy, wx + ww * 0.5, wy + wh, 1.0, roofColor);
      inkLine(ctx, wx, wy + wh * 0.5, wx + ww, wy + wh * 0.5, 1.0, roofColor);
    }

    // Distant red street lantern swaying under opposite eaves
    const sway = slow ? 0 : Math.sin(seconds * 1.45) * 3.5;
    for (const [lx, ly] of [
      [402, bottomY - 66],
      [826, bottomY - 70]
    ]) {
      inkLine(ctx, lx, ly, lx + sway * 0.4, ly + 12, 1.2, roofColor);
      const lg = ctx.createRadialGradient(lx + sway, ly + 18, 2, lx + sway, ly + 18, 22);
      lg.addColorStop(0, `rgba(218, 56, 42, ${0.42 * darkness})`);
      lg.addColorStop(1, 'rgba(218, 56, 42, 0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(lx + sway, ly + 18, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = night ? CINNABAR : '#9a2820';
      ctx.beginPath();
      ctx.ellipse(lx + sway, ly + 18, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Daytime living passersby strolling unhurriedly outside the shop windows */
function drawDayPassersby(
  ctx: CanvasRenderingContext2D,
  groundY: number,
  seconds: number,
  slow: boolean,
  darkness: number,
  day: number
) {
  const period = 16;
  const slotIdx = slow ? 0 : Math.floor((seconds + day * 5) / period);
  const progress = slow ? 0.56 : ((seconds + day * 5) % period) / period;
  if (progress > 0.72) return; // Natural calm gap between passersby

  const t = progress / 0.72;
  const dir = slotIdx % 2 === 0 ? 1 : -1;
  const px = dir > 0 ? LANE_MIN_X + t * (LANE_MAX_X - LANE_MIN_X) : LANE_MAX_X - t * (LANE_MAX_X - LANE_MIN_X);
  const bob = slow ? 0 : Math.abs(Math.sin(seconds * 5.2)) * 3.5;
  const kind = DAY_CAST[(slotIdx + day) % DAY_CAST.length];

  ctx.save();
  ctx.translate(px, groundY - bob);
  ctx.scale(dir, 1);
  ctx.globalAlpha = (1 - darkness * 1.1) * 0.62;
  const fill = '#2e2b27';

  // Head & torso
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(0, -104, 11, 0, Math.PI * 2);
  ctx.fill();
  inkPoly(ctx, [[-11, -90], [12, -90], [18, -10], [-17, -10]], fill, 0);

  if (kind === 'basket_auntie') {
    // Low hair bun + woven basket on arm
    ctx.beginPath();
    ctx.arc(-11, -106, 5, 0, Math.PI * 2);
    ctx.fill();
    inkPoly(ctx, [[12, -56], [30, -56], [26, -36], [15, -36]], '#3f382e', 1.2);
  } else if (kind === 'pole_vendor') {
    // Conical hat + shoulder carrying pole with two swaying baskets
    inkPoly(ctx, [[-18, -110], [0, -122], [18, -110]], fill, 0);
    inkLine(ctx, -44, -84, 44, -84, 2.8, fill);
    inkLine(ctx, -38, -84, -38, -56, 1.3, fill);
    inkLine(ctx, 38, -84, 38, -56, 1.3, fill);
    ctx.fillRect(-46, -56, 16, 15);
    ctx.fillRect(30, -56, 16, 15);
  } else {
    // Paper parasol silhouette
    inkPoly(ctx, [[-34, -124], [0, -142], [34, -124]], '#473a32', 1.2);
    inkLine(ctx, 0, -140, 6, -78, 2.0, fill);
  }
  ctx.restore();
}

/**
 * Renders 2 staggered independent night walker channels across BOTH windows so players
 * regularly witness distinct eerie folk characters gliding past the shop at night!
 */
function drawNightPassersby(
  ctx: CanvasRenderingContext2D,
  groundY: number,
  seconds: number,
  slow: boolean,
  darkness: number,
  day: number,
  yin: number,
  highThreat: boolean,
  flash: number
) {
  // Channel A: Primary eerie figure every ~11s; Channel B: Secondary slower figure offset by ~6s
  const channels = [
    { period: 11.5, offset: day * 2.7, activeFrac: 0.82, speedScale: 1.0, scale: 1.0, yShift: 0 },
    { period: 16.5, offset: day * 4.3 + 6.4, activeFrac: 0.72, speedScale: 0.85, scale: 0.84, yShift: -12 }
  ];

  for (let c = 0; c < channels.length; c++) {
    const ch = channels[c];
    if (slow && c > 0) continue;

    const rawT = slow ? 0.42 : (seconds + ch.offset) / ch.period;
    const slot = Math.floor(rawT);
    const frac = rawT - slot;
    if (frac > ch.activeFrac) continue;

    const t = frac / ch.activeFrac;
    const dir = (slot + c) % 2 === 0 ? 1 : -1;
    // Slight eerie pause when passing right in front of the main window for umbrella/scholar walkers!
    const kind = NIGHT_CAST[(slot * 2 + c * 3 + day) % NIGHT_CAST.length];
    let easedT = t;
    if (!slow && (kind === 'umbrella_walker' || kind === 'scholar_walker')) {
      // Subtle hesitation right near center window (t ≈ 0.55)
      easedT = t - Math.sin(t * Math.PI * 2) * 0.035;
    }

    const px =
      dir > 0
        ? LANE_MIN_X + easedT * (LANE_MAX_X - LANE_MIN_X)
        : LANE_MAX_X - easedT * (LANE_MAX_X - LANE_MIN_X);
    const gait = slow ? 0 : Math.sin(seconds * (3.6 * ch.speedScale) + c * 2);
    const bob = kind === 'paper_horse' ? Math.abs(gait) * 5.5 : Math.abs(gait) * 2.8;

    ctx.save();
    ctx.translate(px, groundY + ch.yShift - bob);
    ctx.scale(dir * ch.scale, ch.scale);

    // Higher opacity & sharper contrast during lightning flash or high Yin
    const baseAlpha = Math.min(0.92, (0.64 + (yin >= 10 ? 0.14 : 0) + flash * 0.6) * darkness);
    ctx.globalAlpha = baseAlpha;
    drawNightWalkerSilhouette(ctx, kind, seconds, slow, highThreat, gait);
    ctx.restore();
  }
}

function drawNightWalkerSilhouette(
  ctx: CanvasRenderingContext2D,
  kind: NightPasserKind,
  seconds: number,
  slow: boolean,
  highThreat: boolean,
  gait: number
) {
  const inkBody = '#090b0d';
  const rimCol = highThreat ? 'rgba(220, 68, 52, 0.45)' : 'rgba(210, 224, 218, 0.32)';
  const sway = slow ? 0 : Math.sin(seconds * 2.4) * 5;

  if (kind === 'lantern_walker') {
    // 提灯打更人 / 引路纸童：手挑一盏幽绿/暖白灯笼，光晕扫过窗棂
    ctx.fillStyle = inkBody;
    ctx.beginPath();
    ctx.arc(0, -108, 12, 0, Math.PI * 2);
    ctx.fill();
    // Wide conical hat or cap
    inkPoly(ctx, [[-17, -116], [0, -129], [17, -116]], inkBody, 1.2, rimCol);
    // Flowing night robe
    inkPoly(ctx, [[-12, -94], [14, -94], [24, -6], [-22, -6]], inkBody, 1.3, rimCol);
    // Bamboo pole extending forward + swaying pale lantern!
    inkLine(ctx, 8, -74, 48, -94, 2.4, inkBody);
    const lx = 48 + sway * 0.7;
    const ly = -72;
    inkLine(ctx, 48, -94, lx, ly - 10, 1.3, rimCol);

    const glow = ctx.createRadialGradient(lx, ly, 3, lx, ly, 46);
    glow.addColorStop(0, highThreat ? 'rgba(232, 76, 56, 0.65)' : 'rgba(186, 232, 212, 0.58)');
    glow.addColorStop(0.55, highThreat ? 'rgba(182, 42, 30, 0.22)' : 'rgba(130, 188, 174, 0.18)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, ly, 46, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = highThreat ? '#f0866e' : '#e4f0e4';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 8.5, 11.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return;
  }

  if (kind === 'umbrella_walker') {
    // 撑黑油纸伞的雨夜高瘦诡影
    ctx.fillStyle = inkBody;
    ctx.beginPath();
    ctx.arc(0, -118, 11, 0, Math.PI * 2);
    ctx.fill();
    inkPoly(ctx, [[-11, -104], [13, -104], [22, -4], [-20, -4]], inkBody, 1.2, rimCol);
    // Wide tilted oil-paper umbrella
    ctx.save();
    ctx.translate(4, -138);
    ctx.rotate(-0.14 + sway * 0.008);
    inkPoly(ctx, [[-44, 8], [-22, -10], [0, -16], [22, -10], [44, 8]], '#0c0e11', 1.6, rimCol);
    inkLine(ctx, 0, -14, -4, 62, 2.2, inkBody);
    // Dripping fringe hint
    inkLine(ctx, -38, 10, -40, 22, 1.0, rimCol);
    inkLine(ctx, 38, 10, 36, 20, 1.0, rimCol);
    ctx.restore();
    return;
  }

  if (kind === 'bride_walker') {
    // 飘摇红盖头纸新娘剪影：隐约朱砂盖头与飘带 + 两点微弱红灯影
    ctx.fillStyle = inkBody;
    inkPoly(ctx, [[-14, -104], [14, -104], [28, -4], [-28, -4]], inkBody, 1.3, 'rgba(196, 48, 36, 0.5)');
    // Crimson veil draped over head
    inkPoly(ctx, [[-15, -132], [15, -132], [19, -98], [-19, -98]], '#5e1412', 1.5, CINNABAR);
    // Faint glowing red bridal crown ornaments
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(-6, -135, 2.4, 0, Math.PI * 2);
    ctx.arc(0, -138, 3.0, 0, Math.PI * 2);
    ctx.arc(6, -135, 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Trailing crimson wedding ribbons
    inkLine(ctx, -14, -92, -32 + sway, -50, 2.2, 'rgba(196, 46, 36, 0.72)');
    inkLine(ctx, 14, -92, 28 + sway * 0.7, -54, 1.8, 'rgba(196, 46, 36, 0.6)');
    return;
  }

  if (kind === 'opera_walker') {
    // 古戏楼武旦/花旦幽影：长雉鸡翎与飘荡水袖
    ctx.fillStyle = inkBody;
    ctx.beginPath();
    ctx.arc(0, -114, 11, 0, Math.PI * 2);
    ctx.fill();
    // Ornate headdress + twin curving pheasant plumes (雉鸡翎)
    inkPoly(ctx, [[-12, -122], [-6, -136], [6, -136], [12, -122]], '#181416', 1.3, 'rgba(216, 72, 54, 0.55)');
    ctx.strokeStyle = 'rgba(220, 212, 194, 0.62)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, -134);
    ctx.quadraticCurveTo(-28, -162, -46 + sway, -148);
    ctx.moveTo(6, -134);
    ctx.quadraticCurveTo(28, -164, 46 + sway, -150);
    ctx.stroke();
    // Gown & billowing pale water sleeves (水袖)
    inkPoly(ctx, [[-13, -100], [13, -100], [24, -4], [-22, -4]], inkBody, 1.2, rimCol);
    inkPoly(
      ctx,
      [
        [10, -86],
        [44 + sway, -96 + gait * 6],
        [48 + sway, -76 + gait * 6],
        [14, -68]
      ],
      'rgba(222, 226, 220, 0.44)',
      1.1,
      rimCol
    );
    return;
  }

  if (kind === 'boatman_walker') {
    // 披蓑衣戴斗笠的老渡夫 / 货郎，扛竹篙挂微光灯
    ctx.fillStyle = inkBody;
    inkPoly(ctx, [[-26, -112], [0, -128], [26, -112]], inkBody, 1.4, rimCol);
    // Straw raincoat jagged shoulders (蓑衣轮廓)
    inkPoly(ctx, [[-22, -104], [22, -104], [30, -52], [20, -6], [-20, -6], [-30, -52]], inkBody, 1.3, rimCol);
    // Long bamboo punting pole across shoulder
    inkLine(ctx, -56, -86, 56, -108, 2.6, inkBody);
    // Tiny ember hanging from front tip of pole
    const lx = 54 + sway * 0.4;
    const ly = -94;
    ctx.fillStyle = 'rgba(232, 178, 96, 0.72)';
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (kind === 'paper_horse') {
    // 纸扎白马夜奔剪影（棱角分明，带一点朱砂马鞍微光）
    const legA = gait * 8;
    const legB = -gait * 8;
    ctx.fillStyle = 'rgba(226, 222, 210, 0.56)';
    // Angular paper horse torso, neck, head
    inkPoly(
      ctx,
      [
        [-36, -68],
        [20, -72],
        [34, -108],
        [52, -100],
        [48, -90],
        [32, -88],
        [26, -48],
        [-34, -46]
      ],
      'rgba(218, 216, 206, 0.46)',
      1.6,
      inkBody
    );
    // Tiny cinnabar saddle
    inkPoly(ctx, [[-16, -71], [6, -72], [2, -55], [-14, -55]], 'rgba(182, 42, 32, 0.72)', 1.2, inkBody);
    // 4 trotting angular legs + tail
    inkLine(ctx, -28, -48, -32 + legA, -6, 3.2, inkBody);
    inkLine(ctx, -18, -48, -14 + legB, -6, 3.2, inkBody);
    inkLine(ctx, 14, -48, 12 + legB, -6, 3.2, inkBody);
    inkLine(ctx, 22, -48, 28 + legA, -6, 3.2, inkBody);
    inkLine(ctx, -36, -64, -52, -44 + sway * 0.4, 2.4, inkBody);
    return;
  }

  if (kind === 'zodiac_goat_walker') {
    // 十二生肖「人羊」夜行剪影（双弯角山羊面具 + 立领风衣 + 两点冷红眼缝）
    inkPoly(ctx, [[-14, -104], [14, -104], [22, -4], [-22, -4]], inkBody, 1.3, rimCol);
    // Bone-white goat mask profile & curved horns
    ctx.fillStyle = 'rgba(232, 224, 208, 0.72)';
    ctx.beginPath();
    ctx.ellipse(2, -118, 10, 13, 0.08, 0, Math.PI * 2);
    ctx.fill();
    inkLine(ctx, -2, -128, -14, -142, 3.0, '#cfc5b2');
    inkLine(ctx, 5, -128, 17, -140, 3.0, '#cfc5b2');
    ctx.fillStyle = CINNABAR;
    ctx.beginPath();
    ctx.arc(6, -119, 1.8, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (kind === 'zuowang_jester_walker') {
    // 坐忘「红中」面具戏子夜行剪影（歪戴白麻将面 + 扛破「骗」幡）
    inkPoly(ctx, [[-15, -102], [15, -102], [23, -4], [-21, -4]], inkBody, 1.2, rimCol);
    // Pole & tattered banner swaying behind
    inkLine(ctx, -10, -10, -14, -148, 2.2, '#2d2520');
    inkPoly(ctx, [[-14, -146], [-34, -142 + sway * 0.4], [-30, -116], [-14, -120]], 'rgba(232, 222, 200, 0.56)', 1.0, inkBody);
    // Pale rectangular mahjong mask with crimson center dot
    ctx.fillStyle = 'rgba(244, 238, 224, 0.78)';
    ctx.fillRect(-7, -132, 16, 20);
    ctx.fillStyle = CINNABAR;
    ctx.fillRect(-2, -127, 6, 10);
    return;
  }

  if (kind === 'courier_walker') {
    // 4:44 诡异外卖员夜行剪影（头盔雨衣 + 背后 #444 暗红餐箱）
    inkPoly(ctx, [[-14, -98], [14, -98], [20, -6], [-18, -6]], inkBody, 1.2, rimCol);
    // Helmet silhouette
    ctx.fillStyle = inkBody;
    ctx.beginPath();
    ctx.arc(2, -112, 12, 0, Math.PI * 2);
    ctx.fill();
    // Red box carried on back
    ctx.fillStyle = 'rgba(176, 38, 28, 0.72)';
    ctx.fillRect(-30, -96, 18, 24);
    ctx.fillStyle = 'rgba(242, 236, 220, 0.72)';
    ctx.fillRect(-26, -88, 10, 7);
    return;
  }

  // scholar_walker: 民国长衫老账房 / 偷窥黑影（眼镜微微反光，手持账簿）
  ctx.fillStyle = inkBody;
  ctx.beginPath();
  ctx.arc(0, -114, 11, 0, Math.PI * 2);
  ctx.fill();
  // Skullcap / melon cap
  inkPoly(ctx, [[-11, -120], [11, -120], [8, -129], [-8, -129]], inkBody, 1.0, rimCol);
  // Long Republican scholar gown
  inkPoly(ctx, [[-13, -100], [13, -100], [20, -4], [-18, -4]], inkBody, 1.3, rimCol);
  // Subtle eerie round-glasses glint turning toward the window
  ctx.fillStyle = 'rgba(238, 244, 236, 0.75)';
  ctx.beginPath();
  ctx.arc(4, -114, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Ledger tucked under arm
  ctx.fillStyle = '#1b1816';
  ctx.fillRect(10, -76, 15, 22);
}
