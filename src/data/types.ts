export type Phase = 'day' | 'board' | 'site' | 'settle' | 'end' | 'bad_end';
export type DayTab = 'orders' | 'street';
export type StreetZone = 'front' | 'back';
export type CraftMode = 'standard' | 'rush' | 'fine' | 'proxy';
export type NightOutcome = 'success' | 'failed' | 'refused' | 'pressed' | 'fled' | 'rested';
export type ScenarioId =
  | 'd1_full'
  | 'd2_story'
  | 'd3_compare'
  | 'd3_tight'
  | 'd4_empty'
  | 'd5_pressure'
  | 'd6_peak'
  | 'd8_viral'
  | 'd10_temple'
  | 'd15_final';

export type ShopUpgradeId = 'copper_bell' | 'jade_censer' | 'iron_bolt' | 'tall_cabinet';
export type FavorCardId = 'card_liu' | 'card_chen' | 'card_boy';
export type SkillBranchId = 'craft' | 'sight' | 'ward';
export type SkillId =
  | 'craft_nimble'
  | 'craft_trim'
  | 'craft_master'
  | 'sight_echo'
  | 'sight_omen'
  | 'sight_eye'
  | 'ward_flame'
  | 'ward_heart'
  | 'ward_decree';

export interface SkillDef {
  id: SkillId;
  branch: SkillBranchId;
  tier: 1 | 2 | 3;
  name: string;
  costPts: number;
  prereq?: SkillId;
  tag: string;
  summary: string;
  effects: string[];
  hookNote: string;
}

export type DayGuestArt =
  | 'chen_auntie'
  | 'merchant_woman'
  | 'doctor_lin'
  | 'elder_scholar'
  | 'wu_day'
  | 'ajie_day'
  | 'boatman_day'
  | 'day_villager';

export type EerieGuestArt =
  | 'paper_boy'
  | 'lantern_child'
  | 'masked_wu'
  | 'ajie_night'
  | 'umbrella'
  | 'ferry_ghost'
  | 'old_accountant'
  | 'paper_bride'
  | 'mirror_guest'
  | 'tailor_ghost'
  | 'ash_collector'
  | 'temple_deity'
  | 'opera_ghost'
  | 'night_auntie'
  | 'zodiac_goat'
  | 'midnight_courier'
  | 'smiling_surgeon'
  | 'crimson_senior'
  | 'zuowang_jester'
  | 'puppet_twins';

export type CharacterCamp = 'resident' | 'living' | 'eerie' | 'trap';

export interface CharacterProfile {
  id: string;
  name: string;
  title: string;
  camp: CharacterCamp;
  art: DayGuestArt | EerieGuestArt;
  sealChar: string;
  firstDay: number;
  appearance: string;
  traits: string[];
  bio: string;
  ruleOrHabit: string;
  /** Non-spoiling short identity shown inside live speech bubble */
  bubbleIdentity: string;
  /** Non-spoiling visual/behavioral clues shown inside live speech bubble */
  bubbleTraits: string[];
}

export interface DialogueBeat {
  speaker: string;
  cue: string;
  line: string;
}

export interface DayOrderDef {
  id: string;
  dayMin: number;
  dayMax: number;
  fixedDay?: number;
  client: string;
  characterId?: string;
  title: string;
  summary: string;
  guestArt: DayGuestArt;
  hassleNote?: string;
  storyBeats: DialogueBeat[];
  payBase: number;
  apCost: number;
  needS: number;
  needC?: number;
  tyReward: number;
  ptsReward?: number;
  dayToNight?: {
    deposit: number;
    nightOrderId: string;
    warning: string;
  };
  lightTaboo?: string;
  reliefOnly?: boolean;
  priority?: number;
}

export interface SiteStepDef {
  key: string;
  label: string;
}

export interface NightOrderDef {
  id: string;
  day: number;
  client: string;
  characterId?: string;
  title: string;
  boardTitle: string;
  boardDesc: string;
  siteTitle: string;
  siteDesc: string;
  siteIntro: string;
  taboo: string;
  pay: number;
  ptsReward: number;
  risk: number;
  turns: number;
  peak?: boolean;
  specialViral?: boolean;
  watched?: boolean;
  promisedKey?: 'wu_d2';
  guestArt: EerieGuestArt;
  storyBeats: DialogueBeat[];
  isTrap?: boolean;
  trapClueHint?: string;
  trapKillTitle?: string;
  trapKillNarrative?: string;
  trapExposeText?: string;
  intelHintUnverified: string;
  intelHintVerified: string;
  steps: SiteStepDef[];
  tokenReward?: {
    id: string;
    name: string;
    desc: string;
  };
  favorCardReward?: FavorCardId;
  failNote: string;
  aftermathFlag?: 'audit' | 'rumor' | 'watched_debt';
}

export type CardIconKind =
  | 'lantern'
  | 'horse'
  | 'charm'
  | 'plaque'
  | 'doll'
  | 'umbrella'
  | 'ledger'
  | 'bride'
  | 'mirror'
  | 'deity'
  | 'opera'
  | 'supply'
  | 'clinic'
  | 'tailor'
  | 'scissors'
  | 'rumor'
  | 'broom'
  | 'helper'
  | 'wash'
  | 'rest'
  | 'teahouse'
  | 'bookstore'
  | 'shrine';

export interface ActionCardStat {
  label: string;
  value: string;
  tone?: 'cost' | 'gain' | 'pts' | 'warn';
}

export interface ActionCardMeta {
  kind: 'day_order' | 'night_order' | 'street_spot' | 'shop_chore';
  tag: string;
  client: string;
  icon: CardIconKind;
  stats: ActionCardStat[];
  statusStamp?: string;
}

export interface ActionOption {
  id: string;
  title: string;
  detail: string;
  primary?: boolean;
  skill?: boolean;
  danger?: string;
  reason?: string;
  badge?: string;
  presentation?: 'card' | 'control';
  card?: ActionCardMeta;
  run: () => void;
}

export interface ActiveToken {
  id: string;
  name: string;
  desc: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  detail: string;
  rewardPts: number;
  kind: 'day_order' | 'night_success' | 'keep_yin';
  done: boolean;
  claimed: boolean;
}

export interface HelperState {
  hired: boolean;
  name: string;
  nerve: number;
}

export type VisitResultKind =
  | 'completed_standard'
  | 'completed_rush'
  | 'completed_fine'
  | 'completed_proxy'
  | 'night_success'
  | 'night_pressed'
  | 'night_failed'
  | 'night_fled'
  | 'night_refused'
  | 'trap_exposed'
  | 'trap_survived'
  | 'trap_killed';

export interface VisitRecord {
  id: string;
  day: number;
  period: 'day' | 'night';
  characterId: string;
  guestName: string;
  orderId: string;
  orderTitle: string;
  kind: 'living' | 'eerie' | 'trap';
  result: VisitResultKind;
  cashDelta: number;
  ptsDelta: number;
  note: string;
}

export interface TownIntelDoc {
  id: string;
  code: string;
  title: string;
  category: string;
  costPts: number;
  summary: string;
  body: string;
  tip: string;
}

export interface GameState {
  day: number;
  maxDay: number;
  phase: Phase;
  phaseRemainingSec: number;
  dayTab: DayTab;
  selectedOrderId: string | null;
  selectedNightOrderId: string | null;
  dialogueStep: number;
  listenedOrderIds: string[];

  // 核心经营与生存资源
  ap: number;
  apMax: number;
  m: number; // 现金
  s: number; // 纸料
  c: number; // 洁净
  h: number; // 阴气
  f: number; // 人情
  ty: number; // 镇民信任
  tn: number; // 夜口碑

  // 穿越系统与生存物资（P0）
  pts: number; // 系统奖励「纸火点」
  ration: number; // 生存口粮（每日过夜消耗 1）
  starveStreak: number; // 连续断供天数
  introSeen: boolean;
  dailyQuests: DailyQuest[];

  // 铺面升级、伙计胆量与具名人情卡（P2）
  upgrades: ShopUpgradeId[];
  helper: HelperState;
  favorCards: FavorCardId[];
  uneasy: boolean;
  uneasyCleanDays: number;

  // 当日经营状态
  todayOrders: string[];
  completedOrders: string[];
  todayNightOrders: string[];
  rejectedNightOrderIds: string[];
  usedProxyToday: boolean;
  streetSupplyUses: number;
  streetIntelUses: number;
  washedHandleThisRun: boolean;

  // 剧情/承诺/准备/道具/余波状态
  promiseWu: boolean;
  deposit: number;
  informedDays: number[];
  items: {
    strip: number; // 窄纸带（D3 封灯并安座）
    talisman: number; // 安神纸符（夜履约局面 -2）
    wardDoll: number; // 护身替纸人（系统兑换：夜履约局面 -3 / 失败替劫保底）
  };
  tokens: ActiveToken[];
  audit: boolean;
  rumor: boolean;
  watchedTonight: boolean;
  reliefEligible: boolean;
  reliefDone: boolean;
  calmDone: boolean;
  restTonight: boolean;
  restNextNight: boolean;
  settleChoreDone: boolean;
  settleChosenId: string | null;
  handle: number;
  d6Previewed: boolean;

  // 夜履约现场状态
  activeNightOrderId: string | null;
  turns: number;
  threat: number;
  steps: string[];
  outcomes: Record<number, NightOutcome>;
  nightOrderHistory?: Record<number, string>;
  metaRecordedEnd?: boolean;
  lastSettleSummary: string;
  badEndReason: string;
  lastDaySnapshot: string | null;
  metCharacterIds?: string[];
  visitRecords?: VisitRecord[];
  scannedTrapDays?: number[];
  forecastDays?: number[];
  unlockedIntelIds?: string[];
  claimedCodexMilestones?: string[];
  learnedSkills?: SkillId[];
  skillUsesTonight?: string[];
  craftOrderCounter?: number;
  streetZone?: StreetZone;
  streetVisitedToday?: string[];
  bookstoreVisitsTotal?: number;
  log: string[];
  message: string;
}

export interface StageDialogueView {
  speaker: string;
  roleTag: string;
  identity?: string;
  traits?: string[];
  characterId?: string;
  cue: string;
  line: string;
  step: number;
  total: number;
  finished: boolean;
  eerie?: boolean;
  summaryNote?: string;
}

export interface StageView {
  title: string;
  description: string;
  notice?: string;
  dialogue?: StageDialogueView;
  steps?: SiteStepDef[];
  moves: ActionOption[];
}
