import type { Season } from '../../data/crops';
import { SEASONS } from '../../data/crops';
import type { Facing, MapId } from '../world/mapTypes';

export const SAVE_VERSION = 2;

export type Weather = 'sun' | 'cloudy' | 'rain' | 'storm' | 'snow';
export type DebrisType = 'weed' | 'rock' | 'stump' | 'boulder' | 'bigstump';

export interface CropInstance {
  id: string;
  stage: number;
  daysInStage: number;
  withered: boolean;
  /** true once harvested at least once (regrowing crops) */
  regrowing: boolean;
}

export interface FarmCell {
  tilled: boolean;
  watered: boolean;
  debris?: DebrisType;
  crop?: CropInstance;
}

export interface InvSlot {
  id: string;
  qty: number;
}

export interface NpcState {
  friendship: number;
  talkedToday: boolean;
  giftedToday: boolean;
  met: boolean;
  /** gift ids whose reaction the player has seen (journal discovery) */
  knownGifts: string[];
}

export type ToolId = 'hoe' | 'can' | 'sickle' | 'axe' | 'hammer';

export interface PlayerInfo {
  name: string;
  farmName: string;
  dogName: string;
  birthday: { season: Season; day: number };
}

export interface ShipLine {
  id: string;
  qty: number;
  gold: number;
}

/**
 * A localisable message stored in the save: `key` is an i18n key. Params named `season`
 * (index), `weather` (id) and `npc` (id) are translated when shown.
 */
export interface Note {
  key: string;
  params?: Record<string, string | number>;
}

export interface Stats {
  goldEarned: number;
  shipped: Record<string, number>;
  harvested: Record<string, number>;
  planted: number;
  debrisCleared: number;
  daysPlayed: number;
}

export interface GameState {
  version: number;
  seed: number;
  player: PlayerInfo;
  day: number; // 1..30
  seasonIndex: number;
  year: number;
  timeMin: number; // minutes since midnight, may exceed 1440 after midnight
  weather: Weather;
  tomorrowWeather: Weather;
  gold: number;
  stamina: number;
  maxStamina: number;
  inventory: (InvSlot | null)[];
  selected: number; // hotbar index 0..8
  tools: Record<ToolId, number>; // upgrade tier 0..3
  canWater: number;
  materials: { lumber: number; stone: number };
  farm: Record<string, FarmCell>; // "x,y" -> cell
  npcs: Record<string, NpcState>;
  bin: InvSlot[]; // shipping bin contents
  /** absolute index of the last day whose overnight processing has run */
  lastProcessedDay: number;
  /** shown when the player wakes up; notes are translated at display time */
  morningReport: { shipped: ShipLine[]; total: number; notes: Note[] } | null;
  mail: string[]; // unread letter ids
  readMail: string[];
  stats: Stats;
  pos: { map: MapId; x: number; y: number; facing: Facing };
  flags: Record<string, boolean>;
}

export const INV_SIZE = 24;
export const HOTBAR_SIZE = 9;
export const CAN_CAPACITY = [30, 45, 70, 99];
export const TIER_NAMES = ['', 'Copper ', 'Silver ', 'Gold '];
export const TIER_TINTS = [0xffffff, 0xe8965a, 0xc8d6e8, 0xffd84d];
export const STARTING_GOLD = 500;

export let G: GameState = defaultState();

export function defaultPlayer(): PlayerInfo {
  return { name: 'Sam', farmName: 'Willowbrook', dogName: 'Biscuit', birthday: { season: 'spring', day: 1 } };
}

export function defaultState(seed = 1, player: PlayerInfo = defaultPlayer()): GameState {
  const inventory: (InvSlot | null)[] = new Array(INV_SIZE).fill(null);
  inventory[0] = { id: 'hoe', qty: 1 };
  inventory[1] = { id: 'can', qty: 1 };
  inventory[2] = { id: 'sickle', qty: 1 };
  inventory[3] = { id: 'axe', qty: 1 };
  inventory[4] = { id: 'hammer', qty: 1 };
  inventory[5] = { id: 'turnip_seeds', qty: 2 };
  return {
    version: SAVE_VERSION,
    seed,
    player,
    day: 1,
    seasonIndex: 0,
    year: 1,
    timeMin: 6 * 60,
    weather: 'sun',
    tomorrowWeather: 'sun',
    gold: STARTING_GOLD,
    stamina: 100,
    maxStamina: 100,
    inventory,
    selected: 0,
    tools: { hoe: 0, can: 0, sickle: 0, axe: 0, hammer: 0 },
    canWater: CAN_CAPACITY[0],
    materials: { lumber: 0, stone: 0 },
    farm: {},
    npcs: {},
    bin: [],
    lastProcessedDay: -1,
    morningReport: null,
    mail: ['welcome'],
    readMail: [],
    stats: { goldEarned: 0, shipped: {}, harvested: {}, planted: 0, debrisCleared: 0, daysPlayed: 0 },
    pos: { map: 'house', x: 1, y: 4, facing: 'down' },
    flags: {},
  };
}

export function setState(s: GameState) {
  G = s;
}

export function season(): Season {
  return SEASONS[G.seasonIndex];
}

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function getCell(x: number, y: number): FarmCell | undefined {
  return G.farm[cellKey(x, y)];
}

export function ensureCell(x: number, y: number): FarmCell {
  const k = cellKey(x, y);
  if (!G.farm[k]) G.farm[k] = { tilled: false, watered: false };
  return G.farm[k];
}

/** drop cells that carry no information to keep saves small */
export function pruneCell(x: number, y: number) {
  const k = cellKey(x, y);
  const c = G.farm[k];
  if (c && !c.tilled && !c.debris && !c.crop) delete G.farm[k];
}

export function npcState(id: string): NpcState {
  if (!G.npcs[id]) G.npcs[id] = { friendship: 0, talkedToday: false, giftedToday: false, met: false, knownGifts: [] };
  return G.npcs[id];
}
