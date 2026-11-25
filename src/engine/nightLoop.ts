import {
  NIGHT_ORDERS,
  buildTonightNightOrders,
  getNightOrderById,
  getScheduledNightOrder
} from '../data/night';
import { buildDailyQuests, FAVOR_CARDS } from '../data/systemShop';
import type { ActionOption, CardIconKind, GameState, NightOrderDef, NightOutcome } from '../data/types';
import { note, refreshDayOrders } from './state';
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
    default:
      return 'lantern';
  }
}

function getActiveNightOrder(state: GameState): NightOrderDef {
  if (state.activeNightOrderId && NIGHT_ORDERS[state.activeNightOrderId]) {
    return NIGHT_ORDERS[state.activeNightOrderId];
  }
  return getScheduledNightOrder(state.day, state.h);
}

export function computeInitialThreat(state: GameState, order: NightOrderDef): number {
  // 对齐设计稿 4.4 节公式：Threat0 = clamp(risk + clamp(floor(H/6), 0, 2) + (替代料 ? 1 : 0) - 铺面/信物减压, 1, 5)
  const yinBonus = Math.min(2, Math.floor(state.h / 6));
  const proxyBonus = state.usedProxyToday ? 1 : 0;
  const handleBonus = (order.id === 'n5_old_account' || order.id === 'n15_final_ledger') && state.handle > 0 ? 1 : 0;
  const bellBonus = state.upgrades.includes('copper_bell') ? 1 : 0;
  const maskBonus =
    order.id === 'n15_final_ledger' && state.tokens.some((t) => t.id === 'opera_mask_jade') ? 1 : 0;
  return Math.max(1, Math.min(5, order.risk + yinBonus + proxyBonus + handleBonus - bellBonus - maskBonus));
}

export function startSite(state: GameState): void {
  const order = getActiveNightOrder(state);
  state.phase = 'site';
  state.turns = order.turns;
  state.threat = computeInitialThreat(state, order);
  state.steps = [];
  state.message = order.siteIntro;
}

export function settleNight(state: GameState, result: NightOutcome): void {
  const order = getActiveNightOrder(state);
  state.outcomes[state.day] = result;
  const deposit = order.promisedKey === 'wu_d2' && state.promiseWu ? state.deposit : 0;

  if (result === 'success') {
    const due = Math.max(0, order.pay - deposit);
    const knotBonus = state.tokens.some((t) => t.id === 'crimson_knot') ? 6 : 0;
    const ptsGain = order.ptsReward + knotBonus;
    state.m += due;
    state.pts += ptsGain;
    state.h = Math.max(0, state.h - (order.peak ? 2 : 1));
    state.tn += order.peak ? 2 : 1;

    if (state.uneasy && !order.peak) {
      state.uneasyCleanDays += 1;
    }

    let extraText = '';
    if (order.tokenReward && !state.tokens.some((t) => t.id === order.tokenReward!.id)) {
      state.tokens.push(order.tokenReward);
      extraText += ` 获得信物「${order.tokenReward.name}」。`;
    }
    if (order.favorCardReward && !state.favorCards.includes(order.favorCardReward)) {
      state.favorCards.push(order.favorCardReward);
      extraText += ` 获得人情卡「${FAVOR_CARDS[order.favorCardReward].name}」。`;
    }
    state.lastSettleSummary = `${order.client}满意离去：结清 ${due} 现金，系统奖励 +${ptsGain} 纸火点，阴气 −${order.peak ? 2 : 1}，夜口碑 +${order.peak ? 2 : 1}。${extraText}`;
    note(state, state.lastSettleSummary);
  } else if (result === 'pressed') {
    const due = Math.max(0, Math.floor(order.pay / 2) - deposit);
    const halfPts = Math.floor(order.ptsReward / 2);
    state.m += due;
    state.pts += halfPts;
    state.f = Math.max(0, state.f - 2);
    state.handle += 1;
    state.lastSettleSummary = `${order.client}暂被按下：收 ${due} 现金、+${halfPts} 纸火点，消耗 2 人情，账上留下一笔把柄。`;
    note(state, state.lastSettleSummary);
  } else if (result === 'failed' || result === 'fled') {
    // 若持有系统兑换的「护身替纸人」且非主动逃跑，自动替劫保底一次！
    if (result === 'failed' && state.items.wardDoll > 0) {
      state.items.wardDoll -= 1;
      state.h += 1;
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
      state.lastSettleSummary = order.failNote;
      note(state, order.failNote);
    }
  } else if (result === 'refused') {
    if (order.watched) {
      state.h += 1;
      state.handle += 1;
      state.lastSettleSummary = `你硬把被盯的诡异客挡在门外：阴气 +1，账上记下一笔把柄。`;
    } else {
      state.lastSettleSummary = `你婉拒了「${order.title}」，这一笔从夜账待接栏划掉。`;
    }
    note(state, state.lastSettleSummary);
  }

  state.phase = 'settle';
  state.settleChoreDone = false;
  state.settleChosenId = null;
  syncAndClaimDailyQuests(state);
}

export function triggerNightTrap(state: GameState, trapOrder: NightOrderDef): void {
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;

  // 若持有系统兑换的「护身替纸人」，可在被骗出门的一瞬间自燃替死保命！
  if (state.items.wardDoll > 0) {
    state.items.wardDoll -= 1;
    state.h += 3;
    state.outcomes[state.day] = 'failed';
    state.phase = 'settle';
    state.settleChoreDone = false;
    state.settleChosenId = null;
    state.lastSettleSummary = `【诱杀惊魂 · 替纸人救主】你听信「${trapOrder.client}」跨出门槛半步，背后杀机骤起！千钧一发之际，袖中「护身替纸人」轰然自燃替你受死，生生把你拽回铺内（替纸人 −1，阴气 +3）。`;
    note(state, state.lastSettleSummary);
    syncAndClaimDailyQuests(state);
    return;
  }

  state.phase = 'bad_end';
  state.badEndReason = `【${trapOrder.trapKillTitle ?? '诡异诱杀'}】${trapOrder.trapKillNarrative ?? '你被门外诡异骗出铺门，未能再走回灯火之下。'}`;
  state.message = state.badEndReason;
  note(state, state.badEndReason);
}

export function exposeNightTrap(state: GameState, trapOrder: NightOrderDef): void {
  if (!state.rejectedNightOrderIds.includes(trapOrder.id)) {
    state.rejectedNightOrderIds.push(trapOrder.id);
    state.pts += 6;
    state.h = Math.max(0, state.h - 1);
  }
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;
  note(
    state,
    trapOrder.trapExposeText ?? '你识破门外诡异的诱杀骗局，死守门闩绝不跨出铺门（纸火点 +6，阴气 −1）。'
  );
  syncAndClaimDailyQuests(state);
}

export function dawn(state: GameState): void {
  const prevDay = state.day;
  const prevOrder = getActiveNightOrder(state);

  if (state.day >= state.maxDay) {
    state.phase = 'end';
    state.message = '';
    return;
  }

  // 沉香三足大炉被动：天亮自动净铺降阴
  if (state.upgrades.includes('jade_censer')) {
    state.h = Math.max(0, state.h - 1);
    state.c += 1;
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
    state.badEndReason =
      state.starveStreak >= 2
        ? '连续两日未能从初始系统兑换生存口粮，你在诡异小镇的浓雾中彻底耗尽精力，铺门悄然易主。'
        : state.h >= 20
          ? '铺面阴气冲破 20 红线，白昼不再降临，三盏红灯同时熄灭，规则清算降临。'
          : '顶格诡异失守叠加上回留下的「不对劲」，次日天明时纸扎铺只剩一地纸灰。';
    state.message = state.badEndReason;
    return;
  }

  state.day += 1;
  state.phase = 'day';
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
  state.restTonight = state.restNextNight;
  state.restNextNight = false;
  state.settleChoreDone = false;
  state.settleChosenId = null;
  state.watchedTonight = false;
  state.activeNightOrderId = null;
  state.dailyQuests = buildDailyQuests(state.day);

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

  if (starveNote) {
    note(state, starveNote);
  }

  refreshDayOrders(state);
  snapshotDayStart(state);
}

export function buildSettleShopMoves(state: GameState): ActionOption[] {
  const isLast = state.day >= state.maxDay;
  if (isLast) {
    return [
      {
        id: 'dawn',
        title: '合账，盘点这场生死经营',
        detail: '进入终局评级与系统清算',
        primary: true,
        presentation: 'control',
        run: () => dawn(state)
      }
    ];
  }

  const done = state.settleChoreDone;
  const chosenId = state.settleChosenId;
  const choreReason = (id: string, missing: string) =>
    done ? (chosenId === id ? '今日已定此项' : '今日已定收尾铺务') : missing;
  const stampFor = (id: string) => (done && chosenId === id ? '已定' : undefined);

  const chooseChore = (id: string, fn: () => void) => () => {
    fn();
    state.settleChoreDone = true;
    state.settleChosenId = id;
    syncAndClaimDailyQuests(state);
  };

  const moves: ActionOption[] = [
    {
      id: 'settle_clean_shop',
      title: '扫灰焚香净铺',
      detail: state.uneasy
        ? '纸料 −1 · 洁净 +2 · 阴气 −1 · 助消「不对劲」'
        : '纸料 −1 · 洁净 +2 · 阴气 −1',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '收尾铺务',
        client: state.uneasy ? '净铺消煞 · 驱散不对劲' : '扫尽香灰 · 压阴回净',
        icon: 'broom',
        stats: [
          { label: '纸料', value: '−1', tone: 'cost' },
          { label: '洁净', value: '+2', tone: 'gain' },
          { label: '阴气', value: '−1', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_clean_shop')
      },
      reason: choreReason('settle_clean_shop', state.s < 1 ? '纸料不足' : ''),
      run: chooseChore('settle_clean_shop', () => {
        state.s -= 1;
        state.c += 2;
        state.h = Math.max(0, state.h - 1);
        if (state.uneasy && state.uneasyCleanDays >= 1) {
          state.uneasy = false;
          state.uneasyCleanDays = 0;
          note(state, '收尾扫净香灰并走完洁净仪轨，铺里那股「不对劲」终于散尽。');
        } else {
          note(state, '收尾扫净柜台香灰并焚香净铺：洁净 +2，阴气 −1。');
        }
      })
    },
    {
      id: 'settle_tidy_free',
      title: '收拾残纸守铺',
      detail: '无消耗 · 洁净 +1 · 省料稳妥收尾',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '稳妥收尾',
        client: '归拢纸边 · 零消耗保底',
        icon: 'lantern',
        stats: [
          { label: '消耗', value: '免费', tone: 'pts' },
          { label: '洁净', value: '+1', tone: 'gain' }
        ],
        statusStamp: stampFor('settle_tidy_free')
      },
      reason: choreReason('settle_tidy_free', ''),
      run: chooseChore('settle_tidy_free', () => {
        state.c += 1;
        note(state, '把散落纸屑扫进竹筐、理齐柜台工具，静候天明（洁净 +1）。');
      })
    }
  ];

  // 雇佣 / 安抚伙计小栓
  if (!state.helper.hired) {
    moves.push({
      id: 'settle_hire_helper',
      title: '雇佣伙计 · 小栓',
      detail: '现金 −25 · 初始胆量 6（夜履约可搭手减压 −1）',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '铺面帮工',
        client: '街口小栓 · 明日上工搭手',
        icon: 'helper',
        stats: [
          { label: '现金', value: '−25', tone: 'cost' },
          { label: '胆量', value: '6/10', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_hire_helper')
      },
      reason: choreReason('settle_hire_helper', state.m < 25 ? '现金不足' : ''),
      run: chooseChore('settle_hire_helper', () => {
        state.m -= 25;
        state.helper.hired = true;
        state.helper.nerve = 6;
        note(state, '托人谈妥雇下小栓当帮工（胆量 6），明日夜里可喊他搭把手。');
      })
    });
  } else if (state.helper.nerve < 9) {
    moves.push({
      id: 'settle_calm_helper',
      title: `热汤安抚小栓`,
      detail: `现金 −10 · 胆量 +2（当前 ${state.helper.nerve}/10）`,
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '铺面帮工',
        client: `当前胆量 ${state.helper.nerve}/10 · 压惊恢复夜班`,
        icon: 'helper',
        stats: [
          { label: '现金', value: '−10', tone: 'cost' },
          { label: '胆量', value: '+2', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_calm_helper')
      },
      reason: choreReason('settle_calm_helper', state.m < 10 ? '现金不足' : ''),
      run: chooseChore('settle_calm_helper', () => {
        state.m -= 10;
        state.helper.nerve = Math.min(10, state.helper.nerve + 2);
        note(state, `收摊后给小栓煮了碗热汤压惊，胆量回升至 ${state.helper.nerve}/10。`);
      })
    });
  }

  // 具名人情卡 · 陈婶街坊圆场
  if (state.favorCards.includes('card_chen')) {
    moves.push({
      id: 'settle_use_card_chen',
      title: '动用人情卡 · 陈婶圆场',
      detail: '镇民信任 +2 · 彻底消解镇群传闻',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '人情善后',
        client: '请陈婶街口替铺子说好话',
        icon: 'rumor',
        stats: [
          { label: '信任', value: '+2', tone: 'gain' },
          { label: '传闻', value: '清零', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_use_card_chen')
      },
      reason: choreReason('settle_use_card_chen', ''),
      run: chooseChore('settle_use_card_chen', () => {
        state.favorCards = state.favorCards.filter((c) => c !== 'card_chen');
        state.ty += 2;
        state.rumor = false;
        state.calmDone = true;
        note(state, '动用陈婶人情卡替铺子圆场：镇民信任 +2，传闻彻底压平。');
      })
    });
  }

  // 花钱托人洗掉一笔把柄
  if (state.handle > 0) {
    moves.push({
      id: 'settle_wash_handle',
      title: '托人洗掉把柄',
      detail: '现金 −24 · 把柄 −1（本局限洗 1 次）',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '清账除刺',
        client: `当前留有 ${state.handle} 笔暗债`,
        icon: 'wash',
        stats: [
          { label: '现金', value: '−24', tone: 'cost' },
          { label: '把柄', value: '−1', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_wash_handle')
      },
      reason: choreReason(
        'settle_wash_handle',
        state.washedHandleThisRun ? '本局已洗过一次' : state.m < 24 ? '现金不足' : ''
      ),
      run: chooseChore('settle_wash_handle', () => {
        state.m -= 24;
        state.handle = Math.max(0, state.handle - 1);
        state.washedHandleThisRun = true;
        note(state, '连夜托镇上熟人把账上一笔把柄抹平了。');
      })
    });
  }

  // 高阴气或传闻时：预约明晚闭门歇铺
  const nextNightPreview = getScheduledNightOrder(Math.min(state.maxDay, state.day + 1), state.h);
  if (!nextNightPreview.peak && (state.h >= 10 || state.rumor)) {
    moves.push({
      id: 'settle_plan_rest',
      title: '预约明晚闭门歇铺',
      detail: '无消耗 · 阴气 −2 · 明晚阴气 < 12 时直接平安歇夜',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '止损休整',
        client: '挂出歇业木牌 · 稳住阴气',
        icon: 'rest',
        stats: [
          { label: '阴气', value: '−2', tone: 'pts' },
          { label: '明夜', value: '闭门歇铺', tone: 'gain' }
        ],
        statusStamp: stampFor('settle_plan_rest')
      },
      reason: choreReason('settle_plan_rest', ''),
      run: chooseChore('settle_plan_rest', () => {
        state.h = Math.max(0, state.h - 2);
        state.restNextNight = true;
        note(state, '提前挂好明晚歇业木牌并净心收铺：阴气 −2，明晚若阴气 < 12 将直接平安歇夜。');
      })
    });
  }

  moves.push({
    id: 'dawn',
    title: '迎接明日天明',
    detail: done ? '核验今日存活 · 结算口粮' : '请先在左侧选定 1 项铺务决策',
    primary: done,
    presentation: 'control',
    reason: done ? '' : '先择一项铺务收尾决策',
    run: () => dawn(state)
  });

  return moves;
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
      const acceptDetail = promised
        ? `尾款+${order.pay - state.deposit} · 点+${order.ptsReward} · 局面 ${computeInitialThreat(state, order)}`
        : order.isTrap
          ? `现+${order.pay} · 点+${order.ptsReward} · 照对方要求办`
          : `现+${order.pay} · 点+${order.ptsReward} · 局面 ${computeInitialThreat(state, order)}${order.peak ? ' · 3回合' : ''}`;

      const rejectDanger = promised
        ? '这笔单白天已收吴支书订金。若现在拒接会记为失约失败，且次日镇里要来抽查。'
        : !order.isTrap && order.watched
          ? '这是系统标记的被盯/必核大单。硬拒会让阴气 +1，并在账上留下一笔把柄。'
          : undefined;

      const rejectDetail = promised
        ? '失约失败 · 次日抽查'
        : !order.isTrap && order.watched
          ? '被盯大单 · 阴气+1 留把柄'
          : '疑有破绽 · 严词拒接守门';

      return [
        {
          id: `accept_night_${order.id}`,
          title: order.peak && !order.isTrap ? '接单 · 顶格履约' : '接下此单',
          detail: acceptDetail,
          primary: true,
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
          title: promised ? '拒接承诺单' : '识破 / 拒接',
          detail: rejectDetail,
          danger: rejectDanger,
          run: () => {
            if (order.isTrap) {
              exposeNightTrap(state, order);
            } else {
              state.activeNightOrderId = order.id;
              state.selectedNightOrderId = null;
              state.dialogueStep = 0;
              settleNight(state, promised ? 'failed' : 'refused');
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
    const tag = promised ? '日接夜交' : !order.isTrap && order.peak ? '顶格夜单' : '夜客委托';
    moves.push({
      id: `pick_night_${order.id}`,
      title: order.title,
      detail: `${order.client} · 现+${order.pay} · 点+${order.ptsReward}`,
      primary: !rejected && !heard,
      reason: rejected ? '已识破驱离' : '',
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
        statusStamp: rejected ? '已破' : heard ? '已听' : undefined
      },
      run: () => {
        state.selectedNightOrderId = order.id;
        state.dialogueStep = heard ? Math.max(0, order.storyBeats.length - 1) : 0;
        state.message = heard
          ? `已听完「${order.client}」讲述。`
          : `${order.client}现身门外……`;
      }
    });
  }

  // 今夜一单都不接、直接死锁铺门（独立按钮区）
  const mainOrder = getActiveNightOrder(state);
  const mainPromised = mainOrder.promisedKey === 'wu_d2' && state.promiseWu;
  moves.push({
    id: 'skip',
    title: '落闩收摊',
    detail: mainPromised
      ? '放弃承诺 · 次日抽查'
      : mainOrder.watched
        ? '硬拒大单 · 阴气+1'
        : '今夜不接单',
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

export function buildSiteMoves(state: GameState): ActionOption[] {
  const order = getActiveNightOrder(state);
  const has = (step: string) => state.steps.includes(step);
  const boltBonus = state.upgrades.includes('iron_bolt') ? 1 : 0;
  const lowerThreat = (amount: number) => {
    state.threat = Math.max(0, state.threat - amount);
  };
  const recordStep = (step: string, text: string, threatDelta = 0) => {
    if (!state.steps.includes(step)) state.steps.push(step);
    if (threatDelta) lowerThreat(threatDelta);
    note(state, text);
  };

  const siteAction = (
    id: string,
    title: string,
    detail: string,
    next: () => void,
    reason = ''
  ): ActionOption => ({
    id,
    title,
    detail,
    reason,
    run: () => {
      next();
      state.turns -= 1;
      if (state.steps.includes('done') && state.threat <= 0) {
        settleNight(state, 'success');
      } else if (state.turns <= 0) {
        settleNight(state, 'failed');
      }
    }
  });

  const finishReason = (reqStep: string, missingMsg: string) => {
    if (!has(reqStep)) return missingMsg;
    if (state.threat > 0) return '先把局面压到 0';
    return '';
  };

  let moves: ActionOption[] = [];

  if (order.id === 'n1_alley_sendoff') {
    moves = [
      siteAction(
        'place-horse',
        '把白纸马摆正向',
        '局面 −1 · 不问姓氏',
        () => recordStep('place_horse', '你没多问，把白纸马朝巷口摆正了。', 1),
        has('place_horse') ? '纸马已摆正' : ''
      ),
      siteAction(
        'deliver',
        '送行交差',
        '完成交付 · 领系统奖励',
        () => recordStep('done', '门外阴风骤停，留下一沓整整齐齐的现钱。'),
        finishReason('place_horse', '先摆正白纸马')
      )
    ];
  } else if (order.id === 'n2_wu_plain') {
    moves = [
      siteAction(
        'quiet-phone',
        '扣灭发烫的录音手机',
        '局面 −1',
        () => recordStep('quiet', '你反手把手机扣死在柜台上，红点熄灭了。', 1),
        has('quiet') ? '手机已扣灭' : ''
      ),
      siteAction(
        'identify',
        '请借面诡客指认纸牌',
        '局面 −1',
        () => recordStep('identified', '借面客伸出僵白手指，点了点桌上的替身纸牌。', 1),
        has('identified') ? '已指认' : !has('quiet') ? '先扣灭录音手机' : ''
      ),
      siteAction(
        'deliver',
        '把替身纸牌交给借面客',
        '完成交付',
        () => recordStep('done', '纸牌一入手，门外的轮廓立刻淡成一缕青烟。'),
        finishReason('identified', '先请借面客指认纸牌')
      )
    ];
  } else if (order.id === 'n3_third_lamp') {
    const seatReason = () => {
      if (has('seated')) return '纸人已经安座';
      if (!has('lamp')) return '先稳住第三盏灯';
      return '';
    };
    moves = [
      siteAction(
        'use-strip',
        '用窄纸带封灯并安座',
        '窄纸带 ×1 · 洁净 −1 · 局面 −2',
        () => {
          state.items.strip -= 1;
          state.c -= 1;
          state.steps.push('lamp');
          recordStep('seated', '窄纸带锁住了开关，红袍纸人也顺势坐稳回凳。', 2);
        },
        state.items.strip < 1
          ? '白天找柳裁缝打听后可备窄纸带'
          : state.turns !== order.turns
            ? '须用于第一手'
            : state.c < 4
              ? '洁净至少需要 4'
              : ''
      ),
      siteAction(
        'guard',
        '请阿杰守开关',
        '稳住第三盏灯',
        () => recordStep('lamp', '阿杰死死按住门外开关，第三盏灯仍旧没亮。'),
        has('lamp') ? '灯已稳住' : ''
      ),
      siteAction(
        'seat',
        '正统安座',
        '洁净 −1 · 局面 −2',
        () => {
          state.c -= 1;
          recordStep('seated', '照正统手法压纸安座，纸人垂下了眼帘。', 2);
        },
        seatReason() || (state.c < 4 ? '洁净至少需要 4' : '')
      ),
      siteAction(
        'improvise',
        '临时安座（歪办）',
        '局面 −1 · 阴气 +1',
        () => {
          state.h += 1;
          recordStep('seated', '纸人坐下去了，屋里却冷了一截。', 1);
        },
        seatReason()
      ),
      siteAction(
        'seal',
        '封门交差',
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', '封门符拍稳，第三盏灯始终没有亮。', boltBonus),
        finishReason('seated', '先让纸人安座')
      )
    ];
  } else if (order.id === 'n4_cross_alley') {
    moves = [
      siteAction(
        'incense',
        '按旧例点定神香',
        '洁净 −1 · 局面 −2',
        () => {
          state.c -= 1;
          recordStep('incense', '三支定神香立稳，门槛黑水不再往前漫。', 2);
        },
        has('incense') ? '定神香已点' : state.c < 2 ? '洁净至少需要 2' : ''
      ),
      siteAction(
        'escort',
        '背身把黑伞送出门槛',
        '局面 −1 · 不回头',
        () => recordStep('escort', '你盯着门槛绝不回头，湿透的黑伞被轻轻接走了。', 1),
        has('escort') ? '已送出门' : !has('incense') ? '先点定神香' : ''
      ),
      siteAction(
        'seal',
        '落闩交差',
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', '门闩落稳，巷口彻底静了下来。', boltBonus),
        finishReason('escort', '先把伞送出门槛')
      )
    ];
  } else if (order.id === 'n4_watched_door') {
    moves = [
      siteAction(
        'ward-door',
        '贴镇门敕令（不应答）',
        `纸料 −1 · 洁净 −1 · 局面 −${2 + boltBonus}`,
        () => {
          state.s -= 1;
          state.c -= 1;
          recordStep('ward_door', '你一声未吭，把镇门敕令拍死在门缝上。', 2 + boltBonus);
        },
        has('ward_door')
          ? '镇门敕令已贴'
          : state.s < 1
            ? '缺纸料'
            : state.c < 1
              ? '洁净不足'
              : ''
      ),
      siteAction(
        'seal',
        '落闩驱离',
        '完成交付',
        () => recordStep('done', '门缝外的惨白视线退去了，门闩稳稳落定。'),
        finishReason('ward_door', '先贴镇门敕令')
      )
    ];
  } else if (order.id === 'n5_old_account' || order.id === 'n15_final_ledger') {
    moves = [
      siteAction(
        'audit-ledger',
        order.id === 'n15_final_ledger' ? '呈交十五日阴阳总账' : '摊开五日夜账对簿',
        '局面 −2 · 如实核对',
        () =>
          recordStep(
            'audit_ledger',
            order.id === 'n15_final_ledger'
              ? '你把十五日活人与诡异两本账一齐摊开，纸马童微微颔首。'
              : '你把五天来的阴阳两页摊在灯下，阴差点头认账。',
            2
          ),
        has('audit_ledger') ? '已对簿核清' : ''
      ),
      siteAction(
        'calm-flame',
        '定住铺里三盏灯火',
        '洁净 −1 · 局面 −2',
        () => {
          state.c -= 1;
          recordStep('calm_flame', '灯芯剪齐，三盏朱砂红灯稳稳亮着。', 2);
        },
        has('calm_flame')
          ? '灯火已稳'
          : !has('audit_ledger')
            ? '先摊账对簿'
            : state.c < 2
              ? '洁净至少需要 2'
              : ''
      ),
      siteAction(
        'deliver',
        order.id === 'n15_final_ledger' ? '落朱砂总印通关' : '盖章结清五日旧账',
        '完成交付',
        () =>
          recordStep(
            'done',
            order.id === 'n15_final_ledger'
              ? '朱砂总印落下，初始系统弹出「十五日考核通过」金红篆文！'
              : '朱砂印落定，旧账阴差收单告辞。'
          ),
        finishReason('calm_flame', '先定住灯火')
      )
    ];
  } else {
    // D6–D14 通用高精度诡异履约（含 D6 / D10 / D13 顶格夜正统/歪办分流）
    const mainStep = order.steps[0];
    const doneStep = order.steps[order.steps.length - 1];
    moves = [
      siteAction(
        'rite-orthodox',
        `正统仪轨 · ${mainStep.label}`,
        `纸料 −1 · 洁净 −1 · 局面 −${order.peak ? 3 : 2}`,
        () => {
          state.s -= 1;
          state.c -= 1;
          recordStep('rite_main', `你严守「${order.taboo}」，以正统仪轨办妥「${mainStep.label}」。`, order.peak ? 3 : 2);
        },
        has('rite_main')
          ? `已完成「${mainStep.label}」`
          : state.s < 1
            ? '缺纸料'
            : state.c < (order.peak ? 3 : 2)
              ? `正统仪轨需洁净 ≥ ${order.peak ? 3 : 2}`
              : ''
      ),
      siteAction(
        'rite-improvise',
        `应急歪办 · ${mainStep.label}`,
        '局面 −1 · 阴气 +1（洁净不足时兜底）',
        () => {
          state.h += 1;
          recordStep('rite_main', `勉强以歪办糊弄完「${mainStep.label}」，屋里阴气沉了一截。`, 1);
        },
        has('rite_main') ? `已完成「${mainStep.label}」` : ''
      ),
      siteAction(
        'seal',
        doneStep.label,
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', `${order.client}收妥纸活，悄无声息退入夜色。`, boltBonus),
        finishReason('rite_main', `先完成「${mainStep.label}」`)
      )
    ];
  }

  // P0 系统兑换专属保命道具：护身替纸人（局面 -3！）
  if (state.items.wardDoll > 0) {
    moves.push(
      siteAction(
        'use-ward-doll',
        '祭出护身替纸人镇压',
        `替纸人 ×1（剩 ${state.items.wardDoll}） · 局面 −3`,
        () => {
          state.items.wardDoll -= 1;
          lowerThreat(3);
          note(state, '系统兑换的护身替纸人迎风立起，硬生生压平了屋里大半诡气！');
        },
        state.threat <= 0 ? '局面已稳' : ''
      )
    );
  }

  // 通用道具：安神纸符
  if (state.items.talisman > 0) {
    moves.push(
      siteAction(
        'use-talisman',
        '亮出安神纸符压阵',
        `安神纸符 ×1（剩 ${state.items.talisman}） · 局面 −2`,
        () => {
          state.items.talisman -= 1;
          lowerThreat(2);
          note(state, '朱砂安神纸符镇住了屋里大半动静。');
        },
        state.threat <= 0 ? '局面已稳' : ''
      )
    );
  }

  // P2 #11 具名人情卡：请柳裁缝出面 / 纸马童引路带门
  if (state.favorCards.includes('card_liu')) {
    moves.push(
      siteAction(
        'use-card-liu',
        '动用人情卡 · 请柳裁缝出面',
        '消耗人情卡 · 局面 −3（顶格夜利器）',
        () => {
          state.favorCards = state.favorCards.filter((c) => c !== 'card_liu');
          lowerThreat(3);
          note(state, '柳裁缝隔门喝破一句老行规，屋里的诡异气场骤然矮了三分！');
        },
        state.threat <= 0 ? '局面已稳' : ''
      )
    );
  }

  if (state.favorCards.includes('card_boy')) {
    moves.push(
      siteAction(
        'use-card-boy',
        '动用人情卡 · 纸马童引路带门',
        '消耗人情卡 · 局面 −2 · 自动推进当前前置步骤',
        () => {
          state.favorCards = state.favorCards.filter((c) => c !== 'card_boy');
          lowerThreat(2);
          const pending = order.steps.find((st) => st.key !== 'done' && !has(st.key));
          if (pending) state.steps.push(pending.key);
          note(state, '纸马童悄无声息上前递过纸活，替你直接压过了最棘手的一步！');
        }
      )
    );
  }

  // P2 #11 伙计小栓夜班搭手（胆量 <= 2 拒夜班！）
  if (state.helper.hired) {
    moves.push(
      siteAction(
        'helper-assist',
        `喊伙计小栓搭把手（胆量 ${state.helper.nerve}）`,
        '不耗纸料 · 局面 −1 · 伙计胆量 −1',
        () => {
          state.helper.nerve = Math.max(0, state.helper.nerve - 1);
          lowerThreat(1);
          note(state, `小栓咬牙替你稳住门框与香火（局面 −1，胆量降至 ${state.helper.nerve}）。`);
        },
        state.helper.nerve <= 2
          ? '小栓吓得发抖，拒上夜班（白天铺务须安抚）'
          : state.threat <= 0
            ? '局面已稳'
            : ''
      )
    );
  }

  moves.push(
    siteAction(
      'use-paper',
      '用净纸稳住局面',
      '纸料 −1 · 局面 −1',
      () => {
        state.s -= 1;
        lowerThreat(1);
        note(state, '净纸压住了动静。');
      },
      state.threat <= 0 ? '局面已稳' : state.s < 1 ? '缺净纸' : ''
    ),
    {
      id: 'press',
      title: '托人压下',
      detail: '人情 −2 · 半报酬 · 留把柄',
      reason: state.f < 2 ? '人情不足' : '',
      danger: '这笔单拿一半报酬，消耗 2 人情并在账上留下一笔把柄。',
      run: () => settleNight(state, 'pressed')
    },
    {
      id: 'flee',
      title: '离开现场',
      detail: '按失败结算 · 夜口碑 −1',
      danger: '现在离开会按普通失败结算，夜口碑另减 1。',
      run: () => settleNight(state, 'fled')
    }
  );

  return moves;
}
