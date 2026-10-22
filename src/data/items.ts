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
  /** stamina restored when eaten; undefined = not edible */
  energy?: number;
  /** can be given to villagers */
  giftable?: boolean;
  desc?: string;
}

export const ITEMS: Record<string, ItemDef> = {
  hoe: { id: 'hoe', name: 'Hoe', icon: 'icon_hoe', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Tills soil so seeds can be planted.' },
  can: { id: 'can', name: 'Watering Can', icon: 'icon_can', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Waters soil. Refill it at the pond.' },
  sickle: { id: 'sickle', name: 'Sickle', icon: 'icon_sickle', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Cuts weeds and clears withered crops.' },
  axe: { id: 'axe', name: 'Axe', icon: 'icon_axe', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Chops stumps into lumber.' },
  hammer: { id: 'hammer', name: 'Hammer', icon: 'icon_hammer', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Breaks rocks into stone.' },
  milker: { id: 'milker', name: 'Milker', icon: 'icon_milker', kind: 'tool', sellPrice: 0, stack: 1, desc: 'Milks a fed cow.' },
  feed: { id: 'feed', name: 'Chicken Feed', icon: 'icon_feed', kind: 'misc', sellPrice: 0, stack: 99, desc: 'Feeds one chicken for a day.' },
  fodder: { id: 'fodder', name: 'Fodder', icon: 'icon_fodder', kind: 'misc', sellPrice: 0, stack: 99, desc: 'Feeds one cow or sheep for a day.' },
  egg: { id: 'egg', name: 'Egg', icon: 'icon_egg', kind: 'animal', sellPrice: 50, stack: 99, energy: 5, giftable: true },
  milk: { id: 'milk', name: 'Milk', icon: 'icon_milk', kind: 'animal', sellPrice: 100, stack: 99, energy: 10, giftable: true },
  bread: { id: 'bread', name: 'Bread', icon: 'icon_bread', kind: 'misc', sellPrice: 0, stack: 99, energy: 25, giftable: true, desc: 'Fresh from the general store.' },
};

// generate seed + produce items for every crop
for (const c of Object.values(CROPS)) {
  ITEMS[`${c.id}_seeds`] = {
    id: `${c.id}_seeds`, name: `${c.name} Seeds`, icon: `icon_seeds_${c.id}`,
    kind: 'seed', sellPrice: 0, stack: 99, cropId: c.id,
    desc: `Plants a 3x3 patch of tilled soil. Grows in ${c.season === 'fall' ? 'autumn' : c.season}.`,
  };
  ITEMS[c.id] = {
    id: c.id, name: c.name, icon: `icon_${c.id}`,
    kind: 'produce', sellPrice: c.sellPrice, stack: 99, cropId: c.id,
    energy: c.kind === 'flower' ? undefined : Math.max(3, Math.round(c.sellPrice / 15)),
    giftable: true,
  };
}

export function itemDef(id: string): ItemDef {
  const d = ITEMS[id];
  if (!d) throw new Error(`unknown item ${id}`);
  return d;
}
