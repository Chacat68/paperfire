import { DAY_META, getNightOrderById, getScheduledNightOrder } from '../data/night';
import { SCENARIOS } from '../data/scenarios';
import { SHOP_UPGRADES, SYSTEM_SUPPLIES, type ShopIconKind } from '../data/systemShop';
import type { GameState, NightOutcome, ScenarioId, ShopUpgradeId, SkillId } from '../data/types';
import { OUTCOME_LABELS, buildLedgerNotes, isNightPhase } from '../engine';
import { makeActionButton } from './stage';
import {
  createSystemPanelController,
  type SystemTabId,
  type VisitorFilterKind
} from './systemPanel';

const SHOP_ITEM_ICONS: Record<ShopIconKind, string> = {
  ration_1:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h22a11 11 0 0 1-22 0Z"/><path d="M10 17c1-3.5 3.5-5 6-5s5 1.5 6 5"/><path d="M12 8.5c0-1.5 1-2.5 1-3.5M16 9c0-1.5 1-2.5 1-4M20 8.5c0-1.5 1-2.5 1-3.5"/><path d="M10 27.5h12"/></svg>',
  ration_3:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11h14l3 14a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3l3-14Z"/><path d="M11 11 9 6h14l-2 5"/><path d="M8.5 15.5h15M16 11v17"/><circle cx="16" cy="15.5" r="2" fill="currentColor"/></svg>',
  clean_paper:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12 16 7l10 5-10 5-10-5Z"/><path d="M6 17l10 5 10-5M6 22l10 5 10-5"/><path d="M16 7v20"/></svg>',
  calm_pill:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5h8v3.5l4.5 5.5A8 8 0 0 1 22 27H10a8 8 0 0 1-2.5-13L12 8.5V5Z"/><path d="M11 5h10M11 18.5h10"/><circle cx="16" cy="22" r="2.2" fill="currentColor"/></svg>',
  talisman:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3.5" width="14" height="25" rx="1.5"/><path d="M12.5 8h7M16 8v15M12.5 13h7M13 18h6M16 23l-2.5 2M16 23l2.5 2"/></svg>',
  ward_doll:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="16" cy="8.5" r="4"/><path d="M8.5 16l4-2.5h7l4 2.5-2.5 3-2-1.2 1.5 10.2h-9l1.5-10.2-2 1.2-2.5-3Z"/><circle cx="14.5" cy="8.2" r=".7" fill="currentColor"/><circle cx="17.5" cy="8.2" r=".7" fill="currentColor"/><path d="M16 14v13"/></svg>',
  copper_bell:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h22M16 7v4"/><path d="M10 20c0-5 2.5-9 6-9s6 4 6 9l2 3H8l2-3Z"/><circle cx="16" cy="25.5" r="2"/><path d="M16 27.5V30"/></svg>',
  jade_censer:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 15h18l-2 8H9l-2-8Z"/><path d="M5 15c0-2 1.5-3 3-3M27 15c0-2-1.5-3-3-3"/><path d="M10 23l-1.5 5M16 23v5.5M22 23l1.5 5"/><path d="M12 11c0-2 1.2-3 0-5M16 12c0-2.5 1.4-3.5 0-6M20 11c0-2 1.2-3 0-5"/></svg>',
  iron_bolt:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="13" width="24" height="6" rx="1"/><path d="M9 8v16M23 8v16"/><circle cx="13" cy="16" r="1.2" fill="currentColor"/><circle cx="19" cy="16" r="1.2" fill="currentColor"/><path d="M25 11v10"/></svg>',
  tall_cabinet:
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="20" height="24" rx="1"/><path d="M6 12h20M6 20h20M16 4v24"/><path d="M10 8h2M20 8h2M10 16h2M20 16h2M10 24h2M20 24h2"/></svg>'
};

export interface DialogsController {
  renderLedger(state: GameState): void;
  renderSystemShop(state: GameState): void;
  openLedger(state: GameState): void;
  flipLedgerPage(delta: number): void;
  openSystemShop(state: GameState): void;
  openSettings(focusRoutes?: boolean): void;
  openRoutes(): void;
  openDawnRitual(state: GameState, survivedDay: number, prevOutcome: NightOutcome | undefined, onClose?: () => void): void;
  confirmDanger(text: string, onConfirm: () => void): void;
  isAnyOpen(): HTMLDialogElement | null;
  markLogSeen(count: number): void;
}

const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五'];

function toChineseVol(day: number): string {
  return `卷之${CN_NUM[day] ?? day}`;
}

function classifyLogEntry(text: string): { tag: string; cls: string } {
  if (text.includes('识破') || text.includes('诱杀')) return { tag: '诡破', cls: 'eerie' };
  if (text.includes('系统') || text.includes('纸火点') || text.includes('兑换') || text.includes('指标')) {
    return { tag: '系统', cls: 'sys' };
  }
  if (text.includes('活人') || text.includes('订金') || text.includes('进货') || text.includes('补了货')) {
    return { tag: '阳账', cls: 'day' };
  }
  if (text.includes('夜') || text.includes('诡') || text.includes('把柄') || text.includes('阴气')) {
    return { tag: '阴账', cls: 'eerie' };
  }
  return { tag: '记事', cls: 'note' };
}

export interface SystemDialogHooks {
  onLearnSkill?: (skillId: SkillId) => boolean;
  onIntelScan?: () => boolean;
  onIntelForecast?: () => boolean;
  onDecryptIntel?: (docId: string) => boolean;
  onInspectCharacter?: (characterId: string) => void;
}

export function createDialogsController(
  onSelectScenario: (id: ScenarioId, title: string) => void,
  onRedeemSupply: (supplyId: string) => boolean,
  onBuyUpgrade: (upgradeId: ShopUpgradeId) => boolean,
  onReplayPrologue: () => void,
  onResetRun: () => void,
  onFlipSound?: () => void,
  systemHooks: SystemDialogHooks = {}
): DialogsController {
  const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const ledgerDialog = byId<HTMLDialogElement>('ledger');
  const systemDialog = byId<HTMLDialogElement>('system-shop');
  const settingsDialog = byId<HTMLDialogElement>('settings-dialog');
  const confirmDialog = byId<HTMLDialogElement>('confirmation');
  const dawnDialog = byId<HTMLDialogElement>('dawn-ritual');
  const systemPanel = createSystemPanelController();

  let seenLogCount = 0;
  let pendingConfirm: (() => void) | null = null;
  let pendingDawnClose: (() => void) | null = null;
  let toastTimer = 0;
  let ledgerViewDay = 1;
  let lastLedgerState: GameState | null = null;
  let lastSystemState: GameState | null = null;
  let activeSystemTab: SystemTabId = 'exchange';

  function setSystemTab(tab: SystemTabId) {
    activeSystemTab = tab;
    const tabsEl = byId('system-tabs');
    tabsEl.querySelectorAll<HTMLButtonElement>('button[data-sys-tab]').forEach((btn) => {
      const active = btn.dataset.sysTab === tab;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    systemDialog.querySelectorAll<HTMLElement>('.sys-tab-panel[data-sys-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.sysPanel !== tab;
    });
  }

  function animateLedgerFlip(dir: 'prev' | 'next') {
    const book = byId('ledger-book');
    book.classList.remove('flip-next', 'flip-prev');
    void book.offsetWidth;
    book.classList.add(dir === 'next' ? 'flip-next' : 'flip-prev');
  }

  function renderLedgerPage(state: GameState) {
    lastLedgerState = state;
    const maxPage = Math.max(1, state.day);
    ledgerViewDay = Math.max(1, Math.min(maxPage, ledgerViewDay));
    const isToday = ledgerViewDay === state.day;
    const nighttime = isNightPhase(state.phase);
    const meta = DAY_META[ledgerViewDay] ?? DAY_META[1];
    const outcome = state.outcomes[ledgerViewDay];

    // 顶部按钮与红点同步
    byId('ledger-btn-label').textContent = nighttime ? '夜账' : '日账';
    byId('ledger-dot').hidden = ledgerDialog.open || state.log.length <= seenLogCount;

    // 顶部书签条：每一日一个书签，可直跳翻阅
    const bmEl = byId('ledger-bookmarks');
    bmEl.replaceChildren();
    for (let d = 1; d <= maxPage; d++) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.role = 'tab';
      tab.className = `ledger-bm${d === ledgerViewDay ? ' active' : ''}${d === state.day ? ' today' : ''}`;
      tab.setAttribute('aria-selected', String(d === ledgerViewDay));
      tab.dataset.day = String(d);
      tab.textContent = d === state.day ? `${CN_NUM[d] ?? d} · 今` : `${CN_NUM[d] ?? d}`;
      tab.title = `${toChineseVol(d)} · ${DAY_META[d]?.title ?? ''}`;
      bmEl.append(tab);
    }

    // 左页头部与印章
    byId('ledger-page-vol').textContent = toChineseVol(ledgerViewDay);
    byId('ledger-title').textContent = isToday
      ? nighttime
        ? '夜里那本账'
        : '白天明面账'
      : '往日归档老账';
    byId('ledger-sub').textContent = isToday
      ? nighttime
        ? '阴页 · 今夜诡异需求、禁忌与系统奖惩'
        : '阳页 · 今日活人收支、口粮与铺面盘点'
      : `封存页 · ${meta.title} 经营记录`;

    const sealText = outcome
      ? OUTCOME_LABELS[outcome] ?? '已结'
      : isToday
        ? nighttime
          ? '夜审中'
          : '营业中'
        : '已归档';
    const sealEl = byId('ledger-page-seal');
    sealEl.textContent = sealText;
    sealEl.classList.toggle('settled', Boolean(outcome));

    byId('ledger-day-name').textContent = meta.title;
    byId('ledger-day-yi').textContent = isToday && nighttime ? meta.yiNight : meta.yiDay;

    // 左页主体切换：今日实时盘点 vs 往日归档摘要
    byId('ledger-today-panel').hidden = !isToday;
    byId('ledger-archive-panel').hidden = isToday;

    if (isToday) {
      const lines = buildLedgerNotes(state);
      byId('notes').innerHTML = lines.map(([label, detail]) => `<li><b>${label}</b>${detail}</li>`).join('');
    } else {
      byId('ledger-archive-dayline').textContent = `【白昼】${meta.dayLine}`;
      byId('ledger-archive-nightline').textContent = `【入夜】${meta.nightLine}`;
      const statusSummary = outcome ? OUTCOME_LABELS[outcome] ?? outcome : '平稳度过';
      byId('ledger-archive-meta').innerHTML = `
        <span><b>当夜结账</b>${statusSummary}</span>
        <span><b>黄历日忌</b>${meta.yiNight}</span>
      `;
    }

    // 右页：筛选该日流水记录
    const prefix = `D${ledgerViewDay} · `;
    const dayEntries = state.log
      .filter((entry) => entry.startsWith(prefix))
      .map((entry) => entry.slice(prefix.length));

    byId('ledger-log-heading').textContent = isToday ? '今日收支与经过流水' : `${toChineseVol(ledgerViewDay)} · 当日流水明细`;
    byId('ledger-log-count').textContent = `共 ${dayEntries.length} 笔`;

    const logEl = byId('log');
    logEl.replaceChildren();
    if (dayEntries.length > 0) {
      dayEntries.forEach((text, idx) => {
        const { tag, cls } = classifyLogEntry(text);
        const li = document.createElement('li');
        li.className = `lf-item lf-${cls}`;
        const num = document.createElement('span');
        num.className = 'lf-num';
        num.textContent = String(idx + 1).padStart(2, '0');
        const badge = document.createElement('b');
        badge.className = 'lf-tag';
        badge.textContent = tag;
        const body = document.createElement('span');
        body.className = 'lf-text';
        body.textContent = text;
        li.append(num, badge, body);
        logEl.append(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'lf-empty';
      li.textContent = isToday
        ? '今日尚未落笔流水。接下一笔活人单或外出走动后，账目会自动记入此页。'
        : outcome
          ? `【前账已合】当日「${meta.title}」以「${OUTCOME_LABELS[outcome] ?? outcome}」归档入册，细目已随旧页封存。`
          : '此页暂未记有额外流水。';
      logEl.append(li);
    }

    byId('ledger-page-num').textContent = `第 ${ledgerViewDay} / ${maxPage} 页`;
    byId('ledger-pager-info').textContent = `当前翻阅：${toChineseVol(ledgerViewDay)} · ${meta.title}`;
    (byId('ledger-prev') as HTMLButtonElement).disabled = ledgerViewDay <= 1;
    (byId('ledger-next') as HTMLButtonElement).disabled = ledgerViewDay >= maxPage;
  }

  function setLedgerDay(nextDay: number) {
    if (!lastLedgerState) return;
    const clamped = Math.max(1, Math.min(lastLedgerState.day, nextDay));
    if (clamped === ledgerViewDay) return;
    const dir = clamped > ledgerViewDay ? 'next' : 'prev';
    ledgerViewDay = clamped;
    renderLedgerPage(lastLedgerState);
    animateLedgerFlip(dir);
    onFlipSound?.();
  }

  byId('ledger-bookmarks').addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-day]');
    if (!btn) return;
    const d = Number(btn.dataset.day);
    if (Number.isFinite(d)) setLedgerDay(d);
  });

  byId('ledger-prev').addEventListener('click', () => setLedgerDay(ledgerViewDay - 1));
  byId('ledger-next').addEventListener('click', () => setLedgerDay(ledgerViewDay + 1));
  byId('ledger-jump-today').addEventListener('click', () => {
    if (lastLedgerState) setLedgerDay(lastLedgerState.day);
  });

  function showShopToast(text: string) {
    const el = byId('system-shop-toast');
    el.textContent = text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.classList.remove('show');
    }, 2200);
  }

  byId('route-actions').replaceChildren(
    ...SCENARIOS.map((sc) =>
      makeActionButton(
        {
          id: sc.id,
          title: sc.title,
          detail: sc.detail,
          run: () => {}
        },
        ''
      )
    )
  );

  byId('route-actions').addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;
    const id = button.dataset.action as ScenarioId;
    const title = button.querySelector('strong')?.textContent ?? '';
    settingsDialog.close();
    onSelectScenario(id, title);
  });

  byId('system-tabs').addEventListener('click', (event) => {
    const tabBtn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-sys-tab]');
    if (!tabBtn) return;
    const tab = tabBtn.dataset.sysTab as SystemTabId;
    if (tab && tab !== activeSystemTab) {
      setSystemTab(tab);
      onFlipSound?.();
    }
  });

  systemDialog.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    const filterBtn = target.closest<HTMLButtonElement>('button[data-visitor-filter]');
    if (filterBtn) {
      const nextFilter = filterBtn.dataset.visitorFilter as VisitorFilterKind;
      if (nextFilter && lastSystemState) {
        systemPanel.setVisitorFilter(nextFilter);
        systemPanel.render(lastSystemState);
        onFlipSound?.();
      }
      return;
    }

    const charBtn = target.closest<HTMLButtonElement>('button[data-open-char]');
    if (charBtn) {
      const charId = charBtn.dataset.openChar;
      if (charId) {
        systemDialog.close();
        systemHooks.onInspectCharacter?.(charId);
      }
      return;
    }

    const button = target.closest<HTMLButtonElement>('button[data-action]');
    if (!button || button.disabled) return;
    const actionId = button.dataset.action ?? '';
    const cardName = button.dataset.cardTitle ?? '';
    if (actionId.startsWith('sys_')) {
      if (onRedeemSupply(actionId) && cardName) {
        showShopToast(`✓ 已兑换：${cardName}`);
      }
    } else if (actionId.startsWith('upg_')) {
      if (onBuyUpgrade(actionId.slice(4) as ShopUpgradeId) && cardName) {
        showShopToast(`✓ 已永久装配：${cardName}`);
      }
    } else if (actionId.startsWith('skill_')) {
      const skillId = actionId.slice('skill_'.length) as SkillId;
      if (systemHooks.onLearnSkill?.(skillId)) {
        showShopToast(`✓ 已习得技能「${cardName}」`);
      }
    } else if (actionId === 'intel_scan_trap') {
      if (systemHooks.onIntelScan?.()) {
        showShopToast('✓ 破绽扫描完成：已核实今夜禁忌并截取诱杀破绽');
      }
    } else if (actionId === 'intel_forecast_next') {
      if (systemHooks.onIntelForecast?.()) {
        showShopToast('✓ 天机预演完成：明日夜客与禁忌已归档');
      }
    } else if (actionId.startsWith('intel_doc_')) {
      const docId = actionId.slice('intel_doc_'.length);
      if (systemHooks.onDecryptIntel?.(docId)) {
        showShopToast(`✓ 已解密《${cardName}》（阴气 −1）`);
      }
    }
  });

  byId('replay-prologue').addEventListener('click', () => {
    settingsDialog.close();
    onReplayPrologue();
  });

  byId('reset-run').addEventListener('click', () => {
    settingsDialog.close();
    pendingConfirm = onResetRun;
    byId('consequence').textContent = '确定清除本地保存的本周目进度与剩余时辰，从第一日清晨重新开铺吗？';
    confirmDialog.showModal();
  });

  byId('confirm-action').addEventListener('click', () => {
    const fn = pendingConfirm;
    pendingConfirm = null;
    confirmDialog.close();
    if (fn) fn();
  });
  confirmDialog.addEventListener('close', () => {
    pendingConfirm = null;
  });

  byId('dawn-ritual-confirm').addEventListener('click', () => {
    dawnDialog.close();
  });
  dawnDialog.addEventListener('close', () => {
    const fn = pendingDawnClose;
    pendingDawnClose = null;
    if (fn) fn();
  });

  return {
    markLogSeen(count: number) {
      seenLogCount = count;
      byId('ledger-dot').hidden = true;
    },
    isAnyOpen() {
      return document.querySelector<HTMLDialogElement>('dialog[open]');
    },
    openSettings(focusRoutes = false) {
      settingsDialog.showModal();
      if (focusRoutes) {
        byId('settings-routes-section').scrollIntoView({ block: 'start' });
      } else {
        settingsDialog.scrollTop = 0;
      }
    },
    openRoutes() {
      this.openSettings(true);
    },
    openLedger(state: GameState) {
      seenLogCount = state.log.length;
      byId('ledger-dot').hidden = true;
      ledgerViewDay = state.day;
      renderLedgerPage(state);
      ledgerDialog.showModal();
    },
    flipLedgerPage(delta: number) {
      if (!ledgerDialog.open) return;
      setLedgerDay(ledgerViewDay + delta);
    },
    openSystemShop(state: GameState) {
      this.renderSystemShop(state);
      systemDialog.showModal();
    },
    confirmDanger(text: string, onConfirm: () => void) {
      pendingConfirm = onConfirm;
      byId('consequence').textContent = text;
      confirmDialog.showModal();
    },
    openDawnRitual(
      state: GameState,
      survivedDay: number,
      prevOutcome: NightOutcome | undefined,
      onClose?: () => void
    ) {
      pendingDawnClose = onClose ?? null;
      const prevNight =
        getNightOrderById(state.nightOrderHistory?.[survivedDay]) ??
        getScheduledNightOrder(survivedDay, state.h);
      const nextMeta = DAY_META[state.day] ?? DAY_META[1];
      const nextNight = getScheduledNightOrder(state.day, state.h);
      const starved = state.starveStreak > 0;
      const survivedPeak = Boolean(prevNight.peak && prevOutcome === 'success');

      const seal = starved ? '危' : survivedPeak ? '胜' : '存';
      const title = starved
        ? '今天惊险活下来了 · 急需补粮'
        : survivedPeak
          ? '顶格诡夜生还 · 今天成功活下来了！'
          : '今天成功活下来了';

      const quoteByOutcome: Record<string, string> = {
        success: '门外诡影随晨雾散尽，门楣「纸」「火」双红灯与平安烛安稳燃至五更。纸火经营系统已核销昨夜阴账，又从诡异小镇手里抢回一天性命。',
        rested: '昨夜早早落闩熄灯，铺门紧闭未沾半点阴风。鸡鸣声起时门缝透进微光，你在静寂中安然熬到了天明。',
        refused: '你死守门闩未让诡异得逞，虽少挣一笔夜赏，但总算平平安安把这条命留到了天亮。',
        pressed: '昨夜借人情强行压住了局面，账上虽添一笔暗债，好歹又把白昼盼了回来。',
        failed: '昨夜惊魂险些失守，所幸红灯未绝、性命尚在——今日务必净铺整备，莫让阴气继续蔓延。',
        fled: '昨夜退避保住一命，天明雾散后铺门犹在，重新打起精神应对今日阳账吧。'
      };

      const sealEl = byId('dawn-seal');
      sealEl.textContent = seal;
      sealEl.classList.remove('stamp-drop');
      void sealEl.offsetWidth;
      sealEl.classList.add('stamp-drop');

      byId('dawn-kicker').textContent = '鸡鸣卯时 · 今日存活签核';
      byId('dawn-ritual-title').textContent = title;
      byId('dawn-quote').textContent = quoteByOutcome[prevOutcome ?? 'success'] ?? quoteByOutcome.success;

      byId('dawn-survived-label').textContent = '熬过时辰：戌 → 亥 → 子 → 丑 → 寅 → 卯';
      byId('dawn-remaining-label').textContent = '卯时 06:00 · 天色已明';
      byId('dawn-progress-fill').style.width = '100%';

      const outcomeText = OUTCOME_LABELS[prevOutcome ?? ''] ?? '平安度夜';
      const rationText = starved
        ? `断供警告（${state.starveStreak}/2）· 工时 −1`
        : `已耗 1 份 · 余 ${state.ration} 份`;
      const censerBonus = state.upgrades.includes('jade_censer') ? '（沉香炉：阴气−1 洁净+1）' : '';

      const items: Array<[string, string, boolean?]> = [
        ['昨夜结账', outcomeText, prevOutcome === 'failed' || prevOutcome === 'fled'],
        ['生存口粮', rationText, starved || state.ration === 0],
        ['铺面阴气 / 洁净', `阴气 ${state.h} · 洁净 ${state.c}${censerBonus}`, state.h >= 12],
        ['当前资产', `现金 ${state.m} · 纸火点 ${state.pts} · 纸料 ${state.s}`, false]
      ];
      byId('dawn-tally').innerHTML = items
        .map(
          ([k, v, warn]) =>
            `<div class="${warn ? 'warn' : ''}"><dt>${k}</dt><dd>${v}</dd></div>`
        )
        .join('');

      byId('dawn-next-badge').textContent = '明日启幕';
      byId('dawn-next-title').textContent = nextMeta.title;
      byId('dawn-next-yi').textContent = nextMeta.yiDay;
      byId('dawn-next-line').textContent = nextNight.peak
        ? `【今日红警】${nextMeta.dayLine} 今夜将迎 3 回合顶格诡异「${nextNight.client}」，务必做好万全准备！`
        : nextMeta.dayLine;
      byId('dawn-confirm-label').textContent = '撕下旧黄历，迎明日开铺';

      dawnDialog.showModal();
      byId('dawn-ritual-confirm').focus({ preventScroll: true });
    },
    renderSystemShop(state: GameState) {
      lastSystemState = state;
      const inSite = state.phase === 'site';
      const statusEl = byId('system-shop-status');
      statusEl.innerHTML = [
        `<span class="sys-asset primary"><b>纸火点</b><strong>${state.pts}</strong></span>`,
        `<span class="sys-asset"><b>现金</b><strong>${state.m}</strong></span>`,
        `<span class="sys-asset${state.ration === 0 ? ' danger' : ''}"><b>口粮</b><strong>${state.ration} 份</strong></span>`,
        `<span class="sys-asset"><b>纸料</b><strong>${state.s}</strong></span>`,
        `<span class="sys-asset"><b>洁净</b><strong>${state.c}</strong></span>`,
        `<span class="sys-asset${state.h >= 10 ? ' danger' : ''}"><b>阴气</b><strong>${state.h}</strong></span>`
      ].join('');

      const dot = document.getElementById('system-dot');
      if (dot) dot.hidden = state.ration > 0 && state.pts < 28;

      byId('system-quests').innerHTML = state.dailyQuests
        .map(
          (q) =>
            `<li class="${q.done ? 'quest-done' : ''}">
              <div class="sq-top"><b>${q.done ? '已领 ✓' : `+${q.rewardPts} 点`}</b><strong>${q.title.replace(/^[^·]+·\s*/, '')}</strong></div>
              <small>${q.detail}</small>
            </li>`
        )
        .join('');

      const buildShopCard = (opts: {
        actionId: string;
        categoryClass: 'survival' | 'talisman' | 'upgrade';
        categoryLabel: string;
        title: string;
        detail: string;
        effectTags: string[];
        icon: ShopIconKind;
        priceText: string;
        ownedText?: string;
        ctaText: string;
        highlight?: boolean;
        ownedStamp?: string;
        disabledReason?: string;
      }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = [
          'shop-card',
          `cat-${opts.categoryClass}`,
          opts.highlight ? 'urgent-card' : '',
          opts.ownedStamp ? 'owned-card' : ''
        ]
          .filter(Boolean)
          .join(' ');
        btn.dataset.action = opts.actionId;
        btn.dataset.cardTitle = opts.title;
        btn.disabled = Boolean(opts.disabledReason);

        const tagsHtml = opts.effectTags.map((t) => `<span class="sc-tag">${t}</span>`).join('');
        btn.innerHTML = `<div class="sc-top">
            <span class="sc-cat">${opts.categoryLabel}</span>
            ${opts.ownedText ? `<span class="sc-owned">${opts.ownedText}</span>` : ''}
          </div>
          <div class="sc-emblem">${SHOP_ITEM_ICONS[opts.icon]}</div>
          <div class="sc-body">
            <strong class="sc-title">${opts.title}</strong>
            <p class="sc-desc">${opts.detail}</p>
            <div class="sc-tags">${tagsHtml}</div>
          </div>
          <div class="sc-foot">
            <span class="sc-price">${opts.priceText}</span>
            <span class="sc-cta">${opts.disabledReason ? opts.disabledReason : opts.ctaText}</span>
          </div>
          ${opts.ownedStamp ? `<span class="sc-stamp">${opts.ownedStamp}</span>` : ''}`;
        return btn;
      };

      const survivalCards = SYSTEM_SUPPLIES.filter((s) => s.category === 'survival').map((sup) => {
        const reason = inSite
          ? '现场禁用'
          : state.pts < sup.costPts
            ? '点数不足'
            : '';
        const ownedText =
          sup.id === 'sys_ration_1' || sup.id === 'sys_ration_3'
            ? `现有 ${state.ration} 份`
            : sup.id === 'sys_clean_paper'
              ? `纸料 ${state.s}`
              : `阴气 ${state.h}`;
        return buildShopCard({
          actionId: sup.id,
          categoryClass: 'survival',
          categoryLabel: '生存补给',
          title: sup.shortTitle,
          detail: sup.detail,
          effectTags: sup.effectTags,
          icon: sup.icon,
          priceText: `${sup.costPts} 纸火点`,
          ownedText,
          ctaText: '立即兑换',
          highlight: sup.id === 'sys_ration_1' && state.ration === 0 && !reason,
          disabledReason: reason
        });
      });

      const talismanCards = SYSTEM_SUPPLIES.filter((s) => s.category === 'talisman').map((sup) => {
        const reason = inSite
          ? '现场禁用'
          : state.pts < sup.costPts
            ? '点数不足'
            : '';
        const count = sup.id === 'sys_talisman' ? state.items.talisman : state.items.wardDoll;
        return buildShopCard({
          actionId: sup.id,
          categoryClass: 'talisman',
          categoryLabel: '镇煞符箓',
          title: sup.shortTitle,
          detail: sup.detail,
          effectTags: sup.effectTags,
          icon: sup.icon,
          priceText: `${sup.costPts} 纸火点`,
          ownedText: `持有 ×${count}`,
          ctaText: '立即兑换',
          disabledReason: reason
        });
      });

      const upgradeCards = SHOP_UPGRADES.map((upg) => {
        const owned = state.upgrades.includes(upg.id);
        const reason = owned
          ? '已装配'
          : inSite
            ? '现场禁用'
            : state.pts < upg.costPts
              ? '点数不足'
              : state.m < upg.costM
                ? '现金不足'
                : '';
        return buildShopCard({
          actionId: `upg_${upg.id}`,
          categoryClass: 'upgrade',
          categoryLabel: '永久升级',
          title: upg.shortTitle,
          detail: upg.detail,
          effectTags: upg.effectTags,
          icon: upg.icon,
          priceText: `${upg.costPts} 点 + ${upg.costM} 现`,
          ownedText: owned ? '已生效' : '可装配',
          ctaText: '装入铺面',
          ownedStamp: owned ? '已装' : undefined,
          disabledReason: reason
        });
      });

      byId('system-survival').replaceChildren(...survivalCards);
      byId('system-talisman').replaceChildren(...talismanCards);
      byId('system-upgrades').replaceChildren(...upgradeCards);
      setSystemTab(activeSystemTab);
      systemPanel.render(state);
    },
    renderLedger(state: GameState) {
      if (!ledgerDialog.open) {
        ledgerViewDay = state.day;
      }
      renderLedgerPage(state);
    }
  };
}
