import type {
  DailyQuest,
  FavorCardId,
  ShopUpgradeId,
  SkillBranchId,
  SkillDef,
  TownIntelDoc
} from './types';

export type ShopIconKind =
  | 'ration_1'
  | 'ration_3'
  | 'clean_paper'
  | 'calm_pill'
  | 'talisman'
  | 'ward_doll'
  | 'copper_bell'
  | 'jade_censer'
  | 'iron_bolt'
  | 'tall_cabinet';

export interface SystemSupplyDef {
  id: string;
  title: string;
  shortTitle: string;
  detail: string;
  effectTags: string[];
  icon: ShopIconKind;
  costPts: number;
  category: 'survival' | 'talisman';
}

export interface ShopUpgradeDef {
  id: ShopUpgradeId;
  title: string;
  shortTitle: string;
  detail: string;
  effectTags: string[];
  icon: ShopIconKind;
  costPts: number;
  costM: number;
}

export interface FavorCardDef {
  id: FavorCardId;
  name: string;
  detail: string;
}

export const SYSTEM_SUPPLIES: SystemSupplyDef[] = [
  {
    id: 'sys_ration_1',
    title: '兑换 · 生存口粮与净水 ×1',
    shortTitle: '生存口粮 ×1',
    detail: '每夜过关必耗 1 份，防断供虚弱',
    effectTags: ['口粮 +1', '防断供'],
    icon: 'ration_1',
    costPts: 12,
    category: 'survival'
  },
  {
    id: 'sys_ration_3',
    title: '兑换 · 三日应急口粮包 ×3',
    shortTitle: '三日口粮包 ×3',
    detail: '一次囤足三日口粮，立省 4 点',
    effectTags: ['口粮 +3', '省 4 点'],
    icon: 'ration_3',
    costPts: 32,
    category: 'survival'
  },
  {
    id: 'sys_clean_paper',
    title: '兑换 · 系统特供净纸包',
    shortTitle: '特供净纸包',
    detail: '不受镇上缺货影响，直补料与洁净',
    effectTags: ['纸料 +4', '洁净 +2'],
    icon: 'clean_paper',
    costPts: 15,
    category: 'survival'
  },
  {
    id: 'sys_calm_pill',
    title: '兑换 · 醒神清心丸',
    shortTitle: '醒神清心丸',
    detail: '压低铺内阴气，并替伙计小栓压惊',
    effectTags: ['阴气 −3', '胆量 +2'],
    icon: 'calm_pill',
    costPts: 16,
    category: 'survival'
  },
  {
    id: 'sys_talisman',
    title: '兑换 · 朱砂安神纸符 ×1',
    shortTitle: '朱砂安神符',
    detail: '夜里履约现场祭出，立压局面',
    effectTags: ['局面 −2', '夜战可用'],
    icon: 'talisman',
    costPts: 18,
    category: 'talisman'
  },
  {
    id: 'sys_ward_doll',
    title: '兑换 · 护身替纸人 ×1',
    shortTitle: '护身替纸人',
    detail: '压局面 −3；中计或失手时自燃替死保命',
    effectTags: ['局面 −3', '替死保底'],
    icon: 'ward_doll',
    costPts: 28,
    category: 'talisman'
  }
];

export const SHOP_UPGRADES: ShopUpgradeDef[] = [
  {
    id: 'copper_bell',
    title: '门梁挂 · 镇魂铜铃',
    shortTitle: '镇魂铜铃',
    detail: '高悬铺门横梁，夜客登门先慑三分',
    effectTags: ['夜初局面 −1', '门梁显现'],
    icon: 'copper_bell',
    costPts: 30,
    costM: 35
  },
  {
    id: 'jade_censer',
    title: '换置 · 沉香三足大炉',
    shortTitle: '沉香三足大炉',
    detail: '天亮自动清降阴气并增洁净',
    effectTags: ['每日阴气 −1', '洁净 +1'],
    icon: 'jade_censer',
    costPts: 34,
    costM: 40
  },
  {
    id: 'iron_bolt',
    title: '加固 · 玄铁镇门闩',
    shortTitle: '玄铁镇门闩',
    detail: '封门、落闩、镇门动作额外压稳局面',
    effectTags: ['封门额外 −1', '木门加固'],
    icon: 'iron_bolt',
    costPts: 32,
    costM: 38
  },
  {
    id: 'tall_cabinet',
    title: '扩建 · 百子珍料纸柜',
    shortTitle: '百子珍料纸柜',
    detail: '理顺备料动线，白天工时上限永久提升',
    effectTags: ['工时上限 +1', '纸柜增层'],
    icon: 'tall_cabinet',
    costPts: 28,
    costM: 30
  }
];

export const FAVOR_CARDS: Record<FavorCardId, FavorCardDef> = {
  card_liu: {
    id: 'card_liu',
    name: '请柳裁缝出面',
    detail: '一次性具名人情卡 · 局面 −3，并稳住当前诡异忌讳'
  },
  card_chen: {
    id: 'card_chen',
    name: '陈婶街坊圆场',
    detail: '一次性具名人情卡 · 镇民信任 +2，消解镇群传闻余波'
  },
  card_boy: {
    id: 'card_boy',
    name: '纸马童引路带门',
    detail: '一次性具名人情卡 · 局面 −2，跳过一道前置交涉直接推进'
  }
};

export function buildDailyQuests(day: number): DailyQuest[] {
  const isPeak = day === 6 || day === 10 || day === 13;
  return [
    {
      id: `q_day_${day}`,
      title: '白天指标 · 满足活人需求',
      detail: '今日白天完成至少 1 笔活人订单',
      rewardPts: 10,
      kind: 'day_order',
      done: false,
      claimed: false
    },
    {
      id: `q_night_${day}`,
      title: isPeak ? '顶格悬赏 · 熬过顶格诡异夜' : '夜间指标 · 满足诡异需求',
      detail: isPeak ? '今夜成功交付顶格诡异订单' : '今夜成功完成诡异来客的履约需求',
      rewardPts: isPeak ? 32 : 16,
      kind: 'night_success',
      done: false,
      claimed: false
    },
    {
      id: `q_yin_${day}`,
      title: '安全屋红线 · 压住阴气',
      detail: '收摊结算时铺面阴气维持在 10 以下',
      rewardPts: 8,
      kind: 'keep_yin',
      done: false,
      claimed: false
    }
  ];
}

export const SYSTEM_INTEL_COSTS = {
  scanTrap: 10,
  forecastNext: 8
} as const;

export const TOWN_INTEL_DOCS: TownIntelDoc[] = [
  {
    id: 'intel_three_lamps',
    code: '密档 · 零壹',
    title: '双红灯、平安烛与安全屋界碑',
    category: '镇界规则',
    costPts: 12,
    summary: '为何诱杀诡无论开价多高，都死活要哄你跨出铺门？',
    body: '老纸扎铺门楣悬着的「纸」「火」双红灯与柜台上的平安蜡烛，合称整座诡异小镇仅存的几处合法「阳火界碑」之一。凡在灯烛照耀的柜台之内，无论登门诡客位格多高，皆受阴阳契约约束、须按旧例交割；一旦掌柜自愿卸闩、吹灯或跨出门槛，系统安全屋庇护即刻失效。',
    tip: '实战结论：一切「诱你离铺/吹灯/赴外地办事」的夜单 100% 为致命诱杀诡，果断识破拒接可稳赚 +6 纸火点与 −1 阴气。'
  },
  {
    id: 'intel_system_origin',
    code: '密档 · 零贰',
    title: '纸火经营系统绑定备忘',
    category: '系统底档',
    costPts: 12,
    summary: '十五日试用期的真实目的，以及生存口粮为何只能在系统兑换。',
    body: '这座小镇已被旧时代民俗怪谈与现代规则缝合接管。外来者若无合法铺面身份，子时一过便会被阴雾同化。经营系统将无主老铺覆写给你，借你之手平顺十五日阴阳流水；每日所耗生存口粮实为「阳气锚定剂」，连续两日断供便会失去锚定、被小镇彻底吞没。',
    tip: '实战结论：任何时候至少预留 1 份口粮在手，临近 0 份时优先在兑换阁囤入三日应急口粮包（省 4 点）。'
  },
  {
    id: 'intel_red_bride',
    code: '密档 · 零叁',
    title: '北巷无轿纸新娘旧卷',
    category: '顶格档案',
    costPts: 12,
    summary: 'D6 顶格夜无声唢呐的来历与保命仪轨。',
    body: '民国二十四年冬，北巷有户大户替早逝女儿扎素纸花轿配冥婚，却因轿夫偷工少扎了轿底，新娘魂影自此无轿可乘，每逢红白冲煞便伴无声唢呐游街讨轿。她虽位格极高，但最恨旁人偷窥红盖头之下；只要垂目不视、挂朱砂红帐隔目并献素轿，便愿赠合卺红绳结相谢。',
    tip: '实战结论：D6 顶格夜开局可用专属奇策「挂朱砂红帐隔目」免耗洁净压局 −2，并留洁净 ≥ 3 走正统献轿。'
  },
  {
    id: 'intel_temple_market',
    code: '密档 · 零肆',
    title: '十里阴市与百戏游神律',
    category: '顶格档案',
    costPts: 12,
    summary: 'D10 大庙会为何白天欢腾、入夜成阴市借道。',
    body: '老镇城隍庙会素有「昼迎阳客、夜借阴途」的古约。第十日入夜后，百戏游神统领阴市仪仗过街，沿途商铺须把门前头两盏朱砂红灯挑得通亮以示敬道。凡有邪祟冒充锣手催你吹灯钻暗巷，实乃趁游神威压浑水摸鱼的索命纸面诡。',
    tip: '实战结论：D10 先手「挑亮前两盏朱砂长明灯」既压局 −2，又能让后续正统献三牲额外降 1 阴气。'
  },
  {
    id: 'intel_empty_chair',
    code: '密档 · 零伍',
    title: '民国县志残页 · 空太师椅',
    category: '顶格档案',
    costPts: 12,
    summary: 'D13 屋里凭空多出的老太师椅究竟坐着谁？',
    body: '据镇志老学究藏本记载，每次十五日大清算前两夜，古戏楼旧灵必移一把空太师椅至纸火铺灯影处听三折纸偶戏。椅上究竟坐着一位还是满堂旧魂，活人绝不可回头细数——一旦数清人数，多出来的那张空座便会自动补上掌柜的名字。',
    tip: '实战结论：D13 先手「摊账掩目 · 绝不数屋里人」零消耗压局 −2，再摆三折纸戏偶鸣锣散戏，可赢「戏面残玉」直降终审初始局面。'
  },
  {
    id: 'intel_true_ending',
    code: '密档 · 零陆',
    title: '十五日终审 · 真结局核销细则',
    category: '终局密卷',
    costPts: 12,
    summary: '公开纸火系统解除强制绑定、通往「阴阳双稳 · 纸火长明」的全部硬指标。',
    body: '第十五夜总清算时，系统将从五项维度综合核验新掌柜的生死答卷：一须终审大账成功落印；二须铺面阴气压在 10 以下；三须账上把柄彻底清零（可用收尾铺务洗清）；四须镇民信任达到 8 以上；五须夜口碑达到 6 以上。五项俱全者，系统解除强制绑定并奉上小镇自由通途。',
    tip: '实战结论：D14 为最后缓冲日，务必检查五项硬指标并备好「戏面残玉」与「镇魂铜铃」，更莫被终审门外的假老掌柜骗去烧账！'
  }
];

export interface CodexMilestoneDef {
  id: string;
  title: string;
  detail: string;
  rewardPts: number;
  target: number;
  kind: 'met' | 'intel' | 'traps' | 'skills' | 'viral_tokens';
}

export interface SkillBranchMeta {
  id: SkillBranchId;
  name: string;
  seal: string;
  subtitle: string;
  accent: 'craft' | 'sight' | 'ward';
}

export const SKILL_BRANCHES: SkillBranchMeta[] = [
  {
    id: 'craft',
    name: '纸扎匠艺',
    seal: '匠',
    subtitle: '白昼省工省料 · 稳步滚雪球',
    accent: 'craft'
  },
  {
    id: 'sight',
    name: '观煞辩伪',
    seal: '观',
    subtitle: '听声识破诱杀 · 先手洞悉禁忌',
    accent: 'sight'
  },
  {
    id: 'ward',
    name: '镇煞仪轨',
    seal: '敕',
    subtitle: '解锁夜战主动技 · 靠本领从容过关',
    accent: 'ward'
  }
];

export const SYSTEM_SKILLS: SkillDef[] = [
  // 一、纸扎匠艺
  {
    id: 'craft_nimble',
    branch: 'craft',
    tier: 1,
    name: '熟手折纸',
    costPts: 18,
    tag: '初阶 · 匠艺',
    summary: '练熟老铺折纸手法，赶工不糙、精工省料。',
    effects: ['赶工省时不再扣洁净', '精工加净免额外耗料'],
    hookNote: '白天柜台工艺选择直接生效'
  },
  {
    id: 'craft_trim',
    branch: 'craft',
    tier: 2,
    prereq: 'craft_nimble',
    name: '巧裁留边',
    costPts: 28,
    tag: '中阶 · 匠艺',
    summary: '善用边角余纸循环备料，借朱砂案免费折符。',
    effects: ['每完 2 笔白单回收纸料 +1', '街巷折安神符免料且上限升至 5'],
    hookNote: '白昼交货与街巷裁缝铺案台生效'
  },
  {
    id: 'craft_master',
    branch: 'craft',
    tier: 3,
    prereq: 'craft_trim',
    name: '鬼斧扎神',
    costPts: 42,
    tag: '宗师 · 匠艺',
    summary: '扎活信手拈来，白昼倍速接单、入夜仪轨不费纸料。',
    effects: ['白天活人单工时 −1（最低 1）', '夜战正统仪轨/镇门免耗纸料', '夜单成功额外 +4 纸火点'],
    hookNote: '白天接单与夜战正统仪轨全程生效'
  },

  // 二、观煞辩伪
  {
    id: 'sight_echo',
    branch: 'sight',
    tier: 1,
    name: '听声辨影',
    costPts: 18,
    tag: '初阶 · 观煞',
    summary: '辨出话音里的阴气破绽，诱杀诡一开口便露马脚。',
    effects: ['听完诱杀台词自动弹出破绽提示', '识破诱杀额外 +4 纸火点', '破绽扫描半价(5点)且赠洁净 +1'],
    hookNote: '入夜听对话与情报扫描直接生效'
  },
  {
    id: 'sight_omen',
    branch: 'sight',
    tier: 2,
    prereq: 'sight_echo',
    name: '望气知忌',
    costPts: 28,
    tag: '中阶 · 观煞',
    summary: '晨起望一眼门楣雾色，便知今夜来客忌讳。',
    effects: ['每日天明自动核实当夜禁忌', '免跑裁缝铺省 1 工时（含 D3 窄纸带）', '明日天机预演半价（4 点）'],
    hookNote: '习得即刻生效，此后每日天明自动触发'
  },
  {
    id: 'sight_eye',
    branch: 'sight',
    tier: 3,
    prereq: 'sight_omen',
    name: '朱砂法眼',
    costPts: 42,
    tag: '宗师 · 观煞',
    summary: '一眼看透诡客命门，未动手先压低对方三分气焰。',
    effects: ['夜战初始局面 Threat0 −1（与铜铃叠加）', '全部夜战正统仪轨洁净门槛 −1'],
    hookNote: '所有常规夜与顶格夜入场即时生效'
  },

  // 三、镇煞仪轨
  {
    id: 'ward_flame',
    branch: 'ward',
    tier: 1,
    name: '借火定神',
    costPts: 18,
    tag: '初阶 · 主动技',
    summary: '借门楣双红灯与平安烛阳火稳住心神，无符亦能压场。',
    effects: ['夜战解锁主动技「技 · 借灯定神」', '每夜 1 次 · 零消耗 · 局面 −2 且洁净 +1'],
    hookNote: '夜里履约现场直接出现技能按钮'
  },
  {
    id: 'ward_heart',
    branch: 'ward',
    tier: 2,
    prereq: 'ward_flame',
    name: '纸火护心',
    costPts: 28,
    tag: '中阶 · 仪轨',
    summary: '以内火护住心脉与伙计，歪办不染阴、收尾多降煞。',
    effects: ['夜战应急歪办不再增加阴气', '小栓每夜首次搭手不掉胆量', '收尾扫灰净铺额外阴气 −1'],
    hookNote: '夜战现场与每日收尾铺务全程生效'
  },
  {
    id: 'ward_decree',
    branch: 'ward',
    tier: 3,
    prereq: 'ward_heart',
    name: '阴阳敕令',
    costPts: 42,
    tag: '宗师 · 主动技',
    summary: '执老铺朱砂总敕行令，一手定乾坤、暗债随时可清。',
    effects: ['夜战解锁终极技「技 · 阴阳敕令」', '每夜 1 次 · 零消耗 · 直推核心步骤且局面 −3', '收尾洗把柄半价（12 现）且不限次数'],
    hookNote: '常规/顶格夜战现场与收尾清账生效'
  }
];

export const CODEX_MILESTONES: CodexMilestoneDef[] = [
  {
    id: 'ms_met_8',
    title: '初识老街 · 照面 8 位人物',
    detail: '人物卷中已照面角色达到 8 位',
    rewardPts: 12,
    target: 8,
    kind: 'met'
  },
  {
    id: 'ms_met_18',
    title: '通晓阴阳 · 照面 18 位人物',
    detail: '人物卷中已照面角色达到 18 位',
    rewardPts: 20,
    target: 18,
    kind: 'met'
  },
  {
    id: 'ms_trap_3',
    title: '慧眼破妄 · 识破 3 次诱杀诡',
    detail: '累计在夜间成功识破并驱离 3 位诱杀诡',
    rewardPts: 14,
    target: 3,
    kind: 'traps'
  },
  {
    id: 'ms_skill_3',
    title: '初窥门径 · 研习 3 项技能',
    detail: '在技能研习中学会 3 项纸火铺本领',
    rewardPts: 14,
    target: 3,
    kind: 'skills'
  },
  {
    id: 'ms_skill_6',
    title: '纸火大成 · 研习 6 项技能',
    detail: '在技能研习中学会 6 项纸火铺本领',
    rewardPts: 24,
    target: 6,
    kind: 'skills'
  },
  {
    id: 'ms_intel_3',
    title: '镇档初成 · 解密 3 份机密档案',
    detail: '在情报打探中解密 3 份小镇机密档案',
    rewardPts: 15,
    target: 3,
    kind: 'intel'
  },
  {
    id: 'ms_intel_6',
    title: '全卷通明 · 集齐 6 份机密档案',
    detail: '集齐全部 6 份《诡异小镇深层档案》',
    rewardPts: 25,
    target: 6,
    kind: 'intel'
  },
  {
    id: 'ms_viral_3',
    title: '异闻赏鉴 · 集齐 3 件异闻信物',
    detail: '完成 3 位「奇诡特邀」异闻奇客夜单并收齐信物',
    rewardPts: 22,
    target: 3,
    kind: 'viral_tokens'
  }
];
