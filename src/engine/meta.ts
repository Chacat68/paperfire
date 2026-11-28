import { CHARACTER_PROFILES } from '../data/characters';
import type { GameState } from '../data/types';

export const META_STORAGE_KEY = 'paperfire-v4-meta';

export const VIRAL_TOKEN_IDS = [
  'courier_receipt',
  'ward_badge',
  'elegy_score',
  'zodiac_chip',
  'red_zhong_die',
  'puppet_cross'
] as const;

export type EndingId = 'true_ending' | 'steady_foot' | 'barely_open' | 'debt_left';

export const ENDING_LABELS: Record<EndingId, string> = {
  true_ending: '真结局 · 阴阳双稳',
  steady_foot: '站稳脚跟',
  barely_open: '勉强维系',
  debt_left: '夜账未清'
};

export interface MetaArchive {
  metCharacterIds: string[];
  unlockedIntelIds: string[];
  collectedTokenIds: string[];
  endingsUnlocked: EndingId[];
  runsCompleted: number;
  bestPts: number;
}

export function createEmptyMetaArchive(): MetaArchive {
  return {
    metCharacterIds: ['liu_tailor', 'helper_xiaoshuan', 'paper_boy'],
    unlockedIntelIds: [],
    collectedTokenIds: [],
    endingsUnlocked: [],
    runsCompleted: 0,
    bestPts: 0
  };
}

export function evaluateEnding(state: GameState): EndingId {
  const isFullCampaign = state.maxDay >= 15;
  const trueEnding =
    isFullCampaign &&
    state.h < 10 &&
    state.handle === 0 &&
    state.ty >= 8 &&
    state.tn >= 6 &&
    state.outcomes[15] === 'success';
  if (trueEnding) return 'true_ending';
  if (state.h < 12 && state.handle === 0 && state.m >= 60) return 'steady_foot';
  if (state.h < 12 && state.ty >= 4) return 'barely_open';
  return 'debt_left';
}

function sanitizeCharacterIds(ids: unknown): string[] {
  const out = new Set<string>(['liu_tailor', 'helper_xiaoshuan', 'paper_boy']);
  if (Array.isArray(ids)) {
    for (const raw of ids) {
      if (typeof raw !== 'string') continue;
      const mapped = raw === 'elder_scholar' ? 'old_scholar' : raw;
      if (CHARACTER_PROFILES[mapped]) out.add(mapped);
    }
  }
  return [...out];
}

function sanitizeStringList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((v): v is string => typeof v === 'string' && v.length > 0))];
}

function sanitizeEndings(list: unknown): EndingId[] {
  const valid = new Set<EndingId>(['true_ending', 'steady_foot', 'barely_open', 'debt_left']);
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((v): v is EndingId => typeof v === 'string' && valid.has(v as EndingId)))];
}

export function loadMetaArchive(): MetaArchive {
  try {
    const raw = localStorage.getItem(META_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<MetaArchive>;
      if (parsed && typeof parsed === 'object') {
        return {
          metCharacterIds: sanitizeCharacterIds(parsed.metCharacterIds),
          unlockedIntelIds: sanitizeStringList(parsed.unlockedIntelIds),
          collectedTokenIds: sanitizeStringList(parsed.collectedTokenIds),
          endingsUnlocked: sanitizeEndings(parsed.endingsUnlocked),
          runsCompleted: typeof parsed.runsCompleted === 'number' && parsed.runsCompleted >= 0 ? Math.floor(parsed.runsCompleted) : 0,
          bestPts: typeof parsed.bestPts === 'number' && parsed.bestPts >= 0 ? Math.floor(parsed.bestPts) : 0
        };
      }
    }
  } catch {
    // ignore storage errors
  }
  return createEmptyMetaArchive();
}

export function saveMetaArchive(meta: MetaArchive): void {
  try {
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // ignore storage errors
  }
}

export function clearMetaArchive(): void {
  try {
    localStorage.removeItem(META_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function syncMetaFromState(state: GameState): MetaArchive {
  const meta = loadMetaArchive();
  let changed = false;

  const metSet = new Set(meta.metCharacterIds);
  for (const id of state.metCharacterIds ?? []) {
    const mapped = id === 'elder_scholar' ? 'old_scholar' : id;
    if (CHARACTER_PROFILES[mapped] && !metSet.has(mapped)) {
      metSet.add(mapped);
      changed = true;
    }
  }
  if (changed) meta.metCharacterIds = [...metSet];

  const intelSet = new Set(meta.unlockedIntelIds);
  let intelChanged = false;
  for (const id of state.unlockedIntelIds ?? []) {
    if (!intelSet.has(id)) {
      intelSet.add(id);
      intelChanged = true;
    }
  }
  if (intelChanged) {
    meta.unlockedIntelIds = [...intelSet];
    changed = true;
  }

  const tokenSet = new Set(meta.collectedTokenIds);
  let tokenChanged = false;
  for (const t of state.tokens ?? []) {
    if (t?.id && !tokenSet.has(t.id)) {
      tokenSet.add(t.id);
      tokenChanged = true;
    }
  }
  if (tokenChanged) {
    meta.collectedTokenIds = [...tokenSet];
    changed = true;
  }

  if (state.phase === 'end' && !state.metaRecordedEnd) {
    state.metaRecordedEnd = true;
    const ending = evaluateEnding(state);
    if (!meta.endingsUnlocked.includes(ending)) {
      meta.endingsUnlocked.push(ending);
    }
    meta.runsCompleted += 1;
    meta.bestPts = Math.max(meta.bestPts, state.pts);
    changed = true;
  }

  if (changed) {
    saveMetaArchive(meta);
  }
  return meta;
}
