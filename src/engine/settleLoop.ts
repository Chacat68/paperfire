import { getScheduledNightOrder } from '../data/night';
import type { ActionOption, GameState } from '../data/types';
import { dawn } from './nightLoop';
import { hasSkill, hasToken, note } from './state';
import { syncAndClaimDailyQuests } from './systemEngine';

export function buildSettleShopMoves(state: GameState): ActionOption[] {
  const isLast = state.day >= state.maxDay;
  if (isLast) {
    return [
      {
        id: 'dawn',
        title: '合账，盘点这场生死经营',
        detail: '进入终局评级与系统清算',
        primary: true,
        presentation: 'control',
        run: () => dawn(state)
      }
    ];
  }

  const done = state.settleChoreDone;
  const chosenId = state.settleChosenId;
  const choreReason = (id: string, missing: string) =>
    done ? (chosenId === id ? '今日已定此项' : '今日已定收尾铺务') : missing;
  const stampFor = (id: string) => (done && chosenId === id ? '已定' : undefined);

  const chooseChore = (id: string, fn: () => void) => () => {
    fn();
    state.settleChoreDone = true;
    state.settleChosenId = id;
    syncAndClaimDailyQuests(state);
  };

  const hasWardHeart = hasSkill(state, 'ward_heart');
  const hasWardBadge = hasToken(state, 'ward_badge');
  const cleanGain = hasWardBadge ? 3 : 2;
  const cleanYinDrop = hasWardHeart ? 2 : 1;
  const uneasyReady = state.uneasy && state.uneasyCleanDays >= 1;

  const moves: ActionOption[] = [
    {
      id: 'settle_clean_shop',
      title: hasWardHeart ? '扫灰焚香净铺 · 护心倍降' : '扫灰焚香净铺',
      detail: uneasyReady
        ? `【消煞就绪】纸料 −1 · 洁净 +${cleanGain} · 阴气 −${cleanYinDrop} · 立即清除「不对劲」`
        : state.uneasy
          ? `纸料 −1 · 洁净 +${cleanGain} · 阴气 −${cleanYinDrop}（消煞进度 0/1：需先稳过一晚常规夜或城隍堂上香）`
          : `纸料 −1 · 洁净 +${cleanGain}${hasWardBadge ? '(通行牌+1)' : ''} · 阴气 −${cleanYinDrop}`,
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '收尾铺务',
        client: uneasyReady
          ? '消煞进度 1/1 · 今晚可彻底驱散不对劲'
          : state.uneasy
            ? '消煞进度 0/1 · 需先稳夜或城隍堂上香'
            : '扫尽香灰 · 压阴回净',
        icon: 'broom',
        stats: [
          { label: '纸料', value: '−1', tone: 'cost' },
          { label: '洁净', value: `+${cleanGain}`, tone: 'gain' },
          { label: '阴气', value: `−${cleanYinDrop}`, tone: 'pts' }
        ],
        statusStamp: stampFor('settle_clean_shop') ?? (uneasyReady ? '可消煞' : undefined)
      },
      reason: choreReason('settle_clean_shop', state.s < 1 ? '纸料不足' : ''),
      run: chooseChore('settle_clean_shop', () => {
        state.s -= 1;
        state.c += cleanGain;
        state.h = Math.max(0, state.h - cleanYinDrop);
        if (state.uneasy && state.uneasyCleanDays >= 1) {
          state.uneasy = false;
          state.uneasyCleanDays = 0;
          note(
            state,
            `收尾扫净香灰并走完洁净仪轨（洁净 +${cleanGain}，阴气 −${cleanYinDrop}），铺里那股「不对劲」终于散尽。`
          );
        } else {
          note(
            state,
            `收尾扫净柜台香灰并焚香净铺：洁净 +${cleanGain}${hasWardBadge ? '（三号病房通行牌 +1）' : ''}，阴气 −${cleanYinDrop}。`
          );
        }
      })
    },
    {
      id: 'settle_tidy_free',
      title: '收拾残纸守铺',
      detail: '无消耗 · 洁净 +1 · 省料稳妥收尾',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '稳妥收尾',
        client: '归拢纸边 · 零消耗保底',
        icon: 'lantern',
        stats: [
          { label: '消耗', value: '免费', tone: 'pts' },
          { label: '洁净', value: '+1', tone: 'gain' }
        ],
        statusStamp: stampFor('settle_tidy_free')
      },
      reason: choreReason('settle_tidy_free', ''),
      run: chooseChore('settle_tidy_free', () => {
        state.c += 1;
        note(state, '把散落纸屑扫进竹筐、理齐柜台工具，静候天明（洁净 +1）。');
      })
    }
  ];

  // 雇佣 / 安抚伙计小栓
  if (!state.helper.hired) {
    moves.push({
      id: 'settle_hire_helper',
      title: '雇佣伙计 · 小栓',
      detail: '现金 −25 · 初始胆量 6（夜履约可搭手减压 −1）',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '铺面帮工',
        client: '街口小栓 · 明日上工搭手',
        icon: 'helper',
        stats: [
          { label: '现金', value: '−25', tone: 'cost' },
          { label: '胆量', value: '6/10', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_hire_helper')
      },
      reason: choreReason('settle_hire_helper', state.m < 25 ? '现金不足' : ''),
      run: chooseChore('settle_hire_helper', () => {
        state.m -= 25;
        state.helper.hired = true;
        state.helper.nerve = 6;
        note(state, '托人谈妥雇下小栓当帮工（胆量 6），明日夜里可喊他搭把手。');
      })
    });
  } else if (state.helper.nerve < 9) {
    moves.push({
      id: 'settle_calm_helper',
      title: `热汤安抚小栓`,
      detail: `现金 −10 · 胆量 +2（当前 ${state.helper.nerve}/10）`,
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '铺面帮工',
        client: `当前胆量 ${state.helper.nerve}/10 · 压惊恢复夜班`,
        icon: 'helper',
        stats: [
          { label: '现金', value: '−10', tone: 'cost' },
          { label: '胆量', value: '+2', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_calm_helper')
      },
      reason: choreReason('settle_calm_helper', state.m < 10 ? '现金不足' : ''),
      run: chooseChore('settle_calm_helper', () => {
        state.m -= 10;
        state.helper.nerve = Math.min(10, state.helper.nerve + 2);
        note(state, `收摊后给小栓煮了碗热汤压惊，胆量回升至 ${state.helper.nerve}/10。`);
      })
    });
  }

  // 具名人情卡 · 陈婶街坊圆场
  if (state.favorCards.includes('card_chen')) {
    moves.push({
      id: 'settle_use_card_chen',
      title: '动用人情卡 · 陈婶圆场',
      detail: '镇民信任 +2 · 彻底消解镇群传闻',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '人情善后',
        client: '请陈婶街口替铺子说好话',
        icon: 'rumor',
        stats: [
          { label: '信任', value: '+2', tone: 'gain' },
          { label: '传闻', value: '清零', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_use_card_chen')
      },
      reason: choreReason('settle_use_card_chen', ''),
      run: chooseChore('settle_use_card_chen', () => {
        state.favorCards = state.favorCards.filter((c) => c !== 'card_chen');
        state.ty += 2;
        state.rumor = false;
        state.calmDone = true;
        note(state, '动用陈婶人情卡替铺子圆场：镇民信任 +2，传闻彻底压平。');
      })
    });
  }

  // 花钱托人洗掉一笔把柄（习得宗师技「阴阳敕令」半价 12 现且不限次数）
  if (state.handle > 0) {
    const hasDecree = hasSkill(state, 'ward_decree');
    const washCost = hasDecree ? 12 : 24;
    moves.push({
      id: 'settle_wash_handle',
      title: hasDecree ? '敕令清账 · 洗掉把柄' : '托人洗掉把柄',
      detail: hasDecree
        ? `现金 −${washCost} · 把柄 −1（阴阳敕令半价且不限次数）`
        : `现金 −${washCost} · 把柄 −1（本局限洗 1 次）`,
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '清账除刺',
        client: `当前留有 ${state.handle} 笔暗债`,
        icon: 'wash',
        stats: [
          { label: '现金', value: `−${washCost}`, tone: 'cost' },
          { label: '把柄', value: '−1', tone: 'pts' }
        ],
        statusStamp: stampFor('settle_wash_handle')
      },
      reason: choreReason(
        'settle_wash_handle',
        !hasDecree && state.washedHandleThisRun
          ? '本局已洗过一次'
          : state.m < washCost
            ? '现金不足'
            : ''
      ),
      run: chooseChore('settle_wash_handle', () => {
        state.m -= washCost;
        state.handle = Math.max(0, state.handle - 1);
        if (!hasDecree) state.washedHandleThisRun = true;
        note(
          state,
          hasDecree
            ? '以阴阳敕令行文清账，半价抹平账上一笔把柄！'
            : '连夜托镇上熟人把账上一笔把柄抹平了。'
        );
      })
    });
  }

  // 高阴气或传闻时：预约明晚闭门歇铺
  const nextNightPreview = getScheduledNightOrder(Math.min(state.maxDay, state.day + 1), state.h);
  if (!nextNightPreview.peak && (state.h >= 10 || state.rumor)) {
    moves.push({
      id: 'settle_plan_rest',
      title: '预约明晚闭门歇铺',
      detail: '无消耗 · 阴气 −2 · 明晚阴气 < 12 时直接平安歇夜',
      presentation: 'card',
      card: {
        kind: 'shop_chore',
        tag: '止损休整',
        client: '挂出歇业木牌 · 稳住阴气',
        icon: 'rest',
        stats: [
          { label: '阴气', value: '−2', tone: 'pts' },
          { label: '明夜', value: '闭门歇铺', tone: 'gain' }
        ],
        statusStamp: stampFor('settle_plan_rest')
      },
      reason: choreReason('settle_plan_rest', ''),
      run: chooseChore('settle_plan_rest', () => {
        state.h = Math.max(0, state.h - 2);
        state.restNextNight = true;
        note(state, '提前挂好明晚歇业木牌并净心收铺：阴气 −2，明晚若阴气 < 12 将直接平安歇夜。');
      })
    });
  }

  moves.push({
    id: 'dawn',
    title: '迎接明日天明',
    detail: done ? '核验今日存活 · 结算口粮' : '请先在左侧选定 1 项铺务决策',
    primary: done,
    presentation: 'control',
    reason: done ? '' : '先择一项铺务收尾决策',
    run: () => dawn(state)
  });

  return moves;
}
