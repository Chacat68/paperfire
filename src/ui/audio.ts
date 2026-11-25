const AUDIO_KEY = 'paperfire-audio-1';

export interface SfxEngine {
  readonly enabled: boolean;
  toggle(): boolean;
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
}

export function createSfx(): SfxEngine {
  let ctx: AudioContext | null = null;
  let enabled = true;
  try {
    enabled = sessionStorage.getItem(AUDIO_KEY) !== 'off';
  } catch {
    // ignore
  }

  function ensure(): AudioContext | null {
    if (!enabled) return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function noise(ac: AudioContext, dur: number, freq: number, q: number, gainVal: number, delay = 0) {
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
    src.connect(filter).connect(g).connect(ac.destination);
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
    const osc = ac.createOscillator();
    osc.type = type;
    const t0 = ac.currentTime + delay;
    osc.frequency.setValueAtTime(f1, t0);
    if (f2 !== f1) osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      try {
        sessionStorage.setItem(AUDIO_KEY, enabled ? 'on' : 'off');
      } catch {
        // ignore
      }
      if (enabled) this.paper();
      return enabled;
    },
    paper() {
      const ac = ensure();
      if (ac) noise(ac, 0.11, 1550, 1.2, 0.045);
    },
    stamp() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'triangle', 155, 62, 0.11, 0.09);
      noise(ac, 0.06, 900, 1.8, 0.04);
    },
    lock() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'square', 220, 120, 0.045, 0.035, 0);
      tone(ac, 'triangle', 145, 78, 0.09, 0.08, 0.07);
      tone(ac, 'sine', 196, 174, 0.42, 0.04, 0.1);
    },
    omen() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'sine', 164, 152, 0.72, 0.055, 0);
      tone(ac, 'triangle', 329, 311, 0.55, 0.022, 0.06);
    },
    dawn() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'sine', 392, 392, 0.36, 0.04, 0);
      tone(ac, 'sine', 523.25, 523.25, 0.52, 0.038, 0.13);
    },
    warn() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'triangle', 260, 180, 0.16, 0.055);
    },
    reward() {
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'sine', 587.33, 587.33, 0.14, 0.036, 0);
      tone(ac, 'sine', 880, 880, 0.28, 0.032, 0.09);
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
      const ac = ensure();
      if (!ac) return;
      tone(ac, 'sine', 130.8, 98, 1.2, 0.065, 0);
      tone(ac, 'triangle', 196, 146.8, 0.95, 0.035, 0.08);
    }
  };
}
