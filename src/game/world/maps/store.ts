import { T } from '../../rendering/kenney';
import { MapBuilder } from '../builder';

export function buildStore() {
  const w = 11, h = 9;
  const b = new MapBuilder('store', 'General Store', w, h, T.floorBeige, true);
  for (let x = 0; x < w; x++) {
    b.put(x, 0, T.wallInteriorStone);
    b.put(x, 1, T.wallInteriorStone);
  }
  for (let y = 2; y < h; y++) {
    b.ground(0, y, T.wallInteriorStone);
    b.ground(w - 1, y, T.wallInteriorStone);
  }
  b.fill(0, h - 1, w, 1, T.wallInteriorStone);
  b.solid(0, 0, 1, h);
  b.solid(w - 1, 0, 1, h);
  b.solid(0, h - 1, w, 1);

  // produce shelves along the back wall
  for (const [x, f] of [[1, T.produce1], [2, T.produce2], [3, T.produce3], [7, T.produce1], [8, T.produce2], [9, T.produce3]] as const)
    b.put(x, 1, f, true, 'deco2');
  // counter with the shopkeeper behind it (NPC is placed by the scene)
  for (let x = 3; x <= 7; x++) {
    b.put(x, 4, T.counter);
    b.interact(x, 4, 'shop', 'general');
  }
  b.put(1, 5, T.barrel);
  b.put(9, 5, T.crate);
  b.put(9, 6, T.barrel);

  b.ground(5, h - 1, T.floorBeige);
  b.solid(5, h - 1, 1, 1, 0);
  b.warp(5, h - 1, 'town', 6, 10, 'down');
  b.spawn(5, h - 2);
  return b.m;
}

/** where the shopkeeper stands */
export const STORE_KEEPER_POS = { x: 5, y: 3 };
