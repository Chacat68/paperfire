import { getCharacterForNightOrder } from '../data/characters';
import {
  NIGHT_ORDERS,
  buildTonightNightOrders,
  getNightOrderById,
  getScheduledNightOrder
} from '../data/night';
import { buildDailyQuests, FAVOR_CARDS } from '../data/systemShop';
import type { ActionOption, CardIconKind, GameState, NightOrderDef, NightOutcome } from '../data/types';
import { DAY_DURATION_SEC, hasSkill, hasToken, markCharacterMet, note, recordVisit, refreshDayOrders } from './state';
import { snapshotDayStart, syncAndClaimDailyQuests } from './systemEngine';

function pickNightOrderIcon(order: NightOrderDef): CardIconKind {
  switch (order.guestArt) {
    case 'paper_boy':
      return 'horse';
    case 'masked_wu':
      return 'plaque';
    case 'ajie_night':
      return 'doll';
    case 'umbrella':
      return 'umbrella';
    case 'old_accountant':
      return 'ledger';
    case 'paper_bride':
      return 'bride';
    case 'mirror_guest':
      return 'mirror';
    case 'temple_deity':
      return 'deity';
    case 'opera_ghost':
      return 'opera';
    case 'zodiac_goat':
      return 'deity';
    case 'midnight_courier':
      return 'lantern';
    case 'smiling_surgeon':
      return 'clinic';
    case 'crimson_senior':
      return 'bride';
    case 'zuowang_jester':
      return 'opera';
    case 'puppet_twins':
      return 'doll';
    default:
      return 'lantern';
  }
}

export function getActiveNightOrder(state: GameState): NightOrderDef {
  if (state.activeNightOrderId && NIGHT_ORDERS[state.activeNightOrderId]) {
    return NIGHT_ORDERS[state.activeNightOrderId];
  }
  return getScheduledNightOrder(state.day, state.h);
}

export interface ThreatBreakdown {
  threat: number;
  parts: string[];
}

export function computeThreatBreakdown(state: GameState, order: NightOrderDef): ThreatBreakdown {
  // 对齐设计稿 4.4 节公式：Threat0 = clamp(risk + clamp(floor(H/6), 0, 2) + (替代料 ? 1 : 0) - 铺面/信物/法眼减压, 1, 5)
  const yinBonus = Math.min(2, Math.floor(state.h / 6));
  const proxyBonus = state.usedProxyToday ? 1 : 0;
  const handleBonus = (order.id === 'n5_old_account' || order.id === 'n15_final_ledger') && state.handle > 0 ? 1 : 0;
  const bellBonus = state.upgrades.includes('copper_bell') ? 1 : 0;
  const eyeBonus = hasSkill(state, 'sight_eye') ? 1 : 0;
  const maskBonus =
    order.id === 'n15_final_ledger' && state.tokens.some((t) => t.id === 'opera_mask_jade') ? 1 : 0;
  const threat = Math.max(
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

  return { threat, parts };
}

export function computeInitialThreat(state: GameState, order: NightOrderDef): number {
  return computeThreatBreakdown(state, order).threat;
}

export function startSite(state: GameState): void {
  const order = getActiveNightOrder(state);
  markCharacterMet(state, getCharacterForNightOrder(order).id);
  state.phase = 'site';
  state.turns = order.turns;
  state.threat = computeInitialThreat(state, order);
  state.steps = [];
  state.skillUsesTonight = [];
  state.message = order.siteIntro;
}

export function settleNight(state: GameState, result: NightOutcome): void {
  const order = getActiveNightOrder(state);
  const profile = getCharacterForNightOrder(order);
  markCharacterMet(state, profile.id);
  state.outcomes[state.day] = result;
  state.nightOrderHistory ??= {};
  state.nightOrderHistory[state.day] = order.id;
  const deposit = order.promisedKey === 'wu_d2' && state.promiseWu ? state.deposit : 0;

  if (result === 'success') {
    const bronzeCashBonus = hasToken(state, 'bronze_clasp') ? 10 : 0;
    const due = Math.max(0, order.pay - deposit) + bronzeCashBonus;
    const knotBonus = hasToken(state, 'crimson_knot') ? 6 : 0;
    const masterBonus = hasSkill(state, 'craft_master') ? 4 : 0;
    const ptsGain = order.ptsReward + knotBonus + masterBonus;
    state.m += due;
    state.pts += ptsGain;
    state.h = Math.max(0, state.h - (order.peak ? 2 : 1));
    state.tn += order.peak ? 2 : 1;

    if (state.uneasy && !order.peak) {
      state.uneasyCleanDays += 1;
    }

    let extraText = bronzeCashBonus ? '（旧账铜扣额外 +10 现）' : '';
    if (order.tokenReward && !state.tokens.some((t) => t.id === order.tokenReward!.id)) {
      state.tokens.push(order.tokenReward);
      extraText += ` 获得信物「${order.tokenReward.name}」。`;
    }
    if (order.favorCardReward && !state.favorCards.includes(order.favorCardReward)) {
      state.favorCards.push(order.favorCardReward);
      extraText += ` 获得人情卡「${FAVOR_CARDS[order.favorCardReward].name}」。`;
    }
    recordVisit(state, {
      day: state.day,
      period: 'night',
      characterId: profile.id,
      guestName: profile.name,
      orderId: order.id,
      orderTitle: order.title,
      kind: 'eerie',
      result: 'night_success',
      cashDelta: due,
      ptsDelta: ptsGain,
      note: order.peak ? '顶格诡夜履约成功' : '按禁忌履约交付'
    });
    state.lastSettleSummary = `${order.client}满意离去：结清 ${due} 现金，系统奖励 +${ptsGain} 纸火点，阴气 −${order.peak ? 2 : 1}，夜口碑 +${order.peak ? 2 : 1}。${extraText}`;
    note(state, state.lastSettleSummary);
  } else if (result === 'pressed') {
    const due = Math.max(0, Math.floor(order.pay / 2) - deposit);
    const halfPts = Math.floor(order.ptsReward / 2);
    state.m += due;
    state.pts += halfPts;
    state.f = Math.max(0, state.f - 2);
    state.handle += 1;
    recordVisit(state, {
      day: state.day,
      period: 'night',
      characterId: profile.id,
      guestName: profile.name,
      orderId: order.id,
      orderTitle: order.title,
      kind: 'eerie',
      result: 'night_pressed',
      cashDelta: due,
      ptsDelta: halfPts,
      note: '消耗 2 人情压下，留 1 笔把柄'
    });
    state.lastSettleSummary = `${order.client}暂被按下：收 ${due} 现金、+${halfPts} 纸火点，消耗 2 人情，账上留下一笔把柄。`;
    note(state, state.lastSettleSummary);
  } else if (result === 'failed' || result === 'fled') {
    // 若持有系统兑换的「护身替纸人」且非主动逃跑，自动替劫保底一次！
    if (result === 'failed' && state.items.wardDoll > 0) {
      state.items.wardDoll -= 1;
      state.h += 1;
      recordVisit(state, {
        day: state.day,
        period: 'night',
        characterId: profile.id,
        guestName: profile.name,
        orderId: order.id,
        orderTitle: order.title,
        kind: 'eerie',
        result: 'night_failed',
        cashDelta: 0,
        ptsDelta: 0,
        note: '履约失手 · 护身替纸人自燃替劫'
      });
      state.lastSettleSummary = `危急关头，系统兑换的「护身替纸人」化作灰烬替你挡下一劫！保住了口碑与铺面（仅阴气 +1）。`;
      note(state, state.lastSettleSummary);
    } else {
      state.h += order.peak ? 3 : 2;
      state.ty = Math.max(0, state.ty - 1);
      if (result === 'fled') state.tn = Math.max(0, state.tn - 1);
      if (state.helper.hired) {
        state.helper.nerve = Math.max(0, state.helper.nerve - 2);
      }
      if (order.peak) {
        state.uneasy = true;
        state.uneasyCleanDays = 0;
      }

      if (order.aftermathFlag === 'audit') {
        state.audit = true;
      } else if (order.aftermathFlag === 'rumor') {
        state.rumor = true;
      } else if (order.aftermathFlag === 'watched_debt') {
        state.handle += 1;
      }
      recordVisit(state, {
        day: state.day,
        period: 'night',
        characterId: profile.id,
        guestName: profile.name,
        orderId: order.id,
        orderTitle: order.title,
        kind: 'eerie',
        result: result === 'fled' ? 'night_fled' : 'night_failed',
        cashDelta: 0,
        ptsDelta: 0,
        note: result === 'fled' ? '中途撤离 · 夜口碑受损' : order.failNote
      });
      state.lastSettleSummary = order.failNote;
      note(state, order.failNote);
    }
  } else if (result === 'refused') {
    recordVisit(state, {
      day: state.day,
      period: 'night',
      characterId: profile.id,
      guestName: profile.name,
      orderId: order.id,
      orderTitle: order.title,
      kind: 'eerie',
      result: 'night_refused',
      cashDelta: 0,
      ptsDelta: 0,
      note: order.watched ? '硬拒被盯大单 · 留把柄' : '婉拒未接'
    });
    if (order.watched) {
      state.h += 1;
      state.handle += 1;
      state.lastSettleSummary = `你硬把被盯的诡异客挡在门外：阴气 +1，账上记下一笔把柄。`;
    } else {
      state.lastSettleSummary = `你婉拒了「${order.title}」，这一笔从夜账待接栏划掉。`;
    }
    note(state, state.lastSettleSummary);
  }

  // 若今夜转接了其他夜单（例如异闻奇客）而爽约了白天吴支书承诺单或绕开了被盯大单，仍须承担相应后果
  const skippedWuPromise = state.day === 2 && state.promiseWu && order.id !== 'n2_wu_plain' && result !== 'rested';
  const skippedWatchedDoor =
    state.watchedTonight && !order.watched && result !== 'rested' && result !== 'refused';
  if (skippedWuPromise) {
    state.audit = true;
    const breachMsg = '（未按约招待吴支书牵线的借面客，次日仍将引来镇里抽查。）';
    state.lastSettleSummary = `${state.lastSettleSummary} ${breachMsg}`.trim();
    note(state, '【失约余波】今夜未履约借面客之约，次日将引来镇里抽查。');
  }
  if (skippedWatchedDoor) {
    state.h += 1;
    state.handle += 1;
    const watchMsg = '（门外原本窥视铺门的被盯大单未封敕，阴气 +1 且账上多留 1 笔把柄。）';
    state.lastSettleSummary = `${state.lastSettleSummary} ${watchMsg}`.trim();
    note(state, '【窥视余波】绕开被盯大单未应门封敕，阴气 +1、把柄 +1。');
  }

  state.phase = 'settle';
  state.phaseRemainingSec = 0;
  state.settleChoreDone = false;
  state.settleChosenId = null;
  syncAndClaimDailyQuests(state);
}

export function triggerNightTrap(state: GameState, trapOrder: NightOrderDef): void {
  const profile = getCharacterForNightOrder(trapOrder);
  markCharacterMet(state, profile.id);
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;

  // 若持有系统兑换的「护身替纸人」，可在被骗出门的一瞬间自燃替死保命！
  if (state.items.wardDoll > 0) {
    state.items.wardDoll -= 1;
    state.h += 3;
    state.outcomes[state.day] = 'failed';
    state.nightOrderHistory ??= {};
    state.nightOrderHistory[state.day] = trapOrder.id;
    state.phase = 'settle';
    state.phaseRemainingSec = 0;
    state.settleChoreDone = false;
    state.settleChosenId = null;
    recordVisit(state, {
      day: state.day,
      period: 'night',
      characterId: profile.id,
      guestName: profile.name,
      orderId: trapOrder.id,
      orderTitle: trapOrder.title,
      kind: 'trap',
      result: 'trap_survived',
      cashDelta: 0,
      ptsDelta: 0,
      note: '误信出门 · 护身替纸人自燃救主'
    });
    state.lastSettleSummary = `【诱杀惊魂 · 替纸人救主】你听信「${trapOrder.client}」跨出门槛半步，背后杀机骤起！千钧一发之际，袖中「护身替纸人」轰然自燃替你受死，生生把你拽回铺内（替纸人 −1，阴气 +3）。`;
    note(state, state.lastSettleSummary);
    syncAndClaimDailyQuests(state);
    return;
  }

  recordVisit(state, {
    day: state.day,
    period: 'night',
    characterId: profile.id,
    guestName: profile.name,
    orderId: trapOrder.id,
    orderTitle: trapOrder.title,
    kind: 'trap',
    result: 'trap_killed',
    cashDelta: 0,
    ptsDelta: 0,
    note: trapOrder.trapKillTitle ?? '诱杀毙命'
  });
  state.phase = 'bad_end';
  state.phaseRemainingSec = 0;
  state.badEndReason = `【${trapOrder.trapKillTitle ?? '诡异诱杀'}】${trapOrder.trapKillNarrative ?? '你被门外诡异骗出铺门，未能再走回灯火之下。'}`;
  state.message = state.badEndReason;
  note(state, state.badEndReason);
}

export function exposeNightTrap(state: GameState, trapOrder: NightOrderDef): void {
  const profile = getCharacterForNightOrder(trapOrder);
  markCharacterMet(state, profile.id);
  const echoBonus = hasSkill(state, 'sight_echo') ? 4 : 0;
  const zodiacBonus = hasToken(state, 'zodiac_chip') ? 4 : 0;
  const trapPts = 6 + echoBonus + zodiacBonus;
  const bonusTags: string[] = [];
  if (echoBonus) bonusTags.push(`听声辨影 +${echoBonus} 点`);
  if (zodiacBonus) bonusTags.push(`生肖铜筹 +${zodiacBonus} 点`);
  if (!state.rejectedNightOrderIds.includes(trapOrder.id)) {
    state.rejectedNightOrderIds.push(trapOrder.id);
    state.pts += trapPts;
    state.h = Math.max(0, state.h - 1);
    recordVisit(state, {
      day: state.day,
      period: 'night',
      characterId: profile.id,
      guestName: profile.name,
      orderId: trapOrder.id,
      orderTitle: trapOrder.title,
      kind: 'trap',
      result: 'trap_exposed',
      cashDelta: 0,
      ptsDelta: trapPts,
      note: bonusTags.length ? `识破诱杀（${bonusTags.join(' · ')}）· 阴气 −1` : '识破诱杀骗局 · 阴气 −1'
    });
  }
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;
  const baseText =
    trapOrder.trapExposeText ?? '你识破门外诡异的诱杀骗局，死守门闩绝不跨出铺门（纸火点 +6，阴气 −1）。';
  note(state, bonusTags.length ? `${baseText}（额外加成：${bonusTags.join('、')}！）` : baseText);
  syncAndClaimDailyQuests(state);
}

export function rejectRealNightOrder(
  state: GameState,
  order: NightOrderDef,
  promised: boolean
): void {
  state.activeNightOrderId = order.id;
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;

  const hasOtherUnrejected = state.todayNightOrders.some(
    (id) => id !== order.id && !state.rejectedNightOrderIds.includes(id)
  );
  if (!hasOtherUnrejected) {
    settleNight(state, promised ? 'failed' : 'refused');
    return;
  }

  if (!state.rejectedNightOrderIds.includes(order.id)) {
    state.rejectedNightOrderIds.push(order.id);
  }
  note(
    state,
    order.specialViral
      ? `你婉拒了异闻奇客「${order.client}」，对方轻笑一声退入夜雾。门外尚余其他来客，可继续听清来意或落闩收摊。`
      : `你婉拒了「${order.client}」，对方默不作声收起纸单退去——并无异状破绽，似乎错把今夜正规诡客拒之门外。门外尚余另一位来客，仍可听清破绽识破诱杀，或直接落闩收摊。`
  );
}

export function dawn(state: GameState): void {
  const prevDay = state.day;
  const prevOrder = getActiveNightOrder(state);

  if (state.day >= state.maxDay) {
    state.phase = 'end';
    state.phaseRemainingSec = 0;
    state.message = '';
    return;
  }

  // 沉香三足大炉被动：天亮自动净铺降阴
  if (state.upgrades.includes('jade_censer')) {
    state.h = Math.max(0, state.h - 1);
    state.c += 1;
  }

  // 断弦红丝谱（血红衣学姐信物）被动：高阴气时晨前琴音自动涤荡阴气 −1
  const elegyTriggered = hasToken(state, 'elegy_score') && state.h >= 8;
  if (elegyTriggered) {
    state.h = Math.max(0, state.h - 1);
  }

  // 生存口粮消耗（P0 #5）
  let starveNote = '';
  if (state.ration >= 1) {
    state.ration -= 1;
    state.starveStreak = 0;
  } else {
    state.starveStreak += 1;
    state.h += 2;
    starveNote = `【系统警告】生存口粮断供（连续第 ${state.starveStreak} 日）！体力虚弱（今日工时 −1，阴气 +2）。`;
  }

  // 坏结局检定：连续两日断供 / 阴气 ≥ 20 / 带着「不对劲」再次顶格失败
  const peakCrash = state.uneasy && prevOrder.peak && state.outcomes[prevDay] === 'failed';
  if (state.starveStreak >= 2 || state.h >= 20 || peakCrash) {
    state.phase = 'bad_end';
    state.phaseRemainingSec = 0;
    state.badEndReason =
      state.starveStreak >= 2
        ? '连续两日未能从初始系统兑换生存口粮，你在诡异小镇的浓雾中彻底耗尽精力，铺门悄然易主。'
        : state.h >= 20
          ? '铺面阴气冲破 20 红线，白昼不再降临，门楣双红灯与平安烛同时熄灭，规则清算降临。'
          : '顶格诡异失守叠加上回留下的「不对劲」，次日天明时纸扎铺只剩一地纸灰。';
    state.message = state.badEndReason;
    return;
  }

  state.day += 1;
  state.phase = 'day';
  state.phaseRemainingSec = DAY_DURATION_SEC;
  state.dayTab = 'orders';
  state.selectedOrderId = null;
  state.selectedNightOrderId = null;
  state.todayNightOrders = [];
  state.rejectedNightOrderIds = [];
  state.dialogueStep = 0;
  state.listenedOrderIds = [];
  state.deposit = 0;
  state.ap = state.starveStreak > 0 ? Math.max(3, state.apMax - 1) : state.apMax;
  state.usedProxyToday = false;
  state.streetSupplyUses = 0;
  state.streetIntelUses = 0;
  state.streetZone = 'front';
  state.streetVisitedToday = [];
  state.restTonight = state.restNextNight;
  state.restNextNight = false;
  state.settleChoreDone = false;
  state.settleChosenId = null;
  state.watchedTonight = false;
  state.activeNightOrderId = null;
  state.skillUsesTonight = [];
  state.dailyQuests = buildDailyQuests(state.day);

  // 望气知忌技能：每日天明自动洞悉今夜正规禁忌
  if (hasSkill(state, 'sight_omen')) {
    if (!state.informedDays.includes(state.day)) {
      state.informedDays.push(state.day);
    }
    if (state.day === 5) state.d6Previewed = true;
    const tonightPreview = getScheduledNightOrder(state.day, state.h);
    note(state, `【望气知忌】晨雾映出今夜禁忌：「${tonightPreview.taboo}」，已自动核实入账。`);
  }

  // 若有抽查余波且手上有支书盖章卡，自动抵消抽查
  if (state.audit && state.tokens.some((t) => t.id === 'wu_stamp')) {
    state.audit = false;
    state.tokens = state.tokens.filter((t) => t.id !== 'wu_stamp');
    note(state, '镇里一早来抽查，你亮出「支书盖章卡」挡了回去，今日照常营业。');
  }

  if (state.day === 4) {
    state.reliefEligible = state.m < 10 || state.s === 0;
    if (state.rumor) {
      note(state, '镇群传闻发酵，今日普通活人单少 1 张；可去街巷找阿杰圆场，或先保现金流。');
    } else {
      note(state, '天亮开铺。昨夜安稳，活人街坊照常登门。');
    }
  } else if (state.day === 3) {
    note(
      state,
      state.audit
        ? '昨夜失约引来镇里抽查，今日普通白单回款减少。阿杰今早来取纸活，提到了第三盏灯。'
        : '天亮开铺。阿杰清早来取纸活，说视频拍到第三盏灯就断了。'
    );
  } else if (state.day === 5) {
    state.d6Previewed = true;
    note(state, '系统提示：明晚起将迎首次顶格诡异夜，今晚须先过阴差对簿关。');
  } else if (state.day === 6 || state.day === 10 || state.day === 13) {
    note(state, `【系统警报】第 ${state.day} 日今夜将迎 3 回合顶格诡异登门，白天务必备齐纸符、替纸人与生存口粮！`);
  } else {
    note(state, `第 ${state.day} 日天亮开铺，迎接活人订单。${state.ration === 0 ? '（注意：生存口粮已耗尽，请尽快用纸火点兑换！）' : ''}`);
  }

  if (elegyTriggered) {
    note(state, '【断弦红丝谱】晨雾散尽前隐约响起一节安魂琴音，替铺面涤荡阴气 −1。');
  }

  if (starveNote) {
    note(state, starveNote);
  }

  refreshDayOrders(state);
  snapshotDayStart(state);
}

export function buildNightBoardMoves(state: GameState): ActionOption[] {
  if (!state.todayNightOrders || state.todayNightOrders.length === 0) {
    state.todayNightOrders = buildTonightNightOrders(state.day, state.h);
  }

  // 选中了某张夜单：角色现身讲述经过，听完再决定接单、识破拒接，或先听另一位来客
  if (state.selectedNightOrderId) {
    const order = getNightOrderById(state.selectedNightOrderId);
    if (!order || state.rejectedNightOrderIds.includes(order.id)) {
      state.selectedNightOrderId = null;
      state.dialogueStep = 0;
    } else {
      const totalBeats = Math.max(1, order.storyBeats.length);
      const stepIdx = Math.max(0, Math.min(state.dialogueStep, totalBeats - 1));
      const finished = stepIdx >= totalBeats - 1;

      if (!finished) {
        return [
          {
            id: 'advance_night_dialogue',
            title: `继续听下去（${stepIdx + 2}/${totalBeats}）`,
            detail: '细听来意与破绽，讲完再定',
            primary: true,
            run: () => {
              state.dialogueStep = Math.min(totalBeats - 1, state.dialogueStep + 1);
              if (state.dialogueStep >= totalBeats - 1 && !state.listenedOrderIds.includes(order.id)) {
                state.listenedOrderIds.push(order.id);
              }
            }
          },
          {
            id: 'back_to_night_board',
            title: '先听别家',
            detail: '返回今夜来客',
            presentation: 'control',
            run: () => {
              state.selectedNightOrderId = null;
              state.dialogueStep = 0;
            }
          }
        ];
      }

      if (!state.listenedOrderIds.includes(order.id)) {
        state.listenedOrderIds.push(order.id);
      }

      const promised = !order.isTrap && order.promisedKey === 'wu_d2' && state.promiseWu;
      const trapAlreadyExposed = state.todayNightOrders.some((id) => {
        const candidate = getNightOrderById(id);
        return Boolean(candidate?.isTrap && state.rejectedNightOrderIds.includes(id));
      });
      const hasOtherUnrejectedReal = state.todayNightOrders.some((id) => {
        if (id === order.id || state.rejectedNightOrderIds.includes(id)) return false;
        const candidate = getNightOrderById(id);
        return Boolean(candidate && !candidate.isTrap);
      });
      const willBreachWuPromise = !order.isTrap && state.day === 2 && state.promiseWu && order.id !== 'n2_wu_plain';
      const willSkipWatched = !order.isTrap && state.watchedTonight && !order.watched;
      const acceptDanger = willBreachWuPromise
        ? '白天已收吴支书订金约好借面客。今夜转接此单将视为对借面客失约，次日引来镇里抽查。确定转接？'
        : willSkipWatched
          ? '今夜铺门已被盯上。转接此单而不应门封敕，会在结账时额外阴气 +1 并留下一笔把柄。确定转接？'
          : undefined;
      const acceptDetail = promised
        ? `尾款+${order.pay - state.deposit} · 点+${order.ptsReward} · 局面 ${computeInitialThreat(state, order)}`
        : order.isTrap
          ? `现+${order.pay} · 点+${order.ptsReward} · 照对方要求办`
          : `现+${order.pay} · 点+${order.ptsReward} · 局面 ${computeInitialThreat(state, order)}${order.peak ? ' · 3回合' : ''}`;

      const rejectDanger = promised
        ? '这笔单白天已收吴支书订金。若现在拒接会记为失约失败，且次日镇里要来抽查。'
        : !order.isTrap && order.watched
          ? '这是系统标记的被盯/必核大单。硬拒会让阴气 +1，并在账上留下一笔把柄。'
          : !order.isTrap && trapAlreadyExposed && !hasOtherUnrejectedReal
            ? '门外诱杀诡已被识破，这位正是今夜仅余的正规诡客。拒接将直接结束今夜且无夜赏，确定拒接？'
            : undefined;

      const rejectDetail = promised
        ? '失约失败 · 次日抽查'
        : !order.isTrap && order.watched
          ? '被盯大单 · 阴气+1 留把柄'
          : !order.isTrap && trapAlreadyExposed && !hasOtherUnrejectedReal
            ? '放弃正规夜单 · 结束今夜'
            : !order.isTrap && hasOtherUnrejectedReal
              ? '婉拒此位 · 仍可转听别家'
              : '疑有破绽 · 严词拒接守门';

      return [
        {
          id: `accept_night_${order.id}`,
          title: order.peak && !order.isTrap ? '接单 · 顶格履约' : '接下此单',
          detail: acceptDetail,
          primary: true,
          danger: acceptDanger,
          run: () => {
            if (order.isTrap) {
              triggerNightTrap(state, order);
            } else {
              state.activeNightOrderId = order.id;
              state.selectedNightOrderId = null;
              state.dialogueStep = 0;
              startSite(state);
            }
          }
        },
        {
          id: `reject_night_${order.id}`,
          title: promised
            ? '拒接承诺单'
            : trapAlreadyExposed && !order.isTrap
              ? '婉拒此单'
              : '识破 / 拒接',
          detail: rejectDetail,
          danger: rejectDanger,
          run: () => {
            if (order.isTrap) {
              exposeNightTrap(state, order);
            } else {
              rejectRealNightOrder(state, order, promised);
            }
          }
        },
        {
          id: 'back_to_night_board',
          title: '听另一位',
          detail: '放回夜账对照',
          presentation: 'control',
          run: () => {
            state.selectedNightOrderId = null;
            state.dialogueStep = 0;
          }
        },
        {
          id: 'replay_night_dialogue',
          title: '重听经过',
          detail: '细查破绽',
          presentation: 'control',
          run: () => {
            state.dialogueStep = 0;
          }
        }
      ];
    }
  }

  // 夜账待选列表：今夜所有叩门来客（竖向任务卡牌）
  const moves: ActionOption[] = [];
  for (const orderId of state.todayNightOrders) {
    const order = getNightOrderById(orderId);
    if (!order) continue;
    const rejected = state.rejectedNightOrderIds.includes(order.id);
    const heard = state.listenedOrderIds.includes(order.id);
    const promised = !order.isTrap && order.promisedKey === 'wu_d2' && state.promiseWu;
    const tag = promised
      ? '日接夜交'
      : !order.isTrap && order.peak
        ? '顶格夜单'
        : !order.isTrap && order.specialViral
          ? '奇诡特邀'
          : '夜客委托';
    moves.push({
      id: `pick_night_${order.id}`,
      title: order.title,
      detail: `${order.client} · 现+${order.pay} · 点+${order.ptsReward}`,
      primary: !rejected && !heard,
      reason: rejected ? (order.isTrap ? '已识破驱离' : '已婉拒离去') : '',
      presentation: 'card',
      card: {
        kind: 'night_order',
        tag,
        client: order.client.replace(/（[^）]*）/g, '').trim(),
        icon: pickNightOrderIcon(order),
        stats: [
          { label: '现金', value: `+${order.pay}`, tone: 'gain' },
          { label: '纸火点', value: `+${order.ptsReward}`, tone: 'pts' },
          ...(!order.isTrap && order.peak ? [{ label: '时限', value: '3回合', tone: 'warn' as const }] : [])
        ],
        statusStamp: rejected ? (order.isTrap ? '已破' : '已婉拒') : heard ? '已听' : undefined
      },
      run: () => {
        state.selectedNightOrderId = order.id;
        state.dialogueStep = heard ? Math.max(0, order.storyBeats.length - 1) : 0;
        markCharacterMet(state, getCharacterForNightOrder(order).id);
        state.message = heard
          ? `已听完「${order.client}」讲述。`
          : `${order.client}现身门外……`;
      }
    });
  }

  // 今夜一单都不接、直接死锁铺门（独立按钮区）
  const mainOrder = getActiveNightOrder(state);
  const mainPromised = mainOrder.promisedKey === 'wu_d2' && state.promiseWu;
  const allHandled =
    state.todayNightOrders.length > 0 &&
    state.todayNightOrders.every((id) => state.rejectedNightOrderIds.includes(id));
  moves.push({
    id: 'skip',
    title: '落闩收摊',
    detail: mainPromised
      ? '放弃承诺 · 次日抽查'
      : mainOrder.watched
        ? '硬拒大单 · 阴气+1'
        : allHandled
          ? '来客均已打发 · 收摊结账'
          : '今夜不接单',
    primary: allHandled,
    presentation: 'control',
    danger: mainPromised
      ? '今夜有白天已收订金的借面客单，直接闭门会记为失败并引来抽查。'
      : mainOrder.watched
        ? '今夜包含被盯/必核诡异单，直接闭门会让阴气 +1 并留下一笔把柄。'
        : undefined,
    run: () => settleNight(state, mainPromised ? 'failed' : 'refused')
  });

  return moves;
}
