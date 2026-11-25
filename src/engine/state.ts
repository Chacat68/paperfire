import { DAY_ORDERS } from '../data/orders';
import { buildDailyQuests } from '../data/systemShop';
import type { GameState, ScenarioId } from '../data/types';
import { snapshotDayStart } from './systemEngine';

export const STORAGE_KEY = 'paperfire-v3-run';

export const OUTCOME_LABELS: Record<string, string> = {
  success: '已交付',
  failed: '履约失败',
  refused: '未接这笔单',
  pressed: '压下·留了把柄',
  fled: '中途离开',
  rested: '歇铺闭门'
};

export function note(state: GameState, text: string): void {
  state.message = text;
  state.log.push(`D${state.day} · ${text}`);
}

export function refreshDayOrders(state: GameState): void {
  const fixed = DAY_ORDERS.filter((o) => o.fixedDay === state.day && !o.reliefOnly);
  const pool = DAY_ORDERS.filter(
    (o) => !o.fixedDay && !o.reliefOnly && state.day >= o.dayMin && state.day <= o.dayMax
  ).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  // 对齐设计稿 4.3 节：Ty 0–6 基础 2 单，Ty 7+ 升到 3 单；镇群传闻余波少 1 张普通单
  const targetCount = Math.max(1, (state.ty >= 7 ? 3 : 2) - (state.rumor && state.day === 4 ? 1 : 0));
  const picked: string[] = [];

  for (const o of fixed) {
    picked.push(o.id);
  }
  for (const o of pool) {
    if (picked.length >= targetCount) break;
    if (!picked.includes(o.id)) picked.push(o.id);
  }

  // 空仓止损单独立于普通刷新数量（设计稿 4.6 节 QA-07）
  if (state.reliefEligible) {
    picked.push('d4_relief_self');
  }

  state.todayOrders = picked;
  state.completedOrders = [];
  state.selectedOrderId = null;
  state.dialogueStep = 0;
  state.listenedOrderIds = [];
}

export function createRun(mode: ScenarioId = 'd1_full'): GameState {
  const run: GameState = {
    day: 1,
    maxDay: 15,
    phase: 'day',
    dayTab: 'orders',
    selectedOrderId: null,
    selectedNightOrderId: null,
    dialogueStep: 0,
    listenedOrderIds: [],

    ap: 6,
    apMax: 6,
    m: 60,
    s: 9,
    c: 7,
    h: 3,
    f: 2,
    ty: 4,
    tn: 1,

    // 穿越初始系统与生存物资（P0）
    pts: 24,
    ration: 2,
    starveStreak: 0,
    introSeen: mode !== 'd1_full',
    dailyQuests: buildDailyQuests(1),

    // 铺面升级、伙计胆量与人情卡（P2）
    upgrades: [],
    helper: { hired: false, name: '伙计小栓', nerve: 6 },
    favorCards: [],
    uneasy: false,
    uneasyCleanDays: 0,

    todayOrders: [],
    completedOrders: [],
    todayNightOrders: [],
    rejectedNightOrderIds: [],
    usedProxyToday: false,
    streetSupplyUses: 0,
    streetIntelUses: 0,
    washedHandleThisRun: false,

    promiseWu: false,
    deposit: 0,
    informedDays: [],
    items: { strip: 0, talisman: 0, wardDoll: 0 },
    tokens: [],
    audit: false,
    rumor: false,
    watchedTonight: false,
    reliefEligible: false,
    reliefDone: false,
    calmDone: false,
    restTonight: false,
    restNextNight: false,
    settleChoreDone: false,
    settleChosenId: null,
    handle: 0,
    d6Previewed: false,

    activeNightOrderId: null,
    turns: 0,
    threat: 0,
    steps: [],
    outcomes: {},
    lastSettleSummary: '',
    badEndReason: '',
    lastDaySnapshot: null,
    log: [],
    message: '【系统提示】已接入诡异小镇纸扎铺。白天满足活人需求，晚上满足诡异需求，赚取纸火点兑换生存口粮。'
  };

  if (mode === 'd2_story') {
    Object.assign(run, {
      day: 2,
      m: 48,
      s: 7,
      c: 6,
      h: 3,
      f: 2,
      ty: 4,
      tn: 1,
      pts: 34,
      ration: 2,
      outcomes: { 1: 'success' },
      message: '吴支书进门时把一只空烟盒压在了合同上，今夜将有借面诡客上门。'
    });
    run.log.push('D1 · 首日活人与无名送行诡均平稳结清。');
  } else if (mode === 'd3_compare' || mode === 'd3_tight') {
    Object.assign(run, {
      day: 3,
      ap: 2,
      m: 68,
      s: 6,
      c: 6,
      h: mode === 'd3_tight' ? 12 : 6,
      f: 2,
      ty: 5,
      tn: 2,
      pts: 42,
      ration: 2,
      outcomes: { 1: 'success', 2: 'success' },
      tokens: [{ id: 'wu_stamp', name: '支书盖章卡', desc: '守密信物 · 可抵消一次镇里抽查' }],
      message: '两笔白天活人单已交付，剩 2 点工时。阿杰提到了第三盏灯与自起纸人。'
    });
    run.log.push('D3 · 两笔日间订单已交付，剩 2 点工时。');
  } else if (mode === 'd4_empty') {
    Object.assign(run, {
      day: 4,
      ap: 6,
      m: 0,
      s: 0,
      c: 0,
      f: 0,
      h: 13,
      ty: 2,
      tn: 1,
      pts: 18,
      ration: 1,
      rumor: true,
      reliefEligible: true,
      outcomes: { 1: 'success', 2: 'success', 3: 'failed' },
      message: '昨夜纸人单没封好门，镇群里开始传话。手头空仓，先靠自带料单止损或用纸火点救急。'
    });
    run.log.push('D3 · 第三盏灯未封门，镇群里开始传话。');
  } else if (mode === 'd5_pressure') {
    Object.assign(run, {
      day: 5,
      maxDay: 5,
      ap: 6,
      m: 54,
      s: 5,
      c: 5,
      h: 11,
      f: 2,
      ty: 5,
      tn: 2,
      pts: 46,
      ration: 2,
      handle: 1,
      d6Previewed: true,
      outcomes: { 1: 'success', 2: 'pressed', 3: 'success', 4: 'success' },
      message: '明晚将迎顶格诡异夜，今晚先由旧账阴差核对前五日阴账。'
    });
    run.log.push('D5 · 带着一笔把柄与高阴气迎来五日清算夜。');
  } else if (mode === 'd6_peak') {
    Object.assign(run, {
      day: 6,
      maxDay: 15,
      ap: 6,
      m: 92,
      s: 8,
      c: 7,
      h: 6,
      f: 3,
      ty: 6,
      tn: 4,
      pts: 62,
      ration: 3,
      items: { strip: 0, talisman: 1, wardDoll: 1 },
      favorCards: ['card_liu'],
      tokens: [{ id: 'bronze_clasp', name: '旧账铜扣', desc: '五日稳局信物 · 证明铺子已在阴间挂号立稳' }],
      outcomes: { 1: 'success', 2: 'success', 3: 'success', 4: 'success', 5: 'success' },
      message: '【系统警报】北巷无声唢呐响起，今夜将迎首场 3 回合顶格诡异「无轿纸新娘」！'
    });
    run.log.push('D6 · 进入首场顶格诡异夜，已备好柳裁缝人情卡与护身替纸人。');
  } else if (mode === 'd10_temple') {
    Object.assign(run, {
      day: 10,
      maxDay: 15,
      ap: 7,
      apMax: 7,
      m: 140,
      s: 10,
      c: 8,
      h: 7,
      f: 4,
      ty: 8,
      tn: 6,
      pts: 78,
      ration: 3,
      upgrades: ['copper_bell', 'tall_cabinet'],
      helper: { hired: true, name: '伙计小栓', nerve: 6 },
      items: { strip: 0, talisman: 1, wardDoll: 1 },
      favorCards: ['card_liu', 'card_boy'],
      tokens: [{ id: 'crimson_knot', name: '合卺红绳结', desc: '顶格信物 · 夜履约结算额外多得 6 纸火点' }],
      outcomes: {
        1: 'success',
        2: 'success',
        3: 'success',
        4: 'success',
        5: 'success',
        6: 'success',
        7: 'success',
        8: 'success',
        9: 'success'
      },
      message: '【庙会日】白天全镇重金求彩扎龙头，今夜百戏游神借路压境！'
    });
    run.log.push('D10 · 庙会大日到来，已挂镇魂铜铃并雇佣伙计小栓。');
  } else if (mode === 'd15_final') {
    Object.assign(run, {
      day: 15,
      maxDay: 15,
      ap: 7,
      apMax: 7,
      m: 210,
      s: 12,
      c: 10,
      h: 5,
      f: 5,
      ty: 11,
      tn: 9,
      pts: 110,
      ration: 4,
      upgrades: ['copper_bell', 'jade_censer', 'iron_bolt', 'tall_cabinet'],
      helper: { hired: true, name: '伙计小栓', nerve: 8 },
      items: { strip: 0, talisman: 2, wardDoll: 1 },
      favorCards: ['card_liu', 'card_boy'],
      tokens: [
        { id: 'bronze_clasp', name: '旧账铜扣', desc: '五日稳局信物' },
        { id: 'crimson_knot', name: '合卺红绳结', desc: '顶格信物 · 夜履约结算额外多得 6 纸火点' },
        { id: 'opera_mask_jade', name: '戏面残玉', desc: '顶格信物 · 终局大账清算时额外压低初始局面 1 点' }
      ],
      outcomes: {
        1: 'success',
        2: 'success',
        3: 'success',
        4: 'success',
        5: 'success',
        6: 'success',
        7: 'success',
        8: 'success',
        9: 'success',
        10: 'success',
        11: 'success',
        12: 'success',
        13: 'success',
        14: 'success'
      },
      message: '【十五日终审】最后一日！办妥镇口大纸幡，静候今夜纸马童与阴差总清算。'
    });
    run.log.push('D15 · 铺面设施齐备，迎来穿越十五日最终大账清算。');
  }

  run.dailyQuests = buildDailyQuests(run.day);
  refreshDayOrders(run);
  snapshotDayStart(run);
  return run;
}

export function loadRun(): GameState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      const phases = new Set(['day', 'board', 'site', 'settle', 'end', 'bad_end']);
      if (
        parsed &&
        typeof parsed.day === 'number' &&
        parsed.day >= 1 &&
        parsed.day <= 15 &&
        phases.has(parsed.phase) &&
        typeof parsed.pts === 'number' &&
        typeof parsed.ration === 'number'
      ) {
        parsed.selectedNightOrderId ??= null;
        parsed.dialogueStep ??= 0;
        parsed.listenedOrderIds ??= [];
        parsed.todayNightOrders ??= [];
        parsed.rejectedNightOrderIds ??= [];
        parsed.restNextNight ??= false;
        parsed.settleChoreDone ??= false;
        parsed.settleChosenId ??= null;
        if (parsed.dayTab === 'shop') parsed.dayTab = 'orders';
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  return createRun('d1_full');
}

export function saveRun(state: GameState): void {
  try {
    // 设计稿 2.5 节存档边界：夜履约现场内禁止检查点存档
    if (state.phase !== 'site') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore storage errors
  }
}
