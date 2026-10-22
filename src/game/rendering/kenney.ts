// Frame index helpers for the Kenney roguelike spritesheets (CC0, see public/assets/kenney).
// Terrain sheet: 57 cols x 31 rows, 16px tiles with 1px spacing.
// Character sheet: 54 cols x 12 rows, 16px tiles with 1px spacing.
// Indices were checked against a labelled render of the sheet (open the game with ?sheet).

export const SHEET = 'sheet';
export const CHARS = 'chars';
export const GEN = 'gen'; // generated pixel-art sheet (crops, soil, animals, icons)

export const SHEET_COLS = 57;
export const SHEET_ROWS = 31;
export const CHARS_COLS = 54;
export const CHARS_ROWS = 12;

export const t = (col: number, row: number) => row * SHEET_COLS + col;
const c = (col: number, row: number) => row * CHARS_COLS + col;

export const T = {
  // --- ground ---
  water: t(0, 0),
  grass: t(5, 0),
  grass2: t(5, 1),
  dirt: t(6, 0),
  stonePath: t(7, 0),
  sand: t(8, 0),
  grassStones: t(9, 1),
  // 3x3 grass-edged pond, top-left corner; add (dx, dy*SHEET_COLS)
  pondTL: t(2, 0),

  // interior floors (3x3 blocks; centre tile used for fill)
  floorWood: t(8, 2),
  floorStone: t(4, 26),
  floorBeige: t(7, 26),
  wallInterior: t(35, 17),
  wallInteriorStone: t(17, 17),

  // --- flowers (on grass) ---
  flowerRed: t(1, 6),
  flowerWhite: t(1, 9),
  flowerBlue: t(1, 12),
  flowerTiny1: t(29, 9),
  flowerTiny2: t(30, 9),
  flowerTiny3: t(31, 9),

  // --- trees (single tile) ---
  treeRound: t(13, 9),
  treeAutumn: t(14, 9),
  treeDark: t(15, 9),
  treePine: t(16, 9),
  treePineAutumn: t(17, 9),
  treePineDark: t(18, 9),
  bush: t(19, 9),
  // two-tile trees: top drawn overhead, trunk is solid
  tallRoundTop: t(13, 10),
  tallRoundTrunk: t(13, 11),
  tallPineTop: t(16, 10),
  tallPineTrunk: t(16, 11),
  appleTop: t(23, 10),
  appleTrunk: t(23, 11),
  berryBush: t(24, 9),
  smallBush: t(25, 9),

  // --- debris ---
  weed: t(28, 10),
  weed2: t(22, 10),
  rock: t(55, 21),
  boulder: t(54, 21),
  stump: t(53, 19),
  bigStump: t(27, 9),

  // --- fences (wooden) ---
  fenceH: t(48, 23),
  fenceL: t(47, 23),
  fenceR: t(49, 23),
  fencePost: t(45, 23),
  fenceGate: t(46, 23),

  // --- props ---
  signpost: t(19, 0),
  barrel: t(23, 0),
  bucket: t(22, 0),
  crate: t(25, 0),
  anvil: t(15, 0),
  fireplace: t(13, 0),
  produce1: t(15, 6),
  produce2: t(16, 6),
  produce3: t(17, 6),
  bedTop: t(14, 3),
  bedBottom: t(14, 4),
  table: t(20, 6),
  chair: t(21, 3),
  bookshelf: t(43, 12),
  counter: t(25, 4),
  lamp: t(19, 7),
  rugTL: t(10, 16), rugT: t(11, 16), rugTR: t(12, 16),
  rugBL: t(10, 18), rugB: t(11, 18), rugBR: t(12, 18),
  woodpile: t(43, 18),

  // --- buildings ---
  roofBrownL: t(24, 21), roofBrownM: t(25, 21), roofBrownR: t(26, 21),
  roofBrownML: t(24, 22), roofBrownMM: t(25, 22), roofBrownMR: t(26, 22),
  roofBrownBL: t(24, 23), roofBrownBM: t(25, 23), roofBrownBR: t(26, 23),
  roofGrayL: t(31, 21), roofGrayM: t(32, 21), roofGrayR: t(33, 21),
  roofGrayML: t(31, 22), roofGrayMM: t(32, 22), roofGrayMR: t(33, 22),
  roofGrayBL: t(31, 23), roofGrayBM: t(32, 23), roofGrayBR: t(33, 23),
  wallWoodL: t(34, 17), wallWood: t(35, 17), wallWoodR: t(36, 17),
  wallStoneL: t(16, 17), wallStone: t(17, 17), wallStoneR: t(18, 17),
  doorWood: t(30, 6),
  doorShop: t(33, 6),
  windowWood: t(45, 4),
  windowStone: t(41, 4),
  awningRed: t(10, 0),
  awningGreen: t(11, 0),
};

// --- Characters (single front-facing frame; flipped for left/right) ---
export const CH = {
  player: c(0, 6),
  nell: c(0, 5),
  bram: c(1, 6),
  wren: c(0, 9),
  juno: c(1, 8),
  hollis: c(1, 5),
};
