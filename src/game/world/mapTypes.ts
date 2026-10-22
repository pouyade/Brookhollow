// Pure map data model. Maps are built in code by MapBuilder (see maps/*.ts) and
// consumed by both the simulation (tillable / water queries) and the renderer.

export type MapId = 'farm' | 'house' | 'town' | 'store';

export type InteractKind = 'bin' | 'bed' | 'tv' | 'mailbox' | 'shop' | 'sign' | 'calendar';

export interface Interactable {
  x: number;
  y: number;
  kind: InteractKind;
  /** shop id, sign text, ... */
  data?: string;
}

export interface Warp {
  x: number;
  y: number;
  to: MapId;
  tx: number;
  ty: number;
  facing: Facing;
  /** shop id whose opening hours gate this door */
  shop?: string;
}

export type Facing = 'up' | 'down' | 'left' | 'right';

export const EMPTY = -1;

export interface MapData {
  id: MapId;
  name: string;
  w: number;
  h: number;
  indoor: boolean;
  /** sheet frame per tile; always set */
  ground: number[];
  /** decorations/objects under the player, EMPTY if none */
  deco: number[];
  /** a second decoration layer, e.g. a door on top of a wall */
  deco2: number[];
  /** drawn above the player (tree tops, roofs) */
  overhead: number[];
  solid: Uint8Array;
  water: Uint8Array;
  tillable: Uint8Array;
  warps: Warp[];
  interactables: Interactable[];
  /** default arrival point */
  spawn: { x: number; y: number };
}

export function idx(m: { w: number }, x: number, y: number): number {
  return y * m.w + x;
}

export function inBounds(m: { w: number; h: number }, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < m.w && y < m.h;
}
