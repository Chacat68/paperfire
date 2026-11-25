import type { GameState } from '../../data/types';
import { CINNABAR, INK, drawComicSfx, drawInkWashBlot, inkLine, inkPoly } from './textures';

export type EerieEventKind =
  | 'window_silhouette'
  | 'window_handprint'
  | 'horse_glance'
  | 'doll_tilt'
  | 'cold_draft'
  | 'door_knock'
  | 'ledger_ink_bleed';

interface ActiveEvent {
  kind: EerieEventKind;
  startedAt: number;
  duration: number;
  seed: number;
}

interface JossPaperSlip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  phase: number;
  scale: number;
  alpha: number;
}

export interface EerieSnapshot {
  /** -1..1 wind gust bending lanterns, garlands & incense smoke */
  windGust: number;
  /** 0..1 temporary dimming of warm lantern glow during a cold draft */
  lanternDim: number;
  /** 0..1 intensity of paper horse sideways eye-stare */
  horseGlance: number;
  /** 0..1 uncanny stiff head-tilt & narrow-eye jerk on D3 paper doll */
  dollTwitch: number;
  /** 0..1 ink/cinnabar stain blooming on the counter ledger */
  ledgerBleed: number;
  /** 0..1 door knock ripple phase (null if inactive) */
  doorKnockProgress: number | null;
  /** 0..1 passing shadow silhouette across main lattice window (null if inactive) */
  windowShadowProgress: number | null;
  windowShadowDir: number;
  /** 0..1 translucent ink palm print pressed onto window paper */
  windowHandAlpha: number;
  windowHandX: number;
  windowHandY: number;
}

export interface EerieEventController {
  update(seconds: number, dt: number, state: GameState, night: boolean, slow: boolean): EerieSnapshot;
  drawWindowPhenomena(
    ctx: CanvasRenderingContext2D,
    wx: number,
    wy: number,
    ww: number,
    wh: number,
    snap: EerieSnapshot,
    night: boolean
  ): void;
  drawDoorKnockOverlay(ctx: CanvasRenderingContext2D, doorCx: number, doorCy: number, snap: EerieSnapshot): void;
  drawLedgerBleedOverlay(ctx: CanvasRenderingContext2D, lx: number, ly: number, snap: EerieSnapshot): void;
  drawForegroundPhenomena(ctx: CanvasRenderingContext2D, snap: EerieSnapshot, night: boolean): void;
}

export function createEerieEventController(
  onTrigger?: (kind: EerieEventKind) => void
): EerieEventController {
  let rng = 20261125;
  const rand = () => {
    rng = (Math.imul(1664525, rng) + 1013904223) >>> 0;
    return rng / 4294967296;
  };

  let activeEvent: ActiveEvent | null = null;
  let nextEventAt = 3.2; // First subtle eerie beat happens early so player notices life in the scene!
  let lastKind: EerieEventKind | null = null;
  const jossSlips: JossPaperSlip[] = [];
  let nextSlipAt = 1.6;

  function pickEvent(state: GameState, night: boolean): EerieEventKind {
    const third = night && state.day === 3;
    const pool: EerieEventKind[] = [];

    if (third) {
      pool.push('doll_tilt', 'doll_tilt', 'cold_draft', 'window_handprint', 'door_knock', 'window_silhouette');
    } else if (night) {
      pool.push(
        'window_silhouette',
        'window_handprint',
        'horse_glance',
        'cold_draft',
        'door_knock',
        'ledger_ink_bleed'
      );
      if (state.h >= 8 || state.threat >= 3) {
        pool.push('window_handprint', 'cold_draft', 'door_knock');
      }
    } else {
      // Daytime: restrained, cold-humor / subtle uncanny moments
      pool.push('horse_glance', 'window_silhouette', 'cold_draft', 'ledger_ink_bleed');
      if (state.h >= 7) pool.push('window_handprint', 'door_knock');
    }

    const filtered = pool.filter((k) => k !== lastKind);
    const list = filtered.length ? filtered : pool;
    const chosen = list[Math.floor(rand() * list.length)];
    lastKind = chosen;
    return chosen;
  }

  function eventDuration(kind: EerieEventKind): number {
    switch (kind) {
      case 'window_silhouette':
        return 4.6;
      case 'window_handprint':
        return 4.2;
      case 'horse_glance':
        return 2.9;
      case 'doll_tilt':
        return 2.4;
      case 'cold_draft':
        return 3.4;
      case 'door_knock':
        return 2.8;
      case 'ledger_ink_bleed':
        return 4.0;
    }
  }

  function spawnJossSlip(night: boolean) {
    jossSlips.push({
      x: 260 + rand() * 1080,
      y: 96 + rand() * 34,
      vx: (rand() - 0.5) * 14,
      vy: 26 + rand() * 20,
      rot: rand() * Math.PI * 2,
      rotSpeed: (rand() - 0.5) * 1.4,
      phase: rand() * Math.PI * 2,
      scale: 0.72 + rand() * 0.45,
      alpha: night ? 0.85 : 0.68
    });
  }

  function update(seconds: number, dt: number, state: GameState, night: boolean, slow: boolean): EerieSnapshot {
    const snap: EerieSnapshot = {
      windGust: 0,
      lanternDim: 0,
      horseGlance: 0,
      dollTwitch: 0,
      ledgerBleed: 0,
      doorKnockProgress: null,
      windowShadowProgress: null,
      windowShadowDir: 1,
      windowHandAlpha: 0,
      windowHandX: 0.32,
      windowHandY: 0.54
    };

    if (slow) {
      jossSlips.length = 0;
      return snap;
    }

    // 1. Trigger & advance scheduled micro-events
    if (activeEvent) {
      const progress = (seconds - activeEvent.startedAt) / activeEvent.duration;
      if (progress >= 1) {
        activeEvent = null;
        const baseGap = night ? (state.phase === 'site' ? 4.2 : 6.0) : 9.2;
        const yinSpeedup = Math.min(2.2, state.h * 0.14);
        nextEventAt = seconds + Math.max(3.2, baseGap - yinSpeedup) + rand() * 3.8;
      } else {
        const bell = Math.sin(progress * Math.PI);
        switch (activeEvent.kind) {
          case 'window_silhouette':
            snap.windowShadowProgress = progress;
            snap.windowShadowDir = activeEvent.seed > 0.5 ? 1 : -1;
            break;
          case 'window_handprint':
            snap.windowHandAlpha = Math.pow(bell, 0.75) * (night ? 0.72 : 0.48);
            snap.windowHandX = 0.24 + (activeEvent.seed * 0.46);
            snap.windowHandY = 0.44 + ((activeEvent.seed * 1.7) % 0.24);
            break;
          case 'horse_glance': {
            // Crisp snap-in, hold, snap-back
            const hold = progress < 0.16 ? progress / 0.16 : progress > 0.84 ? (1 - progress) / 0.16 : 1;
            snap.horseGlance = Math.max(0, Math.min(1, hold));
            break;
          }
          case 'doll_tilt': {
            const snapIn = progress < 0.18 ? progress / 0.18 : progress > 0.78 ? (1 - progress) / 0.22 : 1;
            snap.dollTwitch = Math.max(0, Math.min(1, snapIn));
            break;
          }
          case 'cold_draft':
            snap.windGust = Math.sin(progress * Math.PI) * (0.75 + 0.25 * Math.sin(progress * Math.PI * 5));
            snap.lanternDim = Math.sin(progress * Math.PI) * 0.62;
            break;
          case 'door_knock':
            snap.doorKnockProgress = progress;
            break;
          case 'ledger_ink_bleed':
            snap.ledgerBleed = Math.sin(progress * Math.PI);
            break;
        }
      }
    } else if (seconds >= nextEventAt) {
      const kind = pickEvent(state, night);
      activeEvent = {
        kind,
        startedAt: seconds,
        duration: eventDuration(kind),
        seed: rand()
      };
      onTrigger?.(kind);
    }

    // 2. Ambient fluttering joss paper slips (梁间纸钱飘落)
    const maxSlips = night || state.h >= 8 ? 5 : 2;
    if (seconds >= nextSlipAt && jossSlips.length < maxSlips) {
      spawnJossSlip(night);
      nextSlipAt = seconds + (night ? 2.4 + rand() * 3.0 : 5.5 + rand() * 4.5);
    }

    for (let i = jossSlips.length - 1; i >= 0; i--) {
      const s = jossSlips[i];
      s.x += (s.vx + Math.sin(seconds * 1.6 + s.phase) * 24 + snap.windGust * 65) * dt;
      s.y += s.vy * dt;
      s.rot += s.rotSpeed * dt;
      if (s.y > 590) {
        s.alpha -= dt * 1.4;
      }
      if (s.alpha <= 0.02 || s.y > 660) {
        jossSlips.splice(i, 1);
      }
    }

    return snap;
  }

  /** Draws exterior passing shadow & wet ink palm-print inside the clipped lattice window */
  function drawWindowPhenomena(
    ctx: CanvasRenderingContext2D,
    wx: number,
    wy: number,
    ww: number,
    wh: number,
    snap: EerieSnapshot,
    night: boolean
  ) {
    // 1. Passing Republican-era silhouetted figure outside window (窗外缓步擦肩影)
    if (snap.windowShadowProgress !== null) {
      const p = snap.windowShadowProgress;
      // Ease with brief unsettling pause right in the middle of the window!
      const paused =
        p < 0.36
          ? (p / 0.36) * 0.45
          : p < 0.64
            ? 0.45 + ((p - 0.36) / 0.28) * 0.08
            : 0.53 + ((p - 0.64) / 0.36) * 0.47;
      const sx = snap.windowShadowDir > 0 ? wx - 42 + paused * (ww + 84) : wx + ww + 42 - paused * (ww + 84);
      const sy = wy + wh - 12;
      const fade = Math.sin(p * Math.PI);

      ctx.save();
      ctx.globalAlpha = fade * (night ? 0.68 : 0.42);
      ctx.fillStyle = '#0d0e0f';

      // Tall gaunt shadow with Republican-era fedora/scholar hat brim & long coat
      ctx.beginPath();
      ctx.ellipse(sx, sy - 118, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Hat brim
      ctx.beginPath();
      ctx.ellipse(sx, sy - 134, 34, 6, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(sx - 16, sy - 150, 32, 18);
      // Shoulders & long draping silhouette
      ctx.beginPath();
      ctx.moveTo(sx - 14, sy - 96);
      ctx.lineTo(sx + 14, sy - 96);
      ctx.lineTo(sx + 44, sy - 66);
      ctx.lineTo(sx + 38, sy + 18);
      ctx.lineTo(sx - 38, sy + 18);
      ctx.lineTo(sx - 44, sy - 66);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Translucent ink palm-print pressed against the rice paper window (窗纸手印)
    if (snap.windowHandAlpha > 0.02) {
      const hx = wx + ww * snap.windowHandX;
      const hy = wy + wh * snap.windowHandY;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(-0.14);
      ctx.globalAlpha = snap.windowHandAlpha;
      drawInkWashBlot(ctx, 0, 4, 26, 30, 0.5, '12, 12, 13');
      ctx.fillStyle = '#111112';
      // Palm
      ctx.beginPath();
      ctx.ellipse(0, 8, 12, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Five splayed ink fingers
      const fingers: Array<[number, number, number, number]> = [
        [-12, 6, -21, -5],
        [-8, -4, -12, -23],
        [-2, -6, -3, -27],
        [4, -5, 6, -25],
        [10, -2, 14, -18]
      ];
      for (const [fx1, fy1, fx2, fy2] of fingers) {
        inkLine(ctx, fx1, fy1, fx2, fy2, 4.2, '#111112');
      }
      ctx.restore();
    }
  }

  /** Draws three eerie concentric ink knock-ripples on the wooden door */
  function drawDoorKnockOverlay(
    ctx: CanvasRenderingContext2D,
    doorCx: number,
    doorCy: number,
    snap: EerieSnapshot
  ) {
    if (snap.doorKnockProgress === null) return;
    const p = snap.doorKnockProgress;
    // Three distinct knocks staggered across p = 0..1
    const knocks = [0.0, 0.28, 0.56];
    ctx.save();
    for (const start of knocks) {
      const local = (p - start) / 0.42;
      if (local <= 0 || local >= 1) continue;
      const r = 14 + local * 88;
      const alpha = (1 - local) * 0.72;
      ctx.strokeStyle = `rgba(218, 58, 44, ${alpha})`;
      ctx.lineWidth = 2.4 * (1 - local * 0.5);
      ctx.beginPath();
      ctx.arc(doorCx, doorCy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    const sfxAlpha = Math.sin(p * Math.PI) * 0.85;
    drawComicSfx(ctx, '叩、叩…', doorCx + 76, doorCy - 64, 20, sfxAlpha, 'crimson', 0.08);
    ctx.restore();
  }

  /** Draws a creeping sumi/cinnabar ink stain blooming on the open ledger page */
  function drawLedgerBleedOverlay(
    ctx: CanvasRenderingContext2D,
    lx: number,
    ly: number,
    snap: EerieSnapshot
  ) {
    if (snap.ledgerBleed <= 0.03) return;
    const r = 4 + snap.ledgerBleed * 16;
    ctx.save();
    drawInkWashBlot(ctx, lx + 24, ly - 1, r * 1.25, r * 0.72, snap.ledgerBleed * 0.65, '168, 30, 24');
    drawInkWashBlot(ctx, lx + 26, ly, r * 0.6, r * 0.42, snap.ledgerBleed * 0.75, '16, 12, 12');
    ctx.restore();
  }

  /** Draws drifting joss paper slips & cold-draft wind ink streaks */
  function drawForegroundPhenomena(ctx: CanvasRenderingContext2D, snap: EerieSnapshot, night: boolean) {
    // 1. Drifting punched spirit-money paper slips (飘落纸钱)
    for (const s of jossSlips) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.scale(s.scale, s.scale * (0.45 + 0.55 * Math.abs(Math.cos(s.rot * 1.4))));
      ctx.globalAlpha = s.alpha;

      const fill = night ? '#ded6be' : '#e6d7b0';
      inkPoly(ctx, [[-11, -15], [11, -15], [10, 15], [-10, 15]], fill, 1.5, INK);
      // Traditional square copper-coin hole cut out in the center
      ctx.fillStyle = night ? '#121517' : '#6a5d48';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.strokeRect(-3, -3, 6, 6);
      ctx.restore();
    }

    // 2. Cold draft ink wind streaks + brush SFX 「呼——」
    if (snap.windGust > 0.08) {
      ctx.save();
      const a = snap.windGust * 0.45;
      ctx.strokeStyle = night ? `rgba(218, 224, 218, ${a})` : `rgba(28, 24, 20, ${a * 0.7})`;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const wy = 190 + i * 68;
        const wx = 180 + ((i * 230 + snap.windGust * 360) % 1050);
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.quadraticCurveTo(wx + 95, wy - 10, wx + 185, wy + 4);
        ctx.stroke();
      }
      drawComicSfx(ctx, '呼——', 392, 268, 20, snap.windGust * 0.72, night ? 'jade' : 'bone', -0.18);
      ctx.restore();
    }

    // 3. Subtle SFX when window handprint appears
    if (snap.windowHandAlpha > 0.25) {
      drawComicSfx(
        ctx,
        '贴…',
        608 + 344 * snap.windowHandX + 38,
        198 + 232 * snap.windowHandY - 26,
        17,
        snap.windowHandAlpha * 0.9,
        'crimson',
        0.1
      );
    }

    // 4. Subtle cinnabar drip indicator on ledger bleed
    if (snap.ledgerBleed > 0.35) {
      drawComicSfx(ctx, '渗…', 586, 514, 15, snap.ledgerBleed * 0.65, 'crimson', -0.06);
    }
  }

  return {
    update,
    drawWindowPhenomena,
    drawDoorKnockOverlay,
    drawLedgerBleedOverlay,
    drawForegroundPhenomena
  };
}

export { CINNABAR };
