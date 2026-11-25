import { DAY_META } from '../data/night';
import type { GameState, StageView } from '../data/types';
import { isNightPhase } from '../engine';
import type { SfxEngine } from './audio';

const STAT_ICONS: Record<string, string> = {
  ap: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.2l2.2 1.3"/></svg>',
  f: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 3.2 12.2 8 8 12.8 3.8 8 8 3.2Z"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>',
  m: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><rect x="6.2" y="6.2" width="3.6" height="3.6"/></svg>',
  s: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3.5 4.5 8 2.5l4.5 2v7L8 13.5l-4.5-2v-7Z"/><path d="M3.5 7.5 8 9.5l4.5-2"/></svg>',
  c: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2.4c2.4 3 4 5.1 4 7.1a4 4 0 1 1-8 0c0-2 1.6-4.1 4-7.1Z"/></svg>',
  h: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8.4 2.2c.2 2.4-2.2 3.4-2.2 5.7 0 1.4 1 2.4 2.1 2.4 1.2 0 2.1-1 2.1-2.5 1.3 1 2.1 2.3 2.1 3.7a4.5 4.5 0 0 1-9 0c0-2.6 1.9-5.3 4.9-9.3Z"/></svg>',
  pts: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 2.2 13 5v6l-5 2.8L3 11V5l5-2.8Z"/><circle cx="8" cy="8" r="1.7"/></svg>',
  ration: '<svg class="stat-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 8.5h10a5 5 0 0 1-10 0Z"/><path d="M5.5 6.2c0-1.4 1.2-2.2 2.5-3.2 1.3 1 2.5 1.8 2.5 3.2"/></svg>'
};

type StatSnapshot = Record<'ap' | 'f' | 'm' | 's' | 'c' | 'h' | 'pts' | 'ration', number>;

export interface ClockView {
  periodText: string;
  countdownLabel: string;
  countdownText: string;
  progressPct: number;
  urgent: boolean;
  paused?: boolean;
}

export interface HudController {
  render(state: GameState, screen: StageView): void;
  renderClock(clock: ClockView): void;
  resetDeltas(): void;
  syncAudioUI(sfx: SfxEngine): void;
  showTransition(seal: string, kicker: string, title: string, sub: string): void;
  hideTransition(): void;
}

export function createHudController(): HudController {
  const byId = (id: string) => document.getElementById(id)!;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prevStats: StatSnapshot | null = null;
  let curtainTimer = 0;

  function hideTransition() {
    clearTimeout(curtainTimer);
    byId('transition-curtain').classList.remove('show');
  }

  byId('transition-curtain').addEventListener('click', hideTransition);

  function showTransition(seal: string, kicker: string, title: string, sub: string) {
    if (reducedMotion.matches) return;
    byId('curtain-seal').textContent = seal;
    byId('curtain-kicker').textContent = kicker;
    byId('curtain-title').textContent = title;
    byId('curtain-sub').textContent = sub;
    clearTimeout(curtainTimer);
    const curtain = byId('transition-curtain');
    curtain.classList.add('show');
    curtainTimer = window.setTimeout(() => curtain.classList.remove('show'), 1050);
  }

  function spawnDeltas(current: StatSnapshot) {
    if (!prevStats) {
      prevStats = current;
      return;
    }
    const keys: Array<keyof StatSnapshot> = ['ap', 'f', 'm', 's', 'c', 'h', 'pts', 'ration'];
    for (const key of keys) {
      const diff = current[key] - prevStats[key];
      if (!diff) continue;
      const slot = byId('quick-resources').querySelector<HTMLElement>(`[data-stat="${key}"]`);
      if (!slot) continue;
      const good = key === 'h' ? diff < 0 : diff > 0;
      const cls = key === 'ap' && diff < 0 ? 'neutral' : good ? 'good' : 'bad';
      slot.classList.remove('stat-flash-up', 'stat-flash-down');
      void slot.offsetWidth;
      slot.classList.add(cls === 'bad' ? 'stat-flash-down' : 'stat-flash-up');
      window.setTimeout(() => slot.classList.remove('stat-flash-up', 'stat-flash-down'), 520);
      const pop = document.createElement('span');
      pop.className = `delta-pop ${cls}`;
      pop.textContent = diff > 0 ? `+${diff}` : String(diff);
      slot.append(pop);
      window.setTimeout(() => pop.remove(), 1550);
    }
    prevStats = current;
  }

  function renderEncounterHud(state: GameState, screen: StageView) {
    const hud = byId('encounter-hud');
    const inSite = state.phase === 'site';
    hud.hidden = !inSite;
    if (!inSite) return;
    const meter = (label: string, value: number, max: number, cls: string) =>
      `<div class="meter ${cls}"><span class="meter-label">${label}<strong>${value}</strong></span>
        <span class="pips" aria-hidden="true">${Array.from(
          { length: max },
          (_, i) => `<i class="pip${i < value ? ' lit' : ''}"></i>`
        ).join('')}</span></div>`;
    const stepsHtml =
      screen.steps
        ?.map(({ key, label }) => {
          const met = state.steps.includes(key);
          return `<li class="${met ? 'met' : ''}">${met ? '✓' : '○'} ${label}</li>`;
        })
        .join('') ?? '';
    hud.innerHTML = `<div class="encounter-row">${meter('局面', state.threat, 5, 'threat')}${meter('剩余回合', state.turns, 4, 'turns')}</div>
      <div class="encounter-taboo">
        ${screen.notice ? `<span class="taboo-tag"><b>忌</b>${screen.notice}</span>` : ''}
        ${stepsHtml ? `<ol class="encounter-steps" aria-label="履约步骤">${stepsHtml}</ol>` : ''}
      </div>`;
  }

  function syncAudioUI(sfx: SfxEngine) {
    const btn = byId('toggle-audio');
    const on = sfx.enabled;
    btn.setAttribute('aria-pressed', String(on));
    byId('audio-label').textContent = on ? '轻拟音：已开启' : '轻拟音：已静音';
    const pill = document.getElementById('audio-pill');
    if (pill) {
      pill.textContent = on ? '开 · M' : '关 · M';
      pill.classList.toggle('off', !on);
    }
    byId('audio-icon').innerHTML = on
      ? '<path d="M2.5 6h2.8l3.2-2.6v9.2L5.3 10H2.5V6Z"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4"/>'
      : '<path d="M2.5 6h2.8l3.2-2.6v9.2L5.3 10H2.5V6Z"/><path d="M11 6l3.2 4M14.2 6L11 10"/>';
  }

  return {
    resetDeltas() {
      prevStats = null;
    },
    syncAudioUI,
    showTransition,
    hideTransition,
    renderClock(clock: ClockView) {
      byId('period').textContent = clock.periodText;
      byId('countdown-label').textContent = clock.paused
        ? `${clock.countdownLabel} · 暂停`
        : clock.countdownLabel;
      byId('countdown-value').textContent = clock.countdownText;
      byId('countdown-fill').style.width = `${Math.max(0, Math.min(100, clock.progressPct))}%`;
      byId('clock-countdown').classList.toggle('urgent', clock.urgent);
    },
    render(state: GameState, screen: StageView) {
      const nighttime = isNightPhase(state.phase);
      const inSite = state.phase === 'site';
      const meta = DAY_META[state.day] ?? DAY_META[1];

      document.body.classList.toggle('night', nighttime);
      document.body.classList.toggle('in-site', inSite);
      document.body.dataset.yin = state.h >= 12 ? 'high' : state.h >= 8 ? 'warn' : '';
      document.body.dataset.threat = inSite && state.threat >= 3 ? 'high' : '';
      byId('scene').classList.toggle('third', state.day === 3 && nighttime);
      document.querySelector('.lamp:last-child')?.classList.toggle('secured', state.steps.includes('lamp') && inSite);

      byId('almanac-yi').textContent =
        state.phase === 'end' ? '宜 盘账·休业' : nighttime ? meta.yiNight : meta.yiDay;
      byId('scene-name').textContent = meta.title;
      byId('scene-line').textContent =
        state.day === 4 && !nighttime && state.rumor
          ? '门一开，镇群里的话已经传到柜台。'
          : nighttime
            ? meta.nightLine
            : meta.dayLine;

      const tally: Array<[string, string, string | number]> = [
        [nighttime ? 'f' : 'ap', nighttime ? '人情' : '工时', nighttime ? state.f : `${state.ap}/${state.apMax}`],
        ['pts', '纸火点', state.pts],
        ['ration', '口粮', state.ration],
        ['m', '现金', state.m],
        ['s', '纸料', state.s],
        ['c', '洁净', state.c],
        ['h', '阴气', state.h],
        ['ty', '镇民信任', state.ty],
        ['tn', '夜口碑', state.tn]
      ];
      if (state.helper.hired) {
        tally.push(['nerve', '小栓胆量', `${state.helper.nerve}/10`]);
      }

      const renderStat = (index: number, withIcon: boolean) => {
        const [key, name, value] = tally[index];
        const classes = [
          key === 'ap' || key === 'f' || key === 'pts' ? 'primary' : '',
          (key === 'h' && state.h >= 10) || (key === 'ration' && state.ration === 0) ? 'stat-yin-high' : ''
        ]
          .filter(Boolean)
          .join(' ');
        return `<div data-stat="${key}"${classes ? ` class="${classes}"` : ''}>${withIcon ? (STAT_ICONS[key] ?? '') : ''}<span class="stat-text"><dt>${name}</dt><dd>${value}</dd></span></div>`;
      };

      byId('resources').innerHTML = tally.map((_, i) => renderStat(i, false)).join('');
      byId('quick-resources').innerHTML = [0, 1, 2, 3, 4, 6].map((i) => renderStat(i, true)).join('');
      spawnDeltas({
        ap: state.ap,
        f: state.f,
        m: state.m,
        s: state.s,
        c: state.c,
        h: state.h,
        pts: state.pts,
        ration: state.ration
      });

      renderEncounterHud(state, screen);
    }
  };
}
