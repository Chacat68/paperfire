import { NIGHT_ORDERS, getNightOrderById, getScheduledNightOrder } from '../data/night';
import { ORDER_BY_ID } from '../data/orders';
import type { ActionOption, GameState, StageDialogueView } from '../data/types';
import { isNightPhase } from '../engine';
import {
  drawComicGuest,
  drawComicPaperDoll,
  drawComicPaperHorse,
  type GuestVariant
} from './comic2d/characters';
import { createEerieEventController, type EerieEventKind } from './comic2d/eerieEvents';
import {
  drawCounterAndProps,
  drawHangingLanterns,
  drawShopBackdrop,
  type EnvDrawState
} from './comic2d/environment';
import { drawStreetBackdrop, type StreetSpotKey } from './comic2d/streetScene';
import { createComicPatterns, drawRepublicanFrameCorners, INK } from './comic2d/textures';

export interface ShopSceneController {
  sync(state: GameState, moves: ActionOption[], dialogue?: StageDialogueView): void;
  highlight(actionId: string, active: boolean): void;
  dispose(): void;
}

const STAGE_W = 1600;
const STAGE_H = 900;

type CameraPreset =
  | 'day_wide'
  | 'street_front'
  | 'street_back'
  | 'craft_closeup'
  | 'night_board'
  | 'site_wu'
  | 'site_third_lamp'
  | 'site_door'
  | 'site_ledger';

interface CameraView {
  cx: number;
  cy: number;
  zoom: number;
}

const CAMERA_PRESETS: Record<CameraPreset, CameraView> = {
  day_wide: { cx: 800, cy: 410, zoom: 1.0 },
  street_front: { cx: 800, cy: 410, zoom: 1.0 },
  street_back: { cx: 1930, cy: 410, zoom: 0.9 },
  craft_closeup: { cx: 745, cy: 455, zoom: 1.13 },
  night_board: { cx: 810, cy: 405, zoom: 1.02 },
  site_wu: { cx: 745, cy: 406, zoom: 1.04 },
  site_third_lamp: { cx: 882, cy: 398, zoom: 1.04 },
  site_door: { cx: 990, cy: 400, zoom: 1.08 },
  site_ledger: { cx: 740, cy: 438, zoom: 1.1 }
};

type ParallaxPlane = 'back' | 'mid' | 'front';

interface Hotspot2D {
  key: string;
  mode: 'shop' | 'street';
  streetSpot?: StreetSpotKey;
  plane: ParallaxPlane;
  // Stage coordinates (anchor for marker + hit ellipse)
  x: number;
  y: number;
  rx: number;
  ry: number;
  markerY?: number;
  choices: Array<[string, string]>;
  action?: string;
  marker: HTMLButtonElement;
}

interface DustMote {
  x: number;
  y: number;
  r: number;
  speed: number;
  phase: number;
}

function createDustMotes(): DustMote[] {
  let seed = 9187;
  const rand = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: 42 }, () => ({
    x: 120 + rand() * 1360,
    y: 120 + rand() * 520,
    r: 1.2 + rand() * 2.1,
    speed: 6 + rand() * 12,
    phase: rand() * Math.PI * 2
  }));
}

export function createComic2DScene(
  host: HTMLElement,
  scenePanel: HTMLElement,
  markerLayer: HTMLElement,
  markerHint: HTMLElement,
  onEerieEvent?: (kind: EerieEventKind) => void,
  onOpenStreet?: () => void
): ShopSceneController | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  host.replaceChildren(canvas);
  host.hidden = false;
  markerLayer.hidden = false;
  scenePanel.dataset.renderer = 'comic2d';

  const patterns = createComicPatterns(ctx);
  const paperPattern = ctx.createPattern(patterns.paperTile, 'repeat');
  const dustMotes = createDustMotes();
  const eerieCtrl = createEerieEventController(onEerieEvent);

  const rawTargets: Array<Omit<Hotspot2D, 'marker'>> = [
    {
      key: 'lamp',
      mode: 'shop',
      plane: 'mid',
      x: 1012,
      y: 216,
      rx: 68,
      ry: 78,
      choices: [
        ['use-strip', '用纸带封灯'],
        ['guard', '请阿杰守灯'],
        ['peak-trim-lamps', '挑亮前两红灯'],
        ['calm-flame', '定住灯火']
      ]
    },
    {
      key: 'doll',
      mode: 'shop',
      plane: 'mid',
      x: 960,
      y: 386,
      rx: 78,
      ry: 132,
      choices: [
        ['seat', '正统安座'],
        ['improvise', '临时安座']
      ]
    },
    {
      key: 'paper',
      mode: 'shop',
      plane: 'front',
      x: 912,
      y: 552,
      rx: 88,
      ry: 48,
      choices: [
        ['place-horse', '摆正纸马'],
        ['peak-veil-ward', '挂红帐隔目'],
        ['rite-orthodox', '正统仪轨'],
        ['use-ward-doll', '护身替纸人'],
        ['use-talisman', '安神纸符'],
        ['use-paper', '取净纸'],
        ['incense', '点定神香'],
        ['prepare_strip', '裁窄纸带'],
        ['craft_talisman', '折安神符']
      ]
    },
    {
      key: 'door',
      mode: 'shop',
      plane: 'back',
      x: 1298,
      y: 356,
      rx: 138,
      ry: 175,
      choices: [
        ['ward-door', '贴镇门纸'],
        ['escort', '送伞出门'],
        ['seal', '封门落闩'],
        ['open_street', '推门外出街巷']
      ]
    },
    {
      key: 'phone',
      mode: 'shop',
      plane: 'front',
      x: 694,
      y: 556,
      rx: 42,
      ry: 32,
      choices: [['quiet-phone', '收起手机']]
    },
    {
      key: 'plaque',
      mode: 'shop',
      plane: 'front',
      x: 796,
      y: 552,
      rx: 46,
      ry: 42,
      choices: [
        ['deliver', '交付交差'],
        ['identify', '指认纸牌']
      ]
    },
    {
      key: 'book',
      mode: 'shop',
      plane: 'front',
      x: 518,
      y: 558,
      rx: 82,
      ry: 44,
      choices: [
        ['audit-ledger', '摊账对簿'],
        ['peak-avert-chair', '掩目不数人'],
        ['pick_d2_wu_cleanse', '接净宅单'],
        ['pick_d1_chen_white', '陈婶白事单'],
        ['pick_d3_chen_horse', '补做纸马'],
        ['night', '翻夜账'],
        ['go', '赴约']
      ]
    },
    // 外出街巷四处可交互建筑热点（骑楼三连开间 + 右侧老槐石牌坊，浮标置于廊下门槛处不挡匾额与二楼花窗）
    {
      key: 'street_grocery',
      mode: 'street',
      streetSpot: 'grocery',
      plane: 'mid',
      x: 377,
      y: 356,
      rx: 170,
      ry: 170,
      markerY: 472,
      choices: [
        ['supply_small', '镇集杂货进货'],
        ['supply_large', '大批量进货']
      ]
    },
    {
      key: 'street_clinic',
      mode: 'street',
      streetSpot: 'clinic',
      plane: 'mid',
      x: 741,
      y: 356,
      rx: 170,
      ry: 170,
      markerY: 472,
      choices: [['supply_lin_clean', '林氏诊所备药纸']]
    },
    {
      key: 'street_tailor',
      mode: 'street',
      streetSpot: 'tailor',
      plane: 'mid',
      x: 1095,
      y: 356,
      rx: 162,
      ry: 170,
      markerY: 472,
      choices: [
        ['inquire_liu', '向柳裁缝问忌'],
        ['prepare_strip', '裁窄纸带'],
        ['craft_talisman', '借案折安神符']
      ]
    },
    {
      key: 'street_nav_back',
      mode: 'street',
      plane: 'mid',
      x: 1324,
      y: 340,
      rx: 68,
      ry: 100,
      markerY: 266,
      choices: [['street_go_back', '往深街旧坊 ›']]
    },
    {
      key: 'street_nav_front',
      mode: 'street',
      plane: 'mid',
      x: 1435,
      y: 266,
      rx: 68,
      ry: 68,
      markerY: 266,
      choices: [['street_go_front', '‹ 折返前街']]
    },
    {
      key: 'street_teahouse',
      mode: 'street',
      streetSpot: 'teahouse',
      plane: 'mid',
      x: 1448,
      y: 356,
      rx: 168,
      ry: 170,
      markerY: 472,
      choices: [['explore_teahouse', '德昌茶楼叙旧']]
    },
    {
      key: 'street_bookstore',
      mode: 'street',
      streetSpot: 'bookstore',
      plane: 'mid',
      x: 1816,
      y: 356,
      rx: 168,
      ry: 170,
      markerY: 472,
      choices: [['explore_bookstore', '墨香书肆翻卷']]
    },
    {
      key: 'street_shrine',
      mode: 'street',
      streetSpot: 'shrine',
      plane: 'mid',
      x: 2177,
      y: 356,
      rx: 166,
      ry: 170,
      markerY: 472,
      choices: [['explore_shrine', '城隍堂上香']]
    },
    {
      key: 'street_alley',
      mode: 'street',
      streetSpot: 'alley',
      plane: 'mid',
      x: 2468,
      y: 382,
      rx: 104,
      ry: 145,
      markerY: 458,
      choices: [
        ['calm_rumor', '请阿杰圆场'],
        ['explore_alley', '老槐巷拾遗']
      ]
    }
  ];

  function perform(action?: string) {
    if (!action) return;
    if (action === 'open_street') {
      onOpenStreet?.();
      return;
    }
    const button = document.querySelector<HTMLButtonElement>(`#actions button[data-action="${action}"]`);
    if (button && !button.disabled) button.click();
  }

  let highlightedKey: string | null = null;
  let highlightedStreetSpot: StreetSpotKey | null = null;
  let hoveredCanvasKey: string | null = null;

  function actionToStreetSpot(action?: string): StreetSpotKey | null {
    if (!action) return null;
    if (action === 'supply_small' || action === 'supply_large') return 'grocery';
    if (action === 'supply_lin_clean') return 'clinic';
    if (action === 'inquire_liu' || action === 'prepare_strip' || action === 'craft_talisman') return 'tailor';
    if (action === 'explore_teahouse') return 'teahouse';
    if (action === 'explore_bookstore') return 'bookstore';
    if (action === 'explore_shrine') return 'shrine';
    if (action === 'calm_rumor' || action === 'explore_alley') return 'alley';
    return null;
  }

  const targets: Hotspot2D[] = [];
  function linkAction(action: string | undefined, isOn: boolean) {
    if (!action) return;
    const spot = actionToStreetSpot(action);
    highlightedStreetSpot = isOn ? spot : null;
    document
      .querySelectorAll(`#actions button[data-action="${action}"]`)
      .forEach((btn) => btn.classList.toggle('linked', isOn));
    let matchedKey: string | null = null;
    for (const t of targets) {
      const matched = t.action === action || Boolean(spot && t.streetSpot === spot && t.action);
      if (matched) {
        t.marker.classList.toggle('linked', isOn);
        matchedKey = t.key;
      }
    }
    highlightedKey = isOn ? matchedKey : null;
  }

  markerLayer.replaceChildren();
  for (const raw of rawTargets) {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'hotspot';
    marker.hidden = true;
    const target: Hotspot2D = { ...raw, marker };
    marker.addEventListener('click', () => perform(target.action));
    marker.addEventListener('pointerenter', () => linkAction(target.action, true));
    marker.addEventListener('pointerleave', () => linkAction(target.action, false));
    marker.addEventListener('focus', () => linkAction(target.action, true));
    marker.addEventListener('blur', () => linkAction(target.action, false));
    markerLayer.append(marker);
    targets.push(target);
  }

  let gameState: GameState | null = null;
  let currentDialogue: StageDialogueView | undefined;
  let lastBubbleSignature = '';
  let lastBubblePosKey = '';
  let width = 0;
  let height = 0;
  let dpr = 1;
  let narrow = false;
  let lastTime = 0;
  let active = true;
  let frame = 0;
  let currentPreset: CameraPreset = 'day_wide';

  const deckEl = document.querySelector<HTMLElement>('.control-deck');
  const hudTopEl = document.querySelector<HTMLElement>('.hud-top');
  const encounterBoxEl = document.getElementById('encounter-hud');
  const bubbleEl = document.getElementById('speech-bubble') as HTMLElement | null;
  const sbSpeakerEl = document.getElementById('sb-speaker') as HTMLElement | null;
  const sbRoleEl = document.getElementById('sb-role') as HTMLElement | null;
  const sbProgressEl = document.getElementById('sb-progress') as HTMLElement | null;
  const sbProfileEl = document.getElementById('sb-profile') as HTMLElement | null;
  const sbIdentityEl = document.getElementById('sb-identity') as HTMLElement | null;
  const sbTraitsEl = document.getElementById('sb-traits') as HTMLElement | null;
  const sbCueEl = document.getElementById('sb-cue') as HTMLElement | null;
  const sbLineEl = document.getElementById('sb-line') as HTMLElement | null;
  const sbFootEl = document.getElementById('sb-foot') as HTMLElement | null;

  // 缓存 HUD / 底部操作台 / 气泡尺寸，避免 60fps 主循环中每帧触发布局重排（Forced Reflow）
  const layoutCache = {
    deckTop: 640,
    topSafeHotspot: 92,
    topSafeBubble: 112,
    bubbleW: 360,
    bubbleH: 136
  };

  function measureLayout() {
    const hostRect = host.getBoundingClientRect();
    if (hostRect.width < 1 || hostRect.height < 1) return;
    layoutCache.deckTop = deckEl ? deckEl.getBoundingClientRect().top - hostRect.top : height - 180;
    layoutCache.topSafeHotspot =
      encounterBoxEl && !encounterBoxEl.hidden
        ? Math.max(96, encounterBoxEl.getBoundingClientRect().bottom - hostRect.top + 18)
        : 92;
    layoutCache.topSafeBubble = hudTopEl
      ? Math.max(106, hudTopEl.getBoundingClientRect().bottom - hostRect.top + 8)
      : 112;
    if (bubbleEl && !bubbleEl.hidden) {
      const bw = bubbleEl.offsetWidth;
      const bh = bubbleEl.offsetHeight;
      if (bw > 0) layoutCache.bubbleW = bw;
      if (bh > 0) layoutCache.bubbleH = bh;
    }
  }

  function renderRichBubbleLine(target: HTMLElement, raw: string) {
    target.replaceChildren();
    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    for (const part of parts) {
      if (!part) continue;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        const em = document.createElement('em');
        em.textContent = part.slice(2, -2);
        target.append(em);
      } else {
        target.append(document.createTextNode(part));
      }
    }
  }

  const onBubbleClick = () => {
    if (!currentDialogue || currentDialogue.finished) return;
    const advBtn = document.querySelector<HTMLButtonElement>(
      '#actions button[data-action="advance_dialogue"], #actions button[data-action="advance_night_dialogue"]'
    );
    if (advBtn && !advBtn.disabled) advBtn.click();
  };
  bubbleEl?.addEventListener('click', onBubbleClick);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cam: CameraView = { cx: 800, cy: 410, zoom: 1.0 };
  const pan = { x: 0, y: 0 };
  const panSmooth = { x: 0, y: 0 };
  const cursorNorm = { x: 0, y: 0 };

  let darkness = 0;
  let opening = 1;
  let posture = 0;
  let guestX = 640;
  let guestAlpha = 1;
  let lastGuestKey: string | null = null;

  function pickCameraPreset(state: GameState): CameraPreset {
    if (state.phase === 'day') {
      if (state.dayTab === 'street') return state.streetZone === 'back' ? 'street_back' : 'street_front';
      if (state.dayTab === 'orders' && state.selectedOrderId) return 'craft_closeup';
      return 'day_wide';
    }
    if (state.phase === 'board') {
      if (state.selectedNightOrderId) return 'site_wu';
      return state.day === 3 ? 'site_third_lamp' : 'night_board';
    }
    if (state.phase === 'site') {
      if (state.day === 2) return 'site_wu';
      if (state.day === 3) return 'site_third_lamp';
      if (state.day === 4) return 'site_door';
      return 'site_ledger';
    }
    return state.day === 3 && isNightPhase(state.phase) ? 'site_third_lamp' : 'night_board';
  }

  function planeParallax(plane: ParallaxPlane): number {
    if (plane === 'back') return 0.55;
    if (plane === 'mid') return 1.0;
    return 1.38;
  }

  /** Computes current stage-to-screen transform metrics */
  function getStageTransform() {
    const baseScale = Math.max(width / STAGE_W, height / STAGE_H);
    const narrowComp = narrow ? 0.92 : 1.0;
    const scale = baseScale * cam.zoom * narrowComp;
    // Shift camera slightly upward so the bottom control deck never hides counter props
    const screenFocusY = height * (narrow ? 0.41 : 0.45);
    const screenFocusX = width * 0.5;
    return { scale, screenFocusX, screenFocusY };
  }

  function stageToScreen(sx: number, sy: number, plane: ParallaxPlane): [number, number] {
    const { scale, screenFocusX, screenFocusY } = getStageTransform();
    const p = planeParallax(plane);
    const px = sx - cam.cx - panSmooth.x * p;
    const py = sy - cam.cy - panSmooth.y * p;
    return [screenFocusX + px * scale, screenFocusY + py * scale];
  }

  function hitTestTarget(clientX: number, clientY: number): Hotspot2D | null {
    const bounds = host.getBoundingClientRect();
    const mx = clientX - bounds.left;
    const my = clientY - bounds.top;
    const { scale } = getStageTransform();

    // Check foreground targets first
    const order: ParallaxPlane[] = ['front', 'mid', 'back'];
    for (const plane of order) {
      for (const target of targets) {
        if (!target.action || target.plane !== plane) continue;
        const [sx, sy] = stageToScreen(target.x, target.y, target.plane);
        const dx = (mx - sx) / (target.rx * scale);
        const dy = (my - sy) / (target.ry * scale);
        if (dx * dx + dy * dy <= 1.05) return target;
      }
    }
    return null;
  }

  function resize() {
    const newW = Math.max(1, host.clientWidth);
    const newH = Math.max(1, host.clientHeight);
    if (newW !== width || newH !== height) {
      width = newW;
      height = newH;
      narrow = width < 741;
      dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    measureLayout();
    if (gameState) renderFrame(performance.now());
  }

  const onPointerMove = (event: PointerEvent) => {
    if (width < 1 || height < 1) return;
    if (event.pointerType === 'mouse') {
      const bounds = host.getBoundingClientRect();
      const nx = ((event.clientX - bounds.left) / width - 0.5) * 2;
      const ny = ((event.clientY - bounds.top) / height - 0.5) * 2;
      cursorNorm.x = Math.max(-1, Math.min(1, nx));
      cursorNorm.y = Math.max(-1, Math.min(1, ny));
      pan.x = nx * 22;
      pan.y = ny * 9;
    }
    const hit = hitTestTarget(event.clientX, event.clientY);
    const nextKey = hit?.key ?? null;
    if (nextKey !== hoveredCanvasKey) {
      if (hoveredCanvasKey) {
        const prev = targets.find((t) => t.key === hoveredCanvasKey);
        linkAction(prev?.action, false);
      }
      hoveredCanvasKey = nextKey;
      if (hit) linkAction(hit.action, true);
      host.style.cursor = hit ? 'pointer' : '';
    }
  };

  const onPointerLeave = () => {
    pan.x = 0;
    pan.y = 0;
    cursorNorm.x = 0;
    cursorNorm.y = 0;
    if (hoveredCanvasKey) {
      const prev = targets.find((t) => t.key === hoveredCanvasKey);
      linkAction(prev?.action, false);
      hoveredCanvasKey = null;
      host.style.cursor = '';
    }
  };

  const onClick = (event: MouseEvent) => {
    const hit = hitTestTarget(event.clientX, event.clientY);
    if (hit?.action) perform(hit.action);
  };

  host.addEventListener('pointermove', onPointerMove);
  host.addEventListener('pointerleave', onPointerLeave);
  host.addEventListener('click', onClick);

  function updateHotspots() {
    const visible: Array<[number, number]> = [];
    const deckTop = layoutCache.deckTop;
    const topSafe = layoutCache.topSafeHotspot;

    for (const target of targets) {
      if (!target.action) {
        if (!target.marker.hidden) target.marker.hidden = true;
        continue;
      }
      const anchorX = target.key === 'lamp' ? target.x + 12 : target.x;
      const anchorY =
        target.markerY !== undefined
          ? target.markerY
          : target.key === 'lamp'
            ? target.y - target.ry * 0.62
            : target.y - target.ry * 0.42;
      const [x, y] = stageToScreen(anchorX, anchorY, target.plane);
      if (x < 0 || x > width || y < topSafe || y > deckTop - 22) {
        if (!target.marker.hidden) target.marker.hidden = true;
        continue;
      }
      const px = Math.max(66, Math.min(width - 66, x));
      let py = y;
      while (visible.some(([lx, ly]) => Math.abs(lx - px) < 112 && Math.abs(ly - py) < 38) && py > topSafe + 38) {
        py -= 40;
      }
      const rx = Math.round(px);
      const ry = Math.round(py);
      const posKey = `${rx},${ry}`;
      if (target.marker.dataset.pos !== posKey) {
        target.marker.dataset.pos = posKey;
        target.marker.style.left = `${rx}px`;
        target.marker.style.top = `${ry}px`;
      }
      if (target.marker.hidden) target.marker.hidden = false;
      visible.push([px, py]);
    }
    const hideHint = !visible.length;
    if (markerHint.hidden !== hideHint) markerHint.hidden = hideHint;
  }

  function updateSpeechBubble(night: boolean) {
    if (!bubbleEl || !gameState) return;
    const inStreet = !night && gameState.phase === 'day' && gameState.dayTab === 'street';
    const guestVariant = resolveGuestVariant(gameState, night);
    if (!currentDialogue || (!inStreet && !guestVariant)) {
      if (!bubbleEl.hidden) {
        bubbleEl.hidden = true;
        lastBubblePosKey = '';
      }
      return;
    }

    if (bubbleEl.hidden) {
      bubbleEl.hidden = false;
      measureLayout();
    }
    const deckTop = layoutCache.deckTop;
    const topSafe = layoutCache.topSafeBubble;

    const anchorX = inStreet ? 1134 : guestX;
    const anchorY = inStreet ? 368 : (night && gameState.day === 4 && gameState.phase !== 'board' ? 544 : 532) - 210;
    const [headX, headY] = stageToScreen(anchorX, anchorY, 'mid');
    const bw = layoutCache.bubbleW;
    const bh = layoutCache.bubbleH;

    // 默认放在角色右侧，尖尾朝左指向角色；若角色靠右或右侧空间不足则自动翻到左侧
    const rightSpace = width - (headX + 68);
    const placeRight = !inStreet && rightSpace >= bw + 18;
    const rawLeft = placeRight ? headX + 68 : headX - 68 - bw;
    const clampedLeft = Math.round(Math.max(16, Math.min(width - bw - 16, rawLeft)));
    const rawTop = headY - bh * 0.44;
    const maxTop = Math.max(topSafe, deckTop - bh - 14);
    const clampedTop = Math.round(Math.max(topSafe, Math.min(maxTop, rawTop)));

    const posKey = `${clampedLeft},${clampedTop},${placeRight ? 1 : 0}`;
    if (posKey !== lastBubblePosKey) {
      lastBubblePosKey = posKey;
      bubbleEl.classList.toggle('tail-left', placeRight);
      bubbleEl.classList.toggle('tail-right', !placeRight);
      bubbleEl.style.left = `${clampedLeft}px`;
      bubbleEl.style.top = `${clampedTop}px`;
    }
  }

  function resolveGuestVariant(state: GameState, night: boolean): GuestVariant | null {
    if (!night) {
      if (state.dayTab === 'orders' && state.selectedOrderId) {
        return ORDER_BY_ID[state.selectedOrderId]?.guestArt ?? 'day_villager';
      }
      return null;
    }
    if (state.phase === 'board') {
      if (!state.selectedNightOrderId) return null;
      return getNightOrderById(state.selectedNightOrderId)?.guestArt ?? 'paper_boy';
    }
    if (state.day === 4 && state.watchedTonight) return null;
    const order =
      (state.activeNightOrderId && NIGHT_ORDERS[state.activeNightOrderId]) ||
      getScheduledNightOrder(state.day, state.h);
    return order.guestArt;
  }

  function resolveGuestKey(state: GameState, night: boolean): string | null {
    if (!night) {
      return state.dayTab === 'orders' ? state.selectedOrderId : null;
    }
    if (state.phase === 'board') {
      return state.selectedNightOrderId;
    }
    return state.activeNightOrderId ?? `night_${state.day}`;
  }

  function drawComicAtmosphereOverlay(
    c: CanvasRenderingContext2D,
    state: GameState,
    night: boolean,
    atSite: boolean,
    seconds: number,
    slow: boolean
  ) {
    // 1. Floating dust motes / eerie cold embers
    c.save();
    for (const m of dustMotes) {
      const driftY = slow ? 0 : ((seconds * m.speed + m.phase * 40) % 520);
      const y = ((m.y - driftY + 520) % 520) + 90;
      const x = m.x + Math.sin(seconds * 0.7 + m.phase) * 14;
      const sx = (x / STAGE_W) * width;
      const sy = (y / STAGE_H) * height;
      c.fillStyle =
        night && state.h >= 10
          ? 'rgba(220, 232, 224, 0.34)'
          : night
            ? 'rgba(232, 230, 220, 0.24)'
            : 'rgba(24, 22, 20, 0.16)';
      c.beginPath();
      c.arc(sx, sy, m.r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // 2. Subtle Xuan paper grain overlay across full canvas
    if (paperPattern) {
      c.save();
      c.globalAlpha = 0.65;
      c.fillStyle = paperPattern;
      c.fillRect(0, 0, width, height);
      c.restore();
    }

    // 3. High Yin / High Threat eerie creeping ink tendrils & comic speed lines (集中线)
    const highYin = state.h >= 8;
    const highThreat = atSite && state.threat >= 3;
    if (highYin || highThreat) {
      const intensity = highThreat ? 0.42 : Math.min(0.32, (state.h - 7) * 0.055);
      const pulse = slow ? 0.5 : 0.5 + 0.5 * Math.sin(seconds * 1.8);

      // Corner ink wash & crimson halftone dread
      c.save();
      const rad = c.createRadialGradient(
        width * 0.52,
        height * 0.44,
        Math.min(width, height) * 0.26,
        width * 0.52,
        height * 0.44,
        Math.max(width, height) * 0.72
      );
      rad.addColorStop(0, 'rgba(0,0,0,0)');
      rad.addColorStop(0.72, highThreat ? `rgba(116, 20, 18, ${intensity * 0.55})` : `rgba(10, 16, 20, ${intensity * 0.6})`);
      rad.addColorStop(1, highThreat ? `rgba(22, 6, 8, ${intensity + pulse * 0.14})` : `rgba(6, 10, 12, ${intensity + 0.2})`);
      c.fillStyle = rad;
      c.fillRect(0, 0, width, height);

      // Subtle horror manhua radial tension speed-lines (集中线) around outer perimeter
      if (highThreat) {
        const cx = width * 0.52;
        const cy = height * 0.42;
        const outerR = Math.hypot(width, height) * 0.62;
        const innerR = Math.min(width, height) * (0.42 - pulse * 0.025);
        c.strokeStyle = `rgba(18, 8, 8, ${0.34 + pulse * 0.16})`;
        c.lineWidth = 1.6;
        const count = 48;
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2 + (i % 3) * 0.015;
          const r0 = innerR + ((i * 37) % 52);
          c.beginPath();
          c.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
          c.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
          c.stroke();
        }
      }
      c.restore();
    }

    // 4. Republican-era illustrated-book double ink frame & key-fret corners (民国连环画双栏墨框与回纹角饰)
    c.save();
    c.strokeStyle = 'rgba(14, 12, 11, 0.8)';
    c.lineWidth = 4;
    c.strokeRect(4, 4, width - 8, height - 8);
    const innerFrame = night ? 'rgba(226, 224, 212, 0.22)' : 'rgba(20, 18, 16, 0.28)';
    c.strokeStyle = innerFrame;
    c.lineWidth = 1.2;
    c.strokeRect(10, 10, width - 20, height - 20);
    drawRepublicanFrameCorners(c, width, height, night ? 'rgba(218, 66, 52, 0.38)' : 'rgba(182, 40, 30, 0.42)');
    c.restore();
  }

  function renderFrame(time: number) {
    if (!active || !gameState || !ctx || width < 1 || height < 1) return;
    const dt = lastTime > 0 ? Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000)) : 0.016;
    lastTime = time;

    const slow = reducedMotion.matches;
    const phase = gameState.phase;
    const night = isNightPhase(phase);
    const third = night && gameState.day === 3;
    const atSite = phase === 'site';
    const completed = atSite || phase === 'settle';
    const steps = completed ? gameState.steps : [];
    const smooth = slow ? 1 : 1 - Math.exp(-5.8 * dt);
    const seconds = time * 0.001;

    darkness += ((night ? 1 : 0) - darkness) * smooth;
    opening += ((steps.includes('done') && (third || gameState.day === 4) ? 0 : 1) - opening) * smooth;
    posture += ((steps.includes('seated') && completed ? 1 : 0) - posture) * smooth;

    const goal = CAMERA_PRESETS[currentPreset];
    cam.cx += (goal.cx - cam.cx) * smooth;
    cam.cy += (goal.cy - cam.cy) * smooth;
    cam.zoom += (goal.zoom - cam.zoom) * smooth;

    const targetPanX = slow ? 0 : pan.x;
    const targetPanY = slow ? 0 : pan.y;
    panSmooth.x += (targetPanX - panSmooth.x) * smooth;
    panSmooth.y += (targetPanY - panSmooth.y) * smooth;

    const guestKey = resolveGuestKey(gameState, night);
    if (guestKey !== lastGuestKey) {
      lastGuestKey = guestKey;
      if (guestKey) {
        // 选中单子时，角色从右侧木门方向登场步入柜台前！
        guestX = slow ? 652 : 1110;
        guestAlpha = slow ? 1 : 0.06;
      } else {
        guestAlpha = 0;
      }
    }

    const guestTargetX =
      third && phase !== 'board'
        ? steps.includes('lamp')
          ? 1264
          : 1176
        : night && gameState.day === 4 && phase !== 'board'
          ? 1218
          : 652;
    guestX += (guestTargetX - guestX) * smooth;
    guestAlpha += ((guestKey ? 1 : 0) - guestAlpha) * smooth;

    // Reset transform & clear
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, height);

    const { scale, screenFocusX, screenFocusY } = getStageTransform();
    const drawPlane = (plane: ParallaxPlane, fn: () => void) => {
      const p = planeParallax(plane);
      ctx.save();
      ctx.translate(screenFocusX, screenFocusY);
      ctx.scale(scale, scale);
      ctx.translate(-cam.cx - panSmooth.x * p, -cam.cy - panSmooth.y * p);
      fn();
      ctx.restore();
    };

    const eerie = eerieCtrl.update(seconds, dt, gameState, night, slow);

    const envState: EnvDrawState = {
      state: gameState,
      darkness,
      night,
      third,
      atSite,
      steps,
      opening,
      seconds,
      slow,
      patterns,
      highlightedKey,
      eerie,
      eerieCtrl
    };

    const inStreet = !night && phase === 'day' && gameState.dayTab === 'street';

    if (inStreet) {
      // 外出街巷模式：切换为全屏手绘民国水墨青石老镇街景！
      drawPlane('mid', () => {
        drawStreetBackdrop(ctx, {
          state: gameState!,
          seconds,
          slow,
          patterns,
          highlightedSpot: highlightedStreetSpot
        });
      });
    } else {
      // Plane 1 (Back): Shop Architecture, Lattice Windows, Moon, Cabinet, Wooden Door
      drawPlane('back', () => {
        drawShopBackdrop(ctx, envState);
      });

      // Plane 2 (Mid): Guests, Paper Doll / Paper Horse, Three Hanging Silk Lanterns
      drawPlane('mid', () => {
        const guestVariant = resolveGuestVariant(gameState!, night);
        if (guestVariant && guestAlpha > 0.02) {
          const inBoardDialogue =
            (gameState!.phase === 'day' && Boolean(gameState!.selectedOrderId)) ||
            (gameState!.phase === 'board' && Boolean(gameState!.selectedNightOrderId));
          const guestY = third && phase !== 'board' ? 548 : night && gameState!.day === 4 && phase !== 'board' ? 544 : 532;
          const armRaised = atSite && !steps.includes(third ? 'lamp' : 'quiet');
          drawComicGuest(ctx, {
            variant: guestVariant,
            x: guestX,
            y: guestY,
            scale: third && phase !== 'board' ? 0.94 : 1.0,
            alpha: guestAlpha,
            talking: inBoardDialogue,
            armRaised,
            seconds,
            slow,
            darkness,
            threat: gameState!.threat,
            patterns
          });
        }

        if (third) {
          drawComicPaperDoll(ctx, {
            x: 960,
            y: 528,
            posture,
            threat: gameState!.threat,
            seconds,
            slow,
            darkness,
            highlighted: highlightedKey === 'doll',
            dollTwitch: eerie.dollTwitch,
            cursorLookX: slow ? 0 : cursorNorm.x,
            cursorLookY: slow ? 0 : cursorNorm.y,
            patterns
          });
        } else {
          const horseSkewed = night && gameState!.day === 1 && !steps.includes('place_horse');
          drawComicPaperHorse(ctx, {
            x: 1018,
            y: 518,
            skewed: horseSkewed,
            seconds,
            slow,
            darkness,
            highlighted: highlightedKey === 'paper' && gameState!.day === 1 && night,
            horseGlance: eerie.horseGlance,
            cursorLookX: slow ? 0 : cursorNorm.x,
            patterns
          });
        }

        drawHangingLanterns(ctx, envState);
      });

      // Plane 3 (Front): Foreground Counter, Incense Burner + Smoke, Ledger, Phone, Plaque, Paper Stack & Talismans + Eerie Phenomena
      drawPlane('front', () => {
        drawCounterAndProps(ctx, envState);
        eerieCtrl.drawForegroundPhenomena(ctx, eerie, night);
      });
    }

    // Plane 4 (Screen Space): Dust motes, Xuan paper grain, creeping Yin ink wash, tension speed-lines & panel border
    drawComicAtmosphereOverlay(ctx, gameState, night, atSite, seconds, slow);

    updateHotspots();
    updateSpeechBubble(night);
  }

  function loop(time: number) {
    if (!active) return;
    renderFrame(time);
    frame = requestAnimationFrame(loop);
  }

  function startLoop() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    if (active && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const layoutRo = new ResizeObserver(() => {
    measureLayout();
    if (gameState) {
      updateHotspots();
      updateSpeechBubble(isNightPhase(gameState.phase));
    }
  });
  if (deckEl) layoutRo.observe(deckEl);
  if (hudTopEl) layoutRo.observe(hudTopEl);
  if (encounterBoxEl) layoutRo.observe(encounterBoxEl);
  if (bubbleEl) layoutRo.observe(bubbleEl);
  const onVis = () => startLoop();
  const onMotion = () => {
    renderFrame(performance.now());
    startLoop();
  };
  document.addEventListener('visibilitychange', onVis);
  reducedMotion.addEventListener('change', onMotion);

  resize();
  startLoop();

  return {
    highlight(actionId: string, isOn: boolean) {
      linkAction(actionId, isOn);
    },
    sync(state: GameState, moves: ActionOption[], dialogue?: StageDialogueView) {
      const first = !gameState;
      const wasStreet = Boolean(
        gameState && !isNightPhase(gameState.phase) && gameState.phase === 'day' && gameState.dayTab === 'street'
      );
      gameState = state;
      currentDialogue = dialogue;
      currentPreset = pickCameraPreset(state);
      const nowStreet = !isNightPhase(state.phase) && state.phase === 'day' && state.dayTab === 'street';
      if (first || wasStreet !== nowStreet) {
        const goal = CAMERA_PRESETS[currentPreset];
        cam.cx = goal.cx;
        cam.cy = goal.cy;
        cam.zoom = goal.zoom;
      }
      hoveredCanvasKey = null;
      highlightedKey = null;
      highlightedStreetSpot = null;
      host.style.cursor = '';

      if (bubbleEl && dialogue) {
        const sig = `${dialogue.speaker}|${dialogue.identity ?? ''}|${dialogue.step}|${dialogue.line}`;
        if (sig !== lastBubbleSignature) {
          lastBubbleSignature = sig;
          lastBubblePosKey = '';
          bubbleEl.classList.toggle('eerie', Boolean(dialogue.eerie));
          bubbleEl.classList.toggle('can-advance', !dialogue.finished);
          if (sbSpeakerEl) sbSpeakerEl.textContent = dialogue.speaker;
          if (sbRoleEl) sbRoleEl.textContent = dialogue.roleTag;
          if (sbProgressEl) {
            sbProgressEl.textContent = dialogue.finished
              ? `讲述完毕 · ${dialogue.step}/${dialogue.total}`
              : `${dialogue.step}/${dialogue.total}`;
          }
          if (sbProfileEl) {
            const hasProfile = Boolean(dialogue.identity || dialogue.traits?.length);
            sbProfileEl.hidden = !hasProfile;
            if (sbIdentityEl) sbIdentityEl.textContent = dialogue.identity ?? '';
            if (sbTraitsEl) {
              sbTraitsEl.replaceChildren(
                ...(dialogue.traits ?? []).map((t) => {
                  const tag = document.createElement('span');
                  tag.className = 'sb-trait';
                  tag.textContent = t;
                  return tag;
                })
              );
            }
          }
          if (sbCueEl) {
            sbCueEl.textContent = dialogue.cue;
            sbCueEl.hidden = !dialogue.cue;
          }
          if (sbLineEl) renderRichBubbleLine(sbLineEl, dialogue.line);
          if (sbFootEl) sbFootEl.hidden = dialogue.finished;
          bubbleEl.hidden = false;
          bubbleEl.classList.remove('pop');
          void bubbleEl.offsetWidth;
          bubbleEl.classList.add('pop');
        }
      } else if (bubbleEl) {
        lastBubbleSignature = '';
        lastBubblePosKey = '';
        bubbleEl.hidden = true;
      }

      const inStreet = !isNightPhase(state.phase) && state.phase === 'day' && state.dayTab === 'street';
      const clickable = new Map(moves.filter((m) => !m.reason).map((m) => [m.id, m]));
      if (!inStreet && state.phase === 'day' && !state.selectedOrderId) {
        clickable.set('open_street', {
          id: 'open_street',
          title: '推门外出街巷（进货·问忌·折符）',
          detail: '',
          run: () => {}
        });
      }
      for (const target of targets) {
        const modeMatches = inStreet ? target.mode === 'street' : target.mode === 'shop';
        if (!modeMatches) {
          target.action = undefined;
          target.marker.hidden = true;
          target.marker.classList.remove('linked');
          continue;
        }
        const choice = target.choices.find(([id]) => clickable.has(id));
        target.action = choice?.[0];
        target.marker.classList.remove('linked');
        if (choice) {
          target.marker.textContent = choice[1];
          target.marker.setAttribute('aria-label', clickable.get(choice[0])!.title);
        } else {
          target.marker.hidden = true;
        }
      }
      measureLayout();
      if (first || reducedMotion.matches) renderFrame(performance.now());
      else {
        updateHotspots();
        updateSpeechBubble(isNightPhase(state.phase));
      }
    },
    dispose() {
      active = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      layoutRo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      reducedMotion.removeEventListener('change', onMotion);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('click', onClick);
      bubbleEl?.removeEventListener('click', onBubbleClick);
      if (bubbleEl) bubbleEl.hidden = true;
      host.style.cursor = '';
      host.replaceChildren();
      markerLayer.replaceChildren();
      delete scenePanel.dataset.renderer;
    }
  };
}
