import { SHOP_UPGRADES, SYSTEM_SUPPLIES } from '../data/systemShop';
import type { GameState, ShopUpgradeId } from '../data/types';
import { note } from './state';

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
  return gained;
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
    state.badEndReason = '';
    state.message = `【系统回溯】已退回第 ${state.day} 日清晨。请优先备足生存口粮与净纸，稳住阴气。`;
    snapshotDayStart(state);
    return true;
  } catch {
    return false;
  }
}
