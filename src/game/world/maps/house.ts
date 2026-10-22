import { T } from '../../rendering/kenney';
import { MapBuilder } from '../builder';

export const BED = { x: 1, y: 3 };

export function buildHouse() {
  const w = 11, h = 9;
  const b = new MapBuilder('house', 'Farmhouse', w, h, T.floorWood, true);
  // back wall (2 rows) and side walls
  for (let x = 0; x < w; x++) {
    b.put(x, 0, T.wallInterior);
    b.put(x, 1, T.wallInterior);
  }
  b.solid(0, 0, 1, h);
  b.solid(w - 1, 0, 1, h);
  b.solid(0, h - 1, w, 1);
  for (let y = 2; y < h; y++) {
    b.ground(0, y, T.wallInterior);
    b.ground(w - 1, y, T.wallInterior);
  }
  b.fill(0, h - 1, w, 1, T.wallInterior);

  b.put(BED.x, BED.y - 1, T.bedTop);
  b.put(BED.x, BED.y, T.bedBottom);
  b.interact(BED.x, BED.y - 1, 'bed');
  b.interact(BED.x, BED.y, 'bed');

  b.solid(4, 1); // TV (drawn by the scene)
  b.interact(4, 1, 'tv');
  b.put(7, 1, T.bookshelf, true, 'deco2');
  b.put(8, 1, T.fireplace, true, 'deco2');
  b.put(2, 1, T.lamp, true, 'deco2');
  b.interact(6, 1, 'calendar'); // wall calendar (drawn by the scene)
  b.put(6, 5, T.table);
  b.put(7, 5, T.chair);
  const rug = [[T.rugTL, T.rugT, T.rugTR], [T.rugBL, T.rugB, T.rugBR]];
  rug.forEach((row, j) => row.forEach((f, i) => b.put(4 + i, 3 + j, f, false)));

  // door back out to the farm
  b.ground(5, h - 1, T.floorWood);
  b.solid(5, h - 1, 1, 1, 0);
  b.warp(5, h - 1, 'farm', 10, 9, 'down');
  b.spawn(5, h - 2);
  return b.m;
}
