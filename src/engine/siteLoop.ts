import type { ActionOption, GameState } from '../data/types';
import { getActiveNightOrder, settleNight } from './nightLoop';
import { hasSkill, note } from './state';

export function buildSiteMoves(state: GameState): ActionOption[] {
  const order = getActiveNightOrder(state);
  const has = (step: string) => state.steps.includes(step);
  const boltBonus = state.upgrades.includes('iron_bolt') ? 1 : 0;
  const hasCraftMaster = hasSkill(state, 'craft_master');
  const hasSightEye = hasSkill(state, 'sight_eye');
  const hasWardFlame = hasSkill(state, 'ward_flame');
  const hasWardHeart = hasSkill(state, 'ward_heart');
  const hasWardDecree = hasSkill(state, 'ward_decree');
  const ritePaperCost = hasCraftMaster ? 0 : 1;
  const needClean = (base: number) => Math.max(1, base - (hasSightEye ? 1 : 0));
  const usedSkill = (key: string) => Boolean(state.skillUsesTonight?.includes(key));
  const markSkillUsed = (key: string) => {
    state.skillUsesTonight ??= [];
    if (!state.skillUsesTonight.includes(key)) state.skillUsesTonight.push(key);
  };
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
    const reqC = needClean(4);
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
            : state.c < reqC
              ? `洁净至少需要 ${reqC}`
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
        seatReason() || (state.c < reqC ? `洁净至少需要 ${reqC}` : '')
      ),
      siteAction(
        'improvise',
        '临时安座（歪办）',
        hasWardHeart ? '局面 −1 · 纸火护心免增阴气' : '局面 −1 · 阴气 +1',
        () => {
          if (!hasWardHeart) state.h += 1;
          recordStep(
            'seated',
            hasWardHeart ? '纸人坐下去了，内火护心未让阴气趁虚而入。' : '纸人坐下去了，屋里却冷了一截。',
            1
          );
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
    const reqC = needClean(2);
    moves = [
      siteAction(
        'incense',
        '按旧例点定神香',
        '洁净 −1 · 局面 −2',
        () => {
          state.c -= 1;
          recordStep('incense', '三支定神香立稳，门槛黑水不再往前漫。', 2);
        },
        has('incense') ? '定神香已点' : state.c < reqC ? `洁净至少需要 ${reqC}` : ''
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
        `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −${2 + boltBonus}`,
        () => {
          state.s -= ritePaperCost;
          state.c -= 1;
          recordStep('ward_door', '你一声未吭，把镇门敕令拍死在门缝上。', 2 + boltBonus);
        },
        has('ward_door')
          ? '镇门敕令已贴'
          : state.s < ritePaperCost
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
    const reqC = needClean(2);
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
        '定住柜台平安烛火',
        '洁净 −1 · 局面 −2',
        () => {
          state.c -= 1;
          recordStep('calm_flame', '蜡芯剪齐，柜台平安蜡烛与檐下「纸」「火」双红灯一齐稳亮。', 2);
        },
        has('calm_flame')
          ? '烛火已稳'
          : !has('audit_ledger')
            ? '先摊账对簿'
            : state.c < reqC
              ? `洁净至少需要 ${reqC}`
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
  } else if (order.id === 'n6_peak_bride') {
    const reqC = needClean(3);
    moves = [
      siteAction(
        'peak-veil-ward',
        '挂朱砂红帐隔目（避讳奇策）',
        `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}局面 −2 · 阴气 −1（不耗洁净）`,
        () => {
          state.s -= ritePaperCost;
          state.h = Math.max(0, state.h - 1);
          recordStep('veil_ward', '你垂下朱砂红帐遮住红盖头，隔断了那道直勾勾的婚煞（局面 −2，阴气 −1）。', 2);
        },
        has('veil_ward') ? '红帐已挂稳' : state.s < ritePaperCost ? '缺纸料' : ''
      ),
      siteAction(
        'rite-orthodox',
        '垂目敬香 · 献素纸花轿',
        `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −3（不视盖头）`,
        () => {
          state.s -= ritePaperCost;
          state.c -= 1;
          recordStep('rite_main', '你全程垂目不视红盖头，焚三炷安魂香将素纸花轿隔台献出。', 3);
        },
        has('rite_main')
          ? '已完成「垂目敬香献轿」'
          : state.s < ritePaperCost
            ? '缺纸料'
            : state.c < reqC
              ? `正统仪轨需洁净 ≥ ${reqC}`
              : ''
      ),
      siteAction(
        'rite-improvise',
        '低头急糊替轿（歪办）',
        hasWardHeart ? '局面 −1 · 纸火护心免增阴气' : '局面 −1 · 阴气 +1（低洁净兜底）',
        () => {
          if (!hasWardHeart) state.h += 1;
          recordStep('rite_main', '勉强低头糊出一顶素替轿递出，门外无声唢呐愈发刺耳。', 1);
        },
        has('rite_main') ? '已完成「垂目敬香献轿」' : ''
      ),
      siteAction(
        'seal',
        '合卺送轿出门',
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', '红盖头微微颔首，素轿随无声唢呐退入北巷深处。', boltBonus),
        finishReason('rite_main', '先完成「垂目敬香献轿」')
      )
    ];
  } else if (order.id === 'n10_temple_fair_peak') {
    const reqLampC = needClean(2);
    const reqC = needClean(3);
    moves = [
      siteAction(
        'peak-trim-lamps',
        '挑亮平安烛与双红灯',
        '洁净 −1 · 局面 −2（护火抗神威，后续正统仪轨免阴气反噬）',
        () => {
          state.c -= 1;
          recordStep('lamps_lit', '你稳手挑亮柜台平安蜡烛与门楣「纸」「火」双灯，火舌一涨，硬生生顶住门外百戏神威。', 2);
        },
        has('lamps_lit') ? '平安烛与双红灯已稳亮' : state.c < reqLampC ? `洁净至少需要 ${reqLampC}` : ''
      ),
      siteAction(
        'rite-orthodox',
        '焚高香 · 献三牲纸扎',
        has('lamps_lit')
          ? `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −3 · 护灯加成阴气 −1`
          : `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −3（不呼神讳）`,
        () => {
          state.s -= ritePaperCost;
          state.c -= 1;
          if (has('lamps_lit')) state.h = Math.max(0, state.h - 1);
          recordStep(
            'rite_main',
            has('lamps_lit')
              ? '前两红灯映照下，你按古礼献上引路大灯与三牲纸扎，游神威压顿消大半。'
              : '你闭口不呼神讳，按古礼燃高香献出三牲纸扎。',
            3
          );
        },
        has('rite_main')
          ? '已完成「亮灯献三牲纸扎」'
          : state.s < ritePaperCost
            ? '缺纸料'
            : state.c < reqC
              ? `正统仪轨需洁净 ≥ ${reqC}`
              : ''
      ),
      siteAction(
        'rite-improvise',
        '急摆素纸牲（歪办）',
        hasWardHeart ? '局面 −1 · 纸火护心免增阴气' : '局面 −1 · 阴气 +1（低洁净兜底）',
        () => {
          if (!hasWardHeart) state.h += 1;
          recordStep('rite_main', '仓促摆出素纸牲顶数，门外鼓点沉了一拍，屋里阴气加重。', 1);
        },
        has('rite_main') ? '已完成「亮灯献三牲纸扎」' : ''
      ),
      siteAction(
        'seal',
        '礼送游神过街',
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', '百戏鼓点渐远，两道朱砂幡旗缓缓隐入十里阴市。', boltBonus),
        finishReason('rite_main', '先完成「亮灯献三牲纸扎」')
      )
    ];
  } else if (order.id === 'n13_peak_empty_chair') {
    const reqC = needClean(3);
    moves = [
      siteAction(
        'peak-avert-chair',
        '摊账掩目 · 绝不数屋里人',
        '无消耗 · 局面 −2（紧盯账页压住空椅异响）',
        () => recordStep('avert_chair', '你低头紧盯阴阳账页，任凭身后太师椅吱呀作响，绝不回头清点人影。', 2),
        has('avert_chair') ? '已定神掩目' : ''
      ),
      siteAction(
        'rite-orthodox',
        '目不斜视 · 摆三折纸戏偶',
        `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −3`,
        () => {
          state.s -= ritePaperCost;
          state.c -= 1;
          recordStep('rite_main', '你目不斜视把生旦净丑三折纸戏偶依次摆在灯前，水袖戏腔顿时柔和下来。', 3);
        },
        has('rite_main')
          ? '已完成「献三折纸戏偶」'
          : state.s < ritePaperCost
            ? '缺纸料'
            : state.c < reqC
              ? `正统仪轨需洁净 ≥ ${reqC}`
              : ''
      ),
      siteAction(
        'rite-improvise',
        '匆忙摆替偶（歪办）',
        hasWardHeart ? '局面 −1 · 纸火护心免增阴气' : '局面 −1 · 阴气 +1（低洁净兜底）',
        () => {
          if (!hasWardHeart) state.h += 1;
          recordStep('rite_main', '手忙脚乱摆上素纸替偶凑完堂会，空椅边阴风顿起。', 1);
        },
        has('rite_main') ? '已完成「献三折纸戏偶」' : ''
      ),
      siteAction(
        'seal',
        '鸣锣散戏送客',
        boltBonus ? '玄铁门闩加成 · 完成交付' : '完成交付',
        () => recordStep('done', '一声清脆散场锣落定，月光下的空太师椅悄然隐去。', boltBonus),
        finishReason('rite_main', '先完成「献三折纸戏偶」')
      )
    ];
  } else {
    // D7–D14 常规诡异履约 + 6 位「异闻奇客」专属破局招式（正统/歪办分流）
    const mainStep = order.steps[0];
    const doneStep = order.steps[order.steps.length - 1];
    const reqC = needClean(order.peak ? 3 : 2);
    const viralSpecialMove: ActionOption | null = (() => {
      if (order.id === 'n_vir_courier') {
        return siteAction(
          'vir-five-star',
          '奇策 · 朱砂勾五星好评',
          '零消耗 · 局面 −2 · 阴气 −1（不窥餐箱，直接稳住 4:44 骑手）',
          () => {
            state.h = Math.max(0, state.h - 1);
            recordStep('vir_tactic', '你目不斜视在湿回执上大笔勾出「★★★★★五星好评」，#444 餐箱顿时安静下来（局面 −2，阴气 −1）。', 2);
          },
          has('vir_tactic') ? '五星好评已勾妥' : ''
        );
      }
      if (order.id === 'n_vir_surgeon') {
        return siteAction(
          'vir-refuse-pill',
          '奇策 · 拒吞白药隔台验单',
          '零消耗 · 局面 −2 · 洁净 +1（推回试吃药片，立破三号病房威压）',
          () => {
            state.c += 1;
            recordStep('vir_tactic', '你用纸镊把白药片原封推回柜外，笑面诡医眯眼赞了声「警觉」，收起手术刀（局面 −2，洁净 +1）。', 2);
          },
          has('vir_tactic') ? '已拒药立规' : ''
        );
      }
      if (order.id === 'n_vir_senior') {
        return siteAction(
          'vir-listen-elegy',
          '奇策 · 闭目静听断弦终曲',
          '零消耗 · 局面 −2 · 阴气 −1（不打断琴声，安抚四楼学姐执念）',
          () => {
            state.h = Math.max(0, state.h - 1);
            recordStep('vir_tactic', '你垂眸静听完最后一节断弦安魂调，血红裙摆上的阴煞悄然化作一缕暖雾（局面 −2，阴气 −1）。', 2);
          },
          has('vir_tactic') ? '终曲已静听毕' : ''
        );
      }
      if (order.id === 'n_vir_zodiac_goat') {
        return siteAction(
          'vir-rule-bet',
          '奇策 · 按规押筹拆穿谎牌',
          '零消耗 · 局面 −2 · 额外赢 +6 纸火点（直指猩红「谎」牌，不揭羊面）',
          () => {
            state.pts += 6;
            recordStep('vir_tactic', '你稳手点破悬空的猩红「谎」牌且绝不触碰面具，「人羊」击节轻笑掷下额外 6 点纸火筹码（局面 −2，纸火点 +6）！', 2);
          },
          has('vir_tactic') ? '谎牌已拆穿赢筹' : ''
        );
      }
      if (order.id === 'n_vir_jester') {
        return siteAction(
          'vir-counter-bluff',
          '奇策 · 反将一军以假乱真',
          '零消耗 · 局面 −2 · 反薅 +8 纸火点（戳破红中老千骰，绝不换真名）',
          () => {
            state.pts += 8;
            recordStep('vir_tactic', '你一眼看穿他骨骰灌铅的把戏，顺手倒扣账本反将一军，红中客大笑认栽反赔 8 点纸火（局面 −2，纸火点 +8）！', 2);
          },
          has('vir_tactic') ? '已反将一军薅点' : ''
        );
      }
      if (order.id === 'n_vir_puppets') {
        return siteAction(
          'vir-cut-echo',
          '奇策 · 无视木偶只答执线人',
          '零消耗 · 局面 −2 · 阴气 −1（截断腹语诱问，稳住镜廊双生煞）',
          () => {
            state.h = Math.max(0, state.h - 1);
            recordStep('vir_tactic', '任凭小红木偶歪头咯咯发问，你全程只向执线人报尺核线，绷紧的朱砂丝瞬间平息（局面 −2，阴气 −1）。', 2);
          },
          has('vir_tactic') ? '已无视腹语定局' : ''
        );
      }
      return null;
    })();
    moves = [
      ...(viralSpecialMove ? [viralSpecialMove] : []),
      siteAction(
        'rite-orthodox',
        `正统仪轨 · ${mainStep.label}`,
        `${ritePaperCost ? '纸料 −1 · ' : '鬼斧免料 · '}洁净 −1 · 局面 −${order.peak ? 3 : 2}`,
        () => {
          state.s -= ritePaperCost;
          state.c -= 1;
          recordStep('rite_main', `你严守「${order.taboo}」，以正统仪轨办妥「${mainStep.label}」。`, order.peak ? 3 : 2);
        },
        has('rite_main')
          ? `已完成「${mainStep.label}」`
          : state.s < ritePaperCost
            ? '缺纸料'
            : state.c < reqC
              ? `正统仪轨需洁净 ≥ ${reqC}`
              : ''
      ),
      siteAction(
        'rite-improvise',
        `应急歪办 · ${mainStep.label}`,
        hasWardHeart ? '局面 −1 · 纸火护心免增阴气' : '局面 −1 · 阴气 +1（洁净不足时兜底）',
        () => {
          if (!hasWardHeart) state.h += 1;
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

  // 主动技能 1：初阶 · 借火定神（每夜限 1 次，零消耗，局面 -2 · 洁净 +1）
  if (hasWardFlame) {
    const flameAction = siteAction(
      'skill-ward-flame',
      '技 · 借灯定神',
      '零消耗 · 每夜 1 次 · 局面 −2 · 洁净 +1',
      () => {
        markSkillUsed('ward_flame');
        state.c += 1;
        lowerThreat(2);
        note(state, '【借火定神】你抬手引柜台平安蜡烛与檐下「纸」「火」双灯阳火定神，诡影气焰立退两分（局面 −2，洁净 +1）！');
      },
      usedSkill('ward_flame') ? '今夜已施展过「借灯定神」' : state.threat <= 0 ? '局面已稳' : ''
    );
    flameAction.skill = true;
    moves.push(flameAction);
  }

  // 主动技能 2：宗师 · 阴阳敕令（每夜限 1 次，零消耗，直接推进当前核心前置步骤 + 局面 -3）
  if (hasWardDecree) {
    const pendingStep = order.steps.find((st) => st.key !== 'done' && !has(st.key));
    const decreeAction = siteAction(
      'skill-ward-decree',
      '技 · 阴阳敕令',
      pendingStep
        ? `零消耗 · 每夜 1 次 · 直推「${pendingStep.label}」且局面 −3`
        : '零消耗 · 每夜 1 次 · 局面 −3（全步骤已备）',
      () => {
        markSkillUsed('ward_decree');
        if (pendingStep) {
          state.steps.push(pendingStep.key);
        }
        lowerThreat(3);
        note(
          state,
          `【阴阳敕令】朱砂总敕凌空一压，${pendingStep ? `直接稳妥办妥「${pendingStep.label}」并` : ''}镇灭三分煞气（局面 −3）！`
        );
      },
      usedSkill('ward_decree')
        ? '今夜已施展过「阴阳敕令」'
        : !pendingStep && state.threat <= 0
          ? '局面与步骤均已稳妥'
          : ''
    );
    decreeAction.skill = true;
    moves.push(decreeAction);
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

  // P2 #11 伙计小栓夜班搭手（胆量 <= 2 拒夜班；习得「纸火护心」每夜首次不掉胆量）
  if (state.helper.hired) {
    const freeNerve = hasWardHeart && !usedSkill('helper_free_assist');
    moves.push(
      siteAction(
        'helper-assist',
        `喊伙计小栓搭把手（胆量 ${state.helper.nerve}）`,
        freeNerve
          ? '不耗纸料 · 局面 −1 · 纸火护心免掉胆量'
          : '不耗纸料 · 局面 −1 · 伙计胆量 −1',
        () => {
          if (freeNerve) {
            markSkillUsed('helper_free_assist');
          } else {
            state.helper.nerve = Math.max(0, state.helper.nerve - 1);
          }
          lowerThreat(1);
          note(
            state,
            freeNerve
              ? `小栓借你护心火势稳住门框与香火（局面 −1，纸火护心未损胆量）。`
              : `小栓咬牙替你稳住门框与香火（局面 −1，胆量降至 ${state.helper.nerve}）。`
          );
        },
        state.helper.nerve <= 2
          ? '小栓吓得发抖，拒上夜班（每晚收尾铺务须热汤安抚，或用醒神清心丸压惊）'
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
