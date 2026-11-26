import { afterEach, describe, expect, it } from 'vitest';
import { CHARACTER_LIST, getCharacterForDayOrder, getCharacterForNightOrder } from '../data/characters';
import { ALL_NIGHT_ORDERS, DAY_META, NIGHT_ORDERS, getScheduledNightOrder, getScheduledTrapOrder } from '../data/night';
import { DAY_ORDERS, ORDER_BY_ID } from '../data/orders';
import {
  DAY_DURATION_SEC,
  NIGHT_DURATION_SEC,
  buyShopUpgrade,
  clearSavedRun,
  computeInitialThreat,
  createRun,
  dawn,
  decryptTownIntel,
  flipToNight,
  forecastTomorrowIntel,
  fulfillDayOrder,
  getStageView,
  getSystemDiagnostics,
  learnSystemSkill,
  loadRun,
  redeemSystemSupply,
  rollbackToLastDay,
  saveRun,
  scanTonightTrapIntel,
  settleNight,
  startSite
} from './index';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from './state';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
}

describe('Paperfire D1–D15 Engine (P0/P1/P2 Full Suite)', () => {
  it('initializes D1 full run with daytime living order pool and initial system state', () => {
    const state = createRun('d1_full');
    expect(state.day).toBe(1);
    expect(state.maxDay).toBe(15);
    expect(state.phase).toBe('day');
    expect(state.pts).toBe(24);
    expect(state.ration).toBe(2);
    expect(state.introSeen).toBe(false);
    expect(state.dailyQuests.length).toBe(3);
    expect(state.todayOrders.length).toBeGreaterThanOrEqual(2);
    expect(state.todayOrders).toContain('d1_chen_white');
  });

  it('supports crafting modes (standard, rush, fine, proxy) and auto-claims daytime system quest pts', () => {
    const state = createRun('d1_full');
    const order = ORDER_BY_ID.d1_chen_white;
    const initM = state.m;
    const initS = state.s;
    const initC = state.c;
    const initTy = state.ty;
    const initPts = state.pts;

    fulfillDayOrder(state, order, 'fine');
    expect(state.m).toBe(initM + order.payBase + 4);
    expect(state.s).toBe(initS - (order.needS + 1));
    expect(state.c).toBe(initC + 1);
    expect(state.ty).toBe(initTy + order.tyReward + 1);
    expect(state.completedOrders).toContain(order.id);
    // Order ptsReward (6) + fine bonus (2) + daytime quest reward (10) = +18 pts
    expect(state.pts).toBe(initPts + 18);
    expect(state.dailyQuests.find((q) => q.kind === 'day_order')?.claimed).toBe(true);
  });

  it('redeems survival supplies and ward doll via system points', () => {
    const state = createRun('d1_full');
    state.pts = 60;
    expect(redeemSystemSupply(state, 'sys_ration_1')).toBe(true);
    expect(state.ration).toBe(3);
    expect(state.pts).toBe(48);

    expect(redeemSystemSupply(state, 'sys_ward_doll')).toBe(true);
    expect(state.items.wardDoll).toBe(1);
    expect(state.pts).toBe(20);

    expect(redeemSystemSupply(state, 'sys_ration_3')).toBe(false); // costs 32 > 20
  });

  it('purchases permanent shop upgrades and applies passive effects', () => {
    const state = createRun('d1_full');
    state.pts = 150;
    state.m = 200;

    expect(buyShopUpgrade(state, 'tall_cabinet')).toBe(true);
    expect(state.apMax).toBe(7);
    expect(state.ap).toBe(7);

    expect(buyShopUpgrade(state, 'copper_bell')).toBe(true);
    expect(buyShopUpgrade(state, 'jade_censer')).toBe(true);
    expect(buyShopUpgrade(state, 'iron_bolt')).toBe(true);
    expect(buyShopUpgrade(state, 'copper_bell')).toBe(false); // already owned

    // Copper bell reduces initial night threat by 1
    state.h = 6; // risk 2 + floor(6/6)=1 - bell(1) = 2
    expect(computeInitialThreat(state, NIGHT_ORDERS.n3_third_lamp)).toBe(2);

    // Jade censer automatically reduces H and raises C on dawn
    const prevH = state.h;
    const prevC = state.c;
    flipToNight(state);
    settleNight(state, 'success');
    const afterSettleH = state.h;
    dawn(state);
    expect(state.h).toBe(Math.max(0, afterSettleH - 1));
    expect(state.c).toBe(prevC + 1);
    expect(prevH).toBe(6);
  });

  it('consumes daily ration on dawn, penalizes starvation, triggers bad_end after 2 starved nights, and supports rollback', () => {
    const state = createRun('d1_full');
    state.ration = 0;

    // Night 1 starved -> starveStreak = 1, ap drops to apMax - 1, H +2
    flipToNight(state);
    settleNight(state, 'refused');
    const hBeforeDawn = state.h;
    dawn(state);
    expect(state.phase).toBe('day');
    expect(state.day).toBe(2);
    expect(state.starveStreak).toBe(1);
    expect(state.ap).toBe(state.apMax - 1);
    expect(state.h).toBe(hBeforeDawn + 2);

    // Night 2 starved again -> starveStreak = 2 -> bad_end!
    flipToNight(state);
    settleNight(state, 'refused');
    dawn(state);
    expect(state.phase).toBe('bad_end');
    expect(state.badEndReason).toContain('生存口粮');

    // Rollback restores Day 2 morning snapshot cleanly
    expect(rollbackToLastDay(state)).toBe(true);
    expect(state.phase).toBe('day');
    expect(state.day).toBe(2);
    expect(state.badEndReason).toBe('');
  });

  it('calculates Threat0 using design formula including proxy penalty and H scaling', () => {
    const state = createRun('d3_tight');
    state.usedProxyToday = true;
    // risk=2, H=12 -> floor(12/6)=2, proxy=+1 -> 5
    expect(computeInitialThreat(state, NIGHT_ORDERS.n3_third_lamp)).toBe(5);
  });

  it('completes D3 third lamp via prepared narrow strip route', () => {
    const state = createRun('d3_compare');
    state.dayTab = 'street';
    const streetMoves = getStageView(state, () => {}).moves;
    streetMoves.find((m) => m.id === 'inquire_liu')!.run();
    expect(state.informedDays).toContain(3);

    const streetMoves2 = getStageView(state, () => {}).moves;
    streetMoves2.find((m) => m.id === 'prepare_strip')!.run();
    expect(state.items.strip).toBe(1);

    flipToNight(state);
    startSite(state);
    expect(state.threat).toBe(3);

    getStageView(state, () => {}).moves.find((m) => m.id === 'use-strip')!.run();
    expect(state.threat).toBe(1);
    expect(state.steps).toContain('lamp');
    expect(state.steps).toContain('seated');

    getStageView(state, () => {}).moves.find((m) => m.id === 'use-paper')!.run();
    expect(state.threat).toBe(0);

    getStageView(state, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(state.phase).toBe('settle');
    expect(state.outcomes[3]).toBe('success');
    expect(state.favorCards).toContain('card_liu');
  });

  it('supports D4 empty-warehouse QA-07 recovery and resting scheduled from D3 settle avoids watched order', () => {
    const state = createRun('d4_empty');
    expect(state.m).toBe(0);
    expect(state.s).toBe(0);
    expect(state.todayOrders).toContain('d4_relief_self');

    fulfillDayOrder(state, ORDER_BY_ID.d4_relief_self, 'standard');
    expect(state.m).toBe(12);
    expect(state.s).toBe(0);
    // Use calm pill to drop H below 12 and avoid watched_door
    expect(redeemSystemSupply(state, 'sys_calm_pill')).toBe(true);
    expect(state.h).toBe(10);

    // Also verify scheduling rest during D3 settle carries into D4 and rests cleanly
    const d3State = createRun('d3_tight');
    flipToNight(d3State);
    settleNight(d3State, 'success'); // h drops to 11 (>= 10 -> settle_plan_rest available)
    getStageView(d3State, () => {}).moves.find((m) => m.id === 'settle_plan_rest')!.run();
    expect(d3State.restNextNight).toBe(true);
    expect(d3State.h).toBe(9);
    dawn(d3State);
    expect(d3State.day).toBe(4);
    expect(d3State.restTonight).toBe(true);

    flipToNight(d3State);
    expect(d3State.phase).toBe('settle');
    expect(d3State.outcomes[4]).toBe('rested');
  });

  it('waives audit automatically on dawn if player holds Wu stamp token', () => {
    const state = createRun('d2_story');
    state.tokens.push({ id: 'wu_stamp', name: '支书盖章卡', desc: '免抽查' });
    state.audit = true;
    dawn(state);
    expect(state.day).toBe(3);
    expect(state.audit).toBe(false);
    expect(state.tokens.some((t) => t.id === 'wu_stamp')).toBe(false);
  });

  it('reaches end summary cleanly after D5 short-run night settlement', () => {
    const state = createRun('d5_pressure');
    flipToNight(state);
    settleNight(state, 'success');
    dawn(state);
    expect(state.phase).toBe('end');
  });

  it('supports hiring helper in settle, nerve refusal <= 2, calming helper, and named favor cards', () => {
    const state = createRun('d1_full');
    flipToNight(state);
    settleNight(state, 'success');
    getStageView(state, () => {}).moves.find((m) => m.id === 'settle_hire_helper')!.run();
    expect(state.helper.hired).toBe(true);
    expect(state.helper.nerve).toBe(6);

    dawn(state);
    // Lower nerve to 2 -> refused in night site
    state.helper.nerve = 2;
    flipToNight(state);
    startSite(state);
    const helperMove = getStageView(state, () => {}).moves.find((m) => m.id === 'helper-assist');
    expect(helperMove?.reason).toContain('拒上夜班');

    // Restore nerve & verify assist lowers threat
    state.helper.nerve = 5;
    state.threat = 2;
    getStageView(state, () => {}).moves.find((m) => m.id === 'helper-assist')!.run();
    expect(state.threat).toBe(1);
    expect(state.helper.nerve).toBe(4);

    // Calm helper during settle
    settleNight(state, 'success');
    getStageView(state, () => {}).moves.find((m) => m.id === 'settle_calm_helper')!.run();
    expect(state.helper.nerve).toBe(6);
  });

  it('completes D6 3-turn peak night (Paper Bride) using wardDoll/favor card and awards crimson_knot token', () => {
    const state = createRun('d6_peak');
    flipToNight(state);
    startSite(state);
    expect(state.turns).toBe(3);
    expect(state.threat).toBe(4); // risk 3 + floor(6/6)=1

    // Turn 1: use Liu favor card (-3 -> 1)
    getStageView(state, () => {}).moves.find((m) => m.id === 'use-card-liu')!.run();
    expect(state.threat).toBe(1);

    // Turn 2: orthodox rite (-3 -> 0, records rite_main)
    getStageView(state, () => {}).moves.find((m) => m.id === 'rite-orthodox')!.run();
    expect(state.threat).toBe(0);
    expect(state.steps).toContain('rite_main');

    // Turn 3: seal -> success + crimson_knot token!
    getStageView(state, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(state.phase).toBe('settle');
    expect(state.outcomes[6]).toBe('success');
    expect(state.tokens.some((t) => t.id === 'crimson_knot')).toBe(true);
  });

  it('auto-consumes wardDoll to absorb failure penalty on night fail', () => {
    const state = createRun('d6_peak');
    state.items.wardDoll = 1;
    const initTy = state.ty;
    flipToNight(state);
    settleNight(state, 'failed');
    expect(state.items.wardDoll).toBe(0);
    expect(state.ty).toBe(initTy); // reputation protected!
    expect(state.uneasy).toBe(false); // uneasy mark avoided!
    expect(state.lastSettleSummary).toContain('护身替纸人');
  });

  it('reaches D15 true ending cleanly after final grand ledger settlement', () => {
    const state = createRun('d15_final');
    flipToNight(state);
    startSite(state);
    // Copper bell (-1) + opera_mask_jade (-1) reduce threat from 3 -> 1
    expect(state.threat).toBe(1);

    getStageView(state, () => {}).moves.find((m) => m.id === 'audit-ledger')!.run();
    expect(state.threat).toBe(0);
    getStageView(state, () => {}).moves.find((m) => m.id === 'calm-flame')!.run();
    getStageView(state, () => {}).moves.find((m) => m.id === 'deliver')!.run();
    expect(state.phase).toBe('settle');
    expect(state.outcomes[15]).toBe('success');

    dawn(state);
    expect(state.phase).toBe('end');
    const endView = getStageView(state, () => {});
    expect(endView.title).toContain('真结局');
  });

  it('requires listening to daytime guest dialogue beats before accepting or declining an order', () => {
    const state = createRun('d1_full');
    const listMoves = getStageView(state, () => {}).moves;
    listMoves.find((m) => m.id === 'pick_d1_chen_white')!.run();
    expect(state.selectedOrderId).toBe('d1_chen_white');
    expect(state.dialogueStep).toBe(0);

    // While guest is still telling story (beat 1/3), crafting buttons are locked behind advance_dialogue
    const step1 = getStageView(state, () => {});
    expect(step1.dialogue?.speaker).toBe('陈婶');
    expect(step1.dialogue?.finished).toBe(false);
    expect(step1.moves.some((m) => m.id === 'advance_dialogue')).toBe(true);
    expect(step1.moves.some((m) => m.id.startsWith('craft_std_'))).toBe(false);

    // Advance beat 2 -> beat 3 (finished)
    step1.moves.find((m) => m.id === 'advance_dialogue')!.run();
    const step2 = getStageView(state, () => {});
    expect(step2.dialogue?.step).toBe(2);
    expect(step2.dialogue?.finished).toBe(false);
    step2.moves.find((m) => m.id === 'advance_dialogue')!.run();

    // Now finished: accept/craft options and decline button are unlocked!
    const step3 = getStageView(state, () => {});
    expect(step3.dialogue?.finished).toBe(true);
    expect(step3.moves.some((m) => m.id === 'craft_std_d1_chen_white')).toBe(true);
    expect(step3.moves.some((m) => m.id === 'back_to_orders')).toBe(true);
  });

  it('presents both real eerie order and lethal lure trap at night; exposing trap rewards pts and lowers yin', () => {
    const state = createRun('d1_full');
    flipToNight(state);
    expect(state.phase).toBe('board');
    expect(state.todayNightOrders.length).toBe(2);
    expect(state.todayNightOrders).toContain('n1_alley_sendoff');
    expect(state.todayNightOrders).toContain('trap_d1_niece');

    // Pick the trap guest and listen through all 3 beats
    const boardView = getStageView(state, () => {});
    boardView.moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    expect(state.selectedNightOrderId).toBe('trap_d1_niece');

    let v = getStageView(state, () => {});
    expect(v.dialogue?.finished).toBe(false);
    v.moves.find((m) => m.id === 'advance_night_dialogue')!.run();
    v = getStageView(state, () => {});
    v.moves.find((m) => m.id === 'advance_night_dialogue')!.run();
    v = getStageView(state, () => {});
    expect(v.dialogue?.finished).toBe(true);

    // Expose / reject the trap -> +6 pts, H -1, trap marked rejected, returns to board
    const prevPts = state.pts;
    const prevH = state.h;
    v.moves.find((m) => m.id === 'reject_night_trap_d1_niece')!.run();
    expect(state.phase).toBe('board');
    expect(state.selectedNightOrderId).toBe(null);
    expect(state.rejectedNightOrderIds).toContain('trap_d1_niece');
    expect(state.pts).toBe(prevPts + 6);
    expect(state.h).toBe(Math.max(0, prevH - 1));
  });

  it('triggers lethal bad_end if lured outside by a night trap without wardDoll, or consumes wardDoll to survive', () => {
    // Case 1: No wardDoll -> killed outside -> bad_end
    const state1 = createRun('d1_full');
    flipToNight(state1);
    getStageView(state1, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    state1.dialogueStep = 2;
    getStageView(state1, () => {}).moves.find((m) => m.id === 'accept_night_trap_d1_niece')!.run();
    expect(state1.phase).toBe('bad_end');
    expect(state1.badEndReason).toContain('诱杀毙命');

    // Case 2: Holding wardDoll -> burns to pull player back inside -> settle
    const state2 = createRun('d1_full');
    state2.items.wardDoll = 1;
    flipToNight(state2);
    getStageView(state2, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    state2.dialogueStep = 2;
    getStageView(state2, () => {}).moves.find((m) => m.id === 'accept_night_trap_d1_niece')!.run();
    expect(state2.phase).toBe('settle');
    expect(state2.items.wardDoll).toBe(0);
    expect(state2.lastSettleSummary).toContain('替纸人救主');
  });

  it('requires an end-of-day shop chore decision during settle before unlocking dawn to next day', () => {
    const state = createRun('d1_full');
    flipToNight(state);
    settleNight(state, 'success');
    expect(state.phase).toBe('settle');
    expect(state.settleChoreDone).toBe(false);

    // Before picking a shop chore, dawn button is locked
    const beforeView = getStageView(state, () => {});
    const dawnBefore = beforeView.moves.find((m) => m.id === 'dawn');
    expect(dawnBefore?.reason).toContain('铺务');

    // Pick '扫灰焚香净铺' -> applies clean/yin effect and unlocks dawn!
    const prevS = state.s;
    const prevC = state.c;
    beforeView.moves.find((m) => m.id === 'settle_clean_shop')!.run();
    expect(state.settleChoreDone).toBe(true);
    expect(state.s).toBe(prevS - 1);
    expect(state.c).toBe(prevC + 2);

    const afterView = getStageView(state, () => {});
    const dawnAfter = afterView.moves.find((m) => m.id === 'dawn');
    expect(dawnAfter?.reason).toBe('');
    dawnAfter!.run();
    expect(state.phase).toBe('day');
    expect(state.day).toBe(2);
    expect(state.settleChoreDone).toBe(false);
    expect(state.phaseRemainingSec).toBe(DAY_DURATION_SEC);
  });

  it('keeps player on night board when mistakenly rejecting real order before exposing trap, and warns after trap is exposed', () => {
    // Case 1: Mistakenly reject real order FIRST -> stays in board so player can still inspect & expose trap
    const state1 = createRun('d1_full');
    flipToNight(state1);
    expect(state1.phaseRemainingSec).toBe(NIGHT_DURATION_SEC);

    getStageView(state1, () => {}).moves.find((m) => m.id === 'pick_night_n1_alley_sendoff')!.run();
    state1.dialogueStep = 2;
    const realViewBeforeTrap = getStageView(state1, () => {});
    const rejectRealBeforeTrap = realViewBeforeTrap.moves.find(
      (m) => m.id === 'reject_night_n1_alley_sendoff'
    )!;
    // Must not spoil trap identity before trap is exposed
    expect(rejectRealBeforeTrap.danger).toBeUndefined();
    rejectRealBeforeTrap.run();

    expect(state1.phase).toBe('board');
    expect(state1.rejectedNightOrderIds).toContain('n1_alley_sendoff');
    const boardAfterRealReject = getStageView(state1, () => {});
    const realCard = boardAfterRealReject.moves.find((m) => m.id === 'pick_night_n1_alley_sendoff');
    expect(realCard?.card?.statusStamp).toBe('已婉拒');

    // Player can still listen to & expose the remaining trap
    boardAfterRealReject.moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    state1.dialogueStep = 2;
    const prevPts = state1.pts;
    getStageView(state1, () => {}).moves.find((m) => m.id === 'reject_night_trap_d1_niece')!.run();
    expect(state1.phase).toBe('board');
    expect(state1.pts).toBe(prevPts + 6);

    // Once both guests are handled, skip button becomes primary and settles cleanly
    const boardAllHandled = getStageView(state1, () => {});
    const skipMove = boardAllHandled.moves.find((m) => m.id === 'skip')!;
    expect(skipMove.primary).toBe(true);
    skipMove.run();
    expect(state1.phase).toBe('settle');
    expect(state1.outcomes[1]).toBe('refused');

    // Case 2: Expose trap FIRST, then reject real order -> warns with danger and settles directly
    const state2 = createRun('d1_full');
    flipToNight(state2);
    getStageView(state2, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    state2.dialogueStep = 2;
    getStageView(state2, () => {}).moves.find((m) => m.id === 'reject_night_trap_d1_niece')!.run();

    getStageView(state2, () => {}).moves.find((m) => m.id === 'pick_night_n1_alley_sendoff')!.run();
    state2.dialogueStep = 2;
    const rejectRealAfterTrap = getStageView(state2, () => {}).moves.find(
      (m) => m.id === 'reject_night_n1_alley_sendoff'
    )!;
    expect(rejectRealAfterTrap.danger).toContain('正规诡客');
    rejectRealAfterTrap.run();
    expect(state2.phase).toBe('settle');
    expect(state2.outcomes[1]).toBe('refused');
  });

  describe('Persistence (localStorage, legacy migration, and phase clock)', () => {
    const origLocal = globalThis.localStorage;
    const origSession = globalThis.sessionStorage;

    afterEach(() => {
      Object.defineProperty(globalThis, 'localStorage', { value: origLocal, configurable: true });
      Object.defineProperty(globalThis, 'sessionStorage', { value: origSession, configurable: true });
    });

    it('persists run state and remaining phase clock in localStorage, skips saving in site, and migrates legacy v3 saves', () => {
      const mockLocal = createMemoryStorage();
      const mockSession = createMemoryStorage();
      Object.defineProperty(globalThis, 'localStorage', { value: mockLocal, configurable: true });
      Object.defineProperty(globalThis, 'sessionStorage', { value: mockSession, configurable: true });

      const run = createRun('d1_full');
      run.phaseRemainingSec = 77;
      run.pts = 45;
      saveRun(run);

      const loaded = loadRun();
      expect(loaded.phaseRemainingSec).toBe(77);
      expect(loaded.pts).toBe(45);

      // Saving inside site phase must NOT overwrite checkpoint
      flipToNight(run);
      startSite(run);
      run.pts = 999;
      saveRun(run);
      expect(loadRun().phase).toBe('day');
      expect(loadRun().pts).toBe(45);

      // Clear saved run & verify legacy sessionStorage v3 migration + shop tab normalization
      clearSavedRun();
      expect(mockLocal.getItem(STORAGE_KEY)).toBeNull();
      const legacy = { ...createRun('d2_story'), dayTab: 'shop', phaseRemainingSec: undefined };
      mockSession.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));
      const migrated = loadRun();
      expect(migrated.day).toBe(2);
      expect(migrated.dayTab).toBe('orders');
      expect(migrated.phaseRemainingSec).toBe(DAY_DURATION_SEC);
    });
  });

  it('provides 15 unique night trap orders across D1–D15 with complete story beats and clues', () => {
    const trapIds = new Set<string>();
    for (let day = 1; day <= 15; day++) {
      expect(DAY_META[day]).toBeDefined();
      const real = getScheduledNightOrder(day, 4);
      const trap = getScheduledTrapOrder(day);
      expect(real.isTrap).toBeFalsy();
      expect(trap.isTrap).toBe(true);
      expect(trap.day).toBe(day);
      expect(trap.storyBeats.length).toBeGreaterThanOrEqual(3);
      expect(trap.trapClueHint).toBeTruthy();
      expect(trap.trapKillTitle).toBeTruthy();
      expect(trap.trapKillNarrative).toBeTruthy();
      expect(trap.trapExposeText).toBeTruthy();
      trapIds.add(trap.id);
    }
    expect(trapIds.size).toBe(15);
  });

  it('supports dedicated tactical moves on all three 3-turn peak nights (D6, D10, D13)', () => {
    // D6: peak-veil-ward (-2 threat, -1 H) + rite-orthodox (-3 threat) + seal
    const d6 = createRun('d6_peak');
    d6.favorCards = [];
    d6.items.wardDoll = 0;
    d6.items.talisman = 0;
    flipToNight(d6);
    startSite(d6);
    const hBeforeD6 = d6.h;
    expect(d6.threat).toBe(4);
    getStageView(d6, () => {}).moves.find((m) => m.id === 'peak-veil-ward')!.run();
    expect(d6.threat).toBe(2);
    expect(d6.h).toBe(hBeforeD6 - 1);
    getStageView(d6, () => {}).moves.find((m) => m.id === 'rite-orthodox')!.run();
    expect(d6.threat).toBe(0);
    getStageView(d6, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(d6.outcomes[6]).toBe('success');

    // D10: peak-trim-lamps (-2 threat) + rite-orthodox (-3 threat & -1 bonus H) + seal
    const d10 = createRun('d10_temple');
    d10.favorCards = [];
    d10.items.wardDoll = 0;
    d10.items.talisman = 0;
    flipToNight(d10);
    startSite(d10);
    const hBeforeD10 = d10.h;
    getStageView(d10, () => {}).moves.find((m) => m.id === 'peak-trim-lamps')!.run();
    getStageView(d10, () => {}).moves.find((m) => m.id === 'rite-orthodox')!.run();
    expect(d10.h).toBe(hBeforeD10 - 1);
    expect(d10.threat).toBe(0);
    getStageView(d10, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(d10.outcomes[10]).toBe('success');
    expect(d10.tokens.some((t) => t.id === 'temple_bell_charm')).toBe(true);

    // D13: peak-avert-chair (-2 threat, free) + rite-orthodox (-3 threat) + seal
    const d13 = createRun('d10_temple');
    d13.day = 13;
    d13.h = 6;
    d13.c = 6;
    d13.s = 6;
    d13.favorCards = [];
    d13.items.wardDoll = 0;
    d13.items.talisman = 0;
    flipToNight(d13);
    startSite(d13);
    getStageView(d13, () => {}).moves.find((m) => m.id === 'peak-avert-chair')!.run();
    getStageView(d13, () => {}).moves.find((m) => m.id === 'rite-orthodox')!.run();
    expect(d13.threat).toBe(0);
    getStageView(d13, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(d13.outcomes[13]).toBe('success');
    expect(d13.tokens.some((t) => t.id === 'opera_mask_jade')).toBe(true);
  });

  it('verifies all daytime orders and all 16 real night orders have consistent step keys and are completable to success', () => {
    // 1. Validate every daytime order definition
    for (const order of DAY_ORDERS) {
      expect(ORDER_BY_ID[order.id]).toBe(order);
      expect(order.dayMin).toBeLessThanOrEqual(order.dayMax);
      expect(order.apCost).toBeGreaterThanOrEqual(1);
      expect(order.storyBeats.length).toBeGreaterThanOrEqual(2);
    }

    // 2. Drive every single real night order through buildSiteMoves to verify step-key alignment & solvability
    const finishIds = new Set(['deliver', 'seal']);
    const skipIds = new Set(['press', 'flee', 'improvise', 'rite-improvise', 'use-paper', 'use-talisman', 'use-ward-doll', 'use-card-liu', 'use-card-boy', 'helper-assist']);

    for (const order of Object.values(NIGHT_ORDERS)) {
      const st = createRun('d1_full');
      st.day = order.day;
      st.s = 10;
      st.c = 10;
      st.h = order.id === 'n4_watched_door' ? 12 : 2;
      st.items.strip = order.id === 'n3_third_lamp' ? 1 : 0;
      st.items.talisman = order.watched ? 1 : 0;
      st.activeNightOrderId = order.id;
      startSite(st);

      let safety = 10;
      while (st.phase === 'site' && safety-- > 0) {
        const moves = getStageView(st, () => {}).moves.filter((m) => !m.reason);
        // Prefer finishing when unlocked, otherwise pick first orthodox/signature step, falling back to talisman / paper
        const nextMove =
          moves.find((m) => finishIds.has(m.id)) ??
          moves.find((m) => !skipIds.has(m.id)) ??
          moves.find((m) => m.id === 'use-talisman') ??
          moves.find((m) => m.id === 'use-paper');
        expect(nextMove, `Expected playable move for ${order.id} (turns=${st.turns}, threat=${st.threat}, steps=${st.steps.join(',')})`).toBeDefined();
        nextMove!.run();
      }

      expect(st.phase, `${order.id} should reach settle`).toBe('settle');
      expect(st.outcomes[order.day], `${order.id} should succeed`).toBe('success');
      for (const step of order.steps) {
        expect(st.steps, `${order.id} missing step key "${step.key}"`).toContain(step.key);
      }
    }
  });

  it('maps every day order and night/trap order to a complete character profile and populates bubble metadata', () => {
    expect(CHARACTER_LIST.length).toBeGreaterThanOrEqual(30);
    for (const profile of CHARACTER_LIST) {
      expect(profile.name).toBeTruthy();
      expect(profile.title).toBeTruthy();
      expect(profile.appearance).toBeTruthy();
      expect(profile.bio).toBeTruthy();
      expect(profile.ruleOrHabit).toBeTruthy();
      expect(profile.bubbleIdentity).toBeTruthy();
      expect(profile.bubbleTraits.length).toBeGreaterThanOrEqual(2);
    }

    for (const dayOrder of DAY_ORDERS) {
      const p = getCharacterForDayOrder(dayOrder);
      expect(p.id).toBeTruthy();
    }
    for (const nightOrder of Object.values(ALL_NIGHT_ORDERS)) {
      const p = getCharacterForNightOrder(nightOrder);
      expect(p.id).toBeTruthy();
    }

    // Verify picking a daytime order records met character & populates dialogue identity + traits
    const st = createRun('d1_full');
    getStageView(st, () => {}).moves.find((m) => m.id === 'pick_d1_chen_white')!.run();
    expect(st.metCharacterIds).toContain('chen_auntie');
    const dlg = getStageView(st, () => {}).dialogue;
    expect(dlg?.identity).toContain('巷尾');
    expect(dlg?.traits?.length).toBeGreaterThanOrEqual(2);
  });

  it('tracks visitor history records across living orders, night settlement, trap exposure, and ward-doll survival', () => {
    const st = createRun('d1_full');
    fulfillDayOrder(st, ORDER_BY_ID.d1_chen_white, 'fine');
    expect(st.visitRecords?.length).toBe(1);
    expect(st.visitRecords?.[0].kind).toBe('living');
    expect(st.visitRecords?.[0].result).toBe('completed_fine');
    expect(st.visitRecords?.[0].characterId).toBe('chen_auntie');

    flipToNight(st);
    getStageView(st, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    st.dialogueStep = 2;
    getStageView(st, () => {}).moves.find((m) => m.id === 'reject_night_trap_d1_niece')!.run();
    expect(st.visitRecords?.length).toBe(2);
    expect(st.visitRecords?.[1].kind).toBe('trap');
    expect(st.visitRecords?.[1].result).toBe('trap_exposed');

    settleNight(st, 'success');
    expect(st.visitRecords?.length).toBe(3);
    expect(st.visitRecords?.[2].kind).toBe('eerie');
    expect(st.visitRecords?.[2].result).toBe('night_success');

    // Ward-doll trap survival also logs a visit record
    const st2 = createRun('d1_full');
    st2.items.wardDoll = 1;
    flipToNight(st2);
    getStageView(st2, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    st2.dialogueStep = 2;
    getStageView(st2, () => {}).moves.find((m) => m.id === 'accept_night_trap_d1_niece')!.run();
    expect(st2.visitRecords?.some((v) => v.result === 'trap_survived')).toBe(true);
  });

  it('supports system intel scanning, tomorrow forecasting, town dossier decryption, codex milestones, and diagnostics', () => {
    const st = createRun('d1_full');
    st.pts = 80;
    st.h = 6;

    // 1. Scan tonight's trap & verify night board surfaces warning once trap speech finishes
    expect(scanTonightTrapIntel(st)).toBe(true);
    expect(st.pts).toBe(70);
    expect(st.scannedTrapDays).toContain(1);
    expect(st.informedDays).toContain(1);
    expect(scanTonightTrapIntel(st)).toBe(false); // cannot scan twice on same day

    // 2. Forecast tomorrow's night guest
    expect(forecastTomorrowIntel(st)).toBe(true);
    expect(st.pts).toBe(62);
    expect(st.forecastDays).toContain(2);
    expect(forecastTomorrowIntel(st)).toBe(false);

    // 3. Decrypt 3 secret dossiers -> each lowers H by 1 and 3rd auto-claims ms_intel_3 (+15 pts)
    expect(decryptTownIntel(st, 'intel_three_lamps')).toBe(true);
    expect(st.h).toBe(5);
    expect(decryptTownIntel(st, 'intel_system_origin')).toBe(true);
    expect(st.h).toBe(4);
    expect(decryptTownIntel(st, 'intel_red_bride')).toBe(true);
    expect(st.h).toBe(3);
    expect(st.claimedCodexMilestones).toContain('ms_intel_3');
    // 62 - 36 (3 docs) + 15 (ms_intel_3) = 41
    expect(st.pts).toBe(41);
    expect(decryptTownIntel(st, 'intel_red_bride')).toBe(false); // duplicate blocked

    // 4. Verify scanned trap clue shows system alert in night board after trap finishes speaking
    flipToNight(st);
    getStageView(st, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    st.dialogueStep = 2;
    const scannedBoardView = getStageView(st, () => {});
    expect(scannedBoardView.notice).toContain('系统侦测警示');

    // 5. Diagnostics reflect threat, progress, and D15 true-ending checklist
    const diag = getSystemDiagnostics(st);
    expect(diag.estimatedThreat0).toBeGreaterThanOrEqual(1);
    expect(diag.codexProgress.intelCount).toBe(3);
    expect(diag.codexProgress.scannedCount).toBe(1);
    expect(diag.trueEndingChecks).toHaveLength(5);
  });

  it('enforces skill prerequisites, applies all 3 skill branches across day/night/site/settle, and claims skill milestones', () => {
    const st = createRun('d1_full');
    st.pts = 300;
    st.h = 6;

    // 1. Prerequisite enforcement
    expect(learnSystemSkill(st, 'craft_trim')).toBe(false); // requires craft_nimble
    expect(learnSystemSkill(st, 'craft_nimble')).toBe(true);
    expect(learnSystemSkill(st, 'craft_trim')).toBe(true);
    expect(learnSystemSkill(st, 'craft_master')).toBe(true);
    // 3rd skill auto-claims ms_skill_3 (+14 pts)
    expect(st.claimedCodexMilestones).toContain('ms_skill_3');

    // Craft branch effects: fine needs no extra paper, AP -1, every 2 orders refunds +1 paper, street talisman is free
    const order1 = ORDER_BY_ID.d1_chen_white;
    const sBefore1 = st.s;
    const apBefore1 = st.ap;
    fulfillDayOrder(st, order1, 'fine');
    expect(st.s).toBe(sBefore1 - order1.needS); // no +1 paper for fine
    expect(st.ap).toBe(apBefore1 - Math.max(1, order1.apCost - 1)); // craft_master AP -1

    // 2nd daytime order triggers craft_trim +1 paper refund
    const order2 = ORDER_BY_ID[st.todayOrders.find((id) => id !== order1.id)!];
    const sBefore2 = st.s;
    fulfillDayOrder(st, order2, 'standard');
    expect(st.s).toBe(sBefore2 - order2.needS + 1);

    // Street craft_talisman costs 0 paper with craft_trim
    st.dayTab = 'street';
    const sBeforeTalisman = st.s;
    getStageView(st, () => {}).moves.find((m) => m.id === 'craft_talisman')!.run();
    expect(st.s).toBe(sBeforeTalisman);
    expect(st.items.talisman).toBe(1);

    // 2. Sight branch effects: echo trap alert + +10 pts, half-price scan + C+1, omen auto-informs & half-price forecast, eye lowers Threat0
    expect(learnSystemSkill(st, 'sight_echo')).toBe(true);
    const cBeforeScan = st.c;
    const ptsBeforeScan = st.pts;
    expect(scanTonightTrapIntel(st)).toBe(true);
    expect(st.pts).toBe(ptsBeforeScan - 5); // half price (5 pts)
    expect(st.c).toBe(cBeforeScan + 1); // bonus cleanliness +1

    expect(learnSystemSkill(st, 'sight_omen')).toBe(true);
    const ptsBeforeForecast = st.pts;
    expect(forecastTomorrowIntel(st)).toBe(true);
    expect(st.pts).toBe(ptsBeforeForecast - 4); // half price (4 pts)

    expect(learnSystemSkill(st, 'sight_eye')).toBe(true);
    // 6th skill auto-claims ms_skill_6 (+24 pts)
    expect(st.claimedCodexMilestones).toContain('ms_skill_6');

    // sight_eye lowers Threat0 by 1 (n3 risk 2 + floor(6/6)=1 - eye 1 = 2)
    expect(computeInitialThreat(st, NIGHT_ORDERS.n3_third_lamp)).toBe(2);

    // sight_echo triggers warning on night board even without scanning (test on fresh state)
    const stEcho = createRun('d1_full');
    stEcho.pts = 30;
    expect(learnSystemSkill(stEcho, 'sight_echo')).toBe(true);
    flipToNight(stEcho);
    getStageView(stEcho, () => {}).moves.find((m) => m.id === 'pick_night_trap_d1_niece')!.run();
    stEcho.dialogueStep = 2;
    expect(getStageView(stEcho, () => {}).notice).toContain('听声辨影');
    const ptsBeforeExpose = stEcho.pts;
    getStageView(stEcho, () => {}).moves.find((m) => m.id === 'reject_night_trap_d1_niece')!.run();
    expect(stEcho.pts).toBe(ptsBeforeExpose + 10); // 6 base + 4 echo bonus

    // 3. Ward branch effects: active site skills (ward_flame & ward_decree), ward_heart free nerve & double clean & no yin on improvise, half-price unlimited handle wash
    const stWard = createRun('d6_peak');
    stWard.pts = 150;
    stWard.favorCards = [];
    stWard.items.talisman = 0;
    stWard.items.wardDoll = 0;
    stWard.handle = 2;
    stWard.helper = { hired: true, name: '伙计小栓', nerve: 6 };
    expect(learnSystemSkill(stWard, 'ward_flame')).toBe(true);
    expect(learnSystemSkill(stWard, 'ward_heart')).toBe(true);
    expect(learnSystemSkill(stWard, 'ward_decree')).toBe(true);

    flipToNight(stWard);
    startSite(stWard);
    expect(stWard.threat).toBe(4);

    // Turn 1: helper assist does NOT drop nerve (first time per night with ward_heart)
    getStageView(stWard, () => {}).moves.find((m) => m.id === 'helper-assist')!.run();
    expect(stWard.helper.nerve).toBe(6);
    expect(stWard.threat).toBe(3);

    // Turn 2: cast master skill 'skill-ward-decree' -> completes rite_main + threat -3 -> 0!
    const decreeMove = getStageView(stWard, () => {}).moves.find((m) => m.id === 'skill-ward-decree')!;
    expect(decreeMove.skill).toBe(true);
    decreeMove.run();
    expect(stWard.threat).toBe(0);
    expect(stWard.steps).toContain('rite_main');

    // Turn 3: seal -> peak night cleared using learned skills!
    getStageView(stWard, () => {}).moves.find((m) => m.id === 'seal')!.run();
    expect(stWard.phase).toBe('settle');
    expect(stWard.outcomes[6]).toBe('success');

    // In settle: wash handle costs only 12 cash with ward_decree
    const mBeforeWash = stWard.m;
    getStageView(stWard, () => {}).moves.find((m) => m.id === 'settle_wash_handle')!.run();
    expect(stWard.m).toBe(mBeforeWash - 12);
    expect(stWard.handle).toBe(1);
    expect(stWard.washedHandleThisRun).toBe(false); // unlimited with ward_decree
  });

  it('supports strolling between front and back Qilou street blocks and exploring teahouse, bookstore, shrine, and alley', () => {
    const st = createRun('d1_full');
    st.dayTab = 'street';
    st.h = 6;
    st.helper = { hired: true, name: '伙计小栓', nerve: 5 };

    // Front block has go-back control
    const frontMoves = getStageView(st, () => {}).moves;
    expect(frontMoves.some((m) => m.id === 'street_go_back')).toBe(true);
    frontMoves.find((m) => m.id === 'street_go_back')!.run();
    expect(st.streetZone).toBe('back');

    // 1. Dechang Teahouse: +1 favor, +1 trust, -1 yin
    const f0 = st.f;
    const ty0 = st.ty;
    const h0 = st.h;
    getStageView(st, () => {}).moves.find((m) => m.id === 'explore_teahouse')!.run();
    expect(st.f).toBe(f0 + 1);
    expect(st.ty).toBe(ty0 + 1);
    expect(st.h).toBe(h0 - 1);
    expect(getStageView(st, () => {}).moves.find((m) => m.id === 'explore_teahouse')?.reason).toBeTruthy();

    // 2. Ink Bookshop: +10 pts, +1 C, meets elder_scholar; 2nd cumulative visit auto-decrypts a free town intel doc!
    const pts0 = st.pts;
    getStageView(st, () => {}).moves.find((m) => m.id === 'explore_bookstore')!.run();
    expect(st.pts).toBe(pts0 + 10);
    expect(st.metCharacterIds).toContain('elder_scholar');
    expect(st.bookstoreVisitsTotal).toBe(1);

    // 3. City God Shrine: -3 yin, +1 C, helper nerve +2
    const hBeforeShrine = st.h;
    const nerveBeforeShrine = st.helper.nerve;
    getStageView(st, () => {}).moves.find((m) => m.id === 'explore_shrine')!.run();
    expect(st.h).toBe(Math.max(0, hBeforeShrine - 3));
    expect(st.helper.nerve).toBe(nerveBeforeShrine + 2);

    // 4. Old Locust Alley daily discovery (Day 1 -> paper +2)
    const sBeforeAlley = st.s;
    getStageView(st, () => {}).moves.find((m) => m.id === 'explore_alley')!.run();
    expect(st.s).toBe(sBeforeAlley + 2);

    // Next day resets streetVisitedToday and 2nd bookstore visit unlocks a free intel doc
    flipToNight(st);
    settleNight(st, 'success');
    dawn(st);
    expect(st.streetZone).toBe('front');
    expect(st.streetVisitedToday).toHaveLength(0);

    st.dayTab = 'street';
    st.streetZone = 'back';
    getStageView(st, () => {}).moves.find((m) => m.id === 'explore_bookstore')!.run();
    expect(st.bookstoreVisitsTotal).toBe(2);
    expect(st.unlockedIntelIds?.length).toBe(1);
  });
});
