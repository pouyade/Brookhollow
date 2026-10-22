// Draws the 'gen' sprite sheet at boot: soil, every crop growth stage, item icons and a
// few props. Everything is original pixel art drawn with canvas rects so it can be
// replaced by hand-made sprites later by keeping the same frame names.

import { CROPS } from '../../data/crops';
import type { CropDef } from '../../data/crops';
import { ITEMS } from '../../data/items';

export const GEN_TILE = 16;
const COLS = 32;

type Ctx = CanvasRenderingContext2D;
export interface GenFrame {
  name: string;
  x: number;
  y: number;
}

// ---------------------------------------------------------------- colour helpers

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = (c: number) => (f >= 0 ? c + (255 - c) * f : c * (1 + f));
  return `rgb(${clamp(m(r))},${clamp(m(g))},${clamp(m(b))})`;
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** filled circle-ish blob with a darker outline and a highlight */
function blob(ctx: Ctx, cx: number, cy: number, r: number, color: string, outline = true) {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d <= r * r + r * 0.6) {
        const edge = d > (r - 1) * (r - 1) + (r - 1) * 0.6;
        rect(ctx, cx + x, cy + y, 1, 1, edge && outline ? shade(color, -0.35) : color);
      }
    }
  if (r >= 2) rect(ctx, cx - Math.ceil(r / 2), cy - Math.ceil(r / 2), 1, 1, shade(color, 0.45));
}

function leaf(ctx: Ctx, x: number, y: number, dir: -1 | 1, color: string) {
  rect(ctx, x, y, 1, 1, color);
  rect(ctx, x + dir, y - 1, 1, 1, color);
  rect(ctx, x + dir * 2, y - 1, 1, 1, shade(color, 0.2));
  rect(ctx, x + dir, y, 1, 1, shade(color, -0.2));
}

// ---------------------------------------------------------------- terrain

function soil(ctx: Ctx, wet: boolean) {
  const base = wet ? '#5b3a1e' : '#8d5b30';
  const furrow = wet ? '#3f2711' : '#6b4220';
  const hi = wet ? '#6f4a28' : '#a8723f';
  rect(ctx, 0, 0, 16, 16, base);
  for (let y = 1; y < 16; y += 4) {
    rect(ctx, 1, y, 14, 1, furrow);
    rect(ctx, 1, y + 1, 14, 1, hi);
  }
  rect(ctx, 0, 0, 16, 1, shade(base, -0.25));
  rect(ctx, 0, 15, 16, 1, shade(base, -0.25));
  rect(ctx, 0, 0, 1, 16, shade(base, -0.25));
  rect(ctx, 15, 0, 1, 16, shade(base, -0.25));
  if (wet) for (const [x, y] of [[4, 7], [11, 3], [9, 12]]) rect(ctx, x, y, 1, 1, '#7aa7c7');
}

// ---------------------------------------------------------------- crops

function seedsInSoil(ctx: Ctx) {
  for (const [x, y] of [[4, 6], [8, 9], [11, 5], [6, 11], [10, 12]]) {
    rect(ctx, x, y, 1, 1, '#2d1b0c');
    rect(ctx, x, y - 1, 1, 1, '#d9c38a');
  }
}

function sprout(ctx: Ctx, h: number, leafColor: string) {
  const x = 8, base = 13;
  rect(ctx, x, base - h, 1, h, shade(leafColor, -0.2));
  for (let i = 2; i < h; i += 2) leaf(ctx, x + (i % 4 === 0 ? 1 : -1), base - i, i % 4 === 0 ? 1 : -1, leafColor);
  leaf(ctx, x + 1, base - h + 1, 1, leafColor);
  leaf(ctx, x - 1, base - h + 1, -1, leafColor);
}

function matureCrop(ctx: Ctx, c: CropDef) {
  const L = c.leaf, F = c.fruit;
  switch (c.kind) {
    case 'root':
      blob(ctx, 8, 11, 3, F);
      for (const dx of [-2, 0, 2]) rect(ctx, 8 + dx, 4, 1, 4, L);
      leaf(ctx, 6, 5, -1, L);
      leaf(ctx, 10, 5, 1, L);
      rect(ctx, 7, 3, 3, 1, shade(L, 0.25));
      break;
    case 'bush':
      blob(ctx, 8, 9, 5, L);
      blob(ctx, 5, 7, 2, F);
      blob(ctx, 10, 6, 2, F);
      blob(ctx, 9, 11, 2, F);
      break;
    case 'stalk':
      rect(ctx, 7, 1, 2, 14, shade(L, -0.15));
      leaf(ctx, 6, 9, -1, L);
      leaf(ctx, 9, 6, 1, L);
      leaf(ctx, 6, 4, -1, L);
      rect(ctx, 9, 8, 3, 5, F);
      rect(ctx, 9, 8, 1, 5, shade(F, -0.3));
      rect(ctx, 4, 5, 3, 4, F);
      break;
    case 'leafy':
      blob(ctx, 8, 9, 5, L);
      blob(ctx, 8, 9, 3, F);
      break;
    case 'flower':
      rect(ctx, 8, 6, 1, 8, shade(L, -0.1));
      leaf(ctx, 7, 11, -1, L);
      leaf(ctx, 9, 9, 1, L);
      for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]])
        rect(ctx, 8 + dx, 4 + dy, 1, 1, F);
      rect(ctx, 8, 4, 1, 1, '#ffeb3b');
      break;
    case 'fruit':
      blob(ctx, 8, 10, 4, F);
      for (let y = 7; y < 14; y += 2) for (let x = 6; x < 11; x += 2) rect(ctx, x, y, 1, 1, shade(F, -0.35));
      for (const dx of [-2, -1, 0, 1, 2]) rect(ctx, 8 + dx, 2 + Math.abs(dx), 1, 4 - Math.abs(dx), L);
      break;
  }
}

/** frame for growth `stage` (0 = seeds, stages.length = mature) */
function cropStage(ctx: Ctx, c: CropDef, stage: number) {
  const n = c.stages.length;
  if (stage === 0) return seedsInSoil(ctx);
  if (stage >= n) return matureCrop(ctx, c);
  const tall = c.kind === 'stalk' ? 12 : c.kind === 'bush' || c.kind === 'leafy' || c.kind === 'fruit' ? 9 : 7;
  const h = Math.max(2, Math.round((stage / n) * tall));
  if ((c.kind === 'bush' || c.kind === 'leafy') && stage === n - 1) {
    blob(ctx, 8, 9, c.kind === 'bush' ? 5 : 4, c.leaf);
    return;
  }
  sprout(ctx, h, c.leaf);
}

function withered(ctx: Ctx) {
  const c = '#8a7a55';
  rect(ctx, 8, 7, 1, 7, shade(c, -0.2));
  leaf(ctx, 7, 9, -1, c);
  leaf(ctx, 9, 11, 1, c);
  rect(ctx, 9, 6, 2, 1, c);
  rect(ctx, 11, 7, 1, 1, c);
}

// ---------------------------------------------------------------- icons

const WOOD = '#8d5a2b', METAL = '#b9c3cc', METAL_D = '#6f7b86';

function iconTool(ctx: Ctx, id: string) {
  const handle = (x0: number, y0: number, len: number) => {
    for (let i = 0; i < len; i++) {
      rect(ctx, x0 + i, y0 - i, 1, 1, WOOD);
      rect(ctx, x0 + i + 1, y0 - i, 1, 1, shade(WOOD, -0.3));
    }
  };
  switch (id) {
    case 'hoe':
      handle(3, 13, 9);
      rect(ctx, 10, 2, 4, 2, METAL);
      rect(ctx, 12, 4, 2, 3, METAL_D);
      break;
    case 'can':
      rect(ctx, 3, 6, 8, 7, '#4f86b8');
      rect(ctx, 3, 6, 8, 1, '#7fb0dd');
      rect(ctx, 3, 12, 8, 1, '#2f5d88');
      rect(ctx, 11, 7, 2, 1, '#4f86b8');
      rect(ctx, 13, 6, 1, 1, '#4f86b8');
      rect(ctx, 14, 5, 1, 2, '#7fb0dd');
      rect(ctx, 5, 3, 4, 1, '#2f5d88');
      rect(ctx, 4, 4, 1, 2, '#2f5d88');
      rect(ctx, 9, 4, 1, 2, '#2f5d88');
      break;
    case 'sickle':
      handle(3, 13, 5);
      for (const [x, y] of [[7, 8], [8, 7], [9, 5], [10, 4], [11, 3], [12, 3], [13, 4], [13, 5], [12, 6]])
        rect(ctx, x, y, 1, 1, METAL);
      rect(ctx, 9, 6, 1, 1, METAL_D);
      break;
    case 'axe':
      handle(3, 13, 9);
      rect(ctx, 9, 2, 3, 5, METAL);
      rect(ctx, 12, 1, 2, 7, METAL_D);
      break;
    case 'hammer':
      handle(3, 13, 8);
      rect(ctx, 8, 2, 7, 4, METAL_D);
      rect(ctx, 8, 2, 7, 1, METAL);
      break;
    case 'milker':
      rect(ctx, 5, 4, 6, 9, '#e8e8e8');
      rect(ctx, 5, 4, 6, 1, '#ffffff');
      rect(ctx, 6, 13, 4, 1, METAL_D);
      rect(ctx, 7, 2, 2, 2, METAL_D);
      break;
  }
}

function iconSeeds(ctx: Ctx, c: CropDef) {
  const bag = '#d8c08a';
  rect(ctx, 4, 4, 8, 10, bag);
  rect(ctx, 5, 3, 6, 1, shade(bag, -0.2));
  rect(ctx, 6, 2, 4, 1, shade(bag, -0.35));
  rect(ctx, 4, 13, 8, 1, shade(bag, -0.35));
  rect(ctx, 4, 4, 1, 10, shade(bag, -0.2));
  blob(ctx, 8, 9, 2, c.fruit);
  rect(ctx, 8, 6, 1, 1, c.leaf);
}

function iconProduce(ctx: Ctx, c: CropDef) {
  const F = c.fruit, L = c.leaf;
  switch (c.kind) {
    case 'root':
      blob(ctx, 8, 10, 4, F);
      for (const dx of [-1, 0, 1]) rect(ctx, 8 + dx, 2, 1, 4, L);
      leaf(ctx, 7, 4, -1, L);
      leaf(ctx, 9, 4, 1, L);
      break;
    case 'bush':
      blob(ctx, 8, 9, 5, F);
      rect(ctx, 7, 3, 3, 1, L);
      rect(ctx, 8, 2, 1, 2, shade(L, -0.2));
      break;
    case 'stalk':
      rect(ctx, 6, 3, 5, 11, F);
      for (let y = 4; y < 13; y += 2) rect(ctx, 7, y, 3, 1, shade(F, -0.2));
      rect(ctx, 4, 6, 2, 8, L);
      rect(ctx, 11, 6, 2, 8, L);
      break;
    case 'leafy':
      blob(ctx, 8, 9, 5, L);
      blob(ctx, 8, 9, 3, F);
      break;
    case 'flower':
      rect(ctx, 8, 7, 1, 8, shade(L, -0.1));
      leaf(ctx, 7, 12, -1, L);
      blob(ctx, 8, 6, 3, F, true);
      rect(ctx, 8, 6, 1, 1, '#ffeb3b');
      break;
    case 'fruit':
      blob(ctx, 8, 10, 4, F);
      for (let y = 8; y < 14; y += 2) for (let x = 6; x < 11; x += 2) rect(ctx, x, y, 1, 1, shade(F, -0.35));
      for (const dx of [-2, -1, 0, 1, 2]) rect(ctx, 8 + dx, 2 + Math.abs(dx), 1, 4 - Math.abs(dx), L);
      break;
  }
}

function iconMisc(ctx: Ctx, id: string) {
  switch (id) {
    case 'egg':
      blob(ctx, 8, 9, 4, '#f6efe0');
      break;
    case 'milk':
      rect(ctx, 5, 5, 6, 9, '#f5f5f5');
      rect(ctx, 6, 3, 4, 2, '#4f86b8');
      rect(ctx, 5, 8, 6, 3, '#4f86b8');
      rect(ctx, 5, 13, 6, 1, '#bdbdbd');
      break;
    case 'feed':
    case 'fodder': {
      const c = id === 'feed' ? '#e0b84f' : '#9ccc65';
      rect(ctx, 4, 5, 8, 9, '#c8a06a');
      rect(ctx, 4, 4, 8, 2, c);
      for (const [x, y] of [[5, 3], [8, 2], [10, 3]]) rect(ctx, x, y, 1, 2, c);
      break;
    }
    case 'bread':
      blob(ctx, 8, 9, 5, '#d39b52');
      for (const x of [5, 8, 11]) rect(ctx, x, 7, 1, 3, '#f0c27b');
      break;
  }
}

// ---------------------------------------------------------------- props

function shippingBin(ctx: Ctx) {
  rect(ctx, 1, 4, 14, 11, '#9a6332');
  for (let y = 6; y < 15; y += 3) rect(ctx, 1, y, 14, 1, '#7a4b22');
  rect(ctx, 0, 2, 16, 3, '#b5773f');
  rect(ctx, 0, 2, 16, 1, '#d39b5a');
  rect(ctx, 1, 15, 14, 1, '#5a3818');
  rect(ctx, 6, 8, 4, 3, '#e6c86e');
}

function mailbox(ctx: Ctx, flag: boolean) {
  rect(ctx, 7, 8, 2, 8, '#6d4c2e');
  rect(ctx, 3, 3, 10, 6, '#c0392b');
  rect(ctx, 3, 3, 10, 1, '#e57368');
  rect(ctx, 3, 8, 10, 1, '#8e2a20');
  rect(ctx, 4, 5, 6, 2, '#5c1a13');
  if (flag) {
    rect(ctx, 13, 1, 1, 6, '#d0d0d0');
    rect(ctx, 14, 1, 2, 2, '#f1c40f');
  }
}

function tv(ctx: Ctx) {
  rect(ctx, 2, 3, 12, 9, '#3b3b44');
  rect(ctx, 3, 4, 10, 7, '#5fa8d3');
  rect(ctx, 4, 5, 4, 2, '#a9d8f0');
  rect(ctx, 2, 12, 12, 2, '#6d4c2e');
  rect(ctx, 3, 14, 1, 2, '#4a321d');
  rect(ctx, 12, 14, 1, 2, '#4a321d');
  rect(ctx, 6, 1, 1, 2, '#888');
  rect(ctx, 9, 0, 1, 3, '#888');
}

function calendar(ctx: Ctx) {
  rect(ctx, 3, 3, 10, 11, '#fdf8ea');
  rect(ctx, 3, 3, 10, 3, '#c0392b');
  rect(ctx, 7, 1, 2, 3, '#555');
  for (let y = 7; y < 13; y += 2) for (let x = 4; x < 12; x += 2) rect(ctx, x, y, 1, 1, '#8a7a66');
  rect(ctx, 8, 9, 1, 1, '#c0392b');
}

function shadow(ctx: Ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 3; x < 13; x++) ctx.fillRect(x, x < 5 || x > 10 ? 14 : 13, 1, x < 5 || x > 10 ? 1 : 3);
}

// ---------------------------------------------------------------- sheet assembly

export interface GenSheet {
  width: number;
  height: number;
  frames: GenFrame[];
  draw(ctx: Ctx): void;
}

export function cropFrame(id: string, stage: number) {
  return `crop_${id}_${stage}`;
}

export function buildGenSheet(): GenSheet {
  const jobs: [string, (ctx: Ctx) => void][] = [
    ['soil_dry', (c) => soil(c, false)],
    ['soil_wet', (c) => soil(c, true)],
    ['crop_withered', withered],
    ['bin', shippingBin],
    ['mailbox', (c) => mailbox(c, false)],
    ['mailbox_flag', (c) => mailbox(c, true)],
    ['shadow', shadow],
    ['tv', tv],
    ['calendar', calendar],
  ];
  for (const c of Object.values(CROPS))
    for (let s = 0; s <= c.stages.length; s++) jobs.push([cropFrame(c.id, s), (ctx) => cropStage(ctx, c, s)]);
  for (const item of Object.values(ITEMS)) {
    const crop = item.cropId ? CROPS[item.cropId] : undefined;
    jobs.push([item.icon, (ctx) => {
      if (item.kind === 'tool') iconTool(ctx, item.id);
      else if (item.kind === 'seed' && crop) iconSeeds(ctx, crop);
      else if (item.kind === 'produce' && crop) iconProduce(ctx, crop);
      else iconMisc(ctx, item.id);
    }]);
  }
  const rows = Math.ceil(jobs.length / COLS);
  const frames = jobs.map(([name], i) => ({ name, x: (i % COLS) * GEN_TILE, y: Math.floor(i / COLS) * GEN_TILE }));
  return {
    width: COLS * GEN_TILE,
    height: rows * GEN_TILE,
    frames,
    draw(ctx) {
      jobs.forEach(([, fn], i) => {
        ctx.save();
        ctx.translate(frames[i].x, frames[i].y);
        ctx.beginPath();
        ctx.rect(0, 0, GEN_TILE, GEN_TILE);
        ctx.clip();
        fn(ctx);
        ctx.restore();
      });
    },
  };
}

/** a data URL of one icon, for the Vue UI (cached) */
const iconCache = new Map<string, string>();
let sheetCanvas: HTMLCanvasElement | null = null;
let sheetFrames: Map<string, GenFrame> | null = null;

export function iconUrl(frame: string, scale = 3): string {
  const key = `${frame}@${scale}`;
  const hit = iconCache.get(key);
  if (hit) return hit;
  if (!sheetCanvas) {
    const sheet = buildGenSheet();
    sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = sheet.width;
    sheetCanvas.height = sheet.height;
    sheet.draw(sheetCanvas.getContext('2d')!);
    sheetFrames = new Map(sheet.frames.map((f) => [f.name, f]));
  }
  const f = sheetFrames!.get(frame);
  if (!f) return '';
  const c = document.createElement('canvas');
  c.width = c.height = GEN_TILE * scale;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheetCanvas, f.x, f.y, GEN_TILE, GEN_TILE, 0, 0, GEN_TILE * scale, GEN_TILE * scale);
  const url = c.toDataURL();
  iconCache.set(key, url);
  return url;
}
