import { CROPS } from './crops';
import type { Season } from './crops';

export interface ShopGood {
  item: string; // item id, or special: 'animal_chicken' | 'animal_cow'
  price: number;
  season?: Season; // only sold in this season
}

export interface ShopDef {
  id: string;
  name: string;
  keeper: string; // npc id for the portrait
  /** opening hours in game minutes [open, close) */
  hours: [number, number];
  /** 0 = Monday ... 6 = Sunday */
  closedWeekdays: number[];
  goods: ShopGood[];
}

const seedGoods: ShopGood[] = Object.values(CROPS).map((c) => ({
  item: `${c.id}_seeds`,
  price: c.seedPrice,
  season: c.season,
}));

export const SHOPS: Record<string, ShopDef> = {
  general: {
    id: 'general', name: 'General Store', keeper: 'nell',
    hours: [9 * 60, 17 * 60], closedWeekdays: [2],
    goods: [
      ...seedGoods,
      { item: 'bread', price: 100 },
    ],
  },
  // ranch, poultry farm and blacksmith arrive in later milestones
};

export const UPGRADE_PRICES = [0, 1000, 3000, 8000]; // price to reach tier 1/2/3
