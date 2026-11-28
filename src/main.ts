import './styles/game.css';
import { DAY_META, getScheduledNightOrder } from './data/night';
import type { ActionOption, GameState } from './data/types';
import {
  buyShopUpgrade,
  clearSavedRun,
  createRun,
  decryptTownIntel,
  flipToNight,
  forecastTomorrowIntel,
  getPhaseDurationSec,
  getStageView,
  learnSystemSkill,
  loadRun,
  redeemSystemSupply,
  saveRun,
  scanTonightTrapIntel,
  settleNight
} from './engine';
import { createComic2DScene } from './scene/comic2dScene';
import { createSfx, type ViralAudioKind } from './ui/audio';
import { createDialogsController } from './ui/dialogs';
import { createHudController, type ClockView } from './ui/hud';
import { createPrologueController } from './ui/prologue';
import { createRosterController } from './ui/roster';
import { renderStage } from './ui/stage';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const sfx = createSfx();
const hud = createHudController();
const prologue = createPrologueController(sfx);
const roster = createRosterController(() => sfx.paper());
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
  },
  () => {
    if (state.phase !== 'day' || state.selectedOrderId) return;
    state.dayTab = 'street';
    state.dialogueStep = 0;
    sfx.creak();
    sfx.paper();
    render();
  }
);

let state: GameState = loadRun();
let currentActions = new Map<string, ActionOption>();

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

function buildClockView(paused: boolean, pauseTag?: string): ClockView {
  const totalSec = Math.max(1, getPhaseDurationSec(state.phase));
  const remSec = Math.max(0, Math.min(totalSec, state.phaseRemainingSec));
  if (state.phase === 'day') {
    const elapsed = Math.max(0, Math.min(1, 1 - remSec / totalSec));
    const { shichen, hhmm } = formatHHMM(360 + elapsed * 720); // 06:00 → 18:00
    return {
      periodText: `白天 · ${shichen} ${hhmm}`,
      countdownLabel: '距入夜落锁',
      countdownText: formatMMSS(remSec),
      progressPct: (remSec / totalSec) * 100,
      urgent: remSec <= 30,
      paused,
      pauseTag
    };
  }
  if (state.phase === 'board' || state.phase === 'site') {
    const elapsed = Math.max(0, Math.min(1, 1 - remSec / totalSec));
    const { shichen, hhmm } = formatHHMM(1110 + elapsed * 690); // 18:30 → 06:00
    return {
      periodText: `夜里 · ${shichen} ${hhmm}`,
      countdownLabel: state.phase === 'site' ? '距时辰失控' : '距五更天明',
      countdownText: formatMMSS(remSec),
      progressPct: (remSec / totalSec) * 100,
      urgent: remSec <= 30,
      paused,
      pauseTag
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

function isModalPaused(): boolean {
  return prologue.isOpen() || Boolean(dialogs.isAnyOpen()) || document.hidden;
}

function isReadingDialogue(): boolean {
  return (
    (state.phase === 'day' && state.dayTab === 'orders' && Boolean(state.selectedOrderId)) ||
    (state.phase === 'board' && Boolean(state.selectedNightOrderId))
  );
}

function isClockPaused(): boolean {
  return isModalPaused() || isReadingDialogue();
}

function syncClockHud() {
  const modalPaused = isModalPaused();
  const reading = !modalPaused && isReadingDialogue();
  sceneCtrl?.setPaused(modalPaused);
  hud.renderClock(buildClockView(modalPaused || reading, reading ? '听客暂停' : '暂停'));
}

const dialogs = createDialogsController(
  (scenarioId, title) => {
    state = createRun(scenarioId);
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
      syncClockHud();
    } else {
      hud.showTransition('卷', '晨光初起 · 启卷开铺', DAY_META[state.day]?.title ?? '纸火', title);
      document.getElementById('stage-title')?.focus({ preventScroll: true });
    }
  },
  (supplyId) => {
    if (redeemSystemSupply(state, supplyId)) {
      sfx.reward();
      render();
      return true;
    }
    return false;
  },
  (upgradeId) => {
    if (buyShopUpgrade(state, upgradeId)) {
      sfx.stamp();
      render();
      return true;
    }
    return false;
  },
  () => {
    prologue.play(() => {
      state.introSeen = true;
      saveRun(state);
      syncClockHud();
    });
    syncClockHud();
  },
  () => {
    clearSavedRun();
    state = createRun('d1_full');
    hud.resetDeltas();
    dialogs.markLogSeen(state.log.length);
    sfx.stamp();
    render();
    byId('stage').scrollTop = 0;
    prologue.play(() => {
      state.introSeen = true;
      saveRun(state);
      syncClockHud();
      document.getElementById('stage-title')?.focus({ preventScroll: true });
    });
    syncClockHud();
  },
  () => sfx.paper(),
  {
    onLearnSkill: (skillId) => {
      if (learnSystemSkill(state, skillId)) {
        sfx.stamp();
        sfx.reward();
        render();
        return true;
      }
      return false;
    },
    onIntelScan: () => {
      if (scanTonightTrapIntel(state)) {
        sfx.reward();
        render();
        return true;
      }
      return false;
    },
    onIntelForecast: () => {
      if (forecastTomorrowIntel(state)) {
        sfx.reward();
        render();
        return true;
      }
      return false;
    },
    onDecryptIntel: (docId) => {
      if (decryptTownIntel(state, docId)) {
        sfx.stamp();
        render();
        return true;
      }
      return false;
    },
    onInspectCharacter: (characterId) => {
      sfx.paper();
      roster.open(state, characterId);
      syncClockHud();
    }
  }
);

function syncAmbientAudio() {
  if (document.hidden || state.phase === 'end' || state.phase === 'bad_end') {
    sfx.setAmbient('off');
    return;
  }
  if (state.phase === 'site') {
    sfx.setAmbient('site');
  } else if (state.phase === 'board' || state.phase === 'settle') {
    sfx.setAmbient('night');
  } else {
    sfx.setAmbient('day');
  }
}

function render() {
  const screen = getStageView(state, () => {
    sfx.paper();
    dialogs.openRoutes();
  });
  hud.render(state, screen);
  syncClockHud();
  syncAmbientAudio();
  currentActions = renderStage(
    byId('stage'),
    state,
    screen,
    Boolean(byId('scene').dataset.renderer),
    (actionId, active) => sceneCtrl?.highlight(actionId, active)
  );
  dialogs.renderLedger(state);
  dialogs.renderSystemShop(state);
  sceneCtrl?.sync(state, screen.moves, screen.dialogue);
  saveRun(state);
}

function resolveViralAudio(moveId: string): ViralAudioKind | null {
  if (moveId === 'pick_night_n_vir_courier' || moveId === 'vir-five-star') return 'courier';
  if (moveId === 'pick_night_n_vir_surgeon' || moveId === 'vir-refuse-pill') return 'surgeon';
  if (moveId === 'pick_night_n_vir_senior' || moveId === 'vir-listen-elegy') return 'senior';
  if (moveId === 'pick_night_n_vir_zodiac_goat' || moveId === 'vir-rule-bet') return 'zodiac_goat';
  if (moveId === 'pick_night_n_vir_jester' || moveId === 'vir-counter-bluff') return 'jester';
  if (moveId === 'pick_night_n_vir_puppets' || moveId === 'vir-cut-echo') return 'puppets';
  return null;
}

function runMove(move: ActionOption) {
  const prevPhase = state.phase;
  const prevDay = state.day;
  const prevPts = state.pts;
  const viralAudio = resolveViralAudio(move.id);
  move.run();
  if (dialogs.isAnyOpen()?.id === 'settings-dialog') return;

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
  } else if (move.id.startsWith('reject_night_')) {
    sfx.omen();
  } else if (move.id.startsWith('pick_night_')) {
    if (viralAudio) sfx.viralCue(viralAudio);
    else sfx.knock();
  } else if (move.id.startsWith('vir-') && viralAudio) {
    sfx.viralCue(viralAudio);
    sfx.stamp();
  } else if (move.id === 'advance_night_dialogue') {
    sfx.creak();
  } else if (move.id === 'return_to_shop') {
    sfx.creak();
    sfx.paper();
  } else if (state.pts > prevPts) {
    sfx.reward();
  } else if (
    move.id.startsWith('craft_') ||
    move.id.startsWith('vir-') ||
    [
      'seal',
      'deliver',
      'use-strip',
      'seat',
      'ward-door',
      'rite-orthodox',
      'use-ward-doll',
      'peak-veil-ward',
      'peak-trim-lamps',
      'peak-avert-chair',
      'skill-ward-flame',
      'skill-ward-decree'
    ].includes(move.id)
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

  state.phaseRemainingSec = Math.max(0, state.phaseRemainingSec - 1);
  if (state.phaseRemainingSec > 0) {
    // 节流存盘：仅每 10 秒同步写入一次 localStorage，降低主线程序列化开销（切后台与卸载时另有兜底保存）
    if (state.phaseRemainingSec % 10 === 0) {
      saveRun(state);
    }
    syncClockHud();
    return;
  }

  // 倒计时归零：自动切入下一时段
  if (state.phase === 'day') {
    flipToNight(state);
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
    sfx.omen();
    render();
  } else if (state.phase === 'site') {
    settleNight(state, 'failed');
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

byId('open-roster').addEventListener('click', () => {
  sfx.paper();
  const screen = getStageView(state, () => {});
  roster.open(state, screen.dialogue?.characterId);
  syncClockHud();
});

byId('toggle-audio').addEventListener('click', () => {
  sfx.toggle();
  hud.syncAudioUI(sfx);
  syncAmbientAudio();
});

const audioVolumeEl = document.getElementById('audio-volume') as HTMLInputElement | null;
audioVolumeEl?.addEventListener('input', () => {
  sfx.setVolume(Number(audioVolumeEl.value) / 100);
  hud.syncAudioUI(sfx);
  syncAmbientAudio();
});
audioVolumeEl?.addEventListener('change', () => {
  if (sfx.enabled && sfx.volume > 0) sfx.paper();
});

byId('stage').addEventListener('click', (event) => {
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
  } else if (k === 'r') {
    if (openDialog && openDialog.id !== 'roster-dialog') return;
    event.preventDefault();
    if (openDialog) openDialog.close();
    else byId('open-roster').click();
  } else if (k === 'g' && !openDialog && state.phase === 'day' && !state.selectedOrderId) {
    event.preventDefault();
    state.dayTab = state.dayTab === 'street' ? 'orders' : 'street';
    state.streetZone = 'front';
    state.dialogueStep = 0;
    sfx.creak();
    sfx.paper();
    render();
  } else if (
    !openDialog &&
    state.phase === 'day' &&
    state.dayTab === 'street' &&
    (event.key === 'ArrowRight' || k === 'd')
  ) {
    if (state.streetZone !== 'back') {
      event.preventDefault();
      state.streetZone = 'back';
      state.message = '你穿过骑楼拱廊，步入烟火深处的后街旧坊。';
      sfx.paper();
      render();
    }
  } else if (
    !openDialog &&
    state.phase === 'day' &&
    state.dayTab === 'street' &&
    (event.key === 'ArrowLeft' || k === 'a')
  ) {
    if (state.streetZone === 'back') {
      event.preventDefault();
      state.streetZone = 'front';
      state.message = '你沿着骑楼廊道走回前街市集。';
      sfx.paper();
      render();
    }
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
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveRun(state);
  syncClockHud();
  syncAmbientAudio();
});
window.addEventListener('pagehide', () => saveRun(state));

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
  syncClockHud();
}
