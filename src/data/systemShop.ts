import type { DailyQuest, FavorCardId, ShopUpgradeId } from './types';

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
