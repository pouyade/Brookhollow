import { T } from '../rendering/kenney';
import { EMPTY, idx, inBounds } from './mapTypes';
import type { Facing, InteractKind, MapData, MapId, Warp } from './mapTypes';

type Layer = 'deco' | 'deco2' | 'overhead';

/** Small helper for authoring maps in code instead of giant ASCII grids. */
export class MapBuilder {
  readonly m: MapData;

  constructor(id: MapId, name: string, w: number, h: number, ground: number, indoor = false) {
    const n = w * h;
    this.m = {
      id, name, w, h, indoor,
      ground: new Array(n).fill(ground),
      deco: new Array(n).fill(EMPTY),
      deco2: new Array(n).fill(EMPTY),
      overhead: new Array(n).fill(EMPTY),
      solid: new Uint8Array(n),
      water: new Uint8Array(n),
      tillable: new Uint8Array(n),
      warps: [],
      interactables: [],
      spawn: { x: Math.floor(w / 2), y: Math.floor(h / 2) },
    };
  }

  private ok(x: number, y: number) {
    return inBounds(this.m, x, y);
  }

  ground(x: number, y: number, frame: number) {
    if (this.ok(x, y)) this.m.ground[idx(this.m, x, y)] = frame;
    return this;
  }

  fill(x: number, y: number, w: number, h: number, frame: number | ((x: number, y: number) => number)) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.ground(i, j, typeof frame === 'number' ? frame : frame(i, j));
    return this;
  }

  put(x: number, y: number, frame: number, solid = true, layer: Layer = 'deco') {
    if (!this.ok(x, y)) return this;
    const k = idx(this.m, x, y);
    this.m[layer][k] = frame;
    if (solid) this.m.solid[k] = 1;
    return this;
  }

  solid(x: number, y: number, w = 1, h = 1, value = 1) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (this.ok(i, j)) this.m.solid[idx(this.m, i, j)] = value;
    return this;
  }

  clear(x: number, y: number) {
    if (!this.ok(x, y)) return this;
    const k = idx(this.m, x, y);
    this.m.deco[k] = EMPTY;
    this.m.deco2[k] = EMPTY;
    this.m.overhead[k] = EMPTY;
    this.m.solid[k] = 0;
    return this;
  }

  /** two-tile tree: top overhead (walk-behind), trunk solid */
  tallTree(x: number, y: number, top: number, trunk: number) {
    this.put(x, y, trunk, true);
    this.put(x, y - 1, top, false, 'overhead');
    return this;
  }

  pond(x: number, y: number, w: number, h: number) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const cx = i === 0 ? 0 : i === w - 1 ? 2 : 1;
        const cy = j === 0 ? 0 : j === h - 1 ? 2 : 1;
        const k = idx(this.m, x + i, y + j);
        this.m.ground[k] = T.pondTL + cx + cy * 57;
        this.m.solid[k] = 1;
        this.m.water[k] = 1;
      }
    return this;
  }

  fenceRow(x: number, y: number, w: number, gaps: number[] = []) {
    for (let i = x; i < x + w; i++) {
      if (gaps.includes(i)) continue;
      const f = i === x || gaps.includes(i - 1) ? T.fenceL : i === x + w - 1 || gaps.includes(i + 1) ? T.fenceR : T.fenceH;
      this.put(i, y, f);
    }
    return this;
  }

  fenceCol(x: number, y: number, h: number, gaps: number[] = []) {
    for (let j = y; j < y + h; j++) if (!gaps.includes(j)) this.put(x, j, T.fencePost);
    return this;
  }

  tillable(x: number, y: number, w: number, h: number) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) if (this.ok(i, j)) this.m.tillable[idx(this.m, i, j)] = 1;
    return this;
  }

  /** A solid building: `w` wide, 3 roof rows + 2 wall rows. Returns the (walkable) door tile. */
  building(x: number, y: number, w: number, style: 'wood' | 'stone', doorDx: number, windows: number[] = []) {
    const roof = style === 'wood'
      ? [[T.roofBrownL, T.roofBrownM, T.roofBrownR], [T.roofBrownML, T.roofBrownMM, T.roofBrownMR], [T.roofBrownBL, T.roofBrownBM, T.roofBrownBR]]
      : [[T.roofGrayL, T.roofGrayM, T.roofGrayR], [T.roofGrayML, T.roofGrayMM, T.roofGrayMR], [T.roofGrayBL, T.roofGrayBM, T.roofGrayBR]];
    const wall = style === 'wood' ? [T.wallWoodL, T.wallWood, T.wallWoodR] : [T.wallStoneL, T.wallStone, T.wallStoneR];
    const pick = (row: number[], i: number) => (i === 0 ? row[0] : i === w - 1 ? row[2] : row[1]);
    for (let i = 0; i < w; i++) {
      for (let r = 0; r < 3; r++) this.put(x + i, y + r, pick(roof[r], i));
      this.put(x + i, y + 3, pick(wall, i));
      this.put(x + i, y + 4, pick(wall, i));
    }
    for (const wx of windows) this.put(x + wx, y + 3, style === 'wood' ? T.windowWood : T.windowStone, true, 'deco2');
    const door = { x: x + doorDx, y: y + 4 };
    this.put(door.x, door.y, style === 'wood' ? T.doorWood : T.doorShop, false, 'deco2');
    this.m.solid[idx(this.m, door.x, door.y)] = 0;
    return door;
  }

  warp(x: number, y: number, to: MapId, tx: number, ty: number, facing: Facing, shop?: string) {
    const w: Warp = { x, y, to, tx, ty, facing };
    if (shop) w.shop = shop;
    this.m.warps.push(w);
    return this;
  }

  interact(x: number, y: number, kind: InteractKind, data?: string) {
    this.m.interactables.push({ x, y, kind, data });
    return this;
  }

  spawn(x: number, y: number) {
    this.m.spawn = { x, y };
    return this;
  }

  isFree(x: number, y: number) {
    if (!this.ok(x, y)) return false;
    const k = idx(this.m, x, y);
    return !this.m.solid[k] && this.m.deco[k] === EMPTY;
  }
}

/** deterministic tiny hash for decorative variation (not gameplay RNG) */
export function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
