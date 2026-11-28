const AUDIO_KEY = 'paperfire-audio-1';
const VOLUME_KEY = 'paperfire-volume-1';

export type AmbientMode = 'off' | 'day' | 'night' | 'site';
export type ViralAudioKind =
  | 'courier'
  | 'surgeon'
  | 'senior'
  | 'zodiac_goat'
  | 'jester'
  | 'puppets';

export interface SfxEngine {
  readonly enabled: boolean;
  readonly volume: number;
  toggle(): boolean;
  setVolume(value: number): number;
  setAmbient(mode: AmbientMode): void;
  paper(): void;
  stamp(): void;
  lock(): void;
  omen(): void;
  dawn(): void;
  warn(): void;
  reward(): void;
  knock(): void;
  gust(): void;
  creak(): void;
  slap(): void;
  badEnd(): void;
  viralCue(kind: ViralAudioKind): void;
}

export function createSfx(): SfxEngine {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let ambientNoiseGain: GainNode | null = null;
  let ambientDroneGain: GainNode | null = null;
  let ambientFilter: BiquadFilterNode | null = null;
  let ambientDroneOsc: OscillatorNode | null = null;
  let ambientBuilt = false;

  let enabled = true;
  let volume = 0.7;
  let desiredAmbient: AmbientMode = 'off';
  let pendingCue: { fn: () => void; at: number } | null = null;
  let unlockBound = false;

  try {
    const saved = localStorage.getItem(AUDIO_KEY) ?? sessionStorage.getItem(AUDIO_KEY);
    enabled = saved !== 'off';
    const rawVol = localStorage.getItem(VOLUME_KEY);
    if (rawVol !== null) {
      const parsed = Number(rawVol);
      if (Number.isFinite(parsed)) {
        volume = Math.max(0, Math.min(1, parsed));
      }
    }
  } catch {
    // ignore storage errors
  }

  function syncMasterGain(ac: AudioContext) {
    if (!masterGain) return;
    const target = enabled ? Math.max(0.0001, volume) : 0.0001;
    masterGain.gain.setTargetAtTime(target, ac.currentTime, 0.05);
  }

  function ensureAmbientNodes(ac: AudioContext) {
    if (ambientBuilt || !masterGain) return;
    ambientBuilt = true;

    // 3-second soft smoothed noise buffer for subtle paper-shop air & cold draft
    const dur = 3;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const ch = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.045 * white) / 1.045;
      // Fade edges slightly for seamless loop
      const edge = Math.min(1, i / 1200, (len - 1 - i) / 1200);
      ch[i] = last * 2.4 * edge;
    }

    const noiseSrc = ac.createBufferSource();
    noiseSrc.buffer = buf;
    noiseSrc.loop = true;

    ambientFilter = ac.createBiquadFilter();
    ambientFilter.type = 'bandpass';
    ambientFilter.frequency.value = 420;
    ambientFilter.Q.value = 0.85;

    ambientNoiseGain = ac.createGain();
    ambientNoiseGain.gain.value = 0.0001;
    noiseSrc.connect(ambientFilter).connect(ambientNoiseGain).connect(masterGain);
    noiseSrc.start();

    ambientDroneOsc = ac.createOscillator();
    ambientDroneOsc.type = 'sine';
    ambientDroneOsc.frequency.value = 110;
    ambientDroneGain = ac.createGain();
    ambientDroneGain.gain.value = 0.0001;
    ambientDroneOsc.connect(ambientDroneGain).connect(masterGain);
    ambientDroneOsc.start();
  }

  function applyAmbient(ac: AudioContext) {
    if (!enabled || desiredAmbient === 'off' || ac.state !== 'running') {
      if (ambientNoiseGain) ambientNoiseGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.18);
      if (ambientDroneGain) ambientDroneGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.18);
      return;
    }

    ensureAmbientNodes(ac);
    if (!ambientFilter || !ambientNoiseGain || !ambientDroneOsc || !ambientDroneGain) return;

    const now = ac.currentTime;
    if (desiredAmbient === 'day') {
      ambientFilter.frequency.setTargetAtTime(520, now, 0.35);
      ambientNoiseGain.gain.setTargetAtTime(0.011, now, 0.35);
      ambientDroneGain.gain.setTargetAtTime(0.0001, now, 0.3);
    } else if (desiredAmbient === 'night') {
      ambientFilter.frequency.setTargetAtTime(260, now, 0.35);
      ambientNoiseGain.gain.setTargetAtTime(0.018, now, 0.35);
      ambientDroneOsc.frequency.setTargetAtTime(110, now, 0.35);
      ambientDroneGain.gain.setTargetAtTime(0.0055, now, 0.4);
    } else {
      // 'site' — tighter cold draft + low fifth resonance
      ambientFilter.frequency.setTargetAtTime(340, now, 0.3);
      ambientNoiseGain.gain.setTargetAtTime(0.023, now, 0.3);
      ambientDroneOsc.frequency.setTargetAtTime(98, now, 0.3);
      ambientDroneGain.gain.setTargetAtTime(0.0085, now, 0.35);
    }
  }

  function bindGestureUnlock() {
    if (unlockBound || typeof window === 'undefined') return;
    unlockBound = true;
    const onGesture = () => {
      if (!enabled) return;
      const ac = ensure();
      if (!ac) return;
      const flush = () => {
        if (ac.state !== 'running') return;
        applyAmbient(ac);
        const queued = pendingCue;
        pendingCue = null;
        if (queued && Date.now() - queued.at < 8000) {
          queued.fn();
        }
        window.removeEventListener('pointerdown', onGesture);
        window.removeEventListener('keydown', onGesture);
        unlockBound = false;
      };
      if (ac.state === 'suspended') {
        ac.resume().then(flush).catch(() => {});
      } else {
        flush();
      }
    };
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('keydown', onGesture, { passive: true });
  }

  function ensure(): AudioContext | null {
    if (!enabled || volume <= 0.001) return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = enabled ? Math.max(0.0001, volume) : 0.0001;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      bindGestureUnlock();
      ctx.resume().then(() => {
        if (ctx) applyAmbient(ctx);
      }).catch(() => {});
    }
    return ctx;
  }

  function runOrQueue(fn: (ac: AudioContext) => void) {
    const ac = ensure();
    if (!ac) return;
    if (ac.state !== 'running') {
      pendingCue = {
        at: Date.now(),
        fn: () => {
          if (ctx && ctx.state === 'running' && enabled && volume > 0.001) fn(ctx);
        }
      };
      bindGestureUnlock();
      return;
    }
    fn(ac);
  }

  function noise(ac: AudioContext, dur: number, freq: number, q: number, gainVal: number, delay = 0) {
    if (!masterGain) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = ac.createGain();
    const t0 = ac.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(masterGain);
    src.start(t0);
  }

  function tone(
    ac: AudioContext,
    type: OscillatorType,
    f1: number,
    f2: number,
    dur: number,
    gainVal: number,
    delay = 0
  ) {
    if (!masterGain) return;
    const osc = ac.createOscillator();
    osc.type = type;
    const t0 = ac.currentTime + delay;
    osc.frequency.setValueAtTime(f1, t0);
    if (f2 !== f1) osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    get enabled() {
      return enabled;
    },
    get volume() {
      return volume;
    },
    toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem(AUDIO_KEY, enabled ? 'on' : 'off');
      } catch {
        // ignore
      }
      if (ctx) {
        syncMasterGain(ctx);
        applyAmbient(ctx);
      }
      if (enabled) {
        const ac = ensure();
        if (ac) applyAmbient(ac);
        this.paper();
      }
      return enabled;
    },
    setVolume(value: number) {
      volume = Math.max(0, Math.min(1, value));
      try {
        localStorage.setItem(VOLUME_KEY, String(volume));
      } catch {
        // ignore
      }
      if (volume > 0 && !enabled) {
        enabled = true;
        try {
          localStorage.setItem(AUDIO_KEY, 'on');
        } catch {
          // ignore
        }
      }
      if (ctx) {
        syncMasterGain(ctx);
        applyAmbient(ctx);
      }
      return volume;
    },
    setAmbient(mode: AmbientMode) {
      desiredAmbient = mode;
      if (!enabled || volume <= 0.001) {
        if (ctx) applyAmbient(ctx);
        return;
      }
      if (ctx && ctx.state === 'running') {
        applyAmbient(ctx);
      } else if (mode !== 'off') {
        bindGestureUnlock();
      }
    },
    paper() {
      runOrQueue((ac) => noise(ac, 0.11, 1550, 1.2, 0.045));
    },
    stamp() {
      runOrQueue((ac) => {
        tone(ac, 'triangle', 155, 62, 0.11, 0.09);
        noise(ac, 0.06, 900, 1.8, 0.04);
      });
    },
    lock() {
      runOrQueue((ac) => {
        tone(ac, 'square', 220, 120, 0.045, 0.035, 0);
        tone(ac, 'triangle', 145, 78, 0.09, 0.08, 0.07);
        tone(ac, 'sine', 196, 174, 0.42, 0.04, 0.1);
      });
    },
    omen() {
      runOrQueue((ac) => {
        tone(ac, 'sine', 164, 152, 0.72, 0.055, 0);
        tone(ac, 'triangle', 329, 311, 0.55, 0.022, 0.06);
      });
    },
    dawn() {
      runOrQueue((ac) => {
        tone(ac, 'sine', 392, 392, 0.36, 0.04, 0);
        tone(ac, 'sine', 523.25, 523.25, 0.52, 0.038, 0.13);
      });
    },
    warn() {
      runOrQueue((ac) => tone(ac, 'triangle', 260, 180, 0.16, 0.055));
    },
    reward() {
      runOrQueue((ac) => {
        tone(ac, 'sine', 587.33, 587.33, 0.14, 0.036, 0);
        tone(ac, 'sine', 880, 880, 0.28, 0.032, 0.09);
      });
    },
    knock() {
      const ac = ensure();
      if (!ac || ac.state !== 'running') return;
      for (const d of [0, 0.24, 0.5]) {
        tone(ac, 'triangle', 122, 68, 0.08, 0.045, d);
        noise(ac, 0.045, 520, 2.2, 0.024, d);
      }
    },
    gust() {
      const ac = ensure();
      if (!ac || ac.state !== 'running') return;
      noise(ac, 0.9, 420, 1.1, 0.025, 0);
      tone(ac, 'sine', 190, 132, 0.85, 0.014, 0.05);
    },
    creak() {
      const ac = ensure();
      if (!ac || ac.state !== 'running') return;
      tone(ac, 'sawtooth', 320, 240, 0.12, 0.01, 0);
      noise(ac, 0.09, 1350, 2.4, 0.018, 0.02);
    },
    slap() {
      const ac = ensure();
      if (!ac || ac.state !== 'running') return;
      noise(ac, 0.09, 780, 1.5, 0.032, 0);
    },
    badEnd() {
      runOrQueue((ac) => {
        tone(ac, 'sine', 130.8, 98, 1.2, 0.065, 0);
        tone(ac, 'triangle', 196, 146.8, 0.95, 0.035, 0.08);
      });
    },
    viralCue(kind: ViralAudioKind) {
      runOrQueue((ac) => {
        if (kind === 'courier') {
          // 4:44 外卖员：略带诡异失真的电子「叮—咚」接单铃 + 盒盖闷响
          tone(ac, 'sine', 987.8, 976, 0.16, 0.042, 0);
          tone(ac, 'sine', 740, 724, 0.34, 0.044, 0.14);
          noise(ac, 0.06, 360, 2.2, 0.028, 0.24);
        } else if (kind === 'surgeon') {
          // 笑面诡医：手术器械清脆金属轻敲 + 药液滴答
          tone(ac, 'triangle', 2240, 2120, 0.18, 0.026, 0);
          tone(ac, 'sine', 3180, 2980, 0.24, 0.018, 0.05);
          tone(ac, 'sine', 820, 520, 0.09, 0.026, 0.22);
        } else if (kind === 'senior') {
          // 血红衣学姐：空灵小提琴拉弦泛音 + 骤然「崩」断弦滑落
          tone(ac, 'sawtooth', 659.25, 666, 0.32, 0.016, 0);
          tone(ac, 'sine', 1318.5, 1300, 0.32, 0.015, 0);
          tone(ac, 'sawtooth', 784, 210, 0.14, 0.032, 0.31);
          noise(ac, 0.05, 1900, 1.8, 0.026, 0.31);
        } else if (kind === 'zodiac_goat') {
          // 生肖「人羊」：黄铜怀表精准清脆三连滴答
          for (const [d, f] of [
            [0, 1680],
            [0.18, 1320],
            [0.36, 1680]
          ] as Array<[number, number]>) {
            tone(ac, 'square', f, f * 0.72, 0.024, 0.022, d);
            noise(ac, 0.022, 2400, 3.0, 0.018, d);
          }
        } else if (kind === 'jester') {
          // 坐忘红中客：三颗白骨骰子急促滚碗碰撞声
          for (const [d, f] of [
            [0, 1180],
            [0.065, 1460],
            [0.12, 1020],
            [0.19, 1580],
            [0.27, 940]
          ] as Array<[number, number]>) {
            tone(ac, 'triangle', f, f * 0.65, 0.035, 0.032, d);
            noise(ac, 0.028, 1750, 2.2, 0.02, d);
          }
        } else {
          // 镜廊双生提线木偶师：木关节「咯哒」拧转 + 绷紧朱砂细丝拨颤
          tone(ac, 'triangle', 460, 290, 0.05, 0.044, 0);
          tone(ac, 'triangle', 540, 310, 0.05, 0.04, 0.09);
          tone(ac, 'sine', 920, 860, 0.34, 0.024, 0.16);
          noise(ac, 0.045, 1200, 2.4, 0.02, 0.08);
        }
      });
    }
  };
}
