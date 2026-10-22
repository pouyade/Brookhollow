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
  goods: ShopGood[];
}

const seedGoods: ShopGood[] = Object.values(CROPS).map((c) => ({
  item: `${c.id}_seeds`,
  price: c.seedPrice,
  season: c.season,
}));

export const SHOPS: Record<string, ShopDef> = {
  general: {
    id: 'general', name: 'General Store', keeper: 'anna',
    goods: [
      ...seedGoods,
      { item: 'feed', price: 10 },
      { item: 'fodder', price: 20 },
    ],
  },
  ranch: {
    id: 'ranch', name: 'Yodel Ranch', keeper: 'lily',
    goods: [
      { item: 'animal_chicken', price: 1500 },
      { item: 'animal_cow', price: 4000 },
      { item: 'milker', price: 1800 },
      { item: 'feed', price: 10 },
      { item: 'fodder', price: 20 },
    ],
  },
  // blacksmith handled via a special upgrade menu
};

export const UPGRADE_PRICES = [0, 1000, 3000, 8000]; // price to reach tier 1/2/3
