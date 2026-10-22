import type { Season } from '../data/crops';
import { SEASONS } from '../data/crops';

export type Weather = 'sun' | 'rain';
export type DebrisType = 'weed' | 'rock' | 'stump' | 'boulder' | 'bigstump';

export interface CropInstance {
  id: string;
  stage: number;
  daysInStage: number;
  withered: boolean;
}

export interface FarmCell {
  tilled: boolean;
  watered: boolean;
  debris?: DebrisType;
  crop?: CropInstance;
}

export interface Animal {
  id: number;
  type: 'chicken' | 'cow';
  name: string;
  fedToday: boolean;
  produceReady: boolean;
  friendship: number;
  x: number; // tile coords on farm
  y: number;
}

export interface InvSlot {
  id: string;
  qty: number;
}

export interface NpcState {
  friendship: number;
  talkedToday: boolean;
  giftedToday: boolean;
}

export type ToolId = 'hoe' | 'can' | 'sickle' | 'axe' | 'hammer';

export interface GameState {
  day: number; // 1..30
  seasonIndex: number;
  year: number;
  timeMin: number; // minutes since midnight
  weather: Weather;
  tomorrowWeather: Weather;
  gold: number;
  stamina: number;
  maxStamina: number;
  inventory: (InvSlot | null)[];
  selected: number; // hotbar index 0..8
  tools: Record<ToolId, number>; // upgrade tier 0..3
  canWater: number;
  farm: Record<string, FarmCell>; // "x,y" -> cell
  animals: Animal[];
  nextAnimalId: number;
  npcs: Record<string, NpcState>;
  bin: InvSlot[]; // shipping bin contents
  // transient (not saved)
  uiOpen: boolean;
  activeScene: string;
  passedOut: boolean;
}

export const INV_SIZE = 24;
export const HOTBAR_SIZE = 9;
export const CAN_CAPACITY = [20, 36, 60, 99];
export const TIER_NAMES = ['', 'Copper ', 'Silver ', 'Gold '];
export const TIER_TINTS = [0xffffff, 0xe8965a, 0xc8d6e8, 0xffd84d];

export let G: GameState = defaultState();

export function defaultState(): GameState {
  const inventory: (InvSlot | null)[] = new Array(INV_SIZE).fill(null);
  inventory[0] = { id: 'hoe', qty: 1 };
  inventory[1] = { id: 'can', qty: 1 };
  inventory[2] = { id: 'sickle', qty: 1 };
  inventory[3] = { id: 'axe', qty: 1 };
  inventory[4] = { id: 'hammer', qty: 1 };
  inventory[5] = { id: 'turnip_seeds', qty: 3 };
  return {
    day: 1,
    seasonIndex: 0,
    year: 1,
    timeMin: 6 * 60,
    weather: 'sun',
    tomorrowWeather: 'sun',
    gold: 500,
    stamina: 100,
    maxStamina: 100,
    inventory,
    selected: 0,
    tools: { hoe: 0, can: 0, sickle: 0, axe: 0, hammer: 0 },
    canWater: CAN_CAPACITY[0],
    farm: {},
    animals: [],
    nextAnimalId: 1,
    npcs: {},
    bin: [],
    uiOpen: false,
    activeScene: 'Farm',
    passedOut: false,
  };
}

export function season(): Season {
  return SEASONS[G.seasonIndex];
}

const SAVE_KEY = 'hmbtn-save-v1';

export function save() {
  const { uiOpen, activeScene, passedOut, ...rest } = G;
  localStorage.setItem(SAVE_KEY, JSON.stringify(rest));
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function load(): boolean {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    G = { ...defaultState(), ...data, uiOpen: false, activeScene: 'Farm', passedOut: false };
    return true;
  } catch {
    return false;
  }
}

export function newGame() {
  G = defaultState();
}

// ---- inventory helpers ----

import { ITEMS } from '../data/items';

/** add qty of item; returns the amount that did NOT fit */
export function addItem(id: string, qty: number): number {
  const def = ITEMS[id];
  let left = qty;
  // fill existing stacks
  for (const slot of G.inventory) {
    if (left <= 0) break;
    if (slot && slot.id === id && slot.qty < def.stack) {
      const take = Math.min(def.stack - slot.qty, left);
      slot.qty += take;
      left -= take;
    }
  }
  // new slots
  for (let i = 0; i < G.inventory.length; i++) {
    if (left <= 0) break;
    if (!G.inventory[i]) {
      const take = Math.min(def.stack, left);
      G.inventory[i] = { id, qty: take };
      left -= take;
    }
  }
  return left;
}

export function countItem(id: string): number {
  return G.inventory.reduce((n, s) => n + (s && s.id === id ? s.qty : 0), 0);
}

export function removeItem(id: string, qty: number): boolean {
  if (countItem(id) < qty) return false;
  let left = qty;
  for (let i = 0; i < G.inventory.length && left > 0; i++) {
    const s = G.inventory[i];
    if (s && s.id === id) {
      const take = Math.min(s.qty, left);
      s.qty -= take;
      left -= take;
      if (s.qty <= 0) G.inventory[i] = null;
    }
  }
  return true;
}

export function selectedSlot(): InvSlot | null {
  return G.inventory[G.selected];
}

/** remove n from the selected slot */
export function consumeSelected(n = 1) {
  const s = G.inventory[G.selected];
  if (!s) return;
  s.qty -= n;
  if (s.qty <= 0) G.inventory[G.selected] = null;
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
