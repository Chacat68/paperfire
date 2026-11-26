import { getCharacterForDayOrder } from '../data/characters';
import { buildTonightNightOrders, getScheduledNightOrder } from '../data/night';
import { ORDER_BY_ID } from '../data/orders';
import { ALLEY_FINDS, STREET_SUPPLIES, TEAHOUSE_GOSSIPS } from '../data/street';
import { TOWN_INTEL_DOCS } from '../data/systemShop';
import type { ActionOption, CardIconKind, CraftMode, DayOrderDef, GameState } from '../data/types';
import { NIGHT_DURATION_SEC, hasSkill, markCharacterMet, note, recordVisit } from './state';
import { syncAndClaimDailyQuests, syncCodexMilestones } from './systemEngine';

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
  const hasNimble = hasSkill(state, 'craft_nimble');
  const hasTrim = hasSkill(state, 'craft_trim');
  const hasMaster = hasSkill(state, 'craft_master');
  const baseAp = hasMaster ? Math.max(1, order.apCost - 1) : order.apCost;
  let apCost = baseAp;
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
    apCost = Math.max(1, baseAp - 1);
    cDelta = hasNimble ? 0 : -1;
    modeLabel = hasNimble ? '赶工省时（熟手不降净）' : '赶工省时';
  } else if (mode === 'fine') {
    needS = hasNimble ? order.needS : order.needS + 1;
    cDelta = 1;
    tyGain += 1;
    pay += 4;
    modeLabel = hasNimble ? '精工加净（熟手免加料）' : '精工加净';
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

  let trimNote = '';
  if (hasTrim) {
    state.craftOrderCounter = (state.craftOrderCounter ?? 0) + 1;
    if (state.craftOrderCounter % 2 === 0) {
      state.s += 1;
      trimNote = '（巧裁留边回收纸料 +1）';
    }
  }

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
  const profile = getCharacterForDayOrder(order);
  markCharacterMet(state, profile.id);
  recordVisit(state, {
    day: state.day,
    period: 'day',
    characterId: profile.id,
    guestName: profile.name,
    orderId: order.id,
    orderTitle: order.title,
    kind: 'living',
    result:
      mode === 'fine'
        ? 'completed_fine'
        : mode === 'rush'
          ? 'completed_rush'
          : mode === 'proxy'
            ? 'completed_proxy'
            : 'completed_standard',
    cashDelta: pay,
    ptsDelta: ptsBonus,
    note: `${modeLabel}交付${trimNote}${order.dayToNight ? '（已约今夜）' : ''}`
  });
  note(state, `以「${modeLabel}」满足活人订单「${order.title}」，收 ${pay} 现金、+${ptsBonus} 纸火点${trimNote}${extra}`);
  syncAndClaimDailyQuests(state);
}

export function flipToNight(state: GameState): void {
  state.phase = 'board';
  state.phaseRemainingSec = NIGHT_DURATION_SEC;
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
    state.phaseRemainingSec = 0;
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

      const hasNimble = hasSkill(state, 'craft_nimble');
      const hasMaster = hasSkill(state, 'craft_master');
      const baseAp = hasMaster ? Math.max(1, order.apCost - 1) : order.apCost;
      const basePay = order.dayToNight
        ? order.dayToNight.deposit
        : state.audit && !order.reliefOnly
          ? Math.max(8, Math.round(order.payBase * 0.78))
          : order.payBase;
      const rushAp = Math.max(1, baseAp - 1);
      const fineNeedS = hasNimble ? order.needS : order.needS + 1;
      const canRush = baseAp > 1 && !order.reliefOnly;
      const canFine = !order.reliefOnly;
      const canProxy = order.needS > 0 && !order.reliefOnly;
      const basePts = order.ptsReward ?? 4;

      const moves: ActionOption[] = [
        {
          id: `craft_std_${order.id}`,
          title: order.dayToNight ? '接单 · 收订金' : hasMaster ? '普通工艺 · 鬼斧省时' : '普通工艺',
          detail: `工时−${baseAp}${order.needS ? ` · 料−${order.needS}` : ' · 自带料'} · 现+${basePay} · 点+${basePts}`,
          primary: true,
          reason:
            costReason(state, baseAp, order.needS) ||
            (order.needC && state.c < order.needC ? `洁净≥${order.needC}` : ''),
          run: () => fulfillDayOrder(state, order, 'standard')
        }
      ];

      if (canRush) {
        moves.push({
          id: `craft_rush_${order.id}`,
          title: hasNimble ? '赶工省时 · 熟手免扣净' : '赶工省时',
          detail: `工时−${rushAp} · 料−${order.needS}${hasNimble ? ' · 免扣洁净' : ' · 洁净−1'} · 现+${basePay}`,
          reason: costReason(state, rushAp, order.needS) || (!hasNimble && state.c < 1 ? '洁净不足' : ''),
          run: () => fulfillDayOrder(state, order, 'rush')
        });
      }

      if (canFine) {
        moves.push({
          id: `craft_fine_${order.id}`,
          title: hasNimble ? '精工加净 · 熟手免加料' : '精工加净',
          detail: `工时−${baseAp} · 料−${fineNeedS} · 洁净+1 · 现+${basePay + 4} · 点+${basePts + 2}`,
          reason: costReason(state, baseAp, fineNeedS),
          run: () => fulfillDayOrder(state, order, 'fine')
        });
      }

      if (canProxy) {
        moves.push({
          id: `craft_proxy_${order.id}`,
          title: '替代料应急',
          detail: `工时−${baseAp} · 免料 · 阴气+1 · 夜局面+1`,
          danger: '使用替代料应急不耗纸料，但会抬高阴气，且今夜诡异履约初始局面 +1。确定如此交货？',
          reason: costReason(state, baseAp, 0),
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
    const displayAp = hasSkill(state, 'craft_master') ? Math.max(1, order.apCost - 1) : order.apCost;
    const cardStats: Array<{ label: string; value: string; tone?: 'cost' | 'gain' | 'pts' | 'warn' }> = [
      { label: '工时', value: `−${displayAp}`, tone: 'cost' },
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
        markCharacterMet(state, getCharacterForDayOrder(order).id);
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
  const zone = state.streetZone === 'back' ? 'back' : 'front';
  const visitedToday = state.streetVisitedToday ?? [];

  if (zone === 'back') {
    const didTeahouse = visitedToday.includes('teahouse');
    const didBookstore = visitedToday.includes('bookstore');
    const didShrine = visitedToday.includes('shrine');
    const didAlley = visitedToday.includes('alley_search');
    const markVisited = (key: string) => {
      state.streetVisitedToday ??= [];
      if (!state.streetVisitedToday.includes(key)) state.streetVisitedToday.push(key);
    };

    // 1. 德昌茶楼：听茶叙旧，稳增人情、信任并降阴气
    moves.push({
      id: 'explore_teahouse',
      title: '坐茶楼听街坊闲谈',
      detail: '工时 −1 · 现金 −6 · 人情 +1 · 信任 +1 · 阴气 −1',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '德昌茶楼',
        client: '清茶听风 · 结交老街人情',
        icon: 'teahouse',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '现金', value: '−6', tone: 'cost' },
          { label: '人情', value: '+1', tone: 'pts' },
          { label: '信任', value: '+1', tone: 'gain' }
        ],
        statusStamp: didTeahouse ? '已叙茶' : undefined
      },
      reason: didTeahouse ? '今日已在茶楼坐过一回' : costReason(state, 1, 0, 6),
      run: () => {
        state.ap -= 1;
        state.m -= 6;
        state.f += 1;
        state.ty += 1;
        state.h = Math.max(0, state.h - 1);
        markVisited('teahouse');
        const rumor = TEAHOUSE_GOSSIPS[(state.day - 1) % TEAHOUSE_GOSSIPS.length];
        note(state, `你在德昌茶楼沏茶叙旧（人情 +1，信任 +1，阴气 −1）。${rumor}`);
      }
    });

    // 2. 墨香书肆：翻检旧县志，赚纸火点与洁净，每满 2 次免费破译 1 份未解锁小镇机密档案
    const lockedDocs = TOWN_INTEL_DOCS.filter((d) => !(state.unlockedIntelIds ?? []).includes(d.id));
    const nextVisitNum = (state.bookstoreVisitsTotal ?? 0) + 1;
    const willUnlockDoc = lockedDocs.length > 0 && nextVisitNum % 2 === 0;
    moves.push({
      id: 'explore_bookstore',
      title: '翻检旧县志残卷',
      detail: willUnlockDoc
        ? '工时 −1 · 现金 −8 · 纸火点 +10 · 洁净 +1 · 额外白得 1 份小镇密档！'
        : '工时 −1 · 现金 −8 · 纸火点 +10 · 洁净 +1（每 2 次赠 1 份密档）',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '墨香书肆',
        client: willUnlockDoc ? '老学究书摊 · 本次必得残卷密档' : '古旧书肆 · 淘古籍赚纸火点',
        icon: 'bookstore',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '现金', value: '−8', tone: 'cost' },
          { label: '纸火点', value: '+10', tone: 'pts' },
          { label: '洁净', value: '+1', tone: 'gain' }
        ],
        statusStamp: didBookstore ? '已翻卷' : willUnlockDoc ? '密档' : undefined
      },
      reason: didBookstore ? '今日已翻检过书肆残卷' : costReason(state, 1, 0, 8),
      run: () => {
        state.ap -= 1;
        state.m -= 8;
        state.pts += 10;
        state.c += 1;
        state.bookstoreVisitsTotal = (state.bookstoreVisitsTotal ?? 0) + 1;
        markVisited('bookstore');
        markCharacterMet(state, 'elder_scholar');

        const remainingDocs = TOWN_INTEL_DOCS.filter((d) => !(state.unlockedIntelIds ?? []).includes(d.id));
        if (remainingDocs.length > 0 && state.bookstoreVisitsTotal % 2 === 0) {
          const unlocked = remainingDocs[0];
          state.unlockedIntelIds ??= [];
          state.unlockedIntelIds.push(unlocked.id);
          note(
            state,
            `你在墨香书肆淘出孤本残页（纸火点 +10，洁净 +1），并意外免费破译小镇密档《${unlocked.title}》！`
          );
        } else if (remainingDocs.length === 0 && state.bookstoreVisitsTotal % 2 === 0) {
          state.pts += 4;
          note(state, '墨香书肆的老学究见你识货，另赠一笔考据赏金（纸火点 +14，洁净 +1）。');
        } else {
          note(state, '你在墨香书肆翻阅民国旧县志，记下几段镇界掌故（纸火点 +10，洁净 +1）。');
        }
        syncCodexMilestones(state);
      }
    });

    // 3. 城隍香火堂：敬香祈福，强效降阴气 + 洁净，且安抚伙计胆量
    moves.push({
      id: 'explore_shrine',
      title: '城隍堂敬三炷清香',
      detail: state.helper.hired
        ? '工时 −1 · 现金 −10 · 阴气 −3 · 洁净 +1 · 小栓胆量 +2'
        : '工时 −1 · 现金 −10 · 阴气 −3 · 洁净 +1',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '城隍香火堂',
        client: state.helper.hired ? '镇西古庙 · 压阴静心并护伙计' : '镇西古庙 · 上香镇煞压阴气',
        icon: 'shrine',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '现金', value: '−10', tone: 'cost' },
          { label: '阴气', value: '−3', tone: 'pts' },
          { label: '洁净', value: '+1', tone: 'gain' }
        ],
        statusStamp: didShrine ? '已上香' : undefined
      },
      reason: didShrine ? '今日已敬过香火' : costReason(state, 1, 0, 10),
      run: () => {
        state.ap -= 1;
        state.m -= 10;
        state.h = Math.max(0, state.h - 3);
        state.c += 1;
        if (state.helper.hired) {
          state.helper.nerve = Math.min(10, state.helper.nerve + 2);
        }
        if (state.uneasy) {
          state.uneasyCleanDays += 1;
        }
        markVisited('shrine');
        note(
          state,
          `你在城隍香火堂虔诚敬上三炷清香：阴气 −3，洁净 +1${state.helper.hired ? '，顺带替小栓求得平安符（胆量 +2）' : ''}。`
        );
      }
    });

    // 4. 老槐巷石牌坊：每日老街寻宝/奇遇
    const todayFind = ALLEY_FINDS[(state.day - 1) % ALLEY_FINDS.length];
    const findRewardChip =
      todayFind.rewardKind === 'paper'
        ? { label: '纸料', value: `+${todayFind.amount}`, tone: 'gain' as const }
        : todayFind.rewardKind === 'cash'
          ? { label: '现金', value: `+${todayFind.amount}`, tone: 'gain' as const }
          : todayFind.rewardKind === 'talisman'
            ? { label: '纸符', value: `+${todayFind.amount}`, tone: 'pts' as const }
            : { label: '纸火点', value: `+${todayFind.amount}`, tone: 'pts' as const };
    moves.push({
      id: 'explore_alley',
      title: '老槐巷口巡查拾遗',
      detail: '工时 −1 · 免费 · 细查老槐树根与石龛，每日偶得不同收获',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '老槐巷',
        client: '青石牌坊 · 每日深巷奇遇',
        icon: 'lantern',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '花销', value: '免费', tone: 'gain' },
          findRewardChip
        ],
        statusStamp: didAlley ? '已寻毕' : undefined
      },
      reason: didAlley ? '今日已巡查过老槐巷口' : costReason(state, 1),
      run: () => {
        state.ap -= 1;
        markVisited('alley_search');
        if (todayFind.rewardKind === 'paper') {
          state.s += todayFind.amount;
        } else if (todayFind.rewardKind === 'cash') {
          state.m += todayFind.amount;
        } else if (todayFind.rewardKind === 'talisman') {
          state.items.talisman += todayFind.amount;
        } else {
          state.pts += todayFind.amount;
        }
        note(state, `【老槐巷拾遗】${todayFind.narrative}`);
        syncCodexMilestones(state);
      }
    });

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

    moves.push(
      {
        id: 'street_go_front',
        title: '‹ 折返前街市集',
        detail: '镇集杂货 · 林氏诊所 · 柳记裁缝',
        presentation: 'control',
        run: () => {
          state.streetZone = 'front';
          state.message = '你沿着骑楼廊道走回前街市集。';
        }
      },
      {
        id: 'return_to_shop',
        title: '返回纸扎铺',
        detail: '回柜台接单或落锁',
        primary: true,
        presentation: 'control',
        run: () => {
          state.dayTab = 'orders';
          state.streetZone = 'front';
          state.selectedOrderId = null;
          state.dialogueStep = 0;
        }
      }
    );

    return moves;
  }

  // ===== 前街 · 市集骑楼 =====
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
    const hasTrim = hasSkill(state, 'craft_trim');
    const talismanCap = hasTrim ? 5 : 3;
    const talismanPaperCost = hasTrim ? 0 : 1;
    moves.push({
      id: 'craft_talisman',
      title: hasTrim ? '预折安神纸符 · 巧裁免料' : '预折安神纸符',
      detail: hasTrim
        ? `工时 −1 · 免耗纸料 · 夜履约可用（局面 −2，上限 ${talismanCap} 张）`
        : '工时 −1 · 纸料 −1 · 夜履约可用（局面 −2）',
      presentation: 'card',
      card: {
        kind: 'street_spot',
        tag: '柳记裁缝铺',
        client: `借朱砂案折符 · 现有 ×${state.items.talisman}/${talismanCap}`,
        icon: 'charm',
        stats: [
          { label: '工时', value: '−1', tone: 'cost' },
          { label: '纸料', value: hasTrim ? '免料' : '−1', tone: hasTrim ? 'gain' : 'cost' },
          { label: '局面', value: '−2', tone: 'pts' }
        ],
        statusStamp: state.items.talisman >= talismanCap ? '已满' : undefined
      },
      reason:
        state.items.talisman >= talismanCap
          ? `手头已备足 ${talismanCap} 张纸符`
          : costReason(state, 1, talismanPaperCost),
      run: () => {
        state.ap -= 1;
        state.s -= talismanPaperCost;
        state.items.talisman += 1;
        note(
          state,
          hasTrim
            ? '巧用边角料折好一张朱砂安神纸符（免耗纸料），留着夜里压局面用。'
            : '提前折好一张朱砂安神纸符，留着夜里压局面用。'
        );
      }
    });
  }

  const backUnvisited = 4 - visitedToday.length;
  moves.push(
    {
      id: 'street_go_back',
      title: '往深街旧坊走 ›',
      detail:
        state.rumor && state.day === 4 && !state.calmDone
          ? '阿杰在老槐巷 · 另有茶楼/书肆/香火堂'
          : `茶楼 · 书肆 · 香火堂 · 老槐巷（余 ${Math.max(0, backUnvisited)} 处可探）`,
      presentation: 'control',
      run: () => {
        state.streetZone = 'back';
        state.message = '你穿过骑楼拱廊，步入烟火深处的后街旧坊。';
      }
    },
    {
      id: 'return_to_shop',
      title: '返回纸扎铺',
      detail: '回柜台接单或落锁',
      primary: true,
      presentation: 'control',
      run: () => {
        state.dayTab = 'orders';
        state.streetZone = 'front';
        state.selectedOrderId = null;
        state.dialogueStep = 0;
      }
    }
  );

  return moves;
}
