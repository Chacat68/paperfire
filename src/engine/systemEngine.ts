import { CHARACTER_LIST } from '../data/characters';
import { DAY_META, getScheduledNightOrder, getScheduledTrapOrder } from '../data/night';
import {
  CODEX_MILESTONES,
  SHOP_UPGRADES,
  SYSTEM_INTEL_COSTS,
  SYSTEM_SKILLS,
  SYSTEM_SUPPLIES,
  TOWN_INTEL_DOCS
} from '../data/systemShop';
import type { GameState, ShopUpgradeId, SkillId } from '../data/types';
import { DAY_DURATION_SEC, hasSkill, note } from './state';

/**
 * Evaluates and auto-claims completed daily quests from the initial Paperfire System.
 * Returns total newly awarded `pts`.
 */
export function syncAndClaimDailyQuests(state: GameState): number {
  let gained = 0;
  for (const q of state.dailyQuests) {
    if (q.claimed) continue;
    let met = false;
    if (q.kind === 'day_order') {
      met = state.completedOrders.length >= 1;
    } else if (q.kind === 'night_success') {
      met = state.outcomes[state.day] === 'success';
    } else if (q.kind === 'keep_yin') {
      met = state.phase === 'settle' && state.h < 10;
    }
    if (met) {
      q.done = true;
      q.claimed = true;
      state.pts += q.rewardPts;
      gained += q.rewardPts;
      note(state, `【系统结算】达成「${q.title}」，发放奖励 +${q.rewardPts} 纸火点。`);
    }
  }
  gained += syncCodexMilestones(state);
  return gained;
}

/** Evaluates and auto-claims collection milestones in the System Codex. */
export function syncCodexMilestones(state: GameState): number {
  state.claimedCodexMilestones ??= [];
  const metCount = state.metCharacterIds?.length ?? 0;
  const intelCount = state.unlockedIntelIds?.length ?? 0;
  const trapCount = (state.visitRecords ?? []).filter((v) => v.result === 'trap_exposed').length;
  const skillCount = state.learnedSkills?.length ?? 0;

  let gained = 0;
  for (const ms of CODEX_MILESTONES) {
    if (state.claimedCodexMilestones.includes(ms.id)) continue;
    const current =
      ms.kind === 'met'
        ? metCount
        : ms.kind === 'intel'
          ? intelCount
          : ms.kind === 'skills'
            ? skillCount
            : trapCount;
    if (current >= ms.target) {
      state.claimedCodexMilestones.push(ms.id);
      state.pts += ms.rewardPts;
      gained += ms.rewardPts;
      note(state, `【信息收集里程碑】达成「${ms.title}」，奖励 +${ms.rewardPts} 纸火点！`);
    }
  }
  return gained;
}

/** Learns a Paperfire skill using system points (pts), respecting branch prerequisites. */
export function learnSystemSkill(state: GameState, skillId: SkillId): boolean {
  if (state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end') return false;
  const def = SYSTEM_SKILLS.find((s) => s.id === skillId);
  if (!def) return false;
  state.learnedSkills ??= [];
  if (state.learnedSkills.includes(skillId)) return false;
  if (def.prereq && !state.learnedSkills.includes(def.prereq)) return false;
  if (state.pts < def.costPts) return false;

  state.pts -= def.costPts;
  state.learnedSkills.push(skillId);

  let immediateNote = '';
  if (skillId === 'sight_omen') {
    if (!state.informedDays.includes(state.day)) {
      state.informedDays.push(state.day);
    }
    if (state.day === 5) state.d6Previewed = true;
    const tonight = getScheduledNightOrder(state.day, state.h);
    immediateNote = ` 已即刻洞察今夜禁忌：「${tonight.taboo}」`;
  }

  note(
    state,
    `【技能研习】消耗 ${def.costPts} 纸火点，习得「${def.name}」（${def.effects.join('；')}）。${immediateNote}`
  );
  syncCodexMilestones(state);
  return true;
}

export function getIntelScanCost(state: GameState): number {
  return hasSkill(state, 'sight_echo') ? Math.floor(SYSTEM_INTEL_COSTS.scanTrap / 2) : SYSTEM_INTEL_COSTS.scanTrap;
}

export function getIntelForecastCost(state: GameState): number {
  return hasSkill(state, 'sight_omen')
    ? Math.floor(SYSTEM_INTEL_COSTS.forecastNext / 2)
    : SYSTEM_INTEL_COSTS.forecastNext;
}

/** System Intel Action 1: Scan tonight's lure trap flaw & verify tonight's taboo. */
export function scanTonightTrapIntel(state: GameState): boolean {
  if (state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end') return false;
  state.scannedTrapDays ??= [];
  if (state.scannedTrapDays.includes(state.day)) return false;
  const cost = getIntelScanCost(state);
  if (state.pts < cost) return false;

  state.pts -= cost;
  state.scannedTrapDays.push(state.day);
  if (!state.informedDays.includes(state.day)) {
    state.informedDays.push(state.day);
  }
  if (state.day === 5) state.d6Previewed = true;

  const echoBonus = hasSkill(state, 'sight_echo');
  if (echoBonus) {
    state.c += 1;
  }

  const trap = getScheduledTrapOrder(state.day);
  note(
    state,
    `【系统破绽扫描】消耗 ${cost} 纸火点${echoBonus ? '（听声辨影半价 · 附赠洁净 +1）' : ''}，已核实今夜禁忌并截取诱杀线索：${trap.trapClueHint ?? trap.intelHintVerified}`
  );
  syncCodexMilestones(state);
  return true;
}

/** System Intel Action 2: Forecast tomorrow's scheduled night guest & taboo. */
export function forecastTomorrowIntel(state: GameState): boolean {
  if (state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end') return false;
  if (state.day >= state.maxDay) return false;
  const nextDay = state.day + 1;
  state.forecastDays ??= [];
  if (state.forecastDays.includes(nextDay)) return false;
  const cost = getIntelForecastCost(state);
  if (state.pts < cost) return false;

  state.pts -= cost;
  state.forecastDays.push(nextDay);
  const nextNight = getScheduledNightOrder(nextDay, state.h);
  const nextMeta = DAY_META[nextDay];
  note(
    state,
    `【天机预演】消耗 ${cost} 纸火点${hasSkill(state, 'sight_omen') ? '（望气知忌半价）' : ''}，提前探明第 ${nextDay} 日「${nextMeta?.title ?? ''}」来客：${nextNight.client}（${nextNight.peak ? '3回合顶格高压 · ' : ''}忌：${nextNight.taboo}）。`
  );
  syncCodexMilestones(state);
  return true;
}

/** System Intel Action 3: Decrypt a secret town dossier (also lowers H by 1 and counts toward codex milestones). */
export function decryptTownIntel(state: GameState, docId: string): boolean {
  if (state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end') return false;
  const doc = TOWN_INTEL_DOCS.find((d) => d.id === docId);
  if (!doc) return false;
  state.unlockedIntelIds ??= [];
  if (state.unlockedIntelIds.includes(doc.id)) return false;
  if (state.pts < doc.costPts) return false;

  state.pts -= doc.costPts;
  state.unlockedIntelIds.push(doc.id);
  state.h = Math.max(0, state.h - 1);
  note(
    state,
    `【机密解密】消耗 ${doc.costPts} 纸火点，已解密《${doc.title}》（阴气 −1，已归档至信息收集）。`
  );
  syncCodexMilestones(state);
  return true;
}

export interface SystemDiagnostics {
  tonightOrderTitle: string;
  tonightClient: string;
  tonightPeak: boolean;
  tonightWatched: boolean;
  threatFormulaParts: string[];
  estimatedThreat0: number;
  visitorStats: {
    total: number;
    livingDone: number;
    eerieSuccess: number;
    trapsExposed: number;
    totalCash: number;
    totalPts: number;
  };
  codexProgress: {
    metCount: number;
    metTotal: number;
    intelCount: number;
    intelTotal: number;
    skillsCount: number;
    skillsTotal: number;
    informedCount: number;
    scannedCount: number;
    tokensCount: number;
    upgradesCount: number;
  };
  trueEndingChecks: Array<{ label: string; current: string; met: boolean }>;
}

export function getSystemDiagnostics(state: GameState): SystemDiagnostics {
  const order = getScheduledNightOrder(state.day, state.h);
  const yinBonus = Math.min(2, Math.floor(state.h / 6));
  const proxyBonus = state.usedProxyToday ? 1 : 0;
  const handleBonus =
    (order.id === 'n5_old_account' || order.id === 'n15_final_ledger') && state.handle > 0 ? 1 : 0;
  const bellBonus = state.upgrades.includes('copper_bell') ? 1 : 0;
  const eyeBonus = hasSkill(state, 'sight_eye') ? 1 : 0;
  const maskBonus =
    order.id === 'n15_final_ledger' && state.tokens.some((t) => t.id === 'opera_mask_jade') ? 1 : 0;
  const estimatedThreat0 = Math.max(
    1,
    Math.min(5, order.risk + yinBonus + proxyBonus + handleBonus - bellBonus - eyeBonus - maskBonus)
  );

  const parts: string[] = [`基础 ${order.risk}`];
  if (yinBonus > 0) parts.push(`阴气 +${yinBonus}`);
  if (proxyBonus > 0) parts.push(`替代料 +${proxyBonus}`);
  if (handleBonus > 0) parts.push(`把柄 +${handleBonus}`);
  if (bellBonus > 0) parts.push(`铜铃 −${bellBonus}`);
  if (eyeBonus > 0) parts.push(`法眼 −${eyeBonus}`);
  if (maskBonus > 0) parts.push(`残玉 −${maskBonus}`);

  const records = state.visitRecords ?? [];
  const livingDone = records.filter((r) => r.kind === 'living').length;
  const eerieSuccess = records.filter((r) => r.result === 'night_success').length;
  const trapsExposed = records.filter((r) => r.result === 'trap_exposed').length;
  const totalCash = records.reduce((acc, r) => acc + Math.max(0, r.cashDelta), 0);
  const totalPts = records.reduce((acc, r) => acc + Math.max(0, r.ptsDelta), 0);

  return {
    tonightOrderTitle: order.title,
    tonightClient: order.client,
    tonightPeak: Boolean(order.peak),
    tonightWatched: Boolean(order.watched),
    threatFormulaParts: parts,
    estimatedThreat0,
    visitorStats: {
      total: records.length,
      livingDone,
      eerieSuccess,
      trapsExposed,
      totalCash,
      totalPts
    },
    codexProgress: {
      metCount: state.metCharacterIds?.length ?? 0,
      metTotal: CHARACTER_LIST.length,
      intelCount: state.unlockedIntelIds?.length ?? 0,
      intelTotal: TOWN_INTEL_DOCS.length,
      skillsCount: state.learnedSkills?.length ?? 0,
      skillsTotal: SYSTEM_SKILLS.length,
      informedCount: state.informedDays.length,
      scannedCount: state.scannedTrapDays?.length ?? 0,
      tokensCount: state.tokens.length,
      upgradesCount: state.upgrades.length
    },
    trueEndingChecks: [
      { label: '阴气 < 10', current: `现 ${state.h}`, met: state.h < 10 },
      { label: '把柄 = 0', current: `现 ${state.handle}`, met: state.handle === 0 },
      { label: '镇民信任 ≥ 8', current: `现 ${state.ty}`, met: state.ty >= 8 },
      { label: '夜口碑 ≥ 6', current: `现 ${state.tn}`, met: state.tn >= 6 },
      {
        label: 'D15 终审成功',
        current: state.outcomes[15] === 'success' ? '已成' : `进至 D${state.day}`,
        met: state.outcomes[15] === 'success'
      }
    ]
  };
}

/** Redeems survival supplies or protective talismans using system points (`pts`). */
export function redeemSystemSupply(state: GameState, supplyId: string): boolean {
  const def = SYSTEM_SUPPLIES.find((s) => s.id === supplyId);
  if (!def || state.pts < def.costPts) return false;

  state.pts -= def.costPts;
  switch (def.id) {
    case 'sys_ration_1':
      state.ration += 1;
      note(state, `【系统兑换】消耗 ${def.costPts} 纸火点，领取生存口粮与净水 ×1（现有 ${state.ration} 份）。`);
      break;
    case 'sys_ration_3':
      state.ration += 3;
      note(state, `【系统兑换】消耗 ${def.costPts} 纸火点，领取三日应急口粮包 ×3（现有 ${state.ration} 份）。`);
      break;
    case 'sys_clean_paper':
      state.s += 4;
      state.c += 2;
      note(state, `【系统兑换】消耗 ${def.costPts} 纸火点，补入系统特供净纸（纸料 +4，洁净 +2）。`);
      break;
    case 'sys_calm_pill':
      state.h = Math.max(0, state.h - 3);
      if (state.helper.hired) {
        state.helper.nerve = Math.min(10, state.helper.nerve + 2);
      }
      note(
        state,
        `【系统兑换】服下醒神清心丸（阴气 −3${state.helper.hired ? '，伙计胆量 +2' : ''}）。`
      );
      break;
    case 'sys_talisman':
      state.items.talisman += 1;
      note(state, `【系统兑换】消耗 ${def.costPts} 纸火点，兑换朱砂安神纸符 ×1。`);
      break;
    case 'sys_ward_doll':
      state.items.wardDoll += 1;
      note(state, `【系统兑换】消耗 ${def.costPts} 纸火点，兑换护身替纸人 ×1（高危夜可压局 −3 或替劫保底）。`);
      break;
    default:
      return false;
  }
  return true;
}

/** Purchases a permanent paper-craft shop upgrade (rendered directly on the 2D canvas!). */
export function buyShopUpgrade(state: GameState, upgradeId: ShopUpgradeId): boolean {
  const def = SHOP_UPGRADES.find((u) => u.id === upgradeId);
  if (!def) return false;
  if (state.upgrades.includes(upgradeId)) return false;
  if (state.pts < def.costPts || state.m < def.costM) return false;

  state.pts -= def.costPts;
  state.m -= def.costM;
  state.upgrades.push(upgradeId);

  if (upgradeId === 'tall_cabinet') {
    state.apMax += 1;
    state.ap += 1;
  }

  note(state, `【铺面升级】已装配「${def.title}」，永久生效并在铺面显现。`);
  return true;
}

/** Captures a clean JSON snapshot of the current day-start state for bad-end rollback. */
export function snapshotDayStart(state: GameState): void {
  const clone: GameState = { ...state, lastDaySnapshot: null };
  state.lastDaySnapshot = JSON.stringify(clone);
}

/** Restores state back to the beginning of the previous legal day after a bad ending. */
export function rollbackToLastDay(state: GameState): boolean {
  if (!state.lastDaySnapshot) return false;
  try {
    const restored = JSON.parse(state.lastDaySnapshot) as GameState;
    Object.assign(state, restored);
    state.phase = 'day';
    state.phaseRemainingSec = DAY_DURATION_SEC;
    state.badEndReason = '';
    state.message = `【系统回溯】已退回第 ${state.day} 日清晨。请优先备足生存口粮与净纸，稳住阴气。`;
    snapshotDayStart(state);
    return true;
  } catch {
    return false;
  }
}
