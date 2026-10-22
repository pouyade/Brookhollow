import { CROPS } from './crops';

export type ItemKind = 'tool' | 'seed' | 'produce' | 'animal' | 'misc';

export interface ItemDef {
  id: string;
  name: string;
  /** frame name on the generated 'gen' texture */
  icon: string;
  kind: ItemKind;
  sellPrice: number; // 0 = cannot be shipped
  stack: number;
  cropId?: string;
  desc?: string;
}

export const ITEMS: Record<string, ItemDef> = {
  hoe: { id: 'hoe', name: 'Hoe', icon: 'icon_hoe', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Tills soil' },
  can: { id: 'can', name: 'Watering Can', icon: 'icon_can', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Waters crops. Refill at water.' },
  sickle: { id: 'sickle', name: 'Sickle', icon: 'icon_sickle', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Cuts weeds' },
  axe: { id: 'axe', name: 'Axe', icon: 'icon_axe', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Chops stumps' },
  hammer: { id: 'hammer', name: 'Hammer', icon: 'icon_hammer', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Smashes rocks' },
  milker: { id: 'milker', name: 'Milker', icon: 'icon_milker', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Milks a fed cow' },
  feed: { id: 'feed', name: 'Chicken Feed', icon: 'icon_feed', kind: 'misc', sellPrice: 0, stack: 99, desc: 'Feeds one chicken' },
  fodder: { id: 'fodder', name: 'Fodder', icon: 'icon_fodder', kind: 'misc', sellPrice: 0, stack: 99, desc: 'Feeds one cow' },
  egg: { id: 'egg', name: 'Egg', icon: 'icon_egg', kind: 'animal', sellPrice: 50, stack: 99 },
  milk: { id: 'milk', name: 'Milk', icon: 'icon_milk', kind: 'animal', sellPrice: 150, stack: 99 },
};

// generate seed + produce items for every crop
for (const c of Object.values(CROPS)) {
  ITEMS[`${c.id}_seeds`] = {
    id: `${c.id}_seeds`, name: `${c.name} Seeds`, icon: `icon_seeds_${c.id}`,
    kind: 'seed', sellPrice: Math.floor(c.seedPrice / 2), stack: 99, cropId: c.id,
  };
  ITEMS[c.id] = {
    id: c.id, name: c.name, icon: `icon_${c.id}`,
    kind: 'produce', sellPrice: c.sellPrice, stack: 99, cropId: c.id,
  };
}
