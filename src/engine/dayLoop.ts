import { buildTonightNightOrders, getScheduledNightOrder } from '../data/night';
import { ORDER_BY_ID } from '../data/orders';
import { STREET_SUPPLIES } from '../data/street';
import type { ActionOption, CardIconKind, CraftMode, DayOrderDef, GameState } from '../data/types';
import { note } from './state';
import { syncAndClaimDailyQuests } from './systemEngine';

function pickDayOrderIcon(order: DayOrderDef): CardIconKind {
  if (order.id.includes('horse')) return 'horse';
  if (order.id.includes('wu') || order.id.includes('doorgod')) return 'plaque';
  if (order.id.includes('charm') || order.id.includes('li_house')) return 'charm';
  if (order.id.includes('opera')) return 'opera';
  if (order.id.includes('dragon')) return 'deity';
  return 'lantern';
}

function shortClientName(client: string): string {
  return client.replace(/（[^）]*）/g, '').trim();
}

export function costReason(state: GameState, ap: number, material = 0, cash = 0): string {
  if (state.ap < ap) return '工时不足';
  if (state.s < material) return '纸料不足';
  if (state.m < cash) return '现金不足';
  return '';
}

export function fulfillDayOrder(state: GameState, order: DayOrderDef, mode: CraftMode): void {
  let apCost = order.apCost;
  let needS = order.needS;
  let pay = order.dayToNight ? order.dayToNight.deposit : order.payBase;
  let tyGain = order.tyReward;
  let cDelta = 0;
  let hDelta = 0;
  let modeLabel = '标准工艺';

  if (state.audit && !order.dayToNight && !order.reliefOnly) {
    pay = Math.max(8, Math.round(pay * 0.78));
  }

  if (mode === 'rush') {
    apCost = Math.max(1, order.apCost - 1);
    cDelta = -1;
    modeLabel = '赶工省时';
  } else if (mode === 'fine') {
    needS = order.needS + 1;
    cDelta = 1;
    tyGain += 1;
    pay += 4;
    modeLabel = '精工加净';
  } else if (mode === 'proxy') {
    needS = 0;
    tyGain = Math.max(-1, tyGain - 1);
    hDelta = 1;
    state.usedProxyToday = true;
    modeLabel = '替代料应急';
  }

  state.ap = Math.max(0, state.ap - apCost);
  state.s = Math.max(0, state.s - needS);
  state.m += pay;
  state.c = Math.max(0, state.c + cDelta);
  state.h = Math.max(0, state.h + hDelta);
  state.ty = Math.max(0, state.ty + tyGain);

  const ptsBonus = (order.ptsReward ?? 4) + (mode === 'fine' ? 2 : 0);
  state.pts += ptsBonus;

  if (!state.completedOrders.includes(order.id)) {
    state.completedOrders.push(order.id);
  }
  if (order.reliefOnly) {
    state.reliefDone = true;
  }
  if (order.dayToNight) {
    state.promiseWu = true;
    state.deposit = order.dayToNight.deposit;
  }
  state.selectedOrderId = null;
  state.dialogueStep = 0;

  const extra = order.dayToNight
    ? '，今夜借面诡客已记入夜账。'
    : mode === 'proxy'
      ? '，用了替代料，街坊略有挑刺，今夜诡异风险抬高一截。'
      : mode === 'fine'
        ? '，活计敞亮，洁净、口碑与系统赏金一并见长。'
        : '。';
  note(state, `以「${modeLabel}」满足活人订单「${order.title}」，收 ${pay} 现金、+${ptsBonus} 纸火点${extra}`);
  syncAndClaimDailyQuests(state);
}

export function flipToNight(state: GameState): void {
  state.phase = 'board';
  state.selectedOrderId = null;
  state.selectedNightOrderId = null;
  state.dialogueStep = 0;
  state.rejectedNightOrderIds = [];
  const scheduled = getScheduledNightOrder(state.day, state.h);
  state.watchedTonight = Boolean(scheduled.watched);
  state.activeNightOrderId = scheduled.id;
  state.todayNightOrders = buildTonightNightOrders(state.day, state.h);

  if (state.restTonight && state.h < 12 && !scheduled.peak) {
    state.outcomes[state.day] = 'rested';
    state.phase = 'settle';
    state.settleChoreDone = false;
    state.settleChosenId = null;
    state.lastSettleSummary = '你早早落锁熄灯，今夜没有承接普通诡异单，屋里安稳到天亮。';
    note(state, '铺门早早落锁，今夜闭门歇了一晚。');
    syncAndClaimDailyQuests(state);
    return;
  }
  note(state, '活人散尽，落锁翻开夜账。门外响起不同叩门声，请先逐位听清来意再接单。');
}

export function buildDayOrderMoves(state: GameState): ActionOption[] {
  if (state.selectedOrderId) {
    const order = ORDER_BY_ID[state.selectedOrderId];
    if (!order || state.completedOrders.includes(order.id)) {
      state.selectedOrderId = null;
      state.dialogueStep = 0;
    } else {
      const totalBeats = Math.max(1, order.storyBeats.length);
      const stepIdx = Math.max(0, Math.min(state.dialogueStep, totalBeats - 1));
      const finished = stepIdx >= totalBeats - 1;

      if (!finished) {
        return [
          {
            id: 'advance_dialogue',
            title: `继续听下去（${stepIdx + 2}/${totalBeats}）`,
            detail: '听完经过后再决定接不接单',
            primary: true,
            run: () => {
              state.dialogueStep = Math.min(totalBeats - 1, state.dialogueStep + 1);
              if (state.dialogueStep >= totalBeats - 1 && !state.listenedOrderIds.includes(order.id)) {
                state.listenedOrderIds.push(order.id);
              }
            }
          },
          {
            id: 'back_to_orders',
            title: '放回单子',
            detail: '返回柜台选单',
            presentation: 'control',
            run: () => {
              state.selectedOrderId = null;
              state.dialogueStep = 0;
            }
          }
        ];
      }

      if (!state.listenedOrderIds.includes(order.id)) {
        state.listenedOrderIds.push(order.id);
      }

      const basePay = order.dayToNight
        ? order.dayToNight.deposit
        : state.audit && !order.reliefOnly
          ? Math.max(8, Math.round(order.payBase * 0.78))
          : order.payBase;
      const rushAp = Math.max(1, order.apCost - 1);
      const canRush = order.apCost > 1 && !order.reliefOnly;
      const canFine = !order.reliefOnly;
      const canProxy = order.needS > 0 && !order.reliefOnly;
      const basePts = order.ptsReward ?? 4;

      const moves: ActionOption[] = [
        {
          id: `craft_std_${order.id}`,
          title: order.dayToNight ? '接单 · 收订金' : '普通工艺',
          detail: `工时−${order.apCost}${order.needS ? ` · 料−${order.needS}` : ' · 自带料'} · 现+${basePay} · 点+${basePts}`,
          primary: true,
          reason:
            costReason(state, order.apCost, order.needS) ||
            (order.needC && state.c < order.needC ? `洁净≥${order.needC}` : ''),
          run: () => fulfillDayOrder(state, order, 'standard')
        }
      ];

      if (canRush) {
        moves.push({
          id: `craft_rush_${order.id}`,
          title: '赶工省时',
          detail: `工时−${rushAp} · 料−${order.needS} · 洁净−1 · 现+${basePay}`,
          reason: costReason(state, rushAp, order.needS) || (state.c < 1 ? '洁净不足' : ''),
          run: () => fulfillDayOrder(state, order, 'rush')
        });
      }

      if (canFine) {
        moves.push({
          id: `craft_fine_${order.id}`,
          title: '精工加净',
          detail: `工时−${order.apCost} · 料−${order.needS + 1} · 洁净+1 · 现+${basePay + 4} · 点+${basePts + 2}`,
          reason: costReason(state, order.apCost, order.needS + 1),
          run: () => fulfillDayOrder(state, order, 'fine')
        });
      }

      if (canProxy) {
        moves.push({
          id: `craft_proxy_${order.id}`,
          title: '替代料应急',
          detail: `工时−${order.apCost} · 免料 · 阴气+1 · 夜局面+1`,
          danger: '使用替代料应急不耗纸料，但会抬高阴气，且今夜诡异履约初始局面 +1。确定如此交货？',
          reason: costReason(state, order.apCost, 0),
          run: () => fulfillDayOrder(state, order, 'proxy')
        });
      }

      moves.push(
        {
          id: 'back_to_orders',
          title: '不接此单',
          detail: '放回柜台',
          presentation: 'control',
          run: () => {
            state.selectedOrderId = null;
            state.dialogueStep = 0;
          }
        },
        {
          id: 'replay_dialogue',
          title: '重听经过',
          detail: '从头复听',
          presentation: 'control',
          run: () => {
            state.dialogueStep = 0;
          }
        }
      );
      return moves;
    }
  }

  const moves: ActionOption[] = [];
  for (const orderId of state.todayOrders) {
    const order = ORDER_BY_ID[orderId];
    if (!order) continue;
    const done = state.completedOrders.includes(order.id);
    const heard = state.listenedOrderIds.includes(order.id);
    const payVal = order.dayToNight
      ? order.dayToNight.deposit
      : state.audit && !order.reliefOnly
        ? Math.max(8, Math.round(order.payBase * 0.78))
        : order.payBase;
    const tag = order.dayToNight ? '日接夜交' : order.reliefOnly ? '止损单' : '活人委托';
    const cardStats: Array<{ label: string; value: string; tone?: 'cost' | 'gain' | 'pts' | 'warn' }> = [
      { label: '工时', value: `−${order.apCost}`, tone: 'cost' },
      { label: '纸料', value: order.needS ? `−${order.needS}` : '自带', tone: order.needS ? 'cost' : 'gain' },
      { label: order.dayToNight ? '订金' : '现金', value: `+${payVal}`, tone: 'gain' },
      { label: '纸火点', value: `+${order.ptsReward ?? 4}`, tone: 'pts' }
    ];
    if (order.needC) {
      cardStats.push({ label: '洁净', value: `≥${order.needC}`, tone: 'warn' });
    }
    moves.push({
      id: `pick_${order.id}`,
      title: order.title,
      detail: `${shortClientName(order.client)} · ${done ? '已交货' : heard ? '已听经过' : '点卡听讲述'}`,
      reason: done ? '今日已交货' : '',
      presentation: 'card',
      card: {
        kind: 'day_order',
        tag,
        client: shortClientName(order.client),
        icon: pickDayOrderIcon(order),
        stats: cardStats,
        statusStamp: done ? '已办' : heard ? '已听' : undefined
      },
      run: () => {
        state.selectedOrderId = order.id;
        state.dialogueStep = heard ? Math.max(0, order.storyBeats.length - 1) : 0;
        state.message = heard
          ? `已听清${shortClientName(order.client)}诉求。`
          : `${shortClientName(order.client)}走进铺门……`;
      }
    });
  }

  const nightPreview = getScheduledNightOrder(state.day, state.h);
  const nightDetail =
    state.day === 2 && state.promiseWu
      ? '今夜已约借面客'
      : state.day === 3 && state.items.strip > 0
        ? '已备窄纸带'
        : state.restTonight && state.h < 12 && !nightPreview.peak
          ? '闭门歇铺度夜'
          : nightPreview.peak
            ? '顶格夜 · 3 回合'
            : '翻开夜账迎客';

  moves.push({
    id: 'night',
    title: '落锁入夜',
    detail: nightDetail,
    primary: true,
    presentation: 'control',
    run: () => flipToNight(state)
  });

  return moves;
}

export function buildStreetMoves(state: GameState): ActionOption[] {
  const moves: ActionOption[] = [];
  const supplyLimitReached = state.streetSupplyUses >= 2;
  const intelLimitReached = state.streetIntelUses >= 2;
  const informedToday = state.informedDays.includes(state.day);

  for (const sup of STREET_SUPPLIES) {
    const isClinic = sup.id === 'supply_lin_clean';
    const stats: Array<{ label: string; value: string; tone?: 'cost' | 'gain' | 'pts' | 'warn' }> = [
      { label: '工时', value: `−${sup.costAp}`, tone: 'cost' },
      { label: '现金', value: `−${sup.costM}`, tone: 'cost' },
      { label: '纸料', value: `+${sup.gainS}`, tone: 'gain' }
    ];
    if (sup.gainC > 0) stats.push({ label: '洁净', value: `+${sup.gainC}`, tone: 'pts' });

    moves.push({
      id: sup.id,
      title: sup.title,
      detail: sup.detail,
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: sup.vendor,
        client: isClinic ? '林医生诊所 · 洁净药纸' : '镇集杂货摊 · 补给库存',
        icon: isClinic ? 'clinic' : 'supply',
        stats,
        statusStamp: supplyLimitReached ? '限额' : undefined
      },
      reason: supplyLimitReached
        ? '今日进货已达 2 次上限'
        : costReason(state, sup.costAp, 0, sup.costM),
      run: () => {
        state.ap -= sup.costAp;
        state.m -= sup.costM;
        state.s += sup.gainS;
        state.c += sup.gainC;
        state.streetSupplyUses += 1;
        note(state, `在${sup.vendor}补了货：纸料 +${sup.gainS}${sup.gainC ? `，洁净 +${sup.gainC}` : ''}。`);
      }
    });
  }

  const nightOrder = getScheduledNightOrder(state.day, state.h);
  moves.push({
    id: 'inquire_liu',
    title: '向柳裁缝打听今夜禁忌',
    detail:
      state.day === 3
        ? '工时 −1 · 揭开第三盏灯禁忌并学会裁窄纸带'
        : '工时 −1 · 核实今夜诡异禁忌并解锁破绽提示',
    presentation: 'card',
    card: {
      kind: 'street_spot',
      tag: '柳记裁缝铺',
      client: '柳裁缝 · 问忌识破绽',
      icon: 'tailor',
      stats: [
        { label: '工时', value: '−1', tone: 'cost' },
        { label: '情报', value: '破绽提点', tone: 'pts' }
      ],
      statusStamp: informedToday ? '已问' : undefined
    },
    primary: !informedToday && state.day === 3,
    reason: informedToday ? '今天已打听清楚' : intelLimitReached ? '今日打听已达上限' : costReason(state, 1),
    run: () => {
      state.ap -= 1;
      state.streetIntelUses += 1;
      state.informedDays.push(state.day);
      if (state.day === 5) state.d6Previewed = true;
      note(state, `柳裁缝点破了今夜诡异忌讳：「${nightOrder.taboo}」`);
    }
  });

  if (state.day === 3) {
    moves.push({
      id: 'prepare_strip',
      title: '裁一条窄纸带',
      detail: '工时 −1 · 纸料 −1 · 今夜第一手封灯并安座',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '柳记裁缝铺',
        client: '裁缝铺案台 · 专克第三盏灯',
        icon: 'scissors',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '纸料', value: '−1', tone: 'cost' },
          { label: '窄纸带', value: '+1', tone: 'gain' }
        ],
        statusStamp: state.items.strip > 0 ? '已备' : undefined
      },
      reason:
        state.items.strip > 0
          ? '已备好窄纸带'
          : !informedToday
            ? '先向柳裁缝打听怎么备料'
            : costReason(state, 1, 1),
      run: () => {
        state.ap -= 1;
        state.s -= 1;
        state.items.strip += 1;
        note(state, '窄纸带折好，夹进了夜里那本账。');
      }
    });
  } else {
    moves.push({
      id: 'craft_talisman',
      title: '预折安神纸符',
      detail: '工时 −1 · 纸料 −1 · 夜履约可用（局面 −2）',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '柳记裁缝铺',
        client: `借朱砂案折符 · 现有 ×${state.items.talisman}`,
        icon: 'charm',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '纸料', value: '−1', tone: 'cost' },
          { label: '局面', value: '−2', tone: 'pts' }
        ],
        statusStamp: state.items.talisman >= 3 ? '已满' : undefined
      },
      reason: state.items.talisman >= 3 ? '手头已备足 3 张纸符' : costReason(state, 1, 1),
      run: () => {
        state.ap -= 1;
        state.s -= 1;
        state.items.talisman += 1;
        note(state, '提前折好一张朱砂安神纸符，留着夜里压局面用。');
      }
    });
  }

  if (state.rumor && state.day === 4) {
    moves.push({
      id: 'calm_rumor',
      title: '请阿杰镇群圆场',
      detail: '工时 −1 · 现金 −8 · 镇民信任 +1',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '老槐街口',
        client: '阿杰 · 压平镇群闲话',
        icon: 'rumor',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '现金', value: '−8', tone: 'cost' },
          { label: '信任', value: '+1', tone: 'pts' }
        ],
        statusStamp: state.calmDone ? '已圆场' : undefined
      },
      reason: state.calmDone ? '今天已经圆过场' : costReason(state, 1, 0, 8),
      run: () => {
        state.ap -= 1;
        state.m -= 8;
        state.ty += 1;
        state.calmDone = true;
        note(state, '阿杰在镇群里接了句圆场话，街坊对铺子松了点口风。');
      }
    });
  }

  moves.push({
    id: 'return_to_shop',
    title: '返回纸扎铺',
    detail: '回柜台接单或落锁',
    primary: true,
    presentation: 'control',
    run: () => {
      state.dayTab = 'orders';
      state.selectedOrderId = null;
      state.dialogueStep = 0;
    }
  });

  return moves;
}

export function buildShopMoves(state: GameState): ActionOption[] {
  const moves: ActionOption[] = [
    {
      id: 'clean_shop',
      title: '扫灰焚香净铺',
      detail: state.uneasy
        ? '工时 −1 · 纸料 −1 · 洁净 +2 · 阴气 −1 · 助消「不对劲」'
        : '工时 −1 · 纸料 −1 · 洁净 +2 · 阴气 −1',
      reason: costReason(state, 1, 1),
      run: () => {
        state.ap -= 1;
        state.s -= 1;
        state.c += 2;
        state.h = Math.max(0, state.h - 1);
        if (state.uneasy && state.uneasyCleanDays >= 1) {
          state.uneasy = false;
          state.uneasyCleanDays = 0;
          note(state, '扫净香灰并走完一遍洁净仪轨，铺里那股「不对劲」终于散尽了。');
        } else {
          note(state, '扫净柜台香灰，铺子里透亮了些，阴气也散了一截。');
        }
      }
    }
  ];

  // P2 #11: 雇佣伙计小栓 / 安抚胆量
  if (!state.helper.hired) {
    moves.push({
      id: 'hire_helper',
      title: '雇佣镇上伙计 · 小栓',
      detail: '工时 −1 · 现金 −25 · 初始胆量 6（夜履约可搭手减压 −1，胆量 ≤ 2 会拒夜班）',
      reason: costReason(state, 1, 0, 25),
      run: () => {
        state.ap -= 1;
        state.m -= 25;
        state.helper.hired = true;
        state.helper.nerve = 6;
        note(state, '雇下街口小栓当帮工（胆量 6），夜里忙不过来时可喊他搭一把手。');
      }
    });
  } else if (state.helper.nerve < 9) {
    moves.push({
      id: 'calm_helper',
      title: `安抚伙计小栓（当前胆量 ${state.helper.nerve}/10）`,
      detail: '工时 −1 · 现金 −10 · 胆量 +2（恢复夜班搭手状态）',
      reason: costReason(state, 1, 0, 10),
      run: () => {
        state.ap -= 1;
        state.m -= 10;
        state.helper.nerve = Math.min(10, state.helper.nerve + 2);
        note(state, `给小栓买了热汤压惊，胆量回升至 ${state.helper.nerve}。`);
      }
    });
  }

  // P2 #11: 具名人情卡「陈婶街坊圆场」
  if (state.favorCards.includes('card_chen')) {
    moves.push({
      id: 'use_card_chen',
      title: '动用人情卡 · 陈婶街坊圆场',
      detail: '不耗工时 · 镇民信任 +2 · 直接消解当前镇群传闻',
      run: () => {
        state.favorCards = state.favorCards.filter((c) => c !== 'card_chen');
        state.ty += 2;
        state.rumor = false;
        state.calmDone = true;
        note(state, '请陈婶拎着保温袋在街口替你说了几句好话：镇民信任 +2，传闻彻底压平。');
      }
    });
  }

  if (state.handle > 0) {
    moves.push({
      id: 'wash_handle',
      title: '花钱托人洗掉一笔把柄',
      detail: '工时 −1 · 现金 −24 · 把柄 −1（本局限洗 1 次）',
      reason: state.washedHandleThisRun ? '本局已洗过一次把柄' : costReason(state, 1, 0, 24),
      run: () => {
        state.ap -= 1;
        state.m -= 24;
        state.handle = Math.max(0, state.handle - 1);
        state.washedHandleThisRun = true;
        note(state, '托镇上熟人把那笔把柄抹平了，夜账里少了一根刺。');
      }
    });
  }

  const nightPreview = getScheduledNightOrder(state.day, state.h);
  if (!nightPreview.peak && (state.day === 4 || state.h >= 10) && (state.rumor || state.h >= 10)) {
    moves.push({
      id: 'rest_tonight',
      title: '收拾铺面，今晚歇一晚',
      detail: '工时 −1 · 阴气 −2 · 阴气 < 12 时今晚不接普通诡异单',
      reason: state.restTonight ? '已安排今晚歇铺' : costReason(state, 1),
      run: () => {
        state.ap -= 1;
        state.h = Math.max(0, state.h - 2);
        state.restTonight = true;
        note(state, '把柜台收拾利索，打算天黑就落锁歇一晚。');
      }
    });
  }

  moves.push({
    id: 'night',
    title: '落锁入夜',
    detail: '翻开夜账迎客',
    primary: true,
    presentation: 'control',
    run: () => flipToNight(state)
  });

  return moves;
}
