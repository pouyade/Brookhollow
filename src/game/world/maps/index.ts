import type { MapData, MapId } from '../mapTypes';
import { buildFarm } from './farm';
import { buildHouse } from './house';
import { buildStore } from './store';
import { buildTown } from './town';

const builders: Record<MapId, () => MapData> = {
  farm: buildFarm,
  house: buildHouse,
  town: buildTown,
  store: buildStore,
};

const cache = new Map<MapId, MapData>();

/** Static map layout (memoized). Dynamic state such as soil and debris lives in GameState. */
export function getMap(id: MapId): MapData {
  let m = cache.get(id);
  if (!m) {
    m = builders[id]();
    cache.set(id, m);
  }
  return m;
}
