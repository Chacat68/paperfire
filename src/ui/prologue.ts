import {
  CINNABAR,
  INK,
  createComicPatterns,
  drawComicSfx,
  drawInkWashBlot,
  drawRedSeal,
  drawRepublicanFrameCorners,
  drawVerticalCalligraphy,
  dryBrushLine,
  inkLine,
  inkPoly,
  inkRect,
  type ComicPatterns
} from '../scene/comic2d/textures';
import type { SfxEngine } from './audio';

interface PrologueBeat {
  chapter: string;
  title: string;
  speaker: string;
  speakerKind: 'narrator' | 'system' | 'boy';
  lines: string[];
  sfx: 'omen' | 'gust' | 'reward' | 'knock' | 'stamp';
  buttonText: string;
}

const PROLOGUE_BEATS: PrologueBeat[] = [
  {
    chapter: '序幕 · 其一',
    title: '凌晨两点半 · 误入纸火',
    speaker: '旁白',
    speakerKind: 'narrator',
    lines: [
      '凌晨两点半，你在租屋里点开那份来路不明的中式怪谈试玩包，进度条走到 99% 时，屏幕骤然漆黑。',
      '再睁开眼，耳边没了空调嗡鸣，只有穿堂而过的冷风，和满屋白纸互相摩擦的沙沙声。'
    ],
    sfx: 'omen',
    buttonText: '睁眼打量四周'
  },
  {
    chapter: '序幕 · 其二',
    title: '无主老铺 · 三灯悬梁',
    speaker: '旁白',
    speakerKind: 'narrator',
    lines: [
      '你站在尘灰落满门槛的老纸扎铺里。窗外是一座既挂着现代霓虹、又飘着冥纸余灰的怪异小镇——你真的穿越进了这款诡异游戏世界。',
      '白纸马在冷月下僵立，长衫黑影自窗纸外擦肩掠过。你刚想推门逃离，脑海里却炸响一声冰冷的铜钟轻鸣——'
    ],
    sfx: 'gust',
    buttonText: '听清脑海中的声音'
  },
  {
    chapter: '序幕 · 其三',
    title: '纸火经营系统 · 强制绑定',
    speaker: '纸火经营系统',
    speakerKind: 'system',
    lines: [
      '「宿主已接入。本镇已被诡异规则接管，无身份者入夜后活不过一更。现将这间无主纸扎铺划为你的安全屋，并覆写身份为【外来新掌柜】。」',
      '「想要在这里活下去，每日天亮须消耗 1 份【生存口粮】——镇上买不到它，唯有经营纸扎铺赚取【纸火点】向本系统兑换。」'
    ],
    sfx: 'reward',
    buttonText: '翻看这间铺子的规矩'
  },
  {
    chapter: '序幕 · 其四',
    title: '阳页与阴页 · 昼迎活人，夜待诡异',
    speaker: '纸火经营系统 · 纸马童',
    speakerKind: 'boy',
    lines: [
      '「每天分成日夜：白天开门满足【活人】的红白纸扎与净宅需求，攒下现金、纸料并打听禁忌；天黑落锁翻开夜账，满足登门【诡异】的诉求，赢取丰厚纸火点与保命物资。」',
      '柜台暗处，一尊本该静止的矮小纸童忽然歪过头，往你手边推来一支沾满朱砂的毛笔：「新掌柜，天快亮了……第一批活人街坊，已经在门外敲门了。」'
    ],
    sfx: 'knock',
    buttonText: '接过朱砂笔'
  },
  {
    chapter: '序幕 · 其五',
    title: '十五日契约 · 落印开张',
    speaker: '纸火经营系统',
    speakerKind: 'system',
    lines: [
      '朱砂印落定在日账扉页，头顶三盏红灯笼渐次转暖，窗外冷雾退成晨光。',
      '「十五日试用期现已开启。守住禁忌、压稳阴气、备足口粮（按 S 可随时兑换生存物资）——祝你在这座诡异小镇里，活到终审。」'
    ],
    sfx: 'stamp',
    buttonText: '落印开铺 · 开始第 1 日营业'
  }
];

export interface PrologueController {
  play(onComplete: () => void): void;
  isOpen(): boolean;
}

export function createPrologueController(sfx: SfxEngine): PrologueController {
  const overlay = document.getElementById('prologue-stage') as HTMLElement;
  const canvas = document.getElementById('prologue-canvas') as HTMLCanvasElement;
  const chapterEl = document.getElementById('prologue-chapter') as HTMLElement;
  const titleEl = document.getElementById('prologue-title') as HTMLElement;
  const speakerEl = document.getElementById('prologue-speaker') as HTMLElement;
  const textEl = document.getElementById('prologue-text') as HTMLElement;
  const dotsEl = document.getElementById('prologue-dots') as HTMLElement;
  const nextBtn = document.getElementById('prologue-next') as HTMLButtonElement;
  const skipBtn = document.getElementById('prologue-skip') as HTMLButtonElement;

  const ctx = canvas.getContext('2d')!;
  const patterns = createComicPatterns(ctx);
  const paperPattern = ctx.createPattern(patterns.paperTile, 'repeat');

  let open = false;
  let beatIdx = 0;
  let beatStart = 0;
  let raf = 0;
  let finishCb: (() => void) | null = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function renderDots() {
    dotsEl.innerHTML = PROLOGUE_BEATS.map(
      (_, i) => `<i class="p-dot${i === beatIdx ? ' active' : i < beatIdx ? ' done' : ''}"></i>`
    ).join('');
  }

  function applyBeat(idx: number) {
    beatIdx = idx;
    beatStart = performance.now();
    const beat = PROLOGUE_BEATS[idx];
    chapterEl.textContent = beat.chapter;
    titleEl.textContent = beat.title;
    speakerEl.textContent = beat.speaker;
    speakerEl.dataset.kind = beat.speakerKind;
    textEl.innerHTML = beat.lines.map((l) => `<p>${l}</p>`).join('');
    nextBtn.textContent = beat.buttonText;
    renderDots();

    // Play subtle atmosphere cue for each beat
    if (beat.sfx === 'omen') sfx.omen();
    else if (beat.sfx === 'gust') sfx.gust();
    else if (beat.sfx === 'reward') sfx.reward();
    else if (beat.sfx === 'knock') sfx.knock();
    else sfx.stamp();

    drawScene(performance.now());
  }

  function closePrologue() {
    if (!open) return;
    open = false;
    cancelAnimationFrame(raf);
    overlay.classList.remove('show');
    overlay.hidden = true;
    const cb = finishCb;
    finishCb = null;
    if (cb) cb();
  }

  function advance() {
    if (!open) return;
    if (beatIdx + 1 < PROLOGUE_BEATS.length) {
      applyBeat(beatIdx + 1);
    } else {
      sfx.stamp();
      closePrologue();
    }
  }

  nextBtn.addEventListener('click', advance);
  skipBtn.addEventListener('click', () => {
    sfx.paper();
    closePrologue();
  });

  document.addEventListener('keydown', (event) => {
    if (!open || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      sfx.paper();
      closePrologue();
    } else if (event.key === ' ' || event.key === 'Enter' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance();
    }
  });

  /** Renders custom monochrome ink-wash + cinnabar comic panel art for each of the 5 prologue beats */
  function drawScene(now: number) {
    const W = 960;
    const H = 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t = reducedMotion.matches ? 1.2 : (now - beatStart) * 0.001;
    const fadeIn = Math.min(1, t * 4.5);

    ctx.fillStyle = '#0e0f10';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.65 + fadeIn * 0.35;

    if (beatIdx === 0) drawBeat1ScreenTransmigrate(ctx, W, H, t, patterns);
    else if (beatIdx === 1) drawBeat2AwakenInShop(ctx, W, H, t, patterns);
    else if (beatIdx === 2) drawBeat3SystemBind(ctx, W, H, t, patterns);
    else if (beatIdx === 3) drawBeat4DayLivingNightEerie(ctx, W, H, t, patterns);
    else drawBeat5ContractStamp(ctx, W, H, t, patterns);

    ctx.restore();

    // Xuan paper grain & Republican double-line ink panel frame
    if (paperPattern) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = paperPattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.strokeStyle = 'rgba(232, 224, 206, 0.24)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    drawRepublicanFrameCorners(ctx, W, H, 'rgba(206, 52, 40, 0.55)');
  }

  function loop(now: number) {
    if (!open) return;
    drawScene(now);
    raf = requestAnimationFrame(loop);
  }

  return {
    isOpen() {
      return open;
    },
    play(onComplete: () => void) {
      finishCb = onComplete;
      open = true;
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('show'));
      applyBeat(0);
      nextBtn.focus({ preventScroll: true });
      if (!reducedMotion.matches) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    }
  };
}

/** 第一幕：深夜电脑屏幕 99% 黑屏，朱砂「纸火」浮现，方孔纸钱涌出 */
function drawBeat1ScreenTransmigrate(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  patterns: ComicPatterns
) {
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.48, 30, W * 0.5, H * 0.48, W * 0.62);
  bg.addColorStop(0, '#232629');
  bg.addColorStop(1, '#0a0b0c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Desk surface
  inkPoly(ctx, [[80, 326], [880, 326], [950, 400], [10, 400]], '#1d1e20', 2.4, INK, patterns.hatchDense);

  // Glowing monitor silhouette in dark room
  const mx = 310;
  const my = 72;
  const mw = 340;
  const mh = 212;
  drawInkWashBlot(ctx, mx + mw / 2, my + mh / 2, 240, 150, 0.42, '182, 40, 30');
  inkRect(ctx, mx, my, mw, mh, '#141517', 3);
  inkRect(ctx, mx + 12, my + 12, mw - 24, mh - 24, '#0c0d0f', 2);
  // Stand
  inkRect(ctx, 462, my + mh, 36, 36, '#1a1b1d', 2.2);
  inkRect(ctx, 412, my + mh + 34, 136, 12, '#242628', 2.2);

  // Flickering crimson seal & 99% loading bar on screen
  const pulse = 0.72 + 0.28 * Math.sin(t * 4.5);
  ctx.save();
  ctx.globalAlpha = pulse;
  drawRedSeal(ctx, 480, 152, 54, '紙');
  ctx.font = '700 22px "Songti SC","STSong",serif';
  ctx.fillStyle = '#efe7d6';
  ctx.textAlign = 'center';
  ctx.fillText('《纸 火》 · 载 入 99%', 480, 212);
  // Progress bar stuck at 99%
  inkRect(ctx, 376, 232, 208, 12, '#1d1e20', 1.6);
  ctx.fillStyle = CINNABAR;
  ctx.fillRect(378, 234, 200, 8);
  ctx.restore();

  // Punched joss paper slips spilling OUT of the monitor into reality!
  for (let i = 0; i < 11; i++) {
    const p = (t * 0.32 + i * 0.17) % 1;
    const ang = -Math.PI + (i / 10) * Math.PI * 2;
    const r = 65 + p * 310;
    const px = 480 + Math.cos(ang) * r * 1.15;
    const py = 175 + Math.sin(ang) * r * 0.62;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang + t * 0.8);
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.88;
    inkPoly(ctx, [[-10, -14], [10, -14], [9, 14], [-9, 14]], '#ebe3ce', 1.4);
    ctx.fillStyle = '#111214';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }

  drawComicSfx(ctx, '滋啦…', 715, 118, 22, 0.78, 'crimson', 0.12);
}

/** 第二幕：推门醒在无主老纸扎铺，三盏灯笼、白纸马与窗外长衫黑影 */
function drawBeat2AwakenInShop(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  patterns: ComicPatterns
) {
  const wallGrad = ctx.createLinearGradient(0, 0, 0, H);
  wallGrad.addColorStop(0, '#101315');
  wallGrad.addColorStop(0.55, '#202528');
  wallGrad.addColorStop(1, '#0c0e10');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(0, 0, W, H);
  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Lattice window & pale moon
  inkRect(ctx, 310, 74, 340, 210, '#1b2124', 3);
  ctx.fillStyle = '#f2efe2';
  ctx.beginPath();
  ctx.arc(542, 146, 36, 0, Math.PI * 2);
  ctx.fill();

  // Passing tall Republican shadow silhouette outside window
  const sx = 350 + ((t * 28) % 240);
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = '#090a0b';
  ctx.beginPath();
  ctx.ellipse(sx, 205, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(sx - 28, 184, 56, 6);
  ctx.fillRect(sx - 15, 168, 30, 18);
  inkPoly(ctx, [[sx - 34, 284], [sx - 26, 226], [sx + 26, 226], [sx + 34, 284]], '#090a0b', 0);
  ctx.restore();

  // Lattice mullions
  for (let i = 1; i < 6; i++) inkRect(ctx, 310 + (340 / 6) * i - 2, 74, 4, 210, '#121517', 0);
  inkRect(ctx, 310, 140, 340, 4, '#121517', 0);
  inkRect(ctx, 310, 214, 340, 4, '#121517', 0);

  // Shop plaque above
  inkRect(ctx, 368, 22, 224, 42, '#161718', 2.4);
  ctx.font = '700 22px "Songti SC","STSong",serif';
  ctx.fillStyle = '#f2ead8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('纸  马  纸  扎', 480, 43);

  // Three swaying red lanterns
  for (const [lx, ly, idx] of [
    [220, 118, 0],
    [480, 132, 1],
    [740, 118, 2]
  ]) {
    const sw = Math.sin(t * 1.4 + idx) * 5;
    inkLine(ctx, lx, 0, lx + sw, ly - 24, 2, INK);
    drawInkWashBlot(ctx, lx + sw, ly, 68, 68, 0.34, '204, 46, 34');
    ctx.fillStyle = CINNABAR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(lx + sw, ly, 30, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    inkLine(ctx, lx + sw, ly + 24, lx + sw, ly + 52, 3, CINNABAR);
  }

  // Stark white paper horse silhouette on right midground
  ctx.save();
  ctx.translate(705, 342);
  inkPoly(ctx, [[-44, -84], [42, -84], [52, -52], [-48, -52]], '#f2ece0', 2.2);
  inkPoly(ctx, [[-48, -80], [-66, -134], [-96, -118], [-88, -104], [-58, -110], [-42, -64]], '#f2ece0', 2.2);
  inkPoly(ctx, [[-18, -86], [18, -86], [22, -56], [0, -48], [-22, -56]], CINNABAR, 2);
  inkRect(ctx, -40, -52, 12, 52, '#f2ece0', 2);
  inkRect(ctx, 22, -52, 12, 52, '#f2ece0', 2);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-68, -120, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Floor counter foreground edge
  inkRect(ctx, 0, 344, W, 56, '#141618', 2.6, patterns.hatchDense);
  drawComicSfx(ctx, '铛——', 120, 140, 24, 0.78, 'crimson', -0.1);
}

/** 第三幕：纸火经营系统降临，阴阳古账本悬空翻开 + 纸火点与生存口粮连线 */
function drawBeat3SystemBind(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  patterns: ComicPatterns
) {
  ctx.fillStyle = '#121315';
  ctx.fillRect(0, 0, W, H);

  // Subtle radial comic focus lines behind the floating ledger
  ctx.save();
  ctx.strokeStyle = 'rgba(232, 224, 206, 0.1)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + t * 0.05;
    ctx.beginPath();
    ctx.moveTo(480 + Math.cos(a) * 145, 200 + Math.sin(a) * 105);
    ctx.lineTo(480 + Math.cos(a) * 520, 200 + Math.sin(a) * 340);
    ctx.stroke();
  }
  ctx.restore();

  // Open thread-bound Yin-Yang Ledger floating center
  const hover = Math.sin(t * 1.8) * 5;
  ctx.save();
  ctx.translate(480, 198 + hover);
  drawInkWashBlot(ctx, 0, 0, 230, 140, 0.45, '182, 40, 30');

  // Left page (Yang - Xuan ivory) & Right page (Yin - Sumi ink)
  inkPoly(ctx, [[-196, -110], [-4, -98], [-4, 108], [-208, 96]], '#eee6d4', 2.6, INK, patterns.woodcutH);
  inkPoly(ctx, [[4, -98], [196, -110], [208, 96], [4, 108]], '#1c2023', 2.6, INK, patterns.woodcutV);
  inkLine(ctx, 0, -104, 0, 110, 3.2, INK);

  drawVerticalCalligraphy(ctx, '阳页·活人账', -138, -62, 26, 18, '#141110');
  drawVerticalCalligraphy(ctx, '阴页·诡异账', 138, -62, 26, 18, '#f8f1e0', INK);

  // Cinnabar binding seal right across the center spine!
  drawRedSeal(ctx, 0, -6, 64, '契');
  ctx.restore();

  // Left node: 纸火点 (Reward) & Right node: 生存口粮 (Survival Supply)
  inkRect(ctx, 74, 152, 134, 96, '#1b1d1f', 2.4);
  drawRedSeal(ctx, 141, 184, 30, '奖');
  ctx.font = '700 16px "Songti SC","STSong",serif';
  ctx.fillStyle = '#f2ead8';
  ctx.textAlign = 'center';
  ctx.fillText('经营赢·纸火点', 141, 224);

  inkRect(ctx, 752, 152, 134, 96, '#1b1d1f', 2.4);
  drawRedSeal(ctx, 819, 184, 30, '粮');
  ctx.fillStyle = '#f2ead8';
  ctx.fillText('兑换·生存口粮', 819, 224);

  // Cinnabar ink threads connecting ledger <-> reward <-> ration
  dryBrushLine(ctx, 208, 200, 272, 200, 2.6, CINNABAR, 0.85);
  dryBrushLine(ctx, 688, 200, 752, 200, 2.6, CINNABAR, 0.85);
}

/** 第四幕：左右双画格对比（左：白天宣纸活人需求；右：夜晚焦墨血月诡异需求） */
function drawBeat4DayLivingNightEerie(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  patterns: ComicPatterns
) {
  // Left Panel: DAY (Xuan Paper Ivory - Living Townspeople)
  ctx.save();
  ctx.beginPath();
  ctx.rect(14, 14, W / 2 - 22, H - 28);
  ctx.clip();
  ctx.fillStyle = '#dfd6c2';
  ctx.fillRect(0, 0, W / 2, H);
  if (patterns.woodcutH) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(0, 0, W / 2, H);
    ctx.globalAlpha = 1;
  }
  // Warm paper sun & counter
  ctx.fillStyle = '#f7f2e4';
  ctx.beginPath();
  ctx.arc(360, 110, 44, 0, Math.PI * 2);
  ctx.fill();
  // Living villager silhouette
  inkPoly(ctx, [[190, 320], [202, 186], [278, 186], [290, 320]], '#49453e', 2.4, INK, patterns.woodcutV);
  ctx.fillStyle = '#efe7d4';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(240, 150, 22, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  inkPoly(ctx, [[216, 144], [218, 120], [262, 120], [264, 144]], '#171514', 2);
  // Counter
  inkRect(ctx, 10, 316, 460, 80, '#3a3731', 2.4);
  inkRect(ctx, 100, 290, 80, 26, '#f4eedf', 2);
  drawRedSeal(ctx, 64, 68, 44, '昼');
  drawVerticalCalligraphy(ctx, '活人需求', 64, 126, 28, 19, INK);
  ctx.restore();

  // Right Panel: NIGHT (Sumi Ink & Blood Moon - Eerie Entities)
  ctx.save();
  ctx.beginPath();
  ctx.rect(W / 2 + 8, 14, W / 2 - 22, H - 28);
  ctx.clip();
  ctx.fillStyle = '#111417';
  ctx.fillRect(W / 2, 0, W / 2, H);
  // Crimson-rimmed full moon
  drawInkWashBlot(ctx, 640, 118, 92, 92, 0.42, '204, 42, 32');
  ctx.fillStyle = '#f2d9cb';
  ctx.strokeStyle = CINNABAR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(640, 118, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Paper Bride crimson veil silhouette + Paper Doll side-staring!
  const sway = Math.sin(t * 1.6) * 3;
  inkPoly(ctx, [[685, 320], [696, 180], [776, 180], [788, 320]], '#981f18', 2.6, INK, patterns.woodcutV);
  inkPoly(ctx, [[708, 122], [764, 122], [772 + sway, 188], [736 + sway * 0.5, 200], [700 + sway, 188]], CINNABAR, 2.5);
  inkLine(ctx, 702 + sway, 188, 736 + sway * 0.5, 200, 2.4, '#efe0b4');
  inkLine(ctx, 736 + sway * 0.5, 200, 770 + sway, 188, 2.4, '#efe0b4');

  // Eerie paper boy peeking near lower center
  inkPoly(ctx, [[566, 320], [574, 232], [626, 232], [634, 320]], '#2d2b28', 2.2);
  ctx.fillStyle = '#f4ede0';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(600, 204, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(202, 36, 28, 0.8)';
  ctx.beginPath();
  ctx.arc(590, 208, 4.5, 0, Math.PI * 2);
  ctx.arc(610, 208, 4.5, 0, Math.PI * 2);
  ctx.fill();

  inkRect(ctx, 480, 316, 470, 80, '#16191c', 2.4);
  drawRedSeal(ctx, 894, 68, 44, '夜');
  drawVerticalCalligraphy(ctx, '诡异需求', 894, 126, 28, 19, '#f0e6d2');
  ctx.restore();

  // Bold center comic gutter divider with cinnabar talisman strip
  inkRect(ctx, W / 2 - 8, 10, 16, H - 20, '#0d0e0f', 2);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.14);
  inkRect(ctx, -18, -56, 36, 112, '#ecd894', 2.2);
  drawVerticalCalligraphy(ctx, '日夜双账', 0, -30, 22, 15, CINNABAR);
  ctx.restore();
}

/** 第五幕：朱砂开张大印落定，三盏红灯渐明，晨光初现 */
function drawBeat5ContractStamp(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
  patterns: ComicPatterns
) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#cdc4b0');
  grad.addColorStop(0.55, '#e6dec9');
  grad.addColorStop(1, '#b5ac98');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  if (patterns.woodcutH) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = patterns.woodcutH;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Ink landscape silhouette in background
  inkPoly(ctx, [[0, 340], [180, 260], [340, 290], [540, 240], [740, 280], [960, 230], [960, 400], [0, 400]], '#2b2a27', 2, INK, patterns.hatchLight);

  // Giant bold calligraphic title + stamped cinnabar seal 「開」
  const stampDrop = Math.min(1, t * 3.2);
  const scale = 1.25 - 0.25 * stampDrop;
  ctx.save();
  ctx.translate(480, 152);
  ctx.scale(scale, scale);
  drawInkWashBlot(ctx, 0, 0, 128, 128, 0.28 * stampDrop, '182, 40, 30');
  drawRedSeal(ctx, 0, 0, 92, '開');
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 32px "Songti SC","STSong","Noto Serif CJK SC",serif';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#121010';
  ctx.strokeText('第 一 日 · 开 铺 迎 客', 480, 312);
  ctx.fillStyle = '#f8f1e2';
  ctx.fillText('第 一 日 · 开 铺 迎 客', 480, 312);
  ctx.font = '500 15px "Songti SC","STSong",serif';
  ctx.fillStyle = '#dfd5c0';
  ctx.fillText('十五日诡异小镇生存契约 · 已生效', 480, 348);
  ctx.restore();

  // Three warm red lanterns flanking top
  for (const lx of [160, 480, 800]) {
    inkLine(ctx, lx, 0, lx, 44, 2, INK);
    ctx.fillStyle = CINNABAR;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(lx, 64, 26, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    inkLine(ctx, lx, 85, lx, 108, 2.8, CINNABAR);
  }
}
