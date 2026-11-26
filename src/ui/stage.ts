import type { ActionOption, CardIconKind, GameState, StageView } from '../data/types';
import { isNightPhase } from '../engine';

const CARD_ICONS: Record<CardIconKind, string> = {
  lantern: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2v3M8 5h8M7 9c0-2.2 2.2-4 5-4s5 1.8 5 4v5c0 2.2-2.2 4-5 4s-5-1.8-5-4V9Z"/><path d="M12 5v13M9 18h6M12 18v4"/></svg>',
  horse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 10 9 5l3 2 2-3 2 5 3 2v4h-2l1 5h-2l-1-4h-5l-1 4H7l1-5H5v-5Z"/><circle cx="9.5" cy="8.5" r=".8" fill="currentColor"/></svg>',
  charm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="1"/><path d="M9 7h6M12 7v10M9.5 11.5h5M10 15h4"/></svg>',
  plaque: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 20V7l5-4 5 4v13H7Z"/><path d="M12 8v8M9.5 11h5"/></svg>',
  doll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="6.5" r="3"/><path d="M7 20l1.5-8.5L6 10l3-1h6l3 1-2.5 1.5L17 20H7Z"/></svg>',
  umbrella: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 13a9 9 0 0 1 18 0H3Z"/><path d="M12 4v14a2 2 0 0 1-4 0"/></svg>',
  ledger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z"/><path d="M8.5 4v16M11.5 9h4.5M11.5 13h4.5"/></svg>',
  bride: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 6h10l2 9H5l2-9Z"/><path d="M9 6V4h6v2M7 15l-1 5h12l-1-5"/></svg>',
  mirror: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="10" r="6"/><path d="M12 16v5M9.5 8.5l5 3"/></svg>',
  deity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 8h12l-1 9-5 3-5-3-1-9Z"/><path d="M8 8V4h8v4M9.5 12h1.5M13 12h1.5"/></svg>',
  opera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="7.5"/><path d="M8 4 5 2M16 4l3-2M9 11h2M13 11h2M10 15.5h4"/></svg>',
  supply: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 9 12 5l8 4-8 4-8-4Z"/><path d="M4 13l8 4 8-4M4 17l8 4 8-4"/></svg>',
  clinic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',
  tailor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M14 5h5v5"/><path d="M6 9c2 0 4 2 4 4s-2 4-4 4"/></svg>',
  scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7" cy="7.5" r="2.5"/><circle cx="7" cy="16.5" r="2.5"/><path d="M9.2 8.8 19 16M9.2 15.2 19 8"/></svg>',
  rumor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 6h14v10H9l-4 3V6Z"/><path d="M8.5 10h7M8.5 13h4.5"/></svg>',
  broom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 4 9 13M6 12l6 4-3 5-6-3 3-6Z"/><path d="M17 16c0-1.5 1-2.5 0-4M20 15c0-1.5 1-2.5 0-4"/></svg>',
  helper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>',
  wash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 5h14v14H5Z"/><path d="M8 16 16 8M8 8l8 8"/></svg>',
  rest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M18 14.5A6.5 6.5 0 0 1 9.5 6a6.5 6.5 0 1 0 8.5 8.5Z"/></svg>',
  teahouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 11h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-4Z"/><path d="M16 12h2a2.5 2.5 0 0 1 0 5h-2M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3"/></svg>',
  bookstore: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h6.5a2.5 2.5 0 0 1 2.5 2.5V20a2 2 0 0 0-2-2H4V5Z"/><path d="M20 5h-6.5A2.5 2.5 0 0 0 11 7.5V20a2 2 0 0 1 2-2h7V5Z"/></svg>',
  shrine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 9 12 4l9 5H3Z"/><path d="M6 9v10M18 9v10M10 19v-5h4v5M4 19h16"/></svg>'
};

const CONTROL_ICONS: Record<string, string> = {
  night: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="8" width="10" height="7.5" rx="1"/><path d="M6.5 8V5.8a2.5 2.5 0 0 1 5 0V8"/><circle cx="9" cy="11.8" r="1" fill="currentColor"/></svg>',
  skip: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 9h12M6 4v10M12 4v10"/></svg>',
  dawn: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 13h12M9 4v2.2M5 6.5l1.5 1.5M13 6.5 11.5 8"/><path d="M5.5 13a3.5 3.5 0 0 1 7 0"/></svg>',
  open_system: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 2.4 14.8 5.6v6.8L9 15.6l-5.8-3.2V5.6L9 2.4Z"/><path d="M9 5.8v6.4M6 7.5 9 9.2l3-1.7"/></svg>',
  street_go_back: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 9h9M9.5 5l4 4-4 4"/></svg>',
  street_go_front: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M13.5 9h-9M8.5 5l-4 4 4 4"/></svg>',
  return_to_shop: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11.5 4.5 7 9l4.5 4.5"/><path d="M7 9h7.5"/></svg>',
  back_to_orders: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11.5 4.5 7 9l4.5 4.5"/></svg>',
  back_to_night_board: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11.5 4.5 7 9l4.5 4.5"/></svg>',
  replay_dialogue: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 9a4.5 4.5 0 1 1 1.3 3.2"/><path d="M4.5 5.5v3.5H8"/></svg>',
  replay_night_dialogue: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 9a4.5 4.5 0 1 1 1.3 3.2"/><path d="M4.5 5.5v3.5H8"/></svg>'
};

function makeSystemExchangeButton(state: GameState): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `move ctrl-btn sys-counter-btn${state.ration === 0 ? ' sys-urgent' : ''}`;
  button.dataset.openSystem = 'true';
  button.setAttribute('aria-keyshortcuts', 'S');

  const kbd = document.createElement('kbd');
  kbd.textContent = 'S';
  kbd.setAttribute('aria-hidden', 'true');

  const wrap = document.createElement('span');
  wrap.className = 'ctrl-title-row';
  wrap.innerHTML = CONTROL_ICONS.open_system;
  const title = document.createElement('strong');
  title.textContent = '纸火系统';
  wrap.append(title);

  const detail = document.createElement('small');
  detail.textContent =
    state.ration === 0
      ? `口粮告急 · 点 ${state.pts}`
      : `兑换·技能·情报 · 点 ${state.pts}`;

  const dot = document.createElement('i');
  dot.id = 'system-dot';
  dot.className = 'badge-dot';
  dot.hidden = state.ration > 0 && state.pts < 28;
  dot.setAttribute('aria-hidden', 'true');

  button.append(kbd, wrap, detail, dot);
  return button;
}

function bindMoveHighlight(
  button: HTMLButtonElement,
  move: ActionOption,
  onHighlight?: (actionId: string, active: boolean) => void
) {
  if (!move.reason && onHighlight) {
    button.addEventListener('pointerenter', () => onHighlight(move.id, true));
    button.addEventListener('pointerleave', () => onHighlight(move.id, false));
    button.addEventListener('focus', () => onHighlight(move.id, true));
    button.addEventListener('blur', () => onHighlight(move.id, false));
  }
}

export function makeActionButton(
  move: ActionOption,
  key: string,
  onHighlight?: (actionId: string, active: boolean) => void
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'move',
    move.primary ? 'main' : '',
    move.skill ? 'skill-move' : '',
    move.danger ? 'danger' : '',
    move.presentation === 'control' ? 'ctrl-btn' : ''
  ]
    .filter(Boolean)
    .join(' ');
  button.dataset.action = move.id;
  button.disabled = Boolean(move.reason);

  if (key) {
    const shortcut = document.createElement('kbd');
    shortcut.textContent = key;
    shortcut.setAttribute('aria-hidden', 'true');
    button.dataset.key = key;
    button.setAttribute('aria-keyshortcuts', key);
    button.append(shortcut);
  }

  const iconSvg = move.presentation === 'control' ? CONTROL_ICONS[move.id] : undefined;
  if (iconSvg) {
    const wrap = document.createElement('span');
    wrap.className = 'ctrl-title-row';
    wrap.innerHTML = iconSvg;
    const title = document.createElement('strong');
    title.textContent = move.title;
    wrap.append(title);
    const detail = document.createElement('small');
    detail.textContent = move.reason ? `${move.reason} · ${move.detail}` : move.detail;
    button.append(wrap, detail);
  } else {
    const title = document.createElement('strong');
    title.textContent = move.title;
    const detail = document.createElement('small');
    detail.textContent = move.reason ? `${move.reason} · ${move.detail}` : move.detail;
    button.append(title, detail);
  }

  bindMoveHighlight(button, move, onHighlight);
  return button;
}

function makeOrderCard(
  move: ActionOption,
  key: string,
  onHighlight?: (actionId: string, active: boolean) => void
): HTMLButtonElement {
  const meta = move.card!;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'order-card',
    meta.kind === 'night_order'
      ? 'night-card'
      : meta.kind === 'street_spot'
        ? 'street-card'
        : meta.kind === 'shop_chore'
          ? 'shop-card-item'
          : 'day-card',
    move.primary ? 'featured' : '',
    meta.statusStamp ? 'stamped' : ''
  ]
    .filter(Boolean)
    .join(' ');
  button.dataset.action = move.id;
  button.disabled = Boolean(move.reason);

  if (key) {
    button.dataset.key = key;
    button.setAttribute('aria-keyshortcuts', key);
  }

  const head = document.createElement('div');
  head.className = 'oc-head';
  if (key) {
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    kbd.setAttribute('aria-hidden', 'true');
    head.append(kbd);
  }
  const tag = document.createElement('span');
  tag.className = 'oc-tag';
  tag.textContent = meta.tag;
  head.append(tag);

  const iconWrap = document.createElement('span');
  iconWrap.className = 'oc-icon';
  iconWrap.innerHTML = CARD_ICONS[meta.icon] ?? CARD_ICONS.lantern;
  head.append(iconWrap);

  const body = document.createElement('div');
  body.className = 'oc-body';
  const title = document.createElement('strong');
  title.className = 'oc-title';
  title.textContent = move.title;
  const client = document.createElement('span');
  client.className = 'oc-client';
  client.textContent = meta.client;
  body.append(title, client);

  const stats = document.createElement('div');
  stats.className = 'oc-stats';
  for (const st of meta.stats) {
    const chip = document.createElement('span');
    chip.className = `oc-chip${st.tone ? ` tone-${st.tone}` : ''}`;
    chip.textContent = `${st.label}${st.value}`;
    stats.append(chip);
  }

  button.append(head, body, stats);

  if (meta.statusStamp) {
    const stamp = document.createElement('span');
    stamp.className = `oc-stamp${move.reason ? ' done' : ''}`;
    stamp.textContent = meta.statusStamp;
    button.append(stamp);
  }

  bindMoveHighlight(button, move, onHighlight);
  return button;
}

export function renderStage(
  stageEl: HTMLElement,
  state: GameState,
  screen: StageView,
  isSceneInteractive: boolean,
  onHighlight: (actionId: string, active: boolean) => void
): Map<string, ActionOption> {
  const nighttime = isNightPhase(state.phase);
  const inSite = state.phase === 'site';
  const focused = inSite && isSceneInteractive;
  const locked = focused ? screen.moves.filter((m) => Boolean(m.reason)) : [];
  const available = focused ? screen.moves.filter((m) => !m.reason) : screen.moves;

  const hasCards = available.some((m) => m.presentation === 'card' && m.card);
  const cardMoves = available.filter((m) => m.presentation === 'card' && m.card);
  const controlMoves = available.filter((m) => m.presentation === 'control');
  const normalMoves = available.filter((m) => m.presentation !== 'card' && m.presentation !== 'control');

  const inStreet = state.phase === 'day' && state.dayTab === 'street';
  const stampChar =
    state.phase === 'bad_end'
      ? '终'
      : state.phase === 'end'
        ? '合'
        : state.phase === 'settle'
          ? '结'
          : inSite
            ? '局'
            : inStreet
              ? '街'
              : nighttime
                ? '阴'
                : '阳';

  const hasDialogue = Boolean(screen.dialogue);
  const compactMode = hasCards || state.phase === 'day' || state.phase === 'board' || state.phase === 'settle';
  const showCounterSystemBtn =
    (!hasDialogue || inStreet) && (state.phase === 'day' || state.phase === 'board' || state.phase === 'settle');

  if (compactMode) {
    const isTrapAlertNotice = Boolean(
      screen.notice &&
        (screen.notice.includes('系统侦测警示') ||
          screen.notice.includes('听声辨影') ||
          screen.notice.includes('识破破绽'))
    );
    const tipText = !inSite
      ? screen.dialogue && !inStreet
        ? screen.dialogue.finished
          ? isTrapAlertNotice
            ? screen.notice!
            : screen.dialogue.summaryNote ?? screen.notice ?? ''
          : `${screen.dialogue.speaker}讲述中（${screen.dialogue.step}/${screen.dialogue.total}），点气泡或按 1 继续`
        : screen.notice ?? ''
      : '';
    const hasControlCol = controlMoves.length > 0 || showCounterSystemBtn;

    stageEl.innerHTML = `<div class="deck-shell">
      <div class="deck-bar">
        <div class="deck-bar-left">
          <span class="phase-stamp${inSite ? ' site' : inStreet ? ' street' : ''}" aria-hidden="true">${stampChar}</span>
          <h2 id="stage-title" tabindex="-1"></h2>
          <p id="stage-description" class="deck-tip${isTrapAlertNotice && screen.dialogue?.finished ? ' alert-tip' : ''}"></p>
        </div>
        <div class="deck-bar-right"></div>
      </div>
      <div class="deck-main${hasControlCol ? ' with-controls' : ''}" id="actions">
        ${hasCards ? '<div class="card-hand" id="card-hand"></div>' : '<div class="actions" id="normal-actions"></div>'}
        ${hasControlCol ? '<div class="deck-controls" id="deck-controls"></div>' : ''}
      </div>
      <p id="feedback" class="feedback deck-feedback" role="status" tabindex="-1"></p>
    </div>`;

    const titleEl = stageEl.querySelector<HTMLElement>('#stage-title')!;
    const descEl = stageEl.querySelector<HTMLElement>('#stage-description')!;
    const fbEl = stageEl.querySelector<HTMLElement>('#feedback')!;
    titleEl.textContent = screen.title;
    descEl.textContent = tipText;
    descEl.hidden = !tipText;
    if ((!hasDialogue || inStreet) && state.message && state.message !== tipText && state.phase !== 'settle') {
      fbEl.textContent = state.message;
    }

    let shortcut = 0;
    if (hasCards) {
      const handEl = stageEl.querySelector<HTMLElement>('#card-hand')!;
      handEl.replaceChildren(
        ...cardMoves.map((move) => makeOrderCard(move, move.reason ? '' : String(++shortcut), onHighlight))
      );
    } else {
      const normalEl = stageEl.querySelector<HTMLElement>('#normal-actions')!;
      normalEl.classList.toggle('single-col', normalMoves.length === 1);
      normalEl.replaceChildren(
        ...normalMoves.map((move) => makeActionButton(move, move.reason ? '' : String(++shortcut), onHighlight))
      );
    }

    const ctrlEl = stageEl.querySelector<HTMLElement>('#deck-controls');
    if (ctrlEl) {
      const ctrlNodes: HTMLElement[] = [];
      if (showCounterSystemBtn) {
        ctrlNodes.push(makeSystemExchangeButton(state));
      }
      ctrlNodes.push(
        ...controlMoves.map((move) => makeActionButton(move, move.reason ? '' : String(++shortcut), onHighlight))
      );
      ctrlEl.replaceChildren(...ctrlNodes);
    }
  } else {
    // 履约现场 / 结局 / 坏结局：保持左右剧场分栏
    stageEl.innerHTML = `<div class="stage-grid">
      <div class="story">
        <div class="nameplate">
          <span class="phase-stamp${inSite ? ' site' : ''}" aria-hidden="true">${stampChar}</span>
          <h2 id="stage-title" tabindex="-1"></h2>
        </div>
        <p id="stage-description" class="lede"></p>
        ${!inSite && screen.notice ? `<p class="notice">${screen.notice}</p>` : ''}
        <p id="feedback" class="feedback" role="status" tabindex="-1"></p>
      </div>
      <div class="commands">
        <div class="actions${available.length === 1 ? ' single-col' : ''}" id="actions"></div>
        ${locked.length ? `<details class="locked-moves"><summary>暂不可用的动作（${locked.length}）</summary><div class="actions" id="locked-actions"></div></details>` : ''}
      </div>
    </div>`;

    const titleEl = stageEl.querySelector<HTMLElement>('#stage-title')!;
    const descEl = stageEl.querySelector<HTMLElement>('#stage-description')!;
    const fbEl = stageEl.querySelector<HTMLElement>('#feedback')!;
    titleEl.textContent = screen.title;
    descEl.textContent = screen.description;
    if (state.phase !== 'end') {
      fbEl.textContent = state.message;
    }

    let shortcut = 0;
    const actionsEl = stageEl.querySelector<HTMLElement>('#actions')!;
    const actionNodes: HTMLElement[] = available.map((move) =>
      makeActionButton(move, move.reason ? '' : String(++shortcut), onHighlight)
    );
    actionsEl.replaceChildren(...actionNodes);

    const lockedEl = stageEl.querySelector<HTMLElement>('#locked-actions');
    if (lockedEl) {
      lockedEl.replaceChildren(...locked.map((move) => makeActionButton(move, '', onHighlight)));
    }
  }

  return new Map(screen.moves.map((m) => [m.id, m]));
}
