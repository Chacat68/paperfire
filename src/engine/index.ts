import {
  CHARACTER_PROFILES,
  getCharacterForDayOrder,
  getCharacterForNightOrder
} from '../data/characters';
import { DAY_META, NIGHT_ORDERS, getNightOrderById, getScheduledNightOrder } from '../data/night';
import { ORDER_BY_ID } from '../data/orders';
import { FAVOR_CARDS, SHOP_UPGRADES, SYSTEM_SKILLS } from '../data/systemShop';
import type { GameState, StageView } from '../data/types';
import { buildDayOrderMoves, buildStreetMoves } from './dayLoop';
import { buildNightBoardMoves } from './nightLoop';
import { buildSettleShopMoves } from './settleLoop';
import { buildSiteMoves } from './siteLoop';
import { OUTCOME_LABELS, hasSkill } from './state';
import { rollbackToLastDay } from './systemEngine';

export {
  createRun,
  loadRun,
  saveRun,
  clearSavedRun,
  note,
  hasSkill,
  OUTCOME_LABELS,
  DAY_DURATION_SEC,
  NIGHT_DURATION_SEC,
  getPhaseDurationSec
} from './state';
export { fulfillDayOrder, flipToNight } from './dayLoop';
export {
  startSite,
  settleNight,
  dawn,
  computeInitialThreat,
  triggerNightTrap,
  exposeNightTrap,
  rejectRealNightOrder
} from './nightLoop';
export {
  syncAndClaimDailyQuests,
  syncCodexMilestones,
  learnSystemSkill,
  getIntelScanCost,
  getIntelForecastCost,
  scanTonightTrapIntel,
  forecastTomorrowIntel,
  decryptTownIntel,
  getSystemDiagnostics,
  redeemSystemSupply,
  buyShopUpgrade,
  snapshotDayStart,
  rollbackToLastDay
} from './systemEngine';

export function isNightPhase(phase: GameState['phase']): boolean {
  return phase === 'board' || phase === 'site' || phase === 'settle' || phase === 'bad_end';
}

export function getStageView(state: GameState, openRoutes: () => void): StageView {
  if (state.phase === 'bad_end') {
    return {
      title: '灯火俱灭 · 规则清算',
      description: state.badEndReason || '铺子没撑过这一晚，三盏灯齐齐熄灭。',
      notice: '坏结局过场：小品允许回溯至上一日日初重整经营，不提供当前履约中途重 roll。',
      moves: [
        {
          id: 'rollback_day',
          title: '回溯至今日清晨',
          detail: '回到今日卯时清晨快照，优先兑换生存口粮与净纸稳住局势',
          primary: true,
          run: () => {
            if (!rollbackToLastDay(state)) openRoutes();
          }
        },
        {
          id: 'replay',
          title: '翻开卷宗，另选章节',
          detail: '切换其他起局或重开一周目',
          run: openRoutes
        }
      ]
    };
  }

  if (state.phase === 'site') {
    const order =
      (state.activeNightOrderId && NIGHT_ORDERS[state.activeNightOrderId]) ||
      getScheduledNightOrder(state.day, state.h);
    return {
      title: order.siteTitle,
      description: order.siteDesc,
      notice: order.taboo,
      steps: order.steps,
      moves: buildSiteMoves(state)
    };
  }

  if (state.phase === 'board') {
    const informed = state.informedDays.includes(state.day);
    const selectedNight = getNightOrderById(state.selectedNightOrderId);

    if (selectedNight && !state.rejectedNightOrderIds.includes(selectedNight.id)) {
      const totalBeats = Math.max(1, selectedNight.storyBeats.length);
      const stepIdx = Math.max(0, Math.min(state.dialogueStep, totalBeats - 1));
      const beat = selectedNight.storyBeats[stepIdx] ?? {
        speaker: selectedNight.client,
        cue: '',
        line: selectedNight.boardDesc
      };
      const finished = stepIdx >= totalBeats - 1;
      const promised = !selectedNight.isTrap && selectedNight.promisedKey === 'wu_d2' && state.promiseWu;

      const scannedTrap = Boolean(state.scannedTrapDays?.includes(state.day));
      const echoSense = hasSkill(state, 'sight_echo');
      const notice = !finished
        ? '夜客正在讲述来意与经过——请细听每一处细节，讲完后再决定接单还是拒接。'
        : selectedNight.isTrap
          ? scannedTrap
            ? `【系统侦测警示】${selectedNight.trapClueHint ?? selectedNight.intelHintVerified}`
            : echoSense
              ? `【听声辨影 · 破绽预警】${selectedNight.trapClueHint ?? selectedNight.intelHintVerified}`
              : informed
                ? selectedNight.trapClueHint
                : '已听完对方全部说辞。细查话里的破绽与地点要求：接单照办，还是识破拒接？'
          : promised
            ? `日接夜交｜已收 ${state.deposit} 订金。在铺内满足借面诡客需求后结清尾款 ${selectedNight.pay - state.deposit}。`
            : informed
              ? selectedNight.intelHintVerified
              : selectedNight.peak
                ? `【顶格高压 · 仅 ${selectedNight.turns} 回合】已听完来意，请决定是否开门履约。`
                : '已听完对方全部说辞。确认无诱杀破绽后再决定接单、拒接，或先听另一位来客。';

      const profile = getCharacterForNightOrder(selectedNight);
      return {
        title: selectedNight.boardTitle,
        description: selectedNight.boardDesc,
        notice,
        dialogue: {
          speaker: beat.speaker,
          roleTag: '夜里诡客',
          identity: profile.bubbleIdentity,
          traits: profile.bubbleTraits,
          characterId: profile.id,
          cue: beat.cue,
          line: beat.line,
          step: stepIdx + 1,
          total: totalBeats,
          finished,
          eerie: true,
          summaryNote: finished
            ? `诉求摘要：${selectedNight.title}（承诺 ${selectedNight.pay} 现金 · 纸火点 +${selectedNight.ptsReward}）`
            : undefined
        },
        moves: buildNightBoardMoves(state)
      };
    }

    const mainOrder =
      (state.activeNightOrderId && NIGHT_ORDERS[state.activeNightOrderId]) ||
      getScheduledNightOrder(state.day, state.h);
    const allHandled =
      state.todayNightOrders.length > 0 &&
      state.todayNightOrders.every((id) => state.rejectedNightOrderIds.includes(id));
    const boardNotice = allHandled
      ? '今夜门外来客均已打发，点击右侧「落闩收摊」进入收尾结账。'
      : informed
        ? mainOrder.intelHintVerified
        : '点卡听来意，谨防骗你出门的诱杀诡。';
    return {
      title: '今夜 · 门外叩门来客',
      description: '',
      notice: boardNotice,
      moves: buildNightBoardMoves(state)
    };
  }

  if (state.phase === 'settle') {
    const outcome = state.outcomes[state.day];
    const isLast = state.day >= state.maxDay;
    const summaryPrefix = state.lastSettleSummary ? `${state.lastSettleSummary} ` : '';
    const rationWarn =
      !isLast && state.ration <= 0
        ? '【口粮告急】现余 0 份！请先点右侧「系统兑换 (S)」换粮，并择 1 项铺务收尾。'
        : !isLast
          ? state.settleChoreDone
            ? `铺务收尾已定，天亮将耗 1 份口粮（余 ${state.ration} 份）。点右侧迎接天明！`
            : `${summaryPrefix}每日收尾：请先选定 1 项铺务整理决策，方可进入下一天。`
          : `${summaryPrefix}纸火大账已至收束，合账查看终局评级。`;
    return {
      title: isLast
        ? `${OUTCOME_LABELS[outcome] ?? '夜账已结'} · 终审收官`
        : `每日收尾 · 铺务整理（${OUTCOME_LABELS[outcome] ?? '夜账已结'}）`,
      description: state.lastSettleSummary || state.message,
      notice: rationWarn,
      moves: buildSettleShopMoves(state)
    };
  }

  if (state.phase === 'end') {
    const isFullCampaign = state.maxDay >= 15;
    const trueEnding =
      isFullCampaign &&
      state.h < 10 &&
      state.handle === 0 &&
      state.ty >= 8 &&
      state.tn >= 6 &&
      state.outcomes[15] === 'success';
    const cleanEnough = state.h < 12 && state.handle === 0 && state.m >= 60;
    const steady = state.h < 12 && state.ty >= 4;

    const title = trueEnding
      ? '【真结局】阴阳双稳 · 纸火长明'
      : cleanEnough
        ? '灯火稳住，在诡异小镇站稳脚跟'
        : steady
          ? '铺子还开着，账面勉强过得去'
          : '夜账还欠着几句话';

    const storyBranch = trueEnding
      ? '十五日试用期满，初始经营系统解除强制绑定并交出小镇通途权限。纸马童向你拱手一笑——无论去留，这间纸扎铺已是活人与诡异皆敬畏三分的灯火所在。'
      : state.h >= 12
        ? '阴气仍在警戒线上，后续夜晚仍会频发被盯单，你还得继续靠系统奖励换粮续命。'
        : '阴气压在门槛以下，你靠白天活人单与夜里诡异履约撑过了艰难周期，换足了活下去的生存物资。';

    const handleLine =
      state.handle > 0 ? `账上还留着 ${state.handle} 笔把柄。` : '账上没有留把柄。';
    const tokenLine =
      state.tokens.length > 0
        ? `攒下信物：${state.tokens.map((t) => t.name).join('、')}。`
        : '';

    return {
      title,
      description: `${storyBranch}${handleLine}${tokenLine}（纸火点 ${state.pts} · 口粮 ${state.ration} · 现金 ${state.m} · 镇民信任 ${state.ty} · 夜口碑 ${state.tn}）`,
      notice: `${state.maxDay} 日经营周期已收束。可翻开卷宗切换不同章节或挑战 15 日完美真结局。`,
      moves: [
        {
          id: 'replay',
          title: '翻开卷宗，另起一局',
          detail: '对照 D1 完整 15 日局、D3 第三盏灯、D6/D10 顶格夜或 D15 终审',
          primary: true,
          run: openRoutes
        }
      ]
    };
  }

  // 白天经营阶段（面向活人的需求：柜台接单 / 街巷走动；铺务整理归入每日收尾）
  const nightOrder = getScheduledNightOrder(state.day, state.h);
  const informedToday = state.informedDays.includes(state.day);

  if (state.dayTab === 'street') {
    const isBack = state.streetZone === 'back';
    const visitedCount = (state.streetVisitedToday ?? []).length;
    return {
      title: isBack
        ? `老镇深街 · 民俗旧坊 · 已探 ${visitedCount}/4`
        : `老镇前街 · 骑楼市集 · 进货 ${state.streetSupplyUses}/2 · 打听 ${state.streetIntelUses}/2`,
      description: '',
      notice: isBack
        ? '可逛德昌茶楼叙旧、墨香书肆翻县志、城隍香火堂上香或老槐巷拾遗（按 ← / A 折返前街）。'
        : informedToday
          ? `柳裁缝已点破今夜禁忌｜${nightOrder.taboo}（按 → / D 可往深街旧坊探索）`
          : '点骑楼各店铺备料问忌，或往右侧深街旧坊继续探索（支持 ←/→ 或 A/D 巡街）。',
      dialogue:
        !isBack && informedToday
          ? {
              speaker: '柳裁缝',
              roleTag: '柳记裁缝铺',
              identity: CHARACTER_PROFILES.liu_tailor.bubbleIdentity,
              traits: CHARACTER_PROFILES.liu_tailor.bubbleTraits,
              characterId: 'liu_tailor',
              cue: '她捏着一截朱砂红线凑到门檐下，朝你压低了嗓音。',
              line: `「今夜那位来客最忌一件事：**${nightOrder.taboo}** ${nightOrder.intelHintVerified.replace(/^已核实｜/, '')}」`,
              step: 1,
              total: 1,
              finished: true,
              eerie: false
            }
          : undefined,
      moves: buildStreetMoves(state)
    };
  }

  if (state.selectedOrderId && ORDER_BY_ID[state.selectedOrderId]) {
    const order = ORDER_BY_ID[state.selectedOrderId];
    const totalBeats = Math.max(1, order.storyBeats.length);
    const stepIdx = Math.max(0, Math.min(state.dialogueStep, totalBeats - 1));
    const beat = order.storyBeats[stepIdx] ?? {
      speaker: order.client,
      cue: '',
      line: order.summary
    };
    const finished = stepIdx >= totalBeats - 1;
    const notice = !finished
      ? '客人正在柜台前讲述这单的经过与要求——听完后再决定接不接单。'
      : order.dayToNight
        ? order.dayToNight.warning
        : order.hassleNote
          ? order.hassleNote
          : order.lightTaboo
            ? `阳间轻忌｜${order.lightTaboo}`
            : '白天活人单无性命之虞，最多费些工时料子。选择工艺档位接单，或放回柜台。';

    const dayProfile = getCharacterForDayOrder(order);
    return {
      title: `活人来客 · ${order.title}`,
      description: order.summary,
      notice,
      dialogue: {
        speaker: beat.speaker,
        roleTag: '白天活人',
        identity: dayProfile.bubbleIdentity,
        traits: dayProfile.bubbleTraits,
        characterId: dayProfile.id,
        cue: beat.cue,
        line: beat.line,
        step: stepIdx + 1,
        total: totalBeats,
        finished,
        eerie: false,
        summaryNote: finished
          ? `单子要点：工时 ${order.apCost} · 纸料 ${order.needS}${order.needC ? ` · 需洁净 ≥ ${order.needC}` : ''} · 报酬 ${order.dayToNight ? `订金 ${order.dayToNight.deposit}` : `${order.payBase} 现金`}`
          : undefined
      },
      moves: buildDayOrderMoves(state)
    };
  }

  const doneCount = state.completedOrders.length;
  const totalCount = state.todayOrders.length;
  const dayNotice =
    state.ration === 0
      ? '【生存警报】当前口粮为 0！请点右侧「系统兑换 (S)」用纸火点换取口粮，避免明早断供！'
      : state.audit && state.day === 3
        ? '余波｜镇里抽查生效中，普通白单回款减少。'
        : state.rumor && state.day === 4
          ? state.calmDone
            ? '已请阿杰在镇群圆场。今天少掉的那张单仍记在账上。'
            : '余波｜镇群传闻导致今日少 1 张普通单，可推开老木门（或按 G）去街巷请阿杰圆场。'
          : informedToday
            ? nightOrder.intelHintVerified
            : nightOrder.intelHintUnverified;

  return {
    title: `白天柜台 · 已办 ${doneCount}/${totalCount}`,
    description: '',
    notice: dayNotice,
    moves: buildDayOrderMoves(state)
  };
}

export function buildLedgerNotes(state: GameState): Array<[string, string]> {
  const lines: Array<[string, string]> = [];
  // 今日系统指标
  for (const q of state.dailyQuests) {
    lines.push([q.done ? '指标✓' : '指标', `${q.title}（+${q.rewardPts} 纸火点）· ${q.detail}`]);
  }
  lines.push([
    '生存',
    `生存口粮 ×${state.ration}（每日天亮耗 1） · 纸火点 ${state.pts}${state.starveStreak > 0 ? ` · 断供警告 ${state.starveStreak}/2` : ''}`
  ]);
  if (state.helper.hired) {
    lines.push(['伙计', `${state.helper.name} · 胆量 ${state.helper.nerve}/10（≤2 拒上夜班）`]);
  }
  if (state.upgrades.length > 0) {
    const names = state.upgrades
      .map((id) => SHOP_UPGRADES.find((u) => u.id === id)?.title ?? id)
      .join('、');
    lines.push(['升级', names]);
  }
  if (state.learnedSkills && state.learnedSkills.length > 0) {
    const skillNames = state.learnedSkills
      .map((id) => SYSTEM_SKILLS.find((s) => s.id === id)?.name ?? id)
      .join('、');
    lines.push(['技能', `${skillNames}（已研习 ${state.learnedSkills.length}/${SYSTEM_SKILLS.length}）`]);
  }
  for (const cid of state.favorCards) {
    const c = FAVOR_CARDS[cid];
    lines.push(['人情卡', `${c.name} · ${c.detail}`]);
  }
  if (state.items.wardDoll > 0) {
    lines.push(['保命', `护身替纸人 ×${state.items.wardDoll} · 夜履约局面 −3 或失手自动替劫`]);
  }
  if (state.items.strip > 0) {
    lines.push(['备料', `窄纸带 ×${state.items.strip} · 可在「第三盏灯」第一手封灯并安座`]);
  }
  if (state.items.talisman > 0) {
    lines.push(['备料', `安神纸符 ×${state.items.talisman} · 夜履约可用（局面 −2）`]);
  }
  if (state.promiseWu && !state.outcomes[2]) {
    lines.push(['已承诺', '借面诡客替身纸牌 · 今夜须交差，否则次日抽查']);
  }
  if (state.informedDays.includes(state.day)) {
    const n = getScheduledNightOrder(state.day, state.h);
    lines.push(['今夜忌', n.taboo]);
  }
  if (state.uneasy) lines.push(['不对劲', '铺子挂着「不对劲」重记，须连稳洁净清除']);
  if (state.audit) lines.push(['余波', '镇里抽查 · 今日普通白单回款减少']);
  if (state.rumor && state.day === 4) lines.push(['余波', '阿杰传闻 · 今日普通白单少 1 张']);
  for (const token of state.tokens) {
    lines.push(['信物', `${token.name} · ${token.desc}`]);
  }
  if (state.handle > 0) {
    lines.push(['把柄', `还留着 ${state.handle} 笔暗债，可在每晚收尾「铺务整理」花钱洗掉`]);
  }
  for (let d = 1; d <= state.maxDay; d++) {
    const out = state.outcomes[d];
    if (out) {
      lines.push([`D${d}`, `${DAY_META[d]?.title ?? `第${d}日`} · ${OUTCOME_LABELS[out] ?? out}`]);
    }
  }
  return lines;
}
