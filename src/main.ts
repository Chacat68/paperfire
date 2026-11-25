import './styles/game.css';
import { DAY_META, getScheduledNightOrder } from './data/night';
import type { ActionOption, DayTab, GameState } from './data/types';
import {
  buyShopUpgrade,
  createRun,
  flipToNight,
  getStageView,
  loadRun,
  redeemSystemSupply,
  saveRun,
  settleNight
} from './engine';
import { createComic2DScene } from './scene/comic2dScene';
import { createSfx } from './ui/audio';
import { createDialogsController } from './ui/dialogs';
import { createHudController, type ClockView } from './ui/hud';
import { createPrologueController } from './ui/prologue';
import { renderStage } from './ui/stage';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const DAY_DURATION_SEC = 180; // 白天倒计时 03:00（卯时 06:00 → 酉时 18:00）
const NIGHT_DURATION_SEC = 150; // 夜晚倒计时 02:30（酉时 18:30 → 卯时 06:00）

const sfx = createSfx();
const hud = createHudController();
const prologue = createPrologueController(sfx);
document.body.classList.add('style-comic2d');
const sceneCtrl = createComic2DScene(
  byId('game-world'),
  byId('scene'),
  byId('world-markers'),
  byId('world-hint'),
  (kind) => {
    if (kind === 'door_knock') sfx.knock();
    else if (kind === 'cold_draft') sfx.gust();
    else if (kind === 'window_handprint') sfx.slap();
    else if (kind === 'horse_glance' || kind === 'doll_tilt') sfx.creak();
  }
);

let state: GameState = loadRun();
let currentActions = new Map<string, ActionOption>();
let phaseTotalSec = DAY_DURATION_SEC;
let phaseRemainingSec = DAY_DURATION_SEC;

function shichenOf(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 23 || h === 0) return '子时';
  if (h <= 2) return '丑时';
  if (h <= 4) return '寅时';
  if (h <= 6) return '卯时';
  if (h <= 8) return '辰时';
  if (h <= 10) return '巳时';
  if (h <= 12) return '午时';
  if (h <= 14) return '未时';
  if (h <= 16) return '申时';
  if (h <= 18) return '酉时';
  if (h <= 20) return '戌时';
  return '亥时';
}

function formatMMSS(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatHHMM(totalMinutes: number): { shichen: string; hhmm: string } {
  const mins = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return {
    shichen: shichenOf(h),
    hhmm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  };
}

function resetPhaseClock(phase: GameState['phase']) {
  if (phase === 'day') {
    phaseTotalSec = DAY_DURATION_SEC;
    phaseRemainingSec = DAY_DURATION_SEC;
  } else if (phase === 'board' || phase === 'site') {
    phaseTotalSec = NIGHT_DURATION_SEC;
    phaseRemainingSec = NIGHT_DURATION_SEC;
  } else {
    phaseTotalSec = 1;
    phaseRemainingSec = 0;
  }
}

function buildClockView(paused: boolean): ClockView {
  if (state.phase === 'day') {
    const elapsed = Math.max(0, Math.min(1, 1 - phaseRemainingSec / phaseTotalSec));
    const { shichen, hhmm } = formatHHMM(360 + elapsed * 720); // 06:00 → 18:00
    return {
      periodText: `白天 · ${shichen} ${hhmm}`,
      countdownLabel: '距入夜落锁',
      countdownText: formatMMSS(phaseRemainingSec),
      progressPct: (phaseRemainingSec / phaseTotalSec) * 100,
      urgent: phaseRemainingSec <= 30,
      paused
    };
  }
  if (state.phase === 'board' || state.phase === 'site') {
    const elapsed = Math.max(0, Math.min(1, 1 - phaseRemainingSec / phaseTotalSec));
    const { shichen, hhmm } = formatHHMM(1110 + elapsed * 690); // 18:30 → 06:00
    return {
      periodText: `夜里 · ${shichen} ${hhmm}`,
      countdownLabel: state.phase === 'site' ? '距时辰失控' : '距五更天明',
      countdownText: formatMMSS(phaseRemainingSec),
      progressPct: (phaseRemainingSec / phaseTotalSec) * 100,
      urgent: phaseRemainingSec <= 30,
      paused
    };
  }
  if (state.phase === 'settle') {
    return {
      periodText: '将晓 · 卯时 05:50',
      countdownLabel: '五更已尽 · 待迎天明',
      countdownText: '00:00',
      progressPct: 100,
      urgent: false
    };
  }
  if (state.phase === 'end') {
    return {
      periodText: '天明 · 卯时 06:00',
      countdownLabel: '阴阳合账已定',
      countdownText: '已结',
      progressPct: 100,
      urgent: false
    };
  }
  return {
    periodText: '子夜 · 停摆',
    countdownLabel: '灯火俱灭',
    countdownText: '00:00',
    progressPct: 0,
    urgent: true
  };
}

function isClockPaused(): boolean {
  return prologue.isOpen() || Boolean(dialogs.isAnyOpen()) || document.hidden;
}

function syncClockHud() {
  hud.renderClock(buildClockView(isClockPaused()));
}

const dialogs = createDialogsController(
  (scenarioId, title) => {
    state = createRun(scenarioId);
    resetPhaseClock(state.phase);
    hud.resetDeltas();
    dialogs.markLogSeen(state.log.length);
    sfx.stamp();
    render();
    byId('stage').scrollTop = 0;
    if (!state.introSeen && state.day === 1) {
      prologue.play(() => {
        state.introSeen = true;
        saveRun(state);
        syncClockHud();
        document.getElementById('stage-title')?.focus({ preventScroll: true });
      });
    } else {
      hud.showTransition('卷', '晨光初起 · 启卷开铺', DAY_META[state.day]?.title ?? '纸火', title);
      document.getElementById('stage-title')?.focus({ preventScroll: true });
    }
  },
  (supplyId) => {
    if (redeemSystemSupply(state, supplyId)) {
      sfx.reward();
      render();
    }
  },
  (upgradeId) => {
    if (buyShopUpgrade(state, upgradeId)) {
      sfx.stamp();
      render();
    }
  },
  () => {
    prologue.play(() => {
      state.introSeen = true;
      saveRun(state);
      syncClockHud();
    });
  },
  () => sfx.paper()
);

function selectDayTab(tab: DayTab) {
  state.dayTab = tab;
  state.selectedOrderId = null;
  state.dialogueStep = 0;
  sfx.paper();
  render();
}

function render() {
  const screen = getStageView(state, () => {
    sfx.paper();
    dialogs.openRoutes();
  });
  hud.render(state, screen);
  syncClockHud();
  currentActions = renderStage(
    byId('stage'),
    state,
    screen,
    Boolean(byId('scene').dataset.renderer),
    selectDayTab,
    (actionId, active) => sceneCtrl?.highlight(actionId, active)
  );
  dialogs.renderLedger(state);
  dialogs.renderSystemShop(state);
  sceneCtrl?.sync(state, screen.moves, screen.dialogue);
  saveRun(state);
}

function runMove(move: ActionOption) {
  const prevPhase = state.phase;
  const prevDay = state.day;
  const prevPts = state.pts;
  move.run();
  if (dialogs.isAnyOpen()?.id === 'settings-dialog') return;

  if (prevPhase === 'day' && state.phase === 'board') {
    resetPhaseClock('board');
  } else if (prevDay !== state.day || (prevPhase === 'bad_end' && state.phase === 'day')) {
    resetPhaseClock(state.phase);
  } else if (state.phase === 'settle' || state.phase === 'end' || state.phase === 'bad_end') {
    resetPhaseClock(state.phase);
  }

  if (state.phase === 'bad_end' && prevPhase !== 'bad_end') {
    sfx.badEnd();
    const isTrapKill = move.id.startsWith('accept_night_');
    hud.showTransition(
      isTrapKill ? '煞' : '终',
      isTrapKill ? '子夜凶兆 · 诡异诱杀' : '灯火俱灭 · 规则清算',
      isTrapKill ? '跨出铺门，万劫不复' : '灯火俱灭',
      isTrapKill ? '被门外诡异骗离红灯，可回溯至今日清晨重来' : '生存防线失守，可回溯至今日清晨'
    );
  } else if (prevPhase === 'day' && state.phase === 'board') {
    sfx.lock();
    const nextNight = getScheduledNightOrder(state.day, state.h);
    hud.showTransition(
      nextNight.peak ? '顶' : '夜',
      '日落酉时 · 落锁入夜',
      nextNight.peak ? '顶格诡异与诱杀并至' : '活人散尽，诡影叩门',
      nextNight.peak ? '系统警报：请先听清来意，谨防骗你出门的诱杀诡' : '灯火低一寸，听清经过再决定接不接单'
    );
  } else if (prevPhase === 'board' && state.phase === 'site') {
    sfx.omen();
    const meta = DAY_META[state.day];
    hud.showTransition('局', '夜深履约 · 守住禁忌', meta?.title ?? '履约现场', '守住禁忌，局面归零方可领赏');
  } else if (prevPhase !== 'settle' && state.phase === 'settle') {
    if (state.outcomes[state.day] === 'success' || state.outcomes[state.day] === 'rested') {
      sfx.reward();
    } else {
      sfx.omen();
    }
  } else if (prevDay !== state.day) {
    sfx.dawn();
    render();
    dialogs.openDawnRitual(state, prevDay, state.outcomes[prevDay], () => {
      sfx.paper();
      syncClockHud();
      document.getElementById('stage-title')?.focus({ preventScroll: true });
      byId('stage').scrollTop = 0;
    });
    return;
  } else if (move.id.startsWith('reject_night_') && state.pts > prevPts) {
    sfx.reward();
    sfx.gust();
  } else if (move.id.startsWith('pick_night_')) {
    sfx.knock();
  } else if (move.id === 'advance_night_dialogue') {
    sfx.creak();
  } else if (move.id === 'return_to_shop') {
    sfx.creak();
    sfx.paper();
  } else if (state.pts > prevPts) {
    sfx.reward();
  } else if (
    move.id.startsWith('craft_') ||
    ['seal', 'deliver', 'use-strip', 'seat', 'ward-door', 'rite-orthodox', 'use-ward-doll'].includes(move.id)
  ) {
    sfx.stamp();
  } else {
    sfx.paper();
  }

  render();

  if (prevPhase !== state.phase || prevDay !== state.day) {
    document.getElementById('stage-title')?.focus({ preventScroll: true });
    byId('stage').scrollTop = 0;
  } else {
    const actionsEl = document.getElementById('actions');
    const button = actionsEl?.querySelector<HTMLButtonElement>(`button[data-action="${move.id}"]`);
    if (button && !button.disabled) button.focus({ preventScroll: true });
    else document.getElementById('feedback')?.focus({ preventScroll: true });
  }
}

function tickPhaseClock() {
  const paused = isClockPaused();
  if (paused || (state.phase !== 'day' && state.phase !== 'board' && state.phase !== 'site')) {
    syncClockHud();
    return;
  }

  phaseRemainingSec = Math.max(0, phaseRemainingSec - 1);
  if (phaseRemainingSec > 0) {
    syncClockHud();
    return;
  }

  // 倒计时归零：自动切入下一时段
  if (state.phase === 'day') {
    flipToNight(state);
    resetPhaseClock(state.phase);
    sfx.lock();
    hud.showTransition(
      '酉',
      '日落酉时 · 自动落锁',
      '暮色已尽，夜账开启',
      '白昼时间耗尽，活人散尽，门外诡影开始叩门'
    );
    render();
  } else if (state.phase === 'board') {
    const mainOrder = getScheduledNightOrder(state.day, state.h);
    const promised = mainOrder.promisedKey === 'wu_d2' && state.promiseWu;
    settleNight(state, promised ? 'failed' : 'refused');
    resetPhaseClock(state.phase);
    sfx.omen();
    render();
  } else if (state.phase === 'site') {
    settleNight(state, 'failed');
    resetPhaseClock(state.phase);
    sfx.omen();
    render();
  }
}

byId('open-settings').addEventListener('click', () => {
  sfx.paper();
  dialogs.openSettings();
  syncClockHud();
});

byId('open-ledger').addEventListener('click', () => {
  sfx.paper();
  dialogs.openLedger(state);
  syncClockHud();
});

byId('toggle-audio').addEventListener('click', () => {
  sfx.toggle();
  hud.syncAudioUI(sfx);
});

byId('stage').addEventListener('click', (event) => {
  const streetBtn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-open-street]');
  if (streetBtn) {
    state.dayTab = 'street';
    state.selectedOrderId = null;
    state.dialogueStep = 0;
    sfx.creak();
    sfx.paper();
    render();
    return;
  }
  const sysBtn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-open-system]');
  if (sysBtn) {
    sfx.paper();
    dialogs.openSystemShop(state);
    syncClockHud();
    return;
  }
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
  const move = button ? currentActions.get(button.dataset.action ?? '') : null;
  if (!move || move.reason) return;
  if (move.danger) {
    sfx.warn();
    dialogs.confirmDanger(move.danger, () => runMove(move));
    syncClockHud();
  } else {
    runMove(move);
  }
});

document.addEventListener('keydown', (event) => {
  if (prologue.isOpen()) return;
  if (byId('transition-curtain').classList.contains('show')) hud.hideTransition();
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
  const openDialog = dialogs.isAnyOpen();
  const k = event.key.toLowerCase();

  if (openDialog?.id === 'ledger' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault();
    dialogs.flipLedgerPage(event.key === 'ArrowRight' ? 1 : -1);
    return;
  }

  if (k === 'l') {
    if (openDialog && openDialog.id !== 'ledger') return;
    event.preventDefault();
    if (openDialog) openDialog.close();
    else byId('open-ledger').click();
  } else if (k === 's') {
    if (openDialog && openDialog.id !== 'system-shop') return;
    event.preventDefault();
    if (openDialog) openDialog.close();
    else {
      sfx.paper();
      dialogs.openSystemShop(state);
      syncClockHud();
    }
  } else if (k === 'o') {
    if (openDialog && openDialog.id !== 'settings-dialog') return;
    event.preventDefault();
    if (openDialog) openDialog.close();
    else byId('open-settings').click();
  } else if (k === 'g' && !openDialog && state.phase === 'day' && !state.selectedOrderId) {
    event.preventDefault();
    state.dayTab = state.dayTab === 'street' ? 'orders' : 'street';
    state.dialogueStep = 0;
    sfx.creak();
    sfx.paper();
    render();
  } else if (k === 'm') {
    if (openDialog && openDialog.id !== 'settings-dialog') return;
    event.preventDefault();
    byId('toggle-audio').click();
  } else if (!openDialog && /^[1-9]$/.test(event.key)) {
    document.querySelector<HTMLButtonElement>(`#actions [data-key="${event.key}"]`)?.click();
  }
});

document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dlg) => {
  dlg.addEventListener('close', syncClockHud);
});
document.addEventListener('visibilitychange', syncClockHud);

resetPhaseClock(state.phase);
dialogs.markLogSeen(state.log.length);
hud.syncAudioUI(sfx);
render();
window.setInterval(tickPhaseClock, 1000);
if (!state.introSeen && state.day === 1) {
  prologue.play(() => {
    state.introSeen = true;
    saveRun(state);
    syncClockHud();
  });
}
