import type { Facing } from '../world/mapTypes';
import type { ToolId } from './state';

export interface ToolDef {
  id: ToolId;
  /** stamina spent per use (once per swing, not per tile) */
  stamina: number;
  /** ms the swing animation locks the player */
  swingMs: number;
}

export const TOOLS: Record<ToolId, ToolDef> = {
  hoe: { id: 'hoe', stamina: 2, swingMs: 260 },
  can: { id: 'can', stamina: 1, swingMs: 220 },
  sickle: { id: 'sickle', stamina: 1, swingMs: 180 },
  axe: { id: 'axe', stamina: 3, swingMs: 320 },
  hammer: { id: 'hammer', stamina: 3, swingMs: 320 },
};

export const STAMINA_COST_SEEDS = 1;

export function isToolId(id: string): id is ToolId {
  return id in TOOLS;
}

const DIRS: Record<Facing, [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

export function facingVec(f: Facing): [number, number] {
  return DIRS[f];
}

/**
 * Tiles affected by a hoe/can swing at `tier`, starting at the target tile and extending
 * away from the player: 1 tile, 3 in a line, 2x3, 3x3.
 */
export function toolArea(tier: number, tx: number, ty: number, facing: Facing): [number, number][] {
  const [dx, dy] = DIRS[facing];
  const [px, py] = [-dy, dx]; // perpendicular
  const length = [1, 3, 3, 3][tier] ?? 1;
  const widths = [[0], [0], [0, 1], [-1, 0, 1]][tier] ?? [0];
  const out: [number, number][] = [];
  for (let l = 0; l < length; l++)
    for (const w of widths) out.push([tx + dx * l + px * w, ty + dy * l + py * w]);
  return out;
}

/** 3x3 patch centred on the target tile, used by seed bags */
export function seedArea(tx: number, ty: number): [number, number][] {
  const out: [number, number][] = [];
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) out.push([tx + i, ty + j]);
  return out;
}
