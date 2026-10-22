export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type CropKind = 'root' | 'bush' | 'stalk' | 'leafy' | 'flower' | 'fruit';

export interface CropDef {
  id: string;
  name: string;
  season: Season;
  seedPrice: number;
  sellPrice: number;
  /** days needed to advance out of each growth stage; visual stages = length + 1 */
  stages: number[];
  /** if set, crop regrows after harvest in this many days */
  regrow?: number;
  /** produce items gained per harvest */
  harvestQty: number;
  /** can grow out of season inside a greenhouse */
  greenhouse: boolean;
  kind: CropKind;
  leaf: string;
  fruit: string;
}

/** total days from planting until first harvest */
export function daysToMature(c: CropDef): number {
  return c.stages.reduce((a, b) => a + b, 0);
}

const crop = (d: Omit<CropDef, 'harvestQty' | 'greenhouse'> & Partial<CropDef>): CropDef => ({
  harvestQty: 1,
  greenhouse: true,
  ...d,
});

export const CROPS: Record<string, CropDef> = {
  // --- spring ---
  turnip: crop({
    id: 'turnip', name: 'Turnip', season: 'spring', seedPrice: 120, sellPrice: 60,
    stages: [1, 2, 1], kind: 'root', leaf: '#4caf50', fruit: '#f3f0e7',
  }),
  potato: crop({
    id: 'potato', name: 'Potato', season: 'spring', seedPrice: 150, sellPrice: 80,
    stages: [1, 2, 3, 2], kind: 'root', leaf: '#3e8948', fruit: '#c8a064',
  }),
  cucumber: crop({
    id: 'cucumber', name: 'Cucumber', season: 'spring', seedPrice: 200, sellPrice: 60,
    stages: [2, 3, 4], regrow: 5, kind: 'bush', leaf: '#43a047', fruit: '#2e7d32',
  }),
  cabbage: crop({
    id: 'cabbage', name: 'Cabbage', season: 'spring', seedPrice: 500, sellPrice: 250,
    stages: [2, 3, 4, 5], kind: 'leafy', leaf: '#3e8948', fruit: '#8fd14f',
  }),
  strawberry: crop({
    id: 'strawberry', name: 'Strawberry', season: 'spring', seedPrice: 300, sellPrice: 40,
    stages: [1, 2, 3, 2], regrow: 2, kind: 'bush', leaf: '#2e7d32', fruit: '#e23b3b',
  }),
  dawnbell: crop({
    id: 'dawnbell', name: 'Dawnbell', season: 'spring', seedPrice: 400, sellPrice: 160,
    stages: [2, 2, 3], kind: 'flower', leaf: '#558b2f', fruit: '#f6c1e0',
  }),
  // --- summer ---
  tomato: crop({
    id: 'tomato', name: 'Tomato', season: 'summer', seedPrice: 200, sellPrice: 60,
    stages: [2, 2, 3, 3], regrow: 3, kind: 'bush', leaf: '#3e8948', fruit: '#e53935',
  }),
  corn: crop({
    id: 'corn', name: 'Corn', season: 'summer', seedPrice: 300, sellPrice: 100,
    stages: [2, 3, 4, 5], regrow: 3, kind: 'stalk', leaf: '#5d9c3a', fruit: '#f5c542',
  }),
  onion: crop({
    id: 'onion', name: 'Onion', season: 'summer', seedPrice: 150, sellPrice: 80,
    stages: [1, 2, 3, 1], kind: 'root', leaf: '#7cb342', fruit: '#e0c98f',
  }),
  pineapple: crop({
    id: 'pineapple', name: 'Pineapple', season: 'summer', seedPrice: 1000, sellPrice: 500,
    stages: [4, 5, 6, 5], regrow: 5, kind: 'fruit', leaf: '#689f38', fruit: '#f9a825',
  }),
  sunburst: crop({
    id: 'sunburst', name: 'Sunburst', season: 'summer', seedPrice: 400, sellPrice: 160,
    stages: [2, 3, 3], kind: 'flower', leaf: '#558b2f', fruit: '#ffd54f',
  }),
  // --- fall ---
  eggplant: crop({
    id: 'eggplant', name: 'Eggplant', season: 'fall', seedPrice: 120, sellPrice: 80,
    stages: [1, 2, 3, 3], regrow: 3, kind: 'bush', leaf: '#33691e', fruit: '#7e57c2',
  }),
  carrot: crop({
    id: 'carrot', name: 'Carrot', season: 'fall', seedPrice: 300, sellPrice: 120,
    stages: [1, 2, 3, 1], kind: 'root', leaf: '#66bb6a', fruit: '#fb8c00',
  }),
  sweetpotato: crop({
    id: 'sweetpotato', name: 'Sweet Potato', season: 'fall', seedPrice: 300, sellPrice: 120,
    stages: [1, 2, 2, 1], regrow: 2, kind: 'root', leaf: '#558b2f', fruit: '#c2566b',
  }),
  pepper: crop({
    id: 'pepper', name: 'Pepper', season: 'fall', seedPrice: 150, sellPrice: 40,
    stages: [1, 2, 3, 1], regrow: 2, kind: 'bush', leaf: '#2e7d32', fruit: '#43a047',
  }),
};

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
export const SEASON_NAMES: Record<Season, string> = {
  spring: 'Spring', summer: 'Summer', fall: 'Autumn', winter: 'Winter',
};
export const DAYS_PER_SEASON = 30;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS.length;
