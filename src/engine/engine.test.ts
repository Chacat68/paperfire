import { describe, expect, it } from 'vitest';
import { NIGHT_ORDERS } from '../data/night';
import { ORDER_BY_ID } from '../data/orders';
import {
  buyShopUpgrade,
  computeInitialThreat,
  createRun,
  dawn,
  flipToNight,
  fulfillDayOrder,
  getStageView,
  redeemSystemSupply,
  rollbackToLastDay,
  settleNight,
  startSite
} from './index';

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

  it('supports D4 empty-warehouse QA-07 recovery and avoids watched order after resting', () => {
    const state = createRun('d4_empty');
    expect(state.m).toBe(0);
    expect(state.s).toBe(0);
    expect(state.todayOrders).toContain('d4_relief_self');

    fulfillDayOrder(state, ORDER_BY_ID.d4_relief_self, 'standard');
    expect(state.m).toBe(12);
    expect(state.s).toBe(0);

    state.dayTab = 'shop';
    getStageView(state, () => {}).moves.find((m) => m.id === 'rest_tonight')!.run();
    expect(state.h).toBe(11);

    flipToNight(state);
    expect(state.phase).toBe('settle');
    expect(state.outcomes[4]).toBe('rested');
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

  it('supports hiring helper, nerve refusal <= 2, calming helper, and named favor cards', () => {
    const state = createRun('d1_full');
    state.dayTab = 'shop';
    getStageView(state, () => {}).moves.find((m) => m.id === 'hire_helper')!.run();
    expect(state.helper.hired).toBe(true);
    expect(state.helper.nerve).toBe(6);

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
  });
});
