import { T } from '../../rendering/kenney';
import { MapBuilder, hash2 } from '../builder';

export const TOWN_W = 40;
export const TOWN_H = 30;

export function buildTown() {
  const b = new MapBuilder('town', 'Brookhollow', TOWN_W, TOWN_H, T.grass);

  // tree border, opening north (to the farm)
  for (let x = 0; x < TOWN_W; x++) {
    if (x !== 19 && x !== 20) b.put(x, 0, hash2(x, 1) < 0.5 ? T.treeRound : T.treePine);
    b.put(x, TOWN_H - 1, hash2(x, 2) < 0.5 ? T.treeRound : T.treePine);
  }
  for (let y = 1; y < TOWN_H - 1; y++) {
    b.put(0, y, T.treeDark);
    b.put(TOWN_W - 1, y, T.treePineDark);
  }

  // north road and stone plaza
  b.fill(19, 0, 2, 12, T.sand);
  b.fill(12, 11, 16, 9, T.stonePath);
  b.fill(4, 11, 8, 2, T.sand); // to the store
  b.fill(28, 11, 7, 2, T.sand); // to the smithy
  b.fill(19, 20, 2, 9, T.sand); // south road (beach later)
  b.pond(18, 14, 4, 3); // fountain pool
  b.put(17, 13, T.flowerRed, false);
  b.put(22, 13, T.flowerWhite, false);
  b.put(17, 17, T.flowerBlue, false);
  b.put(22, 17, T.flowerRed, false);

  // general store (west)
  const store = b.building(3, 5, 7, 'stone', 3, [1, 5]);
  b.put(store.x - 1, store.y + 1, T.barrel);
  b.put(store.x + 2, store.y + 1, T.crate);
  b.fill(store.x, store.y + 1, 1, 5, T.sand);
  b.warp(store.x, store.y, 'store', 5, 7, 'up', 'general');

  // blacksmith (east) - building only; upgrades arrive in a later milestone
  const smith = b.building(29, 5, 6, 'wood', 2, [4]);
  b.put(smith.x + 2, smith.y + 1, T.anvil);
  b.fill(smith.x, smith.y + 1, 1, 5, T.sand);
  b.interact(smith.x, smith.y, 'sign', 'smith');
  b.solid(smith.x, smith.y);

  // notice board
  b.put(13, 11, T.signpost);
  b.interact(13, 11, 'sign', 'board');

  // trees / benches around
  for (const [x, y] of [[6, 16], [9, 20], [4, 24], [12, 25], [27, 22], [33, 17], [35, 25], [30, 27], [24, 25], [8, 27]])
    b.tallTree(x, y, hash2(x, y) < 0.5 ? T.tallRoundTop : T.appleTop, hash2(x, y) < 0.5 ? T.tallRoundTrunk : T.appleTrunk);
  for (const [x, y] of [[14, 21], [25, 21], [3, 18], [36, 14]]) b.put(x, y, T.bush);
  for (let i = 0; i < 14; i++) {
    const x = 2 + Math.floor(hash2(i, 7) * 36), y = 20 + Math.floor(hash2(7, i) * 8);
    if (b.isFree(x, y)) b.put(x, y, [T.flowerTiny1, T.flowerTiny2, T.flowerTiny3][i % 3], false);
  }

  b.warp(19, 0, 'farm', 43, 38, 'up');
  b.warp(20, 0, 'farm', 44, 38, 'up');
  b.spawn(19, 1);
  return b.m;
}
