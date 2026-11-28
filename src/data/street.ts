export interface StreetSupplyDef {
  id: string;
  vendor: string;
  title: string;
  costAp: number;
  costM: number;
  gainS: number;
  gainC: number;
  detail: string;
}

export const STREET_SUPPLIES: StreetSupplyDef[] = [
  {
    id: 'supply_small',
    vendor: '镇集杂货',
    title: '进一小捆普通纸料',
    costAp: 1,
    costM: 10,
    gainS: 4,
    gainC: 0,
    detail: '工时 −1 · 现金 −10 · 纸料 +4'
  },
  {
    id: 'supply_large',
    vendor: '镇集杂货',
    title: '进一大捆普通纸料',
    costAp: 1,
    costM: 22,
    gainS: 10,
    gainC: 0,
    detail: '工时 −1 · 现金 −22 · 纸料 +10'
  },
  {
    id: 'supply_lin_clean',
    vendor: '林医生诊所',
    title: '林医生的洁净料包',
    costAp: 1,
    costM: 18,
    gainS: 3,
    gainC: 1,
    detail: '工时 −1 · 现金 −18 · 纸料 +3 · 洁净 +1'
  }
];

export const TEAHOUSE_GOSSIPS: string[] = [
  '茶客压低嗓音说：北巷每逢红白冲煞便闻无声唢呐，切记只看灯影莫看红盖头。',
  '老掌柜邻座念叨：这整条骑楼街唯有纸扎铺门楣「纸」「火」双红灯与柜台平安烛常年不灭，出了门槛便不作数。',
  '跑码头客商嘀咕：镇西城隍香火堂的铁炉压煞最灵，手头阴气重时去上三炷香比吃药还管用。',
  '几个老街坊议论：墨香书肆的老学究藏着几册民国旧县志，里头记着老镇十里阴市的旧约。',
  '茶博士倒茶时顺口提点：夜里叩门若有人催你吹灯出门办事，十成十是披皮索命的诱杀诡。',
  '靠窗的老篾匠叹气：大庙会前后的夜单最耗心神，早些在系统里研习本领或备好安神符才稳妥。'
];

export interface AlleyFindDef {
  id: string;
  title: string;
  rewardKind: 'paper' | 'cash' | 'talisman' | 'pts';
  amount: number;
  narrative: string;
}

export const ALLEY_FINDS: AlleyFindDef[] = [
  {
    id: 'alley_paper',
    title: '石龛后拾得无主净纸',
    rewardKind: 'paper',
    amount: 2,
    narrative: '你在老槐巷土地小龛后翻出半捆防潮油纸包着的净宣纸（纸料 +2）。'
  },
  {
    id: 'alley_cash',
    title: '青石缝捡到旧铜洋',
    rewardKind: 'cash',
    amount: 14,
    narrative: '在老槐树根石缝里摸出一小袋蒙尘旧铜钱与银毫，拿到杂货铺换了现钱（现金 +14）。'
  },
  {
    id: 'alley_talisman',
    title: '旧瓦檐下得残存安神符',
    rewardKind: 'talisman',
    amount: 1,
    narrative: '从石牌坊旧檐缝里抽出一张朱砂未褪的老师傅安神纸符，修整后堪用（安神纸符 +1）。'
  },
  {
    id: 'alley_trace',
    title: '巷壁发现诡异旧刻痕',
    rewardKind: 'pts',
    amount: 8,
    narrative: '你在深巷青砖壁上拓下一段罕见民俗诡纹，纸火系统自动收录结算（纸火点 +8）。'
  }
];
