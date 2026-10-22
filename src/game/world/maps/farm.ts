import { T } from '../../rendering/kenney';
import { MapBuilder, hash2 } from '../builder';

export const FARM_W = 48;
export const FARM_H = 40;
/** the fenced field; debris is scattered inside it on a new game */
export const FIELD = { x: 6, y: 14, w: 32, h: 21 };

export function buildFarm() {
  const b = new MapBuilder('farm', 'Farm', FARM_W, FARM_H, T.grass);

  // border woods: dense single trees, with a few tall ones inside the border
  for (let x = 0; x < FARM_W; x++) {
    for (const y of [0, 1, FARM_H - 1]) {
      if (y === FARM_H - 1 && (x === 43 || x === 44)) continue; // south exit to town
      b.put(x, y, hash2(x, y) < 0.5 ? T.treePine : T.treeRound);
    }
  }
  for (let y = 2; y < FARM_H - 1; y++) {
    for (const x of [0, 1, FARM_W - 1]) b.put(x, y, hash2(x, y) < 0.5 ? T.treePineDark : T.treeDark);
  }
  for (const [x, y] of [[3, 4], [4, 11], [3, 22], [3, 30], [41, 4], [46, 14], [40, 29], [46, 33], [28, 3], [3, 36]]) {
    b.tallTree(x, y, hash2(x, y) < 0.5 ? T.tallRoundTop : T.tallPineTop, hash2(x, y) < 0.5 ? T.tallRoundTrunk : T.tallPineTrunk);
  }

  // road: house door -> south-east exit
  b.fill(10, 9, 1, 2, T.sand);
  b.fill(10, 10, 35, 2, T.sand);
  b.fill(43, 10, 2, FARM_H - 10, T.sand);

  // farmhouse, bin, mailbox
  const door = b.building(7, 4, 7, 'wood', 3, [1, 5]);
  b.warp(door.x, door.y, 'house', 5, 7, 'up');
  b.spawn(door.x, door.y + 1);
  b.interact(13, 9, 'bin');
  b.solid(13, 9);
  b.interact(6, 9, 'mailbox');
  b.solid(6, 9);
  b.put(15, 8, T.woodpile);
  b.put(16, 8, T.barrel);
  b.interact(8, 9, 'sign', 'farm');
  b.put(8, 9, T.signpost);
  for (const [x, y, f] of [[7, 3, T.flowerRed], [12, 3, T.flowerWhite], [5, 7, T.flowerBlue], [15, 6, T.flowerRed], [16, 5, T.flowerWhite]] as const)
    b.put(x, y, f, false);

  // pond (water source for the can)
  b.pond(32, 4, 4, 3);
  b.put(31, 5, T.smallBush);

  // fenced field with gates on the north side and east side
  const f = FIELD;
  b.fenceRow(f.x - 1, f.y - 1, f.w + 2, [21, 22]);
  b.fenceRow(f.x - 1, f.y + f.h, f.w + 2);
  b.fenceCol(f.x - 1, f.y, f.h);
  b.fenceCol(f.x + f.w, f.y, f.h, [24, 25]);
  b.fill(21, 12, 2, 1, T.sand);
  b.fill(f.x + f.w + 1, 24, 4, 2, T.sand);
  b.tillable(f.x, f.y, f.w, f.h);

  // grazing meadow east of the road (future barn/coop)
  for (const [x, y] of [[40, 20], [41, 26], [46, 22]]) b.put(x, y, T.bush);

  b.warp(43, FARM_H - 1, 'town', 19, 1, 'down');
  b.warp(44, FARM_H - 1, 'town', 20, 1, 'down');
  return b.m;
}
