import { SEASONS, SEASON_NAMES } from '../../data/crops';
import { G, SAVE_VERSION, defaultState, setState } from '../sim/state';
import type { GameState } from '../sim/state';

/**
 * Save files are versioned envelopes in localStorage, one key per slot plus a backup of
 * the previous write. Loading runs migrations up to SAVE_VERSION and falls back to the
 * backup when the main copy is unreadable.
 */

export const SLOTS = 3;
const KEY = (slot: number) => `hmbtn-slot-${slot}`;
const BACKUP = (slot: number) => `hmbtn-slot-${slot}-bak`;
const LAST_SLOT = 'hmbtn-last-slot';

export interface SaveSummary {
  name: string;
  farmName: string;
  /** English date, kept for older saves; prefer the parts below */
  date: string;
  day?: number;
  seasonIndex?: number;
  year?: number;
  gold: number;
  savedAt: number;
}

interface Envelope {
  version: number;
  savedAt: number;
  summary: SaveSummary;
  data: GameState;
}

/** migrations[n] upgrades data from version n to n+1 */
const migrations: Record<number, (d: any) => any> = {
  // v1 stored morning notes as English strings; v2 stores i18n keys
  1: (d) => ({
    ...d,
    morningReport: d.morningReport
      ? { ...d.morningReport, notes: (d.morningReport.notes ?? []).map((text: string) => ({ key: 'note.raw', params: { text } })) }
      : null,
  }),
};

export let currentSlot = 1;

export function setSlot(slot: number) {
  currentSlot = slot;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function summarize(s: GameState, savedAt = Date.now()): SaveSummary {
  return {
    name: s.player.name,
    farmName: s.player.farmName,
    date: `${SEASON_NAMES[SEASONS[s.seasonIndex]]} ${s.day}, Year ${s.year}`,
    day: s.day,
    seasonIndex: s.seasonIndex,
    year: s.year,
    gold: s.gold,
    savedAt,
  };
}

export function serialize(s: GameState): string {
  const env: Envelope = { version: SAVE_VERSION, savedAt: Date.now(), summary: summarize(s), data: s };
  return JSON.stringify(env);
}

/** parse + migrate + validate. Throws on unrecoverable data. */
export function deserialize(raw: string): GameState {
  const env = JSON.parse(raw) as Envelope;
  if (!env || typeof env !== 'object' || !env.data) throw new Error('not a save file');
  let data = env.data as any;
  let v = env.version ?? 1;
  if (v > SAVE_VERSION) throw new Error(`save is from a newer version (${v})`);
  while (v < SAVE_VERSION) {
    const m = migrations[v];
    if (!m) throw new Error(`no migration from v${v}`);
    data = m(data);
    v++;
  }
  return validate(data);
}

/** fill any missing fields from defaults and sanity-check the important ones */
export function validate(d: any): GameState {
  const base = defaultState(d?.seed ?? 1);
  if (typeof d !== 'object' || d === null) throw new Error('bad save data');
  const s: GameState = { ...base, ...d, version: SAVE_VERSION };
  s.player = { ...base.player, ...(d.player ?? {}) };
  s.stats = { ...base.stats, ...(d.stats ?? {}) };
  s.materials = { ...base.materials, ...(d.materials ?? {}) };
  s.tools = { ...base.tools, ...(d.tools ?? {}) };
  s.pos = { ...base.pos, ...(d.pos ?? {}) };
  for (const k of ['day', 'seasonIndex', 'year', 'gold', 'timeMin', 'stamina'] as const)
    if (typeof s[k] !== 'number' || !Number.isFinite(s[k])) throw new Error(`invalid ${k}`);
  if (s.day < 1 || s.day > 30 || s.seasonIndex < 0 || s.seasonIndex > 3) throw new Error('invalid date');
  if (!Array.isArray(s.inventory)) throw new Error('invalid inventory');
  while (s.inventory.length < base.inventory.length) s.inventory.push(null);
  return s;
}

export function save(slot = currentSlot): boolean {
  const st = storage();
  if (!st) return false;
  try {
    const prev = st.getItem(KEY(slot));
    if (prev) st.setItem(BACKUP(slot), prev);
    st.setItem(KEY(slot), serialize(G));
    st.setItem(LAST_SLOT, String(slot));
    currentSlot = slot;
    return true;
  } catch {
    return false;
  }
}

/** loads a slot into G; tries the backup copy if the main one is damaged */
export function load(slot: number): { ok: boolean; recovered?: boolean; error?: string } {
  const st = storage();
  if (!st) return { ok: false, error: 'Storage unavailable' };
  const main = st.getItem(KEY(slot));
  if (!main) return { ok: false, error: 'Empty slot' };
  try {
    setState(deserialize(main));
    currentSlot = slot;
    st.setItem(LAST_SLOT, String(slot));
    return { ok: true };
  } catch (e) {
    const bak = st.getItem(BACKUP(slot));
    if (bak) {
      try {
        setState(deserialize(bak));
        currentSlot = slot;
        return { ok: true, recovered: true };
      } catch {
        /* fall through */
      }
    }
    return { ok: false, error: (e as Error).message };
  }
}

export function slotSummary(slot: number): SaveSummary | null {
  const raw = storage()?.getItem(KEY(slot));
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as Envelope).summary ?? null;
  } catch {
    return { name: '', farmName: '', date: '', gold: 0, savedAt: 0 };
  }
}

export function lastSlot(): number | null {
  const v = Number(storage()?.getItem(LAST_SLOT));
  return v >= 1 && v <= SLOTS && slotSummary(v) ? v : null;
}

export function deleteSlot(slot: number) {
  storage()?.removeItem(KEY(slot));
  storage()?.removeItem(BACKUP(slot));
}

// ---- settings are global, not per save ----

export interface Settings {
  volume: number; // 0..1
  muted: boolean;
  showHints: boolean;
}

const SETTINGS_KEY = 'hmbtn-settings';

export function loadSettings(): Settings {
  const def: Settings = { volume: 0.5, muted: false, showHints: true };
  try {
    return { ...def, ...JSON.parse(storage()?.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return def;
  }
}

export function saveSettings(s: Settings) {
  try {
    storage()?.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
