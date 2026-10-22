export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type CropKind = 'root' | 'bush' | 'stalk' | 'leafy';

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
  kind: CropKind;
  leaf: string;
  fruit: string;
}

export const CROPS: Record<string, CropDef> = {
  turnip: {
    id: 'turnip', name: 'Turnip', season: 'spring', seedPrice: 120, sellPrice: 60,
    stages: [1, 2, 2], kind: 'root', leaf: '#4caf50', fruit: '#f3f0e7',
  },
  potato: {
    id: 'potato', name: 'Potato', season: 'spring', seedPrice: 150, sellPrice: 80,
    stages: [1, 2, 3, 2], kind: 'root', leaf: '#3e8948', fruit: '#c8a064',
  },
  cabbage: {
    id: 'cabbage', name: 'Cabbage', season: 'spring', seedPrice: 500, sellPrice: 250,
    stages: [2, 3, 4, 5], kind: 'leafy', leaf: '#3e8948', fruit: '#8fd14f',
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', season: 'spring', seedPrice: 300, sellPrice: 60,
    stages: [1, 2, 3, 3], regrow: 3, kind: 'bush', leaf: '#2e7d32', fruit: '#e23b3b',
  },
  tomato: {
    id: 'tomato', name: 'Tomato', season: 'summer', seedPrice: 200, sellPrice: 60,
    stages: [2, 2, 3, 3], regrow: 3, kind: 'bush', leaf: '#3e8948', fruit: '#e53935',
  },
  corn: {
    id: 'corn', name: 'Corn', season: 'summer', seedPrice: 300, sellPrice: 100,
    stages: [2, 3, 4, 5], regrow: 4, kind: 'stalk', leaf: '#5d9c3a', fruit: '#f5c542',
  },
  onion: {
    id: 'onion', name: 'Onion', season: 'summer', seedPrice: 150, sellPrice: 80,
    stages: [1, 2, 3], kind: 'root', leaf: '#7cb342', fruit: '#e0c98f',
  },
  eggplant: {
    id: 'eggplant', name: 'Eggplant', season: 'fall', seedPrice: 120, sellPrice: 80,
    stages: [1, 2, 3, 3], regrow: 3, kind: 'bush', leaf: '#33691e', fruit: '#7e57c2',
  },
  carrot: {
    id: 'carrot', name: 'Carrot', season: 'fall', seedPrice: 300, sellPrice: 120,
    stages: [1, 2, 3], kind: 'root', leaf: '#66bb6a', fruit: '#fb8c00',
  },
  sweetpotato: {
    id: 'sweetpotato', name: 'Sweet Potato', season: 'fall', seedPrice: 300, sellPrice: 120,
    stages: [1, 2, 2], regrow: 2, kind: 'root', leaf: '#558b2f', fruit: '#c2566b',
  },
};

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
export const SEASON_NAMES: Record<Season, string> = {
  spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter',
};
export const DAYS_PER_SEASON = 30;
