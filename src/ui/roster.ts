import { CHARACTER_LIST, CHARACTER_PROFILES } from '../data/characters';
import type { CharacterCamp, CharacterProfile, GameState } from '../data/types';
import { drawComicGuest, type GuestVariant } from '../scene/comic2d/characters';
import {
  INK,
  createComicPatterns,
  drawInkWashBlot,
  drawRedSeal,
  drawRepublicanFrameCorners,
  type ComicPatterns
} from '../scene/comic2d/textures';

type RosterFilter = 'all' | 'living' | 'eerie' | 'trap';

const CAMP_LABELS: Record<CharacterCamp, string> = {
  resident: '镇上常驻',
  living: '白天活人',
  eerie: '夜里正规诡客',
  trap: '门外诱杀伪装'
};

export interface RosterController {
  open(state: GameState, initialCharId?: string): void;
  close(): void;
  isOpen(): boolean;
}

export function createRosterController(onFlipSound?: () => void): RosterController {
  const dialog = document.getElementById('roster-dialog') as HTMLDialogElement;
  const tabsEl = document.getElementById('roster-tabs') as HTMLElement;
  const listEl = document.getElementById('roster-list') as HTMLElement;
  const countEl = document.getElementById('roster-count') as HTMLElement;
  const canvas = document.getElementById('roster-portrait') as HTMLCanvasElement;
  const sealEl = document.getElementById('roster-seal') as HTMLElement;
  const nameEl = document.getElementById('roster-name') as HTMLElement;
  const campEl = document.getElementById('roster-camp') as HTMLElement;
  const titleEl = document.getElementById('roster-subtitle') as HTMLElement;
  const traitsEl = document.getElementById('roster-traits') as HTMLElement;
  const appearanceEl = document.getElementById('roster-appearance') as HTMLElement;
  const bioEl = document.getElementById('roster-bio') as HTMLElement;
  const ruleLabelEl = document.getElementById('roster-rule-label') as HTMLElement;
  const ruleEl = document.getElementById('roster-rule') as HTMLElement;
  const metBadgeEl = document.getElementById('roster-met-badge') as HTMLElement;

  const ctx = canvas.getContext('2d');
  const patterns: ComicPatterns | null = ctx ? createComicPatterns(ctx) : null;
  const paperPattern = ctx && patterns ? ctx.createPattern(patterns.paperTile, 'repeat') : null;

  let currentFilter: RosterFilter = 'all';
  let selectedId = 'chen_auntie';
  let latestState: GameState | null = null;

  function isMet(profile: CharacterProfile): boolean {
    if (!latestState) return false;
    if (profile.camp === 'resident') return true;
    return Boolean(latestState.metCharacterIds?.includes(profile.id));
  }

  function filteredList(): CharacterProfile[] {
    if (currentFilter === 'all') return CHARACTER_LIST;
    if (currentFilter === 'living') {
      return CHARACTER_LIST.filter((c) => c.camp === 'resident' || c.camp === 'living');
    }
    return CHARACTER_LIST.filter((c) => c.camp === currentFilter);
  }

  function drawPortrait(profile: CharacterProfile) {
    if (!ctx || !patterns) return;
    const W = 280;
    const H = 320;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const eerieBg = profile.camp === 'eerie' || profile.camp === 'trap';
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    if (eerieBg) {
      bg.addColorStop(0, '#131619');
      bg.addColorStop(0.55, '#1f2529');
      bg.addColorStop(1, '#0d1012');
    } else {
      bg.addColorStop(0, '#cfc5b0');
      bg.addColorStop(0.58, '#e6dec9');
      bg.addColorStop(1, '#b8ae99');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (patterns.woodcutH) {
      ctx.save();
      ctx.globalAlpha = eerieBg ? 0.24 : 0.2;
      ctx.fillStyle = patterns.woodcutH;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Subtle moon / ink halo behind portrait
    if (eerieBg) {
      drawInkWashBlot(ctx, W * 0.5, H * 0.42, 110, 110, 0.32, profile.camp === 'trap' ? '176, 36, 28' : '215, 224, 218');
      ctx.fillStyle = 'rgba(236, 232, 218, 0.14)';
      ctx.beginPath();
      ctx.arc(W * 0.5, 96, 52, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255, 250, 238, 0.52)';
      ctx.beginPath();
      ctx.arc(W * 0.5, 102, 56, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw full detailed ink-wash character centered cleanly
    const tallVariant =
      profile.art === 'temple_deity' || profile.art === 'opera_ghost' || profile.art === 'paper_bride';
    drawComicGuest(ctx, {
      variant: profile.art as GuestVariant,
      x: W * 0.5,
      y: tallVariant ? H - 16 : H - 22,
      scale: tallVariant ? 0.84 : 0.96,
      alpha: 1,
      talking: false,
      armRaised: false,
      seconds: 0.6,
      slow: true,
      darkness: eerieBg ? 0.92 : 0.08,
      threat: profile.camp === 'trap' ? 3 : 2,
      patterns
    });

    if (paperPattern) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = paperPattern;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Frame + corner cinnabar seal
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(3, 3, W - 6, H - 6);
    ctx.strokeStyle = eerieBg ? 'rgba(232, 224, 206, 0.24)' : 'rgba(22, 18, 16, 0.28)';
    ctx.lineWidth = 1.1;
    ctx.strokeRect(9, 9, W - 18, H - 18);
    drawRepublicanFrameCorners(ctx, W, H, eerieBg ? 'rgba(220, 62, 48, 0.55)' : 'rgba(176, 38, 28, 0.45)');
    drawRedSeal(ctx, W - 30, 30, 26, profile.sealChar);
  }

  function renderDetail(profile: CharacterProfile) {
    const met = isMet(profile);
    drawPortrait(profile);
    sealEl.textContent = profile.sealChar;
    nameEl.textContent = profile.name;
    campEl.textContent = CAMP_LABELS[profile.camp];
    campEl.dataset.camp = profile.camp;
    titleEl.textContent = profile.title;
    metBadgeEl.textContent = met ? '已照面' : `首现 · 第 ${profile.firstDay} 日`;
    metBadgeEl.classList.toggle('met', met);

    traitsEl.replaceChildren(
      ...profile.traits.map((t) => {
        const span = document.createElement('span');
        span.className = 'rd-trait';
        span.textContent = t;
        return span;
      })
    );
    appearanceEl.textContent = profile.appearance;
    bioEl.textContent = profile.bio;
    ruleLabelEl.textContent =
      profile.camp === 'trap'
        ? '破绽与识破要点'
        : profile.camp === 'eerie'
          ? '夜客规矩与履约要点'
          : '街坊习性与营业贴士';
    ruleEl.textContent = profile.ruleOrHabit;
  }

  function renderAll() {
    const items = filteredList();
    if (!items.some((c) => c.id === selectedId) && items.length > 0) {
      selectedId = items[0].id;
    }

    const metCount = CHARACTER_LIST.filter((c) => isMet(c)).length;
    countEl.textContent = `已收录 ${CHARACTER_LIST.length} 位人物 · 已照面 ${metCount} 位`;

    tabsEl.querySelectorAll<HTMLButtonElement>('button[data-filter]').forEach((btn) => {
      const active = btn.dataset.filter === currentFilter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    listEl.replaceChildren(
      ...items.map((c) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `roster-item camp-${c.camp}${c.id === selectedId ? ' active' : ''}${isMet(c) ? ' met' : ''}`;
        btn.dataset.charId = c.id;
        btn.innerHTML = `<span class="ri-seal">${c.sealChar}</span>
          <span class="ri-body">
            <strong>${c.name}</strong>
            <small>${c.bubbleIdentity}</small>
          </span>
          <span class="ri-tag">${isMet(c) ? '已遇' : `D${c.firstDay}`}</span>`;
        return btn;
      })
    );

    const selected = CHARACTER_PROFILES[selectedId] ?? items[0];
    if (selected) renderDetail(selected);
  }

  tabsEl.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-filter]');
    if (!btn) return;
    const next = btn.dataset.filter as RosterFilter;
    if (next && next !== currentFilter) {
      currentFilter = next;
      onFlipSound?.();
      renderAll();
    }
  });

  listEl.addEventListener('click', (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-char-id]');
    if (!btn) return;
    const id = btn.dataset.charId;
    if (id && id !== selectedId) {
      selectedId = id;
      onFlipSound?.();
      renderAll();
    }
  });

  return {
    open(state: GameState, initialCharId?: string) {
      latestState = state;
      if (initialCharId && CHARACTER_PROFILES[initialCharId]) {
        selectedId = initialCharId;
        currentFilter = 'all';
      }
      renderAll();
      dialog.showModal();
    },
    close() {
      if (dialog.open) dialog.close();
    },
    isOpen() {
      return dialog.open;
    }
  };
}
