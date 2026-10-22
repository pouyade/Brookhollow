// Frame index helpers for the Kenney roguelike spritesheets.
// Terrain sheet: 57 cols x 31 rows, 16px tiles with 1px spacing.
// Character sheet: 54 cols x 12 rows, 16px tiles with 1px spacing.

export const SHEET = 'sheet';
export const CHARS = 'chars';
export const GEN = 'gen'; // generated pixel-art sheet (crops, animals, icons)

export const SHEET_COLS = 57;
export const CHARS_COLS = 54;

const t = (col: number, row: number) => row * SHEET_COLS + col;
const c = (col: number, row: number) => row * CHARS_COLS + col;

// --- Terrain / ground ---
export const T = {
  water: t(0, 0),
  waterLily: t(0, 1),
  grass: t(5, 0),
  grass2: t(5, 1),
  dirt: t(6, 0),
  dirt2: t(6, 1),
  stonePath: t(7, 0),
  stonePath2: t(7, 1),
  sandPath: t(8, 0),
  sandPath2: t(8, 1),
  grassStones: t(9, 1),

  // 3x3 grass-edged pond (top-left at pondTL)
  pondTL: t(2, 0),

  // flowers on grass (decor)
  flowerRed: t(0, 5),
  flowerWhite: t(0, 8),
  flowerBlue: t(0, 12),

  // trees & bushes (1 tile)
  treeRound: t(15, 9),
  treeRound2: t(15, 11),
  treePine: t(16, 9),
  treePineFall: t(17, 9),
  treePineTeal: t(18, 9),
  treeApple: t(23, 11),
  bushSmall: t(28, 11),
  bushFruit: t(24, 10),
  sprout: t(22, 11),
  deadTree: t(27, 11),
  hedgeL: t(19, 9),
  hedgeM: t(20, 9),
  hedgeR: t(21, 9),

  // debris
  rock: t(53, 21),
  rockMossy: t(53, 22),
  weedOrange: t(43, 22),
  weedGreen: t(44, 22),
  stumpTrunk: t(27, 11), // big dead tree used as stump debris

  // fences (wooden, rows 23-24 on the sheet)
  fenceH: t(47, 23),
  fenceV: t(50, 23),
  fencePost: t(46, 23),
  fenceGate: t(45, 23),

  // buildings / town
  signArrow: t(19, 0),
  signBlank: t(20, 0),
  barrel: t(23, 0),
  crate: t(22, 0),
  anvil: t(15, 0),
  shelfProduce1: t(15, 6),
  shelfProduce2: t(16, 6),
  shelfProduce3: t(17, 6),
  chest: t(37, 8),
  bedTop: t(15, 2),
  bedBottom: t(15, 3),
  bedPlainTop: t(16, 2),
  bedPlainBottom: t(16, 3),
  doorWood: t(33, 0),
  doorOpen: t(36, 0),
  windowLit: t(41, 4),
  torch: t(17, 7),
  campfire: t(15, 8),

  // wall / roof building blocks (beige + brown sets identified on sheet)
  wallBeige: t(16, 13),
  wallBeigeFace: t(16, 14), // wall with bottom face
  wallBrown: t(36, 13),
  wallBrownFace: t(36, 14),
  wallGray: t(23, 13),
  wallGrayFace: t(23, 14),
  roofBeige: t(16, 21),
  roofBrown: t(36, 21),
  roofGray: t(30, 21),

  // interior floors (big carpet/floor blocks rows 25+)
  floorWood: t(0, 26),
  floorStone: t(4, 26),

  // food / items decor
  fish: t(55, 12),
  honey: t(43, 11),
  mound: t(54, 19),
};

// --- Characters (single-frame, front-facing; flip for left/right) ---
export const CH = {
  player: c(0, 6), // blond man with brown vest
  anna: c(0, 5), // blonde woman in orange dress - general store
  greg: c(1, 6), // black-bearded man - blacksmith
  maria: c(0, 9), // red-haired woman - villager
  lily: c(1, 8), // blonde woman in lavender - ranch
  elder: c(1, 5), // gray-haired woman - villager
};
