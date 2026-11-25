import type { ScenarioId } from './types';

export interface ScenarioDef {
  id: ScenarioId;
  title: string;
  detail: string;
}

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'd1_full',
    title: '从第 1 日穿越开铺起局（完整 D1–D15 一周目）',
    detail: '完整体验初始系统接入、白天活人需求、夜晚诡异履约、生存物资兑换与十五日终局'
  },
  {
    id: 'd2_story',
    title: '从 D2 借面夜客起局',
    detail: '白天吴支书合规净宅 · 夜晚借面诡客上门讨替身纸牌'
  },
  {
    id: 'd3_compare',
    title: 'D3 第三盏灯 · 标准对照场',
    detail: '剩 2 工时 · 可试打听裁窄纸带或直接补做纸马'
  },
  {
    id: 'd3_tight',
    title: 'D3 第三盏灯 · 紧张高压场',
    detail: '阴气 12 · 体验提前裁窄纸带与系统替纸人破局'
  },
  {
    id: 'd4_empty',
    title: 'D4 空仓善后（QA-07 止损）',
    detail: '现金和纸料为 0 · 阴气 13 · 靠自带料单与歇铺止损翻身'
  },
  {
    id: 'd5_pressure',
    title: 'D5 旧账阴差 · 五日短试玩终点',
    detail: '带把柄与高阴气进入五日清算夜，结清即可看五日评级'
  },
  {
    id: 'd6_peak',
    title: 'D6 顶格夜 · 无轿纸新娘（3 回合高压）',
    detail: '体验首场顶格诡异履约、具名人情卡与系统护身替纸人'
  },
  {
    id: 'd10_temple',
    title: 'D10 庙会顶格夜 · 百戏游神压境',
    detail: '白天彩扎龙头特单 · 夜里 3 回合礼送游神斩获巨额纸火点'
  },
  {
    id: 'd15_final',
    title: 'D15 十五日系统大账终审',
    detail: '直达最终清算夜，检验多分支终局与全铺面升级效果'
  }
];
