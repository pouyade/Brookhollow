import { newGame } from '../src/game/sim/day';
import { G, cellKey, defaultPlayer } from '../src/game/sim/state';

/** a fresh game with an empty, debris-free field, standing on the farm */
export function freshFarm(seed = 42) {
  newGame(defaultPlayer(), seed);
  G.farm = {};
  G.pos = { map: 'farm', x: 20, y: 20, facing: 'down' };
  return G;
}

/** in-memory localStorage for save tests */
export function mockStorage() {
  const data = new Map<string, string>();
  const s = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  (globalThis as any).localStorage = s;
  return data;
}

export const key = cellKey;
