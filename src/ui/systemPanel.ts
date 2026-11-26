import { CHARACTER_PROFILES } from '../data/characters';
import { DAY_META, getScheduledNightOrder, getScheduledTrapOrder } from '../data/night';
import {
  CODEX_MILESTONES,
  SKILL_BRANCHES,
  SYSTEM_SKILLS,
  TOWN_INTEL_DOCS
} from '../data/systemShop';
import type { GameState, VisitRecord, VisitResultKind } from '../data/types';
import {
  getIntelForecastCost,
  getIntelScanCost,
  getSystemDiagnostics,
  hasSkill
} from '../engine';

export type SystemTabId = 'exchange' | 'skills' | 'intel' | 'visitors' | 'codex';
export type VisitorFilterKind = 'all' | 'living' | 'eerie' | 'trap';

const RESULT_META: Record<VisitResultKind, { label: string; tone: 'good' | 'eerie' | 'trap' | 'warn' | 'muted' }> = {
  completed_standard: { label: '常规成交', tone: 'good' },
  completed_rush: { label: '赶工成交', tone: 'warn' },
  completed_fine: { label: '精工成交', tone: 'good' },
  completed_proxy: { label: '替代料成交', tone: 'warn' },
  night_success: { label: '阴单履约', tone: 'eerie' },
  trap_exposed: { label: '识破诱杀', tone: 'trap' },
  trap_survived: { label: '替纸保命', tone: 'warn' },
  trap_killed: { label: '诱杀毙命', tone: 'trap' },
  night_pressed: { label: '人情压局', tone: 'warn' },
  night_refused: { label: '闭门谢客', tone: 'muted' },
  night_failed: { label: '失手退场', tone: 'warn' },
  night_fled: { label: '弃单脱身', tone: 'warn' }
};

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderDeltaBadges(rec: VisitRecord): string {
  const badges: string[] = [];
  if (rec.cashDelta !== 0) {
    const sign = rec.cashDelta > 0 ? '+' : '';
    badges.push(`<span class="vr-delta cash">${sign}${rec.cashDelta} 现</span>`);
  }
  if (rec.ptsDelta !== 0) {
    const sign = rec.ptsDelta > 0 ? '+' : '';
    badges.push(`<span class="vr-delta pts">${sign}${rec.ptsDelta} 点</span>`);
  }
  return badges.join('');
}

export interface SystemPanelController {
  getVisitorFilter(): VisitorFilterKind;
  setVisitorFilter(filter: VisitorFilterKind): void;
  render(state: GameState): void;
}

export function createSystemPanelController(): SystemPanelController {
  let visitorFilter: VisitorFilterKind = 'all';

  function renderSkillsTab(state: GameState) {
    const el = document.getElementById('sys-skills-panel');
    if (!el) return;

    const learned = state.learnedSkills ?? [];
    const inLockedPhase = state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end';

    const branchesHtml = SKILL_BRANCHES.map((branch) => {
      const skills = SYSTEM_SKILLS.filter((s) => s.branch === branch.id).sort((a, b) => a.tier - b.tier);
      const branchLearned = skills.filter((s) => learned.includes(s.id)).length;

      const nodesHtml = skills
        .map((sk, idx) => {
          const isLearned = learned.includes(sk.id);
          const prereqDef = sk.prereq ? SYSTEM_SKILLS.find((s) => s.id === sk.prereq) : undefined;
          const prereqMet = !sk.prereq || learned.includes(sk.prereq);
          const disabledReason = isLearned
            ? '已习得'
            : inLockedPhase
              ? '现场禁用'
              : !prereqMet
                ? `需先习「${prereqDef?.name ?? ''}」`
                : state.pts < sk.costPts
                  ? '点数不足'
                  : '';
          const canBuy = !isLearned && !disabledReason;
          const tierLabel = sk.tier === 1 ? '初阶' : sk.tier === 2 ? '中阶' : '宗师';

          const connector =
            idx > 0
              ? `<div class="skill-connector${prereqMet ? ' active' : ''}" aria-hidden="true"><span>↓</span></div>`
              : '';

          return `${connector}<article class="skill-node tier-${sk.tier}${isLearned ? ' learned' : canBuy ? ' ready' : ' locked'}">
            <div class="sn-head">
              <span class="sn-tier">${tierLabel}</span>
              <h4>${escapeHtml(sk.name)}</h4>
              <span class="sn-tag">${escapeHtml(sk.tag)}</span>
            </div>
            <p class="sn-summary">${escapeHtml(sk.summary)}</p>
            <ul class="sn-effects">
              ${sk.effects.map((ef) => `<li>${escapeHtml(ef)}</li>`).join('')}
            </ul>
            <div class="sn-foot">
              <span class="sn-hook">${escapeHtml(sk.hookNote)}</span>
              ${
                isLearned
                  ? '<span class="sn-stamp">已习得 ✓</span>'
                  : `<button type="button" class="intel-btn${canBuy ? ' primary' : ''}" data-action="skill_${sk.id}" data-card-title="${escapeHtml(sk.name)}" ${disabledReason ? 'disabled' : ''}>
                      ${disabledReason ? escapeHtml(disabledReason) : `研习 · ${sk.costPts} 点`}
                    </button>`
              }
            </div>
          </article>`;
        })
        .join('');

      return `<section class="skill-branch branch-${branch.accent}">
        <header class="sb-header">
          <span class="sb-seal" aria-hidden="true">${escapeHtml(branch.seal)}</span>
          <div class="sb-meta">
            <h3>${escapeHtml(branch.name)}</h3>
            <p>${escapeHtml(branch.subtitle)}</p>
          </div>
          <span class="sb-count">${branchLearned}/${skills.length}</span>
        </header>
        <div class="sb-nodes">${nodesHtml}</div>
      </section>`;
    }).join('');

    el.innerHTML = `
      <div class="skill-summary">
        <div class="ss-left">
          <strong>掌柜本领研习 · 已习得 ${learned.length} / ${SYSTEM_SKILLS.length} 项</strong>
          <p>消耗纸火点逐阶研习三大脉络：白昼省工省料、入夜自动辨伪知忌、夜战解锁零消耗主动技，越往后越从容。</p>
        </div>
        <div class="ss-legend">
          <span>初阶 <b>18 点</b></span>
          <span>中阶 <b>28 点</b></span>
          <span>宗师 <b>42 点</b></span>
        </div>
      </div>
      <div class="skill-tree-grid">${branchesHtml}</div>
    `;
  }

  function renderIntelTab(state: GameState) {
    const el = document.getElementById('sys-intel-panel');
    if (!el) return;

    const diag = getSystemDiagnostics(state);
    const inLockedPhase = state.phase === 'site' || state.phase === 'end' || state.phase === 'bad_end';
    const scannedToday = (state.scannedTrapDays ?? []).includes(state.day);
    const nextDay = state.day + 1;
    const forecastedTomorrow = (state.forecastDays ?? []).includes(nextDay);
    const unlockedIds = state.unlockedIntelIds ?? [];
    const todayOrder = getScheduledNightOrder(state.day, state.h);
    const todayTrap = getScheduledTrapOrder(state.day);
    const tomorrowOrder = nextDay <= state.maxDay ? getScheduledNightOrder(nextDay, state.h) : null;
    const tomorrowMeta = nextDay <= state.maxDay ? DAY_META[nextDay] : null;
    const scanCost = getIntelScanCost(state);
    const forecastCost = getIntelForecastCost(state);
    const hasEcho = hasSkill(state, 'sight_echo');
    const hasOmen = hasSkill(state, 'sight_omen');

    const revealTonightIdentity =
      state.phase !== 'day' ||
      state.informedDays.includes(state.day) ||
      (state.forecastDays ?? []).includes(state.day) ||
      diag.tonightPeak;

    const scanDisabledReason = scannedToday
      ? '今日已扫'
      : inLockedPhase
        ? '当前不可用'
        : state.pts < scanCost
          ? '点数不足'
          : '';

    const forecastDisabledReason =
      state.day >= state.maxDay
        ? '已至终局日'
        : forecastedTomorrow
          ? '明日已演'
          : inLockedPhase
            ? '当前不可用'
            : state.pts < forecastCost
              ? '点数不足'
              : '';

    const threatPills = diag.threatFormulaParts
      .map((part) => `<span class="intel-pill">${escapeHtml(part)}</span>`)
      .join('');

    const scanResultHtml = scannedToday
      ? `<div class="intel-reveal">
          <p><strong>今夜核实禁忌：</strong>${escapeHtml(todayOrder.taboo)}</p>
          <p><strong>门外诱杀破绽：</strong>${escapeHtml(todayTrap.trapClueHint ?? todayTrap.intelHintVerified)}</p>
        </div>`
      : '';

    const forecastResultHtml =
      forecastedTomorrow && tomorrowOrder && tomorrowMeta
        ? `<div class="intel-reveal">
            <p><strong>第 ${nextDay} 日「${escapeHtml(tomorrowMeta.title)}」来客：</strong>${escapeHtml(tomorrowOrder.client)}${tomorrowOrder.peak ? '（3回合顶格高压）' : ''}</p>
            <p><strong>明日禁忌预警：</strong>${escapeHtml(tomorrowOrder.taboo)}</p>
          </div>`
        : '';

    const docCardsHtml = TOWN_INTEL_DOCS.map((doc) => {
      const unlocked = unlockedIds.includes(doc.id);
      const disabledReason = unlocked
        ? '已解密'
        : inLockedPhase
          ? '当前不可用'
          : state.pts < doc.costPts
            ? '点数不足'
            : '';

      if (unlocked) {
        return `<article class="intel-doc-card unlocked">
          <div class="idc-head">
            <span class="idc-code">${escapeHtml(doc.code)}</span>
            <span class="idc-cat">${escapeHtml(doc.category)}</span>
            <span class="idc-stamp">已解密</span>
          </div>
          <h4>${escapeHtml(doc.title)}</h4>
          <p class="idc-body">${escapeHtml(doc.body)}</p>
          <p class="idc-tip">${escapeHtml(doc.tip)}</p>
        </article>`;
      }

      return `<article class="intel-doc-card locked">
        <div class="idc-head">
          <span class="idc-code">${escapeHtml(doc.code)}</span>
          <span class="idc-cat">${escapeHtml(doc.category)}</span>
        </div>
        <h4>${escapeHtml(doc.title)}</h4>
        <p class="idc-summary">${escapeHtml(doc.summary)}</p>
        <div class="idc-foot">
          <span class="idc-cost">${doc.costPts} 纸火点 · 阴气 −1</span>
          <button type="button" class="intel-btn" data-action="intel_doc_${escapeHtml(doc.id)}" data-card-title="${escapeHtml(doc.title)}" ${disabledReason ? 'disabled' : ''}>
            ${disabledReason ? escapeHtml(disabledReason) : '解密档案'}
          </button>
        </div>
      </article>`;
    }).join('');

    el.innerHTML = `
      <section class="intel-banner">
        <div class="ib-main">
          <div class="ib-kicker">今夜威胁实时推演 · 第 ${state.day} 日</div>
          <h3>${
            revealTonightIdentity
              ? `${escapeHtml(diag.tonightClient)} · ${escapeHtml(diag.tonightOrderTitle)}`
              : '常规夜客待入夜叩门后显名（可先参照下方初始局面公式备料）'
          }</h3>
          <div class="ib-badges">
            ${diag.tonightPeak ? '<span class="ib-tag peak">顶格高压 · 3回合</span>' : '<span class="ib-tag">常规夜单</span>'}
            ${diag.tonightWatched ? '<span class="ib-tag warn">暗中窥视 · 忌失礼</span>' : ''}
            ${state.informedDays.includes(state.day) ? '<span class="ib-tag good">禁忌已核实</span>' : '<span class="ib-tag muted">禁忌未核实</span>'}
          </div>
        </div>
        <div class="ib-threat">
          <span class="ib-threat-label">预估初始局面</span>
          <strong class="ib-threat-val${diag.estimatedThreat0 >= 4 ? ' danger' : ''}">${diag.estimatedThreat0}<small> / 5</small></strong>
          <div class="ib-pills">${threatPills}</div>
        </div>
      </section>

      <section class="sys-block">
        <div class="sys-block-head">
          <h3>一 · 主动情报侦测</h3>
          <span>消耗纸火点换取今夜防伪线索或明日先手情报</span>
        </div>
        <div class="intel-action-grid">
          <div class="intel-action-card${scannedToday ? ' done' : ''}">
            <div class="iac-head">
              <strong>${hasEcho ? '先手镇煞扫描 · 听声半价' : '今夜破绽扫描'}</strong>
              <span class="iac-cost">${scanCost} 纸火点${hasEcho ? ' · 洁净+1' : ''}</span>
            </div>
            <p class="iac-desc">${
              hasEcho
                ? '已习「听声辨影」，扫描费减半且入夜前附赠洁净 +1；同步核实今夜常规禁忌与诱杀破绽。'
                : '直接核实今夜常规禁忌，并截取门外诱杀诡的破绽特征；入夜听完诱杀对话后自动弹出系统红警提示。'
            }</p>
            ${scanResultHtml}
            <div class="iac-foot">
              <span class="iac-state">${scannedToday ? '✓ 今日破绽已锁定' : '适合无暇外出打听或高危夜防翻车'}</span>
              <button type="button" class="intel-btn primary" data-action="intel_scan_trap" data-card-title="今夜破绽扫描" ${scanDisabledReason ? 'disabled' : ''}>
                ${scanDisabledReason ? escapeHtml(scanDisabledReason) : '启动扫描'}
              </button>
            </div>
          </div>

          <div class="intel-action-card${forecastedTomorrow ? ' done' : ''}">
            <div class="iac-head">
              <strong>${hasOmen ? '明日天机预演 · 望气半价' : '明日天机预演'}</strong>
              <span class="iac-cost">${forecastCost} 纸火点</span>
            </div>
            <p class="iac-desc">提前推演第 ${Math.min(state.maxDay, nextDay)} 日常规夜客身份、禁忌与是否顶格，方便提前压阴气、留洁净或备符箓。</p>
            ${forecastResultHtml}
            <div class="iac-foot">
              <span class="iac-state">${forecastedTomorrow ? '✓ 明日夜情已推演' : '提前一天布防，避开顶格夜猝死'}</span>
              <button type="button" class="intel-btn primary" data-action="intel_forecast_next" data-card-title="明日天机预演" ${forecastDisabledReason ? 'disabled' : ''}>
                ${forecastDisabledReason ? escapeHtml(forecastDisabledReason) : '推演明日'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="sys-block">
        <div class="sys-block-head">
          <h3>二 · 小镇机密档案解密</h3>
          <span>已解密 ${unlockedIds.length} / ${TOWN_INTEL_DOCS.length} 份 · 每解密 1 份阴气 −1，集齐触发高额点赏</span>
        </div>
        <div class="intel-doc-grid">${docCardsHtml}</div>
      </section>
    `;
  }

  function renderVisitorsTab(state: GameState) {
    const el = document.getElementById('sys-visitors-panel');
    if (!el) return;

    const diag = getSystemDiagnostics(state);
    const records = [...(state.visitRecords ?? [])].reverse();
    const counts: Record<VisitorFilterKind, number> = {
      all: records.length,
      living: records.filter((r) => r.kind === 'living').length,
      eerie: records.filter((r) => r.kind === 'eerie').length,
      trap: records.filter((r) => r.kind === 'trap').length
    };
    const filtered = visitorFilter === 'all' ? records : records.filter((r) => r.kind === visitorFilter);

    const filterBtns: Array<[VisitorFilterKind, string]> = [
      ['all', `全部来客 (${counts.all})`],
      ['living', `活人街坊 (${counts.living})`],
      ['eerie', `正规夜客 (${counts.eerie})`],
      ['trap', `门外诱杀 (${counts.trap})`]
    ];

    const listHtml =
      filtered.length > 0
        ? filtered
            .map((rec) => {
              const profile = rec.characterId ? CHARACTER_PROFILES[rec.characterId] : undefined;
              const seal = profile?.sealChar ?? rec.guestName.slice(0, 1);
              const res = RESULT_META[rec.result] ?? { label: '已记录', tone: 'muted' as const };
              const deltas = renderDeltaBadges(rec);
              return `<li class="visitor-row kind-${rec.kind}">
                <div class="vr-seal" aria-hidden="true">${escapeHtml(seal)}</div>
                <div class="vr-body">
                  <div class="vr-top">
                    <span class="vr-day">第 ${rec.day} 日 · ${rec.period === 'day' ? '白天' : '夜里'}</span>
                    <strong class="vr-name">${escapeHtml(rec.guestName)}</strong>
                    <span class="vr-order">${escapeHtml(rec.orderTitle)}</span>
                    <span class="vr-result tone-${res.tone}">${res.label}</span>
                  </div>
                  <p class="vr-note">${escapeHtml(rec.note)}</p>
                </div>
                <div class="vr-side">
                  ${deltas ? `<div class="vr-deltas">${deltas}</div>` : ''}
                  ${
                    profile
                      ? `<button type="button" class="vr-char-btn" data-open-char="${escapeHtml(profile.id)}">查档案 ›</button>`
                      : ''
                  }
                </div>
              </li>`;
            })
            .join('')
        : `<li class="visitor-empty">${
            records.length === 0
              ? '尚无客户来访归档。完成白天活人订单、入夜履约或识破诱杀诡后，系统将自动登记每笔客档。'
              : '当前筛选分类下暂无来访记录。'
          }</li>`;

    el.innerHTML = `
      <div class="visitor-stats">
        <div class="vs-card"><span>累计接待</span><strong>${diag.visitorStats.total}</strong></div>
        <div class="vs-card"><span>活人完单</span><strong>${diag.visitorStats.livingDone}</strong></div>
        <div class="vs-card"><span>夜客履约</span><strong>${diag.visitorStats.eerieSuccess}</strong></div>
        <div class="vs-card trap"><span>识破诱杀</span><strong>${diag.visitorStats.trapsExposed}</strong></div>
        <div class="vs-card"><span>客源现金</span><strong>+${diag.visitorStats.totalCash}</strong></div>
        <div class="vs-card pts"><span>客源纸火点</span><strong>+${diag.visitorStats.totalPts}</strong></div>
      </div>

      <div class="visitor-filters" role="group" aria-label="按来客阵营筛选">
        ${filterBtns
          .map(
            ([kind, label]) =>
              `<button type="button" class="vf-btn${visitorFilter === kind ? ' active' : ''}" data-visitor-filter="${kind}">${label}</button>`
          )
          .join('')}
      </div>

      <ul class="visitor-list">${listHtml}</ul>
    `;
  }

  function renderCodexTab(state: GameState) {
    const el = document.getElementById('sys-codex-panel');
    if (!el) return;

    const diag = getSystemDiagnostics(state);
    const cp = diag.codexProgress;
    const claimed = state.claimedCodexMilestones ?? [];
    const trapExposedCount = diag.visitorStats.trapsExposed;

    const overviewCards = [
      {
        label: '阴阳人物照面',
        val: `${cp.metCount} / ${cp.metTotal}`,
        pct: Math.round((cp.metCount / Math.max(1, cp.metTotal)) * 100)
      },
      {
        label: '小镇机密档案',
        val: `${cp.intelCount} / ${cp.intelTotal}`,
        pct: Math.round((cp.intelCount / Math.max(1, cp.intelTotal)) * 100)
      },
      {
        label: '夜忌核实进度',
        val: `${cp.informedCount} / ${state.maxDay} 日`,
        pct: Math.round((cp.informedCount / Math.max(1, state.maxDay)) * 100)
      },
      {
        label: '技能研习进度',
        val: `${cp.skillsCount} / ${cp.skillsTotal} 项`,
        pct: Math.round((cp.skillsCount / Math.max(1, cp.skillsTotal)) * 100)
      },
      {
        label: '铺面升级 / 信物',
        val: `${cp.upgradesCount}/4 · ${cp.tokensCount} 件`,
        pct: Math.round((cp.upgradesCount / 4) * 100)
      }
    ];

    const milestonesHtml = CODEX_MILESTONES.map((ms) => {
      const done = claimed.includes(ms.id);
      const cur =
        ms.kind === 'met'
          ? cp.metCount
          : ms.kind === 'intel'
            ? cp.intelCount
            : ms.kind === 'skills'
              ? cp.skillsCount
              : trapExposedCount;
      const clampedCur = Math.min(ms.target, cur);
      return `<li class="cm-item${done ? ' done' : ''}">
        <div class="cm-top">
          <span class="cm-badge">${done ? '已领 ✓' : `+${ms.rewardPts} 点`}</span>
          <strong>${escapeHtml(ms.title)}</strong>
          <span class="cm-progress">${clampedCur}/${ms.target}</span>
        </div>
        <small>${escapeHtml(ms.detail)}</small>
      </li>`;
    }).join('');

    const endingChecksHtml = diag.trueEndingChecks
      .map(
        (chk) => `<li class="ec-item${chk.met ? ' met' : ''}">
          <span class="ec-mark">${chk.met ? '✓' : '○'}</span>
          <strong>${escapeHtml(chk.label)}</strong>
          <span class="ec-val">${escapeHtml(chk.current)}</span>
        </li>`
      )
      .join('');

    const exposedTrapDays = new Set(
      (state.visitRecords ?? [])
        .filter((r) => r.result === 'trap_exposed' || r.result === 'trap_survived')
        .map((r) => r.day)
    );
    const knownDays: number[] = [];
    for (let d = 1; d <= state.maxDay; d++) {
      if (
        state.informedDays.includes(d) ||
        (state.scannedTrapDays ?? []).includes(d) ||
        (state.forecastDays ?? []).includes(d) ||
        Boolean(state.outcomes[d]) ||
        exposedTrapDays.has(d)
      ) {
        knownDays.push(d);
      }
    }

    const tabooHtml =
      knownDays.length > 0
        ? knownDays
            .map((d) => {
              const meta = DAY_META[d] ?? DAY_META[1];
              const order = getScheduledNightOrder(d, state.h);
              const trap = getScheduledTrapOrder(d);
              const hasTrapClue = (state.scannedTrapDays ?? []).includes(d) || exposedTrapDays.has(d);
              return `<li class="ct-item">
                <div class="ct-head">
                  <span class="ct-day">D${d}</span>
                  <strong>${escapeHtml(meta.title)} · ${escapeHtml(order.client)}</strong>
                  ${order.peak ? '<span class="ct-tag peak">顶格</span>' : ''}
                  ${hasTrapClue ? '<span class="ct-tag trap">诱杀已录</span>' : ''}
                </div>
                <p><b>禁忌：</b>${escapeHtml(order.taboo)}</p>
                ${
                  hasTrapClue
                    ? `<p class="ct-trap"><b>诱杀破绽：</b>${escapeHtml(trap.trapClueHint ?? trap.intelHintVerified)}</p>`
                    : ''
                }
              </li>`;
            })
            .join('')
        : '<li class="ct-empty">尚未收录任何夜间禁忌或诱杀破绽。可在白天外出打听，或在「情报打探」中使用破绽扫描/天机预演。</li>';

    const unlockedDocs = TOWN_INTEL_DOCS.filter((d) => (state.unlockedIntelIds ?? []).includes(d.id));
    const unlockedDocsHtml =
      unlockedDocs.length > 0
        ? unlockedDocs
            .map(
              (doc) => `<li class="cd-item">
                <div class="cd-head"><span>${escapeHtml(doc.code)}</span><strong>${escapeHtml(doc.title)}</strong></div>
                <p>${escapeHtml(doc.tip)}</p>
              </li>`
            )
            .join('')
        : '<li class="ct-empty">尚未解密小镇机密档案，可切至「二 · 情报打探」消耗纸火点逐卷破译。</li>';

    el.innerHTML = `
      <div class="codex-overview">
        ${overviewCards
          .map(
            (c) => `<div class="co-card">
              <div class="co-top"><span>${c.label}</span><strong>${c.val}</strong></div>
              <div class="co-track"><i style="width:${c.pct}%"></i></div>
            </div>`
          )
          .join('')}
      </div>

      <section class="sys-block">
        <div class="sys-block-head">
          <h3>一 · 收集里程碑（自动发放纸火点）</h3>
          <span>已达成 ${claimed.length} / ${CODEX_MILESTONES.length} 项</span>
        </div>
        <ul class="codex-milestones">${milestonesHtml}</ul>
      </section>

      <section class="sys-block">
        <div class="sys-block-head">
          <h3>二 · 十五日终审 · 真结局五项核销体检</h3>
          <span>D15 结算时五项全满即可解除绑定、达成「阴阳双稳」</span>
        </div>
        <ul class="ending-checks">${endingChecksHtml}</ul>
      </section>

      <div class="codex-split">
        <section class="sys-block">
          <div class="sys-block-head">
            <h3>三 · 已核实夜忌与破绽录</h3>
            <span>已收录 ${knownDays.length} 日</span>
          </div>
          <ul class="codex-taboo-list">${tabooHtml}</ul>
        </section>

        <section class="sys-block">
          <div class="sys-block-head">
            <h3>四 · 机密档案实战备忘</h3>
            <span>已破译 ${unlockedDocs.length} / ${TOWN_INTEL_DOCS.length}</span>
          </div>
          <ul class="codex-doc-list">${unlockedDocsHtml}</ul>
        </section>
      </div>
    `;
  }

  function updateTabCounts(state: GameState) {
    const skillsEl = document.getElementById('sys-count-skills');
    const visitsEl = document.getElementById('sys-count-visitors');
    const intelEl = document.getElementById('sys-count-intel');
    const codexEl = document.getElementById('sys-count-codex');
    if (skillsEl) skillsEl.textContent = `${(state.learnedSkills ?? []).length}/${SYSTEM_SKILLS.length}`;
    if (visitsEl) visitsEl.textContent = String((state.visitRecords ?? []).length);
    if (intelEl) intelEl.textContent = `${(state.unlockedIntelIds ?? []).length}/${TOWN_INTEL_DOCS.length}`;
    if (codexEl) codexEl.textContent = `${(state.claimedCodexMilestones ?? []).length}/${CODEX_MILESTONES.length}`;
  }

  return {
    getVisitorFilter() {
      return visitorFilter;
    },
    setVisitorFilter(filter: VisitorFilterKind) {
      visitorFilter = filter;
    },
    render(state: GameState) {
      updateTabCounts(state);
      renderSkillsTab(state);
      renderIntelTab(state);
      renderVisitorsTab(state);
      renderCodexTab(state);
    }
  };
}
